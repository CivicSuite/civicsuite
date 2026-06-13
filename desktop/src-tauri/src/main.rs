mod first_run;
mod model;
mod supervisor;
mod workflows;

use first_run::{FirstRunActionResult, FirstRunState};
use model::{ModelActionResult, ModelState};
use serde::Serialize;
use serde_json::Value;
use supervisor::{RuntimeHealthItem, SupervisorActionResult};
use workflows::{CityWorkActionResult, CityWorkState};

const MODULES_JSON: &str = include_str!("../../../installer/modules.json");

#[derive(Serialize)]
struct NavigationItem {
    id: &'static str,
    label: &'static str,
    description: &'static str,
}

#[derive(Serialize)]
struct ModuleSummary {
    id: String,
    display_name: String,
    role: String,
    version: Option<String>,
    required: bool,
    selectable: bool,
    installed: bool,
}

#[derive(Serialize)]
struct AppState {
    product_name: &'static str,
    status_label: &'static str,
    local_only: bool,
    navigation: Vec<NavigationItem>,
    modules: Vec<ModuleSummary>,
    installer_steps: Vec<&'static str>,
    first_run: FirstRunState,
    model: ModelState,
    health: Vec<RuntimeHealthItem>,
    city_work: CityWorkState,
}

fn navigation() -> Vec<NavigationItem> {
    vec![
        NavigationItem {
            id: "home",
            label: "Home",
            description: "Work that needs attention",
        },
        NavigationItem {
            id: "meetings",
            label: "Meetings & Notices",
            description: "Agendas, notices, minutes, votes",
        },
        NavigationItem {
            id: "records",
            label: "Records Requests",
            description: "Intake, review, response, exports",
        },
        NavigationItem {
            id: "code",
            label: "Code & Ordinances",
            description: "Search, imports, guidance, handoffs",
        },
        NavigationItem {
            id: "search",
            label: "Search City Knowledge",
            description: "Cross-module local search with citations",
        },
        NavigationItem {
            id: "health",
            label: "System Health",
            description: "Local services, model, backup, repair",
        },
        NavigationItem {
            id: "settings",
            label: "Settings",
            description: "City profile, users, modules",
        },
    ]
}

fn installer_steps() -> Vec<&'static str> {
    vec![
        "Explain unsigned beta status and Windows SmartScreen.",
        "Choose install and local data locations.",
        "Install CivicCore and selected city-core modules.",
        "Download and verify Gemma 4 12B quantization-aware weights.",
        "Create city profile and first admin user.",
        "Verify local health, backup, repair, and uninstall entry points.",
    ]
}

fn module_summaries() -> Result<Vec<ModuleSummary>, String> {
    let registry: Value = serde_json::from_str(MODULES_JSON)
        .map_err(|error| format!("Could not parse module registry: {error}"))?;
    let city_core = registry
        .get("profiles")
        .and_then(Value::as_array)
        .and_then(|profiles| {
            profiles
                .iter()
                .find(|profile| profile.get("id").and_then(Value::as_str) == Some("city-core"))
        })
        .and_then(|profile| profile.get("modules"))
        .and_then(Value::as_array)
        .ok_or_else(|| "city-core profile is missing from module registry".to_string())?;
    let installed_ids: Vec<String> = city_core
        .iter()
        .filter_map(Value::as_str)
        .map(str::to_owned)
        .collect();

    let modules = registry
        .get("modules")
        .and_then(Value::as_array)
        .ok_or_else(|| "module registry has no modules list".to_string())?;

    Ok(modules
        .iter()
        .filter_map(|module| {
            let id = module.get("id")?.as_str()?.to_owned();
            Some(ModuleSummary {
                installed: installed_ids.contains(&id),
                id,
                display_name: module.get("display_name")?.as_str()?.to_owned(),
                role: module.get("role")?.as_str()?.to_owned(),
                version: module
                    .get("current_version")
                    .and_then(Value::as_str)
                    .map(str::to_owned),
                required: module
                    .get("required")
                    .and_then(Value::as_bool)
                    .unwrap_or(false),
                selectable: module
                    .get("selectable")
                    .and_then(Value::as_bool)
                    .unwrap_or(false),
            })
        })
        .collect())
}

#[tauri::command]
fn get_app_state() -> Result<AppState, String> {
    Ok(AppState {
        product_name: "CivicSuite",
        status_label: "Windows Local 1.0 desktop",
        local_only: true,
        navigation: navigation(),
        modules: module_summaries()?,
        installer_steps: installer_steps(),
        first_run: first_run::first_run_state(&[])?,
        model: model::model_state()?,
        health: supervisor::runtime_health()?,
        city_work: workflows::city_work_state()?,
    })
}

#[tauri::command]
fn get_model_state() -> Result<ModelState, String> {
    model::model_state()
}

#[tauri::command]
fn model_action(action: String) -> Result<ModelActionResult, String> {
    model::model_action(&action)
}

#[tauri::command]
fn preview_first_run_state(completed_step_ids: Vec<String>) -> Result<FirstRunState, String> {
    first_run::first_run_state(&completed_step_ids)
}

#[tauri::command]
fn first_run_action(
    action: String,
    step_id: Option<String>,
    payload: Option<Value>,
) -> Result<FirstRunActionResult, String> {
    first_run::first_run_action(&action, step_id.as_deref(), payload.as_ref())
}

#[tauri::command]
fn supervisor_action(
    action: String,
    service_id: Option<String>,
) -> Result<SupervisorActionResult, String> {
    supervisor::supervisor_action(&action, service_id.as_deref())
}

#[tauri::command]
fn get_city_work_state() -> Result<CityWorkState, String> {
    workflows::city_work_state()
}

#[tauri::command]
fn city_work_action(
    action: String,
    payload: Option<Value>,
) -> Result<CityWorkActionResult, String> {
    workflows::city_work_action(&action, payload.as_ref())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_app_state,
            get_model_state,
            model_action,
            preview_first_run_state,
            first_run_action,
            supervisor_action,
            get_city_work_state,
            city_work_action
        ])
        .run(tauri::generate_context!())
        .expect("failed to run CivicSuite desktop");
}

fn main() {
    run();
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::env;
    use std::fs;
    use std::path::PathBuf;

    fn with_clean_first_run_state<T>(test: impl FnOnce(PathBuf) -> T) -> T {
        let _guard = first_run::test_env_lock().lock().expect("test env lock");
        let root = env::temp_dir().join(format!(
            "civicsuite-desktop-app-state-test-{}",
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
    fn city_core_modules_are_reported_installed() {
        let modules = module_summaries().expect("module registry parses");
        for module_id in ["civiccore", "civicrecords-ai", "civicclerk", "civiccode"] {
            let module = modules
                .iter()
                .find(|candidate| candidate.id == module_id)
                .expect("city-core module exists");
            assert!(
                module.installed,
                "{module_id} should be installed in city-core"
            );
        }
    }

    #[test]
    fn navigation_is_task_first() {
        let labels: Vec<&str> = navigation().into_iter().map(|item| item.label).collect();
        assert!(labels.contains(&"Meetings & Notices"));
        assert!(labels.contains(&"Records Requests"));
        assert!(labels.contains(&"Code & Ordinances"));
        assert!(!labels.contains(&"Docker"));
        assert!(!labels.contains(&"WSL"));
    }

    #[test]
    fn app_state_reports_runtime_health_from_manifest() {
        let state = get_app_state().expect("app state builds");
        assert!(state.health.iter().any(|item| item.id == "desktop-shell"));
        assert!(state.health.iter().any(|item| item.id == "postgres"));
        assert!(state.health.iter().any(|item| item.id == "model-runtime"));
    }

    #[test]
    fn app_state_reports_model_readiness_contract() {
        let state = get_app_state().expect("app state builds");
        assert_eq!(state.model.display_name, "Gemma 4 12B QAT Q4_0");
        assert_eq!(state.model.status, "Needs download");
        assert!(state.model.artifact.checksum_required);
        assert!(state
            .model
            .checks
            .iter()
            .any(|check| check.id == "checksum" && !check.ok));
    }

    #[test]
    fn app_state_reports_first_run_setup_contract() {
        with_clean_first_run_state(|_| {
            let state = get_app_state().expect("app state builds");
            assert_eq!(state.first_run.status, "Needs setup");
            assert_eq!(
                state.first_run.current_step_id.as_deref(),
                Some("unsigned-beta")
            );
            assert!(state.first_run.local_only);
        });
    }

    #[test]
    fn app_state_reports_local_city_work_state() {
        with_clean_first_run_state(|_| {
            let state = get_app_state().expect("app state builds");
            assert_eq!(state.city_work.meetings.len(), 0);
            assert_eq!(state.city_work.records_requests.len(), 0);
            assert_eq!(state.city_work.code_sources.len(), 0);
        });
    }
}
