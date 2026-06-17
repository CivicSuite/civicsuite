# TESTER-DIRECTIVE-084

## Communication channel

All builder/tester communication for this gate is only through the CivicSuite/civicsuite repo `test-comms` directory on branch `stage-3a-baremetal-windows`.

Do not use any old bridge folder, old cloud-sync folder, OneDrive folder, or Microsoft cloud-sync path. No old bridge/cloud-sync folder is valid for this test.

Before Codex declares `TESTER-RESULT-084.md` absent, Codex must inspect the live remote `stage-3a-baremetal-windows` branch with `git ls-remote` plus `FETCH_HEAD` after fetch. Do not rely only on a local tracking ref.

Write exactly one result file: `test-comms/TESTER-RESULT-084.md`.

## Product artifact under test

- PR: CivicSuite/civicsuite #192
- Branch: `work/windows-local-1-design-contract`
- Head: `47d773800f4e9cd1b537355168e0cdada71aa83f`
- Workflow run: `27654912350`
- Public prerelease: https://github.com/CivicSuite/civicsuite/releases/tag/windows-local-msi-ci-47d7738
- MSI asset: `CivicSuite_0.1.0_x64_en-US.msi`
- MSI SHA-256: `9ac582acc57b69213d5f3466165f25df951eb6b19bab5c0af9a2e01e46b7aabc`
- MSI bytes: `1639816439`
- Evidence asset: `CivicSuite-msi-evidence.txt`
- Evidence SHA-256: `adb2f915e13a18eac59d2025433ad2c0d2ed35fb49e02f111ac144151218caa5`
- Evidence bytes: `548`

CI for head `47d7738` is green: `verify`, `installer-cleanroom`, and `desktop-windows-msi` succeeded; `release-lockstep-gate` skipped as expected. The installer-cleanroom run includes passing Linux archive lifecycle evidence for both clerk-core and city-core after hosted-runner workspace/toolcache reclaim.

## Background

`TESTER-RESULT-083.md` failed after the installer and runtime verified, but the retest moved into the suite launcher/browser surface at `http://127.0.0.1:18082/`. That launcher exposed endpoint cards and dead module URLs, not the Windows Local Tauri desktop product controls required for this gate.

The Windows Local MSI product surface for this retest is the installed desktop application window launched by `C:\Program Files\CivicSuite\civicsuite-desktop.exe`. The expected desktop window exposes the Windows Local product pages and controls: `Home`, `Meetings & Notices`, `Records Requests`, `Code & Ordinances`, `Search City Knowledge`, `System Health`, and `Settings`.

For directive 084, do not use `http://127.0.0.1:18082/`, suite-launcher tabs, or browser module URLs such as `23080`, `23081`, `23820`, or `23865` to perform the product workflow checks. If the suite launcher is already running, record it as a stale/non-MSI product surface and ignore it for the workflow retest.

If launching `C:\Program Files\CivicSuite\civicsuite-desktop.exe` does not present the Tauri desktop window with the expected pages and controls, report that as a product failure with screenshot/process/window-state evidence. Otherwise, continue all checks below only through the installed desktop app window.

The build under test is the same verified artifact from directive 083. It includes the workflow selection, backup manifest, and support bundle resilience fixes from PR #192 head `47d7738`.

## Required targeted checks

Use product controls in the installed desktop app window only. Do not hand-edit the CivicSuite profile, database, model files, backup folders, support bundles, or runtime payloads.

1. Verify install/artifact integrity against the SHA-256 and byte counts above.
2. Launch the installed desktop app window from `C:\Program Files\CivicSuite\civicsuite-desktop.exe`; verify that the visible product surface is the Windows Local Tauri desktop window, not the `18082` suite launcher browser surface.
3. Verify runtime/model readiness still reaches Ready with the CivicSuite-managed Ollama runtime and local model store.
4. Prove staff creation and staff sign-in with a passcode of at least 10 characters, then verify staff is blocked from local-admin-only controls.
5. Verify guided city-work and lifecycle review panels are visible near the top of each relevant desktop app page, and click the visible `Confirm ...` buttons.
6. Complete the Clerk workflow through durable adopted legislation evidence. Verify the adopted legislation count advances and persists after close/reopen.
7. Where applicable, verify Clerk publication/archive counts and evidence also persist after close/reopen.
8. Recheck Records lifecycle evidence, including at least one typed unreadable file/reference, and verify that durable evidence still survives close/reopen.
9. Recheck Code source/handoff evidence, including at least one typed unreadable file/reference, and verify source/handoff counts still advance and persist after close/reopen.
10. Run Backup Now from desktop app product controls. Verify the fresh backup directory contains `backup-manifest.json` plus the backup README/evidence. If any files are skipped, verify they are recorded in the manifest `skipped_files` list instead of preventing manifest creation.
11. Create a support bundle from desktop app product controls. Verify a fresh support bundle contains `support-manifest.json`; if collection is partial, verify `collection-notes.txt` explains the skipped collection items.
12. Complete repair where applicable.
13. Complete uninstall, reinstall, and restore from the fresh product-created backup where applicable, then verify restored durable Clerk/Records/Resident/Code evidence.

## Result file requirements

In `test-comms/TESTER-RESULT-084.md`, include:

- Verdict: PASS or FAIL.
- Artifact SHA-256 and byte verification.
- Installed product code and installed executable path.
- A clear statement of which product surface was used: the installed Tauri desktop app window, or a failure that the desktop app window was not visible/reachable.
- Runtime/model readiness evidence, including whether any user-global Ollama was present.
- Staff sign-in/RBAC proof.
- Guided panel visibility and confirm-button proof.
- Clerk adopted legislation count after the confirmed action and after close/reopen.
- Clerk publication/archive counts after close/reopen, if exercised.
- Records lifecycle evidence and whether typed unreadable references still produced durable product evidence.
- Code source/handoff counts after close/reopen and whether typed unreadable references still produced durable product evidence.
- Backup manifest path, README/evidence observation, and any `skipped_files` observation.
- Support bundle manifest path, freshness observation, and any `collection-notes.txt` observation.
- Repair/uninstall/reinstall/restore outcome.
- Any screenshots/log excerpts needed to make a failure actionable.

If the result fails due product behavior, include the smallest reproducible sequence and any visible UI text, window/process evidence, or manifest paths. If the result fails due external elevation or host harness limits, state exactly which step was blocked and whether product behavior was otherwise verified.
