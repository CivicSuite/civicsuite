# TESTER-RESULT-097

Verdict: FAIL

## Remote / directive verification

- Live remote checked with `git ls-remote origin refs/heads/stage-3a-baremetal-windows`: `4b3c964323d6396ba8da5469b9f59338d513c4a9`.
- Fetched `origin stage-3a-baremetal-windows --prune`; `FETCH_HEAD` was `4b3c964323d6396ba8da5469b9f59338d513c4a9`.
- `FETCH_HEAD` subject: `Clarify directive 097 no reboot cleanup`.
- Newest directive was `test-comms/TESTER-DIRECTIVE-097.md`; newest prior result was `TESTER-RESULT-096.md`.

## Cleanroom start

- Bare-metal fallback used; no VM snapshot was available.
- Elevated cleanup was used as `DESKTOP-LOOTB7M\insty`.
- Removed prior registered CivicSuite product `{4B70E3FA-F1D4-48CD-BB0B-344FDFDA8286}` through Windows Installer: exit `0`.
- Final cleanroom evidence showed no CivicSuite products, uninstall keys, services, processes, Program Files payload, or `%LOCALAPPDATA%\CivicSuite`; free space was `21.03 GB`.
- Evidence: `directive097-evidence/admin-cleanroom-result.json`.

## Artifact integrity

- GitHub Actions ZIP artifact download was not anonymously available. The artifact API returned a 120-byte `401 Requires authentication` body, so the ZIP bytes/hash did not match the directive values.
- Public release MSI verified:
  - `CivicSuite_0.1.0_x64_en-US.msi`
  - bytes `1645155136`
  - SHA-256 `c9917193540b4581ab15e33332cebc7a661eee230da9fcf1f3e267b3ec63b880`
  - matched expected.
- Public release evidence asset verified:
  - `CivicSuite-msi-evidence.txt`
  - bytes `548`
  - SHA-256 `e15c7ca266f9e3d27dbcb201b838bdd970e659aa0f43d3e3ac36623b2988100e`
  - matched expected.
- Evidence: `directive097-evidence/artifact/release-asset-integrity.json`, `directive097-evidence/artifact/zip-integrity.json`.

## Install / app identity

- Elevated MSI install exit code: `0`.
- Installed product: `{291F4AE6-5B07-4A8C-8F82-FCE71A20A6F6}`, version `0.1.0`.
- Installed executable: `C:\Program Files\CivicSuite\civicsuite-desktop.exe`, size `12787200`, version `0.1.0`.
- Launched installed desktop app, not a dev server. Process identity: `civicsuite-desktop`, window title `CivicSuite`, path `C:\Program Files\CivicSuite\civicsuite-desktop.exe`.
- Evidence: `directive097-evidence/install-result.json`, `directive097-evidence/launch-app.json`, `directive097-evidence/desktop-after-launch.png`.

## Model readiness

- First-run model download initially reported low disk guard after partial download: product wanted `15000000000` free bytes and saw `14295072768`.
- After space cleanup of old repo-local CivicSuite test runtime scratch, the product completed the pinned model download and checksum:
  - `Data\models\gemma-4-12b-it-qat-q4_0.gguf`
  - size `6975877728`
  - UI reported `Verified`, `6.5 GB of 6.5 GB`, `100.00% complete`.
- Product installed bundled Ollama runtime and logs show `/api/create` returned `200`, but `/api/tags` later returned an empty model list in direct probe, and UI still showed model runtime readiness as inconsistent/needs runtime in some snapshots.
- Evidence: `directive097-evidence/model-download-inner-097.json`, `directive097-evidence/system-health-after-services-097.json`, `directive097-evidence/model-runtime.log` via support bundle.

## Service health / zlib

- Before restore, product System Health controls recovered the required services:
  - Task queue schema: `OK`, endpoint `http://127.0.0.1:15480/health`, HTTP `200`, database status `ready`.
  - Local data store: `OK`, bundled PostgreSQL runtime present and started.
  - City workflow services: `OK`, bundled Python runtime present and started.
  - Background work queue: `OK`, task queue worker present and started.
- Installed user runtime contained `C:\Users\insty\AppData\Local\CivicSuite\runtime\postgres\bin\zlib1.dll` after product install/start:
  - size `91648`
  - SHA-256 `890AFA7A17FB66308E0026631070409138B157EF2773C0A41D22A76943F7AEDF`
- This confirms the zlib runtime-copy regression is fixed for the install/product-start path tested here.
- Evidence: `directive097-evidence/local-data-install-097.json`, `directive097-evidence/services-install-start-097.json`, `directive097-evidence/system-health-after-services-097.json`.

## Backup / support bundle

- Backup Now required explicit product review confirmation.
- Fresh backup created:
  - `C:\Users\insty\Documents\CivicSuite Backups\civicsuite-manual-backup-1781845837-37064`
  - contains `backup-manifest.json` and root `README.txt`.
  - manifest included fresh directive-097 evidence files, including:
    - `Data/exports/meetings/meeting-2-dir097-20260618224015-1781845397.md`
    - `Data/files/records/req-0001/unreadable-typed-ref-dir097-20260618224015-1781845428-reference.txt`
  - manifest skipped model-cache heavy files because disk was low:
    - `Data/models/gemma-4-12b-it-qat-q4_0.gguf`
    - `Data/models/ollama/blobs/sha256-faff...`
    - reason: `There is not enough space on the disk. (os error 112)`.
- Fresh support bundle created:
  - `C:\Users\insty\Documents\CivicSuite Backups\support-bundles\civicsuite-support-bundle-1781845951-37064`
  - contains `support-manifest.json`, `health-summary.json`, `runtime-state.json`, `README.txt`, and service logs.
- Evidence: `directive097-evidence/confirm-backup-support-097.json`, `directive097-evidence/support-clean-097.json`.

## Clerk adopted-legislation workflow

- Fresh marker: `DIR097-20260618224015`.
- Created body/member:
  - `Council DIR097-20260618224015`
  - `Member DIR097-20260618224015`.
- First meeting was accidentally archived before a passed motion; product correctly blocked post-archive motion edits with `This meeting is archived as a public record`.
- Second meeting completed the required order:
  - `Meeting 2 DIR097-20260618224015`
  - minutes draft containing exact citation sentence: `The council considered adopted legislation marker DIR097-20260618224015 during the second meeting.`
  - minute citation added for `packet item Agenda item 2 DIR097-20260618224015`, public record.
  - motion recorded by `Member DIR097-20260618224015`, text `Motion to adopt ordinance evidence 2 DIR097-20260618224015`, disposition `passed`.
  - minutes adopted.
  - minutes signed by `Clerk 2 DIR097-20260618224015`, attestation `Attestation 2 DIR097-20260618224015`.
  - adopted ordinance recorded: `Ordinance 2 DIR097-20260618224015`, `Adopted ordinance text 2 DIR097-20260618224015`.
  - public record archived.
- Close/reopen durability before restore: marker present in Clerk snapshot after normal close and relaunch.
- Evidence: `directive097-evidence/clerk-second-workflow-097.json`, `directive097-evidence/post-reopen-durability-summary-097.json`.

## Records durability

- Created records request `REQ-0001` for `Requester DIR097-20260618224015`.
- Attached typed unreadable reference:
  - title `Unreadable typed ref DIR097-20260618224015`
  - source/reference `Z:\definitely-missing\unreadable-DIR097-20260618224015.pdf`
  - citation `Typed unreadable citation DIR097-20260618224015`
  - persisted as selected document `records-document-1781845428-1`.
- Close/reopen durability before restore: marker present in Records snapshot after normal close and relaunch.
- Evidence: `directive097-evidence/records-after-request-097.json`, `directive097-evidence/post-reopen-records-097.json`.

## Code durability

- Fresh Code source was automatically created from Clerk adopted legislation:
  - `Ordinance 2 DIR097-20260618224015`
  - source evidence `CivicClerk adoption event`
  - imported by `CivicClerk`
  - pending codifier sync.
- Added staff guidance draft text `Staff guidance DIR097-20260618224015 for adopted source`; no confirmation modal appeared for the guidance save, but the marker remained present in the Code surface.
- Created confirmed Clerk handoff: `Clerk handoff DIR097-20260618224015 for code update`.
- Close/reopen durability before restore: marker present in Code snapshot after normal close and relaunch.
- Evidence: `directive097-evidence/code-initial-097.json`, `directive097-evidence/code-durability-097.json`, `directive097-evidence/post-reopen-code-097.json`.

## Normal close / uninstall / reinstall

- Normal desktop close via main window succeeded: `CloseMainWindow()` returned `true`; no force kill required.
- Elevated Windows Installer uninstall/reinstall of the same MSI:
  - uninstall product `{291F4AE6-5B07-4A8C-8F82-FCE71A20A6F6}` exit `0`
  - reinstall exit `0`
  - no `1603`
  - product registered again as `CivicSuite 0.1.0`.
- Evidence: `directive097-evidence/normal-close-reopen-097.json`, `directive097-evidence/uninstall-reinstall-result.json`.

## Restore / post-restore

- Launched reinstalled desktop app and ran Restore Latest Backup from System Health product controls.
- Restore did not stay visibly stuck in `Working` and did not show `Access is denied`; it returned to a signed-out UI.
- However, after signing back in with the directive-097 local admin and checking Clerk, Records, Code, and Health, the fresh marker `DIR097-20260618224015` was absent from all post-restore snapshots.
- The fresh manual backup manifest clearly contained the directive-097 Clerk archive, typed unreadable Records reference, and Code/adoption evidence, so the absence after restore is a failure of restored visibility / likely wrong-backup restore selection or stale-profile restore.
- Post-restore visibility summary:
  - Clerk marker present: `false`
  - Records marker present: `false`
  - Code marker present: `false`
  - Health marker present: `false`
- Evidence: `directive097-evidence/restore-latest-097.json`, `directive097-evidence/post-restore-visibility-summary-097.json`.

## Smallest reproducible failure sequence

1. From installed app, create fresh Clerk/Records/Code evidence with marker `DIR097-20260618224015`.
2. Confirm close/reopen shows the marker in Clerk, Records, and Code.
3. Run Backup Now and confirm fresh backup `civicsuite-manual-backup-1781845837-37064`; its `backup-manifest.json` includes marker evidence files.
4. Close app normally.
5. Elevated `msiexec /x {291F4AE6-5B07-4A8C-8F82-FCE71A20A6F6} /qn /norestart`, then elevated reinstall same MSI; both return `0`.
6. Launch installed app and run System Health -> Restore Latest Backup -> Confirm Restore Latest Backup.
7. Sign back in and open Clerk, Records, and Code.
8. Fresh marker `DIR097-20260618224015` is absent from all restored product surfaces.

## Final notes

- The specific zlib regression that motivated this retest appears fixed for local PostgreSQL runtime install: `zlib1.dll` was copied into the installed user runtime and product Start controls recovered PostgreSQL, workflow services, task queue schema, and background queue before restore.
- This run still fails because Restore Latest Backup did not restore the fresh backup evidence into visible product state.
