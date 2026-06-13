use serde::{Deserialize, Serialize};

const RUNTIME_MANIFEST_JSON: &str = include_str!("../../runtime/windows-local-runtime.json");
const REQUIRED_ACTIONS: [&str; 9] = [
    "install",
    "start",
    "stop",
    "health",
    "repair",
    "logs",
    "backup",
    "restore",
    "uninstall",
];

#[derive(Deserialize)]
struct OperatorPath {
    requires_docker: bool,
    requires_wsl: bool,
    requires_terminal: bool,
}

#[derive(Deserialize)]
struct RuntimeManifest {
    schema_version: u16,
    profile: String,
    local_only: bool,
    operator_path: OperatorPath,
    lifecycle_actions: Vec<String>,
    services: Vec<ServiceDefinition>,
}

#[derive(Deserialize)]
struct ServiceDefinition {
    id: String,
    label: String,
    admin_label: String,
    kind: String,
    required: bool,
    binary: String,
    args: Vec<String>,
    health: HealthDefinition,
    log_path: String,
    next_action: String,
}

#[derive(Deserialize)]
#[serde(tag = "kind", rename_all = "kebab-case")]
enum HealthDefinition {
    Tcp { host: String, port: u16 },
    Http { endpoint: String },
    Supervisor { service: String },
    Filesystem { path: String },
}

#[derive(Serialize)]
pub struct RuntimeHealthItem {
    pub id: String,
    pub label: String,
    pub ok: bool,
    pub status: &'static str,
    pub message: String,
    pub next_action: String,
    pub admin_detail: String,
}

#[derive(Serialize)]
pub struct SupervisorActionResult {
    pub accepted: bool,
    pub action: String,
    pub service_id: Option<String>,
    pub status: &'static str,
    pub message: String,
    pub next_action: String,
}

fn parse_manifest() -> Result<RuntimeManifest, String> {
    serde_json::from_str(RUNTIME_MANIFEST_JSON)
        .map_err(|error| format!("Could not parse Windows runtime manifest: {error}"))
}

fn validate_manifest(manifest: &RuntimeManifest) -> Result<(), String> {
    if manifest.schema_version != 1 {
        return Err(format!(
            "Unsupported Windows runtime manifest schema {}",
            manifest.schema_version
        ));
    }
    if manifest.profile != "windows-local-1.0" {
        return Err("Windows runtime manifest profile must be windows-local-1.0".to_string());
    }
    if !manifest.local_only {
        return Err("Windows runtime manifest must be local-only".to_string());
    }
    if manifest.operator_path.requires_docker
        || manifest.operator_path.requires_wsl
        || manifest.operator_path.requires_terminal
    {
        return Err("Windows operator path cannot require developer tooling".to_string());
    }
    for action in REQUIRED_ACTIONS {
        if !manifest
            .lifecycle_actions
            .iter()
            .any(|candidate| candidate == action)
        {
            return Err(format!("Windows runtime manifest is missing {action}"));
        }
    }
    if manifest.services.is_empty() {
        return Err("Windows runtime manifest must define at least one service".to_string());
    }
    Ok(())
}

fn health_detail(health: &HealthDefinition) -> String {
    match health {
        HealthDefinition::Tcp { host, port } => format!("tcp {host}:{port}"),
        HealthDefinition::Http { endpoint } => endpoint.to_owned(),
        HealthDefinition::Supervisor { service } => format!("supervisor service {service}"),
        HealthDefinition::Filesystem { path } => path.to_owned(),
    }
}

fn service_health(service: &ServiceDefinition) -> RuntimeHealthItem {
    let requirement = if service.required {
        "required"
    } else {
        "optional"
    };
    RuntimeHealthItem {
        id: service.id.clone(),
        label: service.label.clone(),
        ok: false,
        status: "Needs setup",
        message: format!(
            "{} is defined for the Windows local runtime but has not been installed yet.",
            service.label
        ),
        next_action: service.next_action.clone(),
        admin_detail: format!(
            "{}; {}; kind {}; binary {}; args {}; health {}; log {}",
            service.admin_label,
            requirement,
            service.kind,
            service.binary,
            service.args.join(" "),
            health_detail(&service.health),
            service.log_path
        ),
    }
}

pub fn runtime_health() -> Result<Vec<RuntimeHealthItem>, String> {
    let manifest = parse_manifest()?;
    validate_manifest(&manifest)?;
    let mut health = vec![RuntimeHealthItem {
        id: "desktop-shell".to_string(),
        label: "Desktop shell".to_string(),
        ok: true,
        status: "OK",
        message: "Tauri/WebView2 shell is running locally.".to_string(),
        next_action: "Continue the Windows local setup.".to_string(),
        admin_detail: "The desktop process is active.".to_string(),
    }];
    health.extend(manifest.services.iter().map(service_health));
    Ok(health)
}

pub fn supervisor_action(
    action: &str,
    service_id: Option<&str>,
) -> Result<SupervisorActionResult, String> {
    let manifest = parse_manifest()?;
    validate_manifest(&manifest)?;
    if !manifest
        .lifecycle_actions
        .iter()
        .any(|candidate| candidate == action)
    {
        return Err(format!("Unsupported supervisor action: {action}"));
    }

    if let Some(id) = service_id {
        if !manifest.services.iter().any(|service| service.id == id) {
            return Err(format!("Unknown supervisor service: {id}"));
        }
    }

    Ok(SupervisorActionResult {
        accepted: false,
        action: action.to_string(),
        service_id: service_id.map(str::to_string),
        status: "Blocked",
        message: "The portable runtime bundle has not been installed yet.".to_string(),
        next_action: "Finish first-run runtime installation, then retry from System Health."
            .to_string(),
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn manifest_declares_no_developer_tooling_on_operator_path() {
        let manifest = parse_manifest().expect("manifest parses");
        validate_manifest(&manifest).expect("manifest validates");
        assert!(!manifest.operator_path.requires_docker);
        assert!(!manifest.operator_path.requires_wsl);
        assert!(!manifest.operator_path.requires_terminal);
    }

    #[test]
    fn manifest_actions_cover_required_lifecycle() {
        let manifest = parse_manifest().expect("manifest parses");
        for action in REQUIRED_ACTIONS {
            assert!(manifest
                .lifecycle_actions
                .iter()
                .any(|candidate| candidate == action));
        }
    }

    #[test]
    fn runtime_health_is_plain_english_and_honest_before_install() {
        let health = runtime_health().expect("health builds from manifest");
        assert!(health
            .iter()
            .any(|item| item.id == "desktop-shell" && item.ok));
        assert!(health
            .iter()
            .any(|item| item.label == "Local data store" && !item.ok));
        assert!(health
            .iter()
            .any(|item| item.label == "Local AI model" && item.status == "Needs setup"));
        assert!(!health.iter().any(|item| item.label.contains("PostgreSQL")));
    }

    #[test]
    fn supervisor_actions_refuse_to_start_until_runtime_is_installed() {
        let result =
            supervisor_action("start", Some("postgres")).expect("action response is structured");
        assert!(!result.accepted);
        assert_eq!(result.status, "Blocked");
        assert!(result
            .next_action
            .contains("first-run runtime installation"));
    }
}
