# Audit Lite - Windows Model Readiness
**Date:** 2026-06-13
**Scope:** Gemma 4 12B QAT model manifest, Tauri model readiness bridge, desktop Home/System Health rendering, Playwright browser coverage, static smoke checks, and desktop/runtime documentation.
**Reviewer:** Codex (audit-lite)

## TL;DR
Accept this slice. It pins the Windows Local 1.0 model path to the official Gemma 4 12B QAT Q4_0 GGUF artifact, exposes checksum-required readiness state through the Tauri app bridge, renders that state in the desktop shell, and adds repeatable Playwright coverage using Microsoft Edge. No unresolved findings remain.

## Severity rollup
- Blocker: 0
- Critical: 0
- Major: 0
- Minor: 0
- Nit: 0

## Findings

None unresolved.

## Closed During Audit
- Correctness: the initial local-file readiness check treated any file at the expected path as enough for the file check, and checksum readiness could be satisfied by a marker without the GGUF file. Fixed in `desktop/src-tauri/src/model.rs` by requiring the expected artifact size and requiring the model file to exist before checksum markers can pass. Added `checksum_marker_cannot_pass_without_model_file`.

## Checks Performed
- Correctness: reviewed `desktop/runtime/gemma4-model.json`, `desktop/src-tauri/src/model.rs`, and `desktop/src-tauri/src/main.rs` for pinned Gemma 4 12B QAT Q4_0 metadata, local-only operator path, explicit/resumable download policy, SHA-256 enforcement, artifact size checks, blocked model actions, and app-state exposure.
- UX: reviewed `desktop/src/main.js` and `desktop/src/styles.css` for Home/System Health model-readiness rendering, long checksum/model-id wrapping, and no Docker/WSL clerk-path prompts.
- Browser proof: `npm run test:browser` passed with Playwright using the Microsoft Edge channel; one-off headless Edge evidence was also captured under ignored `test-results/desktop-shell/model-readiness.*`.
- Tests: `npm test`, `npm run test:browser`, `npm run build`, `cargo fmt --check`, `cargo test`, `cargo check`, and `npx tauri build --debug --no-bundle` passed.
- Suite controls: `python scripts\verify-module-manifest-contract.py`, `python scripts\verify-installer-plan.py`, `python scripts\verify-suite-state.py --remote-only`, `python scripts\docs\verify_docs_truth.py`, and focused pytest checks passed.
- Hygiene: `git diff --check` and ASCII scan passed for the slice.

## What's Working
- `desktop/runtime/gemma4-model.json` pins the official `google/gemma-4-12B-it-qat-q4_0-gguf` source, direct GGUF resolve URL, file size, SHA-256, Ollama runtime id, license, 256K context, explicit download policy, and readiness checks.
- `desktop/src-tauri/src/model.rs` validates the manifest and reports readiness for metadata, local artifact, checksum, runtime, and CivicCore model registry.
- `desktop/src/main.js` renders model readiness on Home and System Health without silently downloading or claiming the model is ready.
- `desktop/tests/static-smoke.mjs` and `desktop/tests/browser/model-readiness.spec.mjs` lock the model contract and browser-visible copy.
- Playwright is installed in the desktop package as a repeatable browser verification harness.

## Watch Items
- The native installer downloader still needs to implement resumable download, checksum verification, model placement, and CivicCore model registration.
- Runtime readiness is still blocked until the portable Ollama runtime and CivicCore platform services are wired in the next slices.

## Escalation Recommendation
No escalation needed. Continue to the CivicCore local platform slice.
