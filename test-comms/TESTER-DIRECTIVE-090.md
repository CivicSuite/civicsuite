# TESTER-DIRECTIVE-090

## Communication channel

All builder/tester communication for this gate is only through the CivicSuite/civicsuite repo `test-comms` directory on branch `stage-3a-baremetal-windows`.

Do not use any old bridge folder, old cloud-sync folder, OneDrive folder, or Microsoft cloud-sync path. No old bridge/cloud-sync folder is valid for this test.

Before Codex declares `TESTER-RESULT-090.md` absent, Codex must inspect the live remote `stage-3a-baremetal-windows` branch with `git ls-remote` plus `FETCH_HEAD` after fetch. Do not rely only on a local tracking ref.

Write exactly one result file: `test-comms/TESTER-RESULT-090.md`.

## Product artifact under test

- PR: CivicSuite/civicsuite #192
- Branch: `work/windows-local-1-design-contract`
- Head: `557a58ee33668b2a867d9510193017631464bded`
- Workflow run: `27718667905`
- Public prerelease: https://github.com/CivicSuite/civicsuite/releases/tag/windows-local-msi-ci-557a58e
- MSI asset: `CivicSuite_0.1.0_x64_en-US.msi`
- MSI SHA-256: `49782f0d903b5d22f00bbfe8f2c82d0d476f1e5267744f66950aa6a02a107d32`
- MSI bytes: `1645077312`
- Evidence asset: `CivicSuite-msi-evidence.txt`
- Evidence SHA-256: `43060964b8d45ec8d0b7f3fab280c1bd78de7c71e3287b856e4e1e30eb8fe094`
- Evidence bytes: `548`

CI for head `557a58e` is green: `verify`, `installer-cleanroom`, and `desktop-windows-msi` succeeded; `release-lockstep-gate` skipped as expected. The installer-cleanroom run includes passing Linux archive lifecycle evidence for both clerk-core and city-core.

## Background

`TESTER-RESULT-089.md` proved elevated install, uninstall, reinstall, backup manifest/README creation, adopted legislation persistence, Records/Code durability, support bundle creation, repair, and post-restore data visibility.

The remaining product failure from 089 was restore-after-reinstall service completion:

- `Restore Latest Backup` copied enough restored data that Clerk, Records, and Code evidence was visible afterward.
- The product UI stayed stuck at `Working - Running Restore Latest Backup from the desktop app`.
- System Health still reported local data store, workflow services, task queue schema, and background work queue health as degraded after product `Stop`, restore retry, `Start`, `Check`, and `Repair` controls.
- Direct workflow service health at `http://127.0.0.1:15480/health` returned `503 Server Unavailable`, while the model endpoint stayed OK.
- The fresh backup manifest/README behavior and support bundle manifest behavior remained green.

PR #192 head `557a58e` fixes this product behavior by bounding native command-output waits used by local database setup and city-core migrations, so a stuck post-restore helper returns an explicit product result instead of leaving the desktop review panel in progress. It also makes `Start` and post-restore startup run PostgreSQL database and task-queue migration verification even when the local data store TCP port is already open, so a restored profile with a missing task queue schema is repaired instead of treated as healthy.

Continue using only the installed Windows Local Tauri desktop application window launched by `C:\Program Files\CivicSuite\civicsuite-desktop.exe`. Do not use `http://127.0.0.1:18082/`, suite-launcher tabs, or browser module URLs such as `23080`, `23081`, `23820`, or `23865` to perform the product workflow checks.

## Required targeted checks

Use product controls in the installed desktop app window only. Do not hand-edit the CivicSuite profile, database, model files, backup folders, support bundles, runtime payloads, or process state. Do not hand-kill CivicSuite-managed processes during restore; use product Stop/Start/Check/Repair controls only.

Use elevated/admin access as needed for Windows Installer and per-machine lifecycle steps, including install, uninstall, reinstall, major-upgrade removal, repair, and any other operation Windows requires to administer `C:\Program Files\CivicSuite`.

1. Verify install/artifact integrity against the SHA-256 and byte counts above.
2. Install the target MSI with elevated/admin access if Windows requires it. If an older per-machine CivicSuite install is present, remove or upgrade it through the normal elevated Windows Installer path.
3. Launch the installed desktop app window from `C:\Program Files\CivicSuite\civicsuite-desktop.exe`; verify that the visible product surface is the Windows Local Tauri desktop window, not the `18082` suite launcher browser surface.
4. Verify runtime/model readiness still reaches Ready with the CivicSuite-managed Ollama runtime and local model store.
5. Run `Backup Now` from desktop app product controls. Verify the review state clears or records action progress, then verify the fresh backup root contains `backup-manifest.json` plus root `README.txt` and copied evidence. If any files/config copies are skipped, verify they are recorded in manifest `skipped_files` instead of preventing manifest creation.
6. Verify the persisted local store top-level `adopted_legislation` count remains nonzero after close/reopen while durable adopted legislation/publication/archive evidence remains visible.
7. Recheck Records lifecycle evidence, including at least one typed unreadable file/reference, and verify that durable evidence still survives close/reopen.
8. Recheck Code source/handoff evidence, including at least one typed unreadable file/reference, and verify source/handoff counts still persist after close/reopen.
9. Create a support bundle from desktop app product controls and verify fresh `support-manifest.json` creation still passes.
10. Complete repair where applicable, using elevated/admin access if Windows requires it.
11. Complete uninstall and reinstall of the same MSI with elevated/admin access.
12. Launch the reinstalled desktop app window and run `Restore Latest Backup`, then `Confirm Restore Latest Backup`, from System Health product controls.
13. Verify `Restore Latest Backup` returns a completed or bounded product result instead of staying indefinitely on Working. Passing restore outcomes are `Restore complete`, or a concrete `Restore needs service start` / `Restore needs service health` result followed by successful recovery through product Start/Check/Repair controls.
14. If the first restore attempt reports that `Data` or `config` is in use, use the product System Health `Stop` controls and retry `Restore Latest Backup` / `Confirm Restore Latest Backup` once. Do not hand-kill processes or hand-edit the profile.
15. Verify workflow services and task queue health recover through product controls after restore. Specifically, System Health should no longer be stuck on `Working - Running Restore Latest Backup from the desktop app`, city workflow services should respond to health, and task queue schema/background work queue health should recover or return a concrete product error.
16. Verify restored durable Clerk/Records/Resident/Code evidence is available after restore. Record whether any restore message mentions old-folder cleanup, staged folders, retry behavior, service restart, service health, database/migration verification, or stale runtime state.

## Result file requirements

In `test-comms/TESTER-RESULT-090.md`, include:

- Verdict: PASS or FAIL.
- Artifact SHA-256 and byte verification.
- Whether install/uninstall/reinstall/repair steps used elevated/admin access and whether Windows Installer reported any elevation issue.
- Installed product code and installed executable path.
- A clear statement that the installed Tauri desktop app window was used, or a failure that the desktop app window was not visible/reachable.
- Runtime/model readiness evidence, including whether any user-global Ollama was present.
- Backup manifest path, root README observation, copied evidence observation, whether the review panel cleared or stayed open, any action progress/Working evidence, and any `skipped_files` observation.
- Clerk adopted legislation top-level count after close/reopen and durable adopted legislation/publication/archive evidence.
- Records lifecycle evidence and whether typed unreadable references still produced durable product evidence.
- Code source/handoff counts after close/reopen and whether typed unreadable references still produced durable product evidence.
- Support bundle manifest path and freshness observation.
- Repair outcome.
- Uninstall/reinstall outcome.
- Restore outcome, including the backup root restored from, whether product Stop controls were needed before a retry, whether restore returned `Restore complete`, `Restore needs service start`, `Restore needs service health`, or another exact product result, and whether restored Clerk/Records/Resident/Code evidence was available afterward.
- Post-restore System Health outcome for city workflow services, task queue schema, background work queue, and the Working/action result panel.
- Any screenshots/log excerpts needed to make a failure actionable.

If the result fails due product behavior, include the smallest reproducible sequence and any visible UI text, window/process evidence, manifest paths, backup roots, restore messages, service health output, or support bundle paths. If the result fails due external elevation or host harness limits even with admin access available, state exactly which elevated step was blocked and whether product behavior was otherwise verified.
