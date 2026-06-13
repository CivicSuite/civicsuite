use serde::{Deserialize, Serialize};
use std::env;
use std::fs::{self, OpenOptions};
use std::io::{Read, Write};
use std::net::{TcpStream, ToSocketAddrs};
use std::path::PathBuf;
use std::process::{Command, Stdio};
use std::time::{Duration, SystemTime, UNIX_EPOCH};

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

#[derive(Deserialize, Serialize, Default)]
struct RuntimeState {
    services: Vec<ServiceRuntimeState>,
    last_action: Option<String>,
    last_updated_unix_seconds: u64,
}

#[derive(Deserialize, Serialize, Clone)]
struct ServiceRuntimeState {
    id: String,
    installed: bool,
    pid: Option<u32>,
    last_action: Option<String>,
    last_updated_unix_seconds: u64,
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

fn data_root() -> PathBuf {
    civic_suite_root().join("Data")
}

fn config_dir() -> PathBuf {
    civic_suite_root().join("config")
}

fn runtime_root() -> PathBuf {
    env::var("CIVICSUITE_RUNTIME_ROOT")
        .map(PathBuf::from)
        .unwrap_or_else(|_| civic_suite_root())
}

fn state_path() -> PathBuf {
    config_dir().join("runtime-state.json")
}

fn now_unix_seconds() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_secs())
        .unwrap_or(0)
}

fn read_state() -> Result<RuntimeState, String> {
    let path = state_path();
    if !path.is_file() {
        return Ok(RuntimeState::default());
    }
    let contents = fs::read_to_string(&path)
        .map_err(|error| format!("Could not read runtime state: {error}"))?;
    serde_json::from_str(&contents)
        .map_err(|error| format!("Could not parse runtime state: {error}"))
}

fn write_state(state: &RuntimeState) -> Result<(), String> {
    fs::create_dir_all(config_dir())
        .map_err(|error| format!("Could not create runtime config folder: {error}"))?;
    let contents = serde_json::to_string_pretty(state)
        .map_err(|error| format!("Could not serialize runtime state: {error}"))?;
    fs::write(state_path(), format!("{contents}\n"))
        .map_err(|error| format!("Could not write runtime state: {error}"))
}

fn update_service_state(
    state: &mut RuntimeState,
    service_id: &str,
    installed: bool,
    pid: Option<u32>,
    action: &str,
) {
    let now = now_unix_seconds();
    if let Some(service) = state
        .services
        .iter_mut()
        .find(|candidate| candidate.id == service_id)
    {
        service.installed = installed;
        service.pid = pid;
        service.last_action = Some(action.to_string());
        service.last_updated_unix_seconds = now;
    } else {
        state.services.push(ServiceRuntimeState {
            id: service_id.to_string(),
            installed,
            pid,
            last_action: Some(action.to_string()),
            last_updated_unix_seconds: now,
        });
    }
    state.last_action = Some(action.to_string());
    state.last_updated_unix_seconds = now;
}

fn service_state<'a>(
    state: &'a RuntimeState,
    service: &ServiceDefinition,
) -> Option<&'a ServiceRuntimeState> {
    state
        .services
        .iter()
        .find(|candidate| candidate.id == service.id)
}

fn expand_runtime_template(template: &str) -> String {
    template
        .replace("{data_dir}", &data_root().to_string_lossy())
        .replace('/', "\\")
}

fn service_binary_path(service: &ServiceDefinition) -> PathBuf {
    let binary = PathBuf::from(expand_runtime_template(&service.binary));
    if binary.is_absolute() {
        binary
    } else {
        runtime_root().join(binary)
    }
}

fn service_log_path(service: &ServiceDefinition) -> PathBuf {
    PathBuf::from(expand_runtime_template(&service.log_path))
}

fn service_arg_values(service: &ServiceDefinition) -> Vec<String> {
    service
        .args
        .iter()
        .map(|arg| expand_runtime_template(arg))
        .collect()
}

fn health_detail(health: &HealthDefinition) -> String {
    match health {
        HealthDefinition::Tcp { host, port } => format!("tcp {host}:{port}"),
        HealthDefinition::Http { endpoint } => endpoint.to_owned(),
        HealthDefinition::Supervisor { service } => format!("supervisor service {service}"),
        HealthDefinition::Filesystem { path } => expand_runtime_template(path),
    }
}

fn tcp_health_ok(host: &str, port: u16) -> bool {
    let address = format!("{host}:{port}");
    address
        .to_socket_addrs()
        .ok()
        .and_then(|mut addresses| addresses.next())
        .and_then(|address| TcpStream::connect_timeout(&address, Duration::from_millis(500)).ok())
        .is_some()
}

fn http_health_ok(endpoint: &str) -> bool {
    let Some(rest) = endpoint.strip_prefix("http://") else {
        return false;
    };
    let (host_port, path) = rest.split_once('/').unwrap_or((rest, ""));
    let path = format!("/{path}");
    let mut stream = match TcpStream::connect_timeout(
        &host_port
            .to_socket_addrs()
            .ok()
            .and_then(|mut addresses| addresses.next())
            .unwrap_or_else(|| "127.0.0.1:0".parse().expect("fallback socket")),
        Duration::from_millis(500),
    ) {
        Ok(stream) => stream,
        Err(_) => return false,
    };
    let _ = stream.set_read_timeout(Some(Duration::from_millis(500)));
    let request = format!("GET {path} HTTP/1.1\r\nHost: {host_port}\r\nConnection: close\r\n\r\n");
    if stream.write_all(request.as_bytes()).is_err() {
        return false;
    }
    let mut response = [0_u8; 16];
    let Ok(size) = stream.read(&mut response) else {
        return false;
    };
    let status = String::from_utf8_lossy(&response[..size]);
    status.starts_with("HTTP/1.1 2") || status.starts_with("HTTP/1.0 2")
}

fn process_running(pid: u32) -> bool {
    if cfg!(target_os = "windows") {
        Command::new("tasklist")
            .arg("/FI")
            .arg(format!("PID eq {pid}"))
            .arg("/FO")
            .arg("CSV")
            .arg("/NH")
            .output()
            .map(|output| {
                output.status.success()
                    && String::from_utf8_lossy(&output.stdout).contains(&pid.to_string())
            })
            .unwrap_or(false)
    } else {
        Command::new("kill")
            .arg("-0")
            .arg(pid.to_string())
            .status()
            .map(|status| status.success())
            .unwrap_or(false)
    }
}

fn probe_service_health(service: &ServiceDefinition, state: &RuntimeState) -> bool {
    match &service.health {
        HealthDefinition::Tcp { host, port } => tcp_health_ok(host, *port),
        HealthDefinition::Http { endpoint } => http_health_ok(endpoint),
        HealthDefinition::Filesystem { path } => {
            PathBuf::from(expand_runtime_template(path)).is_dir()
        }
        HealthDefinition::Supervisor {
            service: service_id,
        } => state
            .services
            .iter()
            .find(|candidate| &candidate.id == service_id)
            .and_then(|candidate| candidate.pid)
            .map(process_running)
            .unwrap_or(false),
    }
}

fn service_needs_binary(service: &ServiceDefinition) -> bool {
    service.kind != "file-storage"
}

fn service_health(service: &ServiceDefinition, state: &RuntimeState) -> RuntimeHealthItem {
    let state_entry = service_state(state, service);
    let installed = state_entry.map(|entry| entry.installed).unwrap_or(false);
    let binary_path = service_binary_path(service);
    let binary_exists = !service_needs_binary(service) || binary_path.is_file();
    let ok = probe_service_health(service, state);
    let requirement = if service.required {
        "required"
    } else {
        "optional"
    };

    let (status, message, next_action) = if ok {
        (
            "OK",
            format!("{} is ready on this Windows profile.", service.label),
            "Continue local setup.".to_string(),
        )
    } else if !binary_exists {
        (
            "Needs install",
            format!(
                "{} is missing its bundled runtime executable.",
                service.label
            ),
            "Install or repair the bundled Windows runtime.".to_string(),
        )
    } else if installed {
        (
            "Needs start",
            format!(
                "{} is installed but is not responding to its health check.",
                service.label
            ),
            "Start or repair the local service from System Health.".to_string(),
        )
    } else {
        (
            "Needs setup",
            format!(
                "{} is defined for the Windows local runtime but has not been installed yet.",
                service.label
            ),
            service.next_action.clone(),
        )
    };

    RuntimeHealthItem {
        id: service.id.clone(),
        label: service.label.clone(),
        ok,
        status,
        message,
        next_action,
        admin_detail: format!(
            "{}; {}; kind {}; binary {}; binary_present {}; args {}; health {}; log {}; pid {}",
            service.admin_label,
            requirement,
            service.kind,
            binary_path.display(),
            binary_exists,
            service_arg_values(service).join(" "),
            health_detail(&service.health),
            service_log_path(service).display(),
            state_entry
                .and_then(|entry| entry.pid)
                .map(|pid| pid.to_string())
                .unwrap_or_else(|| "none".to_string())
        ),
    }
}

pub fn runtime_health() -> Result<Vec<RuntimeHealthItem>, String> {
    let manifest = parse_manifest()?;
    validate_manifest(&manifest)?;
    let state = read_state()?;
    let mut health = vec![RuntimeHealthItem {
        id: "desktop-shell".to_string(),
        label: "Desktop shell".to_string(),
        ok: true,
        status: "OK",
        message: "Tauri/WebView2 shell is running locally.".to_string(),
        next_action: "Continue the Windows local setup.".to_string(),
        admin_detail: "The desktop process is active.".to_string(),
    }];
    health.extend(
        manifest
            .services
            .iter()
            .map(|service| service_health(service, &state)),
    );
    Ok(health)
}

pub(crate) fn required_runtime_ready() -> Result<bool, String> {
    Ok(runtime_health()?
        .into_iter()
        .filter(|item| item.id != "desktop-shell")
        .all(|item| item.ok))
}

fn target_services<'a>(
    manifest: &'a RuntimeManifest,
    service_id: Option<&str>,
) -> Result<Vec<&'a ServiceDefinition>, String> {
    if let Some(id) = service_id {
        return manifest
            .services
            .iter()
            .find(|service| service.id == id)
            .map(|service| vec![service])
            .ok_or_else(|| format!("Unknown supervisor service: {id}"));
    }
    Ok(manifest.services.iter().collect())
}

fn ensure_runtime_dirs(service: &ServiceDefinition) -> Result<(), String> {
    fs::create_dir_all(data_root().join("logs"))
        .map_err(|error| format!("Could not create runtime log folder: {error}"))?;
    fs::create_dir_all(data_root().join("files"))
        .map_err(|error| format!("Could not create local document storage: {error}"))?;
    if service.id == "postgres" {
        fs::create_dir_all(data_root().join("postgres"))
            .map_err(|error| format!("Could not create local database folder: {error}"))?;
    }
    if let Some(parent) = service_log_path(service).parent() {
        fs::create_dir_all(parent)
            .map_err(|error| format!("Could not create {}: {error}", parent.display()))?;
    }
    Ok(())
}

fn install_or_repair(
    action: &str,
    services: &[&ServiceDefinition],
) -> Result<SupervisorActionResult, String> {
    let mut state = read_state()?;
    let mut missing_required = Vec::new();
    for service in services {
        ensure_runtime_dirs(service)?;
        let binary_exists =
            !service_needs_binary(service) || service_binary_path(service).is_file();
        if service.required && !binary_exists {
            missing_required.push(service.label.clone());
        }
        update_service_state(&mut state, &service.id, binary_exists, None, action);
    }
    write_state(&state)?;

    if missing_required.is_empty() {
        Ok(SupervisorActionResult {
            accepted: true,
            action: action.to_string(),
            service_id: None,
            status: "Installed",
            message: "The local runtime folders and service state were prepared.".to_string(),
            next_action: "Start the local services and run health verification.".to_string(),
        })
    } else {
        Ok(SupervisorActionResult {
            accepted: false,
            action: action.to_string(),
            service_id: None,
            status: "Needs runtime files",
            message: format!(
                "Local folders were prepared, but bundled executables are missing for: {}.",
                missing_required.join(", ")
            ),
            next_action: "Repair or install the bundled Windows runtime files, then retry."
                .to_string(),
        })
    }
}

fn start_services(services: &[&ServiceDefinition]) -> Result<SupervisorActionResult, String> {
    let mut state = read_state()?;
    let mut started = Vec::new();
    for service in services {
        ensure_runtime_dirs(service)?;
        if !service_needs_binary(service) {
            update_service_state(&mut state, &service.id, true, None, "start");
            started.push(service.label.clone());
            continue;
        }
        let binary = service_binary_path(service);
        if !binary.is_file() {
            return Ok(SupervisorActionResult {
                accepted: false,
                action: "start".to_string(),
                service_id: Some(service.id.clone()),
                status: "Needs install",
                message: format!(
                    "{} cannot start because {} is missing.",
                    service.label,
                    binary.display()
                ),
                next_action: "Install or repair the bundled Windows runtime files, then retry."
                    .to_string(),
            });
        }
        let log_path = service_log_path(service);
        let log = OpenOptions::new()
            .create(true)
            .append(true)
            .open(&log_path)
            .map_err(|error| format!("Could not open {}: {error}", log_path.display()))?;
        let child = Command::new(&binary)
            .args(service_arg_values(service))
            .stdout(Stdio::from(log.try_clone().map_err(|error| {
                format!("Could not prepare service log: {error}")
            })?))
            .stderr(Stdio::from(log))
            .spawn()
            .map_err(|error| format!("Could not start {}: {error}", service.label))?;
        update_service_state(&mut state, &service.id, true, Some(child.id()), "start");
        started.push(service.label.clone());
    }
    write_state(&state)?;

    Ok(SupervisorActionResult {
        accepted: true,
        action: "start".to_string(),
        service_id: None,
        status: "Started",
        message: format!(
            "Started local runtime service state for {}.",
            started.join(", ")
        ),
        next_action: "Run health verification after services finish warming up.".to_string(),
    })
}

fn stop_pid(pid: u32) -> bool {
    if cfg!(target_os = "windows") {
        Command::new("taskkill")
            .arg("/PID")
            .arg(pid.to_string())
            .arg("/T")
            .arg("/F")
            .status()
            .map(|status| status.success())
            .unwrap_or(false)
    } else {
        Command::new("kill")
            .arg(pid.to_string())
            .status()
            .map(|status| status.success())
            .unwrap_or(false)
    }
}

fn stop_services(services: &[&ServiceDefinition]) -> Result<SupervisorActionResult, String> {
    let mut state = read_state()?;
    let mut stopped = Vec::new();
    for service in services {
        if let Some(pid) = service_state(&state, service).and_then(|entry| entry.pid) {
            let _ = stop_pid(pid);
        }
        update_service_state(&mut state, &service.id, true, None, "stop");
        stopped.push(service.label.clone());
    }
    write_state(&state)?;
    Ok(SupervisorActionResult {
        accepted: true,
        action: "stop".to_string(),
        service_id: None,
        status: "Stopped",
        message: format!(
            "Stopped local runtime service state for {}.",
            stopped.join(", ")
        ),
        next_action: "Start services again from System Health when needed.".to_string(),
    })
}

fn log_action(services: &[&ServiceDefinition]) -> Result<SupervisorActionResult, String> {
    for service in services {
        ensure_runtime_dirs(service)?;
    }
    Ok(SupervisorActionResult {
        accepted: true,
        action: "logs".to_string(),
        service_id: services.first().map(|service| service.id.clone()),
        status: "Ready",
        message: format!(
            "Runtime logs are stored under {}.",
            data_root().join("logs").display()
        ),
        next_action: "Open System Health repair details to inspect service logs.".to_string(),
    })
}

fn health_action(service_id: Option<&str>) -> Result<SupervisorActionResult, String> {
    let health = runtime_health()?;
    let relevant: Vec<&RuntimeHealthItem> = health
        .iter()
        .filter(|item| item.id != "desktop-shell")
        .filter(|item| service_id.map(|id| item.id == id).unwrap_or(true))
        .collect();
    let ok = relevant.iter().all(|item| item.ok);
    Ok(SupervisorActionResult {
        accepted: ok,
        action: "health".to_string(),
        service_id: service_id.map(str::to_string),
        status: if ok { "Ready" } else { "Needs attention" },
        message: if ok {
            "Selected local runtime services passed health checks.".to_string()
        } else {
            "One or more selected local runtime services are not healthy yet.".to_string()
        },
        next_action: if ok {
            "Continue first-run health verification.".to_string()
        } else {
            "Install, start, or repair the local runtime services, then run health again."
                .to_string()
        },
    })
}

fn blocked_lifecycle_action(action: &str, service_id: Option<&str>) -> SupervisorActionResult {
    SupervisorActionResult {
        accepted: false,
        action: action.to_string(),
        service_id: service_id.map(str::to_string),
        status: "Needs implementation",
        message: format!("{action} is reserved for the installer lifecycle executor."),
        next_action: "Use install, start, health, logs, repair, or stop while backup/restore/uninstall executors are connected.".to_string(),
    }
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

    let services = target_services(&manifest, service_id)?;
    match action {
        "install" | "repair" => install_or_repair(action, &services),
        "start" => start_services(&services),
        "stop" => stop_services(&services),
        "health" => health_action(service_id),
        "logs" => log_action(&services),
        "backup" | "restore" | "uninstall" => Ok(blocked_lifecycle_action(action, service_id)),
        _ => Err(format!("Unsupported supervisor action: {action}")),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn with_temp_state_dir<T>(test: impl FnOnce(PathBuf) -> T) -> T {
        let _guard = crate::first_run::test_env_lock()
            .lock()
            .expect("test env lock");
        let root = env::temp_dir().join(format!(
            "civicsuite-desktop-supervisor-test-{}",
            std::process::id()
        ));
        let _ = fs::remove_dir_all(&root);
        env::set_var("CIVICSUITE_DESKTOP_STATE_DIR", &root);
        env::set_var("CIVICSUITE_RUNTIME_ROOT", root.join("Runtime"));
        let result = test(root.clone());
        env::remove_var("CIVICSUITE_DESKTOP_STATE_DIR");
        env::remove_var("CIVICSUITE_RUNTIME_ROOT");
        let _ = fs::remove_dir_all(root);
        result
    }

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
        with_temp_state_dir(|_| {
            let health = runtime_health().expect("health builds from manifest");
            assert!(health
                .iter()
                .any(|item| item.id == "desktop-shell" && item.ok));
            assert!(health
                .iter()
                .any(|item| item.label == "Local data store" && !item.ok));
            assert!(health
                .iter()
                .any(|item| item.label == "Local AI model" && item.status == "Needs install"));
            assert!(!health.iter().any(|item| item.label.contains("PostgreSQL")));
        });
    }

    #[test]
    fn supervisor_install_prepares_local_dirs_but_reports_missing_runtime_files() {
        with_temp_state_dir(|root| {
            let result = supervisor_action("install", None).expect("action response is structured");
            assert!(!result.accepted);
            assert_eq!(result.status, "Needs runtime files");
            assert!(root.join("Data").join("files").is_dir());
            assert!(root.join("Data").join("logs").is_dir());
            assert!(root.join("config").join("runtime-state.json").is_file());
        });
    }

    #[test]
    fn supervisor_start_refuses_missing_binary() {
        with_temp_state_dir(|_| {
            let result = supervisor_action("start", Some("postgres"))
                .expect("action response is structured");
            assert!(!result.accepted);
            assert_eq!(result.status, "Needs install");
            assert!(result.message.contains("cannot start"));
        });
    }

    #[test]
    fn filesystem_service_becomes_healthy_after_install() {
        with_temp_state_dir(|_| {
            supervisor_action("install", Some("file-storage")).expect("install file storage");
            let health = runtime_health().expect("health builds");
            assert!(health
                .iter()
                .any(|item| item.id == "file-storage" && item.ok));
        });
    }
}
