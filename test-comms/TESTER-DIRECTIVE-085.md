# TESTER-DIRECTIVE-085

## Communication channel

All builder/tester communication for this gate is only through the CivicSuite/civicsuite repo `test-comms` directory on branch `stage-3a-baremetal-windows`.

Do not use any old bridge folder, old cloud-sync folder, OneDrive folder, or Microsoft cloud-sync path. No old bridge/cloud-sync folder is valid for this test.

Before Codex declares `TESTER-RESULT-085.md` absent, Codex must inspect the live remote `stage-3a-baremetal-windows` branch with `git ls-remote` plus `FETCH_HEAD` after fetch. Do not rely only on a local tracking ref.

Write exactly one result file: `test-comms/TESTER-RESULT-085.md`.

## Product artifact under test

- PR: CivicSuite/civicsuite #192
- Branch: `work/windows-local-1-design-contract`
- Head: `5149e7d31d6b74073d3f850b2722b8772485269b`
- Workflow run: `27663139440`
- Public prerelease: https://github.com/CivicSuite/civicsuite/releases/tag/windows-local-msi-ci-5149e7d
- MSI asset: `CivicSuite_0.1.0_x64_en-US.msi`
- MSI SHA-256: `9b64b8b88645a7c87cffdf6b3d91b2423b0892d442c78c684e0f316de90d5f92`
- MSI bytes: `1645075703`
- Evidence asset: `CivicSuite-msi-evidence.txt`
- Evidence SHA-256: `0576a079c23d83138f2272679b7c31c538aae258cbc9139f4cb1ea314338524f`
- Evidence bytes: `548`

CI for head `5149e7d` is green: `verify`, `installer-cleanroom`, and `desktop-windows-msi` succeeded; `release-lockstep-gate` skipped as expected. The installer-cleanroom run includes passing Linux archive lifecycle evidence for both clerk-core and city-core.

## Background

`TESTER-RESULT-084.md` failed after proving the retest used the installed Tauri desktop app window instead of the stale suite launcher/browser surface. The remaining product failures were:

- `Backup Now` opened a guided review panel, but `Confirm Backup Now` left the panel open and did not create a fresh `backup-manifest.json`.
- `Create Support Bundle` opened a guided review panel, but `Confirm Create Support Bundle` left the panel open and did not create a fresh `support-manifest.json`.
- The dedicated top-level adopted-legislation count remained `0` even though nested Clerk adoption workflow evidence persisted.

PR #192 head `5149e7d` fixes this by normalizing missing supervisor service ids to explicit `null` before invoking Tauri lifecycle commands, clearing the guided lifecycle review panel and showing Working while long-running native lifecycle actions run, and normalizing the top-level adopted-legislation index from meeting-nested adoption records when workflow state is read.

Continue using only the installed Windows Local Tauri desktop application window launched by `C:\Program Files\CivicSuite\civicsuite-desktop.exe`. The expected desktop window exposes `Home`, `Meetings & Notices`, `Records Requests`, `Code & Ordinances`, `Search City Knowledge`, `System Health`, and `Settings`.

Do not use `http://127.0.0.1:18082/`, suite-launcher tabs, or browser module URLs such as `23080`, `23081`, `23820`, or `23865` to perform the product workflow checks.

If launching `C:\Program Files\CivicSuite\civicsuite-desktop.exe` does not present the Tauri desktop window with the expected pages and controls, report that as a product failure with screenshot/process/window-state evidence. Otherwise, continue all checks below only through the installed desktop app window.

## Required targeted checks

Use product controls in the installed desktop app window only. Do not hand-edit the CivicSuite profile, database, model files, backup folders, support bundles, or runtime payloads.

1. Verify install/artifact integrity against the SHA-256 and byte counts above.
2. Launch the installed desktop app window from `C:\Program Files\CivicSuite\civicsuite-desktop.exe`; verify that the visible product surface is the Windows Local Tauri desktop window, not the `18082` suite launcher browser surface.
3. Verify runtime/model readiness still reaches Ready with the CivicSuite-managed Ollama runtime and local model store.
4. Run `Backup Now` from desktop app product controls. Verify `Confirm Backup Now` leaves review state, shows or records action progress, and creates a fresh backup directory containing `backup-manifest.json` plus the backup README/evidence. If any files are skipped, verify they are recorded in the manifest `skipped_files` list instead of preventing manifest creation.
5. Create a support bundle from desktop app product controls. Verify `Confirm Create Support Bundle` leaves review state, shows or records action progress, and creates a fresh support bundle containing `support-manifest.json`; if collection is partial, verify `collection-notes.txt` explains the skipped collection items.
6. Complete the Clerk workflow through durable adopted legislation evidence. Verify the top-level adopted legislation count advances and persists after close/reopen while durable adopted legislation/publication/archive evidence remains visible.
7. Recheck Records lifecycle evidence, including at least one typed unreadable file/reference, and verify that durable evidence still survives close/reopen.
8. Recheck Code source/handoff evidence, including at least one typed unreadable file/reference, and verify source/handoff counts still advance and persist after close/reopen.
9. Complete repair where applicable.
10. Complete uninstall, reinstall, and restore from the fresh product-created backup where applicable, then verify restored durable Clerk/Records/Resident/Code evidence.

## Result file requirements

In `test-comms/TESTER-RESULT-085.md`, include:

- Verdict: PASS or FAIL.
- Artifact SHA-256 and byte verification.
- Installed product code and installed executable path.
- A clear statement that the installed Tauri desktop app window was used, or a failure that the desktop app window was not visible/reachable.
- Runtime/model readiness evidence, including whether any user-global Ollama was present.
- Backup manifest path, README/evidence observation, whether the review panel cleared or stayed open, any action progress/Working evidence, and any `skipped_files` observation.
- Support bundle manifest path, freshness observation, whether the review panel cleared or stayed open, any action progress/Working evidence, and any `collection-notes.txt` observation.
- Clerk adopted legislation top-level count after the confirmed action and after close/reopen, plus durable adopted legislation/publication/archive evidence.
- Records lifecycle evidence and whether typed unreadable references still produced durable product evidence.
- Code source/handoff counts after close/reopen and whether typed unreadable references still produced durable product evidence.
- Repair/uninstall/reinstall/restore outcome.
- Any screenshots/log excerpts needed to make a failure actionable.

If the result fails due product behavior, include the smallest reproducible sequence and any visible UI text, window/process evidence, or manifest paths. If the result fails due external elevation or host harness limits, state exactly which step was blocked and whether product behavior was otherwise verified.
