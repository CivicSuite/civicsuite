# Audit Lite: Windows Clerk Minutes Local AI Timeout

Date: 2026-06-20

Scope:
- `C:\dev\Codex\civicclerk\civicclerk\main.py`
- `C:\dev\Codex\civicclerk\tests\test_soft_ai_dependency.py`
- `C:\dev\Codex\civicclerk\tests\test_milestone_2_schema_and_migrations.py`
- `C:\dev\Codex\civicsuite\.github\workflows\desktop-windows-msi.yml`
- `C:\dev\Codex\civicsuite\.github\workflows\installer-cleanroom.yml`
- `C:\dev\Codex\civicsuite\desktop\tests\static-smoke.mjs`

Reason:
- Follow-up to `TESTER-RESULT-106.md`, where the clean-machine installed product proved bundled Ollama/Gemma readiness, CivicRecords local AI, and CivicCode local AI, but the exposed CivicClerk `Generate Local AI Minutes` path timed out through its product Ollama request window.

Findings:
- 0 Critical
- 0 High
- 0 Medium
- 0 Low

Evidence:
- CivicClerk minutes AI now reads the product-provided `LLM_MODEL` before falling back to the request model, sends raw Gemma turn markers with bounded `num_predict`, bounded `num_ctx`, and stop tokens, and uses the same 120-second local generation read window proven by the installed Records path.
- CivicClerk now parses top-level `response`, chat-style `message.content`, and JSON-line/chunk-tolerant Ollama output while preserving empty-output failure detection.
- CivicClerk regression tests cover the pinned runtime model payload, Gemma prompt bounds, top-level response parsing, chat-shaped response parsing, chunk-line tolerant parsing, empty-output detection, and the existing 503/manual-workflow fallback.
- The stale real-Postgres migration test expectation now tracks the current installed CivicCore migration head `civiccore_0003_local_task_queue`.
- CivicSuite MSI and installer-cleanroom workflows now pin `CivicSuite/civicclerk` to commit `fa1874e31c1d1de909d2240f42b8e2b2da79ccfd`, and the desktop static smoke contract checks that exact pin.

Verification:
- `python -m pytest tests\test_soft_ai_dependency.py -q -k "minutes_generation_payload or ollama_generate_parser or minutes_ai_assist"`: 4 passed, 2 deselected.
- `python -m pytest tests\test_soft_ai_dependency.py tests\test_milestone_7_minutes_citations.py tests\test_milestone_9_prompt_yaml_evals.py -q`: 23 passed.
- `python -m pytest -q` in `C:\dev\Codex\civicclerk`: 670 passed.
- `python -m py_compile civicclerk\main.py tests\test_soft_ai_dependency.py`: passed.
- `git diff --check` in `C:\dev\Codex\civicclerk`: passed with expected CRLF warnings only.

Residual Risk:
- The installed-app proof still requires the bare-metal tester to verify CivicClerk through the packaged MSI because the local shell cannot reproduce the unattended Windows clean-machine workflow, product-managed Ollama lifecycle, and backup/restore model-cache path.
