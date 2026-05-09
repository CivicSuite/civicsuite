# CivicSuite Installer Checkpoint - 2026-05-09

Status: dry-run control surface complete; no host mutation implemented.

## Scope Completed

This checkpoint records the first safe installer slice for CivicSuite. The work
created an umbrella-level installer contract and dry-run planner, not a native
installer binary and not a module runtime change.

Completed surfaces:

- `installer/modules.json` covers all 26 tracked CivicSuite repos.
- `scripts/plan-installer.py` resolves profiles, dependencies, menu styles,
  readiness states, and the execution gate.
- `installer/windows/plan-installer.ps1` wraps the planner for Windows.
- `installer/macos/plan-installer.sh` wraps the planner for macOS.
- `installer/linux/plan-installer.sh` wraps the planner for Linux.
- `scripts/verify-installer-plan.py` verifies the manifest, planner, launcher
  wrappers, selector model, readiness states, and execution gate.

## Current Safety Boundary

The installer work is intentionally non-mutating.

Allowed now:

- print a dry-run install plan
- show the profile and module selector model
- show readiness/error states with fix steps
- inspect dependencies in read-only dry-run mode
- request execution and receive a blocked/non-mutating gate response
- render the future executor state machine in dry-run mode
- render the future evidence/report schema in dry-run mode

Not allowed yet:

- install dependencies
- start services or containers
- mutate host state
- install CivicCore or any module
- repair or uninstall services
- package native installers
- change module product code

## Verified Commands

Focused examples:

```powershell
python scripts\plan-installer.py --profile clerk-core --dry-run
python scripts\plan-installer.py --profile full-suite --dry-run
python scripts\plan-installer.py --profile clerk-core --menu-style guided --show-menu --dry-run
python scripts\plan-installer.py --profile clerk-core --show-readiness --readiness-scenario missing-docker --dry-run
python scripts\plan-installer.py --profile clerk-core --show-readiness --detect-host --dry-run
python scripts\plan-installer.py --profile minimal --execute --dry-run
python scripts\plan-installer.py --profile minimal --show-executor-design --dry-run
python scripts\plan-installer.py --profile minimal --show-evidence-schema --dry-run
```

Platform launcher examples:

```powershell
installer\windows\plan-installer.ps1 -Profile clerk-core
installer\windows\plan-installer.ps1 -ShowMenu -MenuStyle guided
installer\windows\plan-installer.ps1 -ShowReadiness -ReadinessScenario missing-docker
installer\windows\plan-installer.ps1 -ShowReadiness -DetectHost
installer\windows\plan-installer.ps1 -Execute
installer\windows\plan-installer.ps1 -ShowExecutorDesign
installer\windows\plan-installer.ps1 -ShowEvidenceSchema
```

```bash
bash installer/macos/plan-installer.sh --profile clerk-core
bash installer/macos/plan-installer.sh --show-menu --menu-style guided
bash installer/macos/plan-installer.sh --show-readiness --readiness-scenario missing-docker
bash installer/macos/plan-installer.sh --show-readiness --detect-host
bash installer/macos/plan-installer.sh --execute
bash installer/macos/plan-installer.sh --show-executor-design
bash installer/macos/plan-installer.sh --show-evidence-schema
bash installer/linux/plan-installer.sh --profile clerk-core
bash installer/linux/plan-installer.sh --show-menu --menu-style guided
bash installer/linux/plan-installer.sh --show-readiness --readiness-scenario missing-docker
bash installer/linux/plan-installer.sh --show-readiness --detect-host
bash installer/linux/plan-installer.sh --execute
bash installer/linux/plan-installer.sh --show-executor-design
bash installer/linux/plan-installer.sh --show-evidence-schema
```

Verification stack passed:

```powershell
python scripts\verify-installer-plan.py
bash scripts/verify-docs.sh
python scripts\verify-deployment-profile.py --static-only
python scripts\verify-suite-state.py
```

Control-plane eval stack passed:

```powershell
python .agent-workflows\evals\run_all.py
```

## Next Recommended Slice

Recommended next slice: commit the batched dry-run executor design work.

Why: read-only dependency detection feeds readiness, the future executor state
machine is defined, and the evidence schema now defines the report files each
phase would write. This is a coherent non-mutating design checkpoint worth
preserving before any report writer or executor implementation is attempted.

Stop before:

- adding a mutating executor implementation
- installing baseline dependencies
- starting Docker containers
- changing CivicCore or module code
- packaging native installer binaries
