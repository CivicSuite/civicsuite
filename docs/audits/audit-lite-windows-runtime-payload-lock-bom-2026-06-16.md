# Audit Lite: Windows Runtime Payload Lock BOM

Date: 2026-06-16
Scope: PR #192 Windows Local cleanroom follow-up for TESTER-RESULT-077.md.

## Trigger

TESTER-RESULT-077.md failed the bundled Ollama payload-source gate. The MSI installed and the first-admin/model flow passed, but System Health stayed at "Needs runtime" because the installed runtime payload lock could not be parsed:

`Could not parse C:\Program Files\CivicSuite\_up_\runtime\payload\runtime-payload-lock.json: expected value at line 1 column 1`

The clean-machine evidence showed the bundled payload existed, but CivicSuite did not install/start the bundled runtime and the only observed Ollama process was the user-global executable.

## Fix Reviewed

- `desktop/scripts/prepare-runtime-payload.ps1` now writes `runtime-payload-lock.json` as UTF-8 without a BOM so future MSI payload locks parse cleanly.
- `desktop/src-tauri/src/supervisor.rs` now tolerates an existing UTF-8 BOM when reading payload locks, so already-produced or externally generated payloads are not rejected at byte zero.
- `desktop/src-tauri/src/model.rs` now passes `OLLAMA_MODELS` to the `ollama create` client process so model load uses the CivicSuite local model store consistently with the bundled runtime server.

## Findings

No unresolved Blocker, Critical, Major, Minor, or Nit findings for this slice.

## Evidence

- `cargo fmt --check`
- PowerShell parser check for `desktop/scripts/prepare-runtime-payload.ps1`
- `cargo test supervisor_install_accepts_utf8_bom_payload_lock -- --test-threads=1`
- `cargo test ollama_models_dir_uses_local_data_store -- --test-threads=1`
- `cargo test -- --test-threads=1`
- `npm --prefix desktop test`
- `npm --prefix desktop run test:browser -- desktop/tests/browser/model-readiness.spec.mjs`
- `npm --prefix desktop run build`
- `bash scripts/verify-docs.sh`
- `python scripts/verify-deployment-profile.py --static-only`
- `python scripts/policy/check_stage_evidence.py`
- `git diff --check`

## Residual Risk

The fix still needs a new CI-built MSI and cleanroom-equivalent tester pass. TESTER-DIRECTIVE-078 should verify that the bundled runtime payload installs from the MSI, the Ollama process path is CivicSuite-managed rather than user-global, `http://127.0.0.1:15434/api/tags` becomes reachable, and System Health advances past "Needs runtime."
