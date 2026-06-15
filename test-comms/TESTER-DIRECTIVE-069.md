# Tester Directive 069 - Continue installed app gate with CivicSuite local-admin sign-in

## Goal

Continue the Windows Local city-core cleanroom-equivalent gate after
`TESTER-RESULT-068.md`.

Result 068 proved the elevated Windows MSI installer path works:

- the MSI installed successfully,
- the uninstall entry exists,
- `C:\Program Files\CivicSuite\civicsuite-desktop.exe` launches,
- the app reaches first-run setup.

The remaining blocker in result 068 was not MSI elevation. It was post-install
workflow automation confusion around the phrase "local administrator". In this
product, "local administrator" means a CivicSuite app user role created in
first-run setup. It is not the same thing as running the desktop app with a
Windows elevated/UAC token.

For this directive, do not launch the CivicSuite desktop app elevated for normal
UI automation. Use the installed app in the normal medium-integrity user
session, create the first CivicSuite local administrator, sign into that app
account, then continue model setup and the full directive 067 gate.

## Required Branch And Continuity

- Repo test channel: `CivicSuite/civicsuite`
- Test channel branch: `stage-3a-baremetal-windows`
- Prior directive to read: `test-comms/TESTER-DIRECTIVE-068.md`
- Prior result to read: `test-comms/TESTER-RESULT-068.md`
- Additional prior directive to read: `test-comms/TESTER-DIRECTIVE-067.md`
- Expected result file: `test-comms/TESTER-RESULT-069.md`
- Do not edit source, generated artifacts, module manifests, release status,
  tags, or docs outside `test-comms`.

## Product Artifact Truth

Continue with the same product artifact and installed state from result 068
when possible:

- PR under test: `CivicSuite/civicsuite#192`
- Required PR head under test:
  `a8c6715d8434160c8ade722d9459f2247fb7369d`
- Source workflow run: `27522471421`
- Source workflow job: `build Windows Local MSI`
- Public prerelease tag: `windows-local-msi-ci-a8c6715`
- Installed executable from result 068:
  `C:\Program Files\CivicSuite\civicsuite-desktop.exe`

If the installed state from result 068 was removed or damaged, repeat the
directive 068 cleanup, artifact verification, and elevated MSI install. Do not
reboot or restart Windows.

## Required Starting State

Before continuing:

- Confirm `TESTER-RESULT-068.md` was read.
- Confirm the elevated MSI install succeeded in result 068.
- Confirm whether CivicSuite is currently installed.
- Confirm no elevated CivicSuite app process remains from result 068. If one
  remains and blocks testing, stop it only from an available elevated/admin
  context; otherwise record the process as a harness blocker.
- Launch the installed CivicSuite app as the normal interactive user, not with
  Windows UAC elevation.
- Record current process integrity and whether the app UI is automatable from
  the tester context.

## CivicSuite Local Admin Setup

Create the first CivicSuite local administrator through the app UI before
attempting model setup again.

Use one of the app's visible paths:

- the first-run "First admin user" step, if reachable; or
- the Settings > First Admin form, if the first-run step is not yet current; or
- another visible CivicSuite first-run/setup screen that saves the first admin
  through the app.

Do not hand-edit local config files to create the admin.

Record:

- path used to create the first CivicSuite local admin,
- admin display name/email used for the test,
- whether a passcode was accepted,
- whether the app reports the first admin exists,
- whether sign-in as that CivicSuite local administrator succeeds,
- screenshot/evidence of signed-in local-admin state.

If the app does not allow the first CivicSuite local admin to be created before
the model step, mark this as `FAIL - first-run local-admin bootstrap blocked`
and include screenshots/logs. That would be a product workflow bug, because
model setup is local-admin-controlled after setup and the app must provide a
clear way to create/sign into the app admin before demanding it.

## Model Setup After App Local-Admin Sign-In

After signing into the CivicSuite local-admin account in the normal app window,
rerun model setup from the app UI:

- verify Gemma 4 12B QAT metadata is visible,
- verify the local model path is visible to the signed-in app local admin,
- click Download / Resume or Download Model,
- record action-result text after the click,
- wait long enough to observe whether download progress, partial file creation,
  model-download-status.json, or an error state appears,
- verify checksum behavior if the model file completes,
- verify load/register behavior if checksum succeeds.

If the download cannot complete because the model is too large, network access
is unavailable, Hugging Face access is blocked, disk is insufficient, or the
runtime is missing, report `BLOCKED` or `FAIL` based on the exact cause:

- external network/auth/storage/service limitation: `BLOCKED` with evidence,
- app button does nothing, wrong path, no progress/error state, missing
  downloader, bad status persistence, or misleading UI: `FAIL` with evidence.

Do not launch the app elevated merely to drive the model UI. If the normal app
local-admin sign-in still cannot run model setup and the app insists on Windows
elevation, report that as `FAIL - model setup incorrectly requires Windows
elevation`.

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
local data files to make workflows pass. Do not use Docker, WSL, repo-local
bootstrap scripts, old bridge folders, alternate packages, reboot, or Windows
restart.

## Required Result File Format

Write `test-comms/TESTER-RESULT-069.md` with:

- final verdict: PASS, FAIL, or BLOCKED,
- tested branch and commit for the repo channel,
- confirmation `TESTER-DIRECTIVE-068.md`, `TESTER-RESULT-068.md`, and
  `TESTER-DIRECTIVE-067.md` were read,
- PR #192 head SHA tested,
- installed app state from result 068 or repeated install evidence,
- normal app launch evidence,
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

Pass only if the installed CivicSuite app can be driven from the normal
interactive user session, the first CivicSuite local administrator can be
created and signed into through the app UI, the model setup path behaves
correctly for that app local-admin account, and the directive 067 city-core gate
passes without Docker, without WSL, without rebooting Windows, and without
terminal use for normal clerk workflows.

Any missing, mock-only, in-memory-only, Docker-only, WSL-only, terminal-only, or
non-durable requirement is a FAIL unless it is clearly an external host,
network, privilege, or tester-harness blocker, in which case use BLOCKED with
evidence.

## Constraints

Push only `test-comms/TESTER-RESULT-069.md` to
`stage-3a-baremetal-windows`. Do not edit source code, generated artifacts,
module manifests, release status, tags, or docs outside `test-comms`. Do not
merge. Do not promote release status. Never touch OneDrive or any Microsoft
cloud-sync path. Do not reboot or restart Windows for this directive.
