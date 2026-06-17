# TESTER-RESULT-088

Verdict: FAIL

Failure class: product restore/lifecycle did not complete cleanly after elevated uninstall/reinstall. The target MSI did install and the core workflow data was visible after restore, but the product UI remained stuck at `Working - Running Restore Latest Backup from the desktop app`, and post-restore System Health still reported workflow services/task queue as not responding after product `Start`, `Check`, and `Repair` controls were used.

## Branch / communication evidence

- Live remote checked with `git ls-remote origin refs/heads/stage-3a-baremetal-windows`: `bc80949`.
- `git fetch origin stage-3a-baremetal-windows --prune` completed and `.git/FETCH_HEAD` was copied to `directive088-evidence/FETCH_HEAD.txt`.
- Wide branch scan found the actionable directive `test-comms/TESTER-DIRECTIVE-088.md`.

## Artifact verification

Target release: `windows-local-msi-ci-cce939f`

- MSI path: `directive088-evidence/CivicSuite_0.1.0_x64_en-US.msi`
- MSI bytes: `1645052736`
- MSI SHA-256: `49d438d95849ca7a1bd198113a2807b5ffb6d62ca7706a0392f2d487ac298484`
- Evidence asset bytes: `548`
- Evidence asset SHA-256: `b7467cb889119531d719a4ecfe7fb804322b1f64b01b4487aa9c8260f415e122`

Artifact integrity matched the directive exactly.

## Install / desktop surface

- Elevated/admin path used: yes. The elevated child PowerShell token reported `isAdmin: true`.
- Initial existing per-machine product `{E79A994B-48AE-46D4-B122-8E2061557318}` was removed with elevated `msiexec /x`, exit code `0`.
- Target MSI installed with elevated `msiexec /i`, exit code `0`.
- Installed product code: `{5688976F-0AA7-40C4-99F5-9B28290A76C4}`.
- Installed executable path: `C:\Program Files\CivicSuite\civicsuite-desktop.exe`.
- Installed executable bytes: `12547072`.
- Windows Installer did not report an elevation issue during 088. The old Error 1730 host blocker was cleared.
- The installed desktop app was launched from `C:\Program Files\CivicSuite\civicsuite-desktop.exe`; CDP target was `http://tauri.localhost/`, title `CivicSuite`. I did not use the `18082` launcher or browser module ports for product workflow validation.

## Runtime / model readiness

- System Health showed `Local AI model: Ready`.
- The CivicSuite-managed Ollama runtime responded at `http://127.0.0.1:15434/api/tags` and listed `civicsuite-gemma4-12b-qat:q4_0`.
- A user-global Ollama was also present during the test: `C:\Users\insty\AppData\Local\Programs\Ollama\ollama.exe` plus `ollama app.exe`. The product health evidence still pointed to the CivicSuite-managed runtime path `C:\Users\insty\AppData\Local\CivicSuite\runtime\ollama\ollama.exe`.

## Backup / support bundle

- Backup root: `C:\Users\insty\Documents\CivicSuite Backups\civicsuite-manual-backup-1781713293-15916`.
- Backup manifest: `backup-manifest.json`, created fresh.
- Root `README.txt`: present.
- Copied evidence: present, including DIR088B meeting/code export files and typed reference evidence under the backup manifest.
- `skipped_files`: present but non-fatal; the manifest recorded two skipped large model files because disk space ran out during backup copy:
  - `Data/models/gemma-4-12b-it-qat-q4_0.gguf`
  - `Data/models/ollama/blobs/sha256-faff1a63667fac17ac5e777f47114688fcefea96e220e211aaa8d62c2c4561f1`
- Support bundle root: `C:\Users\insty\Documents\CivicSuite Backups\support-bundles\civicsuite-support-bundle-1781713310-15916`.
- Support manifest: `support-manifest.json`, fresh, with `README.txt`, `health-summary.json`, `runtime-state.json`, and logs. Support bundle `skipped_files` was empty.

## Workflow persistence before reinstall

- Clerk close/reopen evidence showed durable adopted legislation/publication/archive data for `DIR088B-20260617161934`.
  - Meeting: `Regular Meeting DIR088B-20260617161934`.
  - Minute citation: readable local file reference recorded as public record.
  - Records-ready bundle: public archive hash and manifest hash visible.
  - Adopted legislation: `ordinance Ordinance DIR088B-20260617161934`.
  - Top-level meeting summary after close/reopen showed nonzero durable counts: `1 records-ready bundles`, `1 minute citations`, `1 motions`, `1 outcomes`, `1 exports`.
- Records close/reopen evidence showed `Requester DIR088B-20260617161934`, `Request DIR088B-20260617161934`, and typed unreadable/missing reference `Z:\CivicSuite\Missing\records-DIR088B-20260617161934.pdf` persisted as product evidence alongside the readable file.
- Code close/reopen evidence showed `Noise ordinance DIR088B-20260617161934`, source evidence for typed reference `code-source-DIR088B-20260617161934.pdf`, one public export, and a Clerk handoff.

## Repair / uninstall / reinstall

- Product repair was run from System Health controls before uninstall/reinstall; the product returned to usable module views and runtime/model evidence remained available.
- Elevated uninstall of target product `{5688976F-0AA7-40C4-99F5-9B28290A76C4}` succeeded with exit code `0`.
- First elevated reinstall attempt failed with MSI exit code `1603` due disk space, not elevation:

```text
Disk full: Out of disk space -- Volume: 'C:'; required space: 4,014,704 KB; available space: 3,497,664 KB. Free some disk space and retry.
```

- I removed only old untracked prior-directive evidence directories inside this repo to recover space, then reran an elevated install recovery.
- Elevated reinstall recovery succeeded with exit code `0`; product `{5688976F-0AA7-40C4-99F5-9B28290A76C4}` was installed again and `C:\Program Files\CivicSuite\civicsuite-desktop.exe` existed.

## Restore outcome

- Reinstalled desktop app relaunched from `C:\Program Files\CivicSuite\civicsuite-desktop.exe`; CDP target again showed `http://tauri.localhost/`.
- Restore source intended: latest fresh product-created backup root `C:\Users\insty\Documents\CivicSuite Backups\civicsuite-manual-backup-1781713293-15916`.
- `Restore Latest Backup` and `Confirm` were both clicked from System Health.
- The first restore attempt showed the product UI text:

```text
Working
Running Restore Latest Backup from the desktop app.
Keep CivicSuite open while the local action completes.
```

- Because the restore text remained in a working/failure-like state, I used product System Health `Stop` controls and retried `Restore Latest Backup` / `Confirm` once. No hand-kill or profile edits were used.
- Restored evidence was visible afterward:
  - Clerk: `Regular Meeting DIR088B-20260617161934`, adopted ordinance, minute citation, records-ready bundle, archive/export evidence.
  - Records: `Requester DIR088B-20260617161934`, typed unreadable/missing reference `Z:\CivicSuite\Missing\records-DIR088B-20260617161934.pdf`.
  - Resident/Public: portal data was reachable after restore; it showed restored public-record deadline/evidence entries, though not the DIR088B requester in the captured viewport.
  - Code: `Noise ordinance DIR088B-20260617161934`, typed source reference `code-source-DIR088B-20260617161934.pdf`, public export count, Clerk handoff.
- However, restore did not complete cleanly. Even after waiting, then using product `Start`, `Check`, and `Repair` controls post-restore, System Health still showed:

```text
Needs services
Task queue schema
City workflow services are not running yet, so CivicSuite cannot verify the PostgreSQL task queue schema.

Needs start
City workflow services
City workflow services is installed but is not responding to its health check.

Needs start
Background work queue
Background work queue is installed but is not responding to its health check.

Working
Running Restore Latest Backup from the desktop app.
```

- Direct endpoint check after product start/repair controls: `http://127.0.0.1:15480/health` timed out.
- Model endpoint remained OK: `http://127.0.0.1:15434/api/tags` returned `200`.
- No restore message mentioning old-folder cleanup, staged folders, or retry behavior was visible in the captured UI.

## Smallest reproducible sequence

1. Install the verified `CivicSuite_0.1.0_x64_en-US.msi` elevated.
2. Launch `C:\Program Files\CivicSuite\civicsuite-desktop.exe`.
3. Complete Clerk/Records/Code workflows with durable DIR088B evidence.
4. Run `Backup Now`; backup manifest and root README are created, with skipped large model files recorded if disk is tight.
5. Uninstall target product elevated.
6. Reinstall the same target MSI elevated.
7. Launch the reinstalled desktop app.
8. From System Health, click `Restore Latest Backup` then `Confirm`.
9. If restore remains stuck, use product `Stop` controls and retry once.
10. Observe restored module evidence is visible, but System Health remains stuck at `Working - Running Restore Latest Backup from the desktop app`, and workflow services/task queue still report not responding even after product `Start`, `Check`, and `Repair`.

Evidence files are under `directive088-evidence/`, especially:

- `artifact-hashes.json`
- `elevated-msi-088-summary.json`
- `workflow-result.json`
- `086-backup-manifest-summary.json`
- `086-support-manifest-summary.json`
- `088-reopen-meetings.txt`
- `088-reopen-records.txt`
- `088-reopen-code.txt`
- `elevated-reinstall-088-summary.json`
- `elevated-install-recovery-088-summary.json`
- `post-recovery-restore-088-summary.json`
- `088-postrestore-meetings.txt`
- `088-postrestore-records.txt`
- `088-postrestore-resident.txt`
- `088-postrestore-code.txt`
- `088-postrestore-health-after-repair-controls.txt`
