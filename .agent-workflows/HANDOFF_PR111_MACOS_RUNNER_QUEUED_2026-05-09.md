# CivicSuite Handoff - PR #111 macOS Runner Queued

Date: 2026-05-09

Status: paused on external GitHub runner availability.

## Active Target

- Active target: CivicSuite installer
- Goal: add hosted macOS archive/launcher/readiness/plan validation
- Status: YELLOW
- Scope boundary: installer CI/docs only

## Branch And PR

- Local branch: `installer/macos-hosted-archive-validation`
- PR: https://github.com/CivicSuite/civicsuite/pull/111
- Commit: `4902dba ci(installer): run macos archive validation on hosted macos`
- Merged: no
- Release assets changed: no

## What PR #111 Does

- Changes `.github/workflows/installer-cleanroom.yml` so the `macos archive readiness and plan` job runs on `macos-13`.
- Updates installer docs to state that hosted macOS CI proves only archive extraction, shell launcher behavior, readiness, and plan.
- Explicitly does not claim full macOS Docker Desktop install/repair/verify/uninstall certification.

## Local Verification Completed

Passed locally:

```powershell
python scripts\verify-installer-plan.py
bash scripts/verify-docs.sh
git diff --check
```

Note: `bash scripts/verify-docs.sh` printed a local WSL config warning about `wsl2.autoMemoryReclaim`, but exited successfully.

## PR #111 CI State

Passed:

- `verify`
- `windows archive readiness and plan`
- `linux archive readiness and plan`
- `linux archive full lifecycle`

Blocked / queued:

- `macos archive readiness and plan`

GitHub job evidence:

- Run id: `25612919114`
- Job id: `75186011861`
- Job name: `macos archive readiness and plan`
- Status: `queued`
- Conclusion: empty
- Completed at: `0001-01-01T00:00:00Z`
- Steps: `[]`

Interpretation: the macOS job has not started. It has not failed and is not stuck running. GitHub has not assigned a hosted macOS runner yet.

## Recommended Next Action

Recommendation: leave PR #111 open and re-check the macOS job later.

Why: PR #111 exists specifically to obtain hosted macOS archive evidence. Merging before the macOS job runs defeats that purpose, while changing it back to Linux-hosted validation weakens the chosen evidence path.

## Resume Options

1. Re-check PR #111 CI and merge if the macOS job passed.
2. If the macOS job failed, inspect its logs and fix the branch.
3. If the macOS job is still queued after a long delay, decide whether to keep waiting, revert to Linux-hosted archive validation, or close PR #111.
