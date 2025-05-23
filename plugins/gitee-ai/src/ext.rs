use crate::error::{Error, Result};
use crate::types::{GiteeAiAppInfo, GiteeAiPayDetail, GiteeAiPayResult, GiteeAiUser};
use reqwest::{Client, ClientBuilder, RequestBuilder, Response};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::future::Future;
use std::time::Duration;

/// 生产环境
const ENDPOINT: &str = "https://ai.gitee.com/v1";
const USER_AGENT: &str = "Hyprnote/1.0 (+https://ai.gitee.com/apps/hyprnote)";
pub const APP_ID: &str = "";
pub const DEVELOPER_ACCESS_TOKEN: &str = "";

/// 代理配置，用于设置代理服务器
///
/// # Fields
/// * `enabled` - 是否启用代理
/// * `protocol` - 代理协议(http/https)
/// * `host` - 代理服务器主机地址
/// * `port` - 代理服务器端口
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Proxy {
    pub enabled: bool,
    pub protocol: String,
    pub host: String,
    pub port: u16,
}

impl Proxy {
    pub fn url(&self) -> String {
        format!("{}://{}:{}", self.protocol, self.host, self.port)
    }
}

///
/// # Arguments
/// * `proxy` - 可选的代理服务器配置
///
/// # Returns
/// * `Client` - 配置好的 reqwest 客户端实例
///
/// # Example
/// ```rust
/// let proxy = Some(Proxy {
///     enabled: true,
///     protocol: "http".to_string(),
///     host: "localhost".to_string(),
///     port: 7890,
/// });
/// let client = client(proxy);
/// ```
pub fn client(proxy: Option<Proxy>) -> Client {
    let mut builder = ClientBuilder::new()
        .connect_timeout(Duration::from_secs(5))
        .user_agent(USER_AGENT);

    if let Some(proxy) = proxy.filter(|p| p.enabled) {
        let proxy_settings = reqwest::Proxy::all(proxy.url()).unwrap();
        builder = builder.proxy(proxy_settings);
    }

    builder
        .build()
        .unwrap_or_else(|_| ClientBuilder::new().build().unwrap())
}

pub trait GiteeAiPluginExt<R: tauri::Runtime> {
    fn send_verification_code(&self, email: String) -> impl Future<Output = Result<()>>;
    fn verify_code(&self, email: String, code: String) -> impl Future<Output = Result<String>>;
    fn get_user_info(&self) -> impl Future<Output = Result<GiteeAiUser>>;
    fn pay(
        &self,
        plan_ident: String,
        quantity: u32,
        pay_type: String,
    ) -> impl Future<Output = Result<GiteeAiPayDetail>>;
    fn get_pay_result(&self, ident: String) -> impl Future<Output = Result<GiteeAiPayResult>>;
    fn get_app_info(&self) -> impl Future<Output = Result<GiteeAiAppInfo>>;
}

impl<R: tauri::Runtime, T: tauri::Manager<R>> GiteeAiPluginExt<R> for T {
    #[tracing::instrument(skip_all)]
    async fn send_verification_code(&self, email: String) -> Result<()> {
        send_verification_code_impl(email).await
    }

    #[tracing::instrument(skip_all)]
    async fn verify_code(&self, email: String, code: String) -> Result<String> {
        verify_code_impl(email, code).await
    }

    #[tracing::instrument(skip_all)]
    async fn get_user_info(&self) -> Result<GiteeAiUser> {
        get_user_info_impl().await
    }

    #[tracing::instrument(skip_all)]
    async fn pay(
        &self,
        plan_ident: String,
        quantity: u32,
        pay_type: String,
    ) -> Result<GiteeAiPayDetail> {
        pay_impl(plan_ident, quantity, pay_type).await
    }

    #[tracing::instrument(skip_all)]
    async fn get_pay_result(&self, ident: String) -> Result<GiteeAiPayResult> {
        get_pay_result_impl(ident).await
    }

    #[tracing::instrument(skip_all)]
    async fn get_app_info(&self) -> Result<GiteeAiAppInfo> {
        get_app_info_impl().await
    }
}

async fn get_json(uri: &str, json: Option<&Value>) -> Result<Response> {
    let url = ENDPOINT.to_string() + uri;
    tracing::info!("发送GET请求: {} 参数: {:?}", url, json);

    let mut request = client(None)
        .get(&url)
        .header("Content-Type", "application/json")
        .header(
            "Authorization",
            "Bearer ".to_string() + access_token().as_str(),
        );

    if let Some(json_value) = json {
        request = request.query(json_value);
    }

    let response = request.send().await?;
    tracing::info!("GET请求响应状态: {}", response.status());

    // 直接返回响应对象，不尝试记录响应内容
    // 具体内容会在各个处理函数中记录
    Ok(response)
}

async fn request_json(uri: &str, json: &Value) -> Result<Response> {
    let url = ENDPOINT.to_string() + uri;
    tracing::info!("发送POST请求: {} 数据: {}", url, json);

    let response = client(None)
        .post(&url)
        .header("Content-Type", "application/json")
        .header(
            "Authorization",
            "Bearer ".to_string() + access_token().as_str(),
        )
        .json(&json)
        .send()
        .await?;

    tracing::info!("POST请求响应状态: {}", response.status());

    // 直接返回响应对象，不尝试记录响应内容
    // 具体内容会在各个处理函数中记录
    Ok(response)
}

async fn pay_impl(plan_ident: String, quantity: u32, pay_type: String) -> Result<GiteeAiPayDetail> {
    tracing::info!(
        "调用支付接口: plan_ident={}, quantity={}, pay_type={}",
        plan_ident,
        quantity,
        pay_type
    );

    let response = request_json(
        "/app/pay",
        &json!({
            "plan_ident": plan_ident,
            "quantity": quantity,
            "type": pay_type
        }),
    )
    .await?;

    // 记录响应内容
    let status = response.status();
    let response_text = response.text().await?;
    tracing::info!("支付接口响应内容: {}", response_text);

    if !status.is_success() {
        // 需要将文本解析为错误对象
        let error: crate::types::GiteeAiError = serde_json::from_str(&response_text)?;
        tracing::error!("支付接口调用失败: {:?}", error);
        return Err(error.into());
    }

    // 将文本解析为支付详情对象
    let data: GiteeAiPayDetail = serde_json::from_str(&response_text)?;
    tracing::info!(
        "支付接口调用成功: ident={}, status={}",
        data.ident,
        data.status
    );
    Ok(data)
}

async fn get_pay_result_impl(ident: String) -> Result<GiteeAiPayResult> {
    tracing::info!("查询支付结果: ident={}", ident);

    let response = get_json("/app/pay", Some(&json!({"ident": ident}))).await?;

    // 记录响应内容
    let status = response.status();
    let response_text = response.text().await?;
    tracing::info!("支付结果查询响应内容: {}", response_text);

    if !status.is_success() {
        // 需要将文本解析为错误对象
        let error: crate::types::GiteeAiError = serde_json::from_str(&response_text)?;
        tracing::error!("查询支付结果失败: {:?}", error);
        return Err(error.into());
    }

    // 将文本解析为支付结果对象
    let data: GiteeAiPayResult = serde_json::from_str(&response_text)?;
    tracing::info!(
        "查询支付结果成功: ident={}, status={}, amount={}",
        data.ident,
        data.status,
        data.amount
    );
    Ok(data)
}

async fn send_verification_code_impl(email: String) -> Result<()> {
    tracing::info!("发送验证码: email={}", email);

    let response = request_json(
        "/app/auth/vcode",
        &json!({
            "appid": APP_ID,
            "email": email,
            "channel_type": "email"
        }),
    )
    .await?;

    // 记录响应内容
    let status = response.status();
    let response_text = response.text().await?;
    tracing::info!("发送验证码响应内容: {}", response_text);

    if !status.is_success() {
        // 需要将文本解析为错误对象
        let error: crate::types::GiteeAiError = serde_json::from_str(&response_text)?;
        tracing::error!("发送验证码失败: {:?}", error);
        return Err(error.into());
    }

    tracing::info!("发送验证码成功");
    Ok(())
}

async fn verify_code_impl(email: String, code: String) -> Result<String> {
    tracing::info!("验证码验证: email={}, code={}", email, code);

    let response = request_json(
        "/app/auth/token",
        &json!({
            "appid": APP_ID,
            "channel_type": "email",
            "email": email,
            "code": code
        }),
    )
    .await?;

    // 记录响应内容
    let status = response.status();
    let response_text = response.text().await?;
    tracing::info!("验证码验证响应内容: {}", response_text);

    if !status.is_success() {
        // 需要将文本解析为错误对象
        let error: crate::types::GiteeAiError = serde_json::from_str(&response_text)?;
        tracing::error!("验证码验证失败: {:?}", error);
        return Err(error.into());
    }

    tracing::info!("验证码验证成功，获取到token: {}", response_text);
    Ok(response_text)
}

async fn get_user_info_impl() -> Result<GiteeAiUser> {
    tracing::info!("获取用户信息");

    let response = get_json("/app/user", None).await?;

    // 记录响应内容
    let status = response.status();
    let response_text = response.text().await?;
    tracing::info!("获取用户信息响应内容: {}", response_text);

    if !status.is_success() {
        // 需要将文本解析为错误对象
        let error: crate::types::GiteeAiError = serde_json::from_str(&response_text)?;
        tracing::error!("获取用户信息失败: {:?}", error);
        return Err(error.into());
    }

    // 将文本解析为JSON对象
    let data: serde_json::Value = serde_json::from_str(&response_text)?;
    tracing::info!("获取用户信息成功: {:?}", data);

    // 解析subscriptions数组
    let subscriptions = if let Some(subs_array) = data["subscriptions"].as_array() {
        let mut subscriptions_vec = Vec::new();
        for sub in subs_array {
            // 手动解析每个订阅对象
            if let Some(sub_obj) = sub.as_object() {
                let pay_plan_ident = sub_obj
                    .get("pay_plan_ident")
                    .and_then(|v| v.as_str())
                    .unwrap_or_default()
                    .to_string();
                let expired_at = sub_obj
                    .get("expired_at")
                    .and_then(|v| v.as_i64())
                    .unwrap_or_default();
                let status = sub_obj
                    .get("status")
                    .and_then(|v| v.as_str())
                    .unwrap_or_default()
                    .to_string();

                subscriptions_vec.push(crate::types::GiteeAiSubscription {
                    pay_plan_ident,
                    expired_at,
                    status,
                });
            }
        }
        subscriptions_vec
    } else {
        Vec::new()
    };

    Ok(GiteeAiUser {
        mobile: data["phone"].as_str().unwrap_or_default().to_string(),
        email: data["email"].as_str().unwrap_or_default().to_string(),
        status: data["status"].as_str().unwrap_or_default().to_string(),
        purchase_status: data["purchase_status"]
            .as_str()
            .unwrap_or_default()
            .to_string(),
        pay_plan_ident: data["pay_plan_ident"]
            .as_str()
            .unwrap_or_default()
            .to_string(),
        created_at: chrono::Utc::now().timestamp(),
        usage_expired_at: chrono::Utc::now().timestamp(),
        subscriptions,
    })
}

async fn get_app_info_impl() -> Result<GiteeAiAppInfo> {
    tracing::info!("获取应用信息");

    let response = get_json("/app", Some(&json!({"appid": APP_ID}))).await?;

    // 记录响应内容
    let status = response.status();
    let response_text = response.text().await?;
    tracing::info!("获取应用信息响应内容: {}", response_text);

    if !status.is_success() {
        // 需要将文本解析为错误对象
        let error: crate::types::GiteeAiError = serde_json::from_str(&response_text)?;
        tracing::error!("获取应用信息失败: {:?}", error);
        return Err(error.into());
    }

    // 将文本解析为JSON对象
    let data: serde_json::Value = serde_json::from_str(&response_text)?;
    tracing::info!("获取应用信息成功: {:?}", data);

    // 解析payment_plans数组
    let payment_plans = if let Some(plans_array) = data["payment_plans"].as_array() {
        let mut plans_vec = Vec::new();
        for plan in plans_array {
            // 尝试手动解析每个计划对象
            if let Some(plan_obj) = plan.as_object() {
                let ident = plan_obj
                    .get("ident")
                    .and_then(|v| v.as_str())
                    .unwrap_or_default()
                    .to_string();
                let name = plan_obj
                    .get("name")
                    .and_then(|v| v.as_str())
                    .unwrap_or_default()
                    .to_string();
                let period_str = plan_obj
                    .get("period")
                    .and_then(|v| v.as_str())
                    .unwrap_or_default();
                let period = crate::types::GiteeAiPaymentPeriod::from_str(period_str);
                let period_type = plan_obj
                    .get("period_type")
                    .and_then(|v| v.as_u64())
                    .unwrap_or_default() as u32;
                let period_quantity = plan_obj
                    .get("period_quantity")
                    .and_then(|v| v.as_u64())
                    .unwrap_or_default() as u32;
                let calls_limit = plan_obj
                    .get("calls_limit")
                    .and_then(|v| v.as_u64())
                    .unwrap_or_default() as u32;
                let price = plan_obj
                    .get("price")
                    .and_then(|v| v.as_f64())
                    .unwrap_or_default();
                let description = plan_obj
                    .get("description")
                    .and_then(|v| v.as_str())
                    .unwrap_or_default()
                    .to_string();

                plans_vec.push(crate::types::GiteeAiAppPaymentPlan {
                    ident,
                    name,
                    period,
                    period_type,
                    period_quantity,
                    calls_limit,
                    price,
                    description,
                });
            }
        }
        plans_vec
    } else {
        Vec::new()
    };

    // 解析状态字符串为枚举
    let status_str = data["status"].as_str().unwrap_or_default();
    let status = crate::types::GiteeAiAppStatus::from_str(status_str);

    Ok(GiteeAiAppInfo {
        appid: data["appid"].as_str().unwrap_or_default().to_string(),
        name: data["name"].as_str().unwrap_or_default().to_string(),
        status,
        payment_plans,
    })
}

///
/// Get Access token from database
///
fn access_token() -> String {
    // 简化实现，直接返回开发者访问令牌
    // 实际应用中，应从数据库获取用户的访问令牌
    DEVELOPER_ACCESS_TOKEN.to_string()
}
