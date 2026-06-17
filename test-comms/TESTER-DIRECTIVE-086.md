# TESTER-DIRECTIVE-086

## Communication channel

All builder/tester communication for this gate is only through the CivicSuite/civicsuite repo `test-comms` directory on branch `stage-3a-baremetal-windows`.

Do not use any old bridge folder, old cloud-sync folder, OneDrive folder, or Microsoft cloud-sync path. No old bridge/cloud-sync folder is valid for this test.

Before Codex declares `TESTER-RESULT-086.md` absent, Codex must inspect the live remote `stage-3a-baremetal-windows` branch with `git ls-remote` plus `FETCH_HEAD` after fetch. Do not rely only on a local tracking ref.

Write exactly one result file: `test-comms/TESTER-RESULT-086.md`.

## Product artifact under test

- PR: CivicSuite/civicsuite #192
- Branch: `work/windows-local-1-design-contract`
- Head: `84f30c4d40c32ff9255011459f94ea80052a40e0`
- Workflow run: `27667907615`
- Public prerelease: https://github.com/CivicSuite/civicsuite/releases/tag/windows-local-msi-ci-84f30c4
- MSI asset: `CivicSuite_0.1.0_x64_en-US.msi`
- MSI SHA-256: `65277b60254ad0f8f70f8092ac480086f39d68881e8a374e20244b5987040a83`
- MSI bytes: `1645065024`
- Evidence asset: `CivicSuite-msi-evidence.txt`
- Evidence SHA-256: `c068de90cd84f75dd2394374c29b745fb1e38e5ae7242d1417f207f05b26bd3d`
- Evidence bytes: `548`

CI for head `84f30c4` is green: `verify`, `installer-cleanroom`, and `desktop-windows-msi` succeeded; `release-lockstep-gate` skipped as expected. The installer-cleanroom run includes passing Linux archive lifecycle evidence for both clerk-core and city-core.

## Background

`TESTER-RESULT-085.md` failed after proving the installed Tauri desktop app surface was used. The passing areas included install/artifact integrity, desktop launch, managed Ollama endpoints after product Start controls, Records typed reference persistence, Code typed reference/source/handoff persistence, support bundle manifest creation, and repair.

The remaining product failures were:

- `Backup Now` copied data but produced no root `backup-manifest.json` or root `README.txt`.
- The persisted top-level `adopted_legislation` count remained `0` after close/reopen even though nested Clerk adoption workflow evidence persisted.
- Uninstall/reinstall/restore from the fresh product-created backup remained unproven because that backup had no manifest.

PR #192 head `84f30c4` fixes this by making manual backups copy local data/config best-effort, recording copy failures in manifest `skipped_files`, continuing to write root `README.txt` plus `backup-manifest.json` for partially copied backups, keeping backup verification strict for file hashes while allowing source-copy `skipped_files`, and persisting the normalized top-level adopted-legislation index back to `city-work.json` when legacy or partially indexed state is read from meeting-nested adoption records.

Continue using only the installed Windows Local Tauri desktop application window launched by `C:\Program Files\CivicSuite\civicsuite-desktop.exe`. Do not use `http://127.0.0.1:18082/`, suite-launcher tabs, or browser module URLs such as `23080`, `23081`, `23820`, or `23865` to perform the product workflow checks.

## Required targeted checks

Use product controls in the installed desktop app window only. Do not hand-edit the CivicSuite profile, database, model files, backup folders, support bundles, or runtime payloads.

1. Verify install/artifact integrity against the SHA-256 and byte counts above.
2. Launch the installed desktop app window from `C:\Program Files\CivicSuite\civicsuite-desktop.exe`; verify that the visible product surface is the Windows Local Tauri desktop window, not the `18082` suite launcher browser surface.
3. Verify runtime/model readiness still reaches Ready with the CivicSuite-managed Ollama runtime and local model store.
4. Run `Backup Now` from desktop app product controls. Verify the review state clears or records action progress, then verify the fresh backup root contains `backup-manifest.json` plus root `README.txt` and copied evidence. If any files/config copies are skipped, verify they are recorded in manifest `skipped_files` instead of preventing manifest creation.
5. Complete the Clerk workflow through durable adopted legislation evidence. Verify the persisted local store top-level `adopted_legislation` count advances and remains nonzero after close/reopen while durable adopted legislation/publication/archive evidence remains visible.
6. Recheck Records lifecycle evidence, including at least one typed unreadable file/reference, and verify that durable evidence still survives close/reopen.
7. Recheck Code source/handoff evidence, including at least one typed unreadable file/reference, and verify source/handoff counts still advance and persist after close/reopen.
8. Create a support bundle from desktop app product controls and verify fresh `support-manifest.json` creation still passes.
9. Complete repair where applicable.
10. Complete uninstall, reinstall, and restore from the fresh product-created backup where applicable, then verify restored durable Clerk/Records/Resident/Code evidence.

## Result file requirements

In `test-comms/TESTER-RESULT-086.md`, include:

- Verdict: PASS or FAIL.
- Artifact SHA-256 and byte verification.
- Installed product code and installed executable path.
- A clear statement that the installed Tauri desktop app window was used, or a failure that the desktop app window was not visible/reachable.
- Runtime/model readiness evidence, including whether any user-global Ollama was present.
- Backup manifest path, root README observation, copied evidence observation, whether the review panel cleared or stayed open, any action progress/Working evidence, and any `skipped_files` observation.
- Clerk adopted legislation top-level count after the confirmed action, the persisted local store count after close/reopen, and durable adopted legislation/publication/archive evidence.
- Records lifecycle evidence and whether typed unreadable references still produced durable product evidence.
- Code source/handoff counts after close/reopen and whether typed unreadable references still produced durable product evidence.
- Support bundle manifest path and freshness observation.
- Repair/uninstall/reinstall/restore outcome.
- Any screenshots/log excerpts needed to make a failure actionable.

If the result fails due product behavior, include the smallest reproducible sequence and any visible UI text, window/process evidence, or manifest paths. If the result fails due external elevation or host harness limits, state exactly which step was blocked and whether product behavior was otherwise verified.
