# Audit Lite: Windows Model Download Oversized Partial

Date: 2026-06-16
Scope: PR #192 Windows Local cleanroom follow-up for TESTER-RESULT-078.md.

## Findings

No unresolved Blocker, Critical, Major, Minor, or Nit findings for this slice.

## Trigger

TESTER-RESULT-078.md failed the city-core gate after the runtime payload-lock BOM fix passed at the installed file level. The app created an oversized Gemma `.gguf.part` file (`7093023328` bytes vs pinned `6975877728` bytes), reported `Download failed`, and retry/resume preserved the unrecoverable partial instead of repairing or discarding it.

## Fix Reviewed

- [desktop/src-tauri/src/model.rs](../../desktop/src-tauri/src/model.rs): caps model download progress at 100% so invalid oversized partials do not display as 101% complete.
- [desktop/src-tauri/src/model.rs](../../desktop/src-tauri/src/model.rs): only sends curl resume flags when a smaller-than-pinned partial exists; clean downloads no longer start in resume mode.
- [desktop/src-tauri/src/model.rs](../../desktop/src-tauri/src/model.rs): finalizes complete partials by checksum, repairs oversized partials when truncation yields the pinned checksum, discards corrupt oversized partials, and retries once from a clean download when needed.
- [desktop/src-tauri/src/model.rs](../../desktop/src-tauri/src/model.rs): adds regression tests for oversized partial progress, valid oversized partial repair/registration, and corrupt oversized partial cleanup for clean retry.

## Evidence

- Upstream metadata check: Hugging Face API and HEAD response still report the pinned GGUF size `6975877728` and SHA-256 `faff1a63667fac17ac5e777f47114688fcefea96e220e211aaa8d62c2c4561f1`; the tester's oversized file was not accepted as new metadata.
- `cargo fmt --check`
- `cargo test partial -- --test-threads=1`
- `cargo test -- --test-threads=1`
- `npm --prefix desktop test`
- `npm --prefix desktop run test:browser -- desktop/tests/browser/model-readiness.spec.mjs`
- `npm --prefix desktop run build`
- `bash scripts/verify-docs.sh`
- `python scripts/verify-deployment-profile.py --static-only`
- `python scripts/policy/check_stage_evidence.py`
- `git diff --check`

## Residual Risk

This still needs a fresh Windows Local MSI and cleanroom-equivalent tester pass. TESTER-DIRECTIVE-079 should verify that retry/resume no longer leaves a 101% partial, that the model reaches verified/registered state from clean local data, and then continue the bundled Ollama/runtime and full city-core gate.
