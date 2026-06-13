use serde::{Deserialize, Serialize};
use std::env;
use std::path::{Path, PathBuf};

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

fn checksum_marker_matches(local_path: &Path, expected_sha256: &str) -> bool {
    local_path.is_file()
        && std::fs::read_to_string(checksum_marker_path(local_path))
            .map(|value| value.trim().eq_ignore_ascii_case(expected_sha256))
            .unwrap_or(false)
}

fn file_size_matches(local_path: &Path, expected_size_bytes: u64) -> bool {
    std::fs::metadata(local_path)
        .map(|metadata| metadata.is_file() && metadata.len() == expected_size_bytes)
        .unwrap_or(false)
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

    Ok(ModelActionResult {
        accepted: false,
        action: action.to_string(),
        status: "Blocked",
        message: "The native model downloader has not been connected to host mutation yet."
            .to_string(),
        next_action:
            "Keep the pinned model readiness state visible until the installer executor is wired."
                .to_string(),
    })
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
    fn model_actions_refuse_to_mutate_host_until_downloader_exists() {
        let result = model_action("download").expect("action response is structured");
        assert!(!result.accepted);
        assert_eq!(result.status, "Blocked");
        assert!(result.message.contains("native model downloader"));
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
}
