# TESTER-RESULT-092

Verdict: FAIL

## Remote/directive verification

- Live remote branch check was performed before declaring this result:
  - `git ls-remote origin refs/heads/stage-3a-baremetal-windows` returned `714b3890a491a1746dc4cea751e955fce3bbf7ec`.
  - `FETCH_HEAD` after fetch also contained `714b3890a491a1746dc4cea751e955fce3bbf7ec`.
- Local checkout was reset to `origin/stage-3a-baremetal-windows` at `714b3890a491a1746dc4cea751e955fce3bbf7ec`.
- Result file written: `test-comms/TESTER-RESULT-092.md`.

## Artifact integrity

- MSI: `CivicSuite_0.1.0_x64_en-US.msi`
  - Path: `C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\directive092-evidence\CivicSuite_0.1.0_x64_en-US.msi`
  - Bytes: `1645077312`
  - SHA-256: `4341ffca5a7895d43473700376c0b157553484e25e7094ba5aaea96c03af4386`
  - Matches directive: yes.
- Evidence asset: `CivicSuite-msi-evidence.txt`
  - Bytes: `548`
  - SHA-256: `ca31d4f19d191499d55466d3f7c3e90352071ae422bea6f37f8de3079040b04e`
  - Matches directive: yes.

## Install / elevation / product identity

- Codex worker process was not elevated.
- Initial non-elevated `/i` failed with MSI `1603` because rollback/recovery disk space was insufficient.
- Retrying with rollback disabled passed disk-space validation but failed at `RemoveExistingProducts` with MSI error `1730`: `You must be an Administrator to remove this application`.
- Elevated Windows Installer path was then used:
  - Elevated uninstall of old product `{278D01BB-2CBD-4D6B-8DC1-6EB656CFED8C}`: exit `0`.
  - Elevated install of target MSI: exit `0`.
  - Elevated uninstall/reinstall of the same target MSI later in the test: exit `0` / `0`.
- Installed product code after target install/reinstall: `{8C17EA1A-5E0B-4018-84EC-1BDF8516808C}`.
- Installed executable path: `C:\Program Files\CivicSuite\civicsuite-desktop.exe`.
- Installed executable bytes: `12553728`.

## Desktop app surface

- Launched only the installed desktop executable at `C:\Program Files\CivicSuite\civicsuite-desktop.exe`.
- Visible window title/process evidence showed `CivicSuite` from `civicsuite-desktop.exe`.
- WebView inspection target was the installed Tauri app surface at `http://tauri.localhost/`.
- I did not use `http://127.0.0.1:18082/`, suite-launcher tabs, or module browser URLs to perform workflow checks.

## Runtime/model readiness

- Desktop System Health showed Local AI Model status `Ready`.
- UI text showed:
  - Runtime name: `civicsuite-gemma4-12b-qat:q4_0`
  - Local path: `C:\Users\insty\AppData\Local\CivicSuite\Data\models\gemma-4-12b-it-qat-q4_0.gguf`
  - Download progress: `Verified`, `6.5 GB of 6.5 GB`, `100.00% complete`
  - Ollama endpoint: `http://127.0.0.1:15434/api/tags`
- Post-restore endpoint probe still returned model runtime OK and listed `civicsuite-gemma4-12b-qat:q4_0`.
- A user-global Ollama process was also present:
  - `C:\Users\insty\AppData\Local\Programs\Ollama\ollama.exe serve`
- CivicSuite-managed Ollama process was present:
  - `C:\Users\insty\AppData\Local\CivicSuite\runtime\ollama\ollama.exe serve`

## Backup Now

- Ran `Backup Now` from the installed desktop app System Health product controls.
- The UI entered:
  - `Working`
  - `Running Backup Now from the desktop app.`
- The Working panel did not clear during the observed run.
- No fresh backup directory appeared after waiting.
- Latest backup remained the prior directive backup:
  - `C:\Users\insty\Documents\CivicSuite Backups\civicsuite-manual-backup-1781756242-39848`
  - `backup-manifest.json`: present.
  - `README.txt`: present.
- Because no fresh 092 backup was created, there was no fresh 092 `skipped_files` observation to report. The product failed before producing a new manifest.

## Clerk / adopted legislation durability

- Fresh marker used: `DIR092-20260618003444`.
- In the live desktop session, the Clerk/Meetings surface accepted product-control workflow actions and showed fresh evidence:
  - `Council adopted ordinance citation DIR092-20260618003444.`
  - `C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\directive092-evidence\readable-DIR092-20260618003444.txt`
- Existing adopted legislation evidence from earlier runs remained visible, for example:
  - `Adopted legislation: ordinance Ordinance DIR088B-20260617161934`
  - `Adopted legislation: ordinance Ordinance DIR086-20260617074239`
- After close/reopen, the fresh `DIR092-20260618003444` marker was not visible on the reopened Meetings screen. This is a durability failure for the fresh 092 Clerk evidence.

## Records lifecycle durability

- I used the installed desktop Records Requests UI and typed a fresh unreadable reference:
  - `Z:\CivicSuite\Missing\records-DIR092-20260618003444.pdf`
  - `typed unreadable reference DIR092-20260618003444`
- The run did not preserve the fresh 092 marker after close/reopen.
- Reopened Records still showed older durable typed unreadable reference evidence, including:
  - `Responsive document DIR089-20260617135838 typed unreadable reference DIR089-20260617135838 attached for response review`
  - `Responsive document DIR090-20260617165218 typed unreadable reference DIR090-20260617165218 attached for response review`
  - `Responsive document DIR091-20260617221623 typed unreadable reference DIR091-20260617221623 attached for response review`
- Fresh 092 Records evidence therefore failed durability.

## Code source / handoff durability

- I used the installed desktop Code & Ordinances UI and typed a fresh source reference:
  - `code-source-DIR092-20260618003444.pdf`
- Immediate live-session Code snapshot showed fresh handoff evidence:
  - `Clerk handoff DIR092-20260618003444`
- After close/reopen, the fresh `DIR092-20260618003444` marker was not visible on the reopened Code screen.
- Fresh 092 Code source/handoff evidence therefore failed durability.

## Support bundle

- Ran `Create Support Bundle` from installed desktop app System Health product controls.
- The UI entered:
  - `Working`
  - `Running Create Support Bundle from the desktop app.`
- The Working panel did not clear during the observed run.
- No fresh support bundle appeared after waiting.
- Latest support bundle remained the prior directive bundle:
  - `C:\Users\insty\Documents\CivicSuite Backups\support-bundles\civicsuite-support-bundle-1781756254-39848`
  - `support-manifest.json`: present.

## Repair

- Product System Health `Start` / `Check` / `Repair` controls were invoked before workflow checks.
- Health remained degraded afterward:
  - `Task queue schema`: `Needs services`
  - `Local data store`: `Needs start`
  - `City workflow services`: `Needs start`
  - `Background work queue`: `Needs start`
- Product repair did not recover the local data store / services / task queue health.

## Uninstall / reinstall

- Elevated uninstall of target product `{8C17EA1A-5E0B-4018-84EC-1BDF8516808C}` succeeded with exit `0`.
- Elevated reinstall of the same target MSI succeeded with exit `0`.
- Reinstalled product was present at `C:\Program Files\CivicSuite\civicsuite-desktop.exe`.

## Restore Latest Backup

- Reinstalled desktop app was launched from `C:\Program Files\CivicSuite\civicsuite-desktop.exe`.
- Restore source available to the product was the latest existing backup:
  - `C:\Users\insty\Documents\CivicSuite Backups\civicsuite-manual-backup-1781756242-39848`
- Ran `Restore Latest Backup` / confirm from System Health product controls.
- No hand-editing of profile/database/model/backup/runtime files was performed.
- No CivicSuite-managed process was hand-killed during restore.
- The restore did not return `Restore complete` or `Restore needs service start`.
- The WebView debug endpoint became unresponsive during restore.
- After additional waiting:
  - Desktop window was visibly `CivicSuite (Not Responding)`.
  - Screenshot evidence: `directive092-evidence\postrestore-screen-capture.png`.
  - `http://127.0.0.1:15480/health` returned HTTP `503`.
  - `http://127.0.0.1:15434/api/tags` returned HTTP `200` and listed the pinned model.
  - `http://127.0.0.1:9262/json/list` timed out.
- Product Stop/Start/Check/Repair controls were not reachable after restore because the desktop app window/WebView was not responding.
- No old-folder cleanup pending message was visible or capturable because restore never returned a bounded product result.

## Post-restore health

- Before restore, System Health already showed:
  - `Task queue schema`: `Needs services`
  - `Local data store`: `Needs start`
  - `City workflow services`: `Needs start`
  - `Background work queue`: `Needs start`
  - `Local AI model`: OK / ready
  - `Local document storage`: OK / ready
- After restore attempt:
  - Local data store / city workflow services / task queue / background work queue did not recover.
  - Health endpoint `15480` returned `503`.
  - The desktop app was not responsive enough to run product Start/Check/Repair controls.

## Smallest reproducible failure sequence

1. Install target MSI `CivicSuite_0.1.0_x64_en-US.msi` with elevated Windows Installer path.
2. Launch `C:\Program Files\CivicSuite\civicsuite-desktop.exe`.
3. Observe System Health services degraded (`Needs start` / `Needs services`) while Local AI model is `Ready`.
4. Run `Backup Now`: UI stays on `Working - Running Backup Now from the desktop app`; no fresh backup manifest appears.
5. Run `Create Support Bundle`: UI stays on `Working - Running Create Support Bundle from the desktop app`; no fresh support manifest appears.
6. Use elevated Windows Installer to uninstall and reinstall the same MSI.
7. Launch reinstalled desktop app.
8. Run `Restore Latest Backup` / confirm from System Health.
9. Desktop app becomes `CivicSuite (Not Responding)`, WebView debug endpoint times out, and `15480/health` returns `503`.

## Evidence paths

- `directive092-evidence\artifact-integrity.json`
- `directive092-evidence\install-elevated-outcome.json`
- `directive092-evidence\uninstall-reinstall-outcome.json`
- `directive092-evidence\desktop-initial.png`
- `directive092-evidence\092-clerk-after.txt`
- `directive092-evidence\092-records-after.txt`
- `directive092-evidence\092-code-after.txt`
- `directive092-evidence\reopen-marker-summary.json`
- `directive092-evidence\092-health-after-backup.txt`
- `directive092-evidence\092-health-after-support.txt`
- `directive092-evidence\backup-support-discovery-after-wait.json`
- `directive092-evidence\092-restore-before.txt`
- `directive092-evidence\postrestore-endpoints-after-timeout.json`
- `directive092-evidence\postrestore-processes-after-timeout.json`
- `directive092-evidence\postrestore-screen-capture.png`
