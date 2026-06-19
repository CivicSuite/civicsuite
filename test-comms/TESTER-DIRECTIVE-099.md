# TESTER-DIRECTIVE-099

## Channel Rules

All builder/tester communication for this run is only through the `CivicSuite/civicsuite` repo `test-comms` folder on branch `stage-3a-baremetal-windows`.

Before declaring a directive or result absent, Codex must inspect the live remote branch with `git ls-remote`, fetch it, and inspect `FETCH_HEAD`. Do not rely only on a local tracking ref.

Write exactly this result file when done:

`test-comms/TESTER-RESULT-099.md`

No old bridge folder, OneDrive folder, cloud-sync folder, or local-only side channel is valid for this run.

## Artifact Under Test

Test the installed Windows desktop app from PR #192 head:

`07917b8bf60291566760c912313e347999217c57`

Public prerelease:

https://github.com/CivicSuite/civicsuite/releases/tag/windows-local-msi-ci-07917b8

Workflow run:

`27815664013`

GitHub artifact ZIP:

- Name: `civicsuite-windows-local-msi`
- Bytes: `1640371076`

MSI release asset:

- File: `CivicSuite_0.1.0_x64_en-US.msi`
- Bytes: `1645171548`
- SHA-256: `c9fa17fe5b0ce7332073389557d8c59ae75708f1fd643f1679fa7b0c0289ee14`
- GitHub release digest: `sha256:c9fa17fe5b0ce7332073389557d8c59ae75708f1fd643f1679fa7b0c0289ee14`

Evidence release asset:

- File: `CivicSuite-msi-evidence.txt`
- Bytes: `578`
- SHA-256: `984dad5d789707b7ae43ad2e84b2da5b30550be17905a1499dd97da3c5471d65`
- GitHub release digest: `sha256:984dad5d789707b7ae43ad2e84b2da5b30550be17905a1499dd97da3c5471d65`

The evidence asset must contain:

- `SameVersionMajorUpgrade=true`
- `UpgradeCode=a63fc1d3-5437-5f55-89a2-fef93fb1f930`

Use elevated/admin access as needed for Windows Installer, per-machine install/uninstall/reinstall, repair, major-upgrade removal, disk cleanup through product or Windows Installer lifecycle, and any other Windows admin lifecycle operation. Record when elevation was used.

## Cleanroom Start Required

Start from a clean CivicSuite test state before installing this artifact.

Preferred cleanroom path:

- Revert the tester VM to a known-clean snapshot taken before CivicSuite was installed or tested.

Bare-metal fallback if a VM snapshot is not available:

- Remove all CivicSuite-installed products through elevated Windows Installer lifecycle controls when Windows Installer allows it.
- Stop and remove CivicSuite services and managed CivicSuite runtime processes.
- Remove the CivicSuite Program Files payload when Windows permits it.
- Remove the test user's CivicSuite runtime/profile/cache/config/data folders.
- Remove stale CivicSuite MSI registrations/product codes if Windows Installer still reports them and permits removal.
- Remove prior CivicSuite test artifacts, downloaded MSIs, support bundles, and backup artifacts used only for previous runs unless specifically needed for the stale pre-restore backup check below.
- Do not reboot the tester machine. It is unattended and must remain available for the Codex tester session.
- Before installing this artifact, verify no CivicSuite processes or services remain running and record whether any stale CivicSuite product remains registered with Windows Installer.

Do not delete unrelated installed software, unrelated user data, unrelated system components, or unrelated developer tooling.

Record which cleanroom path was used and the evidence that the machine was clean, or as clean as possible without rebooting, before install.

## Why This Retest Exists

`TESTER-RESULT-098.md` did not reach the desktop workflow or restore surface. The test machine had a stale same-version CivicSuite MSI registration:

- ProductCode `{291F4AE6-5B07-4A8C-8F82-FCE71A20A6F6}`
- ProductVersion `0.1.0`
- InstallLocation `C:\Program Files\CivicSuite\`

The elevated uninstall returned `1603`, the stale product registration and Program Files payload remained, and the directive 098 target MSI install also returned `1603`. The MSI logs showed elevated/admin context and `MsiSystemRebootPending = 1`, but the tester machine must not be rebooted.

The builder fix in this artifact changes the MSI major-upgrade configuration for repeated prerelease validation:

- `desktop/src-tauri/tauri.conf.json` now sets `bundle.windows.allowDowngrades` to `false`.
- The generated WiX authoring emits same-version major-upgrade support with `AllowSameVersionUpgrades`.
- The CI evidence records `SameVersionMajorUpgrade=true`.

This retest must prove the new same-version MSI can replace or recover from stale same-version CivicSuite registrations without requiring a machine reboot, then continue the restore latest backup retest from directive 098.

## Required Test Surface

Use only the installed desktop app:

`C:\Program Files\CivicSuite\civicsuite-desktop.exe`

Do not perform workflow checks through module browser URLs, suite-launcher tabs, localhost module pages, or developer preview routes.

## Required Checks

1. Verify artifact integrity against the MSI and evidence hashes above, and record GitHub artifact ZIP name/bytes when available.
2. Verify the evidence asset contains `SameVersionMajorUpgrade=true`.
3. Complete the cleanroom start requirement. If the stale directive 098 same-version MSI registration remains or cleanroom uninstall still returns `1603`, do not reboot. Record the stale ProductCode, ProductVersion, InstallLocation, Windows Installer result, and MSI log excerpts.
4. Install the directive 099 MSI through the elevated/admin Windows Installer path. If a stale same-version registration remains, this install is expected to exercise same-version major-upgrade replacement behavior.
5. Install must not fail solely because the stale same-version product could not be uninstalled during cleanroom cleanup. If it fails, record whether the MSI log shows `FindRelatedProducts`, `RemoveExistingProducts`, same-version product detection, `MsiSystemRebootPending`, and the smallest reproducible sequence.
6. Launch the installed desktop app and record the app/window identity.
7. Verify model readiness from the installed desktop System Health surface. If model-cache skips appear in backup manifests because disk is low, record them; do not fail solely because model cache was intentionally skipped or preserved.
8. Before restore, run product Start/Check/Repair controls for Local data store, City workflow services, Task queue schema, and Background work queue. These must recover through product controls without hand-killing processes or editing the profile.
9. Verify the installed user runtime contains `runtime\postgres\bin\zlib1.dll` after install and after any product Repair.
10. Run Backup Now and verify it leaves `Working`, returns `Backup complete`, and creates a fresh backup root with `backup-manifest.json` and root `README.txt`.
11. Run a full fresh Clerk adopted-legislation workflow with a fresh marker:
    - Create or select the fresh meeting body/member/meeting/agenda evidence.
    - Save a minutes draft containing a sentence with the fresh marker.
    - Add at least one minute citation whose cited sentence appears exactly in the minutes draft.
    - Record a motion with disposition `passed`.
    - Adopt Minutes.
    - Sign Minutes with signer and attestation evidence.
    - Record Adopted Ordinance/Resolution with title/text containing the fresh marker.
    - Archive Public Record.
    - Close/reopen the desktop app and verify fresh adopted-legislation evidence appears on the fresh meeting.
12. Run fresh Records durability evidence with a typed unreadable reference and verify it survives close/reopen.
13. Run fresh Code source/handoff/guidance evidence and verify the fresh source, handoff, and guidance all attach to the fresh marker record and survive close/reopen.
14. Run Create Support Bundle and verify it leaves `Working`, returns `Support bundle ready`, and creates a fresh support manifest.
15. Ensure at least one stale `civicsuite-pre-restore-backup-*` safety backup exists under the same backup root before restore. If no stale safety backup exists naturally, create one only through product Restore Latest Backup against older non-critical evidence before creating the final fresh marker backup, then proceed with the fresh marker backup. Do not hand-edit backup manifests or product profile data.
16. Close the desktop app normally, then use elevated Windows Installer uninstall/reinstall of the same target MSI. Uninstall should not return `1603`. If Windows Installer still returns `1603` because of global pending reboot state, do not reboot; record the MSI log evidence and continue only if the target MSI can still install or repair into a usable product state.
17. Launch the reinstalled desktop app and run Restore Latest Backup from System Health product controls.
18. Restore must select the fresh manual backup, not any stale `pre-restore` safety backup:
    - restore must return a bounded product result instead of staying in `Working` or failing with `Access is denied`;
    - the restore message or evidence should identify the fresh manual backup path when visible;
    - record any old-folder cleanup pending message;
    - record any model-cache preservation or pre-restore `Data/models` skipped-file evidence.
19. After restore, use only product Start/Check/Repair controls to recover Local data store, City workflow services, Task queue schema, and Background work queue health. Do not hand-kill processes or edit the profile during restore recovery.
20. Verify restored Clerk/Records/Code evidence for the fresh marker is visible after restore.

## Result Format

`TESTER-RESULT-099.md` must include:

- Verdict: PASS or FAIL.
- Remote/directive verification with live branch and `FETCH_HEAD`.
- Cleanroom start path and evidence, including whether any stale same-version MSI registration remained.
- Artifact integrity hashes and bytes.
- Evidence asset contents for `SameVersionMajorUpgrade=true`.
- Elevation/install/uninstall/reinstall evidence.
- Stale ProductCode/ProductVersion/InstallLocation evidence if cleanup was blocked.
- MSI log evidence for same-version major-upgrade behavior, `FindRelatedProducts`, `RemoveExistingProducts`, and any `MsiSystemRebootPending` state.
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
