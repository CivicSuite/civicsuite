# TESTER-DIRECTIVE-093

## Communication channel

All builder/tester communication for this gate is only through the CivicSuite/civicsuite repo `test-comms` directory on branch `stage-3a-baremetal-windows`.

Do not use any old bridge folder, old cloud-sync folder, OneDrive folder, or Microsoft cloud-sync path. No old bridge/cloud-sync folder is valid for this test.

Before Codex declares `TESTER-RESULT-093.md` absent, Codex must inspect the live remote `stage-3a-baremetal-windows` branch with `git ls-remote` plus `FETCH_HEAD` after fetch. Do not rely only on a local tracking ref.

Write exactly one result file: `test-comms/TESTER-RESULT-093.md`.

## Product artifact under test

- PR: CivicSuite/civicsuite #192
- Branch: `work/windows-local-1-design-contract`
- Head: `c299d656105823cbbf495855bfa39716c577be06`
- Workflow run: `27743359758`
- Public prerelease: https://github.com/CivicSuite/civicsuite/releases/tag/windows-local-msi-ci-c299d65
- MSI asset: `CivicSuite_0.1.0_x64_en-US.msi`
- MSI SHA-256: `3903df26d8fdc1200876575edabed387bed282407cfcf9744331b968592cfe2e`
- MSI bytes: `1645151040`
- Evidence asset: `CivicSuite-msi-evidence.txt`
- Evidence SHA-256: `4a0a024bde8bd127d2ad2ac06f8dbab465293e3cf13b83da083603b4d5cf79ae`
- Evidence bytes: `548`

CI for head `c299d65` is green: `verify`, `installer-cleanroom`, and `desktop-windows-msi` succeeded; `release-lockstep-gate` skipped as expected. The installer-cleanroom run includes passing Linux archive lifecycle evidence for both clerk-core and city-core.

## Background

`TESTER-RESULT-092.md` proved the installed Windows Local Tauri desktop app surface was used and that elevated Windows Installer install, uninstall, and reinstall paths worked. It also proved artifact integrity and model/runtime readiness. The remaining product failure broadened from restore-only completion into a shared desktop lifecycle responsiveness issue:

- `Backup Now` entered `Working - Running Backup Now from the desktop app` and did not clear during the observed run; no fresh backup manifest appeared.
- Fresh Clerk, Records, and Code workflow markers appeared in the live session but were not visible after close/reopen.
- `Create Support Bundle` entered `Working - Running Create Support Bundle from the desktop app` and did not clear during the observed run; no fresh support manifest appeared.
- System Health local data store, city workflow services, task queue schema, and background work queue stayed degraded after product controls.
- After uninstall/reinstall, `Restore Latest Backup` did not return `Restore complete` or `Restore needs service start`; the app window became not responding.

PR #192 head `c299d65` fixes this by moving blocking desktop native work off the Tauri UI command thread and rendering completed System Health action results before the slower app-state/health refresh. `get_app_state`, `first_run_action`, `supervisor_action`, and `city_work_action` now run blocking filesystem/process work through `spawn_blocking` with panic-safe errors. The desktop UI now renders Supervisor action results immediately after the native action resolves, so a degraded or slow health refresh cannot leave the visible result stuck on `Working`.

Prior fixes remain in place: old `Data` / `config` cleanup after restore is deferred with a pending cleanup note, restored runtime PIDs are cleared, restore defers service restart, native command-output waits are bounded, and Postgres Start/post-restore database and task-queue migration verification runs even when the local data store TCP port is already open.

Local builder validation for `c299d65` passed:

- `cargo fmt --manifest-path desktop/src-tauri/Cargo.toml --check`
- `cargo test restore --manifest-path desktop/src-tauri/Cargo.toml -- --test-threads=1`
- `cargo test backup --manifest-path desktop/src-tauri/Cargo.toml -- --test-threads=1`
- `cargo test supervisor_command_wrapper_completes_backup_action --manifest-path desktop/src-tauri/Cargo.toml -- --test-threads=1`
- `cargo test --manifest-path desktop/src-tauri/Cargo.toml -- --test-threads=1` (131 tests)
- `npm --prefix desktop test`
- `npm --prefix desktop run test:browser -- desktop/tests/browser/model-readiness.spec.mjs desktop/tests/browser/workflow-pages.spec.mjs`
- `npm --prefix desktop run build`
- `bash scripts/verify-docs.sh`
- `python scripts/verify-deployment-profile.py --static-only`
- `python scripts/policy/check_stage_evidence.py`
- `git diff --check` with CRLF normalization warnings only

Audit evidence: `docs/audits/audit-lite-windows-supervisor-command-responsiveness-2026-06-18.md`.

Continue using only the installed Windows Local Tauri desktop application window launched by `C:\Program Files\CivicSuite\civicsuite-desktop.exe`. Do not use `http://127.0.0.1:18082/`, suite-launcher tabs, or browser module URLs such as `23080`, `23081`, `23820`, or `23865` to perform the product workflow checks.

## Required targeted checks

Use product controls in the installed desktop app window only. Do not hand-edit the CivicSuite profile, database, model files, backup folders, support bundles, runtime payloads, or process state. Do not hand-kill CivicSuite-managed processes during backup, support bundle creation, repair, restore, or service recovery; use product Stop/Start/Check/Repair controls only.

Use elevated/admin access as needed for Windows Installer and per-machine lifecycle steps, including install, uninstall, reinstall, major-upgrade removal, repair, and any other operation Windows requires to administer `C:\Program Files\CivicSuite`.

1. Verify install/artifact integrity against the SHA-256 and byte counts above.
2. Install the target MSI with elevated/admin access if Windows requires it. If an older per-machine CivicSuite install is present, remove or upgrade it through the normal elevated Windows Installer path.
3. Launch the installed desktop app window from `C:\Program Files\CivicSuite\civicsuite-desktop.exe`; verify that the visible product surface is the Windows Local Tauri desktop window, not the `18082` suite launcher browser surface.
4. Verify runtime/model readiness still reaches Ready with the CivicSuite-managed Ollama runtime and local model store. Record whether any user-global Ollama process is also present.
5. Run `Backup Now` from desktop app product controls. Verify the review state clears and the visible action result leaves `Working`. Verify the fresh backup root contains `backup-manifest.json` plus root `README.txt` and copied evidence. If any files/config copies are skipped, verify they are recorded in manifest `skipped_files` instead of preventing manifest creation.
6. Create fresh Clerk/Meetings adopted-legislation workflow evidence. Verify the persisted local store top-level `adopted_legislation` count is nonzero after close/reopen and that durable adopted legislation/publication/archive evidence remains visible.
7. Create or update fresh Records lifecycle evidence, including at least one typed unreadable file/reference, and verify that durable evidence survives close/reopen.
8. Create or update fresh Code source/handoff evidence, including at least one typed unreadable file/reference, and verify source/handoff counts and evidence persist after close/reopen.
9. Run `Create Support Bundle` from desktop app product controls. Verify the review state clears and the visible action result leaves `Working`. Verify a fresh `support-manifest.json` is created. If collection is partial, verify the support bundle records collection notes rather than leaving the UI in `Working`.
10. Complete repair where applicable, using elevated/admin access if Windows requires it. Verify product controls remain responsive even if service health is initially degraded.
11. Complete uninstall and reinstall of the same MSI with elevated/admin access.
12. Launch the reinstalled desktop app window and run `Restore Latest Backup`, then `Confirm Restore Latest Backup`, from System Health product controls.
13. Verify `Restore Latest Backup` returns `Restore needs service start`, `Restore complete`, or another bounded product result instead of staying indefinitely on `Working`.
14. Verify the desktop UI is not stuck on `Working - Running Restore Latest Backup from the desktop app` after the restore result is returned.
15. If restore reports old-folder cleanup pending for previous `Data` or `config` trees, record the exact visible text/path. This is expected to be a bounded cleanup note, not a failure by itself.
16. If the first restore attempt reports that `Data` or `config` is in use, use the product System Health `Stop` controls and retry `Restore Latest Backup` / `Confirm Restore Latest Backup` once. Do not hand-kill processes or hand-edit the profile.
17. After `Restore needs service start`, `Restore complete`, or another bounded restore result, use product `Start`, `Check`, and `Repair` controls as needed. Verify local data store, city workflow services, task queue schema, and background work queue health recover through product controls without hand-killing processes or editing the profile.
18. Verify restored durable Clerk/Records/Resident/Code evidence is available after restore. Record whether any restore message mentions old-folder cleanup, staged folders, retry behavior, service restart, service health, database/migration verification, stale runtime state, or slow health refresh.

## Result file requirements

In `test-comms/TESTER-RESULT-093.md`, include:

- Verdict: PASS or FAIL.
- Artifact SHA-256 and byte verification.
- Whether install/uninstall/reinstall/repair steps used elevated/admin access and whether Windows Installer reported any elevation issue.
- Installed product code and installed executable path.
- A clear statement that the installed Tauri desktop app window was used, or a failure that the desktop app window was not visible/reachable.
- Runtime/model readiness evidence, including whether any user-global Ollama was present.
- Backup manifest path, root README observation, copied evidence observation, whether the review panel cleared or stayed open, whether `Working` cleared to a bounded product result, and any `skipped_files` observation.
- Clerk adopted legislation top-level count after close/reopen and durable adopted legislation/publication/archive evidence.
- Records lifecycle evidence and whether typed unreadable references still produced durable product evidence after close/reopen.
- Code source/handoff counts after close/reopen and whether typed unreadable references still produced durable product evidence.
- Support bundle manifest path, freshness observation, whether the review panel cleared or stayed open, and whether `Working` cleared to a bounded product result.
- Repair outcome and whether product controls remained responsive.
- Uninstall/reinstall outcome.
- Restore outcome, including the backup root restored from, whether product Stop controls were needed before a retry, whether restore returned `Restore complete`, `Restore needs service start`, or another exact product result, whether old-folder cleanup pending was reported, and whether restored Clerk/Records/Resident/Code evidence was available afterward.
- Post-restore System Health outcome for local data store, city workflow services, task queue schema, background work queue, and the Working/action result panel after product Start/Check/Repair controls.
- Any screenshots/log excerpts needed to make a failure actionable.

If the result fails due product behavior, include the smallest reproducible sequence and any visible UI text, window/process evidence, manifest paths, backup roots, restore messages, service health output, support bundle paths, WebView responsiveness evidence, or endpoint probes. If the result fails due external elevation or host harness limits even with admin access available, state exactly which elevated step was blocked and whether product behavior was otherwise verified.
