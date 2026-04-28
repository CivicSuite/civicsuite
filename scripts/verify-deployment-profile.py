"""Verify the post-foundation local demo deployment profile.

This is a profile guard, not a production readiness certification. It verifies
that the umbrella deployment docs/compose file stay aligned with the current
bounded demo target: CivicRecords AI + CivicClerk + CivicCode + CivicZone with
local-first defaults and no cloud LLM provider enabled by default.
"""

from __future__ import annotations

import json
import os
import socket
import subprocess
import sys
from contextlib import contextmanager
from pathlib import Path
from typing import Any

import yaml
from fastapi.testclient import TestClient


ROOT = Path(__file__).resolve().parents[1]
WORKSPACE = ROOT.parent
COMPOSE_FILE = ROOT / "deploy" / "post-foundation-demo.compose.yml"
DOC_FILE = ROOT / "docs" / "deployment" / "local-demo-profile.md"
EXPECTED_SERVICES = {
    "postgres",
    "redis",
    "ollama",
    "civicrecords-api",
    "civicrecords-frontend",
    "civicclerk",
    "civiccode",
    "civiczone",
}
MODULE_SERVICES = {
    "civicclerk": ("civicclerk.main", "app", "0.1.0", 8010, "0.2.0"),
    "civiccode": ("civiccode.main", "app", "0.1.1", 8020, "0.3.0"),
    "civiczone": ("civiczone.main", "app", "0.1.0", 8030, "0.2.0"),
}
LOCAL_CIVICCORE_VERSION = "0.3.0"
FORBIDDEN_PROVIDER_VALUES = {"openai", "anthropic"}


def fail(message: str) -> str:
    return f"FAIL: {message}"


def load_compose() -> dict[str, Any]:
    with COMPOSE_FILE.open(encoding="utf-8") as handle:
        data = yaml.safe_load(handle)
    if not isinstance(data, dict):
        raise AssertionError("compose file did not parse to a mapping")
    return data


def run_compose_config() -> list[str]:
    proc = subprocess.run(
        ["docker", "compose", "-f", str(COMPOSE_FILE), "config", "--quiet"],
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=False,
    )
    if proc.returncode != 0:
        return [fail(f"docker compose config failed: {(proc.stderr or proc.stdout).strip()}")]
    return []


def check_compose(compose: dict[str, Any]) -> list[str]:
    errors = []
    services = compose.get("services")
    if not isinstance(services, dict):
        return [fail("compose file has no services mapping")]

    missing = EXPECTED_SERVICES - set(services)
    if missing:
        errors.append(fail(f"missing services: {', '.join(sorted(missing))}"))

    for service_name in ("civicclerk", "civiccode", "civiczone"):
        service = services.get(service_name, {})
        if not isinstance(service, dict):
            errors.append(fail(f"{service_name} service is not a mapping"))
            continue
        command = json.dumps(service.get("command", ""))
        expected_module = MODULE_SERVICES[service_name]
        expected_release_core = expected_module[4]
        expected_service_version = expected_module[2]
        if f"civiccore-{expected_release_core}" not in command:
            errors.append(fail(f"{service_name} command does not install civiccore {expected_release_core} wheel"))
        if f"{service_name}-{expected_service_version}" not in command:
            errors.append(fail(f"{service_name} command does not install {service_name} {expected_service_version} wheel"))
        env = service.get("environment", {})
        if not isinstance(env, dict):
            errors.append(fail(f"{service_name} environment is not a mapping"))
            continue
        provider = str(env.get("CIVICCORE_LLM_PROVIDER", "")).lower()
        if provider != "ollama":
            errors.append(fail(f"{service_name} default CIVICCORE_LLM_PROVIDER is {provider!r}, expected 'ollama'"))
        if provider in FORBIDDEN_PROVIDER_VALUES:
            errors.append(fail(f"{service_name} defaults to cloud LLM provider {provider!r}"))

    records_env = services.get("civicrecords-api", {}).get("environment", {})
    if isinstance(records_env, dict):
        provider = str(records_env.get("CIVICCORE_LLM_PROVIDER", "")).lower()
        if provider != "ollama":
            errors.append(fail(f"civicrecords-api default CIVICCORE_LLM_PROVIDER is {provider!r}, expected 'ollama'"))
    else:
        errors.append(fail("civicrecords-api environment is not a mapping"))

    return errors


def check_docs() -> list[str]:
    errors = []
    if not DOC_FILE.is_file():
        return [fail(f"missing deployment doc {DOC_FILE.relative_to(ROOT)}")]
    text = DOC_FILE.read_text(encoding="utf-8")
    required_phrases = (
        "evaluation profile, not production packaging",
        "CivicRecords AI + CivicClerk + CivicCode + CivicZone",
        "No-Network Meaning",
        "Production Pilot Install",
        "Do not treat this compose file as production pilot packaging",
    )
    for phrase in required_phrases:
        if phrase not in text:
            errors.append(fail(f"deployment doc missing phrase: {phrase}"))
    return errors


@contextmanager
def block_outbound_sockets():
    original_create_connection = socket.create_connection

    def blocked_create_connection(*args: Any, **kwargs: Any) -> Any:
        raise AssertionError(f"outbound socket blocked during no-network smoke: {args!r} {kwargs!r}")

    socket.create_connection = blocked_create_connection
    try:
        yield
    finally:
        socket.create_connection = original_create_connection


def check_module_health_without_network() -> list[str]:
    errors = []
    os.environ.setdefault("CIVICCORE_LLM_PROVIDER", "ollama")
    sys.path.insert(0, str(WORKSPACE / "civiccore"))
    for module_name in MODULE_SERVICES:
        sys.path.insert(0, str(WORKSPACE / module_name))
    with block_outbound_sockets():
        for module_name, (import_path, app_name, expected_version, _port, _release_core_version) in MODULE_SERVICES.items():
            module = __import__(import_path, fromlist=[app_name])
            app = getattr(module, app_name)
            client = TestClient(app)
            response = client.get("/health")
            if response.status_code != 200:
                errors.append(fail(f"{module_name} /health returned {response.status_code}: {response.text}"))
                continue
            payload = response.json()
            if payload.get("version") != expected_version:
                errors.append(
                    fail(f"{module_name} /health version {payload.get('version')!r} != {expected_version!r}")
                )
            civiccore_version = payload.get("civiccore_version") or payload.get("civiccore")
            if civiccore_version != LOCAL_CIVICCORE_VERSION:
                errors.append(
                    fail(
                        f"{module_name} /health civiccore version {civiccore_version!r} "
                        f"!= {LOCAL_CIVICCORE_VERSION!r}"
                    )
                )
    return errors


def main() -> int:
    print("==> Deployment profile verification")
    errors = []
    if not COMPOSE_FILE.is_file():
        errors.append(fail(f"missing compose file {COMPOSE_FILE.relative_to(ROOT)}"))
    else:
        compose = load_compose()
        errors.extend(check_compose(compose))
        errors.extend(run_compose_config())
    errors.extend(check_docs())
    errors.extend(check_module_health_without_network())

    if errors:
        for error in errors:
            print(error)
        print("VERIFY-DEPLOYMENT-PROFILE: FAILED")
        return 1
    print("VERIFY-DEPLOYMENT-PROFILE: PASSED")
    return 0


if __name__ == "__main__":
    sys.exit(main())
