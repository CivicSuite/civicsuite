# Audit Lite: Windows Local CI Cleanroom Space Reclaim

Date: 2026-06-16

## Scope

PR #192 head `bf871c5cad3e98bd874ac847beaf37c9f0279774` moved past the targeted Windows Local workflow fixes, but the Linux city-core archive lifecycle on GitHub Actions stopped before extraction because the hosted runner had about 21 GB free after city-core release artifact generation while the existing cleanroom hygiene gate requires 60 GB.

## Change

- Added `scripts/reclaim-installer-cleanroom-space.py` to remove disposable generated installer bundle sources and checked-out module source copies after the release archive has already been created.
- Added a lifecycle-workflow step in `.github/workflows/installer-cleanroom.yml` before `run-installer-package-cleanroom.py`.
- The cleanup requires `--approved`, refuses paths outside the repository root, keeps `installer/dist` archives intact, and writes `hosted-runner-workspace-reclaim.json` into the installer report directory.

## Validation

- `python -m py_compile scripts/reclaim-installer-cleanroom-space.py scripts/run-installer-package-cleanroom.py`
- `bash scripts/verify-docs.sh`
- `python scripts/verify-deployment-profile.py --static-only`
- `python scripts/policy/check_stage_evidence.py`
- `git diff --check`

## Result

The hosted CI lifecycle now reclaims space without weakening the cleanroom free-disk gate or classifying an unrun lifecycle as a pass.
