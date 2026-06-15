# Tester Directive 070 - Clear stale elevated app process and resume normal clerk gate

## Goal

Continue the Windows Local city-core cleanroom-equivalent gate after
`TESTER-RESULT-069.md`.

Result 069 confirmed:

- the elevated MSI installation from result 068 remains intact,
- CivicSuite is installed in `C:\Program Files\CivicSuite\`,
- the installed executable launches as the normal medium-integrity user,
- the visible app reaches the Windows Local first-run checklist.

The remaining blocker is a stale elevated `civicsuite-desktop.exe` process from
result 068. That process owns the foreground CivicSuite window and cannot be
stopped, minimized, moved, or window-managed by the normal medium-integrity
tester worker.

For this directive, use the most capable elevated/admin Windows path available
only to close or stop the stale elevated CivicSuite desktop process. After that
cleanup, return to the normal non-elevated app window and continue the
directive 069 local-admin setup, model setup, and directive 067 city-core clerk
walkthrough.

Do not reboot or restart Windows.

## Required Branch And Continuity

- Repo test channel: `CivicSuite/civicsuite`
- Test channel branch: `stage-3a-baremetal-windows`
- Prior directive to read: `test-comms/TESTER-DIRECTIVE-069.md`
- Prior result to read: `test-comms/TESTER-RESULT-069.md`
- Additional prior directive to read: `test-comms/TESTER-DIRECTIVE-067.md`
- Expected result file: `test-comms/TESTER-RESULT-070.md`
- Do not edit source, generated artifacts, module manifests, release status,
  tags, or docs outside `test-comms`.

## Product Artifact Truth

Continue with the same product artifact and installed app state from results
068 and 069 when possible:

- PR under test: `CivicSuite/civicsuite#192`
- Required PR head under test:
  `a8c6715d8434160c8ade722d9459f2247fb7369d`
- Source workflow run: `27522471421`
- Source workflow job: `build Windows Local MSI`
- Public prerelease tag: `windows-local-msi-ci-a8c6715`
- Installed executable from results 068 and 069:
  `C:\Program Files\CivicSuite\civicsuite-desktop.exe`

If the installed state from results 068 and 069 was removed or damaged, repeat
the directive 068 artifact verification and elevated MSI install. Do not reboot
or restart Windows.

## Elevated Cleanup Scope

Use elevation only for cleanup of the stale elevated CivicSuite desktop process
from result 069.

Allowed cleanup paths:

- close the stale elevated CivicSuite window from the interactive desktop,
- use an elevated/admin PowerShell or Task Manager context to stop the stale
  `civicsuite-desktop.exe` process,
- use another already-available admin/elevated process-control path to stop
  the stale process.

Record:

- every `civicsuite-desktop.exe` process before cleanup,
- which process was stale/elevated,
- cleanup method used,
- whether UAC approval was required and whether it was approved,
- every `civicsuite-desktop.exe` process after cleanup,
- confirmation no elevated CivicSuite desktop process remains before normal UI
  automation resumes.

Do not use elevation to drive the normal app workflow. Elevation is allowed only
to clear the stale process or, if the install state is damaged, to repair the
installer state.

If no elevated/admin path is available to clear the stale process, report
`BLOCKED - elevated stale process cannot be cleared by tester harness` with the
process list and access-denied evidence.

## Resume Normal App Workflow

After the stale elevated process is cleared:

- launch `C:\Program Files\CivicSuite\civicsuite-desktop.exe` as the normal
  interactive user,
- verify the app process is medium-integrity and automatable,
- verify the first visible screen reaches the Windows Local first-run surface,
- create the first CivicSuite local administrator through the app UI,
- sign into the app as that CivicSuite local administrator,
- rerun model setup from the app UI as the signed-in app local admin,
- continue all reachable directive 067 city-core gate sections.

In this product, "local administrator" means a CivicSuite app user role created
inside first-run setup. It is not the same thing as running the desktop app
with a Windows elevated/UAC token.

Do not hand-edit local config files to create the admin. Do not use Docker,
WSL, repo-local bootstrap scripts, old bridge folders, alternate packages,
Windows reboot, or Windows restart.

## Model Setup Expectations

After signing into the CivicSuite local-admin account in the normal app window:

- verify Gemma 4 12B QAT metadata is visible,
- verify the local model path is visible,
- click Download / Resume or Download Model,
- record action-result text after the click,
- wait long enough to observe download progress, partial file creation,
  `model-download-status.json`, or a visible error state,
- verify checksum behavior if the model file completes,
- verify load/register behavior if checksum succeeds.

Classify model setup carefully:

- external network/auth/storage/service limitation: `BLOCKED` with evidence,
- app button no-op, wrong path, no progress/error state, missing downloader,
  bad status persistence, or misleading UI: `FAIL` with evidence.

If normal app local-admin sign-in still cannot run model setup and the app
insists on Windows elevation, report `FAIL - model setup incorrectly requires
Windows elevation`.

## Continue Full Gate After Model Setup

If model setup reaches an acceptable ready or externally-blocked-but-correctly
reported state, continue all reachable directive 067 sections without rebooting
or restarting Windows:

- System Health,
- module manager,
- Local Users/RBAC,
- CivicClerk workflow,
- CivicRecords AI workflow,
- resident/public records request workflow,
- CivicCode workflow,
- cross-module search and handoffs,
- close/reopen persistence,
- backup/restore,
- support bundle,
- repair,
- prepare uninstall,
- Windows uninstall,
- reinstall,
- restore from final backup.

Use app screens and desktop file pickers for city workflows. Do not hand-edit
local data files to make workflows pass.

## Required Result File Format

Write `test-comms/TESTER-RESULT-070.md` with:

- final verdict: PASS, FAIL, or BLOCKED,
- tested branch and commit for the repo channel,
- confirmation `TESTER-DIRECTIVE-069.md`, `TESTER-RESULT-069.md`, and
  `TESTER-DIRECTIVE-067.md` were read,
- PR #192 head SHA tested,
- installed app state from results 068 and 069 or repeated install evidence,
- elevated stale-process cleanup evidence,
- normal app launch evidence after cleanup,
- first CivicSuite local-admin creation result,
- CivicSuite local-admin sign-in result,
- model setup result after app local-admin sign-in,
- System Health/admin-gating result if reached,
- module manager result if reached,
- Local Users/RBAC result if reached,
- CivicClerk workflow result if reached,
- CivicRecords AI workflow result if reached,
- resident/public records request result if reached,
- CivicCode workflow result if reached,
- cross-module search/handoff result if reached,
- close/reopen persistence result if reached,
- backup/restore result if reached,
- support bundle result if reached,
- repair result if reached,
- uninstall/reinstall/restore result if reached,
- confirmation Windows was not rebooted or restarted,
- exact blocker or failure details for any failed requirement.

## Pass Criteria

Pass only if the stale elevated process is cleared without rebooting Windows,
the installed CivicSuite app can then be driven from the normal interactive
user session, the first CivicSuite local administrator can be created and signed
into through the app UI, the model setup path behaves correctly for that app
local-admin account, and the directive 067 city-core gate passes without Docker,
without WSL, without rebooting Windows, and without terminal use for normal
clerk workflows.

Any missing, mock-only, in-memory-only, Docker-only, WSL-only, terminal-only, or
non-durable requirement is a FAIL unless it is clearly an external host,
network, privilege, or tester-harness blocker, in which case use BLOCKED with
evidence.

## Constraints

Push only `test-comms/TESTER-RESULT-070.md` to
`stage-3a-baremetal-windows`. Do not edit source code, generated artifacts,
module manifests, release status, tags, or docs outside `test-comms`. Do not
merge. Do not promote release status. Never touch OneDrive or any Microsoft
cloud-sync path. Do not reboot or restart Windows for this directive.
