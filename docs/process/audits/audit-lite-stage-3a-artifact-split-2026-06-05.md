# Audit Lite - Stage 3A Artifact Split
**Date:** 2026-06-05
**Scope:** Reviewed the Stage 3A city-core Windows artifact split fix: release bundle contents, one-click `.cmd` entrypoint, generated customer README text, test-comms standing procedure, regenerated checksums, and focused installer regression tests.
**Reviewer:** Codex (audit-lite)

## TL;DR
Ship this slice to the feature branch. The regenerated Windows city-core artifact now carries the Stage 3A bare-metal scripts, the one-click wrapper launches the bare-metal progress wrapper instead of the legacy `-FirstRun` path, and the standing tester procedure now requires the customer artifact plus real `Get-HostFacts` behavior. No audit-lite findings remain for this slice.

## Severity rollup
- Blocker: 0
- Critical: 0
- Major: 0
- Minor: 0
- Nit: 0

## Findings

None.

## What's Working
- `scripts/plan-installer.py:3101` stages `installer/baremetal/windows` into the city-core Windows release bundle and excludes transient logs, injected host-facts files, and downloaded prerequisite installers.
- `scripts/plan-installer.py:3182` makes the city-core Windows `.cmd` discover `civicsuite-baremetal-progress.ps1` and `civicsuite-baremetal-bootstrap.ps1`; smoke mode validates both scripts with PowerShell parsing without running Stage0 on the developer host.
- `scripts/plan-installer.py:2457` and `scripts/plan-installer.py:3132` make the generated package README and bundle root README point operators at the Stage 3A progress wrapper.
- `test-comms/README.md:13` requires the next tester run to use real host facts, and `test-comms/README.md:14` requires the regenerated customer `.cmd` artifact rather than the repo-local bootstrapper.
- `tests/test_stage2_live_install_blockers.py:516`, `tests/test_stage2_live_install_blockers.py:552`, `tests/test_stage2_live_install_blockers.py:583`, and `tests/test_stage2_live_install_blockers.py:600` cover the archive payload, `.cmd` entrypoint, README contract, and tester protocol.

## Verification
- Focused regression suite: `51 passed in 60.14s`.
- Regenerated Windows city-core artifacts with pinned source-root overrides for Records AI, Clerk, and Code.
- Actual one-click artifact smoke: `CivicSuite bare-metal wrapper smoke check passed.`
- Archive inspection confirmed these entries exist in `installer/dist/CivicSuite-city-core-windows-0.1.2.zip`: `civicsuite-baremetal-bootstrap.ps1`, `civicsuite-baremetal-progress.ps1`, `civicsuite-stack-teardown.ps1`, and `docker-desktop-spike.ps1`.
- Root bundle README inside the zip says `Start here: installer/baremetal/windows/civicsuite-baremetal-progress.ps1`.
- Regenerated checksums after the later phase-aware failure-message artifact refresh: Windows zip `108e3429344f75638ec707b391316598a4fdf784577014515226f919dbdd92fc`; Windows `.cmd` `7d6ea3d9ac8f32c7c484fd352addcd08acc614d15336a4ba84f9e3c81c222d2f`.

## Escalation Recommendation
No escalation needed for this slice. Later tester result 021 supplied the separate clean Windows tester run against the regenerated customer artifact, with no host-facts injection, and passed Stage0 through Stage4.
