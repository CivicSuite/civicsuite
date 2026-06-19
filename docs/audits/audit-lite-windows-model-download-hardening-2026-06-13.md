# Audit Lite: Windows Model Download Hardening

Date: 2026-06-13
Scope: Gemma 4 12B QAT model download disk-space guard, failure tests, and desktop README truth.

## Findings

No findings.

## Evidence

- The model downloader now checks available disk space with a Windows PowerShell probe, a Unix `df` fallback, and a test override hook in `desktop/src-tauri/src/model.rs:305`.
- The declared `minimum_free_disk_bytes` from `runtime/gemma4-model.json` is enforced before starting the resumable model download in `desktop/src-tauri/src/model.rs:541`.
- The model action failure path already returns a structured desktop action result with a retry next action in `desktop/src-tauri/src/model.rs:780`.
- Unit coverage verifies low-disk failure before network work and missing-downloader failure in `desktop/src-tauri/src/model.rs:849` and `desktop/src-tauri/src/model.rs:861`.
- The desktop README now describes the wired model actions instead of saying the native downloader is future work in `desktop/README.md:22`.

## Verification

- `cargo fmt` passed.
- `cargo test` passed: 52 passed.
- `npm test` passed.
- `npm run build` passed.
- `npm run test:browser` passed: 9 passed.
- `git diff --check` passed.

## Residual Risk

- The tests intentionally do not download the multi-gigabyte Gemma artifact. Clean-machine evidence still needs a real model download or a controlled artifact-cache rehearsal during the Windows install gate.
