use tauri::{plugin::Builder, Manager, Runtime};

const PLUGIN_NAME: &str = "gitee-ai";
mod commands;
mod error;
mod ext;
mod types;

pub use error::*;
pub use ext::GiteeAiPluginExt;

fn make_specta_builder<R: tauri::Runtime>() -> tauri_specta::Builder<R> {
    tauri_specta::Builder::<R>::new()
        .plugin_name(PLUGIN_NAME)
        .commands(tauri_specta::collect_commands![
            commands::send_verification_code::<tauri::Wry>,
            commands::verify_code::<tauri::Wry>,
            commands::get_user_info::<tauri::Wry>,
            commands::pay::<tauri::Wry>,
            commands::get_pay_result::<tauri::Wry>,
            commands::get_app_info::<tauri::Wry>,
        ])
        .error_handling(tauri_specta::ErrorHandlingMode::Throw)
}

pub fn init<R: Runtime>() -> tauri::plugin::TauriPlugin<R> {
    let specta_builder = make_specta_builder::<R>();

    Builder::<R>::new(PLUGIN_NAME)
        .invoke_handler(specta_builder.invoke_handler())
        .setup(|app_handle, _api| {
            // 配置已在ext.rs中硬编码，不需要管理状态
            Ok(())
        })
        .build()
}

#[cfg(test)]
mod tests {
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
}
