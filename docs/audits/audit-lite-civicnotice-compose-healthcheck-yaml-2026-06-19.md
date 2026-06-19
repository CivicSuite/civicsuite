# Audit Lite: CivicNotice Compose Healthcheck YAML

Date: 2026-06-19

Scope:
- `scripts/run-clerk-core-installer.py`
- `tests/test_clerk_core_installer_http_helpers.py`

Intent:
- Fix the city-core Linux package lifecycle failure where generated CivicNotice `docker-compose.yml` failed to parse with `yaml: line 27: did not find expected ',' or ']'`.

Findings:
- 0 Critical
- 0 High
- 0 Medium
- 0 Low
- 0 Watchlist

Evidence:
- `scripts/run-clerk-core-installer.py:951` emits the CivicNotice healthcheck as a block-list YAML sequence instead of a fragile inline quoted array.
- `scripts/run-clerk-core-installer.py:954` preserves the same health endpoint check command.
- `tests/test_clerk_core_installer_http_helpers.py:210` adds a regression for generated CivicNotice compose output.
- `tests/test_clerk_core_installer_http_helpers.py:221` asks Docker Compose to parse the generated YAML when Docker is present.

Verification:
- `python -m pytest tests\test_clerk_core_installer_http_helpers.py`: 8 passed.
- `python -m py_compile scripts\run-clerk-core-installer.py scripts\verify-installer-plan.py scripts\plan-installer.py`: passed.
- `python scripts\verify-installer-plan.py`: passed.
- `git diff --check`: passed with line-ending warnings only.

Residual Risk:
- None for this scoped fix. GitHub Actions still needs to rerun the full city-core package lifecycle and Windows MSI gates on the pushed head.
