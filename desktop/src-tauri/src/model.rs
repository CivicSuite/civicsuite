use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::env;
use std::fs;
use std::io::Read;
use std::path::{Path, PathBuf};
use std::process::Command;

const MODEL_MANIFEST_JSON: &str = include_str!("../../runtime/gemma4-model.json");
const REQUIRED_ACTIONS: [&str; 5] = [
    "download",
    "resume-download",
    "verify-checksum",
    "open-model-folder",
    "retry",
];
const REQUIRED_READINESS_CHECKS: [&str; 5] = [
    "metadata",
    "artifact-file",
    "checksum",
    "runtime",
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

fn parse_manifest() -> Result<ModelManifest, String> {
    serde_json::from_str(MODEL_MANIFEST_JSON)
        .map_err(|error| format!("Could not parse Gemma model manifest: {error}"))
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

fn model_path(artifact: &ArtifactDefinition) -> PathBuf {
    let mut path = windows_data_root();
    for part in artifact.relative_path.split('/') {
        path.push(part);
    }
    path
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
    verify_model_artifact(local_path, &manifest.model.artifact)
}

fn readiness_items(manifest: &ModelManifest, local_path: &Path) -> Vec<ModelReadinessItem> {
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
                "runtime" => (
                    false,
                    "Needs setup",
                    "The bundled local model runtime has not been started by the installer yet."
                        .to_string(),
                ),
                "registered-model" => (
                    false,
                    "Needs setup",
                    "CivicCore has not registered this verified local model yet.".to_string(),
                ),
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
    let checks = readiness_items(&manifest, &local_path);
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
        "verify-checksum" => {
            verify_model_artifact(&local_path, &manifest.model.artifact).map(|()| {
                (
                    "Verified",
                    "The local Gemma model file matches the pinned size and SHA-256.".to_string(),
                    "Start the bundled model runtime and register the model with CivicCore."
                        .to_string(),
                )
            })
        }
        "download" | "resume-download" | "retry" => download_model_artifact(&manifest, &local_path)
            .map(|()| {
                (
                    "Verified",
                    "The pinned Gemma model downloaded and passed checksum verification."
                        .to_string(),
                    "Start the bundled model runtime and register the model with CivicCore."
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
    }

    #[test]
    fn manifest_requires_checksum_and_explicit_download() {
        let manifest = parse_manifest().expect("manifest parses");
        assert!(!manifest.download.automatic);
        assert!(manifest.download.resumable);
        assert!(manifest.download.requires_user_consent);
        assert!(manifest.model.artifact.checksum_required);
        assert!(is_sha256(&manifest.model.artifact.sha256));
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

    fn test_env_lock() -> &'static std::sync::Mutex<()> {
        static LOCK: std::sync::OnceLock<std::sync::Mutex<()>> = std::sync::OnceLock::new();
        LOCK.get_or_init(|| std::sync::Mutex::new(()))
    }

    fn with_temp_state_dir<T>(test: impl FnOnce(PathBuf) -> T) -> T {
        let _guard = test_env_lock().lock().expect("test env lock");
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
}
