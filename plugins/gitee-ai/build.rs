const COMMANDS: &[&str] = &["send_verification_code", "verify_code", "get_user_info"];

fn main() {
    tauri_plugin::Builder::new(COMMANDS).build();
}
