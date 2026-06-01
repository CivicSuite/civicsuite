# Stage 2 - Live Install Blockers

## Scope

Stage 2 collapses the live-install work onto one branch and fixes the blocker set needed before a clean-machine tester run: shared session propagation, suite launcher startup, blocked readiness behavior, realistic cleanroom disk floor, Ollama model preparation, and Records AI response-letter cold-start mitigation.

Branch:

- `stage-2-live-install-blockers-2026-05-31`

Base:

- `CivicSuite/civicsuite` `main` at `8cd37559d769d58c11f21c1ca8e76872cd39950f`

Local worktree:

- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29`

## Planned Slices

1. Static installer blocker fixes and regression contracts.
2. Build tester package artifacts and run local package pre-checks.
3. Hand off tester package to Claude for clean-machine live test.
4. Fix any Claude live-test findings on the same branch.
5. Stage audit-full closeout, merge, and tag only after live test passes.

## Slice Ledger

### Slice 1 - Static installer blocker fixes and regression contracts

Status: Implemented, pending runtime proof

Changed files:

- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\scripts\plan-installer.py`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\scripts\run-clerk-core-installer.py`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\scripts\run-installer-package-cleanroom.py`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\tests\test_stage2_live_install_blockers.py`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\installer\generated\packages\city-core\linux\README.md`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\installer\generated\packages\city-core\linux\start-civicsuite-installer.sh`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\installer\generated\packages\city-core\linux\suite-launcher\civicsuite-launcher-config.js`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\installer\generated\packages\city-core\macos\README.md`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\installer\generated\packages\city-core\macos\start-civicsuite-installer.sh`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\installer\generated\packages\city-core\macos\suite-launcher\civicsuite-launcher-config.js`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\installer\generated\packages\city-core\windows\README.md`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\installer\generated\packages\city-core\windows\start-civicsuite-installer.ps1`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\installer\generated\packages\city-core\windows\suite-launcher\civicsuite-launcher-config.js`

Audit-lite reports:

- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\docs\process\audits\audit-lite-stage-2-slice-1-live-install-blockers-2026-05-31.md`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\docs\process\audits\audit-lite-stage-2-slice-1-ledger-repair-2026-05-31.md`

Local checks:

- `python -m pytest tests/test_stage2_live_install_blockers.py tests/test_city_core_suite_session_contract.py scripts/policy/test_city_core_suite_session_closeout_contract.py -q`
- `python scripts/plan-installer.py --profile city-core --dry-run --show-readiness --readiness-scenario missing-docker`
- `python scripts/plan-installer.py --profile city-core --generate-profile-package --package-platform all`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts\hooks\pre-push.ps1`

Commits:

- `7e7d62cd42d420ff122a02893db9f5eb4d4f9270` - static installer blocker fixes and regression contracts
- This commit - stage ledger repair required by pre-push gate

### Slice 2 - Build tester package artifacts and run local package pre-checks

Status: Implemented, pending Claude clean-machine live test

Changed files:

- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\scripts\plan-installer.py`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\scripts\run-clerk-core-installer.py`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\tests\test_stage2_live_install_blockers.py`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\installer\generated\packages\clerk-core\linux\start-civicsuite-installer.sh`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\installer\generated\packages\clerk-core\macos\start-civicsuite-installer.sh`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\installer\dist\CivicSuite-city-core-0.1.2-SHA256SUMS.txt`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\installer\dist\CivicSuite-city-core-0.1.2-release-manifest.json`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\installer\dist\CivicSuite-city-core-linux-0.1.2.run`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\installer\dist\CivicSuite-city-core-linux-0.1.2.tar.gz`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\installer\dist\CivicSuite-city-core-macos-0.1.2.tar.gz`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\installer\dist\CivicSuite-city-core-windows-0.1.2.cmd`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\installer\dist\CivicSuite-city-core-windows-0.1.2.zip`

Audit-lite report:

- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\docs\process\audits\audit-lite-stage-2-slice-2-package-precheck-2026-05-31.md`

Evidence:

- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\docs\process\evidence\stage-2-live-install-blockers-2026-05-31\slice-2-package-precheck\windows-lifecycle-r4.json`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\docs\process\evidence\stage-2-live-install-blockers-2026-05-31\slice-2-package-precheck\windows-lifecycle-r4-clerk-core-installer-lifecycle.json`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\docs\process\evidence\stage-2-live-install-blockers-2026-05-31\slice-2-package-precheck\linux-archive-precheck-r2.json`

Local checks:

- `python scripts/plan-installer.py --profile city-core --generate-release-artifacts --installer-version 0.1.2 --package-platform all`
- `python scripts/run-installer-package-cleanroom.py --archive installer/dist/CivicSuite-city-core-windows-0.1.2.zip --platform windows --run-id stage2-slice2-windows-lifecycle-r4 --staff-mode bearer --workflow-proof`
- `python scripts/run-installer-package-cleanroom.py --archive installer/dist/CivicSuite-city-core-linux-0.1.2.tar.gz --platform linux --run-id stage2-slice2-linux-archive-precheck-r2 --skip-install`
- `python scripts/verify-installer-plan.py`
- `python -m pytest tests/test_stage2_live_install_blockers.py tests/test_city_core_suite_session_contract.py scripts/policy/test_city_core_suite_session_closeout_contract.py -q`
- `git diff --check`

Notes:

- Windows evidence is matching-host lifecycle proof for install, repair, verify, backup, restore, and uninstall.
- Linux evidence is archive/readiness/dry-run-plan proof only; it is not lifecycle certification.
- Earlier failed attempts `stage2-slice2-windows-lifecycle`, `stage2-slice2-windows-lifecycle-r2`, and `stage2-slice2-windows-lifecycle-r3` exposed the response-letter timeout, LLM prewarm fatality, and CivicCode Q&A timeout issues. The final `r4` run passed after those fixes.

Commits:

- `e094606a84c8679cdf0d098c1ab29316dc6ac23c` - package lifecycle proof and tester artifacts

### Slice 3 - Close clean-machine response-letter timeout blocker

Status: Implemented, pending Claude clean-machine retest

Changed files:

- `C:\dev\Claude\civicrecords-ai-stage2-response-letter\backend\app\config.py`
- `C:\dev\Claude\civicrecords-ai-stage2-response-letter\backend\app\requests\router.py`
- `C:\dev\Claude\civicrecords-ai-stage2-response-letter\backend\tests\test_response_letter.py`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\installer\modules.json`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\scripts\plan-installer.py`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\scripts\run-clerk-core-installer.py`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\tests\test_stage2_live_install_blockers.py`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\installer\dist\CivicSuite-city-core-0.1.2-SHA256SUMS.txt`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\installer\dist\CivicSuite-city-core-0.1.2-release-manifest.json`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\installer\dist\CivicSuite-city-core-linux-0.1.2.run`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\installer\dist\CivicSuite-city-core-linux-0.1.2.tar.gz`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\installer\dist\CivicSuite-city-core-macos-0.1.2.tar.gz`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\installer\dist\CivicSuite-city-core-windows-0.1.2.cmd`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\installer\dist\CivicSuite-city-core-windows-0.1.2.zip`

Audit-lite report:

- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\docs\process\audits\audit-lite-stage-2-slice-3-response-letter-timeout-2026-05-31.md`

Evidence:

- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\docs\process\evidence\stage-2-live-install-blockers-2026-05-31\slice-3-response-letter-timeout\windows-lifecycle-response-letter-r1.json`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\docs\process\evidence\stage-2-live-install-blockers-2026-05-31\slice-3-response-letter-timeout\windows-lifecycle-response-letter-r1-final-uninstall.json`

Local checks:

- `python -m pytest backend/tests/test_response_letter.py -q` from `C:\dev\Claude\civicrecords-ai-stage2-response-letter`
- `python -m pytest tests/test_stage2_live_install_blockers.py -q`
- `git diff --check`
- `$env:CIVICSUITE_SOURCE_ROOT_CIVICRECORDS_AI='C:\dev\Claude\civicrecords-ai-stage2-response-letter'; python scripts/plan-installer.py --profile city-core --generate-release-artifacts --installer-version 0.1.2 --package-platform all`
- `python scripts/run-installer-package-cleanroom.py --archive installer/dist/CivicSuite-city-core-windows-0.1.2.zip --platform windows --run-id stage2-slice3-windows-lifecycle-response-letter-r1 --staff-mode bearer --workflow-proof`
- `$env:CIVICSUITE_INSTALLER_INSTALL_ROOT='C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\installer\runtime\clerk-core'; $env:CIVICSUITE_INSTALLER_RUN_ID='clerk-core-install-20260531T155223Z-5ff57d94'; python scripts/run-clerk-core-installer.py uninstall --module civicrecords-ai --module civicclerk --module civiccode --remove-files`

Notes:

- CivicRecords AI source branch `stage-2-response-letter-timeout-2026-05-31` was pushed at `35e014be438b84326ec9eac1f4767d54de5800c7`.
- The rebuilt city-core artifact vendors that exact source commit.
- Windows lifecycle `stage2-slice3-windows-lifecycle-response-letter-r1` passed with `draft_response_letter` returning `201` and `suite_launcher_http` returning `passed`.
- The new Records AI timeout fallback unit test passed; two existing endpoint tests need the test DB hostname `postgres` and errored before reaching this slice's change on this host.

Commits:

- Pending

### Slice 4 - Close clean-machine live-gate hang with streamed output and fail-fast probes

Status: Implemented, pending Claude clean-machine retest

Changed files:

- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\scripts\run-clerk-core-installer.py`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\scripts\run-installer-package-cleanroom.py`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\tests\test_stage2_live_install_blockers.py`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\installer\dist\CivicSuite-city-core-0.1.2-SHA256SUMS.txt`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\installer\dist\CivicSuite-city-core-0.1.2-release-manifest.json`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\installer\dist\CivicSuite-city-core-linux-0.1.2.run`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\installer\dist\CivicSuite-city-core-linux-0.1.2.tar.gz`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\installer\dist\CivicSuite-city-core-macos-0.1.2.tar.gz`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\installer\dist\CivicSuite-city-core-windows-0.1.2.cmd`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\installer\dist\CivicSuite-city-core-windows-0.1.2.zip`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\docs\process\audits\audit-lite-stage-2-slice-4-hang-failfast-2026-06-01.md`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\docs\process\evidence\stage-2-live-install-blockers-2026-05-31\slice-4-hang-failfast\windows-lifecycle-streamed-r4.json`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\docs\process\evidence\stage-2-live-install-blockers-2026-05-31\slice-4-hang-failfast\launcher-output-r4\readiness.log`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\docs\process\evidence\stage-2-live-install-blockers-2026-05-31\slice-4-hang-failfast\launcher-output-r4\plan.log`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\docs\process\evidence\stage-2-live-install-blockers-2026-05-31\slice-4-hang-failfast\launcher-output-r4\preclean.log`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\docs\process\evidence\stage-2-live-install-blockers-2026-05-31\slice-4-hang-failfast\launcher-output-r4\install.log`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\docs\process\evidence\stage-2-live-install-blockers-2026-05-31\slice-4-hang-failfast\launcher-output-r4\repair.log`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\docs\process\evidence\stage-2-live-install-blockers-2026-05-31\slice-4-hang-failfast\launcher-output-r4\verify.log`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\docs\process\evidence\stage-2-live-install-blockers-2026-05-31\slice-4-hang-failfast\launcher-output-r4\backup.log`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\docs\process\evidence\stage-2-live-install-blockers-2026-05-31\slice-4-hang-failfast\launcher-output-r4\restore.log`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\docs\process\evidence\stage-2-live-install-blockers-2026-05-31\slice-4-hang-failfast\launcher-output-r4\uninstall.log`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\docs\process\evidence\stage-2-live-install-blockers-2026-05-31\slice-4-hang-failfast\clerk-core-installer-lifecycle-r4.json`

Audit-lite report:

- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\docs\process\audits\audit-lite-stage-2-slice-4-hang-failfast-2026-06-01.md`

Evidence:

- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\docs\process\evidence\stage-2-live-install-blockers-2026-05-31\slice-4-hang-failfast\windows-lifecycle-streamed-r4.json`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\docs\process\evidence\stage-2-live-install-blockers-2026-05-31\slice-4-hang-failfast\launcher-output-r4\*.log`
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\docs\process\evidence\stage-2-live-install-blockers-2026-05-31\slice-4-hang-failfast\clerk-core-installer-lifecycle-r4.json`

Local checks:

- `python -m pytest tests/test_stage2_live_install_blockers.py -q`
- `python scripts/verify-installer-plan.py`
- `python -m pytest tests/test_stage2_live_install_blockers.py tests/test_city_core_suite_session_contract.py scripts/policy/test_city_core_suite_session_closeout_contract.py -q`
- `git diff --check`
- `$env:CIVICSUITE_SOURCE_ROOT_CIVICRECORDS_AI='C:\dev\Claude\civicrecords-ai-stage2-response-letter'; python scripts/plan-installer.py --profile city-core --generate-release-artifacts --installer-version 0.1.2 --package-platform all`
- `python scripts/run-installer-package-cleanroom.py --archive installer/dist/CivicSuite-city-core-windows-0.1.2.zip --platform windows --run-id stage2-slice4-windows-lifecycle-streamed-r4 --staff-mode bearer --workflow-proof`

Notes:

- Claude's independent clean-machine retest at `C:\Users\scott\Documents\claude-codex-bridge\from-claude\2026-06-01T0006-claude-live-retest-failed-hang.md` failed because the launcher output was buffered and the installer spent the remainder of the install timeout after cold model pull without observable progress.
- The cleanroom harness now streams every launcher mode to `launcher-output\*.log`, records each path as `streamed_output`, and clears stale extraction state before reusing a run id.
- The installer now treats Ollama LLM prewarm as a bounded nonfatal warmup capped at 90 seconds; required model pulls remain required.
- The suite launcher HTTP verifier uses bounded curl probes and detects immediate Python server exit, so port issues fail with evidence instead of hanging.
- The Records AI public-route verifier retries slow OpenAPI generation after repair before declaring route-mount failure.
- Windows lifecycle `stage2-slice4-windows-lifecycle-streamed-r4` passed with `evidence_classification: matching_host_lifecycle`, `draft_response_letter` returning `201`, `suite_launcher_http` returning `passed`, and backup/restore/uninstall passing.

Commits:

- Pending

## Stage Closeout

Audit-full package:

- Pending

PR:

- Pending

Merge commit:

- Pending

Tag:

- Pending
