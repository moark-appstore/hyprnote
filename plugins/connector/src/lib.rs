mod commands;
mod error;
mod ext;
mod store;
mod types;

pub use error::*;
pub use ext::*;
pub use store::*;
pub use types::*;

const PLUGIN_NAME: &str = "connector";

fn make_specta_builder<R: tauri::Runtime>() -> tauri_specta::Builder<R> {
    tauri_specta::Builder::<R>::new()
        .plugin_name(PLUGIN_NAME)
        .commands(tauri_specta::collect_commands![
            commands::list_custom_llm_models::<tauri::Wry>,
            commands::get_custom_llm_model::<tauri::Wry>,
            commands::set_custom_llm_model::<tauri::Wry>,
            commands::get_custom_llm_enabled::<tauri::Wry>,
            commands::set_custom_llm_enabled::<tauri::Wry>,
            commands::get_custom_llm_connection::<tauri::Wry>,
            commands::set_custom_llm_connection::<tauri::Wry>,
            commands::get_local_llm_connection::<tauri::Wry>,
            commands::get_llm_connection::<tauri::Wry>,
            commands::get_stt_connection::<tauri::Wry>,
            commands::get_free_trial_days_remaining::<tauri::Wry>,
        ])
        .error_handling(tauri_specta::ErrorHandlingMode::Throw)
}

pub fn init<R: tauri::Runtime>() -> tauri::plugin::TauriPlugin<R> {
    let specta_builder = make_specta_builder();

    tauri::plugin::Builder::new(PLUGIN_NAME)
        .invoke_handler(specta_builder.invoke_handler())
        .build()
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn export_types() {
        make_specta_builder::<tauri::Wry>()
            .export(
                specta_typescript::Typescript::default()
                    .header("// @ts-nocheck\n\n")
                    .formatter(specta_typescript::formatter::prettier)
                    .bigint(specta_typescript::BigIntExportBehavior::Number),
                "./js/bindings.gen.ts",
            )
            .unwrap()
    }

    fn create_app<R: tauri::Runtime>(builder: tauri::Builder<R>) -> tauri::App<R> {
        builder
            .plugin(init())
            .build(tauri::test::mock_context(tauri::test::noop_assets()))
            .unwrap()
    }

    #[test]
    fn test_connector() {
        let _app = create_app(tauri::test::mock_builder());
    }
}
