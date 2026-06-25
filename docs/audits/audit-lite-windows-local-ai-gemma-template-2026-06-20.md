# Audit Lite: Windows Local AI Gemma Template

Date: 2026-06-20

Scope:

- `desktop/src-tauri/src/model.rs`
- Follow-up to `TESTER-RESULT-103.md`, where the installed product reached product-managed Ollama HTTP 200 without the prior chunk-size parse failure, but CivicRecords, CivicCode, and exposed CivicClerk workflows still surfaced `Local AI returned an empty draft.`

Findings:

- None.

Review notes:

- The fix writes a Gemma instruction template and stop tokens into the Ollama Modelfile used by `load-runtime-model` (`desktop/src-tauri/src/model.rs:394`, `desktop/src-tauri/src/model.rs:1149`).
- The installed workflow generation request now sends explicit Gemma turn markers with `raw: true`, bounded `num_predict`/`num_ctx`, and stop tokens so generation no longer depends on an implicit Ollama template for the local GGUF (`desktop/src-tauri/src/model.rs:1630`, `desktop/src-tauri/src/model.rs:1637`).
- Regression coverage asserts the raw prompt contract and Modelfile template (`desktop/src-tauri/src/model.rs:1801`, `desktop/src-tauri/src/model.rs:1822`).

Verification:

- `cargo fmt --check`
- `cargo test local_generation_request_bounds_slow_ollama_outputs`
- `cargo test runtime_modelfile_uses_gemma_instruction_template`
- `cargo test ollama_generate_parser`
- `cargo test http_response_body`
- `cargo test meeting_workflow_persists_agenda_notice_minutes_votes_comments_actions_and_archive`
- `cargo test records_workflow_requires_human_approval_before_release`
- `cargo test code_workflow_persists_source_handoff_and_search`
- `cargo test`
- `npm --prefix desktop test -- --runInBand`
- `npm --prefix desktop run build`
- `bash scripts/verify-docs.sh`
- `python scripts/verify-deployment-profile.py --static-only`
- `python scripts/policy/check_stage_evidence.py`
- `git diff --check` (CRLF warning only)

Residual risk:

- Local verification proves the product now sends the right Gemma/Ollama contract and preserves workflow persistence when generation returns text. The decisive proof remains a clean installed MSI retest with the real downloaded Gemma model, which the next tester directive must run.
