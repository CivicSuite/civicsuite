# Engineering Deep Dive - Stage 1 Live Gate Policy Harness

## Scope

Reviewed Stage 1 implementation for correctness, maintainability, recovery behavior, and security-adjacent process risk.

## Findings

No open findings.

## Closed Findings

### ENG-CLOSED-1 - Historical audit-lite reports could satisfy the hook

Severity when found: Major.

Evidence: `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\scripts\hooks\pre-push.ps1` originally checked `docs/process/audits/audit-lite-*.md`, which could match Stage 0 evidence on a later stage branch.

Fix: The hook now extracts the stage number from `stage-<number>-...` and requires `docs/process/audits/audit-lite-stage-<number>-*.md` plus a matching ledger reference.

Blast radius: Future stage branches now need current-stage audit-lite evidence before push. This is intentional and may block a push until the ledger and report are committed.

### ENG-CLOSED-2 - New policy script needed contract coverage

Severity when found: Major.

Evidence: `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\scripts\policy\check_stage_evidence.py` adds merge-affecting behavior.

Fix: Added `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\scripts\policy\test_check_stage_evidence_contract.py` covering non-stage skip behavior and missing stage evidence failures.

Blast radius: The test is narrow and local to policy enforcement. It does not touch product code.

## What Works

- The hook fails early on dirty working trees and default-branch pushes.
- The hook and CI script now share the same stage-specific evidence shape.
- The CI policy script is environment-aware: it uses `GITHUB_HEAD_REF` or `GITHUB_REF_NAME` in GitHub and falls back to the local branch in a checkout.
- The policy script uses `git ls-files`, so it verifies tracked evidence rather than merely checking whether a local file exists.

## Verification

- `python scripts\policy\check_stage_evidence.py --branch stage-1-live-gate-policy-harness-2026-05-30` passed.
- `python -m pytest scripts\policy\test_check_stage_evidence_contract.py` passed.
- Actual pushes for Stage 1 commits passed the pre-push hook after each Codex-reviewed slice.

## Residual Risk

Stage 1 protects evidence discipline; it does not recover deleted product patches by itself. Stage 2 must use this harness while reconstructing live installer work.

## Detailed Engineering Review

The main engineering invariant for Stage 1 is recoverability. After the workspace deletion incident, the failure mode was not that a single script was wrong; it was that too much release-critical state lived in a dirty checkout and temporary evidence directories. The new stage process attacks that at three levels:

1. A human-readable process file describes the required loop.
2. A local hook blocks pushes that skip basic stage evidence.
3. A CI policy script applies the durable evidence rule in GitHub.

The local hook and CI script intentionally overlap but do not share implementation language. The hook is PowerShell because it must run from Git for Windows without assuming Python activation or virtualenv state. The CI script is Python because the existing policy stack is Python and because CI needs clearer unit-testable behavior. This split is acceptable because both enforce the same externally visible contract:

- branch name starts with `stage-<number>-`;
- tracked ledger exists at `docs/process/stages/<branch>.md`;
- tracked audit-lite report exists at `docs/process/audits/audit-lite-stage-<number>-*.md`;
- ledger references audit-lite evidence for that stage number.

The use of `git ls-files` is load-bearing. A plain file-existence check would pass for a local-only file and recreate the same vulnerability: Codex could write a report to disk and believe the recovery trail exists while GitHub still has no copy. `git ls-files --error-unmatch` makes the ledger check about repository state, not the workstation filesystem.

The branch parser is intentionally narrow. It does not attempt to apply this policy to `main`, release tags, or historical branches. That avoids retroactive failures on old branch shapes while making new stage work predictable.

## Adjacent Code Considered

- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\scripts\policy\run_all.py` now includes `check_stage_evidence`, so future pipeline-style policy runs get the same check.
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\.github\workflows\verify.yml` runs the policy directly before expensive Node/browser setup.
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\scripts\install-git-hooks.ps1` did not require changes; it already installs the tracked hook source.

## Security And Data-Safety Notes

No secrets, credentials, or deployment tokens were added. The new files are process metadata, policy code, and test code. The workflow change adds no new permissions and preserves `contents: read`.

The stage ledger stores full local drive paths because Scott explicitly requires drive paths in reports and results. Those paths are already part of the CivicSuite working protocol and do not contain secrets.
