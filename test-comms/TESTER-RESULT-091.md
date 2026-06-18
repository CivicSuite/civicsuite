# TESTER-RESULT-091

Verdict: FAIL

Failure class: product restore/lifecycle still did not complete cleanly after elevated uninstall/reinstall. The target `290f8d8` MSI installed, uninstalled, and reinstalled successfully with admin elevation, backup/support manifests were created, and DIR091 Clerk/Records/Resident/Code data remained visible after restore. However, `Restore Latest Backup` still did not return `Restore complete`, `Restore needs service start`, `Restore needs service health`, or any other bounded actionable result. The product UI remained on `Working - Running Restore Latest Backup from the desktop app`, and local data store / city workflow services / task queue schema / background work queue health stayed degraded after product Stop, retry, Start, Check, and Repair controls.

## Branch / communication evidence

- Live remote checked with `git ls-remote origin refs/heads/stage-3a-baremetal-windows`: `77d12e9edfb6f8cee57e7031693885acb11ad050`.
- `git fetch --all --prune` completed and `.git/FETCH_HEAD` was copied to `directive091-evidence/FETCH_HEAD.txt`.
- The actionable directive was `test-comms/TESTER-DIRECTIVE-091.md`.

## Artifact verification

Target release: `windows-local-msi-ci-290f8d8`

- MSI path: `directive091-evidence/CivicSuite_0.1.0_x64_en-US.msi`
- MSI bytes: `1645048640`
- MSI SHA-256: `241e685bb87bfced9f52374e224bedad1ca48f3790225338d00acaee050dd965`
- Evidence asset bytes: `548`
- Evidence asset SHA-256: `9a2680af0908dc6092864157e211eec4e10fa62e993b90c1de2f16381a3ba6c0`

Artifact integrity matched the directive exactly.

## Install / desktop surface

- Elevated/admin path used: yes. The elevated PowerShell worker reported `isAdmin: true`.
- Existing product `{01014A56-8538-4308-BE11-2A0B53986647}` was removed with elevated `msiexec /x`, exit code `0`.
- Target MSI installed with elevated `msiexec /i`, exit code `0`.
- Installed product code after initial install: `{278D01BB-2CBD-4D6B-8DC1-6EB656CFED8C}`.
- Installed executable path: `C:\Program Files\CivicSuite\civicsuite-desktop.exe`.
- Installed executable bytes: `12553728`.
- Windows Installer did not report an elevation issue.
- The installed desktop app was launched from `C:\Program Files\CivicSuite\civicsuite-desktop.exe`; CDP target was `http://tauri.localhost/`, title `CivicSuite`. I did not use the `18082` launcher or browser module ports for product workflow validation.

## Runtime / model readiness

- System Health showed the local AI model as `Ready`.
- The CivicSuite-managed Ollama runtime responded at `http://127.0.0.1:15434/api/tags` and listed `civicsuite-gemma4-12b-qat:q4_0`.
- Product health evidence pointed to `C:\Users\insty\AppData\Local\CivicSuite\runtime\ollama\ollama.exe`.
- A user-global Ollama process was also present on the machine in prior runs; the readiness evidence here is from the CivicSuite-managed port/path.
- Before restore, System Health still reported `Needs services / Task queue schema`, `Local data store is installed but is not responding`, `City workflow services is installed but is not responding`, and `Background work queue is installed but is not responding`. Product Start, Check, and Repair controls were used, but these rows did not recover.

## Backup / support bundle

- Fresh backup root: `C:\Users\insty\Documents\CivicSuite Backups\civicsuite-manual-backup-1781756242-39848`.
- Backup manifest: `C:\Users\insty\Documents\CivicSuite Backups\civicsuite-manual-backup-1781756242-39848\backup-manifest.json`, created fresh.
- Root `README.txt`: present.
- Copied DIR091 evidence was present in the backup, including:
  - `Data/exports/code/noise-ordinance-dir091-20260617221623-1781756234.md`
  - `Data/exports/code/noise-ordinance-dir091-20260617221623-1781756234.md.sha256.json`
  - `Data/files/code/ord-dir091-20260617221623/noise-ordinance-dir091-20260617221623-1781756233-reference.txt`
  - `Data/files/records/req-0009/responsive-document-dir091-20260617221623-1781756219-reference.txt`
- Backup `skipped_files` recorded two large model-copy skips instead of preventing manifest creation:
  - `Data/models/gemma-4-12b-it-qat-q4_0.gguf`: disk full, OS error 112.
  - `Data/models/ollama/blobs/sha256-faff1a63667fac17ac5e777f47114688fcefea96e220e211aaa8d62c2c4561f1`: disk full, OS error 112.
- Backup/support action progress was captured after running desktop product controls. The review/action panel recorded backup and support progress and the manifests were created despite service-health warnings.
- Fresh support bundle root: `C:\Users\insty\Documents\CivicSuite Backups\support-bundles\civicsuite-support-bundle-1781756254-39848`.
- Support manifest: `C:\Users\insty\Documents\CivicSuite Backups\support-bundles\civicsuite-support-bundle-1781756254-39848\support-manifest.json`, created fresh.

## Workflow persistence before reinstall

- Clerk close/reopen evidence showed durable DIR091 meeting evidence: `Council DIR091-20260617221623`, `Regular Meeting DIR091-20260617221623`, minute citation, motion/outcome, attendance, archive evidence, and code handoff. Product text evidence contained 27 DIR091 markers after reopen.
- Top-level adopted-legislation evidence remained nonzero in the local workflow store; `city-work.json` contained 81 adopted-legislation occurrences and 90 DIR091 occurrences. Product meeting text showed DIR091 meeting/archive/publication evidence after close/reopen.
- Records close/reopen evidence showed durable DIR091 evidence:
  - `Tracking: REQ-0009`
  - `Deadline basis: CORA policy DIR091-20260617221623`
  - `Responsive document DIR091-20260617221623 typed unreadable reference DIR091-20260617221623 attached for response review`
  - readable evidence path `readable-DIR091-20260617221623.txt`.
- Code close/reopen evidence showed durable DIR091 evidence:
  - `Noise ordinance DIR091-20260617221623`
  - `Source evidence: file code-source-DIR091-20260617221623.pdf (typed reference marker); sha256 36d0290aa46e; 401 bytes`
  - `Ord. DIR091-20260617221623 - not synced - 1 public exports`.

## Repair / uninstall / reinstall

- Product System Health Start, Check, and Repair controls were used before uninstall/reinstall where applicable. Local data store / city workflow / task queue / background queue health remained degraded.
- Elevated uninstall of target product `{278D01BB-2CBD-4D6B-8DC1-6EB656CFED8C}` succeeded with exit code `0`.
- Elevated reinstall of the same target MSI succeeded with exit code `0`.
- Installed product code after reinstall: `{278D01BB-2CBD-4D6B-8DC1-6EB656CFED8C}`.
- Reinstalled executable path: `C:\Program Files\CivicSuite\civicsuite-desktop.exe`.
- Reinstalled executable bytes: `12553728`.
- Windows Installer did not report an elevation issue during uninstall or reinstall.

## Restore outcome

- Reinstalled desktop app relaunched from `C:\Program Files\CivicSuite\civicsuite-desktop.exe`; CDP target again showed `http://tauri.localhost/`.
- Restore source intended: latest fresh product-created backup root `C:\Users\insty\Documents\CivicSuite Backups\civicsuite-manual-backup-1781756242-39848`.
- `Restore Latest Backup` and `Confirm Restore Latest Backup` were clicked from System Health.
- The first restore attempt did not return a completed or bounded service result. The product UI still showed:

```text
Working
Running Restore Latest Backup from the desktop app.
```

- The automation retried once using only product controls. It clicked product Stop controls, then retried Restore Latest Backup / Confirm Restore Latest Backup, then clicked product Start, Check, and Repair controls. It recorded `stopButtonsClicked: 5`, `startButtonsClicked: 5`, `checkButtonsClicked: 10`, and `repairButtonsClicked: 5`.
- Important harness note: the retry detector matched generic setup text (`locked on`, `First admin user`), not a visible product restore error saying Data/config was in use. No hand-kill or profile/database/model/file/runtime edit was performed during restore.
- After retry and repair controls, the product still showed `Working` instead of `Restore complete`, `Restore needs service start`, or `Restore needs service health`.
- No visible restore message mentioning old-folder cleanup, staged folders, retry behavior, service restart, service health, database/migration verification, or stale `runtime-state.json` cleanup was captured.
- Direct endpoint check after product restore/start/repair controls: `http://127.0.0.1:15480/health` returned HTTP `503` with database connection refused on `127.0.0.1:15432`.
- Model endpoint remained OK: `http://127.0.0.1:15434/api/tags` returned `200` and listed `civicsuite-gemma4-12b-qat:q4_0`.

Post-restore System Health still showed:

```text
Needs services
Task queue schema
City workflow services are not running yet, so CivicSuite cannot verify the PostgreSQL task queue schema.

Needs start
Local data store
Local data store is installed but is not responding to its health check.

Needs start
City workflow services
City workflow services is installed but is not responding to its health check.

Needs start
Background work queue
Background work queue is installed but is not responding to its health check.

Working
```

Restored module evidence was available afterward:

- Clerk: DIR091 meeting/body/archive/publication evidence remained visible after restore.
- Records: DIR091 responsive document, typed unreadable/reference evidence, deadline basis, and readable evidence were visible after restore.
- Code: DIR091 noise ordinance, typed source reference, and `1 public exports` were visible after restore.
- Resident/Public: portal remained reachable and showed restored public records entries.

## Smallest reproducible sequence

1. Install the verified `CivicSuite_0.1.0_x64_en-US.msi` from release `windows-local-msi-ci-290f8d8` elevated.
2. Launch `C:\Program Files\CivicSuite\civicsuite-desktop.exe`.
3. Sign in through the local desktop UI.
4. Use product controls to verify model readiness, then run Clerk/Records/Code workflows with DIR091 durable evidence.
5. Run `Backup Now`; observe backup manifest and root README are created, with skipped large model files recorded in `skipped_files` if disk is tight.
6. Create a support bundle; observe fresh `support-manifest.json`.
7. Uninstall the target product elevated.
8. Reinstall the same target MSI elevated.
9. Launch the reinstalled desktop app.
10. From System Health, click `Restore Latest Backup` then `Confirm Restore Latest Backup`.
11. Use only product Stop/Start/Check/Repair controls.
12. Observe DIR091 Clerk/Records/Resident/Code evidence is visible, but System Health remains stuck at `Working - Running Restore Latest Backup from the desktop app`; local data store, city workflow services, task queue schema, and background work queue still report not responding; `http://127.0.0.1:15480/health` returns `503`.

Evidence files are under `directive091-evidence/`, especially:

- `artifact-hashes.json`
- `elevated-msi-091-summary.json`
- `launch-9260.json`
- `091-health-after-repair-check.txt`
- `workflow-result.json`
- `backup-support-summary.json`
- `091-reopen-meetings.txt`
- `091-reopen-records.txt`
- `091-reopen-code.txt`
- `elevated-reinstall-091-summary.json`
- `restore-091-summary.json`
- `091-restore-after-first.txt`
- `091-restore-after-retry.txt`
- `091-restore-after-repair-check.txt`
- `endpoint-checks-postrestore.json`
- `091-postrestore-meetings.txt`
- `091-postrestore-records.txt`
- `091-postrestore-resident.txt`
- `091-postrestore-code.txt`
- `091-postrestore-health.txt`
