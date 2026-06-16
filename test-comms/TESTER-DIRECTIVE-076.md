# Tester Directive 076 - Bundled Ollama runtime start and city-core gate

## Goal

Retest the Windows Local city-core cleanroom-equivalent gate using the corrected
MSI artifact from PR #192 head `53f8f0e31e11e4a64109c4b1080ff0c458b2f55c`.

`TESTER-RESULT-075.md` proved the directive 075 targeted regressions passed:

- pre-sign-in model action lock passed,
- Verify Checksum app survival passed,
- Verify Checksum persisted status and registry passed.

The continued full city-core gate then failed because the verified model could
not be loaded into the local Ollama runtime. System Health stayed `Needs
runtime`, and `Load in Ollama` reported Ollama was not responding at
`http://127.0.0.1:15434/api/tags`.

This build changes `Load in Ollama` so it starts the bundled `model-runtime`
service, waits for Ollama health before creating/loading the model, sets
`OLLAMA_MODELS` to the CivicSuite local data model store, creates that local
model store, and starts services from their binary folder.

Do not reboot or restart Windows.

## Communication Contract

All builder/tester communication for this gate is only through:

- Repository: `CivicSuite/civicsuite`
- Branch: `stage-3a-baremetal-windows`
- Folder: `test-comms`

No old bridge folder, local-only bridge folder, OneDrive path, Microsoft
cloud-sync path, chat-only note, or alternate branch is valid for this gate.

The tester must write exactly:

- `test-comms/TESTER-RESULT-076.md`

Codex/builder must check the live remote branch with `FETCH_HEAD` after fetching
before declaring a result absent. Do not rely only on a stale local
`origin/stage-3a-baremetal-windows` tracking ref.

## Required Branch And Continuity

- Repo test channel: `CivicSuite/civicsuite`
- Test channel branch: `stage-3a-baremetal-windows`
- Prior result to read: `test-comms/TESTER-RESULT-075.md`
- Prior directive to read: `test-comms/TESTER-DIRECTIVE-075.md`
- Prior full gate directive to read: `test-comms/TESTER-DIRECTIVE-067.md`
- Expected result file: `test-comms/TESTER-RESULT-076.md`
- Do not edit source, generated artifacts, module manifests, release status,
  tags, or docs outside `test-comms`.

## Product Artifact Truth

Use only this corrected product artifact:

- PR under test: `CivicSuite/civicsuite#192`
- Required PR head under test:
  `53f8f0e31e11e4a64109c4b1080ff0c458b2f55c`
- Source workflow run: `27595815083`
- Source workflow job: `build Windows Local MSI`
- Public prerelease tag: `windows-local-msi-ci-53f8f0e`
- Public prerelease page:
  `https://github.com/CivicSuite/civicsuite/releases/tag/windows-local-msi-ci-53f8f0e`
- MSI URL:
  `https://github.com/CivicSuite/civicsuite/releases/download/windows-local-msi-ci-53f8f0e/CivicSuite_0.1.0_x64_en-US.msi`
- MSI SHA-256:
  `7ae0385a04d2e81b4ef6903647f4b5e27742125cc9bd62b3f068657475fe1e84`
- MSI bytes: `1639804151`
- Evidence URL:
  `https://github.com/CivicSuite/civicsuite/releases/download/windows-local-msi-ci-53f8f0e/CivicSuite-msi-evidence.txt`
- Evidence SHA-256:
  `4c56a197f4dbd007ad5728634eb7912c6a333b141c46a328c368dcfb0ca2c1b6`
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

Verify the corrected failure from `TESTER-RESULT-075.md` before continuing the
full gate.

### Bundled Ollama Runtime Start And Load

After signing into the CivicSuite local-admin account in the normal app window:

- verify Gemma 4 12B QAT metadata is visible,
- verify the local model path is visible,
- confirm the final `.gguf` model file is present or download/resume it through
  the app if needed,
- click `Verify Checksum` if the app has not already persisted verified model
  state,
- click `Load in Ollama`,
- confirm CivicSuite starts or reuses the bundled `model-runtime` service,
- confirm the local Ollama runtime becomes reachable at
  `http://127.0.0.1:15434/api/tags`,
- confirm `OLLAMA_MODELS`/runtime model storage points at the CivicSuite local
  data model store, not a user-global or external Ollama model store,
- confirm the model create/load action completes or reports a clear recoverable
  error while the app remains alive,
- confirm System Health advances beyond `Needs runtime` when the bundled
  runtime is healthy and the model load succeeds,
- record process evidence for the bundled `ollama.exe`, runtime health
  response evidence, System Health screenshot, and model registry/status state.

Classify runtime load behavior carefully:

- app termination, disappearing WebView, no runtime start attempt, no
  recoverable status, or continued `Needs runtime` after a healthy bundled
  runtime and successful model load: `FAIL`,
- external storage, antivirus, permission, or harness limitation with app alive
  and a clear recoverable status: `BLOCKED`,
- bundled runtime starts, health endpoint responds, model load succeeds, and
  System Health advances accordingly: `PASS`.

## Continue Full City-Core Gate

If the targeted regression check passes, or reaches an externally-blocked but
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

Write `test-comms/TESTER-RESULT-076.md` with:

- final verdict: PASS, FAIL, or BLOCKED,
- tested branch and commit for the repo channel,
- confirmation `TESTER-RESULT-075.md`, `TESTER-DIRECTIVE-075.md`, and
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
- bundled Ollama runtime start result,
- `OLLAMA_MODELS`/local model store result,
- Load in Ollama result,
- System Health runtime/model readiness result,
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
