# Clerk-Core City Release Setup Evidence

Date: 2026-05-18
Branch: `chore/clerk-core-city-release`
Run: `.agent-runs/2026-05-18-clerk-core-city-release`

## Active Target

Active target is Clerk-Core City Release: CivicCore, CivicRecords AI, CivicClerk, and the CivicSuite installer. CivicContracts and later modules are paused until the starter product passes its release gate.

## What Changed

- Added the canonical rung plan at `docs/roadmap/clerk-core-city-release-plan.md`.
- Updated `.agent-workflows/PROJECT_CONTROL_PLANE.md` and `.agent-workflows/ACTIVE_WORK_QUEUE.md` to make the clerk-core city release the active target.
- Added missing `agent-pipeline-codex` v0.9.0 scope-lock/policy plumbing needed by the authorized workflow.
- Updated `README.md` and `STATUS.md` to name the active starter target and the unresolved spec-count cleanup.
- Updated `docs/CivicSuiteUnifiedSpec.md` to remove stale CivicClerk `v0.1.1 / civiccore==0.3.0` current-state text.
- Added CivicRegWatch and CivicAPI to `installer/modules.json` as planned, non-selectable spec modules.
- Updated `scripts/verify-installer-plan.py` so planned non-selectable modules are accepted by installer verification.

## Verification

- `python scripts/policy/run_preflight.py --run 2026-05-18-clerk-core-city-release` - PASS.
- `python scripts/policy/check_scope_lock.py --run 2026-05-18-clerk-core-city-release` - PASS.
- `python scripts/policy/check_execute_readiness.py --run 2026-05-18-clerk-core-city-release` - PASS.
- `python scripts/policy/run_all.py --run 2026-05-18-clerk-core-city-release` - PASS.
- `python scripts/verify-suite-state.py --remote-only` - PASS, including `[civicrecords-ai] PASS 1.6.1`.
- `bash scripts/verify-docs.sh` - PASS.
- `python scripts/verify-installer-plan.py` - PASS.
- `git diff --check` - PASS, with line-ending normalization warnings only.

## Remaining Blockers

- The starter product is not yet a city-deployable public release.
- The installer lifecycle proof still needs install/start/health/repair/backup/restore/uninstall evidence.
- CivicRecords AI and CivicClerk installed-stack workflow proof is still required.
- Browser QA is still required for every starter public/staff path and state.
- CivicCore `1.1.0` platform truth versus CivicRecords AI/CivicClerk `==1.0.1` compatibility must be resolved with tests and docs, not assumed.
- The unified spec says 28 product modules plus CivicCore, while visible product headings after CivicCore currently name 27 products. The missing product identity must be resolved before freezing the post-starter 26-module queue.

## Forbidden Claims

Do not claim full-suite maturity, procurement certification, airgap certification, native desktop app support, or macOS lifecycle certification from this setup slice.
