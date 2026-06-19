# Audit Lite - Windows model test isolation

## Scope

- Change under audit: `desktop/src-tauri/src/model.rs`
- Goal: fix the Windows Local MSI CI failure in `model::tests::model_state_blocks_missing_runtime_and_registry` without changing product model-readiness behavior.
- Blast radius: Rust model-readiness unit test fixture isolation only.

## Findings

No findings.

- Blocker: 0
- Critical: 0
- Major: 0
- Minor: 0
- Nit: 0

## Evidence

- The failing CI log showed `model_state_blocks_missing_runtime_and_registry` expected `Needs download` but observed `Partial download` after the MSI workflow prepared the runtime payload.
- The test now runs under the existing `with_temp_state_dir` helper at `desktop/src-tauri/src/model.rs:1468`, matching the isolation used by neighboring model-state tests.
- The helper at `desktop/src-tauri/src/model.rs:1671` serializes state-dir tests with `test_env_lock`, sets `CIVICSUITE_DESKTOP_STATE_DIR`, and removes the temp directory after the test.

## Verification

- `cargo test model_state_blocks_missing_runtime_and_registry -- --test-threads=1 --nocapture`: passed.
- `cargo test -- --test-threads=1`: passed, 110 tests.
- `cargo fmt --check`: passed.
- `git diff --check`: passed, with only Git line-ending warnings.

## Residual Risk

No product behavior was changed. The fix only prevents the test from reading repo-local or CI-prepared model state when asserting the empty-machine baseline.
