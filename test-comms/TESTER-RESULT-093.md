# TESTER-RESULT-093

Verdict: FAIL

## Remote/directive verification

- Live remote branch check was performed before running the directive:
  - `git ls-remote origin refs/heads/stage-3a-baremetal-windows` returned `57671fc7757f947900e764dd3f1516998d59fe8c`.
  - `FETCH_HEAD` after fetch also contained `57671fc7757f947900e764dd3f1516998d59fe8c`.
- Local checkout was reset to `origin/stage-3a-baremetal-windows` at `57671fc7757f947900e764dd3f1516998d59fe8c`.
- Result file written: `test-comms/TESTER-RESULT-093.md`.

## Artifact integrity

- MSI: `CivicSuite_0.1.0_x64_en-US.msi`
  - Path: `directive093-evidence\CivicSuite_0.1.0_x64_en-US.msi`
  - Bytes: `1645151040`
  - SHA-256: `3903df26d8fdc1200876575edabed387bed282407cfcf9744331b968592cfe2e`
  - Matches directive: yes.
- Evidence asset: `CivicSuite-msi-evidence.txt`
  - Bytes: `548`
  - SHA-256: `4a0a024bde8bd127d2ad2ac06f8dbab465293e3cf13b83da083603b4d5cf79ae`
  - Matches directive: yes.

## Install / elevation / product identity

- Codex worker process was not elevated.
- `HypervisorPresent`: `True`.
- `VirtualizationFirmwareEnabled`: `False`.
- A prior non-responding `civicsuite-desktop.exe` process from directive 092 survived the MSI uninstall/reinstall path and held the old WebView debug port. I closed the fresh responsive app window normally and force-ended only that stale pre-test non-responding process before starting the 093 product checks.
- Initial elevated install attempt failed with MSI `1603` due disk-space validation:
  - `Disk full: Out of disk space -- Volume: 'C:'; required space: 4,015,092 KB; available space: 519,932 KB.`
- Elevated Windows Installer uninstall of the prior product `{8C17EA1A-5E0B-4018-84EC-1BDF8516808C}` succeeded with exit `0` and freed enough disk.
- Elevated install of the target MSI succeeded with exit `0` using the normal Windows Installer path and `MSIDISABLEROLLBACK=1`.
- Installed product code: `{1F9F7FC8-DCFA-4C04-80E5-70760224C3DC}`.
- Installed executable path: `C:\Program Files\CivicSuite\civicsuite-desktop.exe`.
- Installed executable bytes: `12706304`.
- Later elevated uninstall/reinstall of the same target MSI succeeded with exit `0` / `0`.
- No Windows Installer elevation issue was observed after using the elevated path.

## Desktop app surface

- Launched only the installed desktop executable at `C:\Program Files\CivicSuite\civicsuite-desktop.exe`.
- Visible process/window evidence showed `CivicSuite` from `civicsuite-desktop.exe`.
- WebView inspection target was the installed Tauri app surface at `http://tauri.localhost/`.
- I did not use `http://127.0.0.1:18082/`, suite-launcher tabs, or module browser URLs to perform workflow checks.

## Runtime/model readiness

- Desktop System Health showed Local AI Model status `Ready`.
- UI text showed:
  - Runtime name: `civicsuite-gemma4-12b-qat:q4_0`
  - Local path: `C:\Users\insty\AppData\Local\CivicSuite\Data\models\gemma-4-12b-it-qat-q4_0.gguf`
  - Download progress: `Verified`, `6.5 GB of 6.5 GB`, `100.00% complete`
  - Ollama endpoint: `http://127.0.0.1:15434/api/tags`
- Endpoint probe after restore wait still returned model runtime OK and listed `civicsuite-gemma4-12b-qat:q4_0`.
- A user-global Ollama process was also present:
  - `C:\Users\insty\AppData\Local\Programs\Ollama\ollama.exe serve`
- CivicSuite-managed Ollama process was present:
  - `C:\Users\insty\AppData\Local\CivicSuite\runtime\ollama\ollama.exe serve`

## Backup Now

- Ran `Backup Now` from installed desktop app System Health product controls.
- The review/action panel cleared to a bounded result:
  - `Backup complete`
  - `CivicSuite local data and configuration were backed up to C:\Users\insty\Documents\CivicSuite Backups\civicsuite-manual-backup-1781777023-35260; manifest: C:\Users\insty\Documents\CivicSuite Backups\civicsuite-manual-backup-1781777023-35260\backup-manifest.json.`
- Fresh backup root: `C:\Users\insty\Documents\CivicSuite Backups\civicsuite-manual-backup-1781777023-35260`.
- `backup-manifest.json`: present, `289614` bytes.
- Root `README.txt`: present, `320` bytes.
- Manifest `files` count: `1715`.
- Manifest `skipped_files` count: `2`.
- Skipped files were recorded instead of preventing manifest creation:
  - `Data/models/gemma-4-12b-it-qat-q4_0.gguf`: `backup file copy failed: There is not enough space on the disk. (os error 112)`
  - `Data/models/ollama/blobs/sha256-faff1a63667fac17ac5e777f47114688fcefea96e220e211aaa8d62c2c4561f1`: `backup file copy failed: There is not enough space on the disk. (os error 112)`

## Clerk / adopted legislation durability

- Fresh marker used: `DIR093-20260618040526`.
- I used the installed desktop Meetings & Notices UI to create product evidence:
  - Meeting body / member / agenda intake / meeting fields with the fresh marker.
  - Typed source citation path: `directive093-evidence\readable-DIR093-20260618040526.txt`.
  - Meeting/archive evidence visible after close/reopen:
    - `Regular Meeting DIR093-20260618040526`
    - `Meeting workflow DIR093-20260618040526`
    - `Agenda: Budget item DIR093-20260618040526 (manual meeting draft)`
    - `Source: typed source C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\directive093-evidence\readable-DIR093-20260618040526.txt`
- Fresh adopted-legislation evidence did not appear for `DIR093-20260618040526` despite attempting `Save Minutes Draft`, `Adopt Minutes`, `Sign Minutes`, `Record Adopted Ordinance/Resolution`, and `Archive Public Record`.
- The page continued to show older adopted legislation records only:
  - `Adopted legislation: ordinance Ordinance DIR088B-20260617161934 (pending CivicCode sync)`
  - `Adopted legislation: ordinance Ordinance DIR086-20260617074239 (pending CivicCode sync)`
- A visible product error from the attempted archive path was:
  - `Needs attention`
  - `Adopt the minutes before archiving the public meeting record.`
- Therefore the top-level adopted legislation count after close/reopen was nonzero from older records, but fresh 093 adopted legislation/publication/archive evidence was incomplete.

## Records lifecycle durability

- I used the installed desktop Records Requests UI with a fresh typed unreadable reference:
  - `Z:\CivicSuite\Missing\records-DIR093-20260618040526.pdf`
- After close/reopen, fresh Records evidence survived:
  - `Responsive document DIR093-20260618040526`
  - `Requester DIR093-20260618040526`
  - `Records request summary DIR093-20260618040526`
  - `Deadline basis: CORA policy DIR093-20260618040526`
  - `Assigned: Records Officer DIR093-20260618040526`
  - `Responsive document DIR093-20260618040526 typed unreadable reference DIR093-20260618040526 attached for response review`
- Records export flow reached a review confirmation and then was confirmed from product controls.

## Code source / handoff durability

- I used the installed desktop Code & Ordinances UI with a fresh typed source reference:
  - `code-source-DIR093-20260618040526.pdf`
- Fresh Code marker after close/reopen:
  - `Staff guidance: Guidance draft DIR093-20260618040526`
  - `Clerk handoff DIR093-20260618040526`
- The Code source list after close/reopen did not show a fresh `Source evidence: file code-source-DIR093-20260618040526.pdf` line in the captured visible text, but the fresh guidance and handoff marker persisted.

## Support bundle

- Ran `Create Support Bundle` from installed desktop app System Health product controls.
- The review/action panel cleared to a bounded result:
  - `Support bundle ready`
  - `Created a CivicSuite support bundle with health, runtime-state, selected service logs, and support-manifest.json at C:\Users\insty\Documents\CivicSuite Backups\support-bundles\civicsuite-support-bundle-1781777465-35260.`
- Fresh support bundle root: `C:\Users\insty\Documents\CivicSuite Backups\support-bundles\civicsuite-support-bundle-1781777465-35260`.
- `support-manifest.json`: present, `1752` bytes.
- Manifest `files` count: `8`.
- Manifest had no explicit `notes` or `collection_notes` properties.

## Repair / service controls

- Before Backup/Support/Restore, System Health showed:
  - `Task queue schema`: `Needs services`
  - `Local data store`: `Needs start`
  - `City workflow services`: `Needs start`
  - `Background work queue`: initially recovered once, then later returned to `Needs start`
  - `Local AI model`: OK / ready
  - `Local document storage`: OK / ready
- Product `Start` controls were used for local data store, city workflow services, and background work queue.
- Product `Repair` controls opened a review panel and, after `Confirm Repair`, returned a bounded result:
  - `Installed`
  - `The bundled local runtime payloads, folders, and service state were prepared.`
- After repair and a second `Start` pass:
  - `Local data store` still reported `Needs start`
  - Visible result: `Needs attention` / `Local data store start failed with status exit code: 1.`
  - `City workflow services` still reported `Needs start`
  - `Task queue schema` still reported `Needs services`
- The desktop controls remained responsive while this degraded state was visible.

## Restore Latest Backup

- Reinstalled desktop app was launched from `C:\Program Files\CivicSuite\civicsuite-desktop.exe`.
- Restore source available to the product before restore:
  - `C:\Users\insty\Documents\CivicSuite Backups\civicsuite-manual-backup-1781777023-35260`
- Ran `Restore Latest Backup` / confirm from System Health product controls.
- No hand-editing of profile/database/model/backup/runtime files was performed.
- No CivicSuite-managed process was hand-killed during backup, support bundle creation, repair, restore, or service recovery.
- Restore did not return `Restore complete`, `Restore needs service start`, or another bounded product result during the observed run.
- After about 90 seconds and again after about 330 seconds, the visible UI still showed:
  - `Working`
  - `Running Restore Latest Backup from the desktop app.`
  - `Keep CivicSuite open while the local action completes.`
- Unlike directive 092, the desktop window remained responsive and the WebView debug endpoint stayed reachable:
  - `civicsuite-desktop.exe` process `Responding`: `true`
  - `http://127.0.0.1:9262/json/list`: HTTP `200`
- Service/model endpoint probes after the extended wait:
  - `http://127.0.0.1:15480/health`: HTTP `503`
  - `http://127.0.0.1:15434/api/tags`: HTTP `200`, model listed
- Product Stop controls were not used for a retry because the product did not report `Data` or `config` in use; it stayed on the generic restore `Working` state.
- No old-folder cleanup pending message was visible because restore never returned a bounded product result.
- Because restore never completed, I could not verify restored Clerk/Records/Resident/Code evidence after restore through product Start/Check/Repair controls.

## Post-restore System Health

- Post-restore System Health remained degraded:
  - `Task queue schema`: `Needs services`
  - `Local data store`: `Needs start`
  - `City workflow services`: `Needs start`
  - `Background work queue`: `Needs start`
  - `Local AI model`: OK / ready
  - `Local document storage`: OK / ready
- The restore action panel itself remained on `Working`, so this is still a product failure even though the window did not become not-responding.

## Smallest reproducible failure sequence

1. Install target MSI `CivicSuite_0.1.0_x64_en-US.msi` with elevated Windows Installer path. If prior install and low disk space are present, elevated uninstall first is required; the target install then succeeds.
2. Launch `C:\Program Files\CivicSuite\civicsuite-desktop.exe`.
3. System Health shows model `Ready`, but local data store / city workflow services / task queue degraded.
4. Run product `Start` and `Repair` controls. Repair returns bounded `Installed`, but local data store start still fails with `exit code: 1`; services remain degraded.
5. Run `Backup Now`: returns `Backup complete` and creates a fresh manifest with `skipped_files` recorded for low-disk model copies.
6. Create workflow evidence:
   - Records typed unreadable reference persists after close/reopen.
   - Code handoff marker persists after close/reopen.
   - Clerk meeting/archive marker persists, but fresh adopted-legislation marker does not appear.
7. Run `Create Support Bundle`: returns `Support bundle ready` and creates a fresh support manifest.
8. Use elevated Windows Installer to uninstall and reinstall the same MSI.
9. Launch reinstalled desktop app and run `Restore Latest Backup` / confirm from System Health.
10. Restore remains indefinitely on `Working - Running Restore Latest Backup from the desktop app`; after about 330 seconds no bounded restore result is returned, `15480/health` is `503`, and service health remains degraded.

## Evidence paths

- `directive093-evidence\artifact-integrity.json`
- `directive093-evidence\install-outcome.json`
- `directive093-evidence\uninstall-preinstall-outcome.json`
- `directive093-evidence\install-after-uninstall-outcome.json`
- `directive093-evidence\stale-pretest-process-cleanup.json`
- `directive093-evidence\debug-relaunch-outcome.json`
- `directive093-evidence\health-open.json`
- `directive093-evidence\health-after-starts.json`
- `directive093-evidence\health-after-confirm-repair.json`
- `directive093-evidence\health-after-repair-starts.json`
- `directive093-evidence\backup-after-wait.json`
- `directive093-evidence\backup-folders-after.json`
- `directive093-evidence\meetings-after-workflow.json`
- `directive093-evidence\meetings-after-confirm-archive.json`
- `directive093-evidence\meetings-after-adopt-sign.json`
- `directive093-evidence\records-after-confirm-export.json`
- `directive093-evidence\code-after-confirm-handoff.json`
- `directive093-evidence\support-after-wait.json`
- `directive093-evidence\support-folders-after.json`
- `directive093-evidence\reopen-marker-summary.json`
- `directive093-evidence\uninstall-reinstall-outcome.json`
- `directive093-evidence\postreinstall-launch.json`
- `directive093-evidence\restore-backup-candidates-before.json`
- `directive093-evidence\restore-after-wait90.json`
- `directive093-evidence\restore-procs-endpoints-after-wait90.json`
- `directive093-evidence\restore-after-wait330.json`
- `directive093-evidence\restore-procs-endpoints-after-wait330.json`
