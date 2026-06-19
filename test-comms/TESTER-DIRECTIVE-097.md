# TESTER-DIRECTIVE-097

## Channel Rules

All builder/tester communication for this run is only through the `CivicSuite/civicsuite` repo `test-comms` folder on branch `stage-3a-baremetal-windows`.

Before declaring a directive or result absent, Codex must inspect the live remote branch with `git ls-remote`, fetch it, and inspect `FETCH_HEAD`. Do not rely only on a local tracking ref.

Write exactly this result file when done:

`test-comms/TESTER-RESULT-097.md`

No old bridge folder, OneDrive folder, cloud-sync folder, or local-only side channel is valid for this run.

## Artifact Under Test

Test the installed Windows desktop app from PR #192 head:

`4e3686da5bbdac81b34758eeb85aa6cc279f3156`

Public prerelease:

https://github.com/CivicSuite/civicsuite/releases/tag/windows-local-msi-ci-4e3686d

Workflow run:

`27796012291`

GitHub artifact ZIP:

- Name: `civicsuite-windows-local-msi`
- Bytes: `1640365797`
- SHA-256: `b91045185aedbf2fcaf591a32a9fc6f505d19353bb63387517fe97e44f2e7059`

MSI:

- File: `CivicSuite_0.1.0_x64_en-US.msi`
- Bytes: `1645155136`
- SHA-256: `c9917193540b4581ab15e33332cebc7a661eee230da9fcf1f3e267b3ec63b880`

Evidence asset:

- File: `CivicSuite-msi-evidence.txt`
- Bytes: `548`
- SHA-256: `e15c7ca266f9e3d27dbcb201b838bdd970e659aa0f43d3e3ac36623b2988100e`

Use elevated/admin access as needed for Windows Installer, per-machine install/uninstall/reinstall, repair, major-upgrade removal, disk cleanup through product or Windows Installer lifecycle, and any other Windows admin lifecycle operation. Record when elevation was used.

## Cleanroom Start Required

Start from a true cleanroom state before installing this artifact.

Preferred cleanroom path:

- Revert the tester VM to a known-clean snapshot taken before CivicSuite was installed or tested.

Bare-metal fallback if a VM snapshot is not available:

- Remove all CivicSuite-installed products through elevated Windows Installer lifecycle controls.
- Stop and remove CivicSuite services and managed CivicSuite runtime processes.
- Remove the CivicSuite Program Files payload.
- Remove the test user's CivicSuite runtime/profile/cache/config/data folders.
- Remove stale CivicSuite MSI registrations/product codes if Windows Installer still reports them.
- Remove prior CivicSuite test artifacts, downloaded MSIs, support bundles, and backup artifacts used only for previous runs.
- Do not reboot the tester machine. It is unattended and must remain available for the Codex tester session.
- Before installing this artifact, verify no CivicSuite processes or services remain running and no CivicSuite product remains registered with Windows Installer.

Do not delete unrelated installed software, unrelated user data, unrelated system components, or unrelated developer tooling.

Record which cleanroom path was used and the evidence that the machine was clean before install.

## Why This Retest Exists

`TESTER-RESULT-096.md` proved normal desktop close plus elevated MSI uninstall/reinstall no longer returned `1603`, and Backup Now, support bundle, and model readiness passed. It still failed because product Start/Check/Repair could not recover Local data store or City workflow services, and Restore Latest Backup failed moving live `Data` with `Access is denied`.

A follow-up runtime dependency report, `POSTGRES-ZLIB1-RUNTIME-TEST-REPORT.md`, found that the installed user runtime had `runtime/postgres/bin/postgres.exe` but was missing `runtime/postgres/bin/zlib1.dll`, while the MSI payload contained `zlib1.dll`. That missing DLL explains the local PostgreSQL and dependent city workflow failures.

The new build fixes this by:

- making `runtime/postgres/bin/zlib1.dll` a required PostgreSQL runtime payload file;
- regenerating runtime payload lock metadata;
- adding regressions proving install/repair copies `zlib1.dll` into stale local PostgreSQL runtimes;
- preserving the prior restore/model-cache and runtime repair fixes;
- fixing the Linux cleanroom CivicClerk Alpine rolldown binding install so CI is green for this artifact.

Local builder proof for this head included full Rust tests, targeted runtime payload repair regressions, browser workflow/model tests, desktop build, docs/profile/stage checks, installer plan checks, and a copied real-payload repair proof.

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
12. Close the desktop app normally, then use elevated Windows Installer uninstall/reinstall of the same target MSI. Uninstall must not return `1603`.
13. Launch the reinstalled desktop app and run Restore Latest Backup from System Health product controls.
14. Restore must return a bounded product result instead of staying in `Working` or failing with `Access is denied`:
    - Acceptable statuses include `Restore needs service start` or `Restore complete`.
    - Record any old-folder cleanup pending message.
    - Record any model-cache preservation or pre-restore `Data/models` skipped-file evidence.
15. After restore, use only product Start/Check/Repair controls to recover Local data store, City workflow services, Task queue schema, and Background work queue health. Do not hand-kill processes or edit the profile during restore recovery.
16. Verify restored Clerk/Records/Code evidence is visible after restore if restore completed enough to permit product navigation.

## Result Format

`TESTER-RESULT-097.md` must include:

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
- Normal app close and MSI uninstall/reinstall result, including whether uninstall avoided `1603`.
- Restore result text and whether it left `Working` or hit `Access is denied`.
- Post-restore service health and product Start/Check/Repair results.
- Restored Clerk/Records/Code visibility evidence.
- Any old-folder cleanup pending, model-cache preservation, pre-restore model-cache skip, or Postgres/runtime log details.
- Smallest reproducible failure sequence if FAIL.
