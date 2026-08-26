"""Contract tests for the embedded Townlight product-profile boundary."""

from __future__ import annotations

import sys
from pathlib import Path

import pytest

RUNTIME_ROOT = (
    Path(__file__).resolve().parents[1]
    / "desktop"
    / "runtime"
    / "python-services"
)
sys.path.insert(0, str(RUNTIME_ROOT))

from civicsuite_runtime import services


def test_records_beta_is_the_default_embedded_runtime_profile(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv(services.PRODUCT_PROFILE_ENV, raising=False)

    profile = services._product_profile()
    assert profile == "records-beta"
    assert services._required_module_imports(profile) == [
        ("civiccore", "civiccore"),
        ("civicrecords-ai", "app.main"),
        ("civicnotice", "civicnotice.main"),
        ("civicaccess", "civicaccess.main"),
    ]


def test_city_core_is_an_explicit_compatibility_profile(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv(services.PRODUCT_PROFILE_ENV, "city-core")

    assert services._required_module_imports(services._product_profile()) == [
        ("civiccore", "civiccore"),
        ("civicrecords-ai", "app.main"),
        ("civicnotice", "civicnotice.main"),
        ("civicaccess", "civicaccess.main"),
        ("civicclerk", "civicclerk.main"),
        ("civiccode", "civiccode.main"),
    ]


def test_unknown_embedded_runtime_profile_fails_closed(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv(services.PRODUCT_PROFILE_ENV, "not-a-product")

    with pytest.raises(RuntimeError, match="Unsupported Townlight product profile"):
        services._product_profile()
