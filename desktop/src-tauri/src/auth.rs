use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::fs;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};

use crate::first_run::{self, SavedFirstAdmin, SavedFirstAdminRecord};

const SESSION_DURATION_SECONDS: u64 = 12 * 60 * 60;

#[derive(Serialize, Clone)]
pub struct AccessState {
    pub configured: bool,
    pub signed_in: bool,
    pub operator_name: Option<String>,
    pub operator_email: Option<String>,
    pub role: Option<String>,
    pub status: &'static str,
    pub next_action: String,
}

#[derive(Serialize)]
pub struct AuthActionResult {
    pub accepted: bool,
    pub action: String,
    pub status: &'static str,
    pub message: String,
    pub next_action: String,
    pub access: AccessState,
}

#[derive(Deserialize, Serialize)]
struct LocalSession {
    email: String,
    display_name: String,
    role: String,
    expires_at_unix_seconds: u64,
    session_hash: String,
}

fn now_unix_seconds() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_secs())
        .unwrap_or(0)
}

fn session_path() -> PathBuf {
    first_run::config_dir().join("local-session.json")
}

fn payload_string(payload: Option<&serde_json::Value>, key: &str) -> Result<String, String> {
    payload
        .and_then(|value| value.get(key))
        .and_then(serde_json::Value::as_str)
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(str::to_string)
        .ok_or_else(|| format!("Missing required access field: {key}"))
}

fn hash_session(record: &SavedFirstAdminRecord, expires_at_unix_seconds: u64) -> String {
    let mut hasher = Sha256::new();
    hasher.update(record.email.to_lowercase().as_bytes());
    hasher.update(b"\n");
    hasher.update(record.role.as_bytes());
    hasher.update(b"\n");
    hasher.update(expires_at_unix_seconds.to_string().as_bytes());
    hasher.update(b"\n");
    hasher.update(record.passcode_hash.as_bytes());
    hasher
        .finalize()
        .iter()
        .map(|byte| format!("{byte:02x}"))
        .collect()
}

fn read_local_session() -> Result<Option<LocalSession>, String> {
    let path = session_path();
    if !path.is_file() {
        return Ok(None);
    }
    let contents = fs::read_to_string(&path)
        .map_err(|error| format!("Could not read local access session: {error}"))?;
    serde_json::from_str(&contents)
        .map(Some)
        .map_err(|error| format!("Could not parse local access session: {error}"))
}

fn write_local_session(session: &LocalSession) -> Result<(), String> {
    let path = session_path();
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .map_err(|error| format!("Could not create {}: {error}", parent.display()))?;
    }
    let contents = serde_json::to_string_pretty(session)
        .map_err(|error| format!("Could not serialize local access session: {error}"))?;
    fs::write(&path, format!("{contents}\n"))
        .map_err(|error| format!("Could not write {}: {error}", path.display()))
}

fn remove_local_session() -> Result<(), String> {
    let path = session_path();
    if path.is_file() {
        fs::remove_file(&path)
            .map_err(|error| format!("Could not remove local access session: {error}"))?;
    }
    Ok(())
}

fn valid_session(record: &SavedFirstAdminRecord) -> Result<Option<LocalSession>, String> {
    let Some(session) = read_local_session()? else {
        return Ok(None);
    };
    if session.expires_at_unix_seconds <= now_unix_seconds() {
        remove_local_session()?;
        return Ok(None);
    }
    if !session.email.eq_ignore_ascii_case(&record.email) || session.role != record.role {
        remove_local_session()?;
        return Ok(None);
    }
    if session.session_hash != hash_session(record, session.expires_at_unix_seconds) {
        remove_local_session()?;
        return Ok(None);
    }
    Ok(Some(session))
}

fn state_from_signed_user(user: &SavedFirstAdmin, status: &'static str) -> AccessState {
    AccessState {
        configured: true,
        signed_in: true,
        operator_name: Some(user.display_name.clone()),
        operator_email: Some(user.email.clone()),
        role: Some(user.role.clone()),
        status,
        next_action: "Continue local city work.".to_string(),
    }
}

pub fn access_state() -> Result<AccessState, String> {
    let Some(record) = first_run::saved_admin_record()? else {
        return Ok(AccessState {
            configured: false,
            signed_in: false,
            operator_name: None,
            operator_email: None,
            role: None,
            status: "Setup needed",
            next_action: "Create the first local administrator.".to_string(),
        });
    };
    if let Some(session) = valid_session(&record)? {
        return Ok(AccessState {
            configured: true,
            signed_in: true,
            operator_name: Some(session.display_name),
            operator_email: Some(session.email),
            role: Some(session.role),
            status: "Signed in",
            next_action: "Continue local city work.".to_string(),
        });
    }
    Ok(AccessState {
        configured: true,
        signed_in: false,
        operator_name: None,
        operator_email: Some(record.email),
        role: Some(record.role),
        status: "Sign in required",
        next_action: "Sign in with the local administrator passcode.".to_string(),
    })
}

pub fn require_admin_session() -> Result<(), String> {
    let access = access_state()?;
    if access.signed_in && access.role.as_deref() == Some("local-admin") {
        return Ok(());
    }
    Err(
        "Sign in as the local administrator before changing CivicSuite data or runtime settings."
            .to_string(),
    )
}

pub fn auth_action(
    action: &str,
    payload: Option<&serde_json::Value>,
) -> Result<AuthActionResult, String> {
    match action {
        "sign-in" => {
            let email = payload_string(payload, "email")?;
            let passcode = payload_string(payload, "passcode")?;
            let user = first_run::verify_admin_passcode(&email, &passcode)?;
            let record = first_run::saved_admin_record()?.ok_or_else(|| {
                "Create the first local administrator before signing in.".to_string()
            })?;
            let expires_at_unix_seconds = now_unix_seconds() + SESSION_DURATION_SECONDS;
            let session = LocalSession {
                email: user.email.clone(),
                display_name: user.display_name.clone(),
                role: user.role.clone(),
                expires_at_unix_seconds,
                session_hash: hash_session(&record, expires_at_unix_seconds),
            };
            write_local_session(&session)?;
            Ok(AuthActionResult {
                accepted: true,
                action: action.to_string(),
                status: "Signed in",
                message: "Local administrator access is active on this Windows profile."
                    .to_string(),
                next_action: "Continue local city work.".to_string(),
                access: state_from_signed_user(&user, "Signed in"),
            })
        }
        "sign-out" => {
            remove_local_session()?;
            Ok(AuthActionResult {
                accepted: true,
                action: action.to_string(),
                status: "Signed out",
                message: "Local administrator access ended for this session.".to_string(),
                next_action: "Sign in before changing CivicSuite data or runtime settings."
                    .to_string(),
                access: access_state()?,
            })
        }
        _ => Err(format!("Unsupported access action: {action}")),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::first_run;
    use std::env;

    fn with_temp_state_dir<T>(test: impl FnOnce(PathBuf) -> T) -> T {
        let _guard = first_run::test_env_lock().lock().expect("test env lock");
        let root = env::temp_dir().join(format!(
            "civicsuite-desktop-auth-test-{}",
            std::process::id()
        ));
        let _ = fs::remove_dir_all(&root);
        env::set_var("CIVICSUITE_DESKTOP_STATE_DIR", &root);
        let result = test(root.clone());
        env::remove_var("CIVICSUITE_DESKTOP_STATE_DIR");
        let _ = fs::remove_dir_all(root);
        result
    }

    fn create_admin() {
        let admin_payload = serde_json::json!({
            "adminName": "Alex Clerk",
            "adminEmail": "alex@example.gov",
            "adminPasscode": "correct horse battery staple"
        });
        first_run::first_run_action("create-admin", Some("first-admin"), Some(&admin_payload))
            .expect("admin saved");
    }

    #[test]
    fn access_state_requires_setup_before_first_admin() {
        with_temp_state_dir(|_| {
            let access = access_state().expect("access state");
            assert!(!access.configured);
            assert!(!access.signed_in);
        });
    }

    #[test]
    fn local_admin_sign_in_creates_required_session() {
        with_temp_state_dir(|root| {
            create_admin();
            let payload = serde_json::json!({
                "email": "alex@example.gov",
                "passcode": "correct horse battery staple"
            });
            let result = auth_action("sign-in", Some(&payload)).expect("sign-in succeeds");
            assert!(result.accepted);
            assert!(root.join("config").join("local-session.json").is_file());
            require_admin_session().expect("session authorizes admin actions");
        });
    }

    #[test]
    fn sign_out_removes_required_session() {
        with_temp_state_dir(|_| {
            create_admin();
            let payload = serde_json::json!({
                "email": "alex@example.gov",
                "passcode": "correct horse battery staple"
            });
            auth_action("sign-in", Some(&payload)).expect("sign-in succeeds");
            auth_action("sign-out", None).expect("sign-out succeeds");
            assert!(require_admin_session().is_err());
        });
    }
}
