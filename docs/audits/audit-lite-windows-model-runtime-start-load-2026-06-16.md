# Audit Lite - Windows model runtime start/load

Date: 2026-06-16
Branch: `work/windows-local-1-design-contract`
Scope: Fix for `TESTER-RESULT-075.md` full-gate failure where a verified Gemma
model could not be loaded because the local Ollama endpoint at
`http://127.0.0.1:15434/api/tags` was not responding.

## Findings

No unresolved Blocker/Critical/Major/Minor/Nit findings for this slice.

## Evidence Reviewed

- `desktop/src-tauri/src/model.rs`
  - `load-runtime-model` now calls the runtime start/wait path before returning
    an unreachable-runtime error.
  - `ensure_model_runtime_reachable` starts `model-runtime` through the
    supervisor and waits for the local Ollama endpoint before running the
    model-load command.
  - Tests cover successful start/wait and plain failure messaging.
- `desktop/src-tauri/src/supervisor.rs`
  - The model runtime service now receives `OLLAMA_HOST=127.0.0.1:15434`.
  - The model runtime service now receives `OLLAMA_MODELS` under the
    CivicSuite local data profile.
  - The supervisor creates the local Ollama model store folder and starts
    services from their binary folder.
  - Tests cover the local model-store environment and folder creation.

## Verification

- `cargo fmt --check`
- `cargo test model_runtime_start -- --test-threads=1`
- `cargo test model_runtime_environment_uses_local_model_store -- --test-threads=1`
- `cargo test -- --test-threads=1`
- `npm --prefix desktop test`
- `npm --prefix desktop run test:browser -- desktop/tests/browser/model-readiness.spec.mjs`
- `npm --prefix desktop run build`
- `bash scripts/verify-docs.sh`
- `python scripts/verify-deployment-profile.py --static-only`
- `python scripts/policy/check_stage_evidence.py`
- `git diff --check`

## Residual Risk

The key remaining risk is runtime-specific and must be rechecked by the
cleanroom-equivalent Windows MSI test: the bundled `ollama.exe serve` process
must stay alive and answer `http://127.0.0.1:15434/api/tags` on the tester
machine before the model-load command can succeed. Local unit tests verify the
control flow and environment contract without launching the real 6.9 GB model.
