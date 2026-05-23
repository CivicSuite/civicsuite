from {{MODULE_PACKAGE_NAME}}.app import health


def test_health_contract() -> None:
    assert health()["status"] == "ok"

