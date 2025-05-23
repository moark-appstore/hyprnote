use std::sync::{Arc, OnceLock};

use llama_cpp_2::{
    context::params::LlamaContextParams,
    llama_backend::LlamaBackend,
    llama_batch::LlamaBatch,
    model::{params::LlamaModelParams, AddBos, LlamaChatTemplate, LlamaModel, Special},
    sampling::LlamaSampler,
    send_logs_to_tracing, LogOptions,
};
use tokio_stream::wrappers::UnboundedReceiverStream;

use hypr_gguf::GgufExt;

mod error;
mod stream;
mod types;

pub use error::*;
pub use stream::filter_tag;
pub use types::*;

const DEFAULT_MAX_INPUT_TOKENS: u32 = 1024 * 8;
const DEFAULT_MAX_OUTPUT_TOKENS: u32 = 1024;

static LLAMA_BACKEND: OnceLock<Arc<LlamaBackend>> = OnceLock::new();

pub struct Llama {
    task_sender: tokio::sync::mpsc::UnboundedSender<Task>,
}

pub enum Task {
    Generate {
        request: LlamaRequest,
        response_sender: tokio::sync::mpsc::UnboundedSender<String>,
    },
}

impl Llama {
    pub fn new(model_path: impl AsRef<std::path::Path>) -> Result<Self, crate::Error> {
        send_logs_to_tracing(LogOptions::default().with_logs_enabled(false));

        let backend = LLAMA_BACKEND
            .get_or_init(|| {
                let backend = LlamaBackend::init().unwrap();
                Arc::new(backend)
            })
            .clone();

        let fmt = model_path.gguf_chat_format()?.unwrap();
        let tpl = LlamaChatTemplate::new(fmt.as_ref()).unwrap();

        let params = LlamaModelParams::default();
        let model = LlamaModel::load_from_file(&backend, model_path, &params)?;

        let (task_sender, mut task_receiver) = tokio::sync::mpsc::unbounded_channel::<Task>();

        std::thread::spawn({
            move || {
                while let Some(task) = task_receiver.blocking_recv() {
                    match task {
                        Task::Generate {
                            request,
                            response_sender,
                        } => {
                            let prompt = model
                                .apply_chat_template(&tpl, &request.messages, true)
                                .unwrap();

                            let mut ctx = model
                                .new_context(
                                    &backend,
                                    // https://github.com/ggml-org/llama.cpp/blob/492d7f1/src/llama-context.cpp#L2261
                                    LlamaContextParams::default()
                                        .with_n_ctx(std::num::NonZeroU32::new(
                                            DEFAULT_MAX_INPUT_TOKENS + DEFAULT_MAX_OUTPUT_TOKENS,
                                        ))
                                        .with_n_batch(DEFAULT_MAX_INPUT_TOKENS)
                                        .with_n_ubatch(512)
                                        .with_embeddings(false)
                                        .with_flash_attention(true),
                                )
                                .unwrap();

                            let mut tokens_list =
                                model.str_to_token(&prompt, AddBos::Always).unwrap();
                            tokens_list.truncate(DEFAULT_MAX_INPUT_TOKENS as usize);

                            let batch_size = tokens_list.len().max(512);
                            let mut batch = LlamaBatch::new(batch_size, 1);

                            let last_index = (tokens_list.len() - 1) as i32;
                            for (i, token) in (0_i32..).zip(tokens_list.into_iter()) {
                                let is_last = i == last_index;
                                batch.add(token, i, &[0], is_last).unwrap();
                            }

                            ctx.decode(&mut batch).unwrap();

                            let mut n_cur = batch.n_tokens();
                            let mut decoder = encoding_rs::UTF_8.new_decoder();

                            let mut sampler = match request.grammar {
                                Some(grammar) => LlamaSampler::chain_simple([
                                    LlamaSampler::grammar(&model, grammar.as_str(), "root"),
                                    LlamaSampler::temp(0.8),
                                    LlamaSampler::penalties(0, 1.4, 0.1, 0.0),
                                    LlamaSampler::mirostat_v2(1234, 3.0, 0.2),
                                ]),
                                None => LlamaSampler::chain_simple([
                                    LlamaSampler::temp(0.8),
                                    LlamaSampler::penalties(0, 1.4, 0.1, 0.0),
                                    LlamaSampler::mirostat_v2(1234, 3.0, 0.2),
                                ]),
                            };
                            while n_cur <= last_index + DEFAULT_MAX_OUTPUT_TOKENS as i32 {
                                let token = sampler.sample(&ctx, batch.n_tokens() - 1);

                                if model.is_eog_token(token) {
                                    break;
                                }

                                let output_bytes =
                                    model.token_to_bytes(token, Special::Tokenize).unwrap();
                                let mut output_string = String::with_capacity(32);
                                let _decode_result = decoder.decode_to_string(
                                    &output_bytes,
                                    &mut output_string,
                                    false,
                                );

                                if response_sender.send(output_string).is_err() {
                                    break;
                                }

                                batch.clear();
                                batch.add(token, n_cur, &[0], true).unwrap();

                                n_cur += 1;
                                ctx.decode(&mut batch).unwrap();
                            }

                            drop(response_sender);
                        }
                    }
                }
            }
        });

        Ok(Self { task_sender })
    }

    pub fn generate_stream(
        &self,
        request: LlamaRequest,
    ) -> Result<impl futures_util::Stream<Item = String>, crate::Error> {
        let (response_sender, response_receiver) = tokio::sync::mpsc::unbounded_channel::<String>();

        let task = Task::Generate {
            request,
            response_sender,
        };

        self.task_sender.send(task)?;

        let stream = UnboundedReceiverStream::new(response_receiver);

        Ok(stream::filter_tag(Box::pin(stream), "headers"))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use futures_util::StreamExt;

    async fn run(model: &Llama, request: LlamaRequest, print_stream: bool) -> String {
        use futures_util::pin_mut;
        use std::io::{self, Write};

        let stream = model.generate_stream(request).unwrap();
        pin_mut!(stream);

        let mut acc = String::new();

        while let Some(token) = stream.next().await {
            acc += &token;
            if print_stream {
                print!("{}", token);
                io::stdout().flush().unwrap();
            }
        }

        if print_stream {
            println!();
        }

        acc
    }

    fn get_model() -> Llama {
        let model_path = dirs::data_dir()
            .unwrap()
            .join("com.hyprnote.dev")
            .join("llm.gguf");

        Llama::new(model_path).unwrap()
    }

    #[test]
    fn test_tag() {
        assert!(hypr_template::ENHANCE_USER_TPL.contains("<headers>"));
    }

    // cargo test test_english_1 -p llama -- --nocapture --ignored
    #[ignore]
    #[tokio::test]
    async fn test_english_1() {
        let llama = get_model();
        let request = LlamaRequest {
            messages: vec![],
            grammar: Some(hypr_gbnf::GBNF::Enhance(Some(vec!["header".to_string()])).build()),
        };

        run(&llama, request, true).await;
    }
}
