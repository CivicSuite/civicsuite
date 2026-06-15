# Tester Directive 072 - Elevated uninstall cleanup and corrected MSI gate

## Goal

Continue the corrected Windows Local city-core cleanroom-equivalent gate after
`TESTER-RESULT-071.md`.

Result 071 verified the corrected public MSI and evidence files for PR #192
head `489b45cac51ff4d55b1b5a0411dc16693e28757d`, but could not remove the
existing per-machine CivicSuite install from a medium-integrity worker token.
The uninstall blocker was Windows Installer `Error 1730`: administrator rights
are required to remove the existing all-users MSI install.

For this directive, use the most capable interactive/elevated Windows uninstall
path available to remove the old CivicSuite MSI install, then install and test
the corrected MSI artifact from directive 071.

Do not reboot or restart Windows.

## Required Branch And Continuity

- Repo test channel: `CivicSuite/civicsuite`
- Test channel branch: `stage-3a-baremetal-windows`
- Prior result to read: `test-comms/TESTER-RESULT-071.md`
- Prior directive to read: `test-comms/TESTER-DIRECTIVE-071.md`
- Prior full gate directive to read: `test-comms/TESTER-DIRECTIVE-067.md`
- Expected result file: `test-comms/TESTER-RESULT-072.md`
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

## Elevated Uninstall Requirement

Use elevation for cleanup of the old all-users MSI install. Do not stop at the
medium-token `Error 1730` result already proven in result 071.

Allowed elevated cleanup paths include:

- an interactive Windows Apps/Installed Apps uninstall with UAC approval,
- an elevated PowerShell or administrator command context that runs the Windows
  Installer uninstall for `{F6DA9BD7-B75C-405B-9799-ED10E105CEC0}`,
- an elevated `msiexec` uninstall launched with the available UAC/elevation
  path,
- another already-available admin/elevated process-control path that removes
  the same CivicSuite install.

Record:

- which elevated uninstall path was used,
- whether UAC appeared and whether it was approved,
- uninstall exit code or Windows Settings result,
- MSI uninstall log if available,
- confirmation the HKLM CivicSuite uninstall entry is gone,
- confirmation `C:\Program Files\CivicSuite\` is removed or empty enough that a
  fresh install can proceed,
- confirmation no `civicsuite-desktop.exe` process remains.

If no interactive/elevated path is available at all, report
`BLOCKED - elevated uninstall path unavailable` with evidence of every attempted
admin path. Otherwise proceed.

Do not reboot or restart Windows for cleanup.

## Cleanroom-Equivalent Wipe After Uninstall

After the old MSI is removed:

- remove prior CivicSuite local data/config/cache/artifact folders reachable
  from the tester account,
- remove older downloaded test MSI/evidence files except the corrected artifact
  currently under test,
- confirm no stale `civicsuite-desktop.exe` process remains,
- record cleanup evidence.

Do not hand-edit CivicSuite local config or data files to make setup pass.

## Install Corrected MSI

Download or reuse the corrected public prerelease MSI and evidence file, verify
SHA-256, then install the corrected MSI using the real Windows installer path
available on the machine.

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

Use process/window-handle-targeted automation wherever possible:

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

## Corrected First-Run Setup Checks

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

Write `test-comms/TESTER-RESULT-072.md` with:

- final verdict: PASS, FAIL, or BLOCKED,
- tested branch and commit for the repo channel,
- confirmation `TESTER-RESULT-071.md`, `TESTER-DIRECTIVE-071.md`, and
  `TESTER-DIRECTIVE-067.md` were read,
- PR #192 head SHA tested,
- corrected public prerelease URLs used,
- MSI and evidence SHA-256 verification,
- elevated uninstall evidence,
- cleanroom-equivalent wipe evidence,
- corrected MSI install evidence,
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

Pass only if the old all-users MSI is removed without rebooting Windows, the
corrected MSI installs from a cleanroom-equivalent state, the installed
CivicSuite app can be driven from the normal interactive user session, the first
CivicSuite local administrator can be created and signed into through the app
UI, the corrected first-run order is visible, the model setup path behaves
correctly for that app local-admin account, and the directive 067 city-core gate
passes without Docker, without WSL, without rebooting Windows, and without
terminal use for normal clerk workflows.

Any missing, mock-only, in-memory-only, Docker-only, WSL-only, terminal-only, or
non-durable requirement is a FAIL unless it is clearly an external host,
network, privilege, or tester-harness blocker, in which case use BLOCKED with
evidence.

## Constraints

Push only `test-comms/TESTER-RESULT-072.md` to
`stage-3a-baremetal-windows`. Do not edit source code, generated artifacts,
module manifests, release status, tags, or docs outside `test-comms`. Do not
merge. Do not promote release status. Never touch OneDrive or any Microsoft
cloud-sync path. Do not reboot or restart Windows for this directive.
