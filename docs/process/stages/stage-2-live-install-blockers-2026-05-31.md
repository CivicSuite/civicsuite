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

## Stage Closeout

Audit-full package:

- Pending

PR:

- Pending

Merge commit:

- Pending

Tag:

- Pending
