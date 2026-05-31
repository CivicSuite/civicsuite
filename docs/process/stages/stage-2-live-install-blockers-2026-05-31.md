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
