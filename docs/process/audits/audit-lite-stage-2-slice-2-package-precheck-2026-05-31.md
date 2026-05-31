# Audit Lite - Stage 2 Slice 2 Package Precheck
**Date:** 2026-05-31
**Scope:** Reviewed the package artifact rebuild, Windows matching-host lifecycle evidence, Linux archive/readiness precheck evidence, and timeout/readiness fixes for `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29`.
**Reviewer:** Codex (audit-lite)

## TL;DR
Slice 2 is fit to push as tester-package evidence for the Stage 2 clean-machine handoff. The final Windows package lifecycle passed install, repair, verify, backup, restore, and uninstall; the Linux package passed archive extraction, readiness, and dry-run plan checks only, which is intentionally not lifecycle certification.

Earlier slice attempts exposed three issues: a stale 60 GB readiness constant, a too-short Records response-letter proof timeout, and fatal treatment of an Ollama LLM prewarm on a memory-constrained host. All three were fixed and rechecked before this report.

## Severity Rollup
- Blocker: 0
- Critical: 0
- Major: 0
- Minor: 0
- Nit: 0

## Findings

No open findings remain in this slice.

Closed during audit:

- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\scripts\plan-installer.py` now uses `MIN_FREE_DISK_GB = 25` and derives bytes from that constant, so generated package readiness evidence no longer reports the old 60 GB threshold.
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\scripts\run-clerk-core-installer.py` now gives Records AI response-letter generation 180 seconds, CivicCode Q&A proof 60 seconds, and installed CivicCode Ollama requests 8 seconds.
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\scripts\run-clerk-core-installer.py` keeps Ollama model pulls required but treats LLM prewarm as a warning, preventing a memory-edge prewarm from failing an otherwise valid package lifecycle.
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\installer\reports\stage2-slice2-linux-archive-precheck-r2\installer-package-cleanroom.json` was regenerated after the reboot because the `r2` directory existed without the JSON evidence file.

## What's Working
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\installer\reports\stage2-slice2-windows-lifecycle-r4\installer-package-cleanroom.json` reports `status: passed`, `evidence_classification: matching_host_lifecycle`, and certification scope covering install, repair, verify, backup, restore, and uninstall.
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\installer\reports\stage2-slice2-linux-archive-precheck-r2\installer-package-cleanroom.json` reports `status: passed` for archive extraction, readiness, and dry-run plan, with `required_free_gb: 25`.
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\tests\test_stage2_live_install_blockers.py` now covers the timeout constants, nonfatal prewarm handling, CivicCode installed Ollama timeout propagation, and the 25 GB readiness floor.
- The rebuilt city-core package artifacts are present under `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\installer\dist\` with matching SHA256 evidence in `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\installer\dist\CivicSuite-city-core-0.1.2-SHA256SUMS.txt`.

## Verification Commands
- `python scripts/plan-installer.py --profile city-core --generate-release-artifacts --installer-version 0.1.2 --package-platform all`
- `python scripts/run-installer-package-cleanroom.py --archive installer/dist/CivicSuite-city-core-windows-0.1.2.zip --platform windows --run-id stage2-slice2-windows-lifecycle-r4 --staff-mode bearer --workflow-proof`
- `python scripts/run-installer-package-cleanroom.py --archive installer/dist/CivicSuite-city-core-linux-0.1.2.tar.gz --platform linux --run-id stage2-slice2-linux-archive-precheck-r2 --skip-install`
- `python scripts/verify-installer-plan.py`
- `python -m pytest tests/test_stage2_live_install_blockers.py tests/test_city_core_suite_session_contract.py scripts/policy/test_city_core_suite_session_closeout_contract.py -q`
- `git diff --check`

## Watch Items
- Linux evidence in this slice is archive/readiness only because it was run from the Windows host. It must not be represented as Linux lifecycle certification.
- The next stage action is the clean-machine live test handoff; no merge, tag, or status promotion should happen before that external proof.

## Escalation Recommendation
No escalation needed for this slice. Full audit remains a stage-end requirement after the clean-machine live test path is closed.
