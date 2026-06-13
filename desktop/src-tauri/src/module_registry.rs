use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use std::env;
use std::fs;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};

pub const MODULES_JSON: &str = include_str!("../../../installer/modules.json");
const DEFAULT_PROFILE_ID: &str = "city-core";

#[derive(Deserialize)]
struct ModuleRegistry {
    schema_version: u16,
    module_contract_version: u16,
    profiles: Vec<ModuleProfileDefinition>,
    modules: Vec<ModuleDefinition>,
}

#[derive(Deserialize, Clone)]
struct ModuleProfileDefinition {
    id: String,
    label: String,
    description: String,
    modules: Vec<String>,
    #[serde(default)]
    disabled: bool,
}

#[derive(Deserialize, Clone)]
struct ModuleDefinition {
    id: String,
    display_name: String,
    role: String,
    #[serde(default)]
    current_version: Option<String>,
    #[serde(default)]
    required: bool,
    #[serde(default)]
    selectable: bool,
    #[serde(default)]
    civiccore_requirement: Option<String>,
    #[serde(default)]
    dependencies: Vec<String>,
    #[serde(default)]
    proof_required: Vec<String>,
    routes: Option<Vec<ContractRoute>>,
    permissions: Option<Vec<String>>,
    services: Option<Vec<ContractService>>,
    migrations: Option<Vec<String>>,
    tasks: Option<Vec<String>>,
    backup_restore_hooks: Option<Vec<String>>,
    model_needs: Option<Vec<ContractModelNeed>>,
    lifecycle: Option<ContractLifecycle>,
}

#[derive(Deserialize, Clone)]
struct ContractRoute {
    id: String,
    label: String,
    path: String,
    surface: String,
}

#[derive(Deserialize, Clone)]
struct ContractService {
    id: String,
    kind: String,
    health_check: String,
}

#[derive(Deserialize, Clone)]
struct ContractModelNeed {
    id: String,
    required: bool,
    purpose: String,
}

#[derive(Deserialize, Clone)]
struct ContractLifecycle {
    install: String,
    update: String,
    disable: String,
    uninstall: String,
}

#[derive(Serialize, Clone)]
pub struct ModuleSummary {
    pub id: String,
    pub display_name: String,
    pub role: String,
    pub version: Option<String>,
    pub required: bool,
    pub selectable: bool,
    pub installed: bool,
    pub dependencies: Vec<String>,
    pub proof_required: Vec<String>,
}

#[derive(Serialize, Clone)]
pub struct ModuleProfileSummary {
    pub id: String,
    pub label: String,
    pub description: String,
    pub selected: bool,
    pub disabled: bool,
    pub module_count: usize,
}

#[derive(Deserialize, Serialize, Clone)]
pub struct ModuleSelectionState {
    pub profile_id: String,
    pub profile_label: String,
    pub installed_module_ids: Vec<String>,
    pub disabled_module_ids: Vec<String>,
    pub last_updated_unix_seconds: u64,
}

fn now_unix_seconds() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_secs())
        .unwrap_or(0)
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

fn config_dir() -> PathBuf {
    civic_suite_root().join("config")
}

fn module_selection_path() -> PathBuf {
    config_dir().join("module-selection.json")
}

fn parse_registry(registry_json: &str) -> Result<ModuleRegistry, String> {
    serde_json::from_str(registry_json)
        .map_err(|error| format!("Could not parse module registry: {error}"))
}

fn module_index(registry: &ModuleRegistry) -> HashMap<&str, &ModuleDefinition> {
    registry
        .modules
        .iter()
        .map(|module| (module.id.as_str(), module))
        .collect()
}

fn profile_by_id<'a>(
    registry: &'a ModuleRegistry,
    profile_id: &str,
) -> Result<&'a ModuleProfileDefinition, String> {
    registry
        .profiles
        .iter()
        .find(|profile| profile.id == profile_id)
        .ok_or_else(|| format!("Module profile {profile_id} is missing from the registry"))
}

fn require_contract_list(
    module_id: &str,
    field_name: &str,
    length: Option<usize>,
) -> Result<(), String> {
    match length {
        Some(0) | None => Err(format!(
            "Module {module_id} must define non-empty {field_name} for the Windows local contract"
        )),
        Some(_) => Ok(()),
    }
}

fn require_lifecycle(module: &ModuleDefinition) -> Result<(), String> {
    let lifecycle = module.lifecycle.as_ref().ok_or_else(|| {
        format!(
            "Module {} must define lifecycle behavior for install/update/disable/uninstall",
            module.id
        )
    })?;
    for (field_name, value) in [
        ("install", &lifecycle.install),
        ("update", &lifecycle.update),
        ("disable", &lifecycle.disable),
        ("uninstall", &lifecycle.uninstall),
    ] {
        if value.trim().is_empty() {
            return Err(format!(
                "Module {} lifecycle field {field_name} cannot be empty",
                module.id
            ));
        }
    }
    Ok(())
}

fn require_nonempty_value(module_id: &str, field_name: &str, value: &str) -> Result<(), String> {
    if value.trim().is_empty() {
        return Err(format!(
            "Module {module_id} contract field {field_name} cannot be empty"
        ));
    }
    Ok(())
}

fn validate_route_contract(module: &ModuleDefinition) -> Result<(), String> {
    for route in module.routes.as_ref().into_iter().flatten() {
        require_nonempty_value(&module.id, "routes.id", &route.id)?;
        require_nonempty_value(&module.id, "routes.label", &route.label)?;
        require_nonempty_value(&module.id, "routes.path", &route.path)?;
        require_nonempty_value(&module.id, "routes.surface", &route.surface)?;
    }
    Ok(())
}

fn validate_service_contract(module: &ModuleDefinition) -> Result<(), String> {
    for service in module.services.as_ref().into_iter().flatten() {
        require_nonempty_value(&module.id, "services.id", &service.id)?;
        require_nonempty_value(&module.id, "services.kind", &service.kind)?;
        require_nonempty_value(&module.id, "services.health_check", &service.health_check)?;
    }
    Ok(())
}

fn validate_model_contract(module: &ModuleDefinition) -> Result<(), String> {
    for need in module.model_needs.as_ref().into_iter().flatten() {
        require_nonempty_value(&module.id, "model_needs.id", &need.id)?;
        require_nonempty_value(&module.id, "model_needs.purpose", &need.purpose)?;
        if need.required && need.id != "gemma-4-12b-it-qat-q4_0" {
            return Err(format!(
                "Module {} requires unsupported local model {}",
                module.id, need.id
            ));
        }
    }
    Ok(())
}

fn validate_installable_module_contract(module: &ModuleDefinition) -> Result<(), String> {
    if module.display_name.trim().is_empty() || module.role.trim().is_empty() {
        return Err(format!(
            "Module {} must define display name and role",
            module.id
        ));
    }
    if module.current_version.is_none() {
        return Err(format!("Module {} must define current_version", module.id));
    }
    if module.id != "civiccore" && module.civiccore_requirement.as_deref() != Some("1.2.0") {
        return Err(format!(
            "Module {} must target CivicCore 1.2.0 for Windows Local 1.0",
            module.id
        ));
    }
    require_contract_list(&module.id, "routes", module.routes.as_ref().map(Vec::len))?;
    require_contract_list(
        &module.id,
        "permissions",
        module.permissions.as_ref().map(Vec::len),
    )?;
    require_contract_list(
        &module.id,
        "services",
        module.services.as_ref().map(Vec::len),
    )?;
    require_contract_list(
        &module.id,
        "migrations",
        module.migrations.as_ref().map(Vec::len),
    )?;
    require_contract_list(&module.id, "tasks", module.tasks.as_ref().map(Vec::len))?;
    require_contract_list(
        &module.id,
        "backup_restore_hooks",
        module.backup_restore_hooks.as_ref().map(Vec::len),
    )?;
    require_contract_list(
        &module.id,
        "proof_required",
        Some(module.proof_required.len()),
    )?;
    if module.model_needs.is_none() {
        return Err(format!(
            "Module {} must declare model_needs, even when none are required",
            module.id
        ));
    }
    validate_route_contract(module)?;
    validate_service_contract(module)?;
    validate_model_contract(module)?;
    require_lifecycle(module)
}

fn validate_profile(registry: &ModuleRegistry, profile_id: &str) -> Result<(), String> {
    if registry.schema_version != 1 {
        return Err(format!(
            "Unsupported module registry schema {}",
            registry.schema_version
        ));
    }
    if registry.module_contract_version != 1 {
        return Err(format!(
            "Unsupported module contract version {}",
            registry.module_contract_version
        ));
    }

    let profile = profile_by_id(registry, profile_id)?;
    if profile.disabled {
        return Err(format!("Module profile {profile_id} is disabled"));
    }
    if !profile
        .modules
        .iter()
        .any(|module_id| module_id == "civiccore")
    {
        return Err(format!(
            "Module profile {profile_id} must include CivicCore"
        ));
    }
    let module_map = module_index(registry);
    let selected_ids: HashSet<&str> = profile.modules.iter().map(String::as_str).collect();
    for module_id in &profile.modules {
        let module = module_map
            .get(module_id.as_str())
            .ok_or_else(|| format!("Profile {profile_id} references unknown module {module_id}"))?;
        for dependency in &module.dependencies {
            if !selected_ids.contains(dependency.as_str()) {
                return Err(format!(
                    "Module {module_id} dependency {dependency} is not selected in profile {profile_id}"
                ));
            }
        }
        validate_installable_module_contract(module)?;
    }
    for module in &registry.modules {
        if module.required && !selected_ids.contains(module.id.as_str()) {
            return Err(format!(
                "Required module {} is not selected in profile {profile_id}",
                module.id
            ));
        }
    }
    Ok(())
}

fn selection_for_profile(
    registry: &ModuleRegistry,
    profile_id: &str,
) -> Result<ModuleSelectionState, String> {
    validate_profile(registry, profile_id)?;
    let profile = profile_by_id(registry, profile_id)?;
    let installed_module_ids = profile.modules.clone();
    let installed: HashSet<&str> = installed_module_ids.iter().map(String::as_str).collect();
    let disabled_module_ids = registry
        .modules
        .iter()
        .filter(|module| !installed.contains(module.id.as_str()))
        .map(|module| module.id.clone())
        .collect();
    Ok(ModuleSelectionState {
        profile_id: profile.id.clone(),
        profile_label: profile.label.clone(),
        installed_module_ids,
        disabled_module_ids,
        last_updated_unix_seconds: now_unix_seconds(),
    })
}

fn read_saved_selection() -> Result<Option<ModuleSelectionState>, String> {
    let path = module_selection_path();
    if !path.is_file() {
        return Ok(None);
    }
    let contents = fs::read_to_string(&path)
        .map_err(|error| format!("Could not read module selection: {error}"))?;
    serde_json::from_str(&contents)
        .map(Some)
        .map_err(|error| format!("Could not parse module selection: {error}"))
}

fn write_selection(selection: &ModuleSelectionState) -> Result<(), String> {
    let path = module_selection_path();
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .map_err(|error| format!("Could not create {}: {error}", parent.display()))?;
    }
    let contents = serde_json::to_string_pretty(selection)
        .map_err(|error| format!("Could not serialize module selection: {error}"))?;
    fs::write(&path, format!("{contents}\n"))
        .map_err(|error| format!("Could not write {}: {error}", path.display()))
}

pub fn validate_default_registry() -> Result<(), String> {
    let registry = parse_registry(MODULES_JSON)?;
    validate_profile(&registry, DEFAULT_PROFILE_ID)
}

pub fn persist_profile_selection(profile_id: &str) -> Result<ModuleSelectionState, String> {
    let registry = parse_registry(MODULES_JSON)?;
    let selection = selection_for_profile(&registry, profile_id)?;
    write_selection(&selection)?;
    Ok(selection)
}

pub fn module_selection_state() -> Result<ModuleSelectionState, String> {
    let registry = parse_registry(MODULES_JSON)?;
    let selection = match read_saved_selection()? {
        Some(selection) => selection,
        None => selection_for_profile(&registry, DEFAULT_PROFILE_ID)?,
    };
    validate_profile(&registry, &selection.profile_id)?;
    let profile = profile_by_id(&registry, &selection.profile_id)?;
    let expected: HashSet<&str> = profile.modules.iter().map(String::as_str).collect();
    let actual: HashSet<&str> = selection
        .installed_module_ids
        .iter()
        .map(String::as_str)
        .collect();
    if expected != actual {
        return Err(
            "Saved module selection does not match the selected profile contract".to_string(),
        );
    }
    Ok(selection)
}

pub fn module_profiles() -> Result<Vec<ModuleProfileSummary>, String> {
    let registry = parse_registry(MODULES_JSON)?;
    let selection = module_selection_state()?;
    Ok(registry
        .profiles
        .iter()
        .map(|profile| ModuleProfileSummary {
            id: profile.id.clone(),
            label: profile.label.clone(),
            description: profile.description.clone(),
            selected: profile.id == selection.profile_id,
            disabled: profile.disabled,
            module_count: profile.modules.len(),
        })
        .collect())
}

pub fn module_summaries() -> Result<Vec<ModuleSummary>, String> {
    let registry = parse_registry(MODULES_JSON)?;
    validate_profile(&registry, DEFAULT_PROFILE_ID)?;
    let selection = module_selection_state()?;
    let installed_ids: HashSet<&str> = selection
        .installed_module_ids
        .iter()
        .map(String::as_str)
        .collect();

    Ok(registry
        .modules
        .iter()
        .map(|module| ModuleSummary {
            installed: installed_ids.contains(module.id.as_str()),
            id: module.id.clone(),
            display_name: module.display_name.clone(),
            role: module.role.clone(),
            version: module.current_version.clone(),
            required: module.required,
            selectable: module.selectable,
            dependencies: module.dependencies.clone(),
            proof_required: module.proof_required.clone(),
        })
        .collect())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::first_run;

    fn with_temp_state_dir<T>(test: impl FnOnce(PathBuf) -> T) -> T {
        let _guard = first_run::test_env_lock().lock().expect("test env lock");
        let root = env::temp_dir().join(format!(
            "civicsuite-desktop-module-registry-test-{}",
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
    fn city_core_registry_contract_covers_installable_modules() {
        validate_default_registry().expect("city-core registry validates");
    }

    #[test]
    fn module_selection_defaults_to_city_core_profile() {
        with_temp_state_dir(|_| {
            let selection = module_selection_state().expect("selection state builds");
            assert_eq!(selection.profile_id, "city-core");
            assert_eq!(
                selection.installed_module_ids,
                vec![
                    "civiccore".to_string(),
                    "civicrecords-ai".to_string(),
                    "civicclerk".to_string(),
                    "civiccode".to_string()
                ]
            );
        });
    }

    #[test]
    fn persisting_profile_selection_writes_local_registry_state() {
        with_temp_state_dir(|root| {
            let selection =
                persist_profile_selection("city-core").expect("profile selection persists");
            assert_eq!(selection.profile_label, "City Core");
            assert!(root.join("config").join("module-selection.json").is_file());
        });
    }

    #[test]
    fn profile_summaries_mark_active_profile() {
        with_temp_state_dir(|_| {
            persist_profile_selection("city-core").expect("profile selection persists");
            let profiles = module_profiles().expect("profiles build");
            assert!(profiles
                .iter()
                .any(|profile| profile.id == "city-core" && profile.selected));
        });
    }
}
