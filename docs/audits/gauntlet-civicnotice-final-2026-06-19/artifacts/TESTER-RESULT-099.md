# TESTER-RESULT-099

Verdict: PASS

Directive branch verification:

- Live `git ls-remote origin refs/heads/stage-3a-baremetal-windows`: `11d3a770762493908f2d271a2bb3dd59bb2fca29`.
- `FETCH_HEAD`: `11d3a770762493908f2d271a2bb3dd59bb2fca29`.
- Evidence: `directive099-evidence/remote-ls-remote.txt`, `fetch-head.txt`, `fetch-head-log.txt`.

Artifact integrity:

- Release asset `CivicSuite_0.1.0_x64_en-US.msi` downloaded from `windows-local-msi-ci-07917b8`.
- MSI bytes: `1645171548`.
- MSI SHA-256: `c9fa17fe5b0ce7332073389557d8c59ae75708f1fd643f1679fa7b0c0289ee14`.
- Evidence asset bytes: `578`.
- Evidence asset SHA-256: `984dad5d789707b7ae43ad2e84b2da5b30550be17905a1499dd97da3c5471d65`.
- Evidence asset contains `SameVersionMajorUpgrade=true` and `UpgradeCode=a63fc1d3-5437-5f55-89a2-fef93fb1f930`.
- GitHub artifact API recorded `civicsuite-windows-local-msi`, bytes `1640371076`.
- Evidence: `artifact-hashes.json`, `msi-evidence-asset-content.txt`, `release-assets.txt`, `artifact-run-assets.txt`.

Cleanroom start:

- Bare-metal cleanroom path used; no VM snapshot was available.
- Codex shell was not elevated.
- Before cleanup, stale same-version product remained registered:
  - ProductCode `{291F4AE6-5B07-4A8C-8F82-FCE71A20A6F6}`
  - ProductVersion `0.1.0`
  - InstallLocation `C:\Program Files\CivicSuite\`
- Cleanroom uninstall of the stale product returned `1603`; Program Files removal was denied. No CivicSuite process/service was running.
- Pending reboot state included `PendingFileRenameOperations=true`; machine was not rebooted.
- Evidence: `cleanroom-before.json`, `cleanroom-uninstall-stale-product-result.json`, `cleanroom-uninstall-stale-product.log`, `cleanroom-uninstall-log-interesting.txt`, `cleanroom-path-removal.json`, `cleanroom-after.json`.

Install and same-version major upgrade:

- Non-elevated install of the directive 099 MSI returned `1603`, with `FindRelatedProducts`, `WIX_UPGRADE_DETECTED={291F4AE6-5B07-4A8C-8F82-FCE71A20A6F6}`, `RemoveExistingProducts`, `MsiSystemRebootPending=1`, and MSI error 1730 requiring administrator removal.
- Elevated `Start-Process msiexec.exe -Verb RunAs` install returned `0`.
- Elevated install log showed same-version replacement behavior:
  - `FindRelatedProducts`
  - `WIX_UPGRADE_DETECTED={291F4AE6-5B07-4A8C-8F82-FCE71A20A6F6}`
  - `RemoveExistingProducts` return value 1
  - `UPGRADINGPRODUCTCODE={B4AB1EAC-D882-4587-B4BB-BF13BFA00953}`
  - `MsiSystemRebootPending=1`
  - `Product: CivicSuite -- Installation completed successfully.`
  - `Installation success or error status: 0`
- Registered product after install: `{B4AB1EAC-D882-4587-B4BB-BF13BFA00953}`, version `0.1.0`, install location `C:\Program Files\CivicSuite\`.
- Installed desktop binary: `C:\Program Files\CivicSuite\civicsuite-desktop.exe`, size `12789248`, SHA-256 `c8b977f414a3c202924327168496f3d4d74668ee531e56e4521888e072b4a744`.
- Evidence: `target-msi-install-result.json`, `target-msi-install-log-interesting.txt`, `target-msi-install-runas-result.json`, `target-msi-install-runas-after.json`, `target-msi-install-runas-log-interesting.txt`.

Installed desktop app identity:

- Launched only the installed desktop app from `C:\Program Files\CivicSuite\civicsuite-desktop.exe`.
- Process title: `CivicSuite`.
- WebView automation attached to the installed desktop app WebView for evidence capture; no module browser URLs, localhost module pages, or dev preview routes were used for workflow checks.
- Evidence: `desktop-launch.json`, `desktop-processes-after-launch.json`, `webview-debug-targets.json`, `webview-dom-initial.json`.

Model readiness:

- System Health showed pinned model `Gemma 4 12B QAT Q4_0`, checksum `faff1a63667fac17ac5e777f47114688fcefea96e220e211aaa8d62c2c4561f1`.
- Model file remained not downloaded: `0.0 GB of 6.5 GB`, status `Needs download`, checksum `Needs verification`.
- Bundled Ollama runtime installed and started through product controls; runtime health was OK, but `civicsuite-gemma4-12b-qat:q4_0` was not loaded and CivicCore model registry remained unregistered because the GGUF file was absent.
- No AI-generation workflow result was accepted as proof; the required Clerk/Records/Code evidence was created through non-AI product workflow controls.
- Evidence: `system-health-after-setup-model-gate.json`, `product-controls-after-sequence.json`, `post-restore-health-after-cycle.json`.

Product Start/Check/Repair and zlib runtime:

- Product controls were run for `postgres`, `python-services`, `task-queue`, `model-runtime`, and `file-storage`: Install, Start, Check, Repair, Check before restore.
- Local data store, City workflow services, Task queue schema, Background work queue, Local AI model runtime, and Local document storage reached OK/ready health.
- User runtime zlib exists: `C:\Users\insty\AppData\Local\CivicSuite\runtime\postgres\bin\zlib1.dll`, size `91648`, SHA-256 `890afa7a17fb66308e0026631070409138b157ef2773c0a41d22a76943f7aedf`.
- Program Files payload zlib exists at `C:\Program Files\CivicSuite\_up_\runtime\payload\postgres\bin\zlib1.dll` with the same hash.
- Evidence: `product-controls-after-sequence-log.json`, `product-controls-after-sequence.json`, `zlib-runtime-evidence.json`.

Backup and support bundle:

- Backup Now was confirmed from System Health and completed.
- Final fresh marker backup: `C:\Users\insty\Documents\CivicSuite Backups\civicsuite-manual-backup-1781869386-37232`.
- Backup has `backup-manifest.json` and root `README.txt`.
- A stale pre-restore safety backup already existed before final restore: `civicsuite-pre-restore-backup-1781846205-20468`.
- Create Support Bundle was confirmed from System Health and completed.
- Support bundle: `C:\Users\insty\Documents\CivicSuite Backups\support-bundles\civicsuite-support-bundle-1781869027-37232`, with `support-manifest.json`.
- Evidence: `backup-support-confirm-sequence.json`, `manual-backups-after-final-marker.json`, `backup-root-before-backup-now.json`, `backup-root-after-confirmed-backup.json`, `manifest-files-after-confirmed-actions.json`.

Fresh marker:

- `D099-FRESH-MARKER-20260619-0538`
- Evidence marker file: `directive099-evidence/fresh-marker.txt`.

Clerk adopted-legislation workflow:

- Created meeting body `Council D099-FRESH-MARKER-20260619-0538`.
- Created roster member `Member D099-FRESH-MARKER-20260619-0538`.
- Created meeting `Regular meeting D099-FRESH-MARKER-20260619-0538`.
- Added agenda item `Adopt legislation item D099-FRESH-MARKER-20260619-0538`.
- Added CivicCode handoff agenda item from `Noise ordinance source D099-FRESH-MARKER-20260619-0538`.
- Approved notice checklist and marked notice ready.
- Saved minutes draft containing exact sentence: `The council adopted the directive 099 ordinance with marker D099-FRESH-MARKER-20260619-0538.`
- Added minute citation for the exact sentence, source `Agenda packet item D099-FRESH-MARKER-20260619-0538`, access `public record`.
- Recorded passed motion `Motion to adopt ordinance D099-FRESH-MARKER-20260619-0538`.
- Adopted minutes, signed minutes with signer `Directive Tester` and attestation `Attestation D099-FRESH-MARKER-20260619-0538`.
- Recorded adopted ordinance title/text containing the marker.
- Archived public record; export path reported under `C:\Users\insty\AppData\Local\CivicSuite\Data\exports\meetings\...`.
- Close/reopen verification showed the marker, archived public record, signed minutes, minute citation, passed motion, and adopted legislation still visible.
- Evidence: `meetings-after-adopted-legislation-archive.json`, `reopen-marker-verification.json`, `post-restore-marker-verification.json`.

Records durability:

- Created records request `REQ-0001` for `Resident D099-FRESH-MARKER-20260619-0538`.
- Request summary included typed unreadable reference `C:/unreadable/D099-FRESH-MARKER-20260619-0538/request.txt`.
- Search fields included unreadable references `C:/unreadable/D099-FRESH-MARKER-20260619-0538/records-box` and `C:/unreadable/D099-FRESH-MARKER-20260619-0538/record.pdf`.
- Draft response with the marker was saved.
- Close/reopen and post-restore verification showed the records request and marker still visible.
- Evidence: `records-marker-after-actions.json`, `reopen-marker-verification.json`, `post-restore-marker-verification.json`.

Code durability:

- Imported code source `Noise ordinance source D099-FRESH-MARKER-20260619-0538`.
- Typed source reference `C:/unreadable/D099-FRESH-MARKER-20260619-0538/noise-source.pdf` was preserved as a local reference marker file with SHA-256 evidence.
- Saved and approved guidance containing the marker.
- Created clerk handoff containing the marker.
- Clerk adoption created an adopted ordinance source visible in Code after reopen and after restore.
- Evidence: `code-after-confirmed-guidance-handoff.json`, `reopen-marker-verification.json`, `post-restore-marker-verification.json`.

Uninstall/reinstall:

- Closed the desktop app through its main window before reinstall test.
- Elevated Windows Installer uninstall of `{B4AB1EAC-D882-4587-B4BB-BF13BFA00953}` completed successfully; removal status `0`, not `1603`.
- Elevated reinstall of the same directive 099 MSI completed successfully; install status `0`.
- Product after reinstall remained `{B4AB1EAC-D882-4587-B4BB-BF13BFA00953}` version `0.1.0`.
- Evidence: `normal-close-before-reopen.json`, `same-target-uninstall-runas.log`, `same-target-reinstall-runas.log`, `same-target-uninstall-reinstall-result.json`, `same-target-uninstall-reinstall-log-interesting.json`, `post-reinstall-launch-processes.json`.

Restore Latest Backup:

- Restore Latest Backup was run from System Health after reinstall.
- Restore selected fresh manual backup `C:\Users\insty\Documents\CivicSuite Backups\civicsuite-manual-backup-1781869386-37232`, not a stale `pre-restore` safety backup.
- Restore did not remain `Working` and did not hit `Access is denied`.
- Restore created pre-restore safety backup `C:\Users\insty\Documents\CivicSuite Backups\civicsuite-pre-restore-backup-1781869691-16688`.
- Restore reported local model cache preserved at `C:\Users\insty\AppData\Local\CivicSuite\Data\models`.
- Restore reported old-folder cleanup pending:
  - `C:\Users\insty\AppData\Local\CivicSuite\.civicsuite-restore-old-Data-1781869704-16688`
  - `C:\Users\insty\AppData\Local\CivicSuite\.civicsuite-restore-old-config-1781869704-16688`
- Restore left services stopped for explicit product Start/Check/Repair recovery.
- Evidence: `restore-review.txt`, `restore-after.json`, `restore-after.png`.

Post-restore service recovery:

- Used only product Start/Check/Repair controls after restore.
- Local data store OK, City workflow services OK, Task queue schema OK, Background work queue OK, Local document storage OK.
- Local AI model runtime OK, but GGUF file still absent, model not loaded, and CivicCore model registry not registered.
- Evidence: `post-restore-service-cycle-log.json`, `post-restore-health-after-cycle.json`.

Post-restore restored evidence:

- Clerk marker visible after restore: `containsMarker: true`; archived public record, signed minutes, minute citation, passed motion, adopted ordinance visible.
- Records marker visible after restore: `containsMarker: true`; `REQ-0001` and unreadable-reference request summary visible.
- Code marker visible after restore: `containsMarker: true`; imported source/guidance/handoff and adopted ordinance source visible.
- Evidence: `post-restore-marker-verification.json`, `post-restore-meetings-marker.png`, `post-restore-records-marker.png`, `post-restore-code-marker.png`.

Notes:

- The directive 099 MSI fixed the directive 098 same-version stale-registration blocker when run elevated: stale `{291F4AE6-5B07-4A8C-8F82-FCE71A20A6F6}` was detected and replaced by `{B4AB1EAC-D882-4587-B4BB-BF13BFA00953}` without reboot.
- The model file was not downloaded during this run; System Health accurately reported the model file/checksum/registry as incomplete while the runtime services and required non-AI workflows remained usable.
