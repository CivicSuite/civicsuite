use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::env;
use std::fs;
use std::io::{Read, Write};
use std::net::{TcpStream, ToSocketAddrs};
use std::path::{Path, PathBuf};
use std::process::Command;
use std::time::{Duration, SystemTime, UNIX_EPOCH};

const MODEL_MANIFEST_JSON: &str = include_str!("../../runtime/gemma4-model.json");
const DEFAULT_OLLAMA_BASE_URL: &str = "http://127.0.0.1:15434";
const REQUIRED_ACTIONS: [&str; 6] = [
    "download",
    "resume-download",
    "load-runtime-model",
    "verify-checksum",
    "open-model-folder",
    "retry",
];
const REQUIRED_READINESS_CHECKS: [&str; 6] = [
    "metadata",
    "artifact-file",
    "checksum",
    "runtime",
    "runtime-model",
    "registered-model",
];

#[derive(Deserialize)]
struct OperatorPath {
    requires_docker: bool,
    requires_wsl: bool,
    requires_terminal: bool,
}

#[derive(Deserialize)]
struct ModelManifest {
    schema_version: u16,
    profile: String,
    local_only: bool,
    operator_path: OperatorPath,
    model: ModelDefinition,
    download: DownloadDefinition,
    actions: Vec<String>,
    readiness_checks: Vec<ReadinessDefinition>,
}

#[derive(Deserialize)]
struct ModelDefinition {
    id: String,
    display_name: String,
    provider: String,
    source_repo: String,
    source_url: String,
    resolve_url: String,
    documentation_url: String,
    license: String,
    runtime: String,
    ollama_model: String,
    runtime_model: String,
    format: String,
    quantization: String,
    parameters: String,
    context_window_tokens: u32,
    approximate_weight_memory_gb: f32,
    artifact: ArtifactDefinition,
}

#[derive(Deserialize)]
struct ArtifactDefinition {
    file_name: String,
    relative_path: String,
    size_bytes: u64,
    sha256: String,
    checksum_required: bool,
    checksum_source: String,
    etag_blob_id: String,
}

#[derive(Deserialize)]
struct DownloadDefinition {
    automatic: bool,
    resumable: bool,
    requires_user_consent: bool,
    network_policy: String,
    minimum_free_disk_bytes: u64,
}

#[derive(Deserialize)]
struct ReadinessDefinition {
    id: String,
    label: String,
    required: bool,
    next_action: String,
}

#[derive(Deserialize, Default)]
struct OllamaTagsResponse {
    #[serde(default)]
    models: Vec<OllamaTag>,
}

#[derive(Deserialize, Default)]
struct OllamaTag {
    #[serde(default)]
    name: Option<String>,
    #[serde(default)]
    model: Option<String>,
}

#[derive(Default)]
struct ModelRuntimeProbe {
    reachable: bool,
    model_available: bool,
    message: String,
}

#[derive(Serialize)]
pub struct ModelArtifact {
    pub file_name: String,
    pub local_path: String,
    pub expected_size_bytes: u64,
    pub expected_sha256: String,
    pub checksum_required: bool,
    pub checksum_source: String,
    pub etag_blob_id: String,
}

#[derive(Serialize)]
pub struct ModelReadinessItem {
    pub id: String,
    pub label: String,
    pub ok: bool,
    pub status: &'static str,
    pub message: String,
    pub next_action: String,
}

#[derive(Serialize)]
pub struct ModelState {
    pub profile: String,
    pub local_only: bool,
    pub ready: bool,
    pub status: &'static str,
    pub display_name: String,
    pub model_id: String,
    pub provider: String,
    pub source_repo: String,
    pub source_url: String,
    pub resolve_url: String,
    pub documentation_url: String,
    pub license: String,
    pub runtime: String,
    pub ollama_model: String,
    pub runtime_model: String,
    pub format: String,
    pub quantization: String,
    pub parameters: String,
    pub context_window_tokens: u32,
    pub approximate_weight_memory_gb: f32,
    pub download_size_bytes: u64,
    pub download_resumable: bool,
    pub download_requires_consent: bool,
    pub download_policy: String,
    pub minimum_free_disk_bytes: u64,
    pub artifact: ModelArtifact,
    pub checks: Vec<ModelReadinessItem>,
    pub next_action: String,
}

#[derive(Serialize)]
pub struct ModelActionResult {
    pub accepted: bool,
    pub action: String,
    pub status: &'static str,
    pub message: String,
    pub next_action: String,
}

#[derive(Deserialize, Serialize, Default)]
struct LocalModelRegistry {
    models: Vec<RegisteredModel>,
}

#[derive(Deserialize, Serialize, Clone)]
struct RegisteredModel {
    model_id: String,
    display_name: String,
    provider: String,
    runtime: String,
    ollama_model: String,
    #[serde(default)]
    runtime_model: String,
    artifact_path: String,
    sha256: String,
    registered_at_unix_seconds: u64,
}

fn parse_manifest() -> Result<ModelManifest, String> {
    serde_json::from_str(MODEL_MANIFEST_JSON)
        .map_err(|error| format!("Could not parse Gemma model manifest: {error}"))
}

fn now_unix_seconds() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_secs())
        .unwrap_or(0)
}

fn is_sha256(value: &str) -> bool {
    value.len() == 64 && value.chars().all(|character| character.is_ascii_hexdigit())
}

fn validate_manifest(manifest: &ModelManifest) -> Result<(), String> {
    if manifest.schema_version != 1 {
        return Err(format!(
            "Unsupported Gemma model manifest schema {}",
            manifest.schema_version
        ));
    }
    if manifest.profile != "windows-local-1.0" {
        return Err("Gemma model manifest profile must be windows-local-1.0".to_string());
    }
    if !manifest.local_only {
        return Err("Gemma model manifest must be local-only".to_string());
    }
    if manifest.operator_path.requires_docker
        || manifest.operator_path.requires_wsl
        || manifest.operator_path.requires_terminal
    {
        return Err("Gemma model operator path cannot require developer tooling".to_string());
    }
    if manifest.download.automatic || !manifest.download.requires_user_consent {
        return Err(
            "Gemma model download must require explicit user consent and never be silent"
                .to_string(),
        );
    }
    if !manifest.download.resumable {
        return Err("Gemma model download must be resumable".to_string());
    }
    if !manifest.model.id.contains("gemma-4-12b") {
        return Err("Gemma model manifest must pin the 12B model".to_string());
    }
    if manifest.model.parameters != "12B" {
        return Err("Gemma model manifest parameters must be 12B".to_string());
    }
    if manifest.model.format != "GGUF" {
        return Err("Gemma model artifact format must be GGUF".to_string());
    }
    if !manifest.model.quantization.contains("QAT") || !manifest.model.quantization.contains("Q4_0")
    {
        return Err("Gemma model quantization must be QAT Q4_0".to_string());
    }
    if !manifest.model.ollama_model.starts_with("hf.co/google/") {
        return Err("Gemma model must use the official Google Hugging Face Ollama id".to_string());
    }
    if manifest.model.runtime_model.trim().is_empty()
        || manifest.model.runtime_model == manifest.model.ollama_model
    {
        return Err(
            "Gemma model manifest must define a local Ollama runtime model name".to_string(),
        );
    }
    if manifest.model.artifact.file_name != "gemma-4-12b-it-qat-q4_0.gguf" {
        return Err("Gemma model manifest must pin the expected GGUF file name".to_string());
    }
    if !manifest.model.artifact.checksum_required || !is_sha256(&manifest.model.artifact.sha256) {
        return Err("Gemma model manifest must require a pinned SHA-256 checksum".to_string());
    }
    for action in REQUIRED_ACTIONS {
        if !manifest.actions.iter().any(|candidate| candidate == action) {
            return Err(format!("Gemma model manifest is missing action {action}"));
        }
    }
    for check_id in REQUIRED_READINESS_CHECKS {
        if !manifest
            .readiness_checks
            .iter()
            .any(|check| check.id == check_id && check.required)
        {
            return Err(format!(
                "Gemma model manifest is missing required readiness check {check_id}"
            ));
        }
    }
    Ok(())
}

fn windows_data_root() -> PathBuf {
    if let Ok(root) = env::var("CIVICSUITE_DESKTOP_STATE_DIR") {
        return PathBuf::from(root).join("Data");
    }
    env::var("LOCALAPPDATA")
        .map(PathBuf::from)
        .unwrap_or_else(|_| PathBuf::from("{local_app_data}"))
        .join("CivicSuite")
        .join("Data")
}

fn windows_config_root() -> PathBuf {
    if let Ok(root) = env::var("CIVICSUITE_DESKTOP_STATE_DIR") {
        return PathBuf::from(root).join("config");
    }
    env::var("LOCALAPPDATA")
        .map(PathBuf::from)
        .unwrap_or_else(|_| PathBuf::from("{local_app_data}"))
        .join("CivicSuite")
        .join("config")
}

fn windows_runtime_root() -> PathBuf {
    if let Ok(root) = env::var("CIVICSUITE_RUNTIME_ROOT") {
        return PathBuf::from(root);
    }
    env::var("CIVICSUITE_DESKTOP_STATE_DIR")
        .map(PathBuf::from)
        .unwrap_or_else(|_| {
            env::var("LOCALAPPDATA")
                .map(PathBuf::from)
                .unwrap_or_else(|_| PathBuf::from("{local_app_data}"))
                .join("CivicSuite")
        })
}

fn model_path(artifact: &ArtifactDefinition) -> PathBuf {
    let mut path = windows_data_root();
    for part in artifact.relative_path.split('/') {
        path.push(part);
    }
    path
}

fn model_registry_path() -> PathBuf {
    windows_config_root().join("model-registry.json")
}

fn checksum_marker_path(local_path: &Path) -> PathBuf {
    let marker_name = format!(
        "{}.sha256.verified",
        local_path
            .file_name()
            .and_then(|name| name.to_str())
            .unwrap_or("model.gguf")
    );
    local_path.with_file_name(marker_name)
}

fn partial_download_path(local_path: &Path) -> PathBuf {
    local_path.with_extension("gguf.part")
}

fn runtime_modelfile_path(local_path: &Path) -> PathBuf {
    local_path.with_file_name("gemma-4-12b-it-qat-q4_0.Modelfile")
}

fn ollama_base_url() -> String {
    env::var("OLLAMA_BASE_URL")
        .unwrap_or_else(|_| DEFAULT_OLLAMA_BASE_URL.to_string())
        .trim_end_matches('/')
        .to_string()
}

fn ollama_tags_endpoint() -> String {
    format!("{}/api/tags", ollama_base_url())
}

fn ollama_host_env() -> String {
    ollama_base_url()
        .strip_prefix("http://")
        .unwrap_or(DEFAULT_OLLAMA_BASE_URL.trim_start_matches("http://"))
        .to_string()
}

fn bundled_ollama_path() -> PathBuf {
    windows_runtime_root()
        .join("runtime")
        .join("ollama")
        .join("ollama.exe")
}

fn ollama_executable() -> PathBuf {
    env::var("CIVICSUITE_OLLAMA_PATH")
        .map(PathBuf::from)
        .unwrap_or_else(|_| {
            let bundled = bundled_ollama_path();
            if bundled.is_file() {
                bundled
            } else if cfg!(target_os = "windows") {
                PathBuf::from("ollama.exe")
            } else {
                PathBuf::from("ollama")
            }
        })
}

fn parse_available_disk_override() -> Option<Result<u64, String>> {
    env::var("CIVICSUITE_AVAILABLE_DISK_BYTES_OVERRIDE")
        .ok()
        .map(|value| {
            value.parse::<u64>().map_err(|error| {
                format!("Invalid CIVICSUITE_AVAILABLE_DISK_BYTES_OVERRIDE value: {error}")
            })
        })
}

fn available_disk_bytes(path: &Path) -> Result<u64, String> {
    if let Some(override_value) = parse_available_disk_override() {
        return override_value;
    }
    if cfg!(target_os = "windows") {
        let literal_path = path.to_string_lossy().replace('\'', "''");
        let script = format!(
            "$item = Get-Item -LiteralPath '{}'; [int64]$item.PSDrive.Free",
            literal_path
        );
        let output = Command::new("powershell.exe")
            .arg("-NoProfile")
            .arg("-NonInteractive")
            .arg("-Command")
            .arg(script)
            .output()
            .map_err(|error| format!("Could not check available disk space: {error}"))?;
        if !output.status.success() {
            return Err(format!(
                "Could not check available disk space: {}",
                String::from_utf8_lossy(&output.stderr).trim()
            ));
        }
        return String::from_utf8_lossy(&output.stdout)
            .trim()
            .parse::<u64>()
            .map_err(|error| format!("Could not parse available disk space: {error}"));
    }
    let output = Command::new("df")
        .arg("-Pk")
        .arg(path)
        .output()
        .map_err(|error| format!("Could not check available disk space: {error}"))?;
    if !output.status.success() {
        return Err(format!(
            "Could not check available disk space: {}",
            String::from_utf8_lossy(&output.stderr).trim()
        ));
    }
    let stdout = String::from_utf8_lossy(&output.stdout);
    let available_kb = stdout
        .lines()
        .nth(1)
        .and_then(|line| line.split_whitespace().nth(3))
        .ok_or_else(|| "Could not parse available disk space output".to_string())?
        .parse::<u64>()
        .map_err(|error| format!("Could not parse available disk space: {error}"))?;
    Ok(available_kb * 1024)
}

fn ensure_minimum_free_disk(path: &Path, minimum_free_disk_bytes: u64) -> Result<(), String> {
    let available = available_disk_bytes(path)?;
    if available < minimum_free_disk_bytes {
        return Err(format!(
            "The model download needs at least {minimum_free_disk_bytes} free bytes, but only {available} bytes are available."
        ));
    }
    Ok(())
}

fn ensure_parent_dir(path: &Path) -> Result<(), String> {
    let parent = path
        .parent()
        .ok_or_else(|| format!("Could not resolve parent folder for {}", path.display()))?;
    fs::create_dir_all(parent)
        .map_err(|error| format!("Could not create {}: {error}", parent.display()))
}

fn checksum_marker_matches(local_path: &Path, expected_sha256: &str) -> bool {
    local_path.is_file()
        && std::fs::read_to_string(checksum_marker_path(local_path))
            .map(|value| value.trim().eq_ignore_ascii_case(expected_sha256))
            .unwrap_or(false)
}

fn http_get_text(endpoint: &str) -> Result<String, String> {
    let rest = endpoint.strip_prefix("http://").ok_or_else(|| {
        format!("Only local http endpoints are supported for model readiness: {endpoint}")
    })?;
    let (host_port, path) = rest.split_once('/').unwrap_or((rest, ""));
    let address = host_port
        .to_socket_addrs()
        .map_err(|error| format!("Could not resolve Ollama endpoint {host_port}: {error}"))?
        .next()
        .ok_or_else(|| format!("Could not resolve Ollama endpoint {host_port}"))?;
    let mut stream = TcpStream::connect_timeout(&address, Duration::from_millis(800))
        .map_err(|error| format!("Ollama is not responding at {endpoint}: {error}"))?;
    let _ = stream.set_read_timeout(Some(Duration::from_millis(800)));
    let request = format!("GET /{path} HTTP/1.1\r\nHost: {host_port}\r\nConnection: close\r\n\r\n");
    stream
        .write_all(request.as_bytes())
        .map_err(|error| format!("Could not query Ollama readiness: {error}"))?;
    let mut response = String::new();
    stream
        .read_to_string(&mut response)
        .map_err(|error| format!("Could not read Ollama readiness response: {error}"))?;
    let status_line = response.lines().next().unwrap_or_default();
    if !(status_line.starts_with("HTTP/1.1 2") || status_line.starts_with("HTTP/1.0 2")) {
        return Err(format!("Ollama readiness endpoint returned {status_line}"));
    }
    Ok(response
        .split_once("\r\n\r\n")
        .map(|(_, body)| body.to_string())
        .unwrap_or_default())
}

fn parse_ollama_model_names(body: &str) -> Vec<String> {
    serde_json::from_str::<OllamaTagsResponse>(body)
        .map(|payload| {
            payload
                .models
                .into_iter()
                .flat_map(|tag| [tag.name, tag.model])
                .flatten()
                .filter(|name| !name.trim().is_empty())
                .collect()
        })
        .unwrap_or_default()
}

fn ollama_model_list_contains(body: &str, model_name: &str) -> bool {
    parse_ollama_model_names(body)
        .iter()
        .any(|candidate| candidate.eq_ignore_ascii_case(model_name))
}

fn probe_model_runtime(manifest: &ModelManifest) -> ModelRuntimeProbe {
    let endpoint = ollama_tags_endpoint();
    match http_get_text(&endpoint) {
        Ok(body) => {
            let model_available = ollama_model_list_contains(&body, &manifest.model.runtime_model);
            ModelRuntimeProbe {
                reachable: true,
                model_available,
                message: if model_available {
                    format!(
                        "Ollama is responding at {endpoint} and lists {}.",
                        manifest.model.runtime_model
                    )
                } else {
                    format!(
                        "Ollama is responding at {endpoint}, but {} is not loaded yet.",
                        manifest.model.runtime_model
                    )
                },
            }
        }
        Err(message) => ModelRuntimeProbe {
            reachable: false,
            model_available: false,
            message,
        },
    }
}

fn sha256_file(local_path: &Path) -> Result<String, String> {
    let mut file = fs::File::open(local_path)
        .map_err(|error| format!("Could not open {}: {error}", local_path.display()))?;
    let mut hasher = Sha256::new();
    let mut buffer = [0_u8; 1024 * 1024];
    loop {
        let read = file
            .read(&mut buffer)
            .map_err(|error| format!("Could not read {}: {error}", local_path.display()))?;
        if read == 0 {
            break;
        }
        hasher.update(&buffer[..read]);
    }
    Ok(format!("{:x}", hasher.finalize()))
}

fn verify_file_checksum(
    local_path: &Path,
    expected_size_bytes: u64,
    expected_sha256: &str,
) -> Result<(), String> {
    let metadata = fs::metadata(local_path)
        .map_err(|error| format!("Could not inspect {}: {error}", local_path.display()))?;
    if !metadata.is_file() {
        return Err(format!("{} is not a model file", local_path.display()));
    }
    if metadata.len() != expected_size_bytes {
        return Err(format!(
            "Model file size is {}, expected {} bytes",
            metadata.len(),
            expected_size_bytes
        ));
    }
    let actual_sha256 = sha256_file(local_path)?;
    if !actual_sha256.eq_ignore_ascii_case(expected_sha256) {
        return Err(format!(
            "Model checksum mismatch: expected {expected_sha256}, got {actual_sha256}"
        ));
    }
    fs::write(
        checksum_marker_path(local_path),
        format!("{expected_sha256}\n"),
    )
    .map_err(|error| format!("Could not record checksum marker: {error}"))
}

fn file_size_matches(local_path: &Path, expected_size_bytes: u64) -> bool {
    std::fs::metadata(local_path)
        .map(|metadata| metadata.is_file() && metadata.len() == expected_size_bytes)
        .unwrap_or(false)
}

fn verify_model_artifact(local_path: &Path, artifact: &ArtifactDefinition) -> Result<(), String> {
    verify_file_checksum(local_path, artifact.size_bytes, &artifact.sha256)
}

fn read_model_registry() -> Result<LocalModelRegistry, String> {
    let path = model_registry_path();
    if !path.is_file() {
        return Ok(LocalModelRegistry::default());
    }
    let contents = fs::read_to_string(&path)
        .map_err(|error| format!("Could not read model registry: {error}"))?;
    serde_json::from_str(&contents)
        .map_err(|error| format!("Could not parse model registry: {error}"))
}

fn write_model_registry(registry: &LocalModelRegistry) -> Result<(), String> {
    let path = model_registry_path();
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .map_err(|error| format!("Could not create model registry folder: {error}"))?;
    }
    let contents = serde_json::to_string_pretty(registry)
        .map_err(|error| format!("Could not serialize model registry: {error}"))?;
    fs::write(&path, format!("{contents}\n"))
        .map_err(|error| format!("Could not write {}: {error}", path.display()))
}

fn register_verified_model(manifest: &ModelManifest, local_path: &Path) -> Result<(), String> {
    let mut registry = read_model_registry()?;
    let entry = RegisteredModel {
        model_id: manifest.model.id.clone(),
        display_name: manifest.model.display_name.clone(),
        provider: manifest.model.provider.clone(),
        runtime: manifest.model.runtime.clone(),
        ollama_model: manifest.model.ollama_model.clone(),
        runtime_model: manifest.model.runtime_model.clone(),
        artifact_path: local_path.to_string_lossy().to_string(),
        sha256: manifest.model.artifact.sha256.clone(),
        registered_at_unix_seconds: now_unix_seconds(),
    };
    if let Some(existing) = registry
        .models
        .iter_mut()
        .find(|candidate| candidate.model_id == entry.model_id)
    {
        *existing = entry;
    } else {
        registry.models.push(entry);
    }
    write_model_registry(&registry)
}

fn verify_and_register_model_artifact(
    manifest: &ModelManifest,
    local_path: &Path,
) -> Result<(), String> {
    verify_model_artifact(local_path, &manifest.model.artifact)?;
    register_verified_model(manifest, local_path)
}

fn load_model_into_runtime(manifest: &ModelManifest, local_path: &Path) -> Result<(), String> {
    if !model_artifact_verified(local_path, &manifest.model.artifact) {
        return Err(
            "The pinned Gemma model file must pass checksum verification before it can be loaded into Ollama."
                .to_string(),
        );
    }
    let runtime = probe_model_runtime(manifest);
    if !runtime.reachable {
        return Err(format!(
            "The local Ollama runtime is not ready yet. {}",
            runtime.message
        ));
    }
    if runtime.model_available {
        return Ok(());
    }
    let parent = local_path.parent().ok_or_else(|| {
        format!(
            "Could not resolve model folder for {}",
            local_path.display()
        )
    })?;
    let file_name = local_path
        .file_name()
        .and_then(|name| name.to_str())
        .ok_or_else(|| {
            format!(
                "Could not resolve model file name for {}",
                local_path.display()
            )
        })?;
    let modelfile_path = runtime_modelfile_path(local_path);
    fs::write(
        &modelfile_path,
        format!("FROM ./{file_name}\nPARAMETER temperature 0.1\n"),
    )
    .map_err(|error| format!("Could not write {}: {error}", modelfile_path.display()))?;
    let executable = ollama_executable();
    let status = Command::new(&executable)
        .arg("create")
        .arg(&manifest.model.runtime_model)
        .arg("-f")
        .arg(&modelfile_path)
        .env("OLLAMA_HOST", ollama_host_env())
        .current_dir(parent)
        .status()
        .map_err(|error| {
            format!(
                "Could not load {} with {}: {error}",
                manifest.model.runtime_model,
                executable.display()
            )
        })?;
    if !status.success() {
        return Err(format!(
            "Ollama could not load {} and exited with code {}.",
            manifest.model.runtime_model,
            status
                .code()
                .map(|code| code.to_string())
                .unwrap_or_else(|| "unknown".to_string())
        ));
    }
    let updated_runtime = probe_model_runtime(manifest);
    if !updated_runtime.model_available {
        return Err(format!(
            "Ollama finished the load command, but {} is still not listed by the local runtime.",
            manifest.model.runtime_model
        ));
    }
    Ok(())
}

fn model_registry_matches(manifest: &ModelManifest, local_path: &Path) -> bool {
    read_model_registry()
        .map(|registry| {
            registry.models.iter().any(|entry| {
                entry.model_id == manifest.model.id
                    && entry
                        .sha256
                        .eq_ignore_ascii_case(&manifest.model.artifact.sha256)
                    && entry.runtime_model == manifest.model.runtime_model
                    && entry.artifact_path == local_path.to_string_lossy().as_ref()
            })
        })
        .unwrap_or(false)
}

fn model_artifact_verified(local_path: &Path, artifact: &ArtifactDefinition) -> bool {
    file_size_matches(local_path, artifact.size_bytes)
        && checksum_marker_matches(local_path, &artifact.sha256)
}

pub(crate) fn local_model_artifact_verified() -> Result<bool, String> {
    #[cfg(test)]
    if env::var("CIVICSUITE_TEST_MODEL_VERIFIED").ok().as_deref() == Some("1") {
        return Ok(true);
    }
    let manifest = parse_manifest()?;
    validate_manifest(&manifest)?;
    let local_path = model_path(&manifest.model.artifact);
    Ok(model_artifact_verified(
        &local_path,
        &manifest.model.artifact,
    ))
}

fn curl_executable() -> String {
    env::var("CIVICSUITE_CURL_PATH").unwrap_or_else(|_| {
        if cfg!(target_os = "windows") {
            "curl.exe".to_string()
        } else {
            "curl".to_string()
        }
    })
}

fn download_model_artifact(manifest: &ModelManifest, local_path: &Path) -> Result<(), String> {
    if checksum_marker_matches(local_path, &manifest.model.artifact.sha256) {
        return Ok(());
    }
    ensure_parent_dir(local_path)?;
    let parent = local_path.parent().ok_or_else(|| {
        format!(
            "Could not resolve parent folder for {}",
            local_path.display()
        )
    })?;
    ensure_minimum_free_disk(parent, manifest.download.minimum_free_disk_bytes)?;
    let partial_path = partial_download_path(local_path);
    let status = Command::new(curl_executable())
        .arg("-L")
        .arg("--fail")
        .arg("--retry")
        .arg("3")
        .arg("--continue-at")
        .arg("-")
        .arg("--output")
        .arg(&partial_path)
        .arg(&manifest.model.resolve_url)
        .status()
        .map_err(|error| format!("Could not start the model download: {error}"))?;
    if !status.success() {
        return Err(format!(
            "Model download failed with exit code {}",
            status
                .code()
                .map(|code| code.to_string())
                .unwrap_or_else(|| "unknown".to_string())
        ));
    }
    let downloaded_size = fs::metadata(&partial_path)
        .map_err(|error| format!("Could not inspect downloaded model: {error}"))?
        .len();
    if downloaded_size != manifest.model.artifact.size_bytes {
        return Err(format!(
            "Model download is incomplete: got {downloaded_size}, expected {} bytes",
            manifest.model.artifact.size_bytes
        ));
    }
    if local_path.exists() {
        fs::remove_file(local_path)
            .map_err(|error| format!("Could not replace old model file: {error}"))?;
    }
    fs::rename(&partial_path, local_path)
        .map_err(|error| format!("Could not move verified model into place: {error}"))?;
    verify_and_register_model_artifact(manifest, local_path)
}

fn readiness_items(
    manifest: &ModelManifest,
    local_path: &Path,
    runtime: &ModelRuntimeProbe,
) -> Vec<ModelReadinessItem> {
    manifest
        .readiness_checks
        .iter()
        .map(|check| {
            let (ok, status, message) = match check.id.as_str() {
                "metadata" => (
                    true,
                    "OK",
                    format!(
                        "{} is pinned with official source metadata and checksum requirements.",
                        manifest.model.display_name
                    ),
                ),
                "artifact-file" => {
                    if file_size_matches(local_path, manifest.model.artifact.size_bytes) {
                        (
                            true,
                            "Found",
                            "The pinned GGUF file exists with the expected size in the local CivicSuite data folder."
                                .to_string(),
                        )
                    } else {
                        (
                            false,
                            "Needs download",
                            "The pinned GGUF file is not present with the expected size on this machine yet.".to_string(),
                        )
                    }
                }
                "checksum" => {
                    if checksum_marker_matches(local_path, &manifest.model.artifact.sha256) {
                        (
                            true,
                            "Verified",
                            "Checksum verification has been recorded for the pinned file."
                                .to_string(),
                        )
                    } else {
                        (
                            false,
                            "Needs verification",
                            format!(
                                "The model must match SHA-256 {} before AI workflows can run.",
                                manifest.model.artifact.sha256
                            ),
                        )
                    }
                }
                "runtime" => {
                    if runtime.reachable {
                        (true, "OK", runtime.message.clone())
                    } else {
                        (false, "Needs start", runtime.message.clone())
                    }
                }
                "runtime-model" => {
                    if runtime.model_available {
                        (
                            true,
                            "Loaded",
                            format!(
                                "{} is available to the local Ollama runtime.",
                                manifest.model.runtime_model
                            ),
                        )
                    } else if runtime.reachable {
                        (false, "Needs load", runtime.message.clone())
                    } else {
                        (
                            false,
                            "Needs runtime",
                            "Start the bundled Ollama runtime before loading the Gemma model."
                                .to_string(),
                        )
                    }
                }
                "registered-model" => {
                    if model_artifact_verified(local_path, &manifest.model.artifact)
                        && model_registry_matches(manifest, local_path)
                    {
                        (
                            true,
                            "Registered",
                            "CivicCore has a local registry entry for this verified model."
                                .to_string(),
                        )
                    } else {
                        (
                            false,
                            "Needs registration",
                            "CivicCore has not registered this verified local model yet."
                                .to_string(),
                        )
                    }
                }
                _ => (
                    false,
                    "Unknown",
                    "This readiness check is not recognized by the desktop shell.".to_string(),
                ),
            };

            ModelReadinessItem {
                id: check.id.clone(),
                label: check.label.clone(),
                ok,
                status,
                message,
                next_action: check.next_action.clone(),
            }
        })
        .collect()
}

pub fn model_state() -> Result<ModelState, String> {
    let manifest = parse_manifest()?;
    validate_manifest(&manifest)?;
    let local_path = model_path(&manifest.model.artifact);
    let runtime = probe_model_runtime(&manifest);
    let checks = readiness_items(&manifest, &local_path, &runtime);
    let ready = checks.iter().all(|check| check.ok);
    let status = if ready { "Ready" } else { "Needs download" };

    Ok(ModelState {
        profile: manifest.profile,
        local_only: manifest.local_only,
        ready,
        status,
        display_name: manifest.model.display_name,
        model_id: manifest.model.id,
        provider: manifest.model.provider,
        source_repo: manifest.model.source_repo,
        source_url: manifest.model.source_url,
        resolve_url: manifest.model.resolve_url,
        documentation_url: manifest.model.documentation_url,
        license: manifest.model.license,
        runtime: manifest.model.runtime,
        ollama_model: manifest.model.ollama_model,
        runtime_model: manifest.model.runtime_model,
        format: manifest.model.format,
        quantization: manifest.model.quantization,
        parameters: manifest.model.parameters,
        context_window_tokens: manifest.model.context_window_tokens,
        approximate_weight_memory_gb: manifest.model.approximate_weight_memory_gb,
        download_size_bytes: manifest.model.artifact.size_bytes,
        download_resumable: manifest.download.resumable,
        download_requires_consent: manifest.download.requires_user_consent,
        download_policy: manifest.download.network_policy,
        minimum_free_disk_bytes: manifest.download.minimum_free_disk_bytes,
        artifact: ModelArtifact {
            file_name: manifest.model.artifact.file_name,
            local_path: local_path.to_string_lossy().to_string(),
            expected_size_bytes: manifest.model.artifact.size_bytes,
            expected_sha256: manifest.model.artifact.sha256,
            checksum_required: manifest.model.artifact.checksum_required,
            checksum_source: manifest.model.artifact.checksum_source,
            etag_blob_id: manifest.model.artifact.etag_blob_id,
        },
        checks,
        next_action: "Use first-run setup to download, resume, and verify the pinned local model."
            .to_string(),
    })
}

pub(crate) fn local_model_ready() -> Result<bool, String> {
    Ok(model_state()?.ready)
}

pub(crate) fn pinned_runtime_model() -> Result<String, String> {
    let manifest = parse_manifest()?;
    validate_manifest(&manifest)?;
    Ok(manifest.model.runtime_model)
}

pub fn model_action(action: &str) -> Result<ModelActionResult, String> {
    let manifest = parse_manifest()?;
    validate_manifest(&manifest)?;
    if !manifest.actions.iter().any(|candidate| candidate == action) {
        return Err(format!("Unsupported model action: {action}"));
    }
    let local_path = model_path(&manifest.model.artifact);

    let result = match action {
        "open-model-folder" => ensure_parent_dir(&local_path).map(|()| {
            (
                "Ready",
                "The local model folder exists.".to_string(),
                "Place or download the pinned GGUF file there, then verify checksum.".to_string(),
            )
        }),
        "verify-checksum" => verify_and_register_model_artifact(&manifest, &local_path).map(|()| {
            (
                "Verified",
                "The local Gemma model file matches the pinned size and SHA-256.".to_string(),
                "Start the bundled model runtime before staff workflows use local AI.".to_string(),
            )
        }),
        "load-runtime-model" => load_model_into_runtime(&manifest, &local_path).map(|()| {
            (
                "Loaded",
                "The pinned Gemma model is available through the local Ollama runtime.".to_string(),
                "Run final System Health verification before staff workflows use local AI."
                    .to_string(),
            )
        }),
        "download" | "resume-download" | "retry" => download_model_artifact(&manifest, &local_path)
            .map(|()| {
                (
                    "Verified",
                    "The pinned Gemma model downloaded and passed checksum verification."
                        .to_string(),
                    "Start the bundled model runtime before staff workflows use local AI."
                        .to_string(),
                )
            }),
        _ => Err(format!("Unsupported model action: {action}")),
    };

    match result {
        Ok((status, message, next_action)) => Ok(ModelActionResult {
            accepted: true,
            action: action.to_string(),
            status,
            message,
            next_action,
        }),
        Err(message) => Ok(ModelActionResult {
            accepted: false,
            action: action.to_string(),
            status: "Needs attention",
            message,
            next_action:
                "Check the model file, network connection, and available disk space, then retry."
                    .to_string(),
        }),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn manifest_pins_gemma4_12b_qat_gguf() {
        let manifest = parse_manifest().expect("manifest parses");
        validate_manifest(&manifest).expect("manifest validates");
        assert_eq!(manifest.model.parameters, "12B");
        assert_eq!(manifest.model.format, "GGUF");
        assert!(manifest.model.quantization.contains("QAT"));
        assert!(manifest.model.quantization.contains("Q4_0"));
        assert_eq!(
            manifest.model.artifact.file_name,
            "gemma-4-12b-it-qat-q4_0.gguf"
        );
        assert!(manifest
            .model
            .ollama_model
            .contains("gemma-4-12B-it-qat-q4_0-gguf"));
        assert_eq!(
            manifest.model.runtime_model,
            "civicsuite-gemma4-12b-qat:q4_0"
        );
    }

    #[test]
    fn manifest_requires_checksum_and_explicit_download() {
        let manifest = parse_manifest().expect("manifest parses");
        assert!(!manifest.download.automatic);
        assert!(manifest.download.resumable);
        assert!(manifest.download.requires_user_consent);
        assert!(manifest.model.artifact.checksum_required);
        assert!(is_sha256(&manifest.model.artifact.sha256));
        assert!(manifest
            .actions
            .iter()
            .any(|action| action == "load-runtime-model"));
        assert!(manifest
            .readiness_checks
            .iter()
            .any(|check| check.id == "runtime-model" && check.required));
    }

    #[test]
    fn model_state_blocks_missing_runtime_and_registry() {
        let state = model_state().expect("state builds from manifest");
        assert_eq!(state.display_name, "Gemma 4 12B QAT Q4_0");
        assert!(!state.ready);
        assert_eq!(state.status, "Needs download");
        assert!(state
            .checks
            .iter()
            .any(|check| check.id == "runtime" && !check.ok));
        assert!(state
            .checks
            .iter()
            .any(|check| check.id == "registered-model" && !check.ok));
        assert!(state
            .checks
            .iter()
            .any(|check| check.id == "runtime-model" && !check.ok));
    }

    #[test]
    fn model_checksum_action_reports_missing_file_without_downloading() {
        with_temp_state_dir(|_| {
            let result = model_action("verify-checksum").expect("action response is structured");
            assert!(!result.accepted);
            assert_eq!(result.status, "Needs attention");
            assert!(result.message.contains("Could not inspect"));
        });
    }

    #[test]
    fn model_download_checks_free_disk_before_network() {
        with_temp_state_dir(|_| {
            env::set_var("CIVICSUITE_AVAILABLE_DISK_BYTES_OVERRIDE", "1");
            let result = model_action("download").expect("action response is structured");
            env::remove_var("CIVICSUITE_AVAILABLE_DISK_BYTES_OVERRIDE");
            assert!(!result.accepted);
            assert_eq!(result.status, "Needs attention");
            assert!(result.message.contains("needs at least 15000000000"));
        });
    }

    #[test]
    fn model_download_reports_missing_downloader() {
        with_temp_state_dir(|root| {
            env::set_var("CIVICSUITE_AVAILABLE_DISK_BYTES_OVERRIDE", "99999999999");
            env::set_var(
                "CIVICSUITE_CURL_PATH",
                root.join("missing-curl.exe").to_string_lossy().to_string(),
            );
            let result = model_action("download").expect("action response is structured");
            env::remove_var("CIVICSUITE_AVAILABLE_DISK_BYTES_OVERRIDE");
            env::remove_var("CIVICSUITE_CURL_PATH");
            assert!(!result.accepted);
            assert_eq!(result.status, "Needs attention");
            assert!(result
                .message
                .contains("Could not start the model download"));
        });
    }

    #[test]
    fn checksum_marker_cannot_pass_without_model_file() {
        let missing_path = env::temp_dir().join(format!(
            "civicsuite-missing-model-{}.gguf",
            std::process::id()
        ));
        let _ = std::fs::remove_file(&missing_path);
        let marker_path = checksum_marker_path(&missing_path);
        std::fs::write(
            &marker_path,
            "faff1a63667fac17ac5e777f47114688fcefea96e220e211aaa8d62c2c4561f1",
        )
        .expect("marker can be written");
        assert!(!checksum_marker_matches(
            &missing_path,
            "faff1a63667fac17ac5e777f47114688fcefea96e220e211aaa8d62c2c4561f1"
        ));
        let _ = std::fs::remove_file(marker_path);
    }

    #[test]
    fn ollama_tags_match_pinned_model_name() {
        let body = r#"{"models":[{"name":"hf.co/google/gemma-4-12B-it-qat-q4_0-gguf:Q4_0","model":"hf.co/google/gemma-4-12B-it-qat-q4_0-gguf:Q4_0"}]}"#;
        assert!(ollama_model_list_contains(
            body,
            "hf.co/google/gemma-4-12B-it-qat-q4_0-gguf:Q4_0"
        ));
        assert!(!ollama_model_list_contains(body, "gemma2:4b"));
    }

    fn with_temp_state_dir<T>(test: impl FnOnce(PathBuf) -> T) -> T {
        let _guard = crate::first_run::test_env_lock()
            .lock()
            .expect("test env lock");
        let root = env::temp_dir().join(format!(
            "civicsuite-desktop-model-test-{}",
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
    fn model_open_folder_action_creates_local_folder() {
        with_temp_state_dir(|root| {
            let result = model_action("open-model-folder").expect("action response");
            assert!(result.accepted);
            assert!(root.join("Data").join("models").is_dir());
        });
    }

    #[test]
    fn model_load_runtime_action_requires_verified_artifact() {
        with_temp_state_dir(|_| {
            let result = model_action("load-runtime-model").expect("action response");
            assert!(!result.accepted);
            assert_eq!(result.status, "Needs attention");
            assert!(result.message.contains("checksum verification"));
        });
    }

    #[test]
    fn verify_file_checksum_writes_marker_for_matching_file() {
        with_temp_state_dir(|root| {
            let model_path = root.join("Data").join("models").join("tiny.gguf");
            fs::create_dir_all(model_path.parent().expect("parent")).expect("mkdir");
            fs::write(&model_path, b"civicsuite").expect("write model");
            let expected = sha256_file(&model_path).expect("hash");
            verify_file_checksum(&model_path, 10, &expected).expect("verify");
            assert!(checksum_marker_matches(&model_path, &expected));
        });
    }

    #[test]
    fn register_verified_model_writes_civiccore_registry() {
        with_temp_state_dir(|root| {
            let manifest = parse_manifest().expect("manifest parses");
            let model_path = root
                .join("Data")
                .join("models")
                .join("gemma-4-12b-it-qat-q4_0.gguf");

            register_verified_model(&manifest, &model_path).expect("registry write");

            assert!(root.join("config").join("model-registry.json").is_file());
            assert!(model_registry_matches(&manifest, &model_path));
            let registry = read_model_registry().expect("registry reads");
            assert_eq!(registry.models.len(), 1);
            assert_eq!(registry.models[0].model_id, manifest.model.id);
            assert_eq!(registry.models[0].ollama_model, manifest.model.ollama_model);
            assert_eq!(
                registry.models[0].runtime_model,
                manifest.model.runtime_model
            );
        });
    }

    #[test]
    fn local_model_artifact_verified_is_false_without_artifact() {
        with_temp_state_dir(|_| {
            assert!(
                !local_model_artifact_verified().expect("verification state resolves"),
                "missing model artifact cannot satisfy the first-run gate"
            );
        });
    }
}
