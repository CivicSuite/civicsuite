"""Tests for the CivicSuite module package registry contract."""

from __future__ import annotations

import copy
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts" / "verify-module-manifest-contract.py"
REGISTRY = ROOT / "installer" / "modules.json"
CONTRACT = ROOT / "installer" / "module-manifest-contract.json"


def _load_verifier():
    spec = importlib.util.spec_from_file_location(
        "verify_module_manifest_contract", SCRIPT
    )
    assert spec is not None
    assert spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def _registry() -> dict[str, object]:
    return json.loads(REGISTRY.read_text(encoding="utf-8"))


def _contract() -> dict[str, object]:
    return json.loads(CONTRACT.read_text(encoding="utf-8"))


def test_current_registry_satisfies_module_manifest_contract() -> None:
    verifier = _load_verifier()
    errors = verifier.validate_manifest_data(_registry(), _contract())
    assert errors == []


def test_city_core_profile_keeps_windows_local_1_modules_in_order() -> None:
    data = _registry()
    profiles = {profile["id"]: profile for profile in data["profiles"]}
    assert profiles["city-core"]["modules"] == [
        "civiccore",
        "civicrecords-ai",
        "civicclerk",
        "civiccode",
        "civicnotice",
        "civicaccess",
    ]
    assert profiles["custom"]["modules"] == []


def test_records_beta_profile_is_dependency_closed_without_clerk() -> None:
    data = _registry()
    profiles = {profile["id"]: profile for profile in data["profiles"]}
    modules = {module["id"]: module for module in data["modules"]}

    assert profiles["records-beta"]["modules"] == [
        "civiccore",
        "civicrecords-ai",
        "civicnotice",
        "civicaccess",
    ]
    assert modules["civicnotice"]["dependencies"] == ["civiccore"]


def test_planned_modules_without_runtime_repos_are_not_selectable() -> None:
    data = _registry()
    planned = {
        module["id"]: module for module in data["modules"] if module.get("repo") is None
    }
    assert planned.keys() == {"civicregwatch", "civicapi"}
    for module in planned.values():
        assert module["selectable"] is False
        assert module["installer_status"] == "planned_spec_module_no_runtime_repo"


def test_promoted_ready_module_requires_version_and_source_commit() -> None:
    verifier = _load_verifier()
    data = copy.deepcopy(_registry())
    contract = _contract()
    for module in data["modules"]:
        if module["id"] == "civiccode":
            module.pop("source_commit")
            module["installer_status"] = "v1_0_8_city_core_release_car"
            break

    errors = verifier.validate_manifest_data(data, contract)

    assert any(
        "civiccode missing required field source_commit" in error for error in errors
    )


def test_installed_module_release_requires_source_commit() -> None:
    verifier = _load_verifier()
    data = copy.deepcopy(_registry())
    contract = _contract()
    for module in data["modules"]:
        if module["id"] == "civicnotice":
            module.pop("source_commit")
            module["installer_status"] = "v0_2_0_installed_module_release"
            break

    errors = verifier.validate_manifest_data(data, contract)

    assert any(
        "civicnotice missing required field source_commit" in error for error in errors
    )
