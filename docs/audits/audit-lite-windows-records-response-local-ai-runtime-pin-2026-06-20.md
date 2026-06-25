# Audit Lite: Windows Records Response Local AI Runtime Pin

Date: 2026-06-20

Scope:
- `C:\dev\Codex\civicrecords-ai\backend\app\requests\router.py`
- `C:\dev\Codex\civicrecords-ai\backend\tests\test_response_letter.py`
- `C:\dev\Codex\civicsuite\.github\workflows\desktop-windows-msi.yml`
- `C:\dev\Codex\civicsuite\.github\workflows\installer-cleanroom.yml`
- `C:\dev\Codex\civicsuite\desktop\tests\static-smoke.mjs`

Reason:
- Follow-up to `TESTER-RESULT-105.md`, where the clean-machine installed product proved bundled Ollama and Gemma readiness, but CivicRecords response-letter generation logged `LLM generation failed, falling back to template` and persisted a fallback draft instead of a confirmed local-Ollama-backed draft.

Findings:
- 0 Critical
- 0 High
- 0 Medium
- 0 Low

Evidence:
- CivicRecords response-letter generation now reads the product-provided `LLM_MODEL` before falling back to the legacy `settings.chat_model`, sends raw Gemma turn markers with bounded `num_predict`, bounded `num_ctx`, and stop tokens, and parses top-level `response`, chat-style `message.content`, and JSON-line/chunk-tolerant Ollama output before falling back to the template path.
- CivicRecords regression tests cover the pinned runtime model payload, top-level response parsing, chat-shaped response parsing, chunk-line tolerant parsing, and a fake local-Ollama response path that returns a marker-bearing records letter with the AI disclaimer.
- CivicSuite MSI and installer-cleanroom workflows now pin `CivicSuite/civicrecords-ai` to commit `e2208827b660faa7d3fc1eab2271a8eae18526ee`, and the desktop static smoke contract checks that exact pin.

Verification:
- `python -m pytest backend\tests\test_response_letter.py -q -k "records_generation_payload or parse_ollama_generate_text or try_llm_generation"`: 5 passed, 2 deselected.
- `python -m py_compile backend\app\requests\router.py backend\tests\test_response_letter.py`: passed.
- `git diff --check` in `C:\dev\Codex\civicrecords-ai`: passed.
- `npm --prefix desktop test -- --runInBand`: passed.
- `git diff --check` in `C:\dev\Codex\civicsuite`: passed with expected CRLF warnings only.
- `npm --prefix desktop run prepare-runtime-payload`: passed and verified embedded Python service imports.

Residual Risk:
- The existing database-backed CivicRecords endpoint tests require a local PostgreSQL host named `postgres`; that host is not available in this shell, so those two pre-existing tests could not complete locally. The new regression coverage avoids that dependency and directly covers the failure mode from `TESTER-RESULT-105.md`.
