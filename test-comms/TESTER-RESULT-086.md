# TESTER-RESULT-086

Verdict: FAIL

Directive: `TESTER-DIRECTIVE-086.md`
Branch checked: `stage-3a-baremetal-windows`
Branch head after live remote check: `f57d0c5d82d2a6cf346c48c42c0116fec051d632`
Artifact under test: PR #192 / `work/windows-local-1-design-contract` / `84f30c4d40c32ff9255011459f94ea80052a40e0`

## Live Remote / Channel Check

PASS. Before acting, I inspected the live remote and `FETCH_HEAD`:

- `git ls-remote origin refs/heads/stage-3a-baremetal-windows`: `f57d0c5d82d2a6cf346c48c42c0116fec051d632`
- `.git/FETCH_HEAD` after fetch: `f57d0c5d82d2a6cf346c48c42c0116fec051d632 branch 'stage-3a-baremetal-windows'`

No bridge, cloud-sync, OneDrive, or old channel was used.

## Artifact Integrity

PASS. Downloaded `CivicSuite_0.1.0_x64_en-US.msi` and `CivicSuite-msi-evidence.txt` from `windows-local-msi-ci-84f30c4`.

- MSI bytes: `1645065024`
- MSI SHA-256: `65277b60254ad0f8f70f8092ac480086f39d68881e8a374e20244b5987040a83`
- Evidence bytes: `548`
- Evidence SHA-256: `c068de90cd84f75dd2394374c29b745fb1e38e5ae7242d1417f207f05b26bd3d`

The values matched the directive exactly.

## Install And Desktop Launch

PASS with host disk-space note. The first elevated install attempt returned `1603` because Windows Installer required rollback space on `C:`:

`4,014,700 KB are required, but only 1,764,556 KB are available`

I freed only prior untracked tester MSI downloads, then retried the same MSI. Install succeeded.

- Installed product code: `{E79A994B-48AE-46D4-B122-8E2061557318}`
- Installed executable: `C:\Program Files\CivicSuite\civicsuite-desktop.exe`
- Installed executable bytes: `12532736`
- Installed executable LastWriteTimeUtc: `2026-06-17T12:33:28.0000000Z`

PASS. The installed desktop app was launched only from `C:\Program Files\CivicSuite\civicsuite-desktop.exe`. The WebView target was title `CivicSuite`, URL `http://tauri.localhost/`. I did not use `http://127.0.0.1:18082/`, suite-launcher tabs, or browser module URLs.

## Runtime / Model Readiness

PASS. Runtime was started through the product System Health `Start` controls when needed.

- Managed Ollama process: `C:\Users\insty\AppData\Local\CivicSuite\runtime\ollama\ollama.exe`
- Managed model endpoint: `http://127.0.0.1:15434/api/tags`
- Model listed: `civicsuite-gemma4-12b-qat:q4_0`
- Model size: `6975878155`
- Model digest: `48042a06ea44c4abadd09e0ab706b7aa731576b8793370a6c9341d2283afcfe0`

A user-global Ollama was also present at `C:\Users\insty\AppData\Local\Programs\Ollama\ollama.exe`, but the verified model readiness was on the CivicSuite-managed port `15434`.

## Backup Now

PASS. `Backup Now` was run from installed desktop product controls. The review panel cleared/progressed and fresh backup roots were created with manifest and README.

Initial workflow backup:

- Root: `C:\Users\insty\Documents\CivicSuite Backups\civicsuite-manual-backup-1781682262-8920`
- Root files included `backup-manifest.json`, `README.txt`, `Data`, and `config`
- Manifest `file_count`: `1714`
- Manifest `skipped_files`: 1 skipped model blob, recorded as `backup file copy failed: There is not enough space on the disk. (os error 112)`

Post-adopted-legislation backup:

- Root: `C:\Users\insty\Documents\CivicSuite Backups\civicsuite-manual-backup-1781682694-8920`
- Root files included `backup-manifest.json`, `README.txt`, `Data`, and `config`
- Manifest `file_count`: `1716`
- Manifest `skipped_files`: 2

This fixes the directive 085 failure: a partial copy still produced a root `README.txt`, `backup-manifest.json`, copied evidence, and manifest `skipped_files`.

## Clerk Adopted Legislation

PASS after completing the visible prerequisite. The first adoption attempt did not change records because the product review explicitly stated `At least one minute citation is required` and `Minutes must be signed before recording adopted legislation`. I then used product controls to add a minute citation, adopt minutes, sign minutes, record adopted legislation, and archive the meeting.

After the confirmed action:

- Top-level `adopted_legislation` count: `1`
- Persisted after close/reopen: `1`
- Adopted title: `Ordinance DIR086-20260617074239`
- Meeting: `Regular Meeting DIR086-20260617074239`
- Source motion: `Move to adopt ordinance DIR086-20260617074239`
- Meeting status after archive: `archived public record`
- Publication/export evidence: `regular-meeting-dir086-20260617074239-1781682623.md`

The normalized top-level adopted-legislation index was persisted in `city-work.json`.

## Records Workflow

PASS. Records lifecycle evidence persisted after close/reopen and after restore attempt.

- `records_requests` count: `7`
- Requester: `Requester DIR086-20260617074239`
- Request summary: `Request DIR086-20260617074239`
- Typed unreadable reference: `Z:\CivicSuite\Missing\records-DIR086-20260617074239.pdf`
- Durable search/session evidence included `budget DIR086-20260617074239` and `Budget doc DIR086-20260617074239`

## Code Workflow

PASS. Code source/handoff evidence persisted after close/reopen and after restore attempt.

- `code_sources` after close/reopen: `5`
- `code_handoffs` after close/reopen: `5`
- Typed unreadable source reference: `Z:\CivicSuite\Missing\code-source-DIR086-20260617074239.pdf`
- Stored marker: `code-source-DIR086-20260617074239.pdf (typed reference marker)`
- Source SHA-256: `ba1e99d816595ece4228b3d17321b8629b2b3f6d45a10423df542589635f0f93`
- Handoff: `Clerk handoff: Noise ordinance DIR086-20260617074239`
- Clerk-adopted ordinance also created a Code draft source: `Ordinance DIR086-20260617074239`

## Support Bundle

PASS. `Create Support Bundle` was run from product controls.

- Root: `C:\Users\insty\Documents\CivicSuite Backups\support-bundles\civicsuite-support-bundle-1781682323-8920`
- Fresh files: `README.txt`, `support-manifest.json`
- Manifest `file_count`: `8`
- Manifest `skipped_files`: `[]`

## Repair

PASS. The repair review opened and `Confirm Repair` was clicked from System Health product controls. The app remained usable afterward.

## Uninstall / Reinstall / Restore

FAIL on restore. Package uninstall/reinstall succeeded, but product restore did not complete.

- Uninstalled product code: `{E79A994B-48AE-46D4-B122-8E2061557318}`
- Elevated MSI uninstall exit: `0`
- Elevated MSI reinstall exit: `0`
- Reinstalled product code: `{E79A994B-48AE-46D4-B122-8E2061557318}`
- Reinstalled executable: `C:\Program Files\CivicSuite\civicsuite-desktop.exe`

Then I launched the reinstalled desktop app and used System Health product controls:

1. `Restore Latest Backup`
2. `Confirm Restore Latest Backup`

The review correctly described:

`Creates a pre-restore safety backup, stops local services, and replaces local data/config from the latest backup manifest.`

However the restore result showed:

`Could not remove C:\Users\insty\AppData\Local\CivicSuite\Data: The process cannot access the file because it is being used by another process. (os error 32)`

`Review System Health and try the action again.`

I retried after using the product System Health `Stop` controls for services, then repeated `Restore Latest Backup` / `Confirm Restore Latest Backup`. The same restore failure remained visible:

`Could not remove C:\Users\insty\AppData\Local\CivicSuite\Data: The process cannot access the file because it is being used by another process. (os error 32)`

The durable DIR086 Clerk/Records/Code evidence was still present afterward, but that is not proof of a completed restore because the product reported it could not replace the live Data folder.

## Smallest Repro For Remaining Failure

1. Install `CivicSuite_0.1.0_x64_en-US.msi` from `windows-local-msi-ci-84f30c4`.
2. Launch `C:\Program Files\CivicSuite\civicsuite-desktop.exe`.
3. Create enough Clerk/Records/Code evidence and run `Backup Now`.
4. Verify a fresh backup root exists with `backup-manifest.json` and `README.txt`.
5. Uninstall and reinstall the same MSI.
6. Launch the reinstalled app.
7. In System Health, run `Restore Latest Backup`, then `Confirm Restore Latest Backup`.
8. Observe restore fails with `Could not remove C:\Users\insty\AppData\Local\CivicSuite\Data: The process cannot access the file because it is being used by another process. (os error 32)`.
9. Use product `Stop` controls and retry restore; the same failure remains.

## Final Summary

Directive 086 fixes the manual backup manifest/README failure and the Clerk adopted-legislation top-level persistence failure when the visible minute-citation prerequisite is satisfied. The remaining blocker is restore: product-controlled restore from the fresh product-created backup does not complete because the live CivicSuite Data folder remains locked.
