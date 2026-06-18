# TESTER-DIRECTIVE-095

## Channel Rules

All builder/tester communication for this run is only through the `CivicSuite/civicsuite` repo `test-comms` folder on branch `stage-3a-baremetal-windows`.

Before declaring a directive or result absent, Codex must inspect the live remote branch with `git ls-remote`, fetch it, and inspect `FETCH_HEAD`. Do not rely only on a local tracking ref.

Write exactly this result file when done:

`test-comms/TESTER-RESULT-095.md`

No old bridge folder, OneDrive folder, cloud-sync folder, or local-only side channel is valid for this run.

## Artifact Under Test

Test the installed Windows desktop app from PR #192 head:

`17080a10a1680be8945243a4cf59325fc44d5586`

Public prerelease:

https://github.com/CivicSuite/civicsuite/releases/tag/windows-local-msi-ci-17080a1

Workflow run:

`27767117671`

MSI:

- File: `CivicSuite_0.1.0_x64_en-US.msi`
- Bytes: `1645151040`
- SHA-256: `845aa9dcb703dd9600f0ca1ab918426fde2672a5c19c0f9892357a99da66204c`

Evidence asset:

- File: `CivicSuite-msi-evidence.txt`
- Bytes: `548`
- SHA-256: `48a9b842462b61035688f51517b0c92e16fc35b283dce265b256493614d16b3a`

Use elevated/admin access as needed for Windows Installer, per-machine install/uninstall/reinstall, repair, major-upgrade removal, disk cleanup through product or Windows Installer lifecycle, and any other Windows admin lifecycle operation. Record when elevation was used.

## Why This Retest Exists

`TESTER-RESULT-094.md` failed after clearing the old elevation and model-cache gates:

- Elevated install, uninstall, reinstall, Backup Now, support bundle, Records durability, artifact integrity, and model readiness passed.
- Product Start/Repair left Local data store, City workflow services, Task queue schema, and Background work queue degraded before restore.
- Fresh Clerk adopted-legislation actions did not apply to the fresh DIR094 meeting even though older meetings still had valid evidence.
- Fresh Code guidance attached to an older selected source instead of a fresh DIR094 source.
- Restore Latest Backup still stayed in desktop `Working` instead of returning a bounded product result.

The new build fixes these failures by:

- avoiding inherited stdout/stderr pipe hangs for native runtime commands;
- starting Postgres through a bounded status wait with null stdio, then verifying database and migration readiness;
- making Windows executable PID lookup pass the target path through an environment variable with a bounded query, so embedded `python.exe` is never accidentally launched during PID discovery;
- recording the settled long-lived runtime PID after Python/service launcher handoff;
- forcing the packaged migration CLI process to exit after successful migration work;
- selecting newly added Clerk/Records/Code workflow records by comparing pre-action and post-action state instead of relying on freshness ordering when restored records have newer-looking IDs.

Local builder proof for this head included a real packaged-runtime test that started the prepared Windows payload Postgres, ran migrations, started city workflow services, and verified task queue health locally before publishing this artifact.

## Required Test Surface

Use only the installed desktop app:

`C:\Program Files\CivicSuite\civicsuite-desktop.exe`

Do not perform workflow checks through module browser URLs, suite-launcher tabs, localhost module pages, or developer preview routes.

## Required Checks

1. Verify artifact integrity against the MSI and evidence hashes above.
2. Install the MSI through the elevated/admin Windows Installer path. If a prior install or low disk blocks install, use elevated Windows Installer lifecycle operations to remove the old product and retry.
3. Launch the installed desktop app and record the app/window identity.
4. Verify model readiness from the installed desktop System Health surface. If model-cache skips appear in backup manifests because disk is low, record them; do not fail solely because model cache was intentionally skipped or preserved.
5. Run product Start/Check/Repair controls for Local data store, City workflow services, Task queue schema, and Background work queue. These should recover through product controls without hand-killing processes or editing the profile. If any service remains degraded, capture the bounded product result and any log excerpt shown by the app.
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
   - Close/reopen the desktop app and verify fresh adopted-legislation evidence appears on the fresh meeting, not only older DIR091/DIR094 records.
8. Run fresh Records durability evidence with a typed unreadable reference and verify it survives close/reopen.
9. Run fresh Code source/handoff/guidance evidence and verify the fresh source, handoff, and guidance all attach to the fresh marker record and survive close/reopen.
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

`TESTER-RESULT-095.md` must include:

- Verdict: PASS or FAIL.
- Remote/directive verification with live branch and `FETCH_HEAD`.
- Artifact integrity hashes and bytes.
- Elevation/install/uninstall/reinstall evidence.
- Installed desktop app identity evidence.
- Product Start/Check/Repair service-health evidence before restore.
- Backup Now result and manifest/README evidence.
- Clerk adopted-legislation evidence, including the fresh meeting selection, minute citation, and passed motion prerequisite evidence.
- Records durability evidence.
- Code durability evidence proving fresh source/handoff/guidance selection.
- Support bundle evidence.
- Restore result text and whether it left `Working`.
- Post-restore service health and product Start/Check/Repair results.
- Any old-folder cleanup pending, model-cache preservation, pre-restore model-cache skip, or Postgres/runtime log details.
- Smallest reproducible failure sequence if FAIL.
