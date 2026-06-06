# CivicSuite Installer Package - windows

Profile: `city-core`
Menu style: `guided`

## Unsigned City-Core Beta Notice

This package is unsigned. CivicSuite city-core is an open-source beta installer package pending Linux and Windows matching-host lifecycle proof. Signing certificates are not used for this beta installer path. Windows may show SmartScreen or Unknown Publisher
warnings. macOS may show unidentified developer warnings. Linux package tools
may show an unsigned/local package warning.

This is expected for this beta distribution. Verify the SHA256 checksum from
`installer/dist` and confirm the artifact came from the official CivicSuite
GitHub release source or your IT team's verified source build before running
the package. If the checksum does not match, stop and download the artifact
again from the project release source.

## Platform Warning Guidance

- Windows: choose More info, confirm the app name/path, then choose Run anyway
  only after the checksum matches and the artifact source is verified.
- macOS: use System Settings > Privacy & Security to allow the package only
  after the checksum matches.
- Linux: install from the local archive/package only after verifying the
  checksum file.
- Docker Desktop or Docker Engine is running. If it is not running, the installer
  says how to start Docker before retrying.
- Required ports are free. If a port is occupied, rerun after closing the
  conflicting service or use the documented port-offset flags from the lifecycle
  runner.
- The host has at least 24 GB RAM and 25 GB free disk for the
  full city-core stack. The local AI response-letter model is
  `gemma4:e4b`, and Windows Docker Desktop / WSL2 must expose at least
  12 GB memory before install starts.
- Windows hosts need WSL2 and Docker Desktop. macOS hosts need Docker Desktop
  or a compatible Docker Engine and permission to run an unsigned local archive.

This package contains the legacy warm-first lifecycle controls for
readiness, plan, manual install, verify, repair, backup, restore, uninstall,
and suite-launcher serving. For the Windows city-core bare-metal customer path,
start from the Stage 3A progress wrapper described below; it installs Windows
prerequisites before handing off to the warm-first lifecycle.

## First Run

1. For the Windows bare-metal operator path, run the progress wrapper from the extracted bundle:

   ```text
   .\..\..\..\..\baremetal\windows\civicsuite-baremetal-progress.ps1
   ```

   The wrapper launches the self-elevating Stage 3A bootstrapper under
    `installer\baremetal\windows`, enables WSL2/Virtual Machine Platform,
    resumes after reboot, installs or starts Docker Desktop and Ollama, runs the
    warm-first city-core installer, verifies `generation_source=ollama` and
    `generation_model=gemma4:e4b`, and prints the local service URLs
    when Stage4 passes.

    City-core packages include the suite launcher runtime under
    `suite-launcher` and plan it for
    `http://127.0.0.1:18082/`. The installer runtime also
    creates `CIVICCORE_SUITE_SESSION_SECRET` on first install if it is missing, then shares
    that value with the selected staff services for the local session boundary.
    To serve the launcher after install or during QA, run:

    ```text
    .\start-civicsuite-installer.ps1 -SuiteLauncher
    ```

2. For IT/admin checks, run readiness:

   ```text
   .\start-civicsuite-installer.ps1 -Readiness
   ```

3. Review the dry-run plan:

   ```text
   .\start-civicsuite-installer.ps1 -Plan
   ```

4. Install the selected profile manually:

   ```text
   .\start-civicsuite-installer.ps1 -Install
   ```

   Available lifecycle modes: readiness, plan, install, verify, repair,
   backup, restore, and uninstall. Install, repair, backup, restore, and
   uninstall are mutating: they create or remove Docker resources and write
   installer reports.

## Selected Modules

- civiccore
- civicrecords-ai
- civicclerk
- civiccode

The default package selection installs this package profile on top of the
CivicCore base contract. Operators can choose one module or the whole profile:

```text
.\start-civicsuite-installer.ps1 -Plan -Module civicrecords-ai
.\start-civicsuite-installer.ps1 -Plan -Module civicclerk
.\start-civicsuite-installer.ps1 -Plan -Module civiccode
.\start-civicsuite-installer.ps1 -Install -Module civicrecords-ai -Module civicclerk -Module civiccode
```

When a module is selected explicitly, plan/readiness use the same selection
and install/verify/repair/backup/restore/uninstall pass it through to the
lifecycle runner.

For a mutating workflow proof, use bearer staff mode so CivicClerk writes are
protected while the proof creates real starter-set test records:

```text
.\start-civicsuite-installer.ps1 -Install -StaffMode bearer -WorkflowProof
```

## Boundary

- Readiness and plan modes are non-mutating.
- Install/repair mode is mutating: it builds and starts the selected modules
  from the bundled source tree.
- Verify mode checks live service endpoints. `--workflow-proof` /
  `-WorkflowProof` also creates live CivicRecords AI request/search/review/
  response proof records, CivicClerk agenda/packet/minutes/vote/notice/
  archive proof records, and CivicCode health/public lookup proof when
  CivicCode is selected.
- Backup mode writes per-module PostgreSQL custom dumps plus a manifest under
  the installer runtime backup directory.
- Restore mode verifies the latest backup by restoring each dump into a
  temporary PostgreSQL restore-probe database and removing that probe after the
  check completes.
- Uninstall mode removes the selected module Docker containers and volumes.
- Re-running install or repair over an existing install is expected to be
  idempotent: the installer keeps existing source trees and refreshes runtime
  configuration without deleting data. Use backup before any destructive reset.
- Rollback path: run backup, then uninstall; if you need a clean reset, remove
  the runtime directory only after confirming the backup manifest and dumps
  exist.
- Native host installer wrappers are generated but unsigned for this distribution.

The repo/source checkout cleanroom gate remains available outside this
distributable archive:

```text
python scripts/plan-installer.py --profile city-core --run-cleanroom-gate
```

That source gate uses repo-local Playwright dependencies and is not packaged
inside the distributable archive.
