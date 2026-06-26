use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::fs;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};

use crate::first_run::{self, SavedFirstAdminRecord};

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

#[derive(Serialize, Clone)]
pub struct LocalUserSummary {
    pub display_name: String,
    pub email: String,
    pub role: String,
    pub status: &'static str,
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

#[derive(Deserialize, Serialize, Clone)]
struct StaffUserRecord {
    display_name: String,
    email: String,
    role: String,
    active: bool,
    created_unix_seconds: u64,
    passcode_algorithm: String,
    passcode_salt: String,
    passcode_hash: String,
}

struct VerifiedLocalUser {
    display_name: String,
    email: String,
    role: String,
    passcode_hash: String,
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

fn staff_users_path() -> PathBuf {
    first_run::config_dir().join("staff-users.json")
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

fn payload_optional_string(payload: Option<&serde_json::Value>, key: &str) -> Option<String> {
    payload
        .and_then(|value| value.get(key))
        .and_then(serde_json::Value::as_str)
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(str::to_string)
}

fn normalize_email(email: &str) -> String {
    email.trim().to_lowercase()
}

fn valid_staff_role(role: &str) -> bool {
    matches!(
        role,
        "city-staff" | "clerk" | "records-staff" | "code-staff"
    )
}

fn read_staff_users() -> Result<Vec<StaffUserRecord>, String> {
    let path = staff_users_path();
    if !path.is_file() {
        return Ok(Vec::new());
    }
    let contents = fs::read_to_string(&path)
        .map_err(|error| format!("Could not read local users: {error}"))?;
    serde_json::from_str(&contents).map_err(|error| format!("Could not parse local users: {error}"))
}

fn write_staff_users(users: &[StaffUserRecord]) -> Result<(), String> {
    let path = staff_users_path();
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .map_err(|error| format!("Could not create {}: {error}", parent.display()))?;
    }
    crate::atomic_io::atomic_write_json(&path, &users)
}

fn summary_from_admin(record: SavedFirstAdminRecord) -> LocalUserSummary {
    LocalUserSummary {
        display_name: record.display_name,
        email: record.email,
        role: record.role,
        status: "Active",
    }
}

fn summary_from_staff(record: StaffUserRecord) -> LocalUserSummary {
    LocalUserSummary {
        display_name: record.display_name,
        email: record.email,
        role: record.role,
        status: if record.active { "Active" } else { "Disabled" },
    }
}

pub fn saved_users() -> Result<Vec<LocalUserSummary>, String> {
    let mut users = first_run::saved_admin_record()?
        .into_iter()
        .map(summary_from_admin)
        .collect::<Vec<_>>();
    users.extend(read_staff_users()?.into_iter().map(summary_from_staff));
    Ok(users)
}

fn verified_from_admin(
    record: SavedFirstAdminRecord,
    passcode: &str,
) -> Result<VerifiedLocalUser, String> {
    let user = first_run::verify_admin_passcode(&record.email, passcode)?;
    let refreshed = first_run::saved_admin_record()?
        .ok_or_else(|| "Create the first local administrator before signing in.".to_string())?;
    Ok(VerifiedLocalUser {
        display_name: user.display_name,
        email: user.email,
        role: user.role,
        passcode_hash: refreshed.passcode_hash,
    })
}

fn verified_from_staff(
    record: StaffUserRecord,
    passcode: &str,
) -> Result<VerifiedLocalUser, String> {
    if !record.active {
        return Err("This local staff user is disabled.".to_string());
    }
    if record.passcode_algorithm != "argon2id-v1" {
        return Err("The local staff passcode hash uses an unsupported format.".to_string());
    }
    if !first_run::verify_argon2id_local_passcode(&record.passcode_hash, passcode)? {
        return Err("The local user passcode did not match.".to_string());
    }
    Ok(VerifiedLocalUser {
        display_name: record.display_name,
        email: record.email,
        role: record.role,
        passcode_hash: record.passcode_hash,
    })
}

fn verify_local_user(email: &str, passcode: &str) -> Result<VerifiedLocalUser, String> {
    let normalized = normalize_email(email);
    let Some(admin) = first_run::saved_admin_record()? else {
        return Err("Create the first local administrator before signing in.".to_string());
    };
    if normalize_email(&admin.email) == normalized {
        return verified_from_admin(admin, passcode);
    }
    for record in read_staff_users()? {
        if normalize_email(&record.email) == normalized {
            return verified_from_staff(record, passcode);
        }
    }
    Err("No active local user matched that email.".to_string())
}

fn hash_session(user: &VerifiedLocalUser, expires_at_unix_seconds: u64) -> String {
    let mut hasher = Sha256::new();
    hasher.update(user.email.to_lowercase().as_bytes());
    hasher.update(b"\n");
    hasher.update(user.role.as_bytes());
    hasher.update(b"\n");
    hasher.update(expires_at_unix_seconds.to_string().as_bytes());
    hasher.update(b"\n");
    hasher.update(user.passcode_hash.as_bytes());
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
    crate::atomic_io::atomic_write_json(&path, session)
}

fn remove_local_session() -> Result<(), String> {
    let path = session_path();
    if path.is_file() {
        fs::remove_file(&path)
            .map_err(|error| format!("Could not remove local access session: {error}"))?;
    }
    Ok(())
}

fn session_user_from_record(session: &LocalSession) -> Result<Option<VerifiedLocalUser>, String> {
    let normalized = normalize_email(&session.email);
    if let Some(admin) = first_run::saved_admin_record()? {
        if normalize_email(&admin.email) == normalized {
            return Ok(Some(VerifiedLocalUser {
                display_name: admin.display_name,
                email: admin.email,
                role: admin.role,
                passcode_hash: admin.passcode_hash,
            }));
        }
    }
    for record in read_staff_users()? {
        if normalize_email(&record.email) == normalized {
            if !record.active {
                return Ok(None);
            }
            return Ok(Some(VerifiedLocalUser {
                display_name: record.display_name,
                email: record.email,
                role: record.role,
                passcode_hash: record.passcode_hash,
            }));
        }
    }
    Ok(None)
}

fn valid_session() -> Result<Option<LocalSession>, String> {
    let Some(session) = read_local_session()? else {
        return Ok(None);
    };
    if session.expires_at_unix_seconds <= now_unix_seconds() {
        remove_local_session()?;
        return Ok(None);
    }
    let Some(user) = session_user_from_record(&session)? else {
        remove_local_session()?;
        return Ok(None);
    };
    if session.role != user.role
        || session.session_hash != hash_session(&user, session.expires_at_unix_seconds)
    {
        remove_local_session()?;
        return Ok(None);
    }
    Ok(Some(session))
}

fn state_from_signed_user(user: &VerifiedLocalUser, status: &'static str) -> AccessState {
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
    if let Some(session) = valid_session()? {
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
        next_action: "Sign in with a local user passcode.".to_string(),
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

pub fn require_signed_in_session() -> Result<AccessState, String> {
    let access = access_state()?;
    if access.signed_in {
        return Ok(access);
    }
    Err(
        "Sign in with a local staff or administrator account before changing city work."
            .to_string(),
    )
}

fn role_module_ids(role: &str) -> Option<&'static [&'static str]> {
    match role {
        "local-admin" | "city-staff" => None,
        "clerk" => Some(&["civicclerk", "civicnotice"]),
        "records-staff" => Some(&["civicrecords-ai"]),
        "code-staff" => Some(&["civiccode"]),
        _ => Some(&[]),
    }
}

pub fn role_allows_module(role: &str, module_id: &str) -> bool {
    role_module_ids(role)
        .map(|modules| modules.iter().any(|candidate| candidate == &module_id))
        .unwrap_or(true)
}

pub fn role_allows_modules(role: &str, module_ids: &[&str], allow_any: bool) -> bool {
    if allow_any {
        module_ids
            .iter()
            .any(|module_id| role_allows_module(role, module_id))
    } else {
        module_ids
            .iter()
            .all(|module_id| role_allows_module(role, module_id))
    }
}

fn create_staff_user(payload: Option<&serde_json::Value>) -> Result<String, String> {
    require_admin_session()?;
    let display_name = payload_string(payload, "userName")?;
    let email = payload_string(payload, "userEmail")?;
    let normalized_email = normalize_email(&email);
    let role =
        payload_optional_string(payload, "userRole").unwrap_or_else(|| "city-staff".to_string());
    if !valid_staff_role(&role) {
        return Err("Choose a supported local user role.".to_string());
    }
    let passcode = payload_string(payload, "userPasscode")?;
    if passcode.len() < 10 {
        return Err("Local user passcode must be at least 10 characters.".to_string());
    }
    if first_run::saved_admin_record()?
        .map(|admin| normalize_email(&admin.email) == normalized_email)
        .unwrap_or(false)
    {
        return Err("That email already belongs to the first local administrator.".to_string());
    }
    let mut users = read_staff_users()?;
    if users
        .iter()
        .any(|user| normalize_email(&user.email) == normalized_email)
    {
        return Err("That local user email already exists.".to_string());
    }
    let (passcode_salt, passcode_hash) = first_run::hash_argon2id_local_passcode(&passcode)?;
    users.push(StaffUserRecord {
        display_name: display_name.clone(),
        email: normalized_email,
        role,
        active: true,
        created_unix_seconds: now_unix_seconds(),
        passcode_algorithm: "argon2id-v1".to_string(),
        passcode_salt,
        passcode_hash,
    });
    write_staff_users(&users)?;
    Ok(format!(
        "{display_name} can now sign in on this Windows profile."
    ))
}

fn deactivate_staff_user(payload: Option<&serde_json::Value>) -> Result<String, String> {
    require_admin_session()?;
    let email = payload_string(payload, "userEmail")?;
    let normalized_email = normalize_email(&email);
    if first_run::saved_admin_record()?
        .map(|admin| normalize_email(&admin.email) == normalized_email)
        .unwrap_or(false)
    {
        return Err("The first local administrator cannot be disabled here.".to_string());
    }
    let mut users = read_staff_users()?;
    let Some(user) = users
        .iter_mut()
        .find(|user| normalize_email(&user.email) == normalized_email)
    else {
        return Err("No local staff user matched that email.".to_string());
    };
    user.active = false;
    let display_name = user.display_name.clone();
    write_staff_users(&users)?;
    Ok(format!("{display_name} was disabled for future sign-in."))
}

fn reactivate_staff_user(payload: Option<&serde_json::Value>) -> Result<String, String> {
    require_admin_session()?;
    let email = payload_string(payload, "userEmail")?;
    let normalized_email = normalize_email(&email);
    if first_run::saved_admin_record()?
        .map(|admin| normalize_email(&admin.email) == normalized_email)
        .unwrap_or(false)
    {
        return Err("The first local administrator is already active.".to_string());
    }
    let mut users = read_staff_users()?;
    let Some(user) = users
        .iter_mut()
        .find(|user| normalize_email(&user.email) == normalized_email)
    else {
        return Err("No local staff user matched that email.".to_string());
    };
    user.active = true;
    let display_name = user.display_name.clone();
    write_staff_users(&users)?;
    Ok(format!(
        "{display_name} can sign in again on this Windows profile."
    ))
}

fn reset_staff_passcode(payload: Option<&serde_json::Value>) -> Result<String, String> {
    require_admin_session()?;
    let email = payload_string(payload, "userEmail")?;
    let normalized_email = normalize_email(&email);
    if first_run::saved_admin_record()?
        .map(|admin| normalize_email(&admin.email) == normalized_email)
        .unwrap_or(false)
    {
        return Err("Reset the first local administrator through first-run recovery.".to_string());
    }
    let passcode = payload_string(payload, "userPasscode")?;
    if passcode.len() < 10 {
        return Err("Temporary local passcode must be at least 10 characters.".to_string());
    }
    let mut users = read_staff_users()?;
    let Some(user) = users
        .iter_mut()
        .find(|user| normalize_email(&user.email) == normalized_email)
    else {
        return Err("No local staff user matched that email.".to_string());
    };
    let (passcode_salt, passcode_hash) = first_run::hash_argon2id_local_passcode(&passcode)?;
    user.passcode_algorithm = "argon2id-v1".to_string();
    user.passcode_salt = passcode_salt;
    user.passcode_hash = passcode_hash;
    let display_name = user.display_name.clone();
    write_staff_users(&users)?;
    Ok(format!(
        "{display_name} has a new temporary local passcode."
    ))
}

pub fn auth_action(
    action: &str,
    payload: Option<&serde_json::Value>,
) -> Result<AuthActionResult, String> {
    match action {
        "sign-in" => {
            let email = payload_string(payload, "email")?;
            let passcode = payload_string(payload, "passcode")?;
            let user = verify_local_user(&email, &passcode)?;
            let expires_at_unix_seconds = now_unix_seconds() + SESSION_DURATION_SECONDS;
            let session = LocalSession {
                email: user.email.clone(),
                display_name: user.display_name.clone(),
                role: user.role.clone(),
                expires_at_unix_seconds,
                session_hash: hash_session(&user, expires_at_unix_seconds),
            };
            write_local_session(&session)?;
            Ok(AuthActionResult {
                accepted: true,
                action: action.to_string(),
                status: "Signed in",
                message: "Local access is active on this Windows profile.".to_string(),
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
                message: "Local access ended for this session.".to_string(),
                next_action: "Sign in before changing CivicSuite data or runtime settings."
                    .to_string(),
                access: access_state()?,
            })
        }
        "create-user" => {
            let message = create_staff_user(payload)?;
            Ok(AuthActionResult {
                accepted: true,
                action: action.to_string(),
                status: "User saved",
                message,
                next_action: "The new staff user can sign in with their email and local passcode."
                    .to_string(),
                access: access_state()?,
            })
        }
        "deactivate-user" => {
            let message = deactivate_staff_user(payload)?;
            Ok(AuthActionResult {
                accepted: true,
                action: action.to_string(),
                status: "User disabled",
                message,
                next_action: "Create a replacement user if this staff member still needs access."
                    .to_string(),
                access: access_state()?,
            })
        }
        "reactivate-user" => {
            let message = reactivate_staff_user(payload)?;
            Ok(AuthActionResult {
                accepted: true,
                action: action.to_string(),
                status: "User enabled",
                message,
                next_action: "The staff user can sign in with their current local passcode."
                    .to_string(),
                access: access_state()?,
            })
        }
        "reset-user-passcode" => {
            let message = reset_staff_passcode(payload)?;
            Ok(AuthActionResult {
                accepted: true,
                action: action.to_string(),
                status: "Passcode reset",
                message,
                next_action: "Share the temporary local passcode with the staff user through an approved city channel."
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
        first_run::first_run_action("review", Some("unsigned-beta"), None).expect("notice saved");
        first_run::first_run_action("review", Some("smartscreen"), None)
            .expect("smartscreen saved");
        first_run::first_run_action("choose-location", Some("locations"), None)
            .expect("locations saved");
        let module_payload = serde_json::json!({ "profileId": "city-core" });
        first_run::first_run_action("select-modules", Some("modules"), Some(&module_payload))
            .expect("modules saved");
        let city_payload = serde_json::json!({
            "cityName": "Brookfield",
            "state": "CO",
            "timeZone": "America/Denver",
            "recordsContact": "records@example.gov",
            "clerkContact": "clerk@example.gov"
        });
        first_run::first_run_action(
            "create-city-profile",
            Some("city-profile"),
            Some(&city_payload),
        )
        .expect("city profile saved");
        let admin_payload = serde_json::json!({
            "adminName": "Alex Clerk",
            "adminEmail": "alex@example.gov",
            "adminPasscode": "correct horse battery staple"
        });
        let result =
            first_run::first_run_action("create-admin", Some("first-admin"), Some(&admin_payload))
                .expect("admin saved");
        assert!(result.accepted);
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

    #[test]
    fn local_admin_can_create_staff_user_and_staff_can_sign_in() {
        with_temp_state_dir(|_| {
            create_admin();
            let admin_payload = serde_json::json!({
                "email": "alex@example.gov",
                "passcode": "correct horse battery staple"
            });
            auth_action("sign-in", Some(&admin_payload)).expect("admin sign-in succeeds");

            let user_payload = serde_json::json!({
                "userName": "Riley Records",
                "userEmail": "riley@example.gov",
                "userRole": "records-staff",
                "userPasscode": "records passcode 123"
            });
            let created = auth_action("create-user", Some(&user_payload)).expect("user saved");
            assert!(created.accepted);
            let users = saved_users().expect("users list");
            assert!(users.iter().any(|user| {
                user.email == "riley@example.gov"
                    && user.role == "records-staff"
                    && user.status == "Active"
            }));

            auth_action("sign-out", None).expect("sign out admin");
            let staff_payload = serde_json::json!({
                "email": "riley@example.gov",
                "passcode": "records passcode 123"
            });
            let staff = auth_action("sign-in", Some(&staff_payload)).expect("staff sign-in");
            assert!(staff.accepted);
            assert_eq!(staff.access.role.as_deref(), Some("records-staff"));
            assert!(require_admin_session().is_err());
            assert!(require_signed_in_session().is_ok());
        });
    }

    #[test]
    fn disabled_staff_user_cannot_sign_in_again() {
        with_temp_state_dir(|_| {
            create_admin();
            let admin_payload = serde_json::json!({
                "email": "alex@example.gov",
                "passcode": "correct horse battery staple"
            });
            auth_action("sign-in", Some(&admin_payload)).expect("admin sign-in succeeds");
            let user_payload = serde_json::json!({
                "userName": "Casey Clerk",
                "userEmail": "casey@example.gov",
                "userRole": "clerk",
                "userPasscode": "clerk passcode 123"
            });
            auth_action("create-user", Some(&user_payload)).expect("user saved");
            let disable_payload = serde_json::json!({ "userEmail": "casey@example.gov" });
            auth_action("deactivate-user", Some(&disable_payload)).expect("user disabled");
            auth_action("sign-out", None).expect("sign out admin");

            let staff_payload = serde_json::json!({
                "email": "casey@example.gov",
                "passcode": "clerk passcode 123"
            });
            let error = match auth_action("sign-in", Some(&staff_payload)) {
                Ok(_) => panic!("disabled user cannot sign in"),
                Err(error) => error,
            };
            assert!(error.contains("disabled"));
        });
    }

    #[test]
    fn local_admin_can_reset_and_reactivate_staff_user() {
        with_temp_state_dir(|_| {
            create_admin();
            let admin_payload = serde_json::json!({
                "email": "alex@example.gov",
                "passcode": "correct horse battery staple"
            });
            auth_action("sign-in", Some(&admin_payload)).expect("admin sign-in succeeds");
            let user_payload = serde_json::json!({
                "userName": "Casey Clerk",
                "userEmail": "casey@example.gov",
                "userRole": "clerk",
                "userPasscode": "clerk passcode 123"
            });
            auth_action("create-user", Some(&user_payload)).expect("user saved");
            let disable_payload = serde_json::json!({ "userEmail": "casey@example.gov" });
            auth_action("deactivate-user", Some(&disable_payload)).expect("user disabled");
            let reset_payload = serde_json::json!({
                "userEmail": "casey@example.gov",
                "userPasscode": "new clerk passcode 456"
            });
            auth_action("reset-user-passcode", Some(&reset_payload)).expect("passcode reset");
            auth_action("reactivate-user", Some(&disable_payload)).expect("user reactivated");
            auth_action("sign-out", None).expect("sign out admin");

            let old_staff_payload = serde_json::json!({
                "email": "casey@example.gov",
                "passcode": "clerk passcode 123"
            });
            assert!(auth_action("sign-in", Some(&old_staff_payload)).is_err());
            let new_staff_payload = serde_json::json!({
                "email": "casey@example.gov",
                "passcode": "new clerk passcode 456"
            });
            let staff = auth_action("sign-in", Some(&new_staff_payload)).expect("staff sign-in");
            assert!(staff.accepted);
            assert_eq!(staff.access.role.as_deref(), Some("clerk"));
        });
    }
}
