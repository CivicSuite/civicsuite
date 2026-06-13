use serde::{Deserialize, Serialize};
use std::env;
use std::fs::{self, OpenOptions};
use std::io::{Read, Write};
use std::net::{TcpStream, ToSocketAddrs};
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::time::{Duration, SystemTime, UNIX_EPOCH};

const RUNTIME_MANIFEST_JSON: &str = include_str!("../../runtime/windows-local-runtime.json");
const RUNTIME_PAYLOADS_JSON: &str = include_str!("../../runtime/windows-runtime-payloads.json");
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
struct RuntimePayloadManifest {
    schema_version: u16,
    profile: String,
    local_only: bool,
    payload_root: String,
    install_root: String,
    payloads: Vec<RuntimePayloadDefinition>,
}

#[derive(Deserialize)]
struct RuntimePayloadDefinition {
    id: String,
    label: String,
    services: Vec<String>,
    source_dir: String,
    destination_dir: String,
    required_files: Vec<String>,
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

#[derive(Serialize)]
struct BackupManifest {
    schema_version: u16,
    kind: String,
    created_unix_seconds: u64,
    source_root: String,
    data_source: String,
    config_source: String,
    backup_root: String,
    contains_data: bool,
    contains_config: bool,
}

fn parse_manifest() -> Result<RuntimeManifest, String> {
    serde_json::from_str(RUNTIME_MANIFEST_JSON)
        .map_err(|error| format!("Could not parse Windows runtime manifest: {error}"))
}

fn parse_payload_manifest() -> Result<RuntimePayloadManifest, String> {
    serde_json::from_str(RUNTIME_PAYLOADS_JSON)
        .map_err(|error| format!("Could not parse Windows runtime payload manifest: {error}"))
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

fn validate_payload_manifest(
    manifest: &RuntimeManifest,
    payload_manifest: &RuntimePayloadManifest,
) -> Result<(), String> {
    if payload_manifest.schema_version != 1 {
        return Err(format!(
            "Unsupported Windows runtime payload manifest schema {}",
            payload_manifest.schema_version
        ));
    }
    if payload_manifest.profile != manifest.profile {
        return Err(
            "Windows runtime payload manifest profile does not match runtime profile".to_string(),
        );
    }
    if !payload_manifest.local_only {
        return Err("Windows runtime payload manifest must be local-only".to_string());
    }
    if payload_manifest.payload_root != "runtime/payload" {
        return Err("Windows runtime payload root must be runtime/payload".to_string());
    }
    if payload_manifest.install_root != "runtime" {
        return Err("Windows runtime payload install root must be runtime".to_string());
    }
    for service in &manifest.services {
        if !payload_manifest
            .payloads
            .iter()
            .any(|payload| payload.services.iter().any(|id| id == &service.id))
        {
            return Err(format!(
                "Windows runtime payload manifest is missing service {}",
                service.id
            ));
        }
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

fn backup_root() -> PathBuf {
    env::var("CIVICSUITE_BACKUP_DIR")
        .map(PathBuf::from)
        .unwrap_or_else(|_| {
            if env::var("CIVICSUITE_DESKTOP_STATE_DIR").is_ok() {
                return civic_suite_root().join("Backups");
            }
            env::var("USERPROFILE")
                .map(PathBuf::from)
                .unwrap_or_else(|_| PathBuf::from("{documents}"))
                .join("Documents")
                .join("CivicSuite Backups")
        })
}

fn runtime_root() -> PathBuf {
    env::var("CIVICSUITE_RUNTIME_ROOT")
        .map(PathBuf::from)
        .unwrap_or_else(|_| civic_suite_root())
}

fn runtime_payload_roots() -> Vec<PathBuf> {
    let mut candidates = Vec::new();
    if let Ok(root) = env::var("CIVICSUITE_RUNTIME_PAYLOAD_DIR") {
        candidates.push(PathBuf::from(root));
    }
    if let Ok(exe) = env::current_exe() {
        if let Some(parent) = exe.parent() {
            candidates.push(parent.join("runtime").join("payload"));
            candidates.push(parent.join("resources").join("runtime").join("payload"));
            candidates.push(parent.join("resources").join("runtime-payload"));
        }
    }
    candidates.push(runtime_root().join("runtime").join("payload"));
    candidates
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

fn ensure_profile_child_for_delete(path: &Path) -> Result<(), String> {
    if !path.exists() {
        return Ok(());
    }
    let root = civic_suite_root();
    fs::create_dir_all(&root)
        .map_err(|error| format!("Could not create CivicSuite profile root: {error}"))?;
    let canonical_root = fs::canonicalize(&root)
        .map_err(|error| format!("Could not resolve {}: {error}", root.display()))?;
    let canonical_path = fs::canonicalize(path)
        .map_err(|error| format!("Could not resolve {}: {error}", path.display()))?;
    if canonical_path == canonical_root || !canonical_path.starts_with(&canonical_root) {
        return Err(format!(
            "Refusing to remove {} because it is outside the CivicSuite profile.",
            path.display()
        ));
    }
    Ok(())
}

fn copy_path_recursive(source: &Path, destination: &Path) -> Result<(), String> {
    if !source.exists() {
        return Ok(());
    }
    let metadata = fs::symlink_metadata(source)
        .map_err(|error| format!("Could not inspect {}: {error}", source.display()))?;
    if metadata.file_type().is_symlink() {
        return Err(format!(
            "Refusing to follow symbolic link during backup: {}",
            source.display()
        ));
    }
    if metadata.is_dir() {
        fs::create_dir_all(destination)
            .map_err(|error| format!("Could not create {}: {error}", destination.display()))?;
        for entry in fs::read_dir(source)
            .map_err(|error| format!("Could not read {}: {error}", source.display()))?
        {
            let entry = entry.map_err(|error| format!("Could not read backup entry: {error}"))?;
            let child_source = entry.path();
            let child_destination = destination.join(entry.file_name());
            copy_path_recursive(&child_source, &child_destination)?;
        }
    } else if metadata.is_file() {
        if let Some(parent) = destination.parent() {
            fs::create_dir_all(parent)
                .map_err(|error| format!("Could not create {}: {error}", parent.display()))?;
        }
        fs::copy(source, destination).map_err(|error| {
            format!(
                "Could not copy {} to {}: {error}",
                source.display(),
                destination.display()
            )
        })?;
    }
    Ok(())
}

fn payloads_for_services<'a>(
    payload_manifest: &'a RuntimePayloadManifest,
    services: &[&ServiceDefinition],
) -> Vec<&'a RuntimePayloadDefinition> {
    payload_manifest
        .payloads
        .iter()
        .filter(|payload| {
            services.iter().any(|service| {
                payload
                    .services
                    .iter()
                    .any(|payload_service| payload_service == &service.id)
            })
        })
        .collect()
}

fn payload_destination(payload: &RuntimePayloadDefinition) -> PathBuf {
    let destination = PathBuf::from(payload.destination_dir.replace('/', "\\"));
    if destination.is_absolute() {
        destination
    } else {
        runtime_root().join(destination)
    }
}

fn payload_required_files_present(payload: &RuntimePayloadDefinition) -> bool {
    let destination = payload_destination(payload);
    payload
        .required_files
        .iter()
        .all(|file| destination.join(file.replace('/', "\\")).exists())
}

fn first_payload_source(payload: &RuntimePayloadDefinition) -> Option<PathBuf> {
    runtime_payload_roots()
        .into_iter()
        .map(|root| root.join(payload.source_dir.replace('/', "\\")))
        .find(|candidate| candidate.is_dir())
}

fn install_runtime_payloads(payloads: &[&RuntimePayloadDefinition]) -> Result<Vec<String>, String> {
    let mut missing = Vec::new();
    for payload in payloads {
        if payload_required_files_present(payload) {
            continue;
        }
        let Some(source) = first_payload_source(payload) else {
            missing.push(format!("{} ({})", payload.label, payload.id));
            continue;
        };
        let destination = payload_destination(payload);
        copy_path_recursive(&source, &destination)?;
        if !payload_required_files_present(payload) {
            missing.push(format!("{} ({})", payload.label, payload.id));
        }
    }
    Ok(missing)
}

fn remove_profile_dir(path: &Path) -> Result<bool, String> {
    if !path.exists() {
        return Ok(false);
    }
    ensure_profile_child_for_delete(path)?;
    fs::remove_dir_all(path)
        .map_err(|error| format!("Could not remove {}: {error}", path.display()))?;
    Ok(true)
}

fn create_backup(kind: &str) -> Result<PathBuf, String> {
    let created = now_unix_seconds();
    let root = backup_root();
    fs::create_dir_all(&root)
        .map_err(|error| format!("Could not create backup folder {}: {error}", root.display()))?;
    let destination = root.join(format!(
        "civicsuite-{kind}-backup-{created}-{}",
        std::process::id()
    ));
    fs::create_dir_all(&destination).map_err(|error| {
        format!(
            "Could not create backup destination {}: {error}",
            destination.display()
        )
    })?;

    let data = data_root();
    let config = config_dir();
    let contains_data = data.exists();
    let contains_config = config.exists();
    copy_path_recursive(&data, &destination.join("Data"))?;
    copy_path_recursive(&config, &destination.join("config"))?;

    let manifest = BackupManifest {
        schema_version: 1,
        kind: kind.to_string(),
        created_unix_seconds: created,
        source_root: civic_suite_root().display().to_string(),
        data_source: data.display().to_string(),
        config_source: config.display().to_string(),
        backup_root: root.display().to_string(),
        contains_data,
        contains_config,
    };
    let contents = serde_json::to_string_pretty(&manifest)
        .map_err(|error| format!("Could not serialize backup manifest: {error}"))?;
    fs::write(
        destination.join("backup-manifest.json"),
        format!("{contents}\n"),
    )
    .map_err(|error| format!("Could not write backup manifest: {error}"))?;
    Ok(destination)
}

fn latest_backup_dir() -> Result<Option<PathBuf>, String> {
    let root = backup_root();
    if !root.is_dir() {
        return Ok(None);
    }
    let mut candidates = Vec::new();
    for entry in fs::read_dir(&root)
        .map_err(|error| format!("Could not read backup folder {}: {error}", root.display()))?
    {
        let entry = entry.map_err(|error| format!("Could not inspect backup folder: {error}"))?;
        let path = entry.path();
        if path.is_dir()
            && path.join("backup-manifest.json").is_file()
            && entry
                .file_name()
                .to_string_lossy()
                .starts_with("civicsuite-")
        {
            candidates.push(path);
        }
    }
    candidates.sort_by_key(|path| path.file_name().map(|name| name.to_os_string()));
    Ok(candidates.pop())
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
    manifest: &RuntimeManifest,
    services: &[&ServiceDefinition],
) -> Result<SupervisorActionResult, String> {
    let payload_manifest = parse_payload_manifest()?;
    validate_payload_manifest(manifest, &payload_manifest)?;
    let payloads = payloads_for_services(&payload_manifest, services);
    let missing_payloads = install_runtime_payloads(&payloads)?;
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

    if missing_required.is_empty() && missing_payloads.is_empty() {
        Ok(SupervisorActionResult {
            accepted: true,
            action: action.to_string(),
            service_id: None,
            status: "Installed",
            message:
                "The bundled local runtime payloads, folders, and service state were prepared."
                    .to_string(),
            next_action: "Start the local services and run health verification.".to_string(),
        })
    } else {
        let mut details = Vec::new();
        if !missing_payloads.is_empty() {
            details.push(format!("missing payloads: {}", missing_payloads.join(", ")));
        }
        if !missing_required.is_empty() {
            details.push(format!(
                "missing service executables: {}",
                missing_required.join(", ")
            ));
        }
        Ok(SupervisorActionResult {
            accepted: false,
            action: action.to_string(),
            service_id: None,
            status: "Needs runtime files",
            message: format!(
                "Local folders were prepared, but required Windows runtime files are incomplete: {}.",
                details.join("; ")
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

fn backup_action() -> Result<SupervisorActionResult, String> {
    let destination = create_backup("manual")?;
    Ok(SupervisorActionResult {
        accepted: true,
        action: "backup".to_string(),
        service_id: None,
        status: "Backup complete",
        message: format!(
            "CivicSuite local data and configuration were backed up to {}.",
            destination.display()
        ),
        next_action: "Keep this backup folder available for restore or reinstall recovery."
            .to_string(),
    })
}

fn restore_action(services: &[&ServiceDefinition]) -> Result<SupervisorActionResult, String> {
    let Some(source) = latest_backup_dir()? else {
        return Ok(SupervisorActionResult {
            accepted: false,
            action: "restore".to_string(),
            service_id: None,
            status: "No backup found",
            message: format!(
                "No CivicSuite backup manifest was found under {}.",
                backup_root().display()
            ),
            next_action: "Create a backup before using restore on this Windows profile."
                .to_string(),
        });
    };
    let safety_backup = create_backup("pre-restore")?;
    let _ = stop_services(services)?;
    remove_profile_dir(&data_root())?;
    remove_profile_dir(&config_dir())?;
    copy_path_recursive(&source.join("Data"), &data_root())?;
    copy_path_recursive(&source.join("config"), &config_dir())?;
    Ok(SupervisorActionResult {
        accepted: true,
        action: "restore".to_string(),
        service_id: None,
        status: "Restore complete",
        message: format!(
            "Restored CivicSuite local data from {}. A pre-restore safety backup was saved to {}.",
            source.display(),
            safety_backup.display()
        ),
        next_action: "Run health checks, then start local services when staff are ready."
            .to_string(),
    })
}

fn uninstall_action(services: &[&ServiceDefinition]) -> Result<SupervisorActionResult, String> {
    let final_backup = create_backup("final-uninstall")?;
    let _ = stop_services(services)?;
    let removed_data = remove_profile_dir(&data_root())?;
    let removed_config = remove_profile_dir(&config_dir())?;
    Ok(SupervisorActionResult {
        accepted: true,
        action: "uninstall".to_string(),
        service_id: None,
        status: "Local profile removed",
        message: format!(
            "Stopped local services, saved a final backup to {}, removed data: {}, removed setup/config: {}.",
            final_backup.display(),
            removed_data,
            removed_config
        ),
        next_action: "Use the CivicSuite Windows uninstall entry to remove program files; reinstall can restore from the final backup.".to_string(),
    })
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
        "install" | "repair" => install_or_repair(action, &manifest, &services),
        "start" => start_services(&services),
        "stop" => stop_services(&services),
        "health" => health_action(service_id),
        "logs" => log_action(&services),
        "backup" => backup_action(),
        "restore" => restore_action(&services),
        "uninstall" => uninstall_action(&services),
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
        env::set_var("CIVICSUITE_RUNTIME_PAYLOAD_DIR", root.join("Payload"));
        env::set_var("CIVICSUITE_BACKUP_DIR", root.join("Backups"));
        let result = test(root.clone());
        env::remove_var("CIVICSUITE_DESKTOP_STATE_DIR");
        env::remove_var("CIVICSUITE_RUNTIME_ROOT");
        env::remove_var("CIVICSUITE_RUNTIME_PAYLOAD_DIR");
        env::remove_var("CIVICSUITE_BACKUP_DIR");
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
    fn payload_manifest_covers_runtime_services() {
        let manifest = parse_manifest().expect("manifest parses");
        validate_manifest(&manifest).expect("manifest validates");
        let payload_manifest = parse_payload_manifest().expect("payload manifest parses");
        validate_payload_manifest(&manifest, &payload_manifest)
            .expect("payload manifest covers services");
    }

    #[test]
    fn runtime_health_is_plain_english_before_install() {
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
    fn supervisor_install_copies_bundled_runtime_payload() {
        with_temp_state_dir(|root| {
            let payload = root.join("Payload").join("postgres");
            for file in [
                "bin/pg_ctl.exe",
                "bin/initdb.exe",
                "bin/postgres.exe",
                "share/extension/vector.control",
                "lib/vector.dll",
            ] {
                let path = payload.join(file);
                fs::create_dir_all(path.parent().expect("payload parent")).expect("payload dir");
                fs::write(path, "fake runtime file").expect("payload file");
            }

            let result = supervisor_action("install", Some("postgres"))
                .expect("action response is structured");

            assert!(result.accepted);
            assert_eq!(result.status, "Installed");
            assert!(root
                .join("Runtime")
                .join("runtime")
                .join("postgres")
                .join("bin")
                .join("pg_ctl.exe")
                .is_file());
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

    #[test]
    fn backup_copies_local_data_and_config() {
        with_temp_state_dir(|root| {
            fs::create_dir_all(root.join("Data").join("files")).expect("data folder");
            fs::write(root.join("Data").join("files").join("record.txt"), "agenda")
                .expect("data file");
            fs::create_dir_all(root.join("config")).expect("config folder");
            fs::write(root.join("config").join("city.json"), "{}").expect("config file");

            let result = supervisor_action("backup", None).expect("backup response");

            assert!(result.accepted);
            let backups = root.join("Backups");
            let backup = latest_backup_dir()
                .expect("latest backup lookup")
                .expect("backup exists");
            assert!(backup.starts_with(backups));
            assert!(backup
                .join("Data")
                .join("files")
                .join("record.txt")
                .is_file());
            assert!(backup.join("config").join("city.json").is_file());
            assert!(backup.join("backup-manifest.json").is_file());
        });
    }

    #[test]
    fn restore_replaces_profile_from_latest_backup() {
        with_temp_state_dir(|root| {
            fs::create_dir_all(root.join("Data").join("files")).expect("data folder");
            fs::write(root.join("Data").join("files").join("record.txt"), "before")
                .expect("data file");
            fs::create_dir_all(root.join("config")).expect("config folder");
            fs::write(root.join("config").join("city.json"), "before").expect("config file");
            supervisor_action("backup", None).expect("backup response");

            fs::write(root.join("Data").join("files").join("record.txt"), "after")
                .expect("mutate data");
            fs::write(root.join("config").join("city.json"), "after").expect("mutate config");

            let result = supervisor_action("restore", None).expect("restore response");

            assert!(result.accepted);
            assert_eq!(
                fs::read_to_string(root.join("Data").join("files").join("record.txt"))
                    .expect("restored data"),
                "before"
            );
            assert_eq!(
                fs::read_to_string(root.join("config").join("city.json")).expect("restored config"),
                "before"
            );
            assert!(root
                .join("Backups")
                .read_dir()
                .expect("backups")
                .filter_map(Result::ok)
                .any(|entry| entry.file_name().to_string_lossy().contains("pre-restore")));
        });
    }

    #[test]
    fn uninstall_removes_profile_after_final_backup() {
        with_temp_state_dir(|root| {
            fs::create_dir_all(root.join("Data").join("files")).expect("data folder");
            fs::write(
                root.join("Data").join("files").join("record.txt"),
                "official",
            )
            .expect("data file");
            fs::create_dir_all(root.join("config")).expect("config folder");
            fs::write(root.join("config").join("city.json"), "{}").expect("config file");

            let result = supervisor_action("uninstall", None).expect("uninstall response");

            assert!(result.accepted);
            assert!(!root.join("Data").exists());
            assert!(!root.join("config").exists());
            assert!(root
                .join("Backups")
                .read_dir()
                .expect("backups")
                .filter_map(Result::ok)
                .any(|entry| entry
                    .file_name()
                    .to_string_lossy()
                    .contains("final-uninstall")));
        });
    }
}
