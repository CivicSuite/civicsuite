# CivicSuite Installer Package - windows

Profile: `clerk-core`
Menu style: `guided`

This package is the operator-facing installer entrypoint for the selected
platform. It does not install privileged baseline software by itself. It checks
readiness, renders the selected install plan, and can run the current cleanroom
gate for profiles that have a gate.

## First Run

1. Run readiness:

   ```text
   .\start-civicsuite-installer.ps1 -Readiness
   ```

2. Review the dry-run plan:

   ```text
   .\start-civicsuite-installer.ps1 -Plan
   ```

3. Run the lifecycle command you need:

   ```text
   .\start-civicsuite-installer.ps1 -Plan
   ```

   Available lifecycle modes: readiness, plan, install, verify, repair,
   uninstall, and gate. Install, repair, and uninstall are still guarded by the
   planner until the mutating executor is implemented.

4. Run the cleanroom gate when Docker mutation is approved:

   ```text
   .\start-civicsuite-installer.ps1 -Gate
   ```

## Selected Modules

- civiccore
- civicrecords-ai
- civicclerk

## Boundary

- Readiness and plan modes are non-mutating.
- Gate mode is mutating: it may build/start/teardown Docker resources and write
  installer evidence under `installer/reports`.
- Native host installers are not packaged in this slice.
