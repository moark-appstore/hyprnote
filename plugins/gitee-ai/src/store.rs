use tauri_plugin_store2::ScopedStoreKey;

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum StoreKey {
    GiteeAiUserToken,
}

impl std::fmt::Display for StoreKey {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            StoreKey::GiteeAiUserToken => write!(f, "gitee_ai_user_token"),
        }
    }
}

impl ScopedStoreKey for StoreKey {}

impl StoreKey {
    pub fn scope() -> &'static str {
        "gitee-ai"
    }
}
