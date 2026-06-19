# Audit Lite: Windows Local Model Runtime

Date: 2026-06-13
Scope: Gemma 4 12B QAT local model runtime readiness, Ollama loading action, first-run health gate, and city-module model pinning.

## Findings

None.

## Evidence Reviewed

- `desktop/runtime/gemma4-model.json:20` keeps the official Google Hugging Face source id, while `desktop/runtime/gemma4-model.json:21` defines the local Ollama runtime name that CivicSuite services call.
- `desktop/runtime/gemma4-model.json:47` adds the explicit `load-runtime-model` action, and `desktop/runtime/gemma4-model.json:78` adds the required runtime-model readiness check.
- `desktop/src-tauri/src/model.rs:260` rejects manifests that omit a distinct local Ollama runtime model name.
- `desktop/src-tauri/src/model.rs:535` probes Ollama `/api/tags` and checks for the local runtime model name instead of treating runtime readiness as hardcoded text.
- `desktop/src-tauri/src/model.rs:677` requires a checksum-verified GGUF before loading, writes an Ollama Modelfile beside that verified file, and runs `ollama create` from the local artifact rather than starting a second model download.
- `desktop/src-tauri/src/first_run.rs:576` blocks final first-run health completion unless the full model readiness contract is satisfied.
- `desktop/src-tauri/src/supervisor.rs:880` pins CivicCode and CivicRecords synthesis env vars to the local runtime model name, and `desktop/src-tauri/src/supervisor.rs:1673` covers that with a regression test.
- `desktop/src/main.js` browser fallback now exposes both the official source id and local runtime model name, and keeps a visible `Load in Ollama` action.

## Verification

- `npm test`: passed.
- `cargo test`: passed, 57 tests.
- `npm run test:browser`: passed, 9 Playwright tests.
- `cargo fmt --check`: passed.
- `git diff --check`: passed with only the repo's normal CRLF warnings for touched files.
- Process/temp cleanup check: no leftover `postgres`, `python`, `cargo`, or `node` proof processes and no stale CivicSuite test temp profile remained.

## Residual Risk

- The full live import of the 6.9 GB Gemma GGUF into a running bundled Ollama instance was not executed in this slice because the real model artifact is not present in this workspace. The code path is guarded by unit tests and UI/browser coverage, but the full-weight import remains part of the later clean-machine installer walkthrough gate.
