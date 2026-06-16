# TESTER-DIRECTIVE-082

## Communication channel

All builder/tester communication for this gate is only through the CivicSuite/civicsuite repo `test-comms` directory on branch `stage-3a-baremetal-windows`.

Do not use any old bridge folder, old cloud-sync folder, OneDrive folder, or Microsoft cloud-sync path. No old bridge/cloud-sync folder is valid for this test.

Before Codex declares `TESTER-RESULT-082.md` absent, Codex must inspect the live remote `stage-3a-baremetal-windows` branch with `git ls-remote` plus `FETCH_HEAD` after fetch. Do not rely only on a local tracking ref.

Write exactly one result file: `test-comms/TESTER-RESULT-082.md`.

## Product artifact under test

- PR: CivicSuite/civicsuite #192
- Branch: `work/windows-local-1-design-contract`
- Head: `682a2fa51f76dbbd077e541b573efa0a15c04531`
- Workflow run: `27645507808`
- Public prerelease: https://github.com/CivicSuite/civicsuite/releases/tag/windows-local-msi-ci-682a2fa
- MSI asset: `CivicSuite_0.1.0_x64_en-US.msi`
- MSI SHA-256: `0bbebc0df6066bf52440e6750e70215d403909d75a9839a4d5e987047df0d665`
- MSI bytes: `1639715472`
- Evidence asset: `CivicSuite-msi-evidence.txt`
- Evidence SHA-256: `a6623782d197751fe9a19a50e718f26b4de31fc088c9abc9131dbb6d3bfdc102`
- Evidence bytes: `548`

CI for head `682a2fa` is green: `verify`, `installer-cleanroom`, and `desktop-windows-msi` succeeded; `release-lockstep-gate` skipped as expected. The installer-cleanroom run includes passing Linux archive lifecycle evidence for both clerk-core and city-core after hosted-runner workspace reclaim.

## Background

`TESTER-RESULT-081.md` failed because the deep city-core/lifecycle test did not prove durable evidence for adopted legislation/publication, code source/handoff, full records release lifecycle, visible backup manifest, fresh support bundle manifest, or uninstall/reinstall/restore. The build under test includes the prior guided workflow UI fixes and adds product-side persistence for typed file/reference inputs that are not readable local files.

The new fix preserves typed references for Records and Code workflows by writing hashed local marker files when the tester enters an unreadable path or descriptive reference. It also makes backup/support output more discoverable: backup evidence includes a README and the UI message names `backup-manifest.json`; support bundle success names `support-manifest.json` even if opening the folder is blocked by the host shell.

## Required targeted checks

Use product controls only. Do not hand-edit the CivicSuite profile, database, model files, backup folders, support bundles, or runtime payloads.

1. Verify install/artifact integrity against the SHA-256 and byte counts above.
2. Verify runtime/model readiness still reaches Ready with the CivicSuite-managed Ollama runtime and local model store.
3. Prove staff creation and staff sign-in with a passcode of at least 10 characters, then verify staff is blocked from local-admin-only controls.
4. Verify guided city-work and lifecycle review panels are visible near the top of each relevant page, and click the visible `Confirm ...` buttons.
5. Complete the Clerk workflow through durable adopted legislation and publication/archive evidence.
6. Complete Records request intake, search/review, response, release package/export, and fulfillment. Include at least one readable local file where practical and at least one typed file path/reference that is not readable, then verify the resulting evidence survives close/reopen.
7. Complete Resident/Public workflow coverage where applicable, including persisted public/request/search state.
8. Complete Code workflow coverage: import/add code source with at least one unreadable typed path/reference, generate or record handoff evidence, and verify source/handoff counts advance and persist after close/reopen.
9. Run Backup Now from product controls. Verify the UI exposes or names `backup-manifest.json`, and verify the backup directory contains `backup-manifest.json` plus the backup README/evidence.
10. Create a support bundle from product controls. Verify the UI exposes or names `support-manifest.json`, and verify a fresh support bundle with that manifest exists.
11. Complete repair where applicable.
12. Complete uninstall, reinstall, and restore from the fresh product-created backup where applicable, then verify restored durable Clerk/Records/Resident/Code evidence.

## Result file requirements

In `test-comms/TESTER-RESULT-082.md`, include:

- Verdict: PASS or FAIL.
- Artifact SHA-256 and byte verification.
- Installed product code and installed executable path.
- Runtime/model readiness evidence, including whether any user-global Ollama was present.
- Staff sign-in/RBAC proof.
- Guided panel visibility and confirm-button proof.
- Clerk adopted legislation/publication/archive counts after close/reopen.
- Records lifecycle evidence and whether typed unreadable references produced durable product evidence.
- Code source/handoff counts after close/reopen and whether typed unreadable references produced durable product evidence.
- Backup manifest path and README/evidence observation.
- Support bundle manifest path and freshness observation.
- Repair/uninstall/reinstall/restore outcome.
- Any screenshots/log excerpts needed to make a failure actionable.

If the result fails due product behavior, include the smallest reproducible sequence and any visible UI text or manifest paths. If the result fails due external elevation or host harness limits, state exactly which step was blocked and whether product behavior was otherwise verified.
