# CivicSuite Suite Installer Plan

Status: design contract, not implementation.

This document defines the first suite-level installer target. The current
umbrella repo has deployment documentation and a bounded demo compose profile,
but it does not yet provide a cross-platform installer that starts from a
zero-baseline machine.

## Why This Exists

Module-specific installers and scripts are useful, but they do not answer the
operator question: "How do I install CivicSuite from nothing, choose the modules
I want, and end with a working local deployment?"

The suite installer is therefore its own delivery surface.

## Non-Goals For This Slice

- No native installer binary is built in this slice.
- No module runtime code changes are included.
- No dependency installation is performed by this slice.
- No service, container, or browser is started by this slice.
- No module release status is promoted by this slice.

## Required User Experience

The installer must guide an operator through:

1. Welcome and license posture.
2. Operating system and hardware checks.
3. Baseline dependency checks.
4. CivicCore foundation setup.
5. Profile selection.
6. Menu style selection.
7. Module selector flow for custom installs.
8. Configuration summary.
9. Install or repair.
10. Health check results.
11. Clear next steps.

The module selector is the installer UI/control step that turns the manifest
into an operator-facing menu. The dry-run selector model must expose the profile
choices, selectable modules, and selected menu style before any install behavior
exists.

Every warning or failure must say what happened and what the operator should do
next. Dry-run readiness output must include concrete fix steps before any real
install behavior is allowed.

Read-only dependency detection may feed readiness output. It may inspect Docker,
WSL 2, disk, memory, platform, and optional Ollama, but it must not install,
start, repair, or configure anything.

Install execution must be protected by an explicit execution gate. The current
gate is dry-run only: it may acknowledge a request to execute, but it must return
`mutates_host: false` and `execution_status: not_implemented`.

The executor state machine must be designed and verified before implementation.
The dry-run design surface must include preflight, approval, execute, verify,
repair, and rollback/uninstall phases, with evidence requirements and blockers
for each phase.

The installer must also define an evidence schema before report writers exist.
The dry-run schema must identify report paths, required fields, redaction rules,
and validation rules for each executor phase without writing files.

## Supported Profiles

The initial profile set is defined in `installer/modules.json`:

- Minimal: CivicCore only.
- Clerk Core: CivicCore, CivicRecords AI, CivicClerk.
- Land Use: CivicCore, CivicCode, CivicZone, CivicPlan, CivicPermit.
- Full Suite: all 26 tracked CivicSuite repos, ordered by dependencies.
- Custom: operator-selected modules with dependency validation.

Initial menu styles:

- Guided: recommended step-by-step setup.
- Department: municipal workflow grouping.
- Advanced: compact technical controls.

## Platform Strategy

The first implementation should favor one shared planning engine plus thin
platform launchers:

- Windows launcher: PowerShell first, native packaging later.
- macOS launcher: shell script first, signed app/pkg later.
- Linux launcher: shell script first, deb/rpm/AppImage later only if needed.

The shared planner should read `installer/modules.json`, resolve dependencies,
check host prerequisites, and produce a dry-run action plan before any install
step mutates the machine.

## Proof Gates

Before the installer can be called usable, each supported OS needs evidence for:

- fresh machine or clean VM baseline
- prerequisite detection
- CivicCore install
- each profile's module resolution
- selected module install
- health checks
- restart
- repair
- uninstall or cleanup path
- actionable failure copy

## Relationship To Existing Assets

Existing useful inputs:

- `deploy/post-foundation-demo.compose.yml`
- `scripts/verify-deployment-profile.py`
- `scripts/verify-suite-state.py`
- `civicrecords-ai/installer/windows`

Those are inputs, not the suite installer. The suite installer must remain
umbrella-level and profile-driven.

## Next Implementation Slice

Extend the dry-run planner toward launchers:

- input: `installer/modules.json`
- command: `python scripts/plan-installer.py --profile clerk-core --dry-run`
- output: ordered actions, dependency graph, platform prerequisites, ports, and
  proof checklist
- mutation: none

The planner now covers the starter profiles and the full 26-repo suite profile.
The first platform launchers exist as dry-run wrappers only:

- `installer/windows/plan-installer.ps1 -Profile clerk-core`
- `installer/windows/plan-installer.ps1 -ShowMenu -MenuStyle guided`
- `installer/windows/plan-installer.ps1 -ShowReadiness -ReadinessScenario missing-docker`
- `installer/windows/plan-installer.ps1 -ShowReadiness -DetectHost`
- `installer/windows/plan-installer.ps1 -Execute`
- `installer/windows/plan-installer.ps1 -ShowExecutorDesign`
- `installer/windows/plan-installer.ps1 -ShowEvidenceSchema`
- `bash installer/macos/plan-installer.sh --profile clerk-core`
- `bash installer/macos/plan-installer.sh --show-menu --menu-style guided`
- `bash installer/macos/plan-installer.sh --show-readiness --readiness-scenario missing-docker`
- `bash installer/macos/plan-installer.sh --show-readiness --detect-host`
- `bash installer/macos/plan-installer.sh --execute`
- `bash installer/macos/plan-installer.sh --show-executor-design`
- `bash installer/macos/plan-installer.sh --show-evidence-schema`
- `bash installer/linux/plan-installer.sh --profile clerk-core`
- `bash installer/linux/plan-installer.sh --show-menu --menu-style guided`
- `bash installer/linux/plan-installer.sh --show-readiness --readiness-scenario missing-docker`
- `bash installer/linux/plan-installer.sh --show-readiness --detect-host`
- `bash installer/linux/plan-installer.sh --execute`
- `bash installer/linux/plan-installer.sh --show-executor-design`
- `bash installer/linux/plan-installer.sh --show-evidence-schema`

Only after these dry-run launchers remain verified should the workflow add real
install, repair, or packaging behavior.

The first dry-run planner command is:

```powershell
python scripts\plan-installer.py --profile clerk-core --dry-run
```
