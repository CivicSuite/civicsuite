# Tester Result 096

- Verdict: FAIL.
- Primary failure: after installing the PR #192 MSI and using only the installed desktop app, product System Health controls could not recover Local data store or City workflow services. Local data store remained `Needs start`, City workflow services remained `Needs start`, task queue schema remained blocked by services, and TCP probes for `127.0.0.1:15432` and `127.0.0.1:15480` stayed closed.
- Secondary restore failure: Restore Latest Backup again failed moving the live `Data` directory with `Access is denied`.
- Fixed from Result 095: normal desktop close followed by elevated MSI uninstall/reinstall of the same target MSI completed successfully; uninstall avoided `1603`.

## Remote and Directive Verification

- Branch verified live: `origin/stage-3a-baremetal-windows`
- `git ls-remote origin refs/heads/stage-3a-baremetal-windows`: `fb2f5031524a13a73a90c57eee527d619b41924d`
- `FETCH_HEAD` after fetch: `fb2f5031524a13a73a90c57eee527d619b41924d`
- New directive read from `test-comms/TESTER-DIRECTIVE-096.md`.
- Result file requested by directive: `test-comms/TESTER-RESULT-096.md`

## Artifact Integrity

- PR head under test: `ae0cfb2c1c7ae88097df8f81e6cd236738b006d1`
- Release under test: `https://github.com/CivicSuite/civicsuite/releases/tag/windows-local-msi-ci-ae0cfb2`
- Workflow run: `27778048322`
- MSI: `CivicSuite_0.1.0_x64_en-US.msi`
  - Expected bytes: `1645196096`
  - Actual bytes: `1645196096`
  - Expected SHA-256: `4b290b77c2f8da5ca9e44ad3af6ab69abc3b620e5421a62b255a48e37e2c0b37`
  - Actual SHA-256: `4b290b77c2f8da5ca9e44ad3af6ab69abc3b620e5421a62b255a48e37e2c0b37`
- Evidence asset: `CivicSuite-msi-evidence.txt`
  - Expected bytes: `548`
  - Actual bytes: `548`
  - Expected SHA-256: `8434b0135596c63d0639b40a754d09eb790fac42c2b8339d4b3cea4e7562afb4`
  - Actual SHA-256: `8434b0135596c63d0639b40a754d09eb790fac42c2b8339d4b3cea4e7562afb4`

## Install and Elevation Evidence

- Codex worker integrity: not administrator.
- Non-elevated removal of prior product `{9F84C80C-DE53-4DD0-9B38-283B0C1B16C3}` failed with MSI exit `1603`; log showed `Error 1730. You must be an Administrator to remove this application`.
- Elevated Windows Installer removal of prior product `{9F84C80C-DE53-4DD0-9B38-283B0C1B16C3}` succeeded with exit `0`.
- Initial elevated target MSI install failed with exit `1603` due low disk:
  - MSI log: `Disk full: Out of disk space -- Volume: 'C:'; required space: 4,015,244 KB; available space: 1,914,420 KB.`
- Disk cleanup used: product-lifecycle cleanup of stale old local runtime/stage data plus NTFS compression of existing evidence/runtime/model-cache files. The model cache was preserved.
- Elevated retry install then succeeded with exit `0`.
- Installed product code after target install: `{4B70E3FA-F1D4-48CD-BB0B-344FDFDA8286}`.
- Installed app path existed and was launched from `C:\Program Files\CivicSuite\civicsuite-desktop.exe`.

## Installed Desktop App Identity

- Installed desktop process: `civicsuite-desktop.exe`
- First target install launch PID: `42824`
- Post-reinstall launch PID: `11712`
- WebView title: `CivicSuite`
- WebView URL: `http://tauri.localhost/`
- All workflow and health checks below were driven through the installed desktop app WebView surface.

## Model Readiness

- Local AI model recovered to `Ready` after product `Install`, `Start`, `Check`, `Repair`, `Check` controls.
- Final post-restore System Health model evidence:
  - Pinned model metadata: OK
  - Local model file: Found
  - Checksum verification: Verified
  - Local model runtime: OK
  - Gemma model loaded in Ollama: Loaded
  - CivicCore model registry: Registered
- Model runtime probe: `127.0.0.1:15434` open.
- Model cache was preserved during disk cleanup; no model-cache skip caused this failure.

## Product Start/Check/Repair Before Restore

- Product controls exercised from installed desktop System Health:
  - Local data store: `Check`, `Install`, `Start`, `Check`, `Repair`, `Check`, then slower `Start`, `Check`, `Repair`, `Start`, `Check`.
  - City workflow services: `Check`, `Install`, `Start`, `Check`, `Repair`, `Check`, then slower `Start`, `Check`, `Repair`, `Start`, `Check`.
  - Background work queue: `Check`, `Install`, `Start`, `Check`, `Repair`, `Check`, then slower `Start`, `Check`, `Repair`, `Start`, `Check`.
  - Task queue schema: `Check`, `Install`, `Start`, `Check`, `Repair`, `Check`, then slower `Check`, `Repair`, `Check`.
  - Local AI model: slower `Install`, `Start`, `Check`, `Repair`, `Check`.
- Final pre-restore status:
  - Local data store: `Needs start`; `binary_present true`; pid `none`; TCP `127.0.0.1:15432` closed.
  - City workflow services: `Needs start`; `binary_present true`; pid `none`; `127.0.0.1:15480` closed.
  - Task queue schema: `Needs services`; endpoint `http://127.0.0.1:15480/health`; `http_status none`.
  - Background work queue: `Needs start`; pid `none`.
  - Local AI model: `OK` / ready.
- Product controls did not recover PostgreSQL or City workflow services without hand-killing processes or editing the profile.

## Backup and Support Bundle

- `Backup Now` was run from the installed desktop app, confirmed in the product dialog, left `Working`, and returned `Backup complete`.
- Fresh backup root:
  - `C:\Users\insty\Documents\CivicSuite Backups\civicsuite-manual-backup-1781815893-42824`
  - `backup-manifest.json`: present
  - `README.txt`: present
- `Create Support Bundle` was run from the installed desktop app, confirmed in the product dialog, and created a fresh support bundle.
- Fresh support bundle:
  - `C:\Users\insty\Documents\CivicSuite Backups\support-bundles\civicsuite-support-bundle-1781816023-42824`
  - `support-manifest.json`: present

## Clerk, Records, and Code Workflow Evidence

- Fresh Clerk adopted-legislation workflow: NOT RUN.
- Fresh Records durability workflow: NOT RUN.
- Fresh Code durability workflow: NOT RUN.
- Reason: the required pre-restore gate failed first. Local data store and City workflow services remained unhealthy after product Start/Check/Repair controls, so database-backed module workflows could not be honestly executed through the installed desktop app.
- Restored Clerk/Records/Code visibility after restore: NOT REACHED because restore failed with `Access is denied`.

## Normal Close, MSI Uninstall, and Reinstall

- Closed the installed desktop app normally with its main window close path before MSI lifecycle.
- Elevated MSI uninstall of `{4B70E3FA-F1D4-48CD-BB0B-344FDFDA8286}` returned exit `0`.
- This uninstall avoided the Result 095 `1603` failure.
- Elevated reinstall of the same verified target MSI returned exit `0`.
- Product code after reinstall remained `{4B70E3FA-F1D4-48CD-BB0B-344FDFDA8286}`.
- Reinstalled desktop app launched successfully from `C:\Program Files\CivicSuite\civicsuite-desktop.exe`.

## Restore Latest Backup

- `Restore Latest Backup` was invoked from installed desktop System Health and confirmed with `Confirm Restore Latest Backup`.
- Restore left `Working` and then returned a bounded product failure, not a hang:
  - `Could not move C:\Users\insty\AppData\Local\CivicSuite\Data to C:\Users\insty\AppData\Local\CivicSuite\.civicsuite-restore-old-Data-1781816333-11712: Access is denied. (os error 5)`
  - UI instruction: `Review System Health and try the action again.`
- This is not an acceptable directive status (`Restore needs service start` or `Restore complete`); it repeats the `Access is denied` restore class from Result 095.
- Restore staging directory remained:
  - `C:\Users\insty\AppData\Local\CivicSuite\.civicsuite-restore-stage-Data-1781816332-11712`

## Post-Restore Service Health

- Product Start/Check/Repair controls were exercised again after the restore failure.
- Final post-restore status:
  - Local data store: `Needs start`; TCP `127.0.0.1:15432` closed.
  - City workflow services: `Needs start`; TCP `127.0.0.1:15480` closed.
  - Task queue schema: `Needs services`; City workflow services not running.
  - Background work queue: `Needs start`.
  - Local AI model: `Ready`; TCP `127.0.0.1:15434` open.
- Post-restore product controls did not recover the data store or City workflow services.

## Smallest Repro

1. Verify and install `CivicSuite_0.1.0_x64_en-US.msi` from release `windows-local-msi-ci-ae0cfb2`.
2. Launch `C:\Program Files\CivicSuite\civicsuite-desktop.exe`.
3. Open System Health.
4. Use product controls on Local data store: `Install`, `Start`, `Check`, `Repair`, `Start`, `Check`.
5. Observe Local data store remains `Needs start` with `127.0.0.1:15432` closed.
6. Use product controls on City workflow services: `Install`, `Start`, `Check`, `Repair`, `Start`, `Check`.
7. Observe City workflow services remains `Needs start` with `127.0.0.1:15480` closed.
8. Run Backup Now and confirm it completes.
9. Close the app normally, uninstall and reinstall the same MSI successfully.
10. Relaunch the app and run Restore Latest Backup.
11. Observe restore fails moving the live `Data` directory with `Access is denied`.

## Evidence Files

- `directive096-evidence/remote-verification-096.json`
- `directive096-evidence/preinstall-host-state-096.json`
- `directive096-evidence/preinstall-close-products-096.json`
- `directive096-evidence/preinstall-uninstall-096.json`
- `directive096-evidence/preinstall-uninstall-elevated-096.json`
- `directive096-evidence/artifact-integrity-096.json`
- `directive096-evidence/install-outcome-096.json`
- `directive096-evidence/disk-cleanup-096.json`
- `directive096-evidence/ntfs-compression-stop-096.json`
- `directive096-evidence/install-retry2-outcome-096.json`
- `directive096-evidence/launch-debug-096.json`
- `directive096-evidence/initial-ui-096.json`
- `directive096-evidence/service-controls-with-install-096.json`
- `directive096-evidence/service-final-with-install-extract-096.json`
- `directive096-evidence/service-recovery-slow-096.json`
- `directive096-evidence/service-recovery-slow-final-096.json`
- `directive096-evidence/backup-support-confirm-096.json`
- `directive096-evidence/backup-support-confirm-files-096.json`
- `directive096-evidence/support-confirm-final-096.json`
- `directive096-evidence/support-confirm-files-096.json`
- `directive096-evidence/uninstall-reinstall-cycle-096.json`
- `directive096-evidence/post-reinstall-launch-096.json`
- `directive096-evidence/restore-latest-096.json`
- `directive096-evidence/restore-latest-extract-096.json`
- `directive096-evidence/post-restore-service-controls-096.json`
- `directive096-evidence/post-restore-service-extract-096.json`
- MSI logs:
  - `directive096-evidence/msiexec-uninstall-preinstall-096.log`
  - `directive096-evidence/msiexec-uninstall-preinstall-elevated-096.log`
  - `directive096-evidence/msiexec-install-096.log`
  - `directive096-evidence/msiexec-install-retry-096.log`
  - `directive096-evidence/msiexec-install-retry2-096.log`
  - `directive096-evidence/msiexec-uninstall-cycle-096.log`
  - `directive096-evidence/msiexec-reinstall-cycle-096.log`
