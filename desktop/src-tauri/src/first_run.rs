use serde::de::DeserializeOwned;
use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use std::env;
use std::fs;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};

use crate::{model, module_registry, supervisor};

const FIRST_RUN_MANIFEST_JSON: &str = include_str!("../../runtime/windows-first-run.json");
const REQUIRED_STEP_IDS: [&str; 10] = [
    "unsigned-beta",
    "smartscreen",
    "locations",
    "modules",
    "model",
    "city-profile",
    "first-admin",
    "backup",
    "health",
    "finish",
];
const REQUIRED_ACTIONS: [&str; 12] = [
    "review",
    "choose-location",
    "select-modules",
    "download-model",
    "create-city-profile",
    "create-admin",
    "choose-backup",
    "verify-health",
    "open-app",
    "repair",
    "backup",
    "uninstall",
];

#[derive(Deserialize)]
struct OperatorPath {
    requires_docker: bool,
    requires_wsl: bool,
    requires_terminal: bool,
}

#[derive(Deserialize)]
struct DefaultLocations {
    install_root: String,
    data_root: String,
    backup_root: String,
}

#[derive(Deserialize)]
struct FirstRunManifest {
    schema_version: u16,
    profile: String,
    profile_label: String,
    local_only: bool,
    operator_path: OperatorPath,
    default_locations: DefaultLocations,
    actions: Vec<String>,
    steps: Vec<FirstRunStepDefinition>,
}

#[derive(Deserialize)]
struct FirstRunStepDefinition {
    id: String,
    label: String,
    surface: String,
    required: bool,
    summary: String,
    detail: String,
    next_action: String,
    action: String,
}

#[derive(Serialize)]
pub struct FirstRunLocations {
    pub install_root: String,
    pub data_root: String,
    pub backup_root: String,
}

#[derive(Serialize)]
pub struct FirstRunStep {
    pub id: String,
    pub label: String,
    pub surface: String,
    pub required: bool,
    pub completed: bool,
    pub current: bool,
    pub status: &'static str,
    pub summary: String,
    pub detail: String,
    pub next_action: String,
    pub action: String,
}

#[derive(Serialize)]
pub struct FirstRunState {
    pub profile: String,
    pub profile_label: String,
    pub local_only: bool,
    pub finished: bool,
    pub status: &'static str,
    pub current_step_id: Option<String>,
    pub locations: FirstRunLocations,
    pub available_actions: Vec<String>,
    pub steps: Vec<FirstRunStep>,
}

#[derive(Serialize)]
pub struct FirstRunActionResult {
    pub accepted: bool,
    pub action: String,
    pub step_id: Option<String>,
    pub status: &'static str,
    pub message: String,
    pub next_action: String,
}

#[derive(Deserialize, Serialize, Default)]
struct FirstRunProgress {
    completed_step_ids: Vec<String>,
    last_action: Option<String>,
    last_updated_unix_seconds: u64,
}

#[derive(Deserialize, Serialize, Clone)]
pub struct SavedCityProfile {
    pub city_name: String,
    pub state: String,
    pub time_zone: String,
    pub records_contact: String,
    pub clerk_contact: String,
}

#[derive(Deserialize, Serialize, Clone)]
pub struct SavedFirstAdmin {
    pub display_name: String,
    pub email: String,
    pub role: String,
}

fn parse_manifest() -> Result<FirstRunManifest, String> {
    serde_json::from_str(FIRST_RUN_MANIFEST_JSON)
        .map_err(|error| format!("Could not parse Windows first-run manifest: {error}"))
}

fn validate_manifest(manifest: &FirstRunManifest) -> Result<(), String> {
    if manifest.schema_version != 1 {
        return Err(format!(
            "Unsupported Windows first-run manifest schema {}",
            manifest.schema_version
        ));
    }
    if manifest.profile != "windows-local-1.0" {
        return Err("Windows first-run manifest profile must be windows-local-1.0".to_string());
    }
    if !manifest.local_only {
        return Err("Windows first-run manifest must be local-only".to_string());
    }
    if manifest.operator_path.requires_docker
        || manifest.operator_path.requires_wsl
        || manifest.operator_path.requires_terminal
    {
        return Err("Windows first-run operator path cannot require developer tooling".to_string());
    }
    for action in REQUIRED_ACTIONS {
        if !manifest.actions.iter().any(|candidate| candidate == action) {
            return Err(format!(
                "Windows first-run manifest is missing action {action}"
            ));
        }
    }
    for step_id in REQUIRED_STEP_IDS {
        if !manifest.steps.iter().any(|step| step.id == step_id) {
            return Err(format!(
                "Windows first-run manifest is missing step {step_id}"
            ));
        }
    }
    for step in &manifest.steps {
        if !manifest
            .actions
            .iter()
            .any(|candidate| candidate == &step.action)
        {
            return Err(format!(
                "Windows first-run step {} references unknown action {}",
                step.id, step.action
            ));
        }
    }
    Ok(())
}

fn windows_path_from_template(template: &str) -> String {
    if let Ok(root) = env::var("CIVICSUITE_DESKTOP_STATE_DIR") {
        return template
            .replace("{local_app_data}/CivicSuite", &root)
            .replace(
                "{documents}/CivicSuite Backups",
                &format!("{root}\\Backups"),
            )
            .replace('/', "\\");
    }
    let local_app_data =
        env::var("LOCALAPPDATA").unwrap_or_else(|_| "{local_app_data}".to_string());
    let documents = env::var("USERPROFILE")
        .map(|profile| PathBuf::from(profile).join("Documents"))
        .map(|path| path.to_string_lossy().to_string())
        .unwrap_or_else(|_| "{documents}".to_string());
    template
        .replace("{local_app_data}", &local_app_data)
        .replace("{documents}", &documents)
        .replace('/', "\\")
}

fn civic_suite_root() -> PathBuf {
    env::var("CIVICSUITE_DESKTOP_STATE_DIR")
        .map(PathBuf::from)
        .unwrap_or_else(|_| {
            env::var("LOCALAPPDATA")
                .map(PathBuf::from)
                .unwrap_or_else(|_| PathBuf::from("{local_app_data}"))
                .join("CivicSuite")
        })
}

fn config_dir() -> PathBuf {
    civic_suite_root().join("config")
}

fn progress_path() -> PathBuf {
    config_dir().join("first-run-progress.json")
}

fn read_progress() -> Result<FirstRunProgress, String> {
    let path = progress_path();
    if !path.is_file() {
        return Ok(FirstRunProgress::default());
    }
    let contents = fs::read_to_string(&path)
        .map_err(|error| format!("Could not read first-run progress: {error}"))?;
    serde_json::from_str(&contents)
        .map_err(|error| format!("Could not parse first-run progress: {error}"))
}

fn write_json_file<T: Serialize>(path: PathBuf, value: &T) -> Result<(), String> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .map_err(|error| format!("Could not create {}: {error}", parent.display()))?;
    }
    let contents = serde_json::to_string_pretty(value)
        .map_err(|error| format!("Could not serialize local setup state: {error}"))?;
    fs::write(&path, format!("{contents}\n"))
        .map_err(|error| format!("Could not write {}: {error}", path.display()))
}

fn read_optional_json_file<T: DeserializeOwned>(path: PathBuf) -> Result<Option<T>, String> {
    if !path.is_file() {
        return Ok(None);
    }
    let contents = fs::read_to_string(&path)
        .map_err(|error| format!("Could not read {}: {error}", path.display()))?;
    serde_json::from_str(&contents)
        .map(Some)
        .map_err(|error| format!("Could not parse {}: {error}", path.display()))
}

fn write_progress(progress: &FirstRunProgress) -> Result<(), String> {
    write_json_file(progress_path(), progress)
}

pub fn saved_city_profile() -> Result<Option<SavedCityProfile>, String> {
    read_optional_json_file(config_dir().join("city-profile.json"))
}

pub fn saved_users() -> Result<Vec<SavedFirstAdmin>, String> {
    Ok(
        read_optional_json_file(config_dir().join("first-admin.json"))?
            .into_iter()
            .collect(),
    )
}

fn now_unix_seconds() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_secs())
        .unwrap_or(0)
}

#[cfg(test)]
pub(crate) fn test_env_lock() -> &'static std::sync::Mutex<()> {
    static LOCK: std::sync::OnceLock<std::sync::Mutex<()>> = std::sync::OnceLock::new();
    LOCK.get_or_init(|| std::sync::Mutex::new(()))
}

fn resolve_locations(defaults: &DefaultLocations) -> FirstRunLocations {
    FirstRunLocations {
        install_root: windows_path_from_template(&defaults.install_root),
        data_root: windows_path_from_template(&defaults.data_root),
        backup_root: windows_path_from_template(&defaults.backup_root),
    }
}

fn first_run_state_from_completed(completed_step_ids: &[String]) -> Result<FirstRunState, String> {
    let manifest = parse_manifest()?;
    validate_manifest(&manifest)?;
    let completed: HashSet<&str> = completed_step_ids.iter().map(String::as_str).collect();
    let current_step_id = manifest
        .steps
        .iter()
        .find(|step| !completed.contains(step.id.as_str()))
        .map(|step| step.id.clone());
    let finished = current_step_id.is_none();

    let steps = manifest
        .steps
        .iter()
        .map(|step| {
            let is_completed = completed.contains(step.id.as_str());
            let current = current_step_id.as_deref() == Some(step.id.as_str());
            FirstRunStep {
                id: step.id.clone(),
                label: step.label.clone(),
                surface: step.surface.clone(),
                required: step.required,
                completed: is_completed,
                current,
                status: if is_completed {
                    "Finished"
                } else if current {
                    "Current"
                } else {
                    "Needs setup"
                },
                summary: step.summary.clone(),
                detail: step.detail.clone(),
                next_action: step.next_action.clone(),
                action: step.action.clone(),
            }
        })
        .collect();

    Ok(FirstRunState {
        profile: manifest.profile,
        profile_label: manifest.profile_label,
        local_only: manifest.local_only,
        finished,
        status: if finished { "Finished" } else { "Needs setup" },
        current_step_id,
        locations: resolve_locations(&manifest.default_locations),
        available_actions: manifest.actions,
        steps,
    })
}

pub fn first_run_state(completed_step_ids: &[String]) -> Result<FirstRunState, String> {
    if completed_step_ids.is_empty() {
        let progress = read_progress()?;
        return first_run_state_from_completed(&progress.completed_step_ids);
    }
    first_run_state_from_completed(completed_step_ids)
}

fn next_step_id(progress: &FirstRunProgress, manifest: &FirstRunManifest) -> Option<String> {
    let completed: HashSet<&str> = progress
        .completed_step_ids
        .iter()
        .map(String::as_str)
        .collect();
    manifest
        .steps
        .iter()
        .find(|step| !completed.contains(step.id.as_str()))
        .map(|step| step.id.clone())
}

fn payload_string(payload: Option<&serde_json::Value>, key: &str) -> Result<String, String> {
    payload
        .and_then(|value| value.get(key))
        .and_then(serde_json::Value::as_str)
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(str::to_string)
        .ok_or_else(|| format!("Missing required setup field: {key}"))
}

fn persist_city_profile(payload: Option<&serde_json::Value>) -> Result<(), String> {
    let profile = SavedCityProfile {
        city_name: payload_string(payload, "cityName")?,
        state: payload_string(payload, "state")?,
        time_zone: payload_string(payload, "timeZone")?,
        records_contact: payload_string(payload, "recordsContact")?,
        clerk_contact: payload_string(payload, "clerkContact")?,
    };
    write_json_file(config_dir().join("city-profile.json"), &profile)
}

fn persist_first_admin(payload: Option<&serde_json::Value>) -> Result<(), String> {
    let admin = SavedFirstAdmin {
        display_name: payload_string(payload, "adminName")?,
        email: payload_string(payload, "adminEmail")?,
        role: "local-admin".to_string(),
    };
    write_json_file(config_dir().join("first-admin.json"), &admin)
}

fn create_local_locations(locations: &FirstRunLocations) -> Result<(), String> {
    for path in [
        &locations.install_root,
        &locations.data_root,
        &locations.backup_root,
    ] {
        fs::create_dir_all(path).map_err(|error| format!("Could not create {path}: {error}"))?;
    }
    for path in [
        PathBuf::from(&locations.data_root).join("files"),
        PathBuf::from(&locations.data_root).join("logs"),
        config_dir(),
    ] {
        fs::create_dir_all(&path)
            .map_err(|error| format!("Could not create {}: {error}", path.display()))?;
    }
    Ok(())
}

fn action_blocks_until_runtime(action: &str) -> Option<(&'static str, &'static str)> {
    match action {
        _ => None,
    }
}

pub fn first_run_action(
    action: &str,
    step_id: Option<&str>,
    payload: Option<&serde_json::Value>,
) -> Result<FirstRunActionResult, String> {
    let manifest = parse_manifest()?;
    validate_manifest(&manifest)?;
    if !manifest.actions.iter().any(|candidate| candidate == action) {
        return Err(format!("Unsupported first-run action: {action}"));
    }
    if let Some(id) = step_id {
        if !manifest.steps.iter().any(|step| step.id == id) {
            return Err(format!("Unknown first-run step: {id}"));
        }
    }

    if let Some((message, next_action)) = action_blocks_until_runtime(action) {
        return Ok(FirstRunActionResult {
            accepted: false,
            action: action.to_string(),
            step_id: step_id.map(str::to_string),
            status: "Blocked",
            message: message.to_string(),
            next_action: next_action.to_string(),
        });
    }

    let mut progress = read_progress()?;
    let target_step_id = step_id
        .map(str::to_string)
        .or_else(|| next_step_id(&progress, &manifest))
        .ok_or_else(|| "First-run setup is already finished.".to_string())?;
    let step = manifest
        .steps
        .iter()
        .find(|candidate| candidate.id == target_step_id)
        .ok_or_else(|| format!("Unknown first-run step: {target_step_id}"))?;
    if step.action != action {
        return Err(format!(
            "Step {} expects action {}, not {action}",
            step.id, step.action
        ));
    }

    if action == "download-model" && !model::local_model_artifact_verified()? {
        return Ok(FirstRunActionResult {
            accepted: false,
            action: action.to_string(),
            step_id: Some(target_step_id),
            status: "Needs attention",
            message: "The pinned Gemma model has not passed local checksum verification yet."
                .to_string(),
            next_action:
                "Use Local AI model setup to download or place the GGUF file, then verify checksum."
                    .to_string(),
        });
    }
    if action == "verify-health" && !supervisor::required_runtime_ready()? {
        return Ok(FirstRunActionResult {
            accepted: false,
            action: action.to_string(),
            step_id: Some(target_step_id),
            status: "Needs attention",
            message: "Required local runtime services are not healthy yet.".to_string(),
            next_action:
                "Open System Health, install or repair the local runtime, then run health again."
                    .to_string(),
        });
    }

    let locations = resolve_locations(&manifest.default_locations);
    match action {
        "choose-location" | "choose-backup" => create_local_locations(&locations)?,
        "select-modules" => {
            module_registry::persist_profile_selection("city-core")?;
        }
        "create-city-profile" => persist_city_profile(payload)?,
        "create-admin" => persist_first_admin(payload)?,
        "review" | "download-model" | "verify-health" | "open-app" | "repair" | "backup"
        | "uninstall" => {}
        _ => {
            return Err(format!(
                "First-run action {action} has no desktop executor yet"
            ))
        }
    }

    if !progress
        .completed_step_ids
        .iter()
        .any(|completed| completed == &target_step_id)
    {
        progress.completed_step_ids.push(target_step_id.clone());
    }
    progress.last_action = Some(action.to_string());
    progress.last_updated_unix_seconds = now_unix_seconds();
    write_progress(&progress)?;

    Ok(FirstRunActionResult {
        accepted: true,
        action: action.to_string(),
        step_id: Some(target_step_id),
        status: "Saved",
        message: "Setup progress was saved locally on this Windows profile.".to_string(),
        next_action: "Continue to the next setup step.".to_string(),
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn manifest_declares_local_only_operator_path() {
        let manifest = parse_manifest().expect("manifest parses");
        validate_manifest(&manifest).expect("manifest validates");
        assert!(manifest.local_only);
        assert!(!manifest.operator_path.requires_docker);
        assert!(!manifest.operator_path.requires_wsl);
        assert!(!manifest.operator_path.requires_terminal);
    }

    #[test]
    fn manifest_includes_required_first_run_steps() {
        let manifest = parse_manifest().expect("manifest parses");
        let step_ids: Vec<&str> = manifest.steps.iter().map(|step| step.id.as_str()).collect();
        assert_eq!(step_ids.first(), Some(&"unsigned-beta"));
        for step_id in REQUIRED_STEP_IDS {
            assert!(step_ids.contains(&step_id), "missing {step_id}");
        }
    }

    #[test]
    fn first_run_state_advances_to_next_unfinished_step() {
        let state = first_run_state(&["unsigned-beta".to_string(), "smartscreen".to_string()])
            .expect("state builds");
        assert_eq!(state.current_step_id.as_deref(), Some("locations"));
        assert!(state
            .steps
            .iter()
            .any(|step| step.id == "smartscreen" && step.completed));
        assert!(state
            .steps
            .iter()
            .any(|step| step.id == "locations" && step.current));
    }

    #[test]
    fn first_run_model_action_waits_for_verified_artifact() {
        with_temp_state_dir(|_| {
            let result = first_run_action("download-model", Some("model"), None)
                .expect("action response is structured");
            assert!(!result.accepted);
            assert_eq!(result.status, "Needs attention");
            assert!(result.message.contains("checksum verification"));
        });
    }

    #[test]
    fn first_run_health_action_waits_for_runtime_health() {
        with_temp_state_dir(|_| {
            let result = first_run_action("verify-health", Some("health"), None)
                .expect("action response is structured");
            assert!(!result.accepted);
            assert_eq!(result.status, "Needs attention");
            assert!(result.message.contains("runtime services"));
        });
    }

    fn with_temp_state_dir<T>(test: impl FnOnce(PathBuf) -> T) -> T {
        let _guard = test_env_lock().lock().expect("test env lock");
        let root = env::temp_dir().join(format!(
            "civicsuite-desktop-first-run-test-{}",
            std::process::id()
        ));
        let _ = fs::remove_dir_all(&root);
        env::set_var("CIVICSUITE_DESKTOP_STATE_DIR", &root);
        let result = test(root.clone());
        env::remove_var("CIVICSUITE_DESKTOP_STATE_DIR");
        let _ = fs::remove_dir_all(root);
        result
    }

    #[test]
    fn first_run_review_action_persists_progress() {
        with_temp_state_dir(|root| {
            let result = first_run_action("review", Some("unsigned-beta"), None)
                .expect("review can be saved");
            assert!(result.accepted);
            let state = first_run_state(&[]).expect("state reads saved progress");
            assert_eq!(state.current_step_id.as_deref(), Some("smartscreen"));
            assert!(root
                .join("config")
                .join("first-run-progress.json")
                .is_file());
        });
    }

    #[test]
    fn first_run_location_action_creates_local_folders() {
        with_temp_state_dir(|root| {
            first_run_action("review", Some("unsigned-beta"), None).expect("review can be saved");
            first_run_action("review", Some("smartscreen"), None)
                .expect("smartscreen review can be saved");
            let result = first_run_action("choose-location", Some("locations"), None)
                .expect("locations can be created");
            assert!(result.accepted);
            assert!(root.join("Data").join("files").is_dir());
            assert!(root.join("Data").join("logs").is_dir());
            assert!(root.join("config").is_dir());
        });
    }

    #[test]
    fn first_run_module_selection_persists_profile_state() {
        with_temp_state_dir(|root| {
            let result = first_run_action("select-modules", Some("modules"), None)
                .expect("module selection can be saved");
            assert!(result.accepted);
            assert!(root.join("config").join("module-selection.json").is_file());
        });
    }

    #[test]
    fn city_profile_requires_payload_before_completion() {
        with_temp_state_dir(|_| {
            let result = first_run_action("create-city-profile", Some("city-profile"), None);
            assert!(result.is_err());
            assert!(result.err().expect("error text").contains("cityName"));
        });
    }
}
