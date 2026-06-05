# Audit Lite - Stage 3A Docs and Artifact Refresh
**Date:** 2026-06-05
**Scope:** Reviewed the final Stage 3A docs truth update plus regenerated city-core 0.1.2 artifacts after the Stage3 result JSON and Docker build retry fixes.
**Reviewer:** Codex (audit-lite)

## TL;DR
Ship this slice to the feature branch. The regenerated customer artifacts now include the latest Stage3 failure handling and Docker build retry code, and the public truth surfaces state the current evidence honestly: tester result 017 green with injected facts, tester result 018 red, tester directive 019 pending for artifact-path proof. No audit-lite findings remain for this slice.

## Severity Rollup
- Blocker: 0
- Critical: 0
- Major: 0
- Minor: 0
- Nit: 0

## Findings

None.

## What's Working
- `installer/dist/CivicSuite-city-core-windows-0.1.2.zip` now embeds the updated `scripts/run-clerk-core-installer.py` with `COMPOSE_BUILD_RETRY_ATTEMPTS` and `COMPOSE_PARALLEL_LIMIT`.
- `CHANGELOG.md:24`, `STATUS.md:14`, `installer/README.md:62`, and `docs/installer/windows-baremetal-stage3a-guide.md:37` all name the 017/018/019 evidence chain without claiming promotion.
- `tests/test_stage2_live_install_blockers.py:668` prevents the truth docs from dropping the current red gate or pending artifact re-gate language.
- The earlier artifact-split audit hash evidence was updated to match the final regenerated Windows zip and `.cmd` checksums.

## Verification
- Focused installer suite: `56 passed in 61.15s`.
- Actual regenerated `.cmd` smoke: `CivicSuite bare-metal wrapper smoke check passed.`
- Archive inspection confirmed the regenerated Windows zip contains the Docker retry constants and `COMPOSE_PARALLEL_LIMIT` default in the embedded lifecycle runner.
- Final checksum evidence:
  - Windows zip: `afb7db814ec167d0b23ac0b2937f7eb3c6ce3820f97d4b6e97d152d4a1fca5c2`
  - Windows `.cmd`: `fb228a2b07c7408ead8e7c7b73a49fb28989905287bcfbacd49dc523e8431157`
  - macOS archive: `fff3287461cd6141653d0dbf17ca0245c3ead7520d158b777d10a523d71cd262`
  - Linux archive: `9396c6a69864491a2e79106ffed8213d1bb6762514d73245072754e272f2ab43`
  - Linux `.run`: `a31ec67575d6419080c45fb22648b98282c2a78387f279e4f718773a1bbebbba`

## Escalation Recommendation
No escalation needed for this slice. Stage 3A remains blocked on the external Windows artifact-path tester result, not on local code/doc readiness for these ship-blockers.
