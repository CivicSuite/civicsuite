# Tester Directive 074 - Completed model status persistence city-core gate

## Goal

Retest the Windows Local city-core cleanroom-equivalent gate using the corrected
MSI artifact from PR #192 head `841c878aa555d522c4de17ffe5f47d02e64515ab`.

`TESTER-RESULT-073.md` proved the corrected MSI installs, first-run admin
ordering is fixed, pre-admin model setup is no longer actionable, and local
admin sign-in works. The remaining failure was post-admin model download status
persistence: the full `.gguf` file existed at the expected size and the `.part`
file was gone, but `model-download-status.json` still said `Downloading` with
zero bytes/progress. This build persists the derived completed-file state
immediately after the `.part` file is renamed into the final `.gguf` path and
before checksum/registration work begins.

This build also uses the CivicSuite-hosted PostgreSQL 17.10-2 Windows runtime
mirror with a pinned SHA-256 so CI no longer depends on EDB/CloudFront
availability during MSI packaging.

Do not reboot or restart Windows.

## Communication Contract

All builder/tester communication for this gate is only through:

- Repository: `CivicSuite/civicsuite`
- Branch: `stage-3a-baremetal-windows`
- Folder: `test-comms`

No old bridge folder, local-only bridge folder, OneDrive path, Microsoft
cloud-sync path, chat-only note, or alternate branch is valid for this gate.

The tester must write exactly:

- `test-comms/TESTER-RESULT-074.md`

Codex/builder must check the live remote branch with `FETCH_HEAD` after fetching
before declaring a result absent. Do not rely only on a stale local
`origin/stage-3a-baremetal-windows` tracking ref.

## Required Branch And Continuity

- Repo test channel: `CivicSuite/civicsuite`
- Test channel branch: `stage-3a-baremetal-windows`
- Prior result to read: `test-comms/TESTER-RESULT-073.md`
- Prior directive to read: `test-comms/TESTER-DIRECTIVE-073.md`
- Prior full gate directive to read: `test-comms/TESTER-DIRECTIVE-067.md`
- Expected result file: `test-comms/TESTER-RESULT-074.md`
- Do not edit source, generated artifacts, module manifests, release status,
  tags, or docs outside `test-comms`.

## Product Artifact Truth

Use only this corrected product artifact:

- PR under test: `CivicSuite/civicsuite#192`
- Required PR head under test:
  `841c878aa555d522c4de17ffe5f47d02e64515ab`
- Source workflow run: `27583271781`
- Source workflow job: `build Windows Local MSI`
- Public prerelease tag: `windows-local-msi-ci-841c878`
- Public prerelease page:
  `https://github.com/CivicSuite/civicsuite/releases/tag/windows-local-msi-ci-841c878`
- MSI URL:
  `https://github.com/CivicSuite/civicsuite/releases/download/windows-local-msi-ci-841c878/CivicSuite_0.1.0_x64_en-US.msi`
- MSI SHA-256:
  `6bcaa6e0c3252231f0fb08a8047328ceccb70a0eaa41fc39450adcb8d12278f9`
- MSI bytes: `1639779575`
- Evidence URL:
  `https://github.com/CivicSuite/civicsuite/releases/download/windows-local-msi-ci-841c878/CivicSuite-msi-evidence.txt`
- Evidence SHA-256:
  `21c0b4a8eb549aec2a91481c531f62c6e90256ca02cfaacd669ceaecd17cb1af`
- Evidence bytes: `548`

Reject any artifact whose URL, PR head, size, or SHA-256 differs.

## Cleanroom-Equivalent Starting State

Use the existing tester machine. Do not reboot or restart Windows.

Before installing:

- close or stop any running `civicsuite-desktop.exe` process,
- uninstall any existing CivicSuite Windows install if present,
- if the old install is per-machine/all-users, use the most capable
  interactive/elevated Windows uninstall path available,
- remove prior CivicSuite local data/config/cache/artifact folders reachable
  from the tester account,
- remove prior downloaded test MSI/evidence files for older artifacts,
- confirm no CivicSuite install entry remains,
- confirm no `civicsuite-desktop.exe` process remains,
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
- standalone Home model setup is not visible before first CivicSuite
  local-admin sign-in,
- System Health may show model readiness before sign-in, but model action
  controls must be disabled and must tell the user to create/sign in as the
  first local administrator first,
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

Before first CivicSuite local-admin sign-in:

- Home must not expose actionable Gemma model setup controls,
- any reachable model setup action must be disabled or rejected with a clear
  first-local-admin/sign-in requirement,
- no model download/status mutation should begin from a pre-admin state.

After signing into the CivicSuite local-admin account in the normal app window:

- verify Gemma 4 12B QAT metadata is visible,
- verify the local model path is visible,
- click Download / Resume or Download Model,
- record action-result text after the click,
- wait long enough to observe download progress, partial file creation,
  `model-download-status.json`, or a visible error state,
- if the final `.gguf` appears and the `.part` file is gone, verify
  `model-download-status.json` no longer remains stuck at `Downloading` with
  zero bytes/progress,
- verify checksum behavior if the model file completes,
- verify load/register behavior if checksum succeeds.

Classify model setup carefully:

- external network/auth/storage/service limitation: `BLOCKED` with evidence,
- app button no-op, wrong path, no progress/error state, missing downloader,
  bad status persistence, misleading UI, or any pre-admin model mutation:
  `FAIL` with evidence.

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

Write `test-comms/TESTER-RESULT-074.md` with:

- final verdict: PASS, FAIL, or BLOCKED,
- tested branch and commit for the repo channel,
- confirmation `TESTER-RESULT-073.md`, `TESTER-DIRECTIVE-073.md`, and
  `TESTER-DIRECTIVE-067.md` were read,
- confirmation the communication contract in this directive was followed,
- PR #192 head SHA tested,
- corrected public prerelease URLs used,
- MSI and evidence SHA-256 verification,
- cleanroom-equivalent wipe/uninstall evidence,
- corrected MSI install evidence,
- normal app launch evidence,
- UI focus/input stability evidence,
- corrected first-run order result,
- pre-admin Home model setup visibility/actionability result,
- pre-admin System Health model action lock result if reached,
- first CivicSuite local-admin creation result,
- CivicSuite local-admin sign-in result,
- model setup result after app local-admin sign-in,
- completed model status persistence result,
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
