# Audit Lite: CivicNotice Cleanroom Source Checkout

Date: 2026-06-19

Scope:
- `.github/workflows/installer-cleanroom.yml`
- `scripts/verify-installer-plan.py`

Intent:
- Fix the city-core cleanroom lifecycle failure where the generated archive bundled `modules/civicnotice` with the PR merge commit instead of the pinned CivicNotice source commit.

Findings:
- 0 Critical
- 0 High
- 0 Medium
- 0 Low
- 0 Watchlist

Evidence:
- `.github/workflows/installer-cleanroom.yml:95` checks out `CivicSuite/civicnotice` for package readiness/archive generation.
- `.github/workflows/installer-cleanroom.yml:171` checks out `CivicSuite/civicnotice` for Linux package lifecycle proof.
- `.github/workflows/installer-cleanroom.yml:99` and `.github/workflows/installer-cleanroom.yml:175` pin the checkout to `2bf0c9d7b764af84cd042657a972e84213a261d5`.
- `scripts/verify-installer-plan.py:478` through `scripts/verify-installer-plan.py:480` enforce the CivicNotice checkout repository, path, and pinned ref in the cleanroom workflow.

Verification:
- `python scripts\verify-installer-plan.py`: passed.
- `python -m py_compile scripts\verify-installer-plan.py scripts\plan-installer.py scripts\run-clerk-core-installer.py`: passed.
- `python -m pytest tests\test_clerk_core_installer_http_helpers.py`: 7 passed.
- `git diff --check`: passed with line-ending warnings only.

Residual Risk:
- None for this scoped fix. The full release proof still depends on GitHub Actions rerunning installer-cleanroom and desktop-windows-msi on the pushed PR head.
