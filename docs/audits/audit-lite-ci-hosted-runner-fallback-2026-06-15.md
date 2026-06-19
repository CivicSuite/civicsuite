# Audit Lite: CI Hosted Runner Fallback

Date: 2026-06-15
Scope: PR #192 CI runner availability for `verify` and `installer-cleanroom`.

## Verdict

PASS - 0 Blocker / 0 Critical / 0 Major / 0 Minor / 0 Nit findings for this slice.

## Evidence

- `gh api repos/CivicSuite/civicsuite/actions/runners` showed all repo self-hosted Linux runners offline while PR #192 `verify` and several `installer-cleanroom` jobs remained queued.
- `.github/workflows/verify.yml` now runs on `ubuntu-latest` and installs Chromium with Playwright system dependencies through `npx playwright install --with-deps chromium`.
- `.github/workflows/installer-cleanroom.yml` now uses `ubuntu-latest` for non-Windows archive readiness and Linux package lifecycle jobs. Windows archive/MSI paths remain on GitHub-hosted Windows runners.
- YAML parse check passed for both changed workflow files.
- `git diff --check -- .github/workflows/verify.yml .github/workflows/installer-cleanroom.yml` passed.
- `python scripts/verify-deployment-profile.py --static-only` passed.
- `python scripts/policy/check_stage_evidence.py` passed.

## Residual Risk

The full GitHub-hosted workflow result must still be observed on the pushed PR head. This change only removes the offline self-hosted Linux runner dependency; it does not alter application runtime behavior or the Windows MSI artifact under cleanroom test.
