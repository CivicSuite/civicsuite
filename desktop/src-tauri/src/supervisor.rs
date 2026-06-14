use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::env;
use std::fs::{self, OpenOptions};
use std::io::{Read, Write};
use std::net::{TcpStream, ToSocketAddrs};
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::thread;
use std::time::{Duration, SystemTime, UNIX_EPOCH};

use crate::local_paths;

const RUNTIME_MANIFEST_JSON: &str = include_str!("../../runtime/windows-local-runtime.json");
const RUNTIME_PAYLOADS_JSON: &str = include_str!("../../runtime/windows-runtime-payloads.json");
const REQUIRED_ACTIONS: [&str; 12] = [
    "install",
    "start",
    "stop",
    "health",
    "repair",
    "logs",
    "support-bundle",
    "backup",
    "open-backup-folder",
    "restore",
    "uninstall",
    "open-windows-uninstall",
];
const LOCAL_DB_NAME: &str = "civicsuite";
const LOCAL_DB_USER: &str = "civicsuite";
const LOCAL_DB_PORT: u16 = 15432;

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
struct RuntimePayloadLock {
    schema_version: u16,
    profile: String,
    payloads: Vec<RuntimePayloadLockEntry>,
}

#[derive(Deserialize)]
struct RuntimePayloadLockEntry {
    id: String,
    source_dir: String,
    required_files: Vec<RuntimePayloadLockFile>,
}

#[derive(Deserialize)]
struct RuntimePayloadLockFile {
    path: String,
    size_bytes: u64,
    sha256: String,
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
    pub actionable: bool,
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

#[derive(Deserialize, Serialize, Clone, Debug, Eq, PartialEq)]
struct BackupFileEntry {
    path: String,
    size_bytes: u64,
    sha256: String,
}

#[derive(Deserialize, Serialize)]
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
    file_count: usize,
    files: Vec<BackupFileEntry>,
}

#[derive(Serialize)]
struct SupportBundleManifest {
    schema_version: u16,
    kind: String,
    created_unix_seconds: u64,
    source_root: String,
    data_source: String,
    backup_root: String,
    selected_services: Vec<String>,
    file_count: usize,
    files: Vec<BackupFileEntry>,
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
    local_paths::civic_suite_root()
}

fn data_root() -> PathBuf {
    local_paths::data_root()
}

fn config_dir() -> PathBuf {
    local_paths::config_dir()
}

fn secrets_dir() -> PathBuf {
    config_dir().join("secrets")
}

fn backup_root() -> PathBuf {
    local_paths::backup_root()
}

fn support_bundle_root() -> PathBuf {
    backup_root().join("support-bundles")
}

fn runtime_root() -> PathBuf {
    env::var("CIVICSUITE_RUNTIME_ROOT")
        .map(PathBuf::from)
        .unwrap_or_else(|_| civic_suite_root())
}

fn random_hex_secret(byte_count: usize) -> Result<String, String> {
    let mut bytes = vec![0_u8; byte_count];
    getrandom::getrandom(&mut bytes)
        .map_err(|error| format!("Could not generate local runtime secret: {error}"))?;
    Ok(bytes.iter().map(|byte| format!("{byte:02x}")).collect())
}

fn read_or_create_secret(file_name: &str, byte_count: usize) -> Result<String, String> {
    let path = secrets_dir().join(file_name);
    if path.is_file() {
        return fs::read_to_string(&path)
            .map(|value| value.trim().to_string())
            .map_err(|error| format!("Could not read {}: {error}", path.display()));
    }
    fs::create_dir_all(secrets_dir())
        .map_err(|error| format!("Could not create local secret folder: {error}"))?;
    let value = random_hex_secret(byte_count)?;
    fs::write(&path, format!("{value}\n"))
        .map_err(|error| format!("Could not write {}: {error}", path.display()))?;
    Ok(value)
}

fn postgres_password() -> Result<String, String> {
    read_or_create_secret("postgres-password.txt", 32)
}

fn local_database_url(driver: &str) -> Result<String, String> {
    Ok(format!(
        "{driver}://{LOCAL_DB_USER}:{}@127.0.0.1:{LOCAL_DB_PORT}/{LOCAL_DB_NAME}",
        postgres_password()?
    ))
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

fn normalized_backup_path(root: &Path, path: &Path) -> Result<String, String> {
    let relative = path.strip_prefix(root).map_err(|error| {
        format!(
            "Could not calculate backup-relative path for {}: {error}",
            path.display()
        )
    })?;
    Ok(relative
        .components()
        .map(|component| component.as_os_str().to_string_lossy())
        .collect::<Vec<_>>()
        .join("/"))
}

fn sha256_file(path: &Path) -> Result<(u64, String), String> {
    let mut file = fs::File::open(path)
        .map_err(|error| format!("Could not open {}: {error}", path.display()))?;
    let mut hasher = Sha256::new();
    let mut size = 0_u64;
    let mut buffer = [0_u8; 8192];
    loop {
        let read = file
            .read(&mut buffer)
            .map_err(|error| format!("Could not read {}: {error}", path.display()))?;
        if read == 0 {
            break;
        }
        size += read as u64;
        hasher.update(&buffer[..read]);
    }
    Ok((
        size,
        hasher
            .finalize()
            .iter()
            .map(|byte| format!("{byte:02x}"))
            .collect(),
    ))
}

fn collect_backup_files(root: &Path) -> Result<Vec<BackupFileEntry>, String> {
    fn collect(
        root: &Path,
        current: &Path,
        entries: &mut Vec<BackupFileEntry>,
    ) -> Result<(), String> {
        if !current.exists() {
            return Ok(());
        }
        let metadata = fs::symlink_metadata(current).map_err(|error| {
            format!(
                "Could not inspect backup file {}: {error}",
                current.display()
            )
        })?;
        if metadata.file_type().is_symlink() {
            return Err(format!(
                "Refusing to follow symbolic link in backup: {}",
                current.display()
            ));
        }
        if metadata.is_dir() {
            let mut children = fs::read_dir(current)
                .map_err(|error| {
                    format!(
                        "Could not read backup folder {}: {error}",
                        current.display()
                    )
                })?
                .collect::<Result<Vec<_>, _>>()
                .map_err(|error| format!("Could not inspect backup folder entry: {error}"))?;
            children.sort_by_key(|entry| entry.path());
            for child in children {
                collect(root, &child.path(), entries)?;
            }
            return Ok(());
        }
        if metadata.is_file() && current != root.join("backup-manifest.json") {
            let (size_bytes, sha256) = sha256_file(current)?;
            entries.push(BackupFileEntry {
                path: normalized_backup_path(root, current)?,
                size_bytes,
                sha256,
            });
        }
        Ok(())
    }

    let mut entries = Vec::new();
    collect(root, root, &mut entries)?;
    entries.sort_by(|left, right| left.path.cmp(&right.path));
    Ok(entries)
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

fn normalized_payload_file_path(path: &str) -> String {
    path.replace('\\', "/")
}

fn parse_payload_lock(payload_root: &Path) -> Result<RuntimePayloadLock, String> {
    let lock_path = payload_root.join("runtime-payload-lock.json");
    let contents = fs::read_to_string(&lock_path)
        .map_err(|error| format!("Could not read {}: {error}", lock_path.display()))?;
    serde_json::from_str(&contents)
        .map_err(|error| format!("Could not parse {}: {error}", lock_path.display()))
}

fn verify_payload_files_against_lock(
    payload: &RuntimePayloadDefinition,
    payload_root: &Path,
    base_dir: &Path,
) -> Result<(), String> {
    let lock = parse_payload_lock(payload_root)?;
    if lock.schema_version != 1 {
        return Err(format!(
            "Unsupported runtime payload lock schema {}",
            lock.schema_version
        ));
    }
    if lock.profile != "windows-local-1.0" {
        return Err("Runtime payload lock profile must be windows-local-1.0".to_string());
    }
    let entry = lock
        .payloads
        .iter()
        .find(|entry| entry.id == payload.id)
        .ok_or_else(|| format!("Runtime payload lock is missing {}", payload.id))?;
    if normalized_payload_file_path(&entry.source_dir)
        != normalized_payload_file_path(&payload.source_dir)
    {
        return Err(format!(
            "Runtime payload lock source for {} does not match the payload manifest",
            payload.id
        ));
    }
    for required_file in &payload.required_files {
        let normalized_required_file = normalized_payload_file_path(required_file);
        let locked_file = entry
            .required_files
            .iter()
            .find(|file| normalized_payload_file_path(&file.path) == normalized_required_file)
            .ok_or_else(|| {
                format!(
                    "Runtime payload lock missing required file {} for {}",
                    required_file, payload.id
                )
            })?;
        if locked_file.sha256.len() != 64
            || !locked_file
                .sha256
                .chars()
                .all(|character| character.is_ascii_hexdigit())
        {
            return Err(format!(
                "Runtime payload lock has an invalid SHA-256 for {} in {}",
                required_file, payload.id
            ));
        }
        let path = base_dir.join(required_file.replace('/', "\\"));
        if !path.is_file() {
            return Err(format!(
                "Runtime payload file is missing: {}",
                path.display()
            ));
        }
        let (size_bytes, sha256) = sha256_file(&path)?;
        if size_bytes != locked_file.size_bytes || sha256 != locked_file.sha256.to_lowercase() {
            return Err(format!(
                "Runtime payload file failed integrity check: {}",
                required_file
            ));
        }
    }
    Ok(())
}

fn first_payload_source(payload: &RuntimePayloadDefinition) -> Option<(PathBuf, PathBuf)> {
    runtime_payload_roots()
        .into_iter()
        .filter_map(|root| {
            let source = root.join(payload.source_dir.replace('/', "\\"));
            source.is_dir().then_some((root, source))
        })
        .next()
}

fn install_runtime_payloads(payloads: &[&RuntimePayloadDefinition]) -> Result<Vec<String>, String> {
    let mut missing = Vec::new();
    for payload in payloads {
        let destination = payload_destination(payload);
        if payload_required_files_present(payload) {
            if let Some((payload_root, _)) = first_payload_source(payload) {
                if verify_payload_files_against_lock(payload, &payload_root, &destination).is_ok() {
                    continue;
                }
            } else {
                continue;
            }
        }
        let Some((payload_root, source)) = first_payload_source(payload) else {
            missing.push(format!("{} ({})", payload.label, payload.id));
            continue;
        };
        if let Err(error) = verify_payload_files_against_lock(payload, &payload_root, &source) {
            missing.push(format!(
                "{} ({}) source payload integrity check failed: {}",
                payload.label, payload.id, error
            ));
            continue;
        }
        copy_path_recursive(&source, &destination)?;
        if !payload_required_files_present(payload) {
            missing.push(format!("{} ({})", payload.label, payload.id));
            continue;
        }
        if let Err(error) = verify_payload_files_against_lock(payload, &payload_root, &destination)
        {
            missing.push(format!(
                "{} ({}) copied payload integrity check failed: {}",
                payload.label, payload.id, error
            ));
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
    let files = collect_backup_files(&destination)?;

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
        file_count: files.len(),
        files,
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

fn verified_backup_manifest(source: &Path) -> Result<BackupManifest, String> {
    let manifest_path = source.join("backup-manifest.json");
    let contents = fs::read_to_string(&manifest_path)
        .map_err(|error| format!("Could not read {}: {error}", manifest_path.display()))?;
    let manifest: BackupManifest = serde_json::from_str(&contents)
        .map_err(|error| format!("Could not parse backup manifest: {error}"))?;
    if manifest.schema_version != 1 {
        return Err(format!(
            "unsupported backup manifest schema {}",
            manifest.schema_version
        ));
    }
    let actual_files = collect_backup_files(source)?;
    if manifest.file_count != manifest.files.len() {
        return Err("backup manifest file count does not match its file list".to_string());
    }
    if manifest.file_count != actual_files.len() || manifest.files != actual_files {
        return Err("backup files do not match the recorded SHA-256 manifest".to_string());
    }
    Ok(manifest)
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

fn postgres_data_dir() -> PathBuf {
    data_root().join("postgres")
}

fn postgres_binary(service: &ServiceDefinition, file_name: &str) -> Result<PathBuf, String> {
    let Some(bin_dir) = service_binary_path(service).parent().map(Path::to_path_buf) else {
        return Err(format!(
            "Could not resolve local data store binary folder for {}.",
            service.label
        ));
    };
    Ok(bin_dir.join(file_name))
}

fn command_output(command: &mut Command, label: &str) -> Result<String, String> {
    let output = command
        .output()
        .map_err(|error| format!("{label} could not start: {error}"))?;
    let stdout = String::from_utf8_lossy(&output.stdout).trim().to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
    if output.status.success() {
        return Ok(stdout);
    }
    let detail = [stdout.as_str(), stderr.as_str()]
        .into_iter()
        .filter(|part| !part.is_empty())
        .collect::<Vec<_>>()
        .join("; ");
    Err(if detail.is_empty() {
        format!("{label} failed with status {}.", output.status)
    } else {
        format!("{label} failed with status {}: {detail}", output.status)
    })
}

fn command_status(command: &mut Command, label: &str) -> Result<(), String> {
    let status = command
        .status()
        .map_err(|error| format!("{label} could not start: {error}"))?;
    if status.success() {
        Ok(())
    } else {
        Err(format!("{label} failed with status {status}."))
    }
}

fn ensure_postgres_initialized(service: &ServiceDefinition) -> Result<(), String> {
    let data_dir = postgres_data_dir();
    if data_dir.join("PG_VERSION").is_file() {
        return Ok(());
    }
    if data_dir.exists() {
        let mut entries = fs::read_dir(&data_dir)
            .map_err(|error| format!("Could not inspect local data store folder: {error}"))?;
        if entries.next().is_some() {
            return Err(format!(
                "The local data store folder {} exists but is not initialized. Use repair after backing up this profile.",
                data_dir.display()
            ));
        }
    } else {
        fs::create_dir_all(&data_dir)
            .map_err(|error| format!("Could not create local data store folder: {error}"))?;
    }

    let _ = postgres_password()?;
    let password_file = secrets_dir().join("postgres-password.txt");

    let initdb = postgres_binary(service, "initdb.exe")?;
    if !initdb.is_file() {
        return Err(format!(
            "Local data store initializer is missing: {}",
            initdb.display()
        ));
    }
    command_output(
        Command::new(initdb)
            .arg("-D")
            .arg(&data_dir)
            .arg("--username")
            .arg(LOCAL_DB_USER)
            .arg("--pwfile")
            .arg(&password_file)
            .arg("--auth-host")
            .arg("scram-sha-256")
            .arg("--auth-local")
            .arg("trust")
            .arg("--encoding")
            .arg("UTF8"),
        "Local data store initialization",
    )?;

    fs::write(
        data_dir.join("postgresql.auto.conf"),
        format!(
            "# CivicSuite Windows local runtime\nlisten_addresses = '127.0.0.1'\nport = {LOCAL_DB_PORT}\n"
        ),
    )
    .map_err(|error| format!("Could not write local data store configuration: {error}"))?;
    Ok(())
}

fn postgres_tcp_ready() -> bool {
    tcp_health_ok("127.0.0.1", LOCAL_DB_PORT)
}

fn run_postgres_with_password(
    service: &ServiceDefinition,
    binary_name: &str,
    args: &[&str],
    label: &str,
) -> Result<String, String> {
    let password = postgres_password()?;
    let binary = postgres_binary(service, binary_name)?;
    if !binary.is_file() {
        return Err(format!(
            "Local data store tool is missing: {}",
            binary.display()
        ));
    }
    let mut command = Command::new(binary);
    command.env("PGPASSWORD", password);
    for arg in args {
        command.arg(arg);
    }
    command_output(&mut command, label)
}

fn ensure_postgres_database(service: &ServiceDefinition) -> Result<(), String> {
    let port = LOCAL_DB_PORT.to_string();
    let existing = run_postgres_with_password(
        service,
        "psql.exe",
        &[
            "-h",
            "127.0.0.1",
            "-p",
            port.as_str(),
            "-U",
            LOCAL_DB_USER,
            "-d",
            "postgres",
            "-At",
            "-c",
            "SELECT 1 FROM pg_database WHERE datname = 'civicsuite';",
        ],
        "Local data store database check",
    )?;
    if existing.trim() != "1" {
        run_postgres_with_password(
            service,
            "createdb.exe",
            &[
                "-h",
                "127.0.0.1",
                "-p",
                port.as_str(),
                "-U",
                LOCAL_DB_USER,
                LOCAL_DB_NAME,
            ],
            "Local data store database creation",
        )?;
    }
    run_postgres_with_password(
        service,
        "psql.exe",
        &[
            "-h",
            "127.0.0.1",
            "-p",
            port.as_str(),
            "-U",
            LOCAL_DB_USER,
            "-d",
            LOCAL_DB_NAME,
            "-v",
            "ON_ERROR_STOP=1",
            "-c",
            "CREATE EXTENSION IF NOT EXISTS vector;",
        ],
        "Local data store extension setup",
    )?;
    Ok(())
}

fn run_python_migrations() -> Result<(), String> {
    let python = runtime_root()
        .join("runtime")
        .join("python")
        .join("python.exe");
    if !python.is_file() {
        return Ok(());
    }
    let mut command = Command::new(python);
    for (name, value) in service_environment(&ServiceDefinition {
        id: "python-services".to_string(),
        label: "City workflow services".to_string(),
        admin_label: "Bundled CPython module services".to_string(),
        kind: "python-services".to_string(),
        required: true,
        binary: "runtime/python/python.exe".to_string(),
        args: Vec::new(),
        health: HealthDefinition::Supervisor {
            service: "python-services".to_string(),
        },
        log_path: "{data_dir}/logs/python-services.log".to_string(),
        next_action: String::new(),
    })? {
        command.env(name, value);
    }
    command.arg("-m").arg("civicsuite_runtime.migrate");
    command_output(&mut command, "City-core database migrations")?;
    Ok(())
}

fn start_postgres_service(service: &ServiceDefinition) -> Result<(), String> {
    ensure_postgres_initialized(service)?;
    if !postgres_tcp_ready() {
        let binary = service_binary_path(service);
        command_status(
            Command::new(binary)
                .args(service_arg_values(service))
                .stdout(Stdio::null())
                .stderr(Stdio::null()),
            "Local data store start",
        )?;
        for _ in 0..40 {
            if postgres_tcp_ready() {
                break;
            }
            thread::sleep(Duration::from_millis(500));
        }
        if !postgres_tcp_ready() {
            return Err("Local data store did not become ready on localhost.".to_string());
        }
    }
    ensure_postgres_database(service)?;
    run_python_migrations()?;
    Ok(())
}

fn service_environment(service: &ServiceDefinition) -> Result<Vec<(String, String)>, String> {
    let data = data_root();
    let db_url = local_database_url("postgresql+asyncpg")?;
    let mut env = vec![
        (
            "CIVICSUITE_DATA_DIR".to_string(),
            data.to_string_lossy().to_string(),
        ),
        (
            "CIVICSUITE_FILE_STORAGE_DIR".to_string(),
            data.join("files").to_string_lossy().to_string(),
        ),
        ("DATABASE_URL".to_string(), db_url.to_string()),
        ("PORTAL_MODE".to_string(), "private".to_string()),
        (
            "OLLAMA_BASE_URL".to_string(),
            "http://127.0.0.1:15434".to_string(),
        ),
        (
            "CIVICCLERK_OLLAMA_BASE_URL".to_string(),
            "http://127.0.0.1:15434".to_string(),
        ),
        ("CIVICCODE_AI_MODE".to_string(), "ollama".to_string()),
        (
            "CIVICCODE_OLLAMA_URL".to_string(),
            "http://127.0.0.1:15434".to_string(),
        ),
        (
            "CIVICCODE_OLLAMA_MODEL".to_string(),
            crate::model::pinned_runtime_model()?,
        ),
        (
            "LLM_MODEL".to_string(),
            crate::model::pinned_runtime_model()?,
        ),
        ("CIVICCORE_LLM_PROVIDER".to_string(), "ollama".to_string()),
    ];
    if service.kind.contains("python") || service.binary.ends_with("python.exe") {
        env.push(("PYTHONNOUSERSITE".to_string(), "1".to_string()));
    }
    if service.id == "model-runtime" {
        env.push(("OLLAMA_HOST".to_string(), "127.0.0.1:15434".to_string()));
    }
    Ok(env)
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
    http_get_response(endpoint)
        .map(|(status_code, _)| (200..300).contains(&status_code))
        .unwrap_or(false)
}

fn http_get_response(endpoint: &str) -> Option<(u16, String)> {
    let Some(rest) = endpoint.strip_prefix("http://") else {
        return None;
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
        Err(_) => return None,
    };
    let _ = stream.set_read_timeout(Some(Duration::from_millis(500)));
    let request = format!("GET {path} HTTP/1.1\r\nHost: {host_port}\r\nConnection: close\r\n\r\n");
    if stream.write_all(request.as_bytes()).is_err() {
        return None;
    }
    let mut response = String::new();
    if stream.read_to_string(&mut response).is_err() {
        return None;
    }
    let status_code = response
        .lines()
        .next()
        .and_then(|line| line.split_whitespace().nth(1))
        .and_then(|code| code.parse::<u16>().ok())?;
    let body = response
        .split_once("\r\n\r\n")
        .map(|(_, body)| body.to_string())
        .unwrap_or_default();
    Some((status_code, body))
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
        actionable: true,
    }
}

fn local_folder_health(
    id: &str,
    label: &str,
    path: PathBuf,
    missing_action: &str,
    permission_action: &str,
) -> RuntimeHealthItem {
    let exists = path.is_dir();
    let write_probe = if exists {
        folder_write_probe(&path)
    } else {
        Err("folder is missing".to_string())
    };
    let ok = exists && write_probe.is_ok();
    let (status, message, next_action) = if ok {
        (
            "OK",
            format!("{label} is available and writable on this Windows profile."),
            "Continue local setup.".to_string(),
        )
    } else if exists {
        (
            "Needs access",
            format!("{label} exists, but CivicSuite cannot save files there."),
            permission_action.to_string(),
        )
    } else {
        (
            "Needs setup",
            format!("{label} has not been created yet."),
            missing_action.to_string(),
        )
    };
    let write_check = match &write_probe {
        Ok(()) => "ok".to_string(),
        Err(error) => error.clone(),
    };

    RuntimeHealthItem {
        id: id.to_string(),
        label: label.to_string(),
        ok,
        status,
        message,
        next_action,
        admin_detail: format!(
            "kind local-folder; path {}; exists {}; writable {}; write_check {}",
            path.display(),
            exists,
            write_probe.is_ok(),
            write_check
        ),
        actionable: false,
    }
}

fn task_queue_schema_unreachable_health(endpoint: &str) -> RuntimeHealthItem {
    RuntimeHealthItem {
        id: "task-queue-schema".to_string(),
        label: "Task queue schema".to_string(),
        ok: false,
        status: "Needs services",
        message: "City workflow services are not running yet, so CivicSuite cannot verify the PostgreSQL task queue schema.".to_string(),
        next_action: "Start or repair City workflow services after the local data store is installed.".to_string(),
        admin_detail: format!("kind postgres-task-queue-schema; endpoint {endpoint}; http_status none"),
        actionable: false,
    }
}

fn task_queue_schema_health_from_response(
    endpoint: &str,
    http_status: u16,
    body: &str,
) -> RuntimeHealthItem {
    let parsed = serde_json::from_str::<serde_json::Value>(body).ok();
    let database = parsed.as_ref().and_then(|value| value.get("database"));
    let ok = database
        .and_then(|value| value.get("ok"))
        .and_then(|value| value.as_bool())
        .unwrap_or(false);
    let database_status = database
        .and_then(|value| value.get("status"))
        .and_then(|value| value.as_str())
        .unwrap_or("unknown");
    let detail_message = database
        .and_then(|value| value.get("message"))
        .and_then(|value| value.as_str())
        .unwrap_or("City workflow services did not report database queue schema detail.");
    let (status, next_action) = if ok {
        ("OK", "Continue local setup.")
    } else {
        match database_status {
            "migrations-needed" => (
                "Needs migrations",
                "Run Install or Repair for City workflow services after the local data store is ready.",
            ),
            "missing" => (
                "Needs configuration",
                "Repair City workflow services so they receive the local database connection.",
            ),
            "unavailable" => (
                "Needs data store",
                "Start or repair the Local data store, then check City workflow services again.",
            ),
            _ => (
                "Needs attention",
                "Check City workflow services and repair the local runtime if the status does not clear.",
            ),
        }
    };

    RuntimeHealthItem {
        id: "task-queue-schema".to_string(),
        label: "Task queue schema".to_string(),
        ok,
        status,
        message: detail_message.to_string(),
        next_action: next_action.to_string(),
        admin_detail: format!(
            "kind postgres-task-queue-schema; endpoint {endpoint}; http_status {http_status}; database_status {database_status}"
        ),
        actionable: false,
    }
}

fn task_queue_schema_health(manifest: &RuntimeManifest) -> Option<RuntimeHealthItem> {
    let endpoint = manifest.services.iter().find_map(|service| {
        if service.id == "python-services" {
            if let HealthDefinition::Http { endpoint } = &service.health {
                return Some(endpoint.as_str());
            }
        }
        None
    })?;
    Some(
        http_get_response(endpoint)
            .map(|(status_code, body)| {
                task_queue_schema_health_from_response(endpoint, status_code, &body)
            })
            .unwrap_or_else(|| task_queue_schema_unreachable_health(endpoint)),
    )
}

fn folder_write_probe(path: &Path) -> Result<(), String> {
    let check_path = path.join(format!(
        ".civicsuite-health-check-{}-{}.tmp",
        std::process::id(),
        now_unix_seconds()
    ));
    let mut file = OpenOptions::new()
        .write(true)
        .create_new(true)
        .open(&check_path)
        .map_err(|error| format!("could not create temporary write check: {error}"))?;
    if let Err(error) = file.write_all(b"CivicSuite local folder health check\n") {
        let _ = fs::remove_file(&check_path);
        return Err(format!("could not write temporary check file: {error}"));
    }
    drop(file);
    fs::remove_file(&check_path)
        .map_err(|error| format!("could not remove temporary write check: {error}"))?;
    Ok(())
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
        actionable: false,
    }];
    health.push(local_folder_health(
        "local-data-folder",
        "City data folder",
        data_root(),
        "Use First Run or Repair to create the city data folder.",
        "Choose another city data folder in Settings or ask IT to grant write access.",
    ));
    health.push(local_folder_health(
        "backup-folder",
        "Backup folder",
        backup_root(),
        "Use First Run or Backup Now to create the backup folder.",
        "Choose another backup folder in Settings or ask IT to grant write access.",
    ));
    if let Some(queue_health) = task_queue_schema_health(&manifest) {
        health.push(queue_health);
    }
    health.extend(
        manifest
            .services
            .iter()
            .map(|service| service_health(service, &state)),
    );
    Ok(health)
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
    fs::create_dir_all(backup_root())
        .map_err(|error| format!("Could not create local backup folder: {error}"))?;
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
        if probe_service_health(service, &state) {
            let existing_pid = service_state(&state, service).and_then(|entry| entry.pid);
            update_service_state(&mut state, &service.id, true, existing_pid, "start");
            started.push(service.label.clone());
            continue;
        }
        if service.id == "postgres" {
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
            start_postgres_service(service)?;
            update_service_state(&mut state, &service.id, true, None, "start");
            started.push(service.label.clone());
            continue;
        }
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
            .envs(service_environment(service)?)
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
            "Started or verified local runtime service state for {}.",
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
        if service.id == "postgres" {
            if postgres_tcp_ready() {
                let binary = service_binary_path(service);
                if binary.is_file() {
                    let _ = command_status(
                        Command::new(binary)
                            .arg("stop")
                            .arg("-D")
                            .arg(postgres_data_dir())
                            .arg("-m")
                            .arg("fast")
                            .arg("-w")
                            .stdout(Stdio::null())
                            .stderr(Stdio::null()),
                        "Local data store stop",
                    );
                }
            }
            update_service_state(&mut state, &service.id, true, None, "stop");
            stopped.push(service.label.clone());
            continue;
        }
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

fn prepare_log_artifacts(services: &[&ServiceDefinition]) -> Result<PathBuf, String> {
    let logs_dir = data_root().join("logs");
    fs::create_dir_all(&logs_dir).map_err(|error| {
        format!(
            "Could not create logs folder {}: {error}",
            logs_dir.display()
        )
    })?;
    let mut service_lines = Vec::new();
    for service in services {
        ensure_runtime_dirs(service)?;
        let log_path = service_log_path(service);
        if let Some(parent) = log_path.parent() {
            fs::create_dir_all(parent)
                .map_err(|error| format!("Could not create {}: {error}", parent.display()))?;
        }
        if !log_path.is_file() {
            fs::write(
                &log_path,
                format!(
                    "{} log file prepared by CivicSuite System Health.\nService id: {}\n",
                    service.label, service.id
                ),
            )
            .map_err(|error| format!("Could not prepare {}: {error}", log_path.display()))?;
        }
        service_lines.push(format!(
            "- {} (`{}`): {}",
            service.label,
            service.id,
            log_path
                .file_name()
                .map(|name| name.to_string_lossy().to_string())
                .unwrap_or_else(|| log_path.display().to_string())
        ));
    }
    let readme = format!(
        "CivicSuite Local Logs\n\nThis folder is stored inside the selected city data folder.\nUse these files when IT or CivicSuite support asks for local runtime evidence.\n\nSelected service logs:\n{}\n\nCity data folder:\n{}\n",
        service_lines.join("\n"),
        data_root().display()
    );
    fs::write(logs_dir.join("README.txt"), readme)
        .map_err(|error| format!("Could not write logs README: {error}"))?;
    Ok(logs_dir)
}

fn log_action(services: &[&ServiceDefinition]) -> Result<SupervisorActionResult, String> {
    let logs_dir = prepare_log_artifacts(services)?;
    crate::local_shell::open_local_folder(&logs_dir)?;
    Ok(SupervisorActionResult {
        accepted: true,
        action: "logs".to_string(),
        service_id: services.first().map(|service| service.id.clone()),
        status: "Logs folder open",
        message: format!(
            "Prepared and opened the CivicSuite logs folder under the selected city data folder: {}.",
            logs_dir.display()
        ),
        next_action: "Share README.txt and the relevant service log with IT or CivicSuite support."
            .to_string(),
    })
}

fn create_support_bundle(services: &[&ServiceDefinition]) -> Result<PathBuf, String> {
    let created = now_unix_seconds();
    let bundle_root = support_bundle_root();
    fs::create_dir_all(&bundle_root).map_err(|error| {
        format!(
            "Could not create support bundle folder {}: {error}",
            bundle_root.display()
        )
    })?;
    let destination = bundle_root.join(format!(
        "civicsuite-support-bundle-{created}-{}",
        std::process::id()
    ));
    fs::create_dir_all(&destination).map_err(|error| {
        format!(
            "Could not create support bundle {}: {error}",
            destination.display()
        )
    })?;

    let _ = prepare_log_artifacts(services)?;
    let bundle_logs = destination.join("logs");
    fs::create_dir_all(&bundle_logs).map_err(|error| {
        format!(
            "Could not create support bundle logs folder {}: {error}",
            bundle_logs.display()
        )
    })?;
    for service in services {
        let source = service_log_path(service);
        if source.is_file() {
            let file_name = source
                .file_name()
                .ok_or_else(|| format!("Could not name service log {}", source.display()))?;
            fs::copy(&source, bundle_logs.join(file_name)).map_err(|error| {
                format!(
                    "Could not copy service log {} into support bundle: {error}",
                    source.display()
                )
            })?;
        }
    }

    let health = runtime_health()?;
    fs::write(
        destination.join("health-summary.json"),
        format!(
            "{}\n",
            serde_json::to_string_pretty(&health)
                .map_err(|error| format!("Could not serialize health summary: {error}"))?
        ),
    )
    .map_err(|error| format!("Could not write support bundle health summary: {error}"))?;

    fs::write(
        destination.join("runtime-state.json"),
        format!(
            "{}\n",
            serde_json::to_string_pretty(&read_state()?)
                .map_err(|error| format!("Could not serialize runtime state: {error}"))?
        ),
    )
    .map_err(|error| format!("Could not write support bundle runtime state: {error}"))?;

    let selected_services = services
        .iter()
        .map(|service| format!("{} ({})", service.label, service.id))
        .collect::<Vec<_>>();
    let readme = format!(
        "CivicSuite Support Bundle\n\nThis local package contains health, runtime-state, and selected service logs for CivicSuite support or local IT.\nIt does not copy city records, uploaded documents, backup contents, or local secrets.\n\nSelected services:\n{}\n\nCity data folder:\n{}\nBackup folder:\n{}\n\nShare this support bundle folder only with trusted CivicSuite support or city IT.\n",
        selected_services.join("\n"),
        data_root().display(),
        backup_root().display()
    );
    fs::write(destination.join("README.txt"), readme)
        .map_err(|error| format!("Could not write support bundle README: {error}"))?;

    let files = collect_backup_files(&destination)?;
    let manifest = SupportBundleManifest {
        schema_version: 1,
        kind: "support-bundle".to_string(),
        created_unix_seconds: created,
        source_root: civic_suite_root().display().to_string(),
        data_source: data_root().display().to_string(),
        backup_root: backup_root().display().to_string(),
        selected_services: services.iter().map(|service| service.id.clone()).collect(),
        file_count: files.len(),
        files,
    };
    fs::write(
        destination.join("support-manifest.json"),
        format!(
            "{}\n",
            serde_json::to_string_pretty(&manifest)
                .map_err(|error| format!("Could not serialize support manifest: {error}"))?
        ),
    )
    .map_err(|error| format!("Could not write support bundle manifest: {error}"))?;

    Ok(destination)
}

fn support_bundle_action(
    services: &[&ServiceDefinition],
) -> Result<SupervisorActionResult, String> {
    let bundle = create_support_bundle(services)?;
    crate::local_shell::open_local_folder(&bundle)?;
    Ok(SupervisorActionResult {
        accepted: true,
        action: "support-bundle".to_string(),
        service_id: if services.len() == 1 {
            services.first().map(|service| service.id.clone())
        } else {
            None
        },
        status: "Support bundle ready",
        message: format!(
            "Created and opened a CivicSuite support bundle with health, runtime-state, and selected service logs: {}.",
            bundle.display()
        ),
        next_action: "Share README.txt and support-manifest.json only with trusted CivicSuite support or city IT."
            .to_string(),
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

fn wait_for_services_health(services: &[&ServiceDefinition]) -> Result<(), String> {
    for _ in 0..40 {
        let state = read_state()?;
        if services
            .iter()
            .filter(|service| service.required)
            .all(|service| probe_service_health(service, &state))
        {
            return Ok(());
        }
        thread::sleep(Duration::from_millis(500));
    }
    Ok(())
}

pub(crate) fn bootstrap_required_runtime() -> Result<SupervisorActionResult, String> {
    let manifest = parse_manifest()?;
    validate_manifest(&manifest)?;
    let services = target_services(&manifest, None)?;

    let install = install_or_repair("install", &manifest, &services)?;
    if !install.accepted {
        return Ok(SupervisorActionResult {
            accepted: false,
            action: "bootstrap".to_string(),
            service_id: None,
            status: install.status,
            message: format!(
                "CivicSuite could not prepare the required local runtime files. {}",
                install.message
            ),
            next_action: install.next_action,
        });
    }

    let start = start_services(&services)?;
    if !start.accepted {
        return Ok(SupervisorActionResult {
            accepted: false,
            action: "bootstrap".to_string(),
            service_id: start.service_id,
            status: start.status,
            message: format!(
                "CivicSuite prepared the runtime files, but a required service did not start. {}",
                start.message
            ),
            next_action: start.next_action,
        });
    }

    wait_for_services_health(&services)?;
    let health = health_action(None)?;
    if !health.accepted {
        return Ok(SupervisorActionResult {
            accepted: false,
            action: "bootstrap".to_string(),
            service_id: None,
            status: health.status,
            message: format!(
                "CivicSuite started local services, but health verification is not complete. {}",
                health.message
            ),
            next_action: health.next_action,
        });
    }

    Ok(SupervisorActionResult {
        accepted: true,
        action: "bootstrap".to_string(),
        service_id: None,
        status: "Ready",
        message: "CivicSuite prepared, started, and verified the required local runtime services."
            .to_string(),
        next_action: "Finish first-run setup and begin local city work.".to_string(),
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

fn open_backup_folder_action() -> Result<SupervisorActionResult, String> {
    let path = backup_root();
    crate::local_shell::open_local_folder(&path)?;
    Ok(SupervisorActionResult {
        accepted: true,
        action: "open-backup-folder".to_string(),
        service_id: None,
        status: "Backup folder open",
        message: format!("Opened the CivicSuite backup folder: {}.", path.display()),
        next_action: "Use Backup Now before restore, reinstall, or uninstall work.".to_string(),
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
    let manifest = match verified_backup_manifest(&source) {
        Ok(manifest) => manifest,
        Err(error) => {
            return Ok(SupervisorActionResult {
                accepted: false,
                action: "restore".to_string(),
                service_id: None,
                status: "Backup verification failed",
                message: format!(
                    "CivicSuite did not restore from {} because backup verification failed: {error}.",
                    source.display()
                ),
                next_action: "Use another backup or create a fresh verified backup before retrying restore."
                    .to_string(),
            });
        }
    };
    if !manifest.contains_data && !manifest.contains_config {
        return Ok(SupervisorActionResult {
            accepted: false,
            action: "restore".to_string(),
            service_id: None,
            status: "Backup has no data",
            message: format!(
                "CivicSuite did not restore from {} because that backup contains no local data or setup/config files.",
                source.display()
            ),
            next_action:
                "Choose a backup that contains city data or setup/config before retrying restore."
                    .to_string(),
        });
    }
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
        next_action: "Choose Open Windows Uninstall, find CivicSuite in Installed apps, and uninstall it. Reinstall can restore from the final backup.".to_string(),
    })
}

fn open_windows_uninstall_action() -> Result<SupervisorActionResult, String> {
    crate::local_shell::open_windows_uninstall_settings()?;
    Ok(SupervisorActionResult {
        accepted: true,
        action: "open-windows-uninstall".to_string(),
        service_id: None,
        status: "Windows uninstall opened",
        message: "Opened Windows Installed apps so CivicSuite program files can be removed through the normal Windows uninstall entry.".to_string(),
        next_action: "Find CivicSuite in Installed apps and choose Uninstall. Keep the final-uninstall backup if staff may reinstall later.".to_string(),
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
        "support-bundle" => support_bundle_action(&services),
        "backup" => backup_action(),
        "open-backup-folder" => open_backup_folder_action(),
        "restore" => restore_action(&services),
        "uninstall" => uninstall_action(&services),
        "open-windows-uninstall" => open_windows_uninstall_action(),
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

    fn write_test_payload_lock(
        payload_root: &Path,
        payload_id: &str,
        label: &str,
        source_dir: &str,
        required_files: &[&str],
    ) {
        let source_root = payload_root.join(source_dir);
        let files = required_files
            .iter()
            .map(|required_file| {
                let path = source_root.join(required_file.replace('/', "\\"));
                let (size_bytes, sha256) = sha256_file(&path).expect("test payload hash");
                serde_json::json!({
                    "path": required_file,
                    "size_bytes": size_bytes,
                    "sha256": sha256
                })
            })
            .collect::<Vec<_>>();
        let lock = serde_json::json!({
            "schema_version": 1,
            "profile": "windows-local-1.0",
            "generated_at": "test",
            "payload_root": payload_root.to_string_lossy(),
            "payloads": [
                {
                    "id": payload_id,
                    "label": label,
                    "source_dir": source_dir,
                    "status": "present",
                    "required_files": files
                }
            ]
        });
        fs::write(
            payload_root.join("runtime-payload-lock.json"),
            serde_json::to_string_pretty(&lock).expect("lock serializes"),
        )
        .expect("lock writes");
    }

    fn write_test_postgres_payload(payload_root: &Path) {
        for file in [
            "bin/pg_ctl.exe",
            "bin/initdb.exe",
            "bin/postgres.exe",
            "share/extension/vector.control",
            "lib/vector.dll",
        ] {
            let path = payload_root.join("postgres").join(file.replace('/', "\\"));
            fs::create_dir_all(path.parent().expect("payload parent")).expect("payload dir");
            fs::write(path, "fake runtime file").expect("payload file");
        }
        write_test_payload_lock(
            payload_root,
            "postgres-17-pgvector",
            "Portable PostgreSQL 17 with pgvector",
            "postgres",
            &[
                "bin/pg_ctl.exe",
                "bin/initdb.exe",
                "bin/postgres.exe",
                "share/extension/vector.control",
                "lib/vector.dll",
            ],
        );
    }

    fn with_temp_state_dir_and_payload<T>(
        payload_dir: PathBuf,
        test: impl FnOnce(PathBuf) -> T,
    ) -> T {
        let _guard = crate::first_run::test_env_lock()
            .lock()
            .expect("test env lock");
        let root = env::temp_dir().join(format!(
            "civicsuite-desktop-supervisor-real-test-{}",
            std::process::id()
        ));
        let _ = fs::remove_dir_all(&root);
        env::set_var("CIVICSUITE_DESKTOP_STATE_DIR", &root);
        env::set_var("CIVICSUITE_RUNTIME_ROOT", root.join("Runtime"));
        env::set_var("CIVICSUITE_RUNTIME_PAYLOAD_DIR", &payload_dir);
        env::set_var("CIVICSUITE_BACKUP_DIR", root.join("Backups"));
        let result = test(root.clone());
        env::remove_var("CIVICSUITE_DESKTOP_STATE_DIR");
        env::remove_var("CIVICSUITE_RUNTIME_ROOT");
        env::remove_var("CIVICSUITE_RUNTIME_PAYLOAD_DIR");
        env::remove_var("CIVICSUITE_BACKUP_DIR");
        remove_payload_runtime_links(&root);
        let _ = fs::remove_dir_all(root);
        result
    }

    #[cfg(windows)]
    fn link_payload_runtime(root: &Path, payload_dir: &Path) {
        let runtime_dir = root.join("Runtime").join("runtime");
        fs::create_dir_all(&runtime_dir).expect("runtime dir");
        for payload in ["postgres", "python"] {
            let source = payload_dir.join(payload);
            assert!(
                source.is_dir(),
                "payload source exists: {}",
                source.display()
            );
            let destination = runtime_dir.join(payload);
            let _ = fs::remove_dir(&destination);
            if let Err(symlink_error) = std::os::windows::fs::symlink_dir(&source, &destination) {
                let status = Command::new("cmd")
                    .arg("/C")
                    .arg("mklink")
                    .arg("/J")
                    .arg(&destination)
                    .arg(&source)
                    .status()
                    .expect("junction fallback starts");
                assert!(
                    status.success(),
                    "payload link failed for {}: symlink error {}; junction status {}",
                    payload,
                    symlink_error,
                    status
                );
            }
        }
    }

    fn remove_payload_runtime_links(root: &Path) {
        let runtime_dir = root.join("Runtime").join("runtime");
        for payload in ["postgres", "python"] {
            let _ = fs::remove_dir(runtime_dir.join(payload));
        }
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
    fn task_queue_schema_health_reports_runtime_database_detail() {
        let ready = task_queue_schema_health_from_response(
            "http://127.0.0.1:15480/health",
            200,
            r#"{"database":{"ok":true,"status":"ready","message":"Local database and task queue schema are ready."}}"#,
        );
        assert!(ready.ok);
        assert_eq!(ready.status, "OK");
        assert!(ready.message.contains("task queue schema are ready"));
        assert!(!ready.actionable);

        let needs_migrations = task_queue_schema_health_from_response(
            "http://127.0.0.1:15480/health",
            503,
            r#"{"database":{"ok":false,"status":"migrations-needed","message":"Local database is reachable but task queue migrations are not applied."}}"#,
        );
        assert!(!needs_migrations.ok);
        assert_eq!(needs_migrations.status, "Needs migrations");
        assert!(needs_migrations
            .next_action
            .contains("Run Install or Repair"));
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
    fn service_environment_pins_city_modules_to_local_gemma_runtime_model() {
        with_temp_state_dir(|_| {
            let manifest = parse_manifest().expect("manifest parses");
            let service = manifest
                .services
                .iter()
                .find(|candidate| candidate.id == "python-services")
                .expect("python services declared");
            let env = service_environment(service).expect("service environment builds");
            assert!(env
                .iter()
                .any(|(name, value)| name == "CIVICCODE_AI_MODE" && value == "ollama"));
            assert!(env.iter().any(|(name, value)| {
                name == "CIVICCODE_OLLAMA_MODEL" && value == "civicsuite-gemma4-12b-qat:q4_0"
            }));
            assert!(env.iter().any(|(name, value)| {
                name == "LLM_MODEL" && value == "civicsuite-gemma4-12b-qat:q4_0"
            }));
        });
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
            write_test_postgres_payload(&root.join("Payload"));

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
    fn supervisor_install_rejects_tampered_runtime_payload() {
        with_temp_state_dir(|root| {
            let payload_root = root.join("Payload");
            write_test_postgres_payload(&payload_root);
            fs::write(
                payload_root.join("postgres").join("bin").join("pg_ctl.exe"),
                "tampered runtime file",
            )
            .expect("tamper payload");

            let result = supervisor_action("install", Some("postgres"))
                .expect("action response is structured");

            assert!(!result.accepted);
            assert_eq!(result.status, "Needs runtime files");
            assert!(result.message.contains("integrity check"));
            assert!(result.message.contains("bin/pg_ctl.exe"));
            assert!(!root
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
    fn runtime_health_reports_selected_local_folders() {
        with_temp_state_dir(|root| {
            let custom_data = root.join("custom-city-data");
            let custom_backups = root.join("custom-backups");
            crate::local_paths::save_locations(&crate::local_paths::LocalLocations {
                install_root: root.to_string_lossy().to_string(),
                data_root: custom_data.to_string_lossy().to_string(),
                backup_root: custom_backups.to_string_lossy().to_string(),
            })
            .expect("custom locations save");

            let initial = runtime_health().expect("health builds before folders exist");
            let data_item = initial
                .iter()
                .find(|item| item.id == "local-data-folder")
                .expect("data folder health exists");
            assert_eq!(data_item.label, "City data folder");
            assert!(!data_item.ok);
            assert!(!data_item.actionable);
            assert!(data_item.admin_detail.contains("custom-city-data"));
            assert!(data_item.admin_detail.contains("writable false"));

            supervisor_action("install", Some("file-storage")).expect("install file storage");

            let installed = runtime_health().expect("health builds after install");
            let installed_data = installed
                .iter()
                .find(|item| item.id == "local-data-folder")
                .expect("data folder health remains present");
            assert!(installed_data.ok);
            assert!(!installed_data.actionable);
            assert!(installed_data
                .admin_detail
                .contains("writable true; write_check "));
            assert!(installed.iter().any(|item| {
                item.id == "backup-folder"
                    && item.ok
                    && !item.actionable
                    && item.admin_detail.contains("custom-backups")
                    && item.admin_detail.contains("writable true")
            }));
            let leftover_checks = fs::read_dir(&custom_data)
                .expect("data dir readable")
                .filter_map(Result::ok)
                .filter(|entry| {
                    entry
                        .file_name()
                        .to_string_lossy()
                        .starts_with(".civicsuite-health-check-")
                })
                .count();
            assert_eq!(leftover_checks, 0);
        });
    }

    #[test]
    fn real_postgres_payload_initializes_and_migrates_when_enabled() {
        if env::var("CIVICSUITE_RUN_REAL_RUNTIME_TEST").ok().as_deref() != Some("1") {
            return;
        }
        let payload_dir = env::var("CIVICSUITE_RUNTIME_PAYLOAD_DIR")
            .map(PathBuf::from)
            .expect("CIVICSUITE_RUNTIME_PAYLOAD_DIR points at prepared desktop runtime payload");
        let linked_payload_dir = payload_dir.clone();
        with_temp_state_dir_and_payload(payload_dir, |root| {
            #[cfg(windows)]
            link_payload_runtime(&root, &linked_payload_dir);
            supervisor_action("install", Some("postgres")).expect("install postgres payload");
            supervisor_action("install", Some("python-services"))
                .expect("install python service payload");
            let start = supervisor_action("start", Some("postgres")).expect("start postgres");
            assert!(start.accepted);
            let python_start =
                supervisor_action("start", Some("python-services")).expect("start python services");
            assert!(python_start.accepted);
            let worker_start =
                supervisor_action("start", Some("task-queue")).expect("start task queue");
            assert!(worker_start.accepted);
            for _ in 0..40 {
                let health = runtime_health().expect("health builds");
                if health
                    .iter()
                    .any(|item| item.id == "python-services" && item.ok)
                    && health.iter().any(|item| item.id == "task-queue" && item.ok)
                {
                    break;
                }
                thread::sleep(Duration::from_millis(500));
            }
            let health = runtime_health().expect("health builds");
            assert!(health.iter().any(|item| item.id == "postgres" && item.ok));
            assert!(health
                .iter()
                .any(|item| item.id == "python-services" && item.ok));
            assert!(health.iter().any(|item| item.id == "task-queue" && item.ok));
            supervisor_action("stop", Some("task-queue")).expect("stop task queue");
            supervisor_action("stop", Some("python-services")).expect("stop python services");
            supervisor_action("stop", Some("postgres")).expect("stop postgres");
        });
    }

    #[test]
    fn backup_copies_local_data_and_config() {
        with_temp_state_dir(|root| {
            fs::create_dir_all(root.join("Data").join("files")).expect("data folder");
            fs::write(root.join("Data").join("files").join("record.txt"), "agenda")
                .expect("data file");
            fs::create_dir_all(root.join("Data").join("workflows")).expect("workflow folder");
            fs::write(
                root.join("Data").join("workflows").join("city-work.json"),
                r#"{"meetings":[{"id":"meeting-1","title":"Council"}]}"#,
            )
            .expect("workflow state");
            fs::create_dir_all(root.join("Data").join("exports").join("meetings"))
                .expect("exports folder");
            fs::write(
                root.join("Data")
                    .join("exports")
                    .join("meetings")
                    .join("packet.md"),
                "meeting packet",
            )
            .expect("export file");
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
            assert!(backup
                .join("Data")
                .join("workflows")
                .join("city-work.json")
                .is_file());
            assert!(backup
                .join("Data")
                .join("exports")
                .join("meetings")
                .join("packet.md")
                .is_file());
            assert!(backup.join("config").join("city.json").is_file());
            assert!(backup.join("backup-manifest.json").is_file());
            let manifest =
                verified_backup_manifest(&backup).expect("backup hash manifest verifies");
            assert_eq!(manifest.file_count, manifest.files.len());
            assert!(manifest.files.iter().any(|file| {
                file.path == "Data/files/record.txt"
                    && file.size_bytes == "agenda".len() as u64
                    && file.sha256.len() == 64
            }));
            assert!(manifest.files.iter().any(|file| {
                file.path == "Data/workflows/city-work.json" && file.sha256.len() == 64
            }));
            assert!(manifest.files.iter().any(|file| {
                file.path == "Data/exports/meetings/packet.md" && file.sha256.len() == 64
            }));
            assert!(manifest
                .files
                .iter()
                .any(|file| { file.path == "config/city.json" && file.sha256.len() == 64 }));
        });
    }

    #[test]
    fn open_backup_folder_creates_and_opens_backup_root() {
        with_temp_state_dir(|root| {
            let result = supervisor_action("open-backup-folder", None).expect("action response");

            assert!(result.accepted);
            assert_eq!(result.status, "Backup folder open");
            assert!(root.join("Backups").is_dir());
        });
    }

    #[test]
    fn logs_action_prepares_selected_logs_folder() {
        with_temp_state_dir(|root| {
            let custom_data = root.join("selected-city-data");
            let custom_backups = root.join("selected-backups");
            crate::local_paths::save_locations(&crate::local_paths::LocalLocations {
                install_root: root.to_string_lossy().to_string(),
                data_root: custom_data.to_string_lossy().to_string(),
                backup_root: custom_backups.to_string_lossy().to_string(),
            })
            .expect("custom locations save");

            let result = supervisor_action("logs", Some("postgres")).expect("logs action");

            assert!(result.accepted);
            assert_eq!(result.status, "Logs folder open");
            assert!(result.message.contains("selected-city-data"));
            assert!(result.next_action.contains("README.txt"));
            let logs = custom_data.join("logs");
            assert!(logs.join("README.txt").is_file());
            assert!(logs.join("postgres.log").is_file());
            let readme = fs::read_to_string(logs.join("README.txt")).expect("readme");
            assert!(readme.contains("CivicSuite Local Logs"));
            assert!(readme.contains("Local data store"));
            assert!(readme.contains("postgres.log"));
        });
    }

    #[test]
    fn support_bundle_action_packages_selected_runtime_evidence() {
        with_temp_state_dir(|root| {
            let custom_data = root.join("selected-city-data");
            let custom_backups = root.join("selected-backups");
            crate::local_paths::save_locations(&crate::local_paths::LocalLocations {
                install_root: root.to_string_lossy().to_string(),
                data_root: custom_data.to_string_lossy().to_string(),
                backup_root: custom_backups.to_string_lossy().to_string(),
            })
            .expect("custom locations save");

            let result =
                supervisor_action("support-bundle", Some("postgres")).expect("support bundle");

            assert!(result.accepted);
            assert_eq!(result.status, "Support bundle ready");
            assert_eq!(result.service_id.as_deref(), Some("postgres"));
            assert!(result.message.contains("support-bundles"));
            assert!(result.next_action.contains("support-manifest.json"));

            let bundle_root = custom_backups.join("support-bundles");
            let mut bundles = fs::read_dir(&bundle_root)
                .expect("support bundle folder")
                .collect::<Result<Vec<_>, _>>()
                .expect("support bundle entries");
            bundles.sort_by_key(|entry| entry.path());
            assert_eq!(bundles.len(), 1);
            let bundle = bundles[0].path();

            assert!(bundle.join("README.txt").is_file());
            assert!(bundle.join("health-summary.json").is_file());
            assert!(bundle.join("runtime-state.json").is_file());
            assert!(bundle.join("support-manifest.json").is_file());
            assert!(bundle.join("logs").join("postgres.log").is_file());
            assert!(!bundle.join("Data").exists());
            assert!(!bundle.join("config").exists());

            let readme = fs::read_to_string(bundle.join("README.txt")).expect("readme");
            assert!(readme.contains("CivicSuite Support Bundle"));
            assert!(readme.contains("does not copy city records"));
            assert!(readme.contains("Local data store (postgres)"));

            let manifest: serde_json::Value = serde_json::from_str(
                &fs::read_to_string(bundle.join("support-manifest.json")).expect("manifest"),
            )
            .expect("support manifest json");
            assert_eq!(manifest["kind"], "support-bundle");
            assert_eq!(manifest["selected_services"][0], "postgres");
            let files = manifest["files"].as_array().expect("manifest files");
            assert!(files.iter().any(|file| file["path"] == "README.txt"));
            assert!(files
                .iter()
                .any(|file| file["path"] == "health-summary.json"));
            assert!(files
                .iter()
                .any(|file| file["path"] == "runtime-state.json"));
            assert!(files.iter().any(|file| {
                file["path"] == "logs/postgres.log"
                    && file["sha256"].as_str().map(|value| value.len()) == Some(64)
            }));
        });
    }

    #[test]
    fn restore_replaces_profile_from_latest_backup() {
        with_temp_state_dir(|root| {
            fs::create_dir_all(root.join("Data").join("files")).expect("data folder");
            fs::write(root.join("Data").join("files").join("record.txt"), "before")
                .expect("data file");
            fs::create_dir_all(root.join("Data").join("workflows")).expect("workflow folder");
            fs::write(
                root.join("Data").join("workflows").join("city-work.json"),
                r#"{"records_requests":[{"id":"records-1","status":"released"}]}"#,
            )
            .expect("workflow state");
            fs::create_dir_all(root.join("Data").join("exports").join("records"))
                .expect("exports folder");
            fs::write(
                root.join("Data")
                    .join("exports")
                    .join("records")
                    .join("response.md"),
                "released response",
            )
            .expect("export file");
            fs::create_dir_all(root.join("config")).expect("config folder");
            fs::write(root.join("config").join("city.json"), "before").expect("config file");
            supervisor_action("backup", None).expect("backup response");

            fs::write(root.join("Data").join("files").join("record.txt"), "after")
                .expect("mutate data");
            fs::write(
                root.join("Data").join("workflows").join("city-work.json"),
                r#"{"records_requests":[]}"#,
            )
            .expect("mutate workflow state");
            fs::remove_file(
                root.join("Data")
                    .join("exports")
                    .join("records")
                    .join("response.md"),
            )
            .expect("remove export");
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
            assert!(
                fs::read_to_string(root.join("Data").join("workflows").join("city-work.json"))
                    .expect("restored workflow state")
                    .contains("released")
            );
            assert!(root
                .join("Data")
                .join("exports")
                .join("records")
                .join("response.md")
                .is_file());
            assert!(root
                .join("Backups")
                .read_dir()
                .expect("backups")
                .filter_map(Result::ok)
                .any(|entry| entry.file_name().to_string_lossy().contains("pre-restore")));
        });
    }

    #[test]
    fn restore_refuses_tampered_backup_manifest() {
        with_temp_state_dir(|root| {
            fs::create_dir_all(root.join("Data").join("files")).expect("data folder");
            fs::write(root.join("Data").join("files").join("record.txt"), "before")
                .expect("data file");
            fs::create_dir_all(root.join("config")).expect("config folder");
            fs::write(root.join("config").join("city.json"), "before").expect("config file");
            supervisor_action("backup", None).expect("backup response");
            let backup = latest_backup_dir()
                .expect("latest backup lookup")
                .expect("backup exists");
            fs::write(
                backup.join("Data").join("files").join("record.txt"),
                "tampered",
            )
            .expect("tamper with backup data");
            fs::write(
                root.join("Data").join("files").join("record.txt"),
                "current",
            )
            .expect("current data");

            let result = supervisor_action("restore", None).expect("restore response");

            assert!(!result.accepted);
            assert_eq!(result.status, "Backup verification failed");
            assert_eq!(
                fs::read_to_string(root.join("Data").join("files").join("record.txt"))
                    .expect("current data kept"),
                "current"
            );
            assert!(!root
                .join("Backups")
                .read_dir()
                .expect("backups")
                .filter_map(Result::ok)
                .any(|entry| entry.file_name().to_string_lossy().contains("pre-restore")));
        });
    }

    #[test]
    fn restore_refuses_empty_backup() {
        with_temp_state_dir(|root| {
            supervisor_action("backup", None).expect("empty backup response");
            fs::create_dir_all(root.join("Data").join("files")).expect("data folder");
            fs::write(
                root.join("Data").join("files").join("record.txt"),
                "current",
            )
            .expect("current data");

            let result = supervisor_action("restore", None).expect("restore response");

            assert!(!result.accepted);
            assert_eq!(result.status, "Backup has no data");
            assert_eq!(
                fs::read_to_string(root.join("Data").join("files").join("record.txt"))
                    .expect("current data kept"),
                "current"
            );
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

    #[test]
    fn open_windows_uninstall_settings_returns_user_handoff() {
        with_temp_state_dir(|_root| {
            let result = supervisor_action("open-windows-uninstall", None)
                .expect("open Windows uninstall response");

            assert!(result.accepted);
            assert_eq!(result.action, "open-windows-uninstall");
            assert_eq!(result.status, "Windows uninstall opened");
            assert!(result.message.contains("Installed apps"));
            assert!(result.next_action.contains("Find CivicSuite"));
        });
    }
}
