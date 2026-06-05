# Audit Lite - Stage 3A Docs and Artifact Refresh
**Date:** 2026-06-05
**Scope:** Reviewed the final Stage 3A docs truth update plus regenerated city-core 0.1.2 artifacts after the Stage3 result JSON and Docker build retry fixes.
**Reviewer:** Codex (audit-lite)

## TL;DR
Ship this slice to the feature branch. The regenerated customer artifacts now include the latest Stage3 failure handling and Docker build retry code. Later tester result 021 closed the artifact-path proof with a green customer-artifact run. No audit-lite findings remain for this slice.

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
- The current truth docs now name the 017/018/021 evidence chain without claiming promotion.
- `tests/test_stage2_live_install_blockers.py` prevents the truth docs from dropping the green artifact gate, Ollama/gemma4 evidence, or no-promotion language.
- The earlier artifact-split audit hash evidence was updated to match the final regenerated Windows zip and `.cmd` checksums.

## Verification
- Focused installer suite: `56 passed in 61.15s`.
- Actual regenerated `.cmd` smoke: `CivicSuite bare-metal wrapper smoke check passed.`
- Archive inspection confirmed the regenerated Windows zip contains the Docker retry constants and `COMPOSE_PARALLEL_LIMIT` default in the embedded lifecycle runner.
- Final checksum evidence after the later phase-aware failure-message artifact refresh:
  - Windows zip: `108e3429344f75638ec707b391316598a4fdf784577014515226f919dbdd92fc`
  - Windows `.cmd`: `7d6ea3d9ac8f32c7c484fd352addcd08acc614d15336a4ba84f9e3c81c222d2f`
  - macOS archive: `fff3287461cd6141653d0dbf17ca0245c3ead7520d158b777d10a523d71cd262`
  - Linux archive: `9396c6a69864491a2e79106ffed8213d1bb6762514d73245072754e272f2ab43`
  - Linux `.run`: `a31ec67575d6419080c45fb22648b98282c2a78387f279e4f718773a1bbebbba`

## Escalation Recommendation
No escalation needed for this slice. Later tester result 021 supplied the external Windows artifact-path tester result and passed Stage0 through Stage4.
