# TESTER-RESULT-085

Verdict: FAIL

Directive: `TESTER-DIRECTIVE-085.md`
Branch checked: `stage-3a-baremetal-windows`
Branch head after fetch/prune: `5cce193114c6fbb52d540b8e1cedfdef2f633a15`
Artifact under test: PR #192 / `work/windows-local-1-design-contract` / `5149e7d31d6b74073d3f850b2722b8772485269b`

## Artifact Integrity

PASS. Downloaded release asset `CivicSuite_0.1.0_x64_en-US.msi` from tag `windows-local-msi-ci-5149e7d`.

- MSI bytes: `1645075703`
- MSI SHA256: `9b64b8b88645a7c87cffdf6b3d91b2423b0892d442c78c684e0f316de90d5f92`
- Evidence asset bytes: `548`
- Evidence asset SHA256: `0576a079c23d83138f2272679b7c31c538aae258cbc9139f4cb1ea314338524f`

The values matched the directive exactly.

## Install And Launch

PASS with host elevation note. A normal MSI install failed with Windows Installer error `1603`; the log showed insufficient disk space first, then removal of the prior installed product failed without administrator rights. After freeing only an untracked prior tester MSI artifact and stopping managed CivicSuite runtime processes, elevated `msiexec.exe` uninstall/install succeeded.

- Installed product code: `{19595170-EC9A-44CF-9E68-11AE0ED7A512}`
- Installed executable: `C:\Program Files\CivicSuite\civicsuite-desktop.exe`
- Installed executable length: `12523008`

PASS. The installed desktop app launched from `C:\Program Files\CivicSuite\civicsuite-desktop.exe`. The WebView target was title `CivicSuite` at `http://tauri.localhost/`. I did not use the old `18082` suite launcher/browser.

## Runtime And Model Readiness

PARTIAL. Because the MSI troubleshooting required stopping the managed runtime processes, the initial System Health view showed `Needs runtime` / `Needs start`. I used the product System Health `Start` controls to start the managed services.

After that, direct managed endpoints were ready:

- Managed Ollama process: `C:\Users\insty\AppData\Local\CivicSuite\runtime\ollama\ollama.exe`
- Managed Ollama endpoint: `http://127.0.0.1:15434/api/tags`
- Model listed: `civicsuite-gemma4-12b-qat:q4_0`
- Model size: `6975878155`
- Runtime health: `http://127.0.0.1:15480/health` returned `status: ok` with civiccore, civicrecords-ai, civicclerk, and civiccode all `ok`

A separate user-global Ollama process was also present, but the validated model endpoint was the managed CivicSuite port `15434`. The UI health panel lagged/stale after startup and still showed the model runtime as `Needs start` / timeout in one captured view even though the managed endpoint and process were ready.

## Clerk Workflow

FAIL. Product controls created Clerk workflow evidence and it persisted after close/reopen, including:

- Body: `Council DIR085-20260617050929`
- Intake: `Budget amendment DIR085-20260617050929 - ready for agenda`
- Meeting: `Regular Meeting DIR085-20260617050929`
- Motion: `Move to adopt ordinance DIR085-20260617050929 (passed)`

However the top-level adopted legislation count did not advance. The local store summary after close/reopen reported:

- `adopted_legislation`: `0`
- `meeting_bodies`: `4`
- `agenda_intakes`: `7`
- `meetings`: `4`

This fails the directive requirement to verify adopted legislation top-level count and persistence.

## Records Workflow

PASS. Product controls created and persisted Records evidence after close/reopen.

- Records request count after reopen: `6`
- Durable request evidence included `Requester DIR085-20260617050929` and `Request DIR085-20260617050929`
- The typed unreadable reference persisted in the UI: `Z:\CivicSuite\Missing\records-DIR085-20260617050929.pdf`

## Code Workflow

PASS. Product controls imported and published a Code source with a typed unreadable reference, created a Code handoff, and evidence persisted after close/reopen.

- `code_sources`: `3`
- `code_handoffs`: `4`
- Durable source evidence included `Noise ordinance DIR085-20260617050929`
- The typed unreadable reference persisted as source evidence for `code-source-DIR085-20260617050929.pdf`
- Public export evidence existed for `Ord. DIR085-20260617050929`

## Backup Now

FAIL. Product controls opened the Backup Now review and ran `Confirm Backup Now`; the review cleared and the UI did not remain stuck. A fresh backup directory was created:

`C:\Users\insty\Documents\CivicSuite Backups\civicsuite-manual-backup-1781673047-34012`

The backup copied data files, including the DIR085 code export and stored typed-reference file, but the backup root contained only `Data`. No `backup-manifest.json` was present anywhere under the backup, and no root `README.txt` was present. Because the manifest was missing, I could not verify manifest checksums or manifest `skipped_files`, and this fails the directive's backup manifest requirement.

Smallest repro:

1. Install and launch `CivicSuite_0.1.0_x64_en-US.msi` from `windows-local-msi-ci-5149e7d`.
2. Open System Health.
3. Run `Backup Now`, then `Confirm Backup Now`.
4. Observe a new backup directory under `C:\Users\insty\Documents\CivicSuite Backups`.
5. Observe the backup root contains only `Data`; `backup-manifest.json` and root `README.txt` are absent.

## Support Bundle

PASS. Product controls opened the support bundle review and ran `Confirm Create Support Bundle`; the review cleared and the UI did not remain stuck. A fresh support bundle was created:

`C:\Users\insty\Documents\CivicSuite Backups\support-bundles\civicsuite-support-bundle-1781673118-34012`

The support bundle contained `README.txt` and `support-manifest.json`. The manifest reported `file_count: 8` and `skipped_files: []`. No `collection-notes.txt` was required because the bundle was not partial.

## Repair

PASS. Product controls opened the repair review (`Review Before Repairing Local data store`) and ran `Confirm Repair`. The action completed and the app remained usable afterward.

## Close/Reopen Persistence

PASS for Records and Code typed unreadable references. PASS for Clerk nested workflow evidence. FAIL for Clerk adopted legislation top-level count, which remained `0` after close/reopen.

Store summary after close/reopen:

- `meeting_bodies`: `4`
- `meeting_members`: `4`
- `agenda_intakes`: `7`
- `meetings`: `4`
- `records_requests`: `6`
- `code_sources`: `3`
- `code_handoffs`: `4`
- `adopted_legislation`: `0`
- `audit_entries`: `122`
- `publication_events`: `5`
- `notification_events`: `15`

## Uninstall/Reinstall/Restore

PARTIAL / NOT COMPLETED. MSI uninstall/reinstall of the app package succeeded using elevated `msiexec.exe` before the product workflow. A destructive product data uninstall/reinstall/restore cycle was not completed because the fresh product-created backup failed the manifest requirement. Without a valid `backup-manifest.json`, restoring from that backup was not a valid/safe completion path for this directive.

## Final Failure Summary

Overall verdict is FAIL for two product-level reasons:

1. `Backup Now` creates a fresh backup and clears review, but the backup has no `backup-manifest.json` and no root `README.txt`.
2. Clerk adopted legislation workflow evidence persists, but the top-level `adopted_legislation` count remains `0` after action and after close/reopen.
