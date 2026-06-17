# TESTER-DIRECTIVE-083

## Communication channel

All builder/tester communication for this gate is only through the CivicSuite/civicsuite repo `test-comms` directory on branch `stage-3a-baremetal-windows`.

Do not use any old bridge folder, old cloud-sync folder, OneDrive folder, or Microsoft cloud-sync path. No old bridge/cloud-sync folder is valid for this test.

Before Codex declares `TESTER-RESULT-083.md` absent, Codex must inspect the live remote `stage-3a-baremetal-windows` branch with `git ls-remote` plus `FETCH_HEAD` after fetch. Do not rely only on a local tracking ref.

Write exactly one result file: `test-comms/TESTER-RESULT-083.md`.

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

`TESTER-RESULT-082.md` failed because install/runtime/staff/guided review, Records typed reference evidence, and Code source/handoff evidence passed, but the Clerk adopted legislation count stayed 0 after a confirmed UI action, Backup Now produced a fresh folder and README but no `backup-manifest.json`, Create Support Bundle did not create a fresh support bundle or `support-manifest.json`, and uninstall/reinstall/restore remained unproven.

The build under test keeps the prior guided workflow UI and typed reference evidence fixes. It also fixes frontend workflow selection by choosing the freshest persisted record instead of trusting backend array order, then preserving latest selections after successful city-work actions. Backup and support collection now tolerate skipped/unreadable files while still writing manifests: backup output must include `backup-manifest.json`, and support bundle output must include `support-manifest.json` plus `collection-notes.txt` when collection is partial.

## Required targeted checks

Use product controls only. Do not hand-edit the CivicSuite profile, database, model files, backup folders, support bundles, or runtime payloads.

1. Verify install/artifact integrity against the SHA-256 and byte counts above.
2. Verify runtime/model readiness still reaches Ready with the CivicSuite-managed Ollama runtime and local model store.
3. Prove staff creation and staff sign-in with a passcode of at least 10 characters, then verify staff is blocked from local-admin-only controls.
4. Verify guided city-work and lifecycle review panels are visible near the top of each relevant page, and click the visible `Confirm ...` buttons.
5. Complete the Clerk workflow through durable adopted legislation evidence. Verify the adopted legislation count advances and persists after close/reopen.
6. Where applicable, verify Clerk publication/archive counts and evidence also persist after close/reopen.
7. Recheck Records lifecycle evidence, including at least one typed unreadable file/reference, and verify that durable evidence still survives close/reopen.
8. Recheck Code source/handoff evidence, including at least one typed unreadable file/reference, and verify source/handoff counts still advance and persist after close/reopen.
9. Run Backup Now from product controls. Verify the fresh backup directory contains `backup-manifest.json` plus the backup README/evidence. If any files are skipped, verify they are recorded in the manifest `skipped_files` list instead of preventing manifest creation.
10. Create a support bundle from product controls. Verify a fresh support bundle contains `support-manifest.json`; if collection is partial, verify `collection-notes.txt` explains the skipped collection items.
11. Complete repair where applicable.
12. Complete uninstall, reinstall, and restore from the fresh product-created backup where applicable, then verify restored durable Clerk/Records/Resident/Code evidence.

## Result file requirements

In `test-comms/TESTER-RESULT-083.md`, include:

- Verdict: PASS or FAIL.
- Artifact SHA-256 and byte verification.
- Installed product code and installed executable path.
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

If the result fails due product behavior, include the smallest reproducible sequence and any visible UI text or manifest paths. If the result fails due external elevation or host harness limits, state exactly which step was blocked and whether product behavior was otherwise verified.
