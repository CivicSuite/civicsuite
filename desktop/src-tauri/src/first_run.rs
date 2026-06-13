use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use std::env;
use std::path::PathBuf;

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

fn resolve_locations(defaults: &DefaultLocations) -> FirstRunLocations {
    FirstRunLocations {
        install_root: windows_path_from_template(&defaults.install_root),
        data_root: windows_path_from_template(&defaults.data_root),
        backup_root: windows_path_from_template(&defaults.backup_root),
    }
}

pub fn first_run_state(completed_step_ids: &[String]) -> Result<FirstRunState, String> {
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

pub fn first_run_action(
    action: &str,
    step_id: Option<&str>,
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

    Ok(FirstRunActionResult {
        accepted: false,
        action: action.to_string(),
        step_id: step_id.map(str::to_string),
        status: "Blocked",
        message: "The native installer wizard has not been connected to host mutation yet."
            .to_string(),
        next_action: "Use this checklist as setup guidance until the installer executor is wired."
            .to_string(),
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
    fn first_run_action_is_blocked_until_installer_executor_exists() {
        let result = first_run_action("download-model", Some("model"))
            .expect("action response is structured");
        assert!(!result.accepted);
        assert_eq!(result.status, "Blocked");
        assert!(result.message.contains("native installer wizard"));
    }
}
