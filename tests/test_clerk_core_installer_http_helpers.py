"""HTTP helper resilience for installer lifecycle verification."""

from __future__ import annotations

import importlib.util
import sys
from pathlib import Path


UMBRELLA_ROOT = Path(__file__).resolve().parents[1]


def _load_installer_module() -> object:
    module_path = UMBRELLA_ROOT / "scripts" / "run-clerk-core-installer.py"
    spec = importlib.util.spec_from_file_location("run_clerk_core_installer_for_tests", module_path)
    assert spec is not None
    assert spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def test_decode_json_preserves_non_json_http_body_as_diagnostic_payload() -> None:
    installer = _load_installer_module()

    payload = installer.decode_json("Service Unavailable")

    assert payload == {
        "detail": {
            "message": "Received non-JSON HTTP response.",
            "raw_body": "Service Unavailable",
        }
    }


def test_decode_json_wraps_json_scalars_for_dict_callers() -> None:
    installer = _load_installer_module()

    assert installer.decode_json('"created"') == {"detail": "created"}
