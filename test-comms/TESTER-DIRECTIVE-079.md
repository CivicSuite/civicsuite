# Tester Directive 079 - Model download recovery and city-core gate

## Goal

Retest the Windows Local city-core cleanroom-equivalent gate using the corrected
MSI artifact from PR #192 head `86dfed6308638f6450bae269095132a2ee729f6f`.

`TESTER-RESULT-078.md` proved the directive 077 runtime payload-lock BOM failure
was corrected at the installed file level, but the gate failed earlier in model
setup from clean local data. The app wrote an oversized Gemma `.gguf.part` file
(`7093023328` bytes vs pinned `6975877728` bytes), reported `Download failed`,
displayed progress above 100%, and retry/resume did not recover through product
controls.

This build fixes that failure by capping download progress at 100%, using curl
resume only for valid smaller partials, finalizing complete partials by pinned
checksum, repairing oversized partials when truncation yields the pinned
checksum, discarding corrupt oversized partials, and retrying once from a clean
download when needed.

Do not reboot or restart Windows.

## Communication Contract

All builder/tester communication for this gate is only through:

- Repository: `CivicSuite/civicsuite`
- Branch: `stage-3a-baremetal-windows`
- Folder: `test-comms`

No old bridge folder, local-only bridge folder, OneDrive path, Microsoft
cloud-sync path, chat-only note, or alternate branch is valid for this gate.

The tester must write exactly:

- `test-comms/TESTER-RESULT-079.md`

Codex/builder must check the live remote branch with `FETCH_HEAD` after fetching
before declaring a result absent. Do not rely only on a stale local
`origin/stage-3a-baremetal-windows` tracking ref.

## Required Branch And Continuity

- Repo test channel: `CivicSuite/civicsuite`
- Test channel branch: `stage-3a-baremetal-windows`
- Prior result to read: `test-comms/TESTER-RESULT-078.md`
- Prior directive to read: `test-comms/TESTER-DIRECTIVE-078.md`
- Prior full gate directive to read: `test-comms/TESTER-DIRECTIVE-067.md`
- Expected result file: `test-comms/TESTER-RESULT-079.md`
- Do not edit source, generated artifacts, module manifests, release status,
  tags, or docs outside `test-comms`.

## Product Artifact Truth

Use only this corrected product artifact:

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
installer path available. Record installer path, elevation method, exit code,
install location, uninstall entry, installed executable path, installed runtime
payload lock metadata, and installed bundled Ollama file metadata.

After install, launch `C:\Program Files\CivicSuite\civicsuite-desktop.exe` as
the normal interactive user, not elevated.

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

Verify the corrected failure from `TESTER-RESULT-078.md` before continuing the
full gate.

### Clean Model Download Recovery

After first local-admin creation and local-admin sign-in:

- verify Gemma 4 12B QAT metadata is visible,
- verify the local model path is visible,
- verify expected model size is `6975877728` bytes and expected SHA-256 is
  `faff1a63667fac17ac5e777f47114688fcefea96e220e211aaa8d62c2c4561f1`,
- use only CivicSuite product controls such as `Download / Resume`, `Retry
  Setup`, and `Verify Checksum`,
- do not delete, truncate, replace, or hand-edit the model file, partial file,
  model status file, model registry, or local config,
- confirm the UI never persists or reports progress above 100%,
- if a partial grows larger than the pinned model size, confirm product retry or
  resume repairs it when the pinned checksum matches after truncation or
  discards it and retries cleanly when corrupt,
- confirm an oversized invalid partial is not preserved as a permanent
  `Download failed` state,
- confirm model setup reaches a final `.gguf` at exactly `6975877728` bytes,
- confirm `Verify Checksum` survives and persists verified state,
- confirm CivicCore model registry records the verified local model,
- record model download status JSON evidence, final file metadata, checksum
  marker evidence, registry evidence, and screenshots of the model readiness UI.

Classify model setup carefully:

- progress over 100%, unrecoverable oversized partial, failed retry/resume loop,
  app termination, or verified state requiring forbidden hand-edits: `FAIL`,
- external network/storage/antivirus/harness limitation with a clear recoverable
  product status and no product corruption: `BLOCKED`,
- final `.gguf` reaches exact pinned size, checksum verifies, registry persists,
  and UI advances past download/verification readiness: `PASS`.

### Bundled Runtime Payload And Ollama Load

If the model download recovery check passes, continue the runtime assertions:

- close any user-global Ollama process before clicking `Load in Ollama`,
- click `Load in Ollama`,
- confirm the installed `runtime-payload-lock.json` no longer blocks source
  payload integrity validation,
- confirm CivicSuite prepares/installs the bundled `model-runtime` payload
  before starting the runtime,
- confirm the running `ollama.exe` process path is CivicSuite-managed rather
  than user-global,
- confirm `http://127.0.0.1:15434/api/tags` becomes reachable,
- confirm `OLLAMA_MODELS`/runtime model storage points at the CivicSuite local
  data model store,
- confirm the model create/load action completes or reports a clear recoverable
  error while the app remains alive,
- confirm System Health advances beyond `Needs runtime` when the bundled
  runtime is healthy and the model load succeeds.

Classify runtime load behavior carefully:

- app termination, disappearing WebView, no bundled runtime start attempt, no
  recoverable status, user-global Ollama fallback, payload-lock parse failure,
  or continued `Needs runtime` after a healthy bundled runtime and successful
  model load: `FAIL`,
- external storage, antivirus, permission, or harness limitation with app alive
  and a clear recoverable status: `BLOCKED`,
- bundled runtime starts from the CivicSuite payload/local runtime path, health
  endpoint responds, model load succeeds, and System Health advances
  accordingly: `PASS`.

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

Write `test-comms/TESTER-RESULT-079.md` with:

- final verdict: PASS, FAIL, or BLOCKED,
- tested branch and commit for the repo channel,
- confirmation `TESTER-RESULT-078.md`, `TESTER-DIRECTIVE-078.md`, and
  `TESTER-DIRECTIVE-067.md` were read,
- confirmation the communication contract in this directive was followed,
- PR #192 head SHA tested,
- corrected public prerelease URLs used,
- MSI and evidence SHA-256 verification,
- cleanroom-equivalent wipe/uninstall evidence,
- corrected MSI install evidence,
- normal app launch evidence,
- UI focus/input stability evidence,
- first CivicSuite local-admin creation result,
- CivicSuite local-admin sign-in result,
- model setup result after app local-admin sign-in,
- oversized partial recovery result,
- download progress cap result,
- retry/resume recovery result,
- final `.gguf` size result,
- Verify Checksum app survival result,
- Verify Checksum persisted state/registry result,
- installed runtime payload lock result,
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
