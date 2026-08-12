# CivicInspect v1.0.0 Installer Integration Evidence

Superseded note, 2026-05-14: this is historical recovery evidence for a false
v1.0.0 release path. CivicInspect is currently a demoted v0.2.0 recovery-label
module and is not product-ready.

Date: 2026-05-09

## Purpose

Record the retroactive installer/module-selection evidence required by the new
CivicSuite rule: a module is not fully `v1.0.0` unless it is integrated into the
CivicSuite installer path.

## Manifest Result

- `installer/modules.json` marks `civicinspect` selectable.
- `civicinspect` now requires CivicCore `1.0.0`.
- `civicinspect` depends on `civiccore`, `civiccode`, and `civicpermit`.
- `civicinspect` is included in the `land-use` profile after CivicPermit.
- `civicinspect` remains included in `full-suite`.
- `civicinspect` proof requirements now include module selection, install plan,
  artifact resolution, health check, and restart.

## Verification

Command:

```powershell
python scripts\verify-installer-plan.py
```

Result:

```text
VERIFY-INSTALLER-PLAN: PASSED
```

Specific proof command:

```powershell
python scripts\plan-installer.py --profile custom --module civicinspect --show-artifacts --dry-run --write-report --run-id civicinspect-v1-installer-integration-20260509
```

Result:

- `mutates_host`: `false`
- `profile`: `custom`
- `modules`: `civiccore`, `civicclerk`, `civiccode`, `civiczone`, `civicpermit`, `civicinspect`
- `blockers`: none
- CivicInspect version: `1.0.0`
- CivicInspect latest local tag after tag fetch: `v1.0.0`
- CivicInspect artifacts resolved:
  - `dist\civicinspect-1.0.0-py3-none-any.whl`
  - `dist\civicinspect-1.0.0.tar.gz`
  - `dist\SHA256SUMS.txt`

## Limitation

This closes the installer/module-selection planning gate for CivicInspect. It
does not close the broader macOS installer lifecycle issue. macOS remains
beta/YELLOW until a real macOS host or VM lifecycle proof exists.
