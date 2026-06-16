# Audit Lite: Windows Hosted Runner Toolcache Reclaim

Date: 2026-06-16
Scope: PR #192 CI hardening after head `cbf67abe1abbb36048b53c68a6041dfc7307f078`.

## Findings

No unresolved Blocker, Critical, Major, Minor, or Nit findings for this slice.

## Trigger

The installer-cleanroom Linux clerk-core lifecycle stopped before archive extraction on GitHub-hosted Ubuntu. The job had about 19 GB free before cleanup and about 21 GB after repository/Docker cleanup, below the existing 60 GB cleanroom hygiene gate.

## Fix Reviewed

- [scripts/reclaim-installer-cleanroom-space.py](../../scripts/reclaim-installer-cleanroom-space.py): keeps the existing repository-root cleanup, then, only when running on GitHub-hosted Linux with `--approved`, removes known disposable hosted-runner toolcache families (`android`, `dotnet`, `ghc`, `ghcup`, and CodeQL) before the cleanroom lifecycle check.
- [scripts/reclaim-installer-cleanroom-space.py](../../scripts/reclaim-installer-cleanroom-space.py): records separate repository and hosted-runner cleanup evidence, including bytes before, removal status, and command output tails.
- [.github/workflows/installer-cleanroom.yml](../../.github/workflows/installer-cleanroom.yml): runs the approved reclaim step before both package-plan extraction and full Linux lifecycle extraction.
- The 60 GB cleanroom gate remains unchanged; the hosted runner now reclaims disposable preinstalled toolchains instead of weakening lifecycle evidence criteria.

## Evidence

- `python -m py_compile scripts/reclaim-installer-cleanroom-space.py scripts/run-installer-package-cleanroom.py`
- `python scripts/reclaim-installer-cleanroom-space.py --run-id local-no-approved-smoke` refused cleanup without `--approved`
- `bash scripts/verify-docs.sh`
- `python scripts/verify-deployment-profile.py --static-only`
- `python scripts/policy/check_stage_evidence.py`
- `git diff --check` with CRLF normalization warnings only

## Residual Risk

This still needs hosted CI to confirm enough space is reclaimed on the runner image variant that failed. If the runner image continues below the 60 GB gate after toolcache cleanup, the remaining fix should move the lifecycle to a larger runner or split artifact generation and lifecycle into separate jobs.
