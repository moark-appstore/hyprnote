const COMMANDS: &[&str] = &[
    "send_verification_code",
    "verify_code",
    "get_user_info",
    "ensure_free_trial_started",
];

fn main() {
    tauri_plugin::Builder::new(COMMANDS).build();
}
