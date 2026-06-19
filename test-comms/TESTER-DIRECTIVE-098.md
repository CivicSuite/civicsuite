# TESTER-DIRECTIVE-098

## Channel Rules

All builder/tester communication for this run is only through the `CivicSuite/civicsuite` repo `test-comms` folder on branch `stage-3a-baremetal-windows`.

Before declaring a directive or result absent, Codex must inspect the live remote branch with `git ls-remote`, fetch it, and inspect `FETCH_HEAD`. Do not rely only on a local tracking ref.

Write exactly this result file when done:

`test-comms/TESTER-RESULT-098.md`

No old bridge folder, OneDrive folder, cloud-sync folder, or local-only side channel is valid for this run.

## Artifact Under Test

Test the installed Windows desktop app from PR #192 head:

`a198430f09fc9712c5fa517b2a4555f144d86fda`

Public prerelease:

https://github.com/CivicSuite/civicsuite/releases/tag/windows-local-msi-ci-a198430

Workflow run:

`27807590449`

GitHub artifact ZIP:

- Name: `civicsuite-windows-local-msi`
- Bytes: `1640356333`
- SHA-256: `2997da46b1c05a088eec8a4d94552c0027108c7cd68948f3ad6560991cf8e567`

MSI:

- File: `CivicSuite_0.1.0_x64_en-US.msi`
- Bytes: `1645167424`
- SHA-256: `1377413f9dbad5d44cdf3a6079cd6af9822e753ae0218f28befa35a433aff4da`

Evidence asset:

- File: `CivicSuite-msi-evidence.txt`
- Bytes: `548`
- SHA-256: `ec790ac5a259cb7603c529a6559a5b7bb39f6b9e71db0d4a3d1b083f33332cb8`

Use elevated/admin access as needed for Windows Installer, per-machine install/uninstall/reinstall, repair, major-upgrade removal, disk cleanup through product or Windows Installer lifecycle, and any other Windows admin lifecycle operation. Record when elevation was used.

## Cleanroom Start Required

Start from a clean CivicSuite test state before installing this artifact.

Preferred cleanroom path:

- Revert the tester VM to a known-clean snapshot taken before CivicSuite was installed or tested.

Bare-metal fallback if a VM snapshot is not available:

- Remove all CivicSuite-installed products through elevated Windows Installer lifecycle controls.
- Stop and remove CivicSuite services and managed CivicSuite runtime processes.
- Remove the CivicSuite Program Files payload.
- Remove the test user's CivicSuite runtime/profile/cache/config/data folders.
- Remove stale CivicSuite MSI registrations/product codes if Windows Installer still reports them.
- Remove prior CivicSuite test artifacts, downloaded MSIs, support bundles, and backup artifacts used only for previous runs unless specifically needed for the stale pre-restore backup check below.
- Do not reboot the tester machine. It is unattended and must remain available for the Codex tester session.
- Before installing this artifact, verify no CivicSuite processes or services remain running and no CivicSuite product remains registered with Windows Installer.

Do not delete unrelated installed software, unrelated user data, unrelated system components, or unrelated developer tooling.

Record which cleanroom path was used and the evidence that the machine was clean before install.

## Why This Retest Exists

`TESTER-RESULT-097.md` passed the zlib runtime-copy path and recovered the major service lifecycle issues:

- product Start/Check/Repair recovered Local data store, City workflow services, Task queue schema, and Background work queue before restore;
- `runtime\postgres\bin\zlib1.dll` was present in the installed user runtime;
- Backup Now, support bundle, Clerk adopted legislation, Records durability, Code durability, normal app close, and elevated MSI uninstall/reinstall without `1603` passed.

It still failed because Restore Latest Backup returned without staying in `Working` or hitting `Access is denied`, but the fresh `DIR097` marker was absent from Clerk, Records, and Code after restore.

The builder fix in this artifact changes Restore Latest Backup selection:

- each candidate backup manifest is read;
- restorable backups are ordered by `created_unix_seconds`;
- internal `pre-restore` safety backups are excluded from user-facing Restore Latest Backup selection.

This prevents an older `civicsuite-pre-restore-backup-*` folder from winning over a fresher `civicsuite-manual-backup-*` folder only because the folder name sorts later.

## Required Test Surface

Use only the installed desktop app:

`C:\Program Files\CivicSuite\civicsuite-desktop.exe`

Do not perform workflow checks through module browser URLs, suite-launcher tabs, localhost module pages, or developer preview routes.

## Required Checks

1. Verify artifact integrity against the ZIP, MSI, and evidence hashes above.
2. Complete the cleanroom start requirement, then install the MSI through the elevated/admin Windows Installer path.
3. Launch the installed desktop app and record the app/window identity.
4. Verify model readiness from the installed desktop System Health surface. If model-cache skips appear in backup manifests because disk is low, record them; do not fail solely because model cache was intentionally skipped or preserved.
5. Before restore, run product Start/Check/Repair controls for Local data store, City workflow services, Task queue schema, and Background work queue. These must recover through product controls without hand-killing processes or editing the profile.
6. Verify the installed user runtime contains `runtime\postgres\bin\zlib1.dll` after install and after any product Repair.
7. Run Backup Now and verify it leaves `Working`, returns `Backup complete`, and creates a fresh backup root with `backup-manifest.json` and root `README.txt`.
8. Run a full fresh Clerk adopted-legislation workflow with a fresh marker:
   - Create or select the fresh meeting body/member/meeting/agenda evidence.
   - Save a minutes draft containing a sentence with the fresh marker.
   - Add at least one minute citation whose cited sentence appears exactly in the minutes draft.
   - Record a motion with disposition `passed`.
   - Adopt Minutes.
   - Sign Minutes with signer and attestation evidence.
   - Record Adopted Ordinance/Resolution with title/text containing the fresh marker.
   - Archive Public Record.
   - Close/reopen the desktop app and verify fresh adopted-legislation evidence appears on the fresh meeting.
9. Run fresh Records durability evidence with a typed unreadable reference and verify it survives close/reopen.
10. Run fresh Code source/handoff/guidance evidence and verify the fresh source, handoff, and guidance all attach to the fresh marker record and survive close/reopen.
11. Run Create Support Bundle and verify it leaves `Working`, returns `Support bundle ready`, and creates a fresh support manifest.
12. Ensure at least one stale `civicsuite-pre-restore-backup-*` safety backup exists under the same backup root before restore. If no stale safety backup exists naturally, create one only through product Restore Latest Backup against older non-critical evidence before creating the final fresh marker backup, then proceed with the fresh marker backup. Do not hand-edit backup manifests or product profile data.
13. Close the desktop app normally, then use elevated Windows Installer uninstall/reinstall of the same target MSI. Uninstall must not return `1603`.
14. Launch the reinstalled desktop app and run Restore Latest Backup from System Health product controls.
15. Restore must select the fresh manual backup, not any stale `pre-restore` safety backup:
    - restore must return a bounded product result instead of staying in `Working` or failing with `Access is denied`;
    - the restore message or evidence should identify the fresh manual backup path when visible;
    - record any old-folder cleanup pending message;
    - record any model-cache preservation or pre-restore `Data/models` skipped-file evidence.
16. After restore, use only product Start/Check/Repair controls to recover Local data store, City workflow services, Task queue schema, and Background work queue health. Do not hand-kill processes or edit the profile during restore recovery.
17. Verify restored Clerk/Records/Code evidence for the fresh marker is visible after restore.

## Result Format

`TESTER-RESULT-098.md` must include:

- Verdict: PASS or FAIL.
- Remote/directive verification with live branch and `FETCH_HEAD`.
- Cleanroom start path and evidence.
- Artifact integrity hashes and bytes.
- Elevation/install/uninstall/reinstall evidence.
- Installed desktop app identity evidence.
- Model readiness evidence.
- Product Start/Check/Repair service-health evidence before restore.
- Installed user runtime evidence for `runtime\postgres\bin\zlib1.dll`.
- Backup Now result and manifest/README evidence.
- Clerk adopted-legislation evidence, including the fresh meeting selection, minute citation, and passed motion prerequisite evidence.
- Records durability evidence.
- Code durability evidence proving fresh source/handoff/guidance selection.
- Support bundle evidence.
- Stale `pre-restore` safety backup evidence before final Restore Latest Backup.
- Normal app close and MSI uninstall/reinstall result, including whether uninstall avoided `1603`.
- Restore result text and whether it left `Working` or hit `Access is denied`.
- Evidence that Restore Latest Backup selected the fresh manual backup rather than a stale `pre-restore` safety backup.
- Post-restore service health and product Start/Check/Repair results.
- Restored Clerk/Records/Code visibility evidence for the fresh marker.
- Any old-folder cleanup pending, model-cache preservation, pre-restore model-cache skip, or Postgres/runtime log details.
- Smallest reproducible failure sequence if FAIL.
