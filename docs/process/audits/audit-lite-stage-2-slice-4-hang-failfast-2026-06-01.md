# Audit Lite - Stage 2 Slice 4 Hang Fail-Fast
**Date:** 2026-06-01
**Scope:** Review the clean-Windows live-gate hang fix for city-core installer lifecycle streaming, bounded Ollama prewarm, existing-stack workflow proof, portal route retry, and suite-launcher probe timeout handling.
**Reviewer:** Codex (audit-lite)

## TL;DR
Ship this slice for independent retest. The original hidden 60-minute hang is addressed by live launcher-output streaming, a bounded nonfatal LLM prewarm, and a bounded suite-launcher probe; the rebuilt Windows package now passes the matching-host lifecycle end to end with workflow proof.

## Severity rollup
- Blocker: 0
- Critical: 0
- Major: 0
- Minor: 0
- Nit: 0

## Findings

No findings.

## What's working
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\scripts\run-installer-package-cleanroom.py:55` streams each launcher mode to a live log and records `streamed_output` evidence at `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\scripts\run-installer-package-cleanroom.py:573`, removing the buffered-output blind spot from Claude's failed retest.
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\scripts\run-installer-package-cleanroom.py:179` clears stale extraction state only under `installer\reports`, preventing repeated run ids from poisoning cleanroom evidence while preserving a safety boundary.
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\scripts\run-installer-package-cleanroom.py:401` adds an existing-stack workflow-proof mode so a live stack can be reverified without a full reinstall.
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\scripts\run-clerk-core-installer.py:38` and `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\scripts\run-clerk-core-installer.py:770` cap optional Ollama LLM prewarm at 90 seconds and record a nonfatal warning instead of consuming the full install timeout.
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\scripts\run-clerk-core-installer.py:966` and `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\scripts\run-clerk-core-installer.py:2281` bound suite-launcher HTTP probes so curl or port-state weirdness cannot wedge verification.
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\scripts\run-clerk-core-installer.py:1155` retries slow OpenAPI route discovery for the public portal mode check, avoiding a false route-absence failure during post-repair API warmup.
- Regression coverage exists in `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\tests\test_stage2_live_install_blockers.py:59`, `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\tests\test_stage2_live_install_blockers.py:126`, `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\tests\test_stage2_live_install_blockers.py:157`, and `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\tests\test_stage2_live_install_blockers.py:169`.
- Runtime proof passed: `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\docs\process\evidence\stage-2-live-install-blockers-2026-05-31\slice-4-hang-failfast\windows-lifecycle-streamed-r4.json` reports `status: passed`, `evidence_classification: matching_host_lifecycle`, and includes install workflow proof with `draft_response_letter` returning 201 plus backup, restore, and uninstall success.

## Verification
- `python -m pytest tests/test_stage2_live_install_blockers.py -q` - 12 passed, 1 warning.
- `python scripts/verify-installer-plan.py` - `VERIFY-INSTALLER-PLAN: PASSED`.
- `python -m pytest tests/test_stage2_live_install_blockers.py tests/test_city_core_suite_session_contract.py scripts/policy/test_city_core_suite_session_closeout_contract.py -q` - 15 passed, 10 warnings.
- `git diff --check` - passed; Git emitted line-ending normalization warnings only.
- `$env:CIVICSUITE_SOURCE_ROOT_CIVICRECORDS_AI='C:\dev\Claude\civicrecords-ai-stage2-response-letter'; python scripts/plan-installer.py --profile city-core --generate-release-artifacts --installer-version 0.1.2 --package-platform all` - passed and rebuilt Linux, macOS beta, and Windows artifacts.
- `python scripts/run-installer-package-cleanroom.py --archive installer/dist/CivicSuite-city-core-windows-0.1.2.zip --platform windows --run-id stage2-slice4-windows-lifecycle-streamed-r4 --staff-mode bearer --workflow-proof` - passed.

## Watch Items
- Independent Claude clean-machine retest still gates merge/tag/status promotion. This slice is implemented and locally proven, not independently cleared.
- Linux lifecycle remains outside this slice; the active gate here is the clean-Windows hang reported by Claude.

## Escalation recommendation
No escalation needed for this slice. It is ready for push and independent live-gate retest.
