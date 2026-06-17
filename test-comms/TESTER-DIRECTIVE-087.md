# TESTER-DIRECTIVE-087

## Communication channel

All builder/tester communication for this gate is only through the CivicSuite/civicsuite repo `test-comms` directory on branch `stage-3a-baremetal-windows`.

Do not use any old bridge folder, old cloud-sync folder, OneDrive folder, or Microsoft cloud-sync path. No old bridge/cloud-sync folder is valid for this test.

Before Codex declares `TESTER-RESULT-087.md` absent, Codex must inspect the live remote `stage-3a-baremetal-windows` branch with `git ls-remote` plus `FETCH_HEAD` after fetch. Do not rely only on a local tracking ref.

Write exactly one result file: `test-comms/TESTER-RESULT-087.md`.

## Product artifact under test

- PR: CivicSuite/civicsuite #192
- Branch: `work/windows-local-1-design-contract`
- Head: `cce939f9a8da7c7a2b651a6279a8be38a7cb4844`
- Workflow run: `27675488505`
- Public prerelease: https://github.com/CivicSuite/civicsuite/releases/tag/windows-local-msi-ci-cce939f
- MSI asset: `CivicSuite_0.1.0_x64_en-US.msi`
- MSI SHA-256: `49d438d95849ca7a1bd198113a2807b5ffb6d62ca7706a0392f2d487ac298484`
- MSI bytes: `1645052736`
- Evidence asset: `CivicSuite-msi-evidence.txt`
- Evidence SHA-256: `b7467cb889119531d719a4ecfe7fb804322b1f64b01b4487aa9c8260f415e122`
- Evidence bytes: `548`

CI for head `cce939f` is green: `verify`, `installer-cleanroom`, and `desktop-windows-msi` succeeded; `release-lockstep-gate` skipped as expected. The installer-cleanroom run includes passing Linux archive lifecycle evidence for both clerk-core and city-core.

## Background

`TESTER-RESULT-086.md` failed only on restore after uninstall/reinstall. The same run passed the installed Tauri desktop app surface, runtime/model readiness, `Backup Now` manifest/README creation, Clerk adopted-legislation persistence, Records typed reference durability, Code typed reference/source/handoff persistence, support bundle manifest creation, and repair.

The remaining product failure was:

- After uninstall/reinstall, `Restore Latest Backup` and `Confirm Restore Latest Backup` failed with `Could not remove C:\Users\insty\AppData\Local\CivicSuite\Data: The process cannot access the file because it is being used by another process. (os error 32)`, even after using product System Health `Stop` controls.

PR #192 head `cce939f` fixes this by stopping managed runtime processes by remembered PID and bundled executable path, waiting for process-backed service health to drop, and replacing `Data`/`config` through staged swap folders with retrying delete/rename behavior. This is intended to handle stale runtime-state after reinstall and live Windows file handles without weakening backup manifest verification.

Continue using only the installed Windows Local Tauri desktop application window launched by `C:\Program Files\CivicSuite\civicsuite-desktop.exe`. Do not use `http://127.0.0.1:18082/`, suite-launcher tabs, or browser module URLs such as `23080`, `23081`, `23820`, or `23865` to perform the product workflow checks.

## Required targeted checks

Use product controls in the installed desktop app window only. Do not hand-edit the CivicSuite profile, database, model files, backup folders, support bundles, runtime payloads, or process state.

1. Verify install/artifact integrity against the SHA-256 and byte counts above.
2. Launch the installed desktop app window from `C:\Program Files\CivicSuite\civicsuite-desktop.exe`; verify that the visible product surface is the Windows Local Tauri desktop window, not the `18082` suite launcher browser surface.
3. Verify runtime/model readiness still reaches Ready with the CivicSuite-managed Ollama runtime and local model store.
4. Run `Backup Now` from desktop app product controls. Verify the review state clears or records action progress, then verify the fresh backup root contains `backup-manifest.json` plus root `README.txt` and copied evidence. If any files/config copies are skipped, verify they are recorded in manifest `skipped_files` instead of preventing manifest creation.
5. Verify the persisted local store top-level `adopted_legislation` count remains nonzero after close/reopen while durable adopted legislation/publication/archive evidence remains visible.
6. Recheck Records lifecycle evidence, including at least one typed unreadable file/reference, and verify that durable evidence still survives close/reopen.
7. Recheck Code source/handoff evidence, including at least one typed unreadable file/reference, and verify source/handoff counts still persist after close/reopen.
8. Create a support bundle from desktop app product controls and verify fresh `support-manifest.json` creation still passes.
9. Complete repair where applicable.
10. Complete uninstall and reinstall of the same MSI.
11. Launch the reinstalled desktop app window and run `Restore Latest Backup`, then `Confirm Restore Latest Backup`, from System Health product controls.
12. If the first restore attempt reports that `Data` or `config` is in use, use the product System Health `Stop` controls and retry `Restore Latest Backup` / `Confirm Restore Latest Backup` once. Do not hand-kill processes or hand-edit the profile.
13. Verify restore completes from the fresh product-created backup and that durable Clerk/Records/Resident/Code evidence is available after restore. Record whether any restore message mentions old-folder cleanup, staged folders, or retry behavior.

## Result file requirements

In `test-comms/TESTER-RESULT-087.md`, include:

- Verdict: PASS or FAIL.
- Artifact SHA-256 and byte verification.
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
- Restore outcome, including the backup root restored from, whether product Stop controls were needed before a retry, whether restore completed, and whether restored Clerk/Records/Resident/Code evidence was available afterward.
- Any screenshots/log excerpts needed to make a failure actionable.

If the result fails due product behavior, include the smallest reproducible sequence and any visible UI text, window/process evidence, manifest paths, backup roots, or restore messages. If the result fails due external elevation or host harness limits, state exactly which step was blocked and whether product behavior was otherwise verified.
