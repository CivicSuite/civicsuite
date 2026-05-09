# CivicSuite Installer Package - macos

Profile: `clerk-core`
Menu style: `guided`

This package is the operator-facing installer entrypoint for the selected
platform. It does not install privileged baseline software by itself. It checks
readiness, renders the selected install plan, and can run the current cleanroom
gate for profiles that have a gate.

## First Run

1. Run readiness:

   ```text
   bash ./start-civicsuite-installer.sh readiness
   ```

2. Review the dry-run plan:

   ```text
   bash ./start-civicsuite-installer.sh plan
   ```

3. Run the cleanroom gate when Docker mutation is approved:

   ```text
   bash ./start-civicsuite-installer.sh gate
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
