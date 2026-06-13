# Audit Lite - Windows Local AI Draft Generation

Date: 2026-06-13
Branch: work/windows-local-1-design-contract
Scope: local AI draft generation for CivicRecords AI and CivicCode inside the Windows desktop workflow shell.

## Findings

No findings.

Severity counts: Blocker 0, Critical 0, Major 0, Minor 0, Nit 0.

## Evidence

- `desktop/src-tauri/src/model.rs:1272` adds `generate_local_text`, validates the pinned model manifest, blocks generation until `model_state()?.ready`, and posts to the local Ollama `/api/generate` endpoint only after readiness.
- `desktop/src-tauri/src/workflows.rs:1325` adds CivicRecords AI generation as an internal response draft and requires at least one search note or citation before the model can draft.
- `desktop/src-tauri/src/workflows.rs:1788` adds CivicCode guidance generation as an internal draft and clears previous guidance approval before human review.
- `desktop/src-tauri/src/main.rs:158` and `desktop/src-tauri/src/main.rs:169` keep the new actions behind the existing module ownership guard.
- `desktop/src/main.js:1482` and `desktop/src/main.js:1557` add guided review panels that state the output is internal, requires human review, and is blocked when the local model is not ready.
- `desktop/tests/browser/workflow-pages.spec.mjs:33` and `desktop/tests/browser/workflow-pages.spec.mjs:52` verify the clerk-facing controls are visible in the workflow UI.
- `desktop/tests/browser/workflow-pages.spec.mjs:146` verifies the records generation action opens guided review before mutation.
- `desktop/tests/static-smoke.mjs:338` verifies the Rust workflow action names and generated-draft audit phrases remain present.

## Validation

- `cargo fmt`
- `cargo check`
- `cargo test -- --test-threads=1` - 95 passed
- `npm test` - desktop static smoke passed
- `npm run test:browser` - 11 passed
- `npm run build` - Vite production build passed
- `python scripts\verify-module-manifest-contract.py` - passed
- `python scripts\docs\verify_docs_truth.py` - passed
- `python scripts\policy\check_stage_evidence.py` - passed, branch is not a stage branch

## Residual Risk

The local model call path is covered with a test-only fake model response and readiness guards, but this slice has not run a clean-machine generation using the full pinned Gemma 4 12B QAT runtime. That belongs in the later clean install/model-readiness gate, not this small slice.
