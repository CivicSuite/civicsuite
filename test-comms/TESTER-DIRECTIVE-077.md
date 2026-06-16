# Tester Directive 077 - Bundled Ollama payload source and city-core gate

## Goal

Retest the Windows Local city-core cleanroom-equivalent gate using the corrected
MSI artifact from PR #192 head `26e66ef6f9dba43a5f28f6b7adc6a4d5b84bc09c`.

`TESTER-RESULT-076.md` proved the first-run admin gates, completed model status
persistence, checksum survival, and verified model registry were working, but
the bundled local Ollama runtime still did not become reachable. The tester saw
the installed payload at `C:\Program Files\CivicSuite\_up_\runtime\payload\ollama\ollama.exe`,
while the only observed `ollama.exe` process was the user-global Ollama path.
System Health stayed `Needs runtime`, and `http://127.0.0.1:15434/api/tags`
remained unreachable.

This build fixes the runtime payload source by honoring the saved first-run
install root, discovering the MSI/Tauri `_up_\runtime\payload` layout,
preparing/installing the `model-runtime` payload before starting it, and
preventing Windows model load from falling back to a user-global `ollama.exe`.
It also includes a CI-only retry around Ollama release metadata lookup after a
transient GitHub 504 during MSI payload preparation.

Do not reboot or restart Windows.

## Communication Contract

All builder/tester communication for this gate is only through:

- Repository: `CivicSuite/civicsuite`
- Branch: `stage-3a-baremetal-windows`
- Folder: `test-comms`

No old bridge folder, local-only bridge folder, OneDrive path, Microsoft
cloud-sync path, chat-only note, or alternate branch is valid for this gate.

The tester must write exactly:

- `test-comms/TESTER-RESULT-077.md`

Codex/builder must check the live remote branch with `FETCH_HEAD` after fetching
before declaring a result absent. Do not rely only on a stale local
`origin/stage-3a-baremetal-windows` tracking ref.

## Required Branch And Continuity

- Repo test channel: `CivicSuite/civicsuite`
- Test channel branch: `stage-3a-baremetal-windows`
- Prior result to read: `test-comms/TESTER-RESULT-076.md`
- Prior directive to read: `test-comms/TESTER-DIRECTIVE-076.md`
- Prior full gate directive to read: `test-comms/TESTER-DIRECTIVE-067.md`
- Expected result file: `test-comms/TESTER-RESULT-077.md`
- Do not edit source, generated artifacts, module manifests, release status,
  tags, or docs outside `test-comms`.

## Product Artifact Truth

Use only this corrected product artifact:

- PR under test: `CivicSuite/civicsuite#192`
- Required PR head under test:
  `26e66ef6f9dba43a5f28f6b7adc6a4d5b84bc09c`
- Source workflow run: `27603983793`
- Source workflow job: `build Windows Local MSI`
- Public prerelease tag: `windows-local-msi-ci-26e66ef`
- Public prerelease page:
  `https://github.com/CivicSuite/civicsuite/releases/tag/windows-local-msi-ci-26e66ef`
- MSI URL:
  `https://github.com/CivicSuite/civicsuite/releases/download/windows-local-msi-ci-26e66ef/CivicSuite_0.1.0_x64_en-US.msi`
- MSI SHA-256:
  `57d3dd05d126158a0eccb8a36d107b02d9ac68f3453f5864940237ffa022202e`
- MSI bytes: `1639820535`
- Evidence URL:
  `https://github.com/CivicSuite/civicsuite/releases/download/windows-local-msi-ci-26e66ef/CivicSuite-msi-evidence.txt`
- Evidence SHA-256:
  `8e17a2cac29032f583b03f8cbd91519fa2121d9e6dab85fc6bb5c14585c9a63e`
- Evidence bytes: `548`

Reject any artifact whose URL, PR head, size, or SHA-256 differs.

## Cleanroom-Equivalent Starting State

Use the existing tester machine. Do not reboot or restart Windows.

Before installing:

- close or stop any running `civicsuite-desktop.exe` process,
- stop any running `ollama.exe` process before the test begins,
- uninstall any existing CivicSuite Windows install if present,
- if the old install is per-machine/all-users, use the most capable
  interactive/elevated Windows uninstall path available,
- remove prior CivicSuite local data/config/cache/artifact folders reachable
  from the tester account,
- remove prior downloaded test MSI/evidence files for older artifacts,
- confirm no CivicSuite install entry remains,
- confirm no `civicsuite-desktop.exe` process remains,
- confirm no pre-existing `ollama.exe` process remains,
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
- installed executable path,
- installed `_up_\runtime\payload\ollama\ollama.exe` path and file metadata.

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

Verify the corrected failure from `TESTER-RESULT-076.md` before continuing the
full gate.

### Bundled Runtime Payload Source And Load

After signing into the CivicSuite local-admin account in the normal app window:

- verify Gemma 4 12B QAT metadata is visible,
- verify the local model path is visible,
- confirm the final `.gguf` model file is present or download/resume it through
  the app if needed,
- click `Verify Checksum` if the app has not already persisted verified model
  state,
- close any user-global Ollama process before clicking `Load in Ollama`,
- click `Load in Ollama`,
- confirm CivicSuite prepares/installs the bundled `model-runtime` payload
  before starting the runtime,
- confirm the `ollama.exe` process path is the CivicSuite bundled/local runtime
  path, not `C:\Users\insty\AppData\Local\Programs\Ollama\ollama.exe` or any
  other user-global Ollama path,
- confirm the local Ollama runtime becomes reachable at
  `http://127.0.0.1:15434/api/tags`,
- confirm `OLLAMA_MODELS`/runtime model storage points at the CivicSuite local
  data model store, not a user-global or external Ollama model store,
- confirm the model create/load action completes or reports a clear recoverable
  error while the app remains alive,
- confirm System Health advances beyond `Needs runtime` when the bundled
  runtime is healthy and the model load succeeds,
- record process evidence for the bundled `ollama.exe`, runtime health response
  evidence, System Health screenshot, and model registry/status state.

Classify runtime load behavior carefully:

- app termination, disappearing WebView, no bundled runtime start attempt, no
  recoverable status, user-global Ollama fallback, or continued `Needs runtime`
  after a healthy bundled runtime and successful model load: `FAIL`,
- external storage, antivirus, permission, or harness limitation with app alive
  and a clear recoverable status: `BLOCKED`,
- bundled runtime starts from the CivicSuite payload/local runtime path, health
  endpoint responds, model load succeeds, and System Health advances
  accordingly: `PASS`.

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

Write `test-comms/TESTER-RESULT-077.md` with:

- final verdict: PASS, FAIL, or BLOCKED,
- tested branch and commit for the repo channel,
- confirmation `TESTER-RESULT-076.md`, `TESTER-DIRECTIVE-076.md`, and
  `TESTER-DIRECTIVE-067.md` were read,
- confirmation the communication contract in this directive was followed,
- PR #192 head SHA tested,
- corrected public prerelease URLs used,
- MSI and evidence SHA-256 verification,
- cleanroom-equivalent wipe/uninstall evidence,
- corrected MSI install evidence,
- installed `_up_\runtime\payload\ollama\ollama.exe` evidence,
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
- bundled runtime payload source result,
- bundled Ollama process path result,
- `OLLAMA_MODELS`/local model store result,
- runtime health endpoint result,
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
