use crate::ext::GiteeAiPluginExt;
use crate::types::{GiteeAiAppInfo, GiteeAiPayDetail, GiteeAiPayResult, GiteeAiUser};
use tauri::Runtime;

#[tauri::command]
#[specta::specta]
pub async fn send_verification_code<R: Runtime>(
    app: tauri::AppHandle<R>,
    email: String,
) -> Result<(), String> {
    app.send_verification_code(email)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
#[specta::specta]
pub async fn verify_code<R: Runtime>(
    app: tauri::AppHandle<R>,
    email: String,
    code: String,
) -> Result<String, String> {
    app.verify_code(email, code)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
#[specta::specta]
pub async fn get_user_info<R: Runtime>(app: tauri::AppHandle<R>) -> Result<GiteeAiUser, String> {
    app.get_user_info().await.map_err(|e| e.to_string())
}

#[tauri::command]
#[specta::specta]
pub async fn pay<R: Runtime>(
    app: tauri::AppHandle<R>,
    plan_ident: String,
    quantity: u32,
    pay_type: String,
) -> Result<GiteeAiPayDetail, String> {
    app.pay(plan_ident, quantity, pay_type)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
#[specta::specta]
pub async fn get_pay_result<R: Runtime>(
    app: tauri::AppHandle<R>,
    ident: String,
) -> Result<GiteeAiPayResult, String> {
    app.get_pay_result(ident).await.map_err(|e| e.to_string())
}

#[tauri::command]
#[specta::specta]
pub async fn get_app_info<R: Runtime>(app: tauri::AppHandle<R>) -> Result<GiteeAiAppInfo, String> {
    app.get_app_info().await.map_err(|e| e.to_string())
}
