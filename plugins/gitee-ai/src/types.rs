use serde::{Deserialize, Serialize};
use specta::Type;

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
pub struct GiteeAiSubscription {
    pub pay_plan_ident: String,
    pub expired_at: i64,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
pub struct GiteeAiUser {
    pub mobile: String,
    pub email: String,
    pub status: GiteeAiUserStatus,
    pub purchase_status: GiteeAiUserPurchaseStatus,
    pub pay_plan_ident: String,
    pub created_at: i64,
    pub usage_expired_at: i64,
    pub subscriptions: Vec<GiteeAiSubscription>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
pub struct GiteeAiError {
    pub code: i32,
    pub message: String,
}

impl std::fmt::Display for GiteeAiError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "Gitee AI API Error {}: {}", self.code, self.message)
    }
}

impl std::error::Error for GiteeAiError {}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
pub struct GiteeAiPayDetail {
    pub ident: String,
    pub status: String,
    pub redirect_type: String,
    pub url: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
pub struct GiteeAiPayResult {
    pub ident: String,
    pub amount: f64,
    pub price: f64,
    #[serde(rename = "type")]
    pub pay_type: String,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
pub enum GiteeAiUserPurchaseStatus {
    #[serde(rename = "ACTIVE")]
    Active,
    #[serde(rename = "EXPIRED")]
    Expired,
    #[serde(rename = "EXHAUSTED")]
    Exhausted,
    #[serde(rename = "NOT_PURCHASED")]
    NotPurchased,
}

impl GiteeAiUserPurchaseStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            GiteeAiUserPurchaseStatus::Active => "ACTIVE",
            GiteeAiUserPurchaseStatus::Expired => "EXPIRED",
            GiteeAiUserPurchaseStatus::Exhausted => "EXHAUSTED",
            GiteeAiUserPurchaseStatus::NotPurchased => "NOT_PURCHASED",
        }
    }

    pub fn from_str(s: &str) -> Self {
        match s {
            "ACTIVE" => GiteeAiUserPurchaseStatus::Active,
            "EXPIRED" => GiteeAiUserPurchaseStatus::Expired,
            "EXHAUSTED" => GiteeAiUserPurchaseStatus::Exhausted,
            "NOT_PURCHASED" => GiteeAiUserPurchaseStatus::NotPurchased,
            _ => GiteeAiUserPurchaseStatus::Exhausted,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
pub enum GiteeAiUserStatus {
    #[serde(rename = "NORMAL")]
    Normal,
    #[serde(rename = "DISABLED")]
    Disabled,
}

impl GiteeAiUserStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            GiteeAiUserStatus::Normal => "NORMAL",
            GiteeAiUserStatus::Disabled => "DISABLED",
        }
    }

    pub fn from_str(s: &str) -> Self {
        match s {
            "NORMAL" => GiteeAiUserStatus::Normal,
            "DISABLED" => GiteeAiUserStatus::Disabled,
            _ => GiteeAiUserStatus::Normal,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
pub enum GiteeAiAppStatus {
    #[serde(rename = "DRAFT")]
    Draft,
    #[serde(rename = "UNDER_REVIEW")]
    UnderReview,
    #[serde(rename = "PENDING_RELEASE")]
    PendingRelease,
    #[serde(rename = "PUBLISHED")]
    Published,
    #[serde(rename = "REMOVED")]
    Removed,
    #[serde(rename = "DELETED")]
    Deleted,
}

impl GiteeAiAppStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            GiteeAiAppStatus::Draft => "DRAFT",
            GiteeAiAppStatus::UnderReview => "UNDER_REVIEW",
            GiteeAiAppStatus::PendingRelease => "PENDING_RELEASE",
            GiteeAiAppStatus::Published => "PUBLISHED",
            GiteeAiAppStatus::Removed => "REMOVED",
            GiteeAiAppStatus::Deleted => "DELETED",
        }
    }

    pub fn from_str(s: &str) -> Self {
        match s {
            "DRAFT" => GiteeAiAppStatus::Draft,
            "UNDER_REVIEW" => GiteeAiAppStatus::UnderReview,
            "PENDING_RELEASE" => GiteeAiAppStatus::PendingRelease,
            "PUBLISHED" => GiteeAiAppStatus::Published,
            "REMOVED" => GiteeAiAppStatus::Removed,
            "DELETED" => GiteeAiAppStatus::Deleted,
            _ => GiteeAiAppStatus::Draft,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
pub enum GiteeAiPaymentPeriod {
    #[serde(rename = "YEAR")]
    Year,
    #[serde(rename = "MONTH")]
    Month,
    #[serde(rename = "DAY")]
    Day,
    #[serde(rename = "NONE")]
    None,
}

impl GiteeAiPaymentPeriod {
    pub fn as_str(&self) -> &'static str {
        match self {
            GiteeAiPaymentPeriod::Year => "YEAR",
            GiteeAiPaymentPeriod::Month => "MONTH",
            GiteeAiPaymentPeriod::Day => "DAY",
            GiteeAiPaymentPeriod::None => "NONE",
        }
    }

    pub fn from_str(s: &str) -> Self {
        match s {
            "YEAR" => GiteeAiPaymentPeriod::Year,
            "MONTH" => GiteeAiPaymentPeriod::Month,
            "DAY" => GiteeAiPaymentPeriod::Day,
            "NONE" => GiteeAiPaymentPeriod::None,
            _ => GiteeAiPaymentPeriod::None,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
pub struct GiteeAiAppPaymentPlan {
    pub ident: String,
    pub name: String,
    pub period: GiteeAiPaymentPeriod,
    pub period_type: u32,
    pub period_quantity: u32,
    pub calls_limit: u32,
    pub price: f64,
    pub description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
pub struct GiteeAiAppInfo {
    pub appid: String,
    pub name: String,
    pub status: GiteeAiAppStatus,
    pub payment_plans: Vec<GiteeAiAppPaymentPlan>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
pub struct GiteeAiTokenInfo {
    pub token: String,
    pub user_email: String,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
pub struct GiteeAiLoginStatus {
    pub is_logged_in: bool,
    pub user_info: Option<GiteeAiUser>,
    pub token_info: Option<GiteeAiTokenInfo>,
}
