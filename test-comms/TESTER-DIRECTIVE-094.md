# TESTER-DIRECTIVE-094

## Channel Rules

All builder/tester communication for this run is only through the `CivicSuite/civicsuite` repo `test-comms` folder on branch `stage-3a-baremetal-windows`.

Before declaring a directive or result absent, Codex must inspect the live remote branch with `git ls-remote`, fetch it, and inspect `FETCH_HEAD`. Do not rely only on a local tracking ref.

Write exactly this result file when done:

`test-comms/TESTER-RESULT-094.md`

No old bridge folder, OneDrive folder, cloud-sync folder, or local-only side channel is valid for this run.

## Artifact Under Test

Test the installed Windows desktop app from PR #192 head:

`76a579504cc9fa1b11030be080fd6e0ae9d9f2c7`

Public prerelease:

https://github.com/CivicSuite/civicsuite/releases/tag/windows-local-msi-ci-76a5795

Workflow run:

`27754369014`

MSI:

- File: `CivicSuite_0.1.0_x64_en-US.msi`
- Bytes: `1645126464`
- SHA-256: `1069c45b1274d485fab9c731d9c9e3fa626a60b0b45093f689e60acab3c7dd9a`

Evidence asset:

- File: `CivicSuite-msi-evidence.txt`
- Bytes: `548`
- SHA-256: `73dc9da00b5bd672f8dee4042016dc38522e8274dac2266308ee13264fb6950a`

Use elevated/admin access as needed for Windows Installer, per-machine install/uninstall/reinstall, repair, major-upgrade removal, disk cleanup through product or Windows Installer lifecycle, and any other Windows admin lifecycle operation. Record when elevation was used.

## Why This Retest Exists

`TESTER-RESULT-093.md` improved the state but still failed:

- Backup Now returned `Backup complete`.
- Create Support Bundle returned `Support bundle ready`.
- Records and Code durability survived close/reopen.
- Repair returned a bounded result.
- The desktop window stayed responsive.
- Restore Latest Backup still stayed in desktop `Working` instead of returning a bounded product result.
- Local data store / city workflow services / task queue health remained degraded, with Local data store start reporting `exit code: 1`.
- Fresh adopted-legislation evidence was incomplete because the visible flow did not complete all Clerk adoption prerequisites.

The new build fixes restore/service recovery by:

- Skipping `Data/models` during pre-restore safety backup and recording the skip in the backup manifest.
- Preserving the current installed model cache across the restored Data swap.
- Keeping restore bounded with `Restore needs service start` or `Restore complete` instead of trying to copy model blobs or leaving the panel in `Working`.
- Clearing stale Postgres `postmaster.pid` before Local data store start when no local data-store listener is present and the recorded PID is not running.
- Including recent Postgres log text when Local data store start still fails.

## Required Test Surface

Use only the installed desktop app:

`C:\Program Files\CivicSuite\civicsuite-desktop.exe`

Do not perform workflow checks through module browser URLs, suite-launcher tabs, localhost module pages, or developer preview routes.

## Required Checks

1. Verify artifact integrity against the MSI and evidence hashes above.
2. Install the MSI through the elevated/admin Windows Installer path. If a prior install or low disk blocks install, use elevated Windows Installer lifecycle operations to remove the old product and retry.
3. Launch the installed desktop app and record the app/window identity.
4. Verify model readiness from the installed desktop System Health surface. If model-cache skips appear in backup manifests because disk is low, record them; do not fail solely because model cache was intentionally skipped or preserved.
5. Run product Start/Check/Repair controls for Local data store, City workflow services, Task queue schema, and Background work queue. If any service remains degraded, capture the bounded product result and any log excerpt shown by the app.
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
   - Close/reopen the desktop app and verify fresh adopted-legislation evidence appears, not only older DIR088/DIR086 records.
8. Run fresh Records durability evidence with a typed unreadable reference and verify it survives close/reopen.
9. Run fresh Code source/handoff/guidance evidence and verify it survives close/reopen.
10. Run Create Support Bundle and verify it leaves `Working`, returns `Support bundle ready`, and creates a fresh support manifest.
11. Use elevated Windows Installer uninstall/reinstall of the same target MSI.
12. Launch the reinstalled desktop app and run Restore Latest Backup from System Health product controls.
13. Restore must return a bounded product result instead of staying in `Working`:
    - Acceptable statuses include `Restore needs service start` or `Restore complete`.
    - Record any old-folder cleanup pending message.
    - Record any model-cache preservation or pre-restore `Data/models` skipped-file evidence.
14. After restore, use only product Start/Check/Repair controls to recover Local data store, City workflow services, Task queue schema, and Background work queue health. Do not hand-kill processes or edit the profile during restore recovery.
15. Verify restored Clerk/Records/Code evidence is visible after restore if restore completed enough to permit product navigation.

## Result Format

`TESTER-RESULT-094.md` must include:

- Verdict: PASS or FAIL.
- Remote/directive verification with live branch and `FETCH_HEAD`.
- Artifact integrity hashes and bytes.
- Elevation/install/uninstall/reinstall evidence.
- Installed desktop app identity evidence.
- Backup Now result and manifest/README evidence.
- Clerk adopted-legislation evidence, including the minute citation and passed motion prerequisite evidence.
- Records durability evidence.
- Code durability evidence.
- Support bundle evidence.
- Restore result text and whether it left `Working`.
- Post-restore service health and product Start/Check/Repair results.
- Any old-folder cleanup pending, model-cache preservation, pre-restore model-cache skip, or Postgres log details.
- Smallest reproducible failure sequence if FAIL.
