use serde::{Deserialize, Serialize};
use specta::Type;

pub type Result<T> = std::result::Result<T, Error>;

#[derive(Debug, thiserror::Error, Serialize, Deserialize, Type)]
#[serde(tag = "type", content = "data")]
pub enum Error {
    #[error("Request failed: {0}")]
    Request(String),

    #[error("JSON parsing failed: {0}")]
    Json(String),

    #[error("Gitee AI API error: {0}")]
    GiteeAi(#[from] crate::types::GiteeAiError),

    #[error("Store error: {0}")]
    Store(String),

    #[error("{0}")]
    Other(String),
}

impl From<reqwest::Error> for Error {
    fn from(e: reqwest::Error) -> Self {
        Error::Request(e.to_string())
    }
}

impl From<serde_json::Error> for Error {
    fn from(e: serde_json::Error) -> Self {
        Error::Json(e.to_string())
    }
}

impl From<tauri_plugin_store2::Error> for Error {
    fn from(e: tauri_plugin_store2::Error) -> Self {
        Error::Store(e.to_string())
    }
}

impl From<String> for Error {
    fn from(s: String) -> Self {
        Error::Other(s)
    }
}
