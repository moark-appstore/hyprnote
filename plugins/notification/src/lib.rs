use std::sync::Mutex;
use tauri::Manager;

mod commands;
mod error;
mod ext;
mod store;
mod worker;

pub use error::*;
pub use ext::*;
pub use store::*;

const PLUGIN_NAME: &str = "notification";

pub type SharedState = Mutex<State>;

#[derive(Default)]
pub struct State {
    worker_handle: Option<tokio::task::JoinHandle<()>>,
    detector: hypr_detect::Detector,
}

fn make_specta_builder<R: tauri::Runtime>() -> tauri_specta::Builder<R> {
    tauri_specta::Builder::<R>::new()
        .plugin_name(PLUGIN_NAME)
        .commands(tauri_specta::collect_commands![
            commands::get_event_notification::<tauri::Wry>,
            commands::set_event_notification::<tauri::Wry>,
            commands::get_detect_notification::<tauri::Wry>,
            commands::set_detect_notification::<tauri::Wry>,
            commands::open_notification_settings::<tauri::Wry>,
            commands::request_notification_permission::<tauri::Wry>,
            commands::check_notification_permission::<tauri::Wry>,
            commands::start_detect_notification::<tauri::Wry>,
            commands::stop_detect_notification::<tauri::Wry>,
            commands::start_event_notification::<tauri::Wry>,
            commands::stop_event_notification::<tauri::Wry>,
        ])
        .error_handling(tauri_specta::ErrorHandlingMode::Throw)
}

pub fn init<R: tauri::Runtime>() -> tauri::plugin::TauriPlugin<R> {
    let specta_builder = make_specta_builder();

    tauri::plugin::Builder::new(PLUGIN_NAME)
        .invoke_handler(specta_builder.invoke_handler())
        .setup(|app, _api| {
            let state = SharedState::default();
            app.manage(state);

            if app.get_detect_notification().unwrap_or(false) {
                if let Err(e) = app.start_detect_notification() {
                    tracing::error!("start_detect_notification_failed: {:?}", e);
                }
            }

            if app.get_event_notification().unwrap_or(false) {
                let app_handle = app.clone();
                tauri::async_runtime::spawn(async move {
                    if let Err(e) = app_handle.start_event_notification().await {
                        tracing::error!("start_event_notification_failed: {:?}", e);
                    }
                });
            }

            Ok(())
        })
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
            .plugin(tauri_plugin_store::Builder::default().build())
            .build(tauri::test::mock_context(tauri::test::noop_assets()))
            .unwrap()
    }

    #[tokio::test]
    async fn test_notification() {
        let _app = create_app(tauri::test::mock_builder());
    }
}
