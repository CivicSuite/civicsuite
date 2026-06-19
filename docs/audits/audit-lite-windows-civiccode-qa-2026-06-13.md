# Audit Lite - Windows CivicCode Q&A

Date: 2026-06-13

Scope: CivicCode citation-grounded Q&A in the Windows-local desktop shell, including staff/public boundaries, stale-source refusal, backend audit logging, browser-preview helper behavior, and UI exposure.

## Findings

No unresolved Blocker, Critical, Major, Minor, or Nit findings remain for this slice.

## Evidence

- Backend Q&A uses meaningful question terms, published-source filtering for public questions, stale-source refusal, and citation-grounded `SearchResult` answers. Evidence: `desktop/src-tauri/src/workflows.rs:1745`, `desktop/src-tauri/src/workflows.rs:1760`.
- `answer-code-question` records a CivicCode audit event and returns no cited answer when matching sources are stale or missing. Evidence: `desktop/src-tauri/src/workflows.rs:1995`.
- The focused regression verifies a resident-style question, exact citation, non-authoritative language, audit logging, and stale-source refusal. Evidence: `desktop/src-tauri/src/workflows.rs:2468`.
- Resident/Public Code now exposes `Ask the Code` with published-source, non-legal-advice copy. Evidence: `desktop/src/main.js:1593`, `desktop/tests/browser/workflow-pages.spec.mjs:96`.
- Staff Code now exposes `Ask Code Question` with staff guidance access while still labeling answers non-authoritative. Evidence: `desktop/src/main.js:1639`, `desktop/tests/browser/workflow-pages.spec.mjs:51`.
- Browser preview uses the same local helper semantics instead of pretending to persist audit events. Evidence: `desktop/src/main.js:1443`, `desktop/src/main.js:2405`.

## Verification

- `cargo test workflows::tests::code_question_answers_use_published_current_citations -- --nocapture`: pass.
- `cargo test -- --nocapture`: 64 passed.
- `npm test`: pass.
- `npm run test:browser`: 10 passed.
- `cargo fmt --check`: pass.
- `bash scripts/verify-docs.sh`: pass.
- `python scripts/policy/check_stage_evidence.py`: pass.
- `git diff --check`: pass with only expected Windows line-ending warnings.

## Residual Risk

- This Q&A path is deterministic and citation-grounded. It does not yet call the local Gemma runtime for generated prose; final clean-machine walkthrough still needs to verify model availability and local-runtime UX separately.
