# Audit Lite - Stage 3A Phase-Aware Artifact Refresh
**Date:** 2026-06-05
**Scope:** Reviewed the regenerated city-core 0.1.2 customer artifacts after the Stage 3A phase-aware failure-message fix.
**Reviewer:** Codex (audit-lite)

## TL;DR
Ship this artifact refresh. The regenerated Windows customer zip and one-click `.cmd` now embed the phase-aware bootstrapper source, the wrapper smoke path passes, and the release manifest/checksum file match the rebuilt artifacts. No audit-lite findings remain.

## Severity rollup
- Blocker: 0
- Critical: 0
- Major: 0
- Minor: 0
- Nit: 0

## Findings

None.

## What's working
- The generator ran with explicit safe source-root overrides for the declared pins: CivicCore `9f7e3a5`, CivicRecords AI `cddc4d2`, CivicClerk `af8b989`, and CivicCode `a960bba`.
- `installer/generated/bundles/city-core/windows/CivicSuite-city-core-windows/installer/baremetal/windows/civicsuite-baremetal-bootstrap.ps1` contains `Stage2 Docker/Ollama prerequisite issue`, proving the customer bundle embeds the source fix.
- The regenerated `installer/dist/CivicSuite-city-core-0.1.2-SHA256SUMS.txt` and `installer/dist/CivicSuite-city-core-0.1.2-release-manifest.json` record the new Windows artifact hashes.

## Verification
- Artifact generation: `scripts/plan-installer.py --profile city-core --generate-release-artifacts --installer-version 0.1.2` with `CIVICSUITE_SOURCE_ROOT_*` overrides -> passed.
- `CIVICSUITE_ONE_CLICK_SMOKE_ONLY=1` with `installer/dist/CivicSuite-city-core-windows-0.1.2.cmd` -> `CivicSuite bare-metal wrapper smoke check passed.`
- `python -m pytest tests/test_windows_baremetal_bootstrap.py tests/test_windows_baremetal_progress.py tests/test_docker_desktop_spike.py tests/test_stage2_live_install_blockers.py` -> 57 passed.
- Windows zip SHA256: `108e3429344f75638ec707b391316598a4fdf784577014515226f919dbdd92fc`.
- Windows `.cmd` SHA256: `7d6ea3d9ac8f32c7c484fd352addcd08acc614d15336a4ba84f9e3c81c222d2f`.

## Escalation recommendation
No escalation needed for this scoped artifact refresh. Full Stage 3A closeout audit/walkthrough continues from the regenerated artifact head.
