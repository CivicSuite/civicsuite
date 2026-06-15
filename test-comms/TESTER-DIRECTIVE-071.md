# Tester Directive 071 - Corrected MSI cleanroom-equivalent city-core gate

## Goal

Retest the Windows Local city-core cleanroom-equivalent gate using the corrected
MSI artifact from PR #192 head `489b45cac51ff4d55b1b5a0411dc16693e28757d`.

This corrected build changes first-run setup so the clerk path is:

1. city profile,
2. first CivicSuite local administrator,
3. sign in as that CivicSuite local administrator,
4. backup folder,
5. local model setup,
6. health verification,
7. city-core workflows.

This directive supersedes the old artifact used in results 067 through 070.
Result 070 cleared the stale elevated process blocker. Do not retest the old
`a8c6715` artifact for this gate.

Do not reboot or restart Windows.

## Required Branch And Continuity

- Repo test channel: `CivicSuite/civicsuite`
- Test channel branch: `stage-3a-baremetal-windows`
- Prior result to read: `test-comms/TESTER-RESULT-070.md`
- Prior directive to read: `test-comms/TESTER-DIRECTIVE-070.md`
- Prior full gate directive to read: `test-comms/TESTER-DIRECTIVE-067.md`
- Expected result file: `test-comms/TESTER-RESULT-071.md`
- Do not edit source, generated artifacts, module manifests, release status,
  tags, or docs outside `test-comms`.

## Product Artifact Truth

Use only this corrected product artifact:

- PR under test: `CivicSuite/civicsuite#192`
- Required PR head under test:
  `489b45cac51ff4d55b1b5a0411dc16693e28757d`
- Source workflow run: `27554969512`
- Source workflow job: `build Windows Local MSI`
- Public prerelease tag: `windows-local-msi-ci-489b45c`
- Public prerelease page:
  `https://github.com/CivicSuite/civicsuite/releases/tag/windows-local-msi-ci-489b45c`
- MSI URL:
  `https://github.com/CivicSuite/civicsuite/releases/download/windows-local-msi-ci-489b45c/CivicSuite_0.1.0_x64_en-US.msi`
- MSI SHA-256:
  `2cf2940a247d489a16b457e818aa988c1580012332f8935128fbcd182a5f3aae`
- MSI bytes: `1639775191`
- Evidence URL:
  `https://github.com/CivicSuite/civicsuite/releases/download/windows-local-msi-ci-489b45c/CivicSuite-msi-evidence.txt`
- Evidence SHA-256:
  `00193b8452f8ce8573b7fc04e8d835e9eaae9345313ec30287e5eb623222e8a2`
- Evidence bytes: `548`

Reject any artifact whose URL, PR head, size, or SHA-256 differs.

## Cleanroom-Equivalent Starting State

Use the existing tester machine. Do not reboot or restart Windows.

Before installing:

- close or stop any running `civicsuite-desktop.exe` process,
- uninstall any existing CivicSuite Windows install if present,
- remove prior CivicSuite local data/config/cache/artifact folders reachable
  from the tester account,
- remove prior downloaded test MSI/evidence files for older artifacts,
- confirm no CivicSuite install entry remains,
- confirm no `civicsuite-desktop.exe` process remains,
- record the cleanup evidence.

If an elevated/admin path is needed to uninstall or clear stale processes, use
the most capable elevated/admin Windows path available. Do not use elevation to
drive the normal clerk workflow after install.

## Install Corrected MSI

Download the corrected public prerelease MSI and evidence file, verify SHA-256,
then install the MSI using the real Windows installer path available on the
machine.

If the MSI requires elevation for install, use the most capable elevated/admin
installer path available. Record:

- installer path used,
- UAC/elevation method if any,
- install exit code,
- install location,
- uninstall entry,
- installed executable path.

After install, launch `C:\Program Files\CivicSuite\civicsuite-desktop.exe` as
the normal interactive user, not elevated.

## UI Automation Stability Requirements

Result 070 was blocked by WebView focus/input instability. For this run, use
process/window-handle-targeted automation wherever possible:

- target the normal medium-integrity CivicSuite process/window handle,
- close accidental shell overlays such as Microsoft Store, Edge, Snipping Tool,
  or notification surfaces before continuing,
- before each input batch, verify the foreground window title is `CivicSuite`,
- after each input batch, verify the intended CivicSuite field changed,
- prefer tab-order and accessibility/name-targeted controls over blind
  coordinate clicks,
- keep screenshots and process/window state around every failed focus attempt.

If input becomes unstable, attempt one controlled recovery:

- close accidental overlay windows,
- re-focus the CivicSuite window by handle,
- re-open the intended CivicSuite screen from visible navigation,
- resume from the last confirmed field state.

If the harness still cannot reliably type into or click the visible CivicSuite
WebView after that recovery, report `BLOCKED - tester harness WebView input
instability` with screenshots and foreground-window/process evidence.

Do not hand-edit CivicSuite local config or data files to make setup pass.

## First-Run Setup Checks

Verify the corrected first-run order in the installed app:

- city profile appears before local model setup,
- first admin user appears before local model setup,
- first-admin copy tells the clerk to sign in before continuing setup,
- local model setup appears after the first-admin/sign-in path, not before it.

Complete setup through the app UI:

- confirm unsigned beta and SmartScreen notice steps if visible,
- confirm local folders,
- keep the City Core module profile selected,
- create the city profile,
- create the first CivicSuite local administrator,
- sign in as that CivicSuite local administrator,
- choose/confirm the backup folder,
- run local model setup,
- run health verification.

In this product, "local administrator" means a CivicSuite app user role created
inside first-run setup. It is not the same thing as running the desktop app
with a Windows elevated/UAC token.

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

## Continue Full City-Core Gate

If setup reaches an acceptable ready or externally-blocked-but-correctly
reported model state, continue all reachable directive 067 sections without
rebooting or restarting Windows:

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
local data files to make workflows pass. Do not use Docker, WSL, repo-local
bootstrap scripts, old bridge folders, alternate packages, Windows reboot, or
Windows restart.

## Required Result File Format

Write `test-comms/TESTER-RESULT-071.md` with:

- final verdict: PASS, FAIL, or BLOCKED,
- tested branch and commit for the repo channel,
- confirmation `TESTER-RESULT-070.md`, `TESTER-DIRECTIVE-070.md`, and
  `TESTER-DIRECTIVE-067.md` were read,
- PR #192 head SHA tested,
- corrected public prerelease URLs used,
- MSI and evidence SHA-256 verification,
- cleanroom-equivalent wipe/uninstall evidence,
- install evidence,
- normal app launch evidence,
- UI focus/input stability evidence,
- corrected first-run order result,
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

Pass only if the corrected MSI installs from a cleanroom-equivalent state, the
installed CivicSuite app can be driven from the normal interactive user session,
the first CivicSuite local administrator can be created and signed into through
the app UI, the corrected first-run order is visible, the model setup path
behaves correctly for that app local-admin account, and the directive 067
city-core gate passes without Docker, without WSL, without rebooting Windows,
and without terminal use for normal clerk workflows.

Any missing, mock-only, in-memory-only, Docker-only, WSL-only, terminal-only, or
non-durable requirement is a FAIL unless it is clearly an external host,
network, privilege, or tester-harness blocker, in which case use BLOCKED with
evidence.

## Constraints

Push only `test-comms/TESTER-RESULT-071.md` to
`stage-3a-baremetal-windows`. Do not edit source code, generated artifacts,
module manifests, release status, tags, or docs outside `test-comms`. Do not
merge. Do not promote release status. Never touch OneDrive or any Microsoft
cloud-sync path. Do not reboot or restart Windows for this directive.
