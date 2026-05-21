# CivicSuite Installer Package - linux

Profile: `clerk-core`
Menu style: `guided`

## Unsigned OSS Beta Notice

This package is unsigned. CivicSuite is an open-source public-use starter release and signing
certificates are not used for the public installer path. Windows may show
SmartScreen or Unknown Publisher warnings. macOS may show unidentified
developer warnings. Linux package tools may show an unsigned/local package
warning.

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

This package is the operator-facing installer entrypoint for the selected
platform. It does not install privileged baseline software by itself. It checks
readiness, renders the selected install plan, installs the clerk-core runtime
from the bundled module sources, verifies live service health, repairs by
rebuilding/restarting the stack, and uninstalls Docker resources for the
profile.

## First Run

1. Run readiness:

   ```text
   bash ./start-civicsuite-installer.sh readiness
   ```

2. Review the dry-run plan:

   ```text
   bash ./start-civicsuite-installer.sh plan
   ```

3. Install the selected profile:

   ```text
   bash ./start-civicsuite-installer.sh install
   ```

   Available lifecycle modes: readiness, plan, install, verify, repair,
   backup, restore, and uninstall. Install, repair, backup, restore, and
   uninstall are mutating: they create or remove Docker resources and write
   installer reports.

## Selected Modules

- civiccore
- civicrecords-ai
- civicclerk

The default package selection installs both CivicRecords AI and CivicClerk on
top of the CivicCore base contract. Operators can choose one module or both:

```text
bash ./start-civicsuite-installer.sh plan --module civicrecords-ai
bash ./start-civicsuite-installer.sh plan --module civicclerk
bash ./start-civicsuite-installer.sh install --module civicrecords-ai --module civicclerk
```

When a module is selected explicitly, plan/readiness use the same selection
and install/verify/repair/backup/restore/uninstall pass it through to the
lifecycle runner.

For a mutating workflow proof, use bearer staff mode so CivicClerk writes are
protected while the proof creates real starter-set test records:

```text
bash ./start-civicsuite-installer.sh install --staff-mode bearer --workflow-proof
```

## Boundary

- Readiness and plan modes are non-mutating.
- Install/repair mode is mutating: it builds and starts the selected modules
  from the bundled source tree.
- Verify mode checks live service endpoints. `--workflow-proof` /
  `-WorkflowProof` also creates live CivicRecords AI request/search/review/
  response proof records and CivicClerk agenda/packet/minutes/vote/notice/
  archive proof records.
- Backup mode writes per-module PostgreSQL custom dumps plus a manifest under
  the installer runtime backup directory.
- Restore mode verifies the latest backup by restoring each dump into a
  temporary PostgreSQL restore-probe database and removing that probe after the
  check completes.
- Uninstall mode removes the selected module Docker containers and volumes.
- Native host installer wrappers are generated but unsigned in this OSS public-use starter release.

The repo/source checkout cleanroom gate remains available outside this
distributable archive:

```text
python scripts/plan-installer.py --profile clerk-core --run-cleanroom-gate
```

That source gate uses repo-local Playwright dependencies and is not packaged
inside the distributable archive.
