# Audit Lite: Linux Cleanroom CivicClerk Rolldown Musl Binding

Date: 2026-06-18
Scope: PR #192 installer-cleanroom failure for the clerk-core Linux archive lifecycle.

## Finding

The Linux cleanroom lifecycle failed while building the bundled CivicClerk frontend image on `node:24-alpine`. Vite/Rolldown could not load `@rolldown/binding-linux-x64-musl` during `npm run build`, even though the CivicClerk package lock records that optional dependency.

## Fix

The installer lifecycle now normalizes the copied CivicClerk source before Docker compose build. When the frontend lockfile declares the Rolldown musl binding, the generated Dockerfile installs the exact locked `@rolldown/binding-linux-x64-musl` version after `npm ci` and before `npm run build`.

## Evidence

- Added regression: `test_normalize_clerk_frontend_dockerfile_installs_rolldown_musl_binding`.
- `python -m pytest tests/test_clerk_core_installer_http_helpers.py -q` passed.
- `python scripts/verify-installer-plan.py` passed.
- `python -m pytest tests scripts/policy -q` passed.
- `bash scripts/verify-docs.sh` passed.
- `python scripts/verify-deployment-profile.py --static-only` passed.
- `python scripts/policy/check_stage_evidence.py` passed.

Docker Desktop was not running locally, so the exact container build could not be reproduced on this Windows host. The patch targets the failed Dockerfile build step directly and is covered by generated-file regression plus installer-plan verification.
