# Audit Lite - Stage 2 Slice 3 Response-Letter Timeout
**Date:** 2026-05-31
**Scope:** Reviewed the fix for Claude's clean-machine response-letter timeout blocker, the Records AI source pin bump, graceful workflow-proof timeout handling, and suite launcher HTTP proof in `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29`.
**Reviewer:** Codex (audit-lite)

## TL;DR
The blocker Claude reported is fixed in the pushed Records AI source branch and in the rebuilt city-core installer package. A fresh Windows matching-host lifecycle against the rebuilt artifact passed, including `draft_response_letter` returning `201` and `suite_launcher_http` returning `passed`.

## Severity Rollup
- Blocker: 0
- Critical: 0
- Major: 0
- Minor: 0
- Nit: 0

## Findings

No open findings remain in this slice.

Closed during audit:

- `C:\dev\Claude\civicrecords-ai-stage2-response-letter\backend\app\requests\router.py` now uses `settings.response_letter_llm_timeout_seconds` for the response-letter Ollama call, so a cold CPU model falls back to the template within the workflow proof window.
- `C:\dev\Claude\civicrecords-ai-stage2-response-letter\backend\tests\test_response_letter.py` adds a timeout fallback regression test for the response-letter LLM path.
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\scripts\run-clerk-core-installer.py` now writes `RESPONSE_LETTER_LLM_TIMEOUT_SECONDS=8` into Records AI runtime env, catches JSON POST timeout/URL failures as structured `598` results, and verifies the suite launcher over HTTP.
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\scripts\plan-installer.py` supports `CIVICSUITE_SOURCE_ROOT_<MODULE>` overrides so the rebuilt artifact can vendor the exact Records AI source commit without touching the dirty sibling checkout.
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\installer\modules.json` now pins CivicRecords AI to `35e014be438b84326ec9eac1f4767d54de5800c7`.

## What's Working
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\installer\generated\bundles\city-core\windows\CivicSuite-city-core-windows\modules\civicrecords-ai\SOURCE_COMMIT.txt` contains `35e014be438b84326ec9eac1f4767d54de5800c7`.
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\installer\reports\stage2-slice3-windows-lifecycle-response-letter-r1\installer-package-cleanroom.json` reports `status: passed` and `evidence_classification: matching_host_lifecycle`.
- The same lifecycle evidence records `draft_response_letter` with `status_code: 201`, `status: draft`, `letter_id_present: true`, and `contains_ai_disclaimer: true`.
- The same lifecycle evidence records `suite_launcher_http` with `status: passed`, `mode: python_http_server`, and HTML returned from `http://127.0.0.1:18082/`.
- Claude's previous inspection stack was uninstalled cleanly with `CIVICSUITE_INSTALLER_RUN_ID=clerk-core-install-20260531T155223Z-5ff57d94`.

## Verification Commands
- `python -m pytest backend/tests/test_response_letter.py -q` from `C:\dev\Claude\civicrecords-ai-stage2-response-letter`
- `python -m pytest tests/test_stage2_live_install_blockers.py -q`
- `git diff --check`
- `$env:CIVICSUITE_SOURCE_ROOT_CIVICRECORDS_AI='C:\dev\Claude\civicrecords-ai-stage2-response-letter'; python scripts/plan-installer.py --profile city-core --generate-release-artifacts --installer-version 0.1.2 --package-platform all`
- `python scripts/run-installer-package-cleanroom.py --archive installer/dist/CivicSuite-city-core-windows-0.1.2.zip --platform windows --run-id stage2-slice3-windows-lifecycle-response-letter-r1 --staff-mode bearer --workflow-proof`
- `$env:CIVICSUITE_INSTALLER_INSTALL_ROOT='C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\installer\runtime\clerk-core'; $env:CIVICSUITE_INSTALLER_RUN_ID='clerk-core-install-20260531T155223Z-5ff57d94'; python scripts/run-clerk-core-installer.py uninstall --module civicrecords-ai --module civicclerk --module civiccode --remove-files`

## Verification Caveat
The new Records AI timeout fallback unit test passed, but the two existing endpoint tests in `C:\dev\Claude\civicrecords-ai-stage2-response-letter\backend\tests\test_response_letter.py` errored before reaching the changed code because this host does not resolve the test DB hostname `postgres`.

## Escalation Recommendation
No escalation needed for this slice. Claude should rerun the clean-machine test against the new pushed umbrella head and the Records AI source commit `35e014be438b84326ec9eac1f4767d54de5800c7`.
