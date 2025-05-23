use hypr_listener_interface::{SpeakerIdentity, Word};

fn run(name: &str) {
    let raw_path = format!("src/{}/raw.json", name);
    let raw_content = std::fs::read_to_string(&raw_path).unwrap();

    let raw: serde_json::Value = serde_json::from_str(&raw_content).unwrap();
    let raw_words = raw["results"]["channels"][0]["alternatives"][0]["words"].clone();

    let words: Vec<Word> = raw_words
        .as_array()
        .unwrap()
        .iter()
        .map(|v| Word {
            text: v["word"].as_str().unwrap().trim().to_string(),
            speaker: Some(SpeakerIdentity::Unassigned {
                index: v["speaker"].as_u64().unwrap() as u8,
            }),
            start_ms: Some((v["start"].as_f64().unwrap() * 1000.0) as u64),
            end_ms: Some((v["end"].as_f64().unwrap() * 1000.0) as u64),
            confidence: Some(1.0),
        })
        .collect();

    std::fs::write(
        format!("src/{}/words.json", name),
        serde_json::to_string_pretty(&words).unwrap() + "\n",
    )
    .unwrap();
}

fn main() {
    run("english_3");
    run("english_4");
    run("english_5");
}
