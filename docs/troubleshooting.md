# CivicSuite Troubleshooting

**Last verified:** 2026-06-19

This guide covers the umbrella city-core installer and documentation truth path. Module-specific bugs still belong in the relevant module repo.

## City-Core Installer Will Not Start

1. Confirm Docker is installed and running.
2. On Windows, confirm WSL 2 and Virtual Machine Platform are enabled, then start Docker Desktop.
3. On Linux, use Guided Setup only on supported distributions; it installs Docker Engine from Docker's signed package repositories. If Guided Setup says the host is unsupported, install Docker manually from Docker's official instructions and rerun with Manual Prerequisite.
4. Rerun the package readiness command before install:
   - Windows: `.\start-civicsuite-installer.ps1 -Readiness`
   - Linux: `bash ./start-civicsuite-installer.sh readiness`

If readiness still fails, keep the generated report and compare it with the active run evidence path in [STATUS.md](../STATUS.md).

## Suite Launcher Shows No Module Activity

The suite launcher is a local browser front door for the installed city-core services. It can show staff, resident, and IT-admin views, but its current shared session is browser/runtime state only.

1. Run the installer verify command.
2. Confirm Docker containers are running.
3. Refresh the launcher.
4. If module links are wrong, check whether `window.CIVICSUITE_LAUNCHER_CONFIG` was provided by the runtime wrapper.

This is not a municipal SSO proof. Do not treat launcher session state as completed shared identity federation.

## Artifact Hash Or Attestation Does Not Match

Use the live trust path:

1. Verify the generated `SHA256SUMS` or release manifest that belongs to the package you are running.
2. Confirm the package came from the official CivicSuite source or the recorded active run evidence path.
3. Confirm `installer/modules.json` `source_commit` values match the vendored source commits for CivicCore, CivicRecords AI, CivicClerk, CivicCode, and CivicNotice.
4. For CivicCode module release assets, compare the published SHA256 and attestation bundle recorded in module release evidence.

Do not restore old committed `installer/dist` artifacts unless Scott explicitly confirms that restoration decision in bridge/for-scott or a durable run note.

## The One-Click Wrapper Says The Package Is Unsigned

That warning is expected for the current city-core beta package. Continue only after the hash/trust checks above pass. If an OS warning blocks execution, ask IT to review the package source and hash before allowing it.

## CivicAccess Appears In A City-Core Path

CivicAccess is out of city-core after the 2026-05-23 NEEDS-WORK depth probe. If a doc, launcher label, installer plan, or status surface frames CivicAccess as part of the current city-core path, treat it as drift and file it against the umbrella repo truth docs.

## Where To Check Current Truth

- Plain-English status: [../STATUS.md](../STATUS.md)
- Operator FAQ: [../FAQ.md](../FAQ.md)
- User manual: [../USER-MANUAL.md](../USER-MANUAL.md)
- Recovery status: [release-recovery-status.md](release-recovery-status.md)
- Downstream pins and source commits: [release-lockstep/downstream-pins.md](release-lockstep/downstream-pins.md)
