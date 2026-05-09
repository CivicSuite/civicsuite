# CivicSuite Active Work Queue

Last updated: 2026-05-09

## Active Target #1

1. **Installer OS cleanroom validation**

Why first: the paused handoff identifies Windows/macOS cleanroom proof as the remaining trust gap after the real `clerk-core` installer lifecycle shipped. Finishing this before module recovery protects the zero-to-running-CivicSuite path the user explicitly required.

Definition of Done: see `.agent-workflows/PROJECT_CONTROL_PLANE.md`.

Current status: YELLOW.

Completed evidence:

- Windows extracted-package lifecycle passed: `installer/reports/installer-package-cleanroom-20260509T193309Z-b90bb614/installer-package-cleanroom.json`
- Linux extracted-package lifecycle passed: `installer/reports/installer-package-cleanroom-20260509T193433Z-4582af7c/installer-package-cleanroom.json`
- macOS archive/readiness/plan proof passed: `installer/reports/installer-package-cleanroom-20260509T193159Z-9945e706/installer-package-cleanroom.json`

Remaining caveat:

- Full macOS install/repair/verify/uninstall still requires a macOS host or VM. This Windows host cannot honestly provide that runtime proof.

## Queued Targets

2. **Installer correction and release refresh if validation finds defects**

Why second: if OS validation exposes package or documentation defects, those fixes must land before the installer can be treated as a trustworthy foundation.

3. **Resume CivicSuite product module recovery queue**

Why third: once the installer trust gap is closed or explicitly accepted, the work should return to recovering the supposedly finished product modules in order, starting from the current specs and repo evidence rather than prior claims.

4. **Reusable workflow plugin evaluation**

Why fourth: the new `project-control-plane` skill should become a plugin only after at least one real high-pressure run proves which parts need tools, checks, or UI.

## Current Decision

Proceed with Active Target #1. Do not start queued targets until #1 is complete, blocked with evidence, or explicitly reprioritized by the user.
