mod supervisor;

use serde::Serialize;
use serde_json::Value;
use supervisor::{RuntimeHealthItem, SupervisorActionResult};

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
    health: Vec<RuntimeHealthItem>,
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
        status_label: "Windows Local 1.0 desktop shell scaffold",
        local_only: true,
        navigation: navigation(),
        modules: module_summaries()?,
        installer_steps: installer_steps(),
        health: supervisor::runtime_health()?,
    })
}

#[tauri::command]
fn supervisor_action(
    action: String,
    service_id: Option<String>,
) -> Result<SupervisorActionResult, String> {
    supervisor::supervisor_action(&action, service_id.as_deref())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_app_state, supervisor_action])
        .run(tauri::generate_context!())
        .expect("failed to run CivicSuite desktop");
}

fn main() {
    run();
}

#[cfg(test)]
mod tests {
    use super::*;

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
}
