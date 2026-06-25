# Audit Lite: Windows Local AI Chunked Response

Date: 2026-06-20

Scope: Fix for `TESTER-RESULT-102.md`, where installed-product AI actions reached product-managed Ollama and received `HTTP 200`, but local response parsing failed on chunk-size lines such as `94` and `11`.

## Findings

No findings.

## Evidence

- `desktop/src-tauri/src/model.rs` now decodes `Transfer-Encoding: chunked` response bodies before parsing local AI JSON.
- Plain JSON HTTP bodies remain unchanged.
- Regression coverage proves chunked Ollama JSON decodes into a usable draft and plain JSON body extraction still works.

## Verification

- `cargo fmt --check`
- `cargo test http_response_body`
- `cargo test ollama_generate_parser`
- `cargo test meeting_workflow_persists_agenda_notice_minutes_votes_comments_actions_and_archive`
- `cargo test records_workflow_requires_human_approval_before_release`
- `cargo test code_workflow_persists_source_handoff_and_search`
- `cargo test`
- `npm --prefix desktop test -- --runInBand`
- `npm --prefix desktop run build`
- `bash scripts/verify-docs.sh`
- `python scripts/verify-deployment-profile.py --static-only`
- `python scripts/policy/check_stage_evidence.py`
- `git diff --check`

## Residual Risk

The remaining material risk is the clean Windows installed-product path against real bundled Ollama/Gemma output. The next tester directive must confirm the decoded response is parsed and persisted into CivicRecords, CivicCode, and CivicClerk workflow drafts.
