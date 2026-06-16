# Tester Directive 075 - Admin-gated model actions and checksum isolation city-core gate

## Goal

Retest the Windows Local city-core cleanroom-equivalent gate using the corrected
MSI artifact from PR #192 head `2f4de300085e410f6dbc85c1dd2a3db3e80d8863`.

`TESTER-RESULT-074.md` proved the completed-model download status persistence
fix passed, but the full gate still failed because:

- System Health model controls were enabled after first-admin creation before
  CivicSuite local-admin sign-in.
- `Verify Checksum` against the correct completed model terminated the app
  without advancing persisted model state or writing model registry state.

This build requires `signed_in && local-admin` before frontend model controls
and actions unlock, returns a guarded local "Sign in required" model action
result before invoking the backend, and runs backend model actions through a
blocking Tauri worker with panic capture.

Do not reboot or restart Windows.

## Communication Contract

All builder/tester communication for this gate is only through:

- Repository: `CivicSuite/civicsuite`
- Branch: `stage-3a-baremetal-windows`
- Folder: `test-comms`

No old bridge folder, local-only bridge folder, OneDrive path, Microsoft
cloud-sync path, chat-only note, or alternate branch is valid for this gate.

The tester must write exactly:

- `test-comms/TESTER-RESULT-075.md`

Codex/builder must check the live remote branch with `FETCH_HEAD` after fetching
before declaring a result absent. Do not rely only on a stale local
`origin/stage-3a-baremetal-windows` tracking ref.

## Required Branch And Continuity

- Repo test channel: `CivicSuite/civicsuite`
- Test channel branch: `stage-3a-baremetal-windows`
- Prior result to read: `test-comms/TESTER-RESULT-074.md`
- Prior directive to read: `test-comms/TESTER-DIRECTIVE-074.md`
- Prior full gate directive to read: `test-comms/TESTER-DIRECTIVE-067.md`
- Expected result file: `test-comms/TESTER-RESULT-075.md`
- Do not edit source, generated artifacts, module manifests, release status,
  tags, or docs outside `test-comms`.

## Product Artifact Truth

Use only this corrected product artifact:

- PR under test: `CivicSuite/civicsuite#192`
- Required PR head under test:
  `2f4de300085e410f6dbc85c1dd2a3db3e80d8863`
- Source workflow run: `27589801188`
- Source workflow job: `build Windows Local MSI`
- Public prerelease tag: `windows-local-msi-ci-2f4de30`
- Public prerelease page:
  `https://github.com/CivicSuite/civicsuite/releases/tag/windows-local-msi-ci-2f4de30`
- MSI URL:
  `https://github.com/CivicSuite/civicsuite/releases/download/windows-local-msi-ci-2f4de30/CivicSuite_0.1.0_x64_en-US.msi`
- MSI SHA-256:
  `b7e31f8f66521cc343c4a9f9f7cbc677cd73004ef76547863e0a24033a3e0b9d`
- MSI bytes: `1639791863`
- Evidence URL:
  `https://github.com/CivicSuite/civicsuite/releases/download/windows-local-msi-ci-2f4de30/CivicSuite-msi-evidence.txt`
- Evidence SHA-256:
  `f534a7d7649ae75ebff3ae0c2a633f0bb5e081334540c4bbc8a22f0ea33e7664`
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

## Targeted Regression Checks

Verify the two corrected failures from `TESTER-RESULT-074.md` before continuing
the full gate.

### Pre-Sign-In Model Action Lock

After city profile and first CivicSuite local administrator are created, but
before signing into that CivicSuite local-admin account:

- the app may show `Sign In`,
- Home must not expose actionable Gemma model setup controls,
- System Health may show model readiness information,
- all reachable model setup action controls must be disabled or must return a
  clear first-local-admin/sign-in requirement,
- `Open Model Folder`, `Download / Resume`, `Verify Checksum`,
  `Load in Ollama`, and `Retry Setup` must not be enabled actionable controls,
- no model download/status mutation should begin from this pre-sign-in state.

Record DOM/control disabled state, visible text, screenshot, and file/status
state after any attempted pre-sign-in model action.

### Verify Checksum App Survival And State

After signing into the CivicSuite local-admin account in the normal app window:

- verify Gemma 4 12B QAT metadata is visible,
- verify the local model path is visible,
- click Download / Resume or Download Model,
- wait for the final `.gguf` model file or a clear app-reported blocked/error
  state,
- if the final `.gguf` exists and the `.part` file is gone, verify
  `model-download-status.json` no longer remains stuck at `Downloading` with
  zero bytes/progress,
- click `Verify Checksum`,
- confirm the CivicSuite app process and WebView remain alive afterward,
- confirm checksum success advances persisted model state and/or writes the
  expected registry state,
- if checksum cannot complete for an external reason, confirm the app remains
  alive and shows/persists a clear recoverable error.

Classify checksum behavior carefully:

- app termination, disappearing WebView, no persisted progress/error, or
  registry/status not advancing after a correct checksum: `FAIL`,
- external network/auth/storage/service limitation with app alive and clear
  recoverable status: `BLOCKED`,
- completed checksum with app alive and persisted verified/registered state:
  `PASS`.

## Continue Full City-Core Gate

If the targeted regression checks pass, or reach an externally-blocked but
correctly reported state, continue all reachable directive 067 sections without
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

Write `test-comms/TESTER-RESULT-075.md` with:

- final verdict: PASS, FAIL, or BLOCKED,
- tested branch and commit for the repo channel,
- confirmation `TESTER-RESULT-074.md`, `TESTER-DIRECTIVE-074.md`, and
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
- pre-admin System Health model action lock result,
- first CivicSuite local-admin creation result,
- CivicSuite local-admin sign-in result,
- model setup result after app local-admin sign-in,
- completed model status persistence result,
- Verify Checksum app survival result,
- Verify Checksum persisted state/registry result,
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
