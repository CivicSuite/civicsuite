# TESTER-RESULT-089

Verdict: FAIL

Failure class: product restore/lifecycle still did not complete cleanly after elevated uninstall/reinstall. The target MSI installed, uninstalled, and reinstalled successfully with admin elevation, and DIR089 Clerk/Records/Code evidence was visible after restore. However, `Restore Latest Backup` never returned `Restore complete`, `Restore needs service start`, or `Restore needs service health`; the System Health action panel remained stuck on `Working`, and local data store / city workflow / background queue health stayed degraded after product `Stop`, retry, `Start`, `Check`, and `Repair` controls.

## Branch / communication evidence

- Live remote checked with `git ls-remote origin refs/heads/stage-3a-baremetal-windows`: `7df3bc3`.
- `git fetch --all --prune` completed and `.git/FETCH_HEAD` was copied to `directive089-evidence/FETCH_HEAD.txt`.
- Wide branch scan found the actionable directive `test-comms/TESTER-DIRECTIVE-089.md`.

## Artifact verification

Target release: `windows-local-msi-ci-c695e22`

- MSI path: `directive089-evidence/CivicSuite_0.1.0_x64_en-US.msi`
- MSI bytes: `1645060928`
- MSI SHA-256: `29915da8354d469fe07e0a527d907c059b28afaac10a035b572e947db0d59d82`
- Evidence asset bytes: `548`
- Evidence asset SHA-256: `6fdfe300dc62b4a60becf7c0072bb71e7aebde24cd8e8ce43636aab5f82b5655`

Artifact integrity matched the directive exactly.

## Install / desktop surface

- Elevated/admin path used: yes. The elevated child PowerShell token reported `isAdmin: true`.
- Existing per-machine product `{5688976F-0AA7-40C4-99F5-9B28290A76C4}` was removed with elevated `msiexec /x`, exit code `0`.
- Target MSI installed with elevated `msiexec /i`, exit code `0`.
- Installed product code after initial install: `{6EF0991A-CA52-49B0-96D3-B70953E3F1E2}`.
- Installed executable path: `C:\Program Files\CivicSuite\civicsuite-desktop.exe`.
- Installed executable bytes: `12555264`.
- Windows Installer did not report an elevation issue.
- The installed desktop app was launched from `C:\Program Files\CivicSuite\civicsuite-desktop.exe`; CDP target was `http://tauri.localhost/`, title `CivicSuite`. I did not use the `18082` launcher or browser module ports for product workflow validation.

## Runtime / model readiness

- System Health showed `Local AI model: Ready`.
- The CivicSuite-managed Ollama runtime responded at `http://127.0.0.1:15434/api/tags` and listed `civicsuite-gemma4-12b-qat:q4_0`.
- A user-global Ollama was also present during the test: `C:\Users\insty\AppData\Local\Programs\Ollama\ollama.exe` plus `ollama app.exe`. Product health evidence still pointed to the CivicSuite-managed runtime path `C:\Users\insty\AppData\Local\CivicSuite\runtime\ollama\ollama.exe`.
- City workflow service health was already degraded before the fresh DIR089 restore run: System Health reported `Needs services / Task queue schema` and `City workflow services is installed but is not responding`. Product `Start`, `Check`, and `Repair` controls were used before the backup/reinstall sequence, but city workflow health did not recover.

## Backup / support bundle

- Fresh backup root: `C:\Users\insty\Documents\CivicSuite Backups\civicsuite-manual-backup-1781726374-30880`.
- Backup manifest: `backup-manifest.json`, created fresh.
- Root `README.txt`: present.
- Backup manifest file count: `1703`.
- Copied DIR089 evidence was present in the manifest, including:
  - `Data/exports/code/noise-ordinance-dir089-20260617135838-1781726367.md`
  - `Data/exports/code/noise-ordinance-dir089-20260617135838-1781726367.md.sha256.json`
  - `Data/files/code/ord-dir089-20260617135838/noise-ordinance-dir089-20260617135838-1781726365-reference.txt`
  - `Data/files/records/req-0009/responsive-document-dir089-20260617135838-1781726353-reference.txt`
- Backup `skipped_files` recorded two large model-copy skips instead of preventing manifest creation:
  - `Data/models/gemma-4-12b-it-qat-q4_0.gguf`: `There is not enough space on the disk. (os error 112)`
  - `Data/models/ollama/blobs/sha256-faff1a63667fac17ac5e777f47114688fcefea96e220e211aaa8d62c2c4561f1`: same disk-space reason.
- Backup/support action evidence was captured after running desktop product controls. The backup manifest and support bundle were created despite the service-health warnings.
- Fresh support bundle root: `C:\Users\insty\Documents\CivicSuite Backups\support-bundles\civicsuite-support-bundle-1781726385-30880`.
- Support manifest: `support-manifest.json`, fresh, with `README.txt`, `health-summary.json`, `runtime-state.json`, and logs. Support bundle `skipped_files` was empty.

## Workflow persistence before reinstall

- Clerk close/reopen evidence showed durable DIR089 meeting evidence:
  - Body: `Council DIR089-20260617135838`.
  - Roster member: `Member DIR089-20260617135838`.
  - Intake: `Budget amendment DIR089-20260617135838`.
  - Meeting: `Regular Meeting DIR089-20260617135838`.
  - Minute citation: readable local file reference recorded as public record.
  - Attendance/motion/outcome: `Move to adopt ordinance DIR089-20260617135838`, passed.
  - Clerk handoff: `Noise ordinance DIR089-20260617135838`.
- The visible meeting summary after close/reopen showed nonzero durable counts for `1 minute citations`, `1 motions`, and `1 outcomes`, but the captured DIR089 meeting view did not show a top-level `adopted_legislation` entry or records-ready bundle/export for DIR089. The attempted adopted ordinance/motion evidence persisted, but top-level adopted legislation/publication/archive evidence was not confirmed for DIR089 in the captured viewport.
- Records close/reopen evidence showed durable DIR089 product evidence:
  - `Responsive document DIR089-20260617135838`.
  - `Deadline basis: CORA policy DIR089-20260617135838`.
  - Typed unreadable/reference evidence persisted: `Responsive document DIR089-20260617135838 typed unreadable reference DIR089-20260617135838 attached for response review`.
  - Readable evidence persisted: `budget DIR089-20260617135838 Budget doc DIR089-20260617135838`.
- Code close/reopen evidence showed:
  - `Noise ordinance DIR089-20260617135838`.
  - `Source evidence: file code-source-DIR089-20260617135838.pdf (typed reference marker); sha256 66eb1fcdc5b7; 401 bytes`.
  - `Ord. DIR089-20260617135838 - not synced - 1 public exports`.
  - The typed source reference produced durable product evidence and the public export count persisted.

## Repair / uninstall / reinstall

- Product System Health `Start`, `Check`, and `Repair` controls were used before uninstall/reinstall where applicable. The product remained usable enough for module views, backup, and support bundle creation, but city workflow service health remained degraded.
- Elevated uninstall of target product `{6EF0991A-CA52-49B0-96D3-B70953E3F1E2}` succeeded with exit code `0`.
- Elevated reinstall of the same target MSI succeeded with exit code `0`.
- Installed product code after reinstall: `{6EF0991A-CA52-49B0-96D3-B70953E3F1E2}`.
- Reinstalled executable path: `C:\Program Files\CivicSuite\civicsuite-desktop.exe`.
- Reinstalled executable bytes: `12555264`.
- Windows Installer did not report an elevation issue during uninstall or reinstall.

## Restore outcome

- Reinstalled desktop app relaunched from `C:\Program Files\CivicSuite\civicsuite-desktop.exe`; CDP target again showed `http://tauri.localhost/`.
- Restore source intended: latest fresh product-created backup root `C:\Users\insty\Documents\CivicSuite Backups\civicsuite-manual-backup-1781726374-30880`.
- `Restore Latest Backup` and `Confirm Restore Latest Backup` were clicked from System Health.
- The first restore attempt did not return a completed or bounded service result. The product UI still showed:

```text
Working
Running Restore Latest Backup from the desktop app.
```

- Because restore remained in the working state and services were still unhealthy, I used only product System Health controls: `Stop` buttons, then one restore retry, then product `Start`, `Check`, and `Repair` controls. The automation recorded `stopButtonsClicked: 5`, `startButtonsClicked: 5`, `checkButtonsClicked: 10`, and `repairButtonsClicked: 5`. I did not hand-kill processes or hand-edit the CivicSuite profile/database/model/files/backup/runtime state.
- After retry and repair controls, the product still showed `Working` instead of `Restore complete`, `Restore needs service start`, or `Restore needs service health`.
- No visible restore message mentioning old-folder cleanup, staged folders, retry behavior, service restart, service health, or stale `runtime-state.json` cleanup was captured.
- Direct endpoint check after product restore/start/repair controls: `http://127.0.0.1:15480/health` returned HTTP `503 Server Unavailable`.
- Model endpoint remained OK: `http://127.0.0.1:15434/api/tags` returned `200`.

Post-restore System Health still showed:

```text
Task queue schema
City workflow services are not running yet, so CivicSuite cannot verify the PostgreSQL task queue schema.

Local data store is installed but is not responding to its health check.

City workflow services is installed but is not responding to its health check.

Background work queue is installed but is not responding to its health check.

Working
```

Restored module evidence was partially available afterward:

- Clerk: DIR089 body, member, meeting, minute citation, motion, attendance/outcome, and Code handoff were visible after restore.
- Records: DIR089 responsive document, typed unreadable/reference evidence, and readable evidence were visible after restore.
- Code: DIR089 noise ordinance, typed source reference, and `1 public exports` were visible after restore.
- Resident/Public: the portal was reachable after restore, but the captured viewport showed older public deadline entries and did not show DIR089 resident/public evidence.

## Smallest reproducible sequence

1. Install the verified `CivicSuite_0.1.0_x64_en-US.msi` elevated.
2. Launch `C:\Program Files\CivicSuite\civicsuite-desktop.exe`.
3. Use product controls to verify model readiness, then run Clerk/Records/Code workflows with DIR089 durable evidence.
4. Run `Backup Now`; observe backup manifest and root README are created, with skipped large model files recorded in `skipped_files` if disk is tight.
5. Create a support bundle; observe fresh `support-manifest.json`, README, health summary, runtime state, and logs.
6. Uninstall the target product elevated.
7. Reinstall the same target MSI elevated.
8. Launch the reinstalled desktop app.
9. From System Health, click `Restore Latest Backup` then `Confirm Restore Latest Backup`.
10. If restore remains stuck, use product `Stop` controls and retry once.
11. Use product `Start`, `Check`, and `Repair` controls.
12. Observe DIR089 Clerk/Records/Code evidence is visible, but System Health remains stuck at `Working - Running Restore Latest Backup from the desktop app`; city workflow services, task queue schema, local data store, and background work queue still report not responding; `http://127.0.0.1:15480/health` returns `503`.

Evidence files are under `directive089-evidence/`, especially:

- `artifact-hashes.json`
- `elevated-msi-089-summary.json`
- `launch-9240.json`
- `health-baseline.txt`
- `health-after-start-check.txt`
- `health-after-repair-check.txt`
- `workflow-result.json`
- `backup-support-summary.json`
- `089-reopen-meetings.txt`
- `089-reopen-records.txt`
- `089-reopen-code.txt`
- `elevated-reinstall-089-summary.json`
- `restore-089-summary.json`
- `089-restore-after-first.txt`
- `089-restore-after-retry.txt`
- `089-restore-after-repair-check.txt`
- `089-postrestore-meetings.txt`
- `089-postrestore-records.txt`
- `089-postrestore-resident.txt`
- `089-postrestore-code.txt`
- `089-postrestore-health.txt`
