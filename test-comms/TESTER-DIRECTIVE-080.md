# Tester Directive 080 - Deep city-core workflow and lifecycle gate

## Goal

Continue the Windows Local city-core beta gate after the successful
TESTER-RESULT-079 targeted pass. The current installed product state from
directive 079 is valuable evidence: model setup recovered, the Gemma model
verified/registered, CivicSuite-managed Ollama loaded the model, System Health
advanced to Ready, and runtime services became healthy.

This directive completes the deeper product workflows that result 079 only
smoke-checked, then exercises backup/restore, repair, uninstall, reinstall, and
restore lifecycle without rebooting or restarting Windows.

Do not reboot or restart Windows.

## Communication Contract

All builder/tester communication for this gate is only through:

- Repository: `CivicSuite/civicsuite`
- Branch: `stage-3a-baremetal-windows`
- Folder: `test-comms`

No old bridge folder, local-only bridge folder, OneDrive path, Microsoft
cloud-sync path, chat-only note, or alternate branch is valid for this gate.

The tester must write exactly:

- `test-comms/TESTER-RESULT-080.md`

Codex/builder must check the live remote branch with `FETCH_HEAD` after fetching
before declaring a result absent. Do not rely only on a stale local
`origin/stage-3a-baremetal-windows` tracking ref.

## Required Branch And Continuity

- Repo test channel: `CivicSuite/civicsuite`
- Test channel branch: `stage-3a-baremetal-windows`
- Prior result to read: `test-comms/TESTER-RESULT-079.md`
- Prior directive to read: `test-comms/TESTER-DIRECTIVE-079.md`
- Prior full gate directive to read: `test-comms/TESTER-DIRECTIVE-067.md`
- Expected result file: `test-comms/TESTER-RESULT-080.md`
- Do not edit source, generated artifacts, module manifests, release status,
  tags, or docs outside `test-comms`.

## Product Artifact Truth

Continue from the directive 079 successful installed state when possible. Do not
re-download the MSI unless uninstall/reinstall lifecycle requires the installer
again or the existing installer file is missing.

If an installer is needed, use only this artifact:

- PR under test: `CivicSuite/civicsuite#192`
- Required PR head under test:
  `86dfed6308638f6450bae269095132a2ee729f6f`
- Source workflow run: `27623935715`
- Source workflow job: `build Windows Local MSI`
- Public prerelease tag: `windows-local-msi-ci-86dfed6`
- Public prerelease page:
  `https://github.com/CivicSuite/civicsuite/releases/tag/windows-local-msi-ci-86dfed6`
- MSI URL:
  `https://github.com/CivicSuite/civicsuite/releases/download/windows-local-msi-ci-86dfed6/CivicSuite_0.1.0_x64_en-US.msi`
- MSI SHA-256:
  `3608b382254a4efb31782f5f8d3f72c11ac42991e7b48601846f8899b62d3afb`
- MSI bytes: `1639783671`
- Evidence URL:
  `https://github.com/CivicSuite/civicsuite/releases/download/windows-local-msi-ci-86dfed6/CivicSuite-msi-evidence.txt`
- Evidence SHA-256:
  `5b003bc79c68a44f729a1709fa3c208d28556e036aba1f4518061ba7f439b1ba`
- Evidence bytes: `548`

Reject any installer whose URL, PR head, size, or SHA-256 differs.

## Starting State

Use the existing tester machine state produced by TESTER-RESULT-079 if still
available:

- CivicSuite installed at `C:\Program Files\CivicSuite\`,
- first-run setup complete,
- local-admin sign-in available,
- model verified and registered,
- CivicSuite-managed Ollama loaded,
- System Health Ready,
- runtime services healthy,
- no Windows reboot or restart since directive 079.

If the app is closed, relaunch
`C:\Program Files\CivicSuite\civicsuite-desktop.exe` as the normal interactive
user, not elevated. If sign-in is required, sign in with the directive 079 local
admin account and record whether persisted state survived.

Do not hand-edit CivicSuite local config, data files, model files, registry
files, service folders, or database files to make workflows pass.

## UI Automation Stability Requirements

Use process/window-handle-targeted automation wherever possible:

- target the normal medium-integrity CivicSuite process/window handle,
- close accidental shell overlays before continuing,
- before each input batch, verify the foreground window title is `CivicSuite`,
- after each input batch, verify the intended CivicSuite field changed,
- prefer tab-order and accessibility/name-targeted controls over blind
  coordinate clicks,
- keep screenshots and process/window state around every failed focus attempt.

If input becomes unstable, attempt one controlled recovery. If the harness still
cannot reliably type into or click the visible CivicSuite WebView after that
recovery, report `BLOCKED - tester harness WebView input instability` with
screenshots and foreground-window/process evidence.

## Deep Workflow Coverage

Use realistic small test data. Record screenshots, exported files, service
health, and persistent state evidence for each section.

### System Health Baseline

- Confirm app launch works as normal interactive user.
- Confirm signed-in local-admin state or sign in again.
- Confirm System Health still reports Ready or explain any recovery required.
- Confirm local services endpoint remains healthy.
- Confirm model readiness remains verified, registered, runtime OK, and loaded.
- Record any user-global Ollama process separately from CivicSuite-managed
  runtime evidence.

### Local Users And RBAC

- Create a staff/clerk user through the app.
- Confirm the staff user can sign in if the UI supports it.
- Confirm local-admin-only settings/actions remain gated from non-admin state.
- Disable/reactivate or reset the staff user if those controls are reachable.
- Record role labels and any blocked/admin-only actions.

### CivicClerk Workflow

Complete a small meeting workflow using app controls only:

- create a meeting,
- add at least two agenda items,
- calculate or record notice/deadline evidence,
- post or prepare a notice/packet where available,
- add a resident/public comment if supported,
- record attendance/quorum if supported,
- record votes/action items,
- draft minutes,
- mark minutes adopted or archived if supported,
- export/open the resulting packet/minutes/archive if export controls exist,
- confirm the meeting and related records persist after navigating away and
  returning.

### CivicRecords AI Workflow

Complete a small public records workflow using app controls only:

- create or intake a records request,
- attach or reference at least one source document/item if supported,
- search or review responsive materials,
- create a draft response with citations/source evidence,
- keep draft/internal/public/release wording clear,
- approve or release only through the human-review workflow if available,
- export/open the response or evidence package if export controls exist,
- confirm lifecycle state and request record persist after navigating away and
  returning.

### Resident/Public Records Request Workflow

Use the resident/public surface where available:

- submit a public records request or public-facing intake,
- confirm staff/admin view can see the request,
- confirm public/staff boundaries are clear,
- confirm no admin-only controls are exposed to the public state.

### CivicCode Workflow

Complete a small code/ordinance workflow using app controls only:

- add or import a municipal code source if supported,
- record source URL/citation metadata,
- search the code source,
- ask or enter a staff guidance/code question if supported,
- create ordinance/resolution or clerk handoff if supported,
- record codifier/publication/sync status if supported,
- export/open code evidence or source package if export controls exist,
- confirm source/history/search state persists after navigating away and
  returning.

### Cross-Module Search And Handoffs

- Search City Knowledge for items created in Clerk, Records, and Code.
- Confirm citations/source labels identify the originating module.
- Create at least one Clerk-to-Code or Code-to-Clerk handoff if supported.
- Create at least one Records-to-Clerk or Records-to-Code handoff if supported.
- Confirm handoff state is visible from both source and destination surfaces
  where the UI promises it.

### Close/Reopen Persistence

- Close CivicSuite.
- Relaunch as the normal interactive user.
- Confirm local-admin sign-in/setup state persists.
- Confirm System Health, model readiness, and runtime service state are either
  still Ready or recoverable through product controls.
- Confirm created Clerk, Records, Code, search, and handoff data remain visible.

### Backup And Restore

- Use product backup controls to create a backup.
- Record backup folder, backup manifest, and included data evidence.
- Mutate a small piece of test data after backup.
- Restore from the backup using product controls.
- Confirm restored data matches the backup state and post-backup mutation is
  absent or clearly handled.
- Confirm System Health and sign-in still work after restore.

### Support Bundle

- Create a support bundle through product controls.
- Record bundle path and manifest.
- Confirm it includes health/runtime/model/service evidence without exposing
  passcodes or private secrets in obvious plaintext.

### Repair

- Exercise product repair controls without hand-editing local files.
- Confirm repair reports plain-English status.
- Confirm services and model readiness are healthy or recoverable afterward.

### Uninstall, Reinstall, Restore

Use the existing tester machine. Do not reboot or restart Windows.

- Create a final backup before uninstall.
- Use product prepare-uninstall guidance if present.
- Uninstall through Windows installer/uninstall path.
- Confirm app executable, uninstall entry, and running CivicSuite processes are
  removed.
- Preserve the final backup.
- Reinstall the same directive 079 artifact only if needed, verifying SHA-256.
- Launch as normal interactive user.
- Restore from the final backup using product controls.
- Confirm sign-in, city profile, modules, model readiness, runtime health, and
  created workflow data return or are recoverable through product controls.

## Classification

Report `PASS` only if:

- no Docker, WSL, terminal-only bootstrap, hand-edited data, old bridge, reboot,
  or alternate package was needed,
- model/runtime readiness remains working,
- the four city-core surfaces are usable through real app controls,
- created data persists,
- backup/restore works,
- support bundle works,
- repair is usable,
- uninstall/reinstall/restore lifecycle works.

Report `FAIL` for product bugs, data loss, misleading UI, app crash,
unrecoverable setup/runtime state, missing real workflow persistence, broken
backup/restore, broken uninstall/reinstall/restore, or any workflow that appears
live but is only fake/in-memory.

Report `BLOCKED` only for external machine/harness/elevation/network limits
where the app is alive and reports a clear recoverable state.

## Required Result File Format

Write `test-comms/TESTER-RESULT-080.md` with:

- final verdict: PASS, FAIL, or BLOCKED,
- tested branch and commit for the repo channel,
- confirmation `TESTER-RESULT-079.md`, `TESTER-DIRECTIVE-079.md`, and
  `TESTER-DIRECTIVE-067.md` were read,
- confirmation the communication contract in this directive was followed,
- PR #192 head SHA tested,
- whether the directive 079 installed state was reused,
- MSI/evidence SHA-256 verification if reinstall was needed,
- app launch and sign-in evidence,
- System Health baseline result,
- model/runtime readiness result,
- Local Users/RBAC result,
- CivicClerk workflow result,
- CivicRecords AI workflow result,
- resident/public records request result,
- CivicCode workflow result,
- cross-module search/handoff result,
- close/reopen persistence result,
- backup/restore result,
- support bundle result,
- repair result,
- uninstall/reinstall/restore result,
- confirmation Windows was not rebooted or restarted,
- exact blocker or failure details for any failed requirement.
