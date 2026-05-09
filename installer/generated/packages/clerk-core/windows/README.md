# CivicSuite Installer Package - windows

Profile: `clerk-core`
Menu style: `guided`

## Unsigned OSS Beta Notice

This package is unsigned. CivicSuite is an open-source beta project and signing
certificates are not available yet. Windows may show SmartScreen or Unknown
Publisher warnings. macOS may show unidentified developer warnings. Linux
package tools may show an unsigned/local package warning.

This is expected for this beta distribution. Verify the SHA256 checksum from
`installer/dist` before running the package. If the checksum does not match,
stop and download the artifact again from the project release source.

## Platform Warning Guidance

- Windows: choose More info, confirm the app name/path, then choose Run anyway
  only after the checksum matches.
- macOS: use System Settings > Privacy & Security to allow the package only
  after the checksum matches.
- Linux: install from the local archive/package only after verifying the
  checksum file.

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
- Native host installer wrappers are generated but unsigned in this OSS beta.
