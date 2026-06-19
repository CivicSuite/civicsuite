# Audit Lite - Windows model runtime payload source

Date: 2026-06-16
Branch: `work/windows-local-1-design-contract`
Scope: Fix for `TESTER-RESULT-076.md` where `Load in Ollama` still left
System Health at `Needs runtime` because the installed app did not start the
bundled Ollama runtime from the Windows MSI payload.

## Findings

No unresolved Blocker/Critical/Major/Minor/Nit findings for this slice.

## Evidence Reviewed

- `desktop/src-tauri/src/supervisor.rs`
  - Runtime install/start now honors the saved first-run install root when
    `CIVICSUITE_RUNTIME_ROOT` is not set.
  - Runtime payload discovery now includes the Tauri/MSI `_up_/runtime/payload`
    layout observed in the installed program files.
  - Tests cover saved install-root resolution and `_up_` payload discovery.
- `desktop/src-tauri/src/model.rs`
  - The model runtime start path now prepares the `model-runtime` payload before
    starting the service.
  - The Windows `ollama` command path no longer falls back to a user-global
    `ollama.exe`; it uses the bundled runtime path after install/repair.
  - Tests cover the bundled runtime path selection.

## Verification

- `cargo fmt --check`
- `cargo test model_runtime_start -- --test-threads=1`
- `cargo test windows_ollama_executable_uses_bundled_runtime_path -- --test-threads=1`
- `cargo test executable_payload_roots_include_tauri_up_payload_dir -- --test-threads=1`
- `cargo test runtime_root_uses_saved_install_location_without_env_override -- --test-threads=1`
- `cargo test -- --test-threads=1`
- `npm --prefix desktop test`
- `npm --prefix desktop run test:browser -- desktop/tests/browser/model-readiness.spec.mjs`
- `npm --prefix desktop run build`
- `bash scripts/verify-docs.sh`
- `python scripts/verify-deployment-profile.py --static-only`
- `python scripts/policy/check_stage_evidence.py`
- `git diff --check`

## Residual Risk

The remaining release gate is cleanroom Windows evidence that the packaged
`_up_/runtime/payload/ollama/ollama.exe` is copied into the selected local
runtime root, starts with `OLLAMA_MODELS` under the CivicSuite data profile, and
answers `http://127.0.0.1:15434/api/tags` before model creation runs.
