# TESTER-DIRECTIVE-096

## Channel Rules

All builder/tester communication for this run is only through the `CivicSuite/civicsuite` repo `test-comms` folder on branch `stage-3a-baremetal-windows`.

Before declaring a directive or result absent, Codex must inspect the live remote branch with `git ls-remote`, fetch it, and inspect `FETCH_HEAD`. Do not rely only on a local tracking ref.

Write exactly this result file when done:

`test-comms/TESTER-RESULT-096.md`

No old bridge folder, OneDrive folder, cloud-sync folder, or local-only side channel is valid for this run.

## Artifact Under Test

Test the installed Windows desktop app from PR #192 head:

`ae0cfb2c1c7ae88097df8f81e6cd236738b006d1`

Public prerelease:

https://github.com/CivicSuite/civicsuite/releases/tag/windows-local-msi-ci-ae0cfb2

Workflow run:

`27778048322`

MSI:

- File: `CivicSuite_0.1.0_x64_en-US.msi`
- Bytes: `1645196096`
- SHA-256: `4b290b77c2f8da5ca9e44ad3af6ab69abc3b620e5421a62b255a48e37e2c0b37`

Evidence asset:

- File: `CivicSuite-msi-evidence.txt`
- Bytes: `548`
- SHA-256: `8434b0135596c63d0639b40a754d09eb790fac42c2b8339d4b3cea4e7562afb4`

Use elevated/admin access as needed for Windows Installer, per-machine install/uninstall/reinstall, repair, major-upgrade removal, disk cleanup through product or Windows Installer lifecycle, and any other Windows admin lifecycle operation. Record when elevation was used.

## Why This Retest Exists

`TESTER-RESULT-095.md` failed after fresh Clerk, Records, Code, backup, support bundle, model readiness, app identity, and artifact integrity passed:

- Product Start/Check/Repair could not recover local PostgreSQL.
- MSI uninstall returned `1603` after normal desktop app close.
- Restore Latest Backup failed moving the live `Data` directory with `Access is denied`.

The new build fixes these failures by:

- making Repair recover incomplete `Data/postgres` initialization;
- expanding Start/Repair to include required runtime dependencies;
- running Postgres tools from their bundled `bin` directory;
- stopping managed runtime services on normal desktop window close to reduce locked-file MSI uninstall and restore failures.

Local builder proof for this head included supervisor tests, full Tauri tests, desktop smoke/browser/build checks, and an opt-in copied real payload repair proof that recovered a partial Postgres initialization from the prepared runtime payload.

## Required Test Surface

Use only the installed desktop app:

`C:\Program Files\CivicSuite\civicsuite-desktop.exe`

Do not perform workflow checks through module browser URLs, suite-launcher tabs, localhost module pages, or developer preview routes.

## Required Checks

1. Verify artifact integrity against the MSI and evidence hashes above.
2. Install the MSI through the elevated/admin Windows Installer path. If a prior install or low disk blocks install, use elevated Windows Installer lifecycle operations to remove the old product and retry.
3. Launch the installed desktop app and record the app/window identity.
4. Verify model readiness from the installed desktop System Health surface. If model-cache skips appear in backup manifests because disk is low, record them; do not fail solely because model cache was intentionally skipped or preserved.
5. Before restore, run product Start/Check/Repair controls for Local data store, City workflow services, Task queue schema, and Background work queue. These must recover through product controls without hand-killing processes or editing the profile.
6. Run Backup Now and verify it leaves `Working`, returns `Backup complete`, and creates a fresh backup root with `backup-manifest.json` and root `README.txt`.
7. Run a full fresh Clerk adopted-legislation workflow with a fresh marker:
   - Create or select the fresh meeting body/member/meeting/agenda evidence.
   - Save a minutes draft containing a sentence with the fresh marker.
   - Add at least one minute citation whose cited sentence appears exactly in the minutes draft.
   - Record a motion with disposition `passed`.
   - Adopt Minutes.
   - Sign Minutes with signer and attestation evidence.
   - Record Adopted Ordinance/Resolution with title/text containing the fresh marker.
   - Archive Public Record.
   - Close/reopen the desktop app and verify fresh adopted-legislation evidence appears on the fresh meeting.
8. Run fresh Records durability evidence with a typed unreadable reference and verify it survives close/reopen.
9. Run fresh Code source/handoff/guidance evidence and verify the fresh source, handoff, and guidance all attach to the fresh marker record and survive close/reopen.
10. Run Create Support Bundle and verify it leaves `Working`, returns `Support bundle ready`, and creates a fresh support manifest.
11. Close the desktop app normally, then use elevated Windows Installer uninstall/reinstall of the same target MSI. Uninstall must not return `1603`.
12. Launch the reinstalled desktop app and run Restore Latest Backup from System Health product controls.
13. Restore must return a bounded product result instead of staying in `Working` or failing with `Access is denied`:
    - Acceptable statuses include `Restore needs service start` or `Restore complete`.
    - Record any old-folder cleanup pending message.
    - Record any model-cache preservation or pre-restore `Data/models` skipped-file evidence.
14. After restore, use only product Start/Check/Repair controls to recover Local data store, City workflow services, Task queue schema, and Background work queue health. Do not hand-kill processes or edit the profile during restore recovery.
15. Verify restored Clerk/Records/Code evidence is visible after restore if restore completed enough to permit product navigation.

## Result Format

`TESTER-RESULT-096.md` must include:

- Verdict: PASS or FAIL.
- Remote/directive verification with live branch and `FETCH_HEAD`.
- Artifact integrity hashes and bytes.
- Elevation/install/uninstall/reinstall evidence.
- Installed desktop app identity evidence.
- Model readiness evidence.
- Product Start/Check/Repair service-health evidence before restore.
- Backup Now result and manifest/README evidence.
- Clerk adopted-legislation evidence, including the fresh meeting selection, minute citation, and passed motion prerequisite evidence.
- Records durability evidence.
- Code durability evidence proving fresh source/handoff/guidance selection.
- Support bundle evidence.
- Normal app close and MSI uninstall/reinstall result, including whether uninstall avoided `1603`.
- Restore result text and whether it left `Working` or hit `Access is denied`.
- Post-restore service health and product Start/Check/Repair results.
- Restored Clerk/Records/Code visibility evidence.
- Any old-folder cleanup pending, model-cache preservation, pre-restore model-cache skip, or Postgres/runtime log details.
- Smallest reproducible failure sequence if FAIL.
