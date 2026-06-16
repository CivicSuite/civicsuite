# Tester Directive 081 - Guided city workflow and lifecycle retest

## Goal

Retest the Windows Local city-core beta gate using the corrected PR #192 build
that fixes TESTER-RESULT-080 workflow progression failures.

This run must install the new MSI artifact for PR head
`ab1abf4cdb1da97e81d31ab9b955d75aa6d70715`, then prove that the guided
city-work/lifecycle review panels are visible and confirmable, staff sign-in is
usable, Clerk/Records/Resident/Code workflows advance through persisted state,
and backup/support/repair/uninstall/reinstall/restore lifecycle works through
product controls.

Do not reboot or restart Windows.

## Communication Contract

All builder/tester communication for this gate is only through:

- Repository: `CivicSuite/civicsuite`
- Branch: `stage-3a-baremetal-windows`
- Folder: `test-comms`

No old bridge folder, local-only bridge folder, OneDrive path, Microsoft
cloud-sync path, chat-only note, alternate branch, or local scratch result is
valid for this gate.

The tester must write exactly:

- `test-comms/TESTER-RESULT-081.md`

Codex/builder must check the live remote branch with `FETCH_HEAD` after fetching
before declaring a result absent. Do not rely only on a stale local
`origin/stage-3a-baremetal-windows` tracking ref.

## Required Branch And Prior Evidence

- Repo test channel: `CivicSuite/civicsuite`
- Test channel branch: `stage-3a-baremetal-windows`
- Prior result to read: `test-comms/TESTER-RESULT-080.md`
- Prior directive to read: `test-comms/TESTER-DIRECTIVE-080.md`
- Prior model/runtime pass to read: `test-comms/TESTER-RESULT-079.md`
- Prior full gate directive to read: `test-comms/TESTER-DIRECTIVE-067.md`
- Expected result file: `test-comms/TESTER-RESULT-081.md`
- Do not edit source, generated artifacts, module manifests, release status,
  tags, or docs outside `test-comms`.

## Product Artifact Truth

Use only this artifact:

- PR under test: `CivicSuite/civicsuite#192`
- Required PR head under test:
  `ab1abf4cdb1da97e81d31ab9b955d75aa6d70715`
- Source workflow run: `27634849104`
- Source workflow job: `build Windows Local MSI`
- Public prerelease tag: `windows-local-msi-ci-ab1abf4`
- Public prerelease page:
  `https://github.com/CivicSuite/civicsuite/releases/tag/windows-local-msi-ci-ab1abf4`
- MSI URL:
  `https://github.com/CivicSuite/civicsuite/releases/download/windows-local-msi-ci-ab1abf4/CivicSuite_0.1.0_x64_en-US.msi`
- MSI SHA-256:
  `394f05354418453857faa8ceb33cd5eee5d95fbd84007643e37d888edcccc898`
- MSI bytes: `1639845111`
- Evidence URL:
  `https://github.com/CivicSuite/civicsuite/releases/download/windows-local-msi-ci-ab1abf4/CivicSuite-msi-evidence.txt`
- Evidence SHA-256:
  `d3b842d3d135245c4d3625d69cb45af7120da035a408a0b3dcd50b61ee28fcf5`
- Evidence bytes: `548`

Reject any installer whose URL, PR head, size, or SHA-256 differs.

## Install Or Upgrade

Close CivicSuite if it is running. Replace the prior installed build with the
new directive 081 MSI.

If Windows allows the MSI to upgrade or repair the existing install, use that
path. If the same-version MSI requires removal first, uninstall the previous
CivicSuite build through Windows Apps/installer uninstall path, using an
interactive/elevated uninstall prompt if Windows requires it. Do not reboot or
restart Windows.

Preserve existing CivicSuite local data unless the product or Windows installer
removes it as part of normal uninstall. Do not hand-edit CivicSuite local config,
data files, model files, registry files, service folders, or database files to
make workflows pass.

Install the new MSI. Launch
`C:\Program Files\CivicSuite\civicsuite-desktop.exe` as the normal interactive
user, not elevated.

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

## Targeted Regression Checks

Use unique `DIR081` data so new records are distinguishable from prior partial
directive 080 data.

### Guided Review Visibility And Confirmation

For System Health, Meetings, Records, Code, and any lifecycle action that opens
a guided review panel:

- confirm the guided review panel is visible near the top of the page without
  needing to scroll past the large workflow form,
- click the visible `Confirm` button before expecting the action to complete,
- record before/after screenshots or text evidence for at least one city-work
  guided panel and one lifecycle/supervisor guided panel,
- fail the run if a required `Confirm` button is hidden below a large form,
  unreachable, or does not cause the action to proceed.

### Local Users And RBAC

- Create a staff/clerk user through the app using a temporary local passcode of
  at least 10 characters.
- Sign out, confirm the staff email remains available or can be entered
  normally, then sign in as that staff user.
- Confirm local-admin-only settings/actions remain gated from the staff state.
- Sign back in as local-admin for the remaining admin workflows.
- Record role labels, sign-in evidence, and any blocked/admin-only action.

### CivicClerk Workflow

Complete a small meeting workflow using app controls only:

- create or select a meeting body,
- add at least one roster member,
- create a meeting,
- add at least two agenda items,
- promote or review an agenda item where the UI supports it,
- calculate or record notice/deadline evidence,
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
- create ordinance/resolution or Clerk handoff if supported,
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
- Confirm created Clerk, Records, Code, search, staff, and handoff data remain
  visible.

### Backup And Restore

- Use product backup controls to create a fresh backup.
- Record backup folder, backup manifest, and included data evidence.
- Mutate a small piece of `DIR081` test data after backup.
- Restore from the backup using product controls.
- Confirm restored data matches the backup state and post-backup mutation is
  absent or clearly handled.
- Confirm System Health and sign-in still work after restore.

### Support Bundle

- Create a fresh support bundle through product controls.
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
- Reinstall the same directive 081 artifact only, verifying SHA-256.
- Launch as normal interactive user.
- Restore from the final backup using product controls.
- Confirm sign-in, city profile, modules, model readiness, runtime health, and
  created workflow data return or are recoverable through product controls.

## Classification

Report `PASS` only if:

- no Docker, WSL, terminal-only bootstrap, hand-edited data, old bridge, reboot,
  alternate package, or alternate branch was needed,
- the new directive 081 MSI was installed and verified,
- guided review panels are visible at the top and confirmable,
- staff sign-in and admin gating work,
- model/runtime readiness remains working,
- the four city-core surfaces are usable through real app controls,
- created data persists,
- backup/restore works,
- support bundle works,
- repair is usable,
- uninstall/reinstall/restore lifecycle works.

Report `FAIL` for product bugs, data loss, misleading UI, app crash,
unrecoverable setup/runtime state, missing real workflow persistence, hidden or
unusable confirmation panels, broken backup/restore, broken
uninstall/reinstall/restore, or any workflow that appears live but is only
fake/in-memory.

Report `BLOCKED` only for external machine/harness/elevation/network limits
where the app is alive and reports a clear recoverable state.

## Required Result File Format

Write `test-comms/TESTER-RESULT-081.md` with:

- final verdict: PASS, FAIL, or BLOCKED,
- tested branch and commit for the repo channel,
- confirmation `TESTER-RESULT-080.md`, `TESTER-DIRECTIVE-080.md`,
  `TESTER-RESULT-079.md`, and `TESTER-DIRECTIVE-067.md` were read,
- confirmation the communication contract in this directive was followed,
- PR #192 head SHA tested,
- MSI/evidence SHA-256 and byte verification,
- install/upgrade/uninstall path used to replace the prior build,
- app launch and sign-in evidence,
- guided review visibility/confirmation result,
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
