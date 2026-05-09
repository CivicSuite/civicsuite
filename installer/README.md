# CivicSuite Installer Contract

Status: design contract, not implementation.

This directory defines the suite-level installer target for CivicSuite. It does
not replace module-specific install paths, and it does not certify any module as
city-ready. The goal is to define the delivery surface that can take a
zero-baseline machine to a working local CivicSuite profile.

## Required Outcome

The suite installer must support:

- Windows 10/11
- macOS 13 or newer
- Linux, with Ubuntu LTS as the first proof target

From a zero-baseline machine, the installer must:

1. Detect the host operating system and hardware capacity.
2. Detect, install, or guide the setup of baseline software.
3. Install and configure CivicCore as the shared foundation.
4. Present a menu-style module selector.
5. Install and configure selected modules.
6. Bring the selected profile to a working local state.
7. Record repeatable proof for each supported operating system.

Per-module installers do not satisfy this contract.

## Baseline Dependencies

The installer must treat these as explicit baseline checks:

- Docker Desktop on Windows/macOS, or Docker Engine on Linux.
- WSL 2 and Virtual Machine Platform on Windows when Docker Desktop requires it.
- Sufficient RAM and disk space for the chosen profile.
- Local container runtime availability.
- Optional Ollama availability for local LLM profiles.
- Network access only when fetching release artifacts or optional models.

The installer may guide the user to install privileged dependencies when silent
installation would be unsafe, unsupported, or outside the operator's control.

## CivicCore First

Every install profile starts with CivicCore. The installer must verify the
selected module's CivicCore compatibility before installing that module.

No module may depend on planned CivicCore behavior unless the behavior is
released and recorded in the compatibility matrix.

## Module Selection

The module selector must be driven by `modules.json`, not hard-coded UI labels.
Each module entry records:

- repository name
- display name
- tier
- current installer status
- CivicCore requirement
- selectable flag
- dependencies
- default port, when relevant
- proof obligations

The dry-run menu model exposes the same source data as JSON:

```powershell
python scripts\plan-installer.py --profile clerk-core --menu-style guided --show-menu --dry-run
```

The menu model must include profile choices, selectable modules, and the
selected menu style without changing host state.

## Menu Styles

Initial menu styles:

- `guided`: step-by-step setup with recommended defaults.
- `department`: module choices grouped by municipal workflow area.
- `advanced`: compact controls for technical operators.

## Profiles

Initial profiles:

- `minimal`: CivicCore only.
- `clerk-core`: CivicCore, CivicRecords AI, CivicClerk.
- `land-use`: CivicCore, CivicCode, CivicZone, CivicPlan, CivicPermit.
- `full-suite`: every tracked CivicSuite repo after CivicCore dependency ordering.
- `custom`: operator-selected modules with dependency validation.

## Dry-Run Launchers

The first platform entrypoints are non-mutating launcher wrappers around the
shared planner:

- Windows: `installer/windows/plan-installer.ps1`
- macOS: `installer/macos/plan-installer.sh`
- Linux: `installer/linux/plan-installer.sh`

Each launcher forces `--dry-run`, prints the selected profile, and delegates to
`scripts/plan-installer.py`. These launchers are not allowed to install
dependencies, start services, or change host state.

Each launcher also supports the dry-run selector surface:

- Windows: `installer/windows/plan-installer.ps1 -ShowMenu -MenuStyle guided`
- macOS: `bash installer/macos/plan-installer.sh --show-menu --menu-style guided`
- Linux: `bash installer/linux/plan-installer.sh --show-menu --menu-style guided`

## Readiness And Error States

The dry-run planner must render readiness states before any real install
behavior exists:

```powershell
python scripts\plan-installer.py --profile clerk-core --show-readiness --readiness-scenario missing-docker --dry-run
```

It can also inspect the host in read-only mode:

```powershell
python scripts\plan-installer.py --profile clerk-core --show-readiness --detect-host --dry-run
```

Host detection may check executable presence, disk space, memory, Docker daemon
status, WSL status, and optional Ollama presence. It must not install packages,
start services, start containers, or change host configuration.

Initial readiness scenarios:

- `nominal`: all dry-run checks pass.
- `missing-docker`: container runtime is unavailable.
- `windows-missing-wsl`: Windows WSL 2 prerequisites are unavailable.
- `low-resources`: the selected profile may not have enough disk or memory.
- `ollama-missing`: local LLM features may be unavailable.
- `civiccore-mismatch`: selected modules require a different CivicCore version.

Every failed readiness check must include a clear message, concrete fix steps,
and a next action. "Something failed" is not an acceptable installer state.

## Execution Gate

Install execution is blocked by default. The current planner can render the
execution gate, but it cannot install software or mutate the host:

```powershell
python scripts\plan-installer.py --profile minimal --execute --dry-run
```

The gate returns `gate_status: blocked`, `execution_status: not_implemented`,
and `mutates_host: false`. Even with the explicit future approval token
`I_UNDERSTAND_THIS_MUTATES_HOST`, this slice must still report that no mutating
executor exists.

Future install execution may only be added in a separate reviewed slice after
the dry-run plan, readiness state, and approval boundary are verified.

## Executor State Machine

The future executor is currently a design-only state machine:

```powershell
python scripts\plan-installer.py --profile minimal --show-executor-design --dry-run
```

Required phases:

- `preflight`: validate plan, readiness, and evidence paths.
- `approval`: require explicit operator approval before mutation.
- `execute`: future mutating install phase for CivicCore and selected modules.
- `verify`: health, restart, and failure-copy verification.
- `repair`: future mutating repair phase.
- `rollback`: future mutating rollback or uninstall phase.

Only `execute`, `repair`, and `rollback` may ever mutate host state, and they
remain design-only until a separate reviewed implementation slice exists.

## Evidence Schema

The future executor evidence schema is also dry-run only:

```powershell
python scripts\plan-installer.py --profile minimal --show-evidence-schema --dry-run
```

The schema defines the report files future installer phases must produce under
`installer/reports/{run_id}`. It covers dry-run plans, readiness reports,
approval records, install logs, artifact versions, service config, health
checks, restart checks, failure-copy checks, repair logs, post-repair checks,
rollback logs, and remaining-state reports.

This slice does not write report files. It defines the fields, path templates,
redaction rules, and validation rules that future report writers must satisfy.

## Proof Requirements

Each operating system must eventually have evidence for:

- dependency detection
- CivicCore install
- module selection
- selected module installation
- service start
- health checks
- restart behavior
- uninstall or repair behavior
- failure recovery and actionable error copy
- readiness fix steps before real installation
- execution gate proof before host mutation
- dependency detection evidence without host mutation
- executor state machine evidence before implementation
- evidence schema before report writers

## Implementation Boundary

This design slice does not implement a native installer binary. It creates the
contract that the implementation must satisfy.

The dry-run installer planner reads `modules.json`, resolves profile
dependencies, and prints the exact planned install actions without changing the
host.
