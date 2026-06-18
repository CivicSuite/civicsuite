# Tester Result 095

- Final verdict: FAIL.
- Primary failure: after installing the `windows-local-msi-ci-17080a1` MSI and using only the installed desktop app, System Health could not recover the local PostgreSQL data store. Product Start/Check/Repair left `127.0.0.1:15432` closed, City workflow services returned degraded health, and the task queue remained blocked by PostgreSQL connection refusal.
- Secondary lifecycle failures: the MSI uninstall leg returned exit `1603`, and Restore Latest Backup failed with `Access is denied` while moving the existing Data directory.

## Remote and Artifact Verification

- Branch verified live: `origin/stage-3a-baremetal-windows`
- Remote HEAD verified with `git ls-remote` and fetch: `989f9b4ae674a8258f1c1de817491885f18799b9`
- PR head under test from directive: `17080a10a1680be8945243a4cf59325fc44d5586`
- Release under test: `https://github.com/CivicSuite/civicsuite/releases/tag/windows-local-msi-ci-17080a1`
- MSI: `CivicSuite_0.1.0_x64_en-US.msi`
  - Expected bytes: `1645151040`
  - Actual bytes: `1645151040`
  - Expected SHA-256: `845aa9dcb703dd9600f0ca1ab918426fde2672a5c19c0f9892357a99da66204c`
  - Actual SHA-256: `845aa9dcb703dd9600f0ca1ab918426fde2672a5c19c0f9892357a99da66204c`
- Evidence asset: `CivicSuite-msi-evidence.txt`
  - Expected bytes: `548`
  - Actual bytes: `548`
  - Expected SHA-256: `48a9b842462b61035688f51517b0c92e16fc35b283dce265b256493614d16b3a`
  - Actual SHA-256: `48a9b842462b61035688f51517b0c92e16fc35b283dce265b256493614d16b3a`

## Install, Launch, and App Identity

- Removed prior product `{4E2270C8-0860-46A8-9861-46FB9F54761C}`: exit `0`.
- Installed target MSI: exit `0`.
- Installed product after install: `{9F84C80C-DE53-4DD0-9B38-283B0C1B16C3}`.
- Installed app launched from `C:\Program Files\CivicSuite\civicsuite-desktop.exe`.
- Desktop identity:
  - Process: `civicsuite-desktop.exe`
  - Initial PID: `22116`
  - WebView title: `CivicSuite`
  - WebView URL: `http://tauri.localhost/`
- Local-admin sign-in succeeded using the existing product-set local admin passcode `Admin080!`. The stale bootstrap secret-file passcode was rejected.

## Model Readiness

- System Health showed the local AI model as Ready before restore:
  - Pinned model metadata: OK
  - Local model file: Found
  - Checksum verification: Verified
  - Local model runtime: OK
  - Gemma model loaded in Ollama: Loaded
  - CivicCore model registry: Registered
- CivicSuite-managed Ollama responded on `127.0.0.1:15434` before restore and listed `civicsuite-gemma4-12b-qat:q4_0`.

## Service Health Before Restore

- Product Start/Check/Repair was exercised from the installed desktop System Health surface.
- Local data store:
  - UI result after Start/Check/Repair: `Needs start`
  - Health endpoint: TCP `127.0.0.1:15432` refused
  - UI detail: installed but not responding; pid `none`
- City workflow services:
  - UI result after Start/Check/Repair: `Needs start`
  - Health endpoint: `http://127.0.0.1:15480/health` returned `503`
- Task queue schema:
  - UI result: `Needs start`
  - Reason: City workflow services not running, PostgreSQL unavailable
- Background work queue:
  - UI result became inconsistent: it showed a worker PID but remained dependent on the failed data store.
  - Log detail included `ConnectionRefusedError: [WinError 1225]` connecting to PostgreSQL.

## Backup and Support Bundle

- `Backup Now` completed from the installed desktop app.
- Fresh backup created:
  - `C:\Users\insty\Documents\CivicSuite Backups\civicsuite-manual-backup-1781801973-22116`
  - Included `backup-manifest.json`
  - Included `README.txt`
- `Create Support Bundle` completed from the installed desktop app.
- Fresh support bundle created:
  - `C:\Users\insty\Documents\CivicSuite Backups\support-bundles\civicsuite-support-bundle-1781801999-22116`
  - Included `support-manifest.json`
  - Included `health-summary.json`
  - Included selected service logs

## Clerk Workflow

- Fresh marker: `DIR095-20260618110051`
- Clerk workflow completed through the installed desktop app:
  - Meeting body saved.
  - Member saved.
  - Agenda intake submitted, reviewed, and promoted.
  - Fresh meeting created.
  - Agenda item added.
  - Notice deadline/checklist/ready actions executed.
  - Staff report, minutes draft, and passed motion recorded.
  - `Adopt Minutes` confirmed.
  - `Sign Minutes` confirmed.
  - `Record Adopted Ordinance/Resolution` confirmed.
  - `Archive Public Record` confirmed.
  - Minute citation added with the exact fresh sentence:
    `DIR095-20260618110051: On June 18, 2026, the council adopted Ordinance 2026-095 after a passed motion and signed minutes.`
- Close/reopen verification found the fresh marker in Meetings & Notices with 10 matches.

## Records Workflow

- Fresh request created with marker `DIR095-20260618110051`.
- Typed unreadable reference attached:
  - `UNREADABLE-TYPED-REFERENCE-DIR095-20260618110051::no-file-on-disk.pdf`
- Response draft saved with the marker.
- Close/reopen verification found the fresh marker in Records Requests with 7 matches.

## Code Workflow

- Fresh Code source imported with marker `DIR095-20260618110051`.
- Fresh guidance draft saved and approved.
- Fresh clerk handoff created.
- Code question answered with the marker.
- Close/reopen verification found the fresh marker in Code & Ordinances.

## Uninstall/Reinstall

- Closed the desktop app normally before the MSI lifecycle pass.
- MSI uninstall command for `{9F84C80C-DE53-4DD0-9B38-283B0C1B16C3}` returned exit `1603`.
- Reinstall command using the same downloaded target MSI returned exit `0`.
- Product code after reinstall command remained `{9F84C80C-DE53-4DD0-9B38-283B0C1B16C3}`.
- Because uninstall returned `1603`, the uninstall/reinstall lifecycle gate fails even though the subsequent install command returned `0`.

## Restore and Post-Restore Health

- Relaunched installed desktop app after the MSI lifecycle pass.
- Invoked `Restore Latest Backup` from System Health and confirmed `Confirm Restore Latest Backup`.
- Restore result: FAIL with bounded product error:
  - `restore-old-Data-1781802476-37380: Access is denied. (os error 5)`
  - UI instruction: `Review System Health and try the action again.`
- Product Start/Check/Repair was exercised after restore failure.
- Post-restore health remained degraded:
  - Local data store: `Needs start`; `127.0.0.1:15432` still refused.
  - City workflow services: `Needs start`.
  - Task queue schema: `Needs start`.
  - Background work queue: still blocked by data store connectivity.
  - Local AI model regressed to not responding after the restore attempt.

## Smallest Repro

1. Install `CivicSuite_0.1.0_x64_en-US.msi` from release `windows-local-msi-ci-17080a1`.
2. Launch `C:\Program Files\CivicSuite\civicsuite-desktop.exe` and sign in as the existing local admin.
3. Open System Health.
4. Use product controls on Local data store: Start, Check, Repair, Check.
5. Observe Local data store remains `Needs start` and `Test-NetConnection 127.0.0.1 -Port 15432` fails.
6. Use Restore Latest Backup and confirm the review.
7. Observe restore fails with `restore-old-Data-...: Access is denied. (os error 5)`.

## Evidence Files

- `directive095-evidence/remote-verification-095.json`
- `directive095-evidence/artifact-integrity-095.json`
- `directive095-evidence/uninstall-install-outcome-095.json`
- `directive095-evidence/signin-admin080-095.json`
- `directive095-evidence/service-controls-confirmed-095.json`
- `directive095-evidence/runtime-port-probes-after-repair-095.json`
- `directive095-evidence/backup-support-actions-095.json`
- `directive095-evidence/backup-support-manifest-check-095.json`
- `directive095-evidence/clerk-fresh-workflow-095.json`
- `directive095-evidence/records-fresh-workflow-095.json`
- `directive095-evidence/code-fresh-workflow-095.json`
- `directive095-evidence/close-reopen-marker-verify-095.json`
- `directive095-evidence/uninstall-reinstall-cycle-095.json`
- `directive095-evidence/restore-latest-095.json`
- `directive095-evidence/post-restore-service-controls-095.json`
