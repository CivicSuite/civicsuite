# Test Deep Dive - Stage 0 Recovery Baseline

## Scope

Testing reviewed the Stage 0 checks that protect the recovery baseline: hook installation, hook execution, diff hygiene, and suite-state verification.

## Findings

No open findings.

## What Is Working

- The slice-level `audit-lite` found and fixed the missing hook, unavailable `pwsh`, BOM-generated hook, and CivicCode pin drift before the branch was pushed.
- The installed pre-push hook executed during `git push` and allowed the push only after the branch was clean and the hook was spawnable.
- `python scripts\verify-suite-state.py --remote-only` catches the exact lockstep drift Stage 0 restored.
- The PR #186 CI failure surfaced the stale workflow checkout ref, and the follow-up slice added `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\docs\process\audits\audit-lite-stage-0-installer-cleanroom-pin-fix-2026-05-30.md` before pushing the workflow fix.

## Verification

- `powershell.exe -NoProfile -File scripts\install-git-hooks.ps1` installed the hook.
- `Format-Hex -LiteralPath .git\hooks\pre-push` showed the generated hook starts with `35, 33, 47, 98`, i.e. `#!/b`, not a UTF-8 BOM.
- `git push -u origin stage-0-recovery-baseline-2026-05-30` executed the pre-push hook successfully.
- `python scripts\verify-suite-state.py --remote-only` returned `VERIFY-SUITE-STATE: PASSED`.
- `python scripts\policy\check_actions_budget.py --run 2026-05-30-stage-0-recovery-baseline --base-ref origin/main` returned PASS.
- `python scripts\policy\check_workflow_cost_ledger.py --run 2026-05-30-stage-0-recovery-baseline` returned PASS.

## Limitations

No product test suite was run for Stage 0 because this branch changes recovery/process docs, source pins, and hook scripts only. Product live-assembled testing resumes in later stages after the installer implementation is reconstructed.
