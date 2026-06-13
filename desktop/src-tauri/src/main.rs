mod auth;
mod first_run;
mod model;
mod module_registry;
mod supervisor;
mod workflows;

use auth::{AccessState, AuthActionResult};
use first_run::{FirstRunActionResult, FirstRunState, SavedCityProfile, SavedFirstAdmin};
use model::{ModelActionResult, ModelState};
use module_registry::{ModuleProfileSummary, ModuleSelectionState, ModuleSummary};
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
struct AppState {
    product_name: &'static str,
    status_label: &'static str,
    local_only: bool,
    navigation: Vec<NavigationItem>,
    modules: Vec<ModuleSummary>,
    module_profiles: Vec<ModuleProfileSummary>,
    module_selection: ModuleSelectionState,
    installer_steps: Vec<&'static str>,
    first_run: FirstRunState,
    city_profile: Option<SavedCityProfile>,
    users: Vec<SavedFirstAdmin>,
    access: AccessState,
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
    let _registry_source = MODULES_JSON;
    module_registry::module_summaries()
}

fn access_is_local_admin(access: &AccessState) -> bool {
    access.signed_in && access.role.as_deref() == Some("local-admin")
}

fn public_model_state(mut model: ModelState) -> ModelState {
    model.artifact.local_path =
        "Sign in as local administrator to view the model file path.".to_string();
    model
}

fn public_runtime_health(mut health: Vec<RuntimeHealthItem>) -> Vec<RuntimeHealthItem> {
    for item in &mut health {
        item.admin_detail.clear();
    }
    health
}

fn first_run_lifecycle_action_requires_admin(action: &str) -> bool {
    matches!(action, "repair" | "backup" | "uninstall")
}

#[tauri::command]
fn get_app_state() -> Result<AppState, String> {
    let access = auth::access_state()?;
    let admin_signed_in = access_is_local_admin(&access);
    let city_work = if admin_signed_in {
        workflows::city_work_state()?
    } else {
        workflows::public_city_work_state()?
    };
    let users = if admin_signed_in {
        first_run::saved_users()?
    } else {
        Vec::new()
    };
    let model = if admin_signed_in {
        model::model_state()?
    } else {
        public_model_state(model::model_state()?)
    };
    let health = if admin_signed_in {
        supervisor::runtime_health()?
    } else {
        public_runtime_health(supervisor::runtime_health()?)
    };
    Ok(AppState {
        product_name: "CivicSuite",
        status_label: "Windows Local 1.0 desktop",
        local_only: true,
        navigation: navigation(),
        modules: module_summaries()?,
        module_profiles: module_registry::module_profiles()?,
        module_selection: module_registry::module_selection_state()?,
        installer_steps: installer_steps(),
        first_run: first_run::first_run_state(&[])?,
        city_profile: first_run::saved_city_profile()?,
        users,
        access,
        model,
        health,
        city_work,
    })
}

#[tauri::command]
fn get_model_state() -> Result<ModelState, String> {
    let access = auth::access_state()?;
    let model = model::model_state()?;
    if access_is_local_admin(&access) {
        Ok(model)
    } else {
        Ok(public_model_state(model))
    }
}

#[tauri::command]
fn model_action(action: String) -> Result<ModelActionResult, String> {
    let access = auth::access_state()?;
    if access.configured && !access_is_local_admin(&access) {
        return Err(
            "Sign in as the local administrator before changing local model setup.".to_string(),
        );
    }
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
    let access = auth::access_state()?;
    if access.configured
        && !access_is_local_admin(&access)
        && first_run_lifecycle_action_requires_admin(&action)
    {
        return Err(
            "Sign in as the local administrator before running repair, backup, or uninstall."
                .to_string(),
        );
    }
    first_run::first_run_action(&action, step_id.as_deref(), payload.as_ref())
}

#[tauri::command]
fn auth_action(action: String, payload: Option<Value>) -> Result<AuthActionResult, String> {
    auth::auth_action(&action, payload.as_ref())
}

#[tauri::command]
fn supervisor_action(
    action: String,
    service_id: Option<String>,
) -> Result<SupervisorActionResult, String> {
    if action != "health" {
        auth::require_admin_session()?;
    }
    supervisor::supervisor_action(&action, service_id.as_deref())
}

#[tauri::command]
fn get_city_work_state() -> Result<CityWorkState, String> {
    let access = auth::access_state()?;
    if access_is_local_admin(&access) {
        workflows::city_work_state()
    } else {
        workflows::public_city_work_state()
    }
}

#[tauri::command]
fn city_work_action(
    action: String,
    payload: Option<Value>,
) -> Result<CityWorkActionResult, String> {
    let mut payload = payload;
    let access = auth::access_state()?;
    let admin_signed_in = access_is_local_admin(&access);
    let public_action = workflows::city_work_action_allows_public(&action);
    if !admin_signed_in {
        if !access.configured {
            return Err(
                "Finish first-run setup before public city workflows are available.".to_string(),
            );
        }
        if !public_action {
            auth::require_admin_session()?;
        }
        if action == "answer-code-question" {
            let mut public_payload = payload.unwrap_or_else(|| serde_json::json!({}));
            let Some(fields) = public_payload.as_object_mut() else {
                return Err("Public code questions must use a JSON object payload.".to_string());
            };
            fields.insert("publicOnly".to_string(), Value::Bool(true));
            payload = Some(public_payload);
        }
    }
    let mut result = workflows::city_work_action(&action, payload.as_ref())?;
    if !admin_signed_in && public_action {
        result.state = workflows::city_work_public_projection(&result.state);
    }
    Ok(result)
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
            auth_action,
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

    fn create_first_admin() {
        let admin_payload = serde_json::json!({
            "adminName": "Alex Clerk",
            "adminEmail": "alex@example.gov",
            "adminPasscode": "correct horse battery staple"
        });
        first_run::first_run_action("create-admin", Some("first-admin"), Some(&admin_payload))
            .expect("admin saved");
    }

    fn sign_in_as_first_admin() {
        let sign_in_payload = serde_json::json!({
            "email": "alex@example.gov",
            "passcode": "correct horse battery staple"
        });
        auth::auth_action("sign-in", Some(&sign_in_payload)).expect("admin signed in");
    }

    #[test]
    fn city_core_modules_are_reported_installed() {
        module_registry::validate_default_registry().expect("module registry contract validates");
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
    fn model_state_hides_local_path_without_admin_session() {
        with_clean_first_run_state(|_| {
            create_first_admin();

            let public_model = get_model_state().expect("model state");
            assert_eq!(
                public_model.artifact.local_path,
                "Sign in as local administrator to view the model file path."
            );

            sign_in_as_first_admin();
            let staff_model = get_model_state().expect("staff model state");
            assert!(staff_model
                .artifact
                .local_path
                .contains("gemma-4-12b-it-qat-q4_0.gguf"));
        });
    }

    #[test]
    fn model_actions_require_admin_after_first_admin_exists() {
        with_clean_first_run_state(|_| {
            create_first_admin();

            let signed_out_result = model_action("open-model-folder".to_string());

            assert!(signed_out_result.is_err());
            assert!(signed_out_result
                .err()
                .expect("model action auth error")
                .contains("Sign in as the local administrator"));

            sign_in_as_first_admin();
            let signed_in_result =
                model_action("open-model-folder".to_string()).expect("model action allowed");
            assert!(signed_in_result.accepted);
        });
    }

    #[test]
    fn first_run_lifecycle_actions_require_admin_after_first_admin_exists() {
        with_clean_first_run_state(|_| {
            create_first_admin();

            let signed_out_result = first_run_action("backup".to_string(), None, None);

            assert!(signed_out_result.is_err());
            assert!(signed_out_result
                .err()
                .expect("first-run lifecycle auth error")
                .contains("Sign in as the local administrator"));

            sign_in_as_first_admin();
            let signed_in_result =
                first_run_action("backup".to_string(), None, None).expect("backup allowed");
            assert!(signed_in_result.accepted);
            assert_eq!(signed_in_result.action, "backup");
        });
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
    fn app_state_reports_saved_city_profile_and_first_admin() {
        with_clean_first_run_state(|_| {
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
            first_run::first_run_action("create-admin", Some("first-admin"), Some(&admin_payload))
                .expect("admin saved");
            sign_in_as_first_admin();

            let state = get_app_state().expect("app state");

            let profile = state.city_profile.expect("city profile");
            assert_eq!(profile.city_name, "Brookfield");
            assert_eq!(profile.records_contact, "records@example.gov");
            assert_eq!(state.users.len(), 1);
            assert_eq!(state.users[0].email, "alex@example.gov");
            assert_eq!(state.users[0].role, "local-admin");
        });
    }

    #[test]
    fn app_state_reports_module_selection_profile() {
        with_clean_first_run_state(|_| {
            module_registry::persist_profile_selection("city-core")
                .expect("module selection persists");
            let state = get_app_state().expect("app state");
            assert_eq!(state.module_selection.profile_id, "city-core");
            assert_eq!(state.module_selection.installed_module_ids.len(), 4);
            assert!(state
                .module_profiles
                .iter()
                .any(|profile| profile.id == "city-core" && profile.selected));
            assert!(state
                .modules
                .iter()
                .filter(|module| module.installed)
                .all(|module| !module.proof_required.is_empty()));
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

    #[test]
    fn unauthenticated_city_work_state_is_public_projection() {
        with_clean_first_run_state(|_| {
            create_first_admin();

            let meeting_payload = serde_json::json!({
                "title": "Budget Work Session",
                "meetingDate": "2026-07-02",
                "summary": "Review draft budget priorities.",
                "agendaTitle": "Budget priorities"
            });
            let meeting_result =
                workflows::city_work_action("create-meeting", Some(&meeting_payload))
                    .expect("meeting created");
            let meeting_id = meeting_result.state.meetings[0].id.clone();
            let minutes_payload = serde_json::json!({
                "meetingId": meeting_id,
                "minutes": "Private draft minutes with staff notes."
            });
            workflows::city_work_action("record-minutes", Some(&minutes_payload))
                .expect("minutes saved");
            let selected_meeting = serde_json::json!({ "meetingId": meeting_id });
            workflows::city_work_action("post-notice", Some(&selected_meeting))
                .expect("notice ready");
            let public_comment = serde_json::json!({
                "meetingId": meeting_id,
                "commenterName": "Riley Resident",
                "commenterContact": "riley@example.org",
                "commentMode": "written",
                "commentTopic": "Budget",
                "commentBody": "Please protect park funding."
            });
            workflows::city_work_action("submit-public-comment", Some(&public_comment))
                .expect("public comment saved");

            let records_payload = serde_json::json!({
                "requester": "Internal requester",
                "summary": "Private staff records request",
                "deadline": "2026-07-15"
            });
            workflows::city_work_action("create-records-request", Some(&records_payload))
                .expect("records request saved");
            let code_payload = serde_json::json!({
                "title": "Draft Noise Ordinance",
                "citation": "Draft 8.12",
                "body": "Private draft ordinance text."
            });
            workflows::city_work_action("import-code-source", Some(&code_payload))
                .expect("code source saved");
            let private_packet_meeting = serde_json::json!({
                "title": "Unposted Packet Draft",
                "meetingDate": "2026-07-09",
                "summary": "Packet export before public notice.",
                "agendaTitle": "Private packet"
            });
            let private_packet_result =
                workflows::city_work_action("create-meeting", Some(&private_packet_meeting))
                    .expect("private packet meeting created");
            let private_packet_id = private_packet_result.state.meetings[0].id.clone();
            let private_packet_minutes = serde_json::json!({
                "meetingId": private_packet_id,
                "minutes": "Packet-only private minutes."
            });
            workflows::city_work_action("record-minutes", Some(&private_packet_minutes))
                .expect("private packet minutes saved");
            let private_packet_selection = serde_json::json!({ "meetingId": private_packet_id });
            workflows::city_work_action("export-meeting-packet", Some(&private_packet_selection))
                .expect("private packet exported");

            let public_state = get_city_work_state().expect("public city work state");

            assert_eq!(public_state.meetings.len(), 1);
            assert_eq!(public_state.meetings[0].title, "Budget Work Session");
            assert_eq!(public_state.meetings[0].minutes, "");
            assert!(public_state.meetings[0].public_comments.is_empty());
            assert!(public_state.records_requests.is_empty());
            assert!(public_state.code_sources.is_empty());
            assert!(public_state.code_handoffs.is_empty());
            assert!(public_state.audit_entries.is_empty());
            let public_app_state = get_app_state().expect("public app state");
            assert!(public_app_state.users.is_empty());
            assert_eq!(
                public_app_state.model.artifact.local_path,
                "Sign in as local administrator to view the model file path."
            );
            assert!(public_app_state
                .health
                .iter()
                .all(|item| item.admin_detail.is_empty()));

            sign_in_as_first_admin();
            let staff_state = get_city_work_state().expect("staff city work state");

            assert_eq!(
                staff_state
                    .meetings
                    .iter()
                    .find(|meeting| meeting.title == "Budget Work Session")
                    .expect("budget meeting visible")
                    .minutes,
                "Private draft minutes with staff notes."
            );
            assert_eq!(
                staff_state
                    .meetings
                    .iter()
                    .find(|meeting| meeting.title == "Budget Work Session")
                    .expect("budget meeting visible")
                    .public_comments
                    .len(),
                1
            );
            assert!(staff_state
                .meetings
                .iter()
                .any(|meeting| meeting.title == "Unposted Packet Draft"));
            assert_eq!(staff_state.records_requests.len(), 1);
            assert_eq!(staff_state.code_sources.len(), 1);
            assert!(!staff_state.audit_entries.is_empty());
        });
    }

    #[test]
    fn public_city_work_actions_require_first_run_owner() {
        with_clean_first_run_state(|_| {
            let public_payload = serde_json::json!({
                "requester": "Riley Resident",
                "requesterContact": "riley@example.org",
                "summary": "Please provide the current council packet."
            });
            let result = city_work_action(
                "submit-public-records-request".to_string(),
                Some(public_payload),
            );

            assert!(result.is_err());
            assert!(result
                .err()
                .expect("setup error")
                .contains("Finish first-run setup"));
        });
    }

    #[test]
    fn public_city_work_actions_do_not_require_admin_session() {
        with_clean_first_run_state(|_| {
            create_first_admin();

            let public_payload = serde_json::json!({
                "requester": "Riley Resident",
                "requesterContact": "riley@example.org",
                "summary": "Please provide the current council packet."
            });
            let public_result = city_work_action(
                "submit-public-records-request".to_string(),
                Some(public_payload),
            )
            .expect("public request can be submitted without admin session");

            assert!(public_result.accepted);
            assert!(public_result.message.contains("Public records request"));
            assert!(public_result.state.records_requests.is_empty());

            let staff_payload = serde_json::json!({
                "requester": "Staff-only",
                "summary": "Internal request",
                "deadline": "2026-07-01"
            });
            let staff_result =
                city_work_action("create-records-request".to_string(), Some(staff_payload));

            assert!(staff_result.is_err());
            assert!(staff_result
                .err()
                .expect("staff error")
                .contains("Sign in as the local administrator"));
        });
    }
}
