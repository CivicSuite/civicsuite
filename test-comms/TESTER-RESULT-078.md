# TESTER-RESULT-078

Final verdict: FAIL

Tested repo channel branch: `stage-3a-baremetal-windows`
Tested repo channel commit: `0277d301c32088317ec931001e9d49765a420e7b` (`Add tester directive 078`)
PR #192 head SHA tested: `466b853b9cb5619151fdbd73e2ad971801ca6f6b`

I read `TESTER-RESULT-077.md`, `TESTER-DIRECTIVE-077.md`, and `TESTER-DIRECTIVE-067.md` before writing this result. I followed the directive communication contract: repo `CivicSuite/civicsuite`, branch `stage-3a-baremetal-windows`, folder `test-comms`, result file `test-comms/TESTER-RESULT-078.md`. I did not use an old bridge folder, OneDrive path, alternate branch, chat-only result, Docker, WSL, repo-local bootstrap scripts, or Windows reboot/restart.

## Corrected public prerelease artifact

Used only the directive 078 public prerelease artifacts:

- MSI URL: `https://github.com/CivicSuite/civicsuite/releases/download/windows-local-msi-ci-466b853/CivicSuite_0.1.0_x64_en-US.msi`
- MSI bytes: `1639832823`
- MSI SHA-256: `1e0713d4f8863a629d282e7e9d768866ecf3aebb3ceda23eea869202ccaae087`
- Evidence URL: `https://github.com/CivicSuite/civicsuite/releases/download/windows-local-msi-ci-466b853/CivicSuite-msi-evidence.txt`
- Evidence bytes: `548`
- Evidence SHA-256: `54f6571517d51cf2ebd79e76cdc3a9bcd068aad17c59f095c32e86c963846c66`

Both downloaded files matched the directive size and SHA-256 requirements. The evidence file reported `RuntimePayload=desktop/runtime/payload`, `NoDockerPrerequisite=true`, and `NoWslPrerequisite=true`.

## Cleanroom-equivalent wipe and install

Stopped visible/running `civicsuite-desktop.exe` and `ollama.exe` before uninstall attempts. The existing CivicSuite uninstall entry was `{46BCCE35-D267-4F28-83E8-A201A128A18C}`. A quiet unelevated MSI uninstall returned `1603`, then the elevated Windows uninstall path succeeded:

- Elevated uninstall command path: `Start-Process msiexec.exe -Verb RunAs -WindowStyle Hidden -Wait`
- Elevated uninstall exit: `0`
- CivicSuite uninstall entries after elevated uninstall: none

Removed reachable CivicSuite local data/config/cache paths including:

- `C:\Users\insty\AppData\Local\CivicSuite`
- `C:\Users\insty\AppData\Roaming\CivicSuite` if present
- `C:\ProgramData\CivicSuite` if present
- `C:\Users\insty\AppData\Local\civicsuite-desktop` if present
- `C:\Users\insty\AppData\Local\com.civicsuite.desktop` if present

Important cleanroom note: after repeated `Stop-Process ollama`, a user-global Ollama process at `C:\Users\insty\AppData\Local\Programs\Ollama\ollama.exe serve` respawned before install/launch. That was recorded as contamination/runtime-source evidence; I did not hand-edit or remove user-global Ollama.

Installed the corrected MSI using:

- Installer path: `directive078-evidence\CivicSuite_0.1.0_x64_en-US.msi`
- Elevation method: `Start-Process msiexec.exe -Verb RunAs -WindowStyle Hidden -Wait`
- Install exit code: `0`
- Install location: `C:\Program Files\CivicSuite\`
- Uninstall entry after install: `{3FF7975E-D691-4E71-996A-EE128288C1F4}`
- Installed executable: `C:\Program Files\CivicSuite\civicsuite-desktop.exe`

## Installed runtime payload evidence

Installed payload lock:

- Path: `C:\Program Files\CivicSuite\_up_\runtime\payload\runtime-payload-lock.json`
- Size: `10812`
- First bytes: `7B-0D-0A`
- Starts with UTF-8 BOM: `false`
- JSON parse result: `ParseOk=true`

Installed bundled Ollama:

- Path: `C:\Program Files\CivicSuite\_up_\runtime\payload\ollama\ollama.exe`
- Size: `35590024`

The directive 077 BOM parse failure is corrected at the installed file level: the new payload lock is not BOM-prefixed and parses as JSON.

## Normal app launch and UI stability

Launched `C:\Program Files\CivicSuite\civicsuite-desktop.exe` as the normal interactive user, not elevated. The CivicSuite process had a visible `CivicSuite` window, was responding, and WebView2 CDP was reachable on the test port. UI automation used the CivicSuite WebView DOM, named buttons/data actions, screenshots, and process/window state around each step.

One automation batch timed out while continuing setup, likely due a blocked click/focus state, but recovery was successful: the leftover helper process was stopped, Escape was sent, the CivicSuite window remained responding, and DOM-targeted controls continued reliably afterward. This did not block the test.

## First-run, admin, and sign-in

Completed first-run setup through:

- unsigned beta notice
- SmartScreen explanation
- local data/backup folder step
- City Core module selection
- city profile creation
- first local-admin creation

First local admin:

- Name: `Admin Tester`
- Email: `admin078@teston.local`
- Role shown after sign-in: `local-admin`

Local-admin sign-in succeeded. The app showed `Sign Out` and `Signed in as Admin Tester`.

## Model setup result

The model metadata and local path were visible after local-admin sign-in:

- Model: `Gemma 4 12B QAT Q4_0`
- Runtime name: `civicsuite-gemma4-12b-qat:q4_0`
- Expected local path: `C:\Users\insty\AppData\Local\CivicSuite\Data\models\gemma-4-12b-it-qat-q4_0.gguf`
- Expected SHA-256: `faff1a63667fac17ac5e777f47114688fcefea96e220e211aaa8d62c2c4561f1`
- Expected size: `6975877728`

Clicked the app's backup step and model download controls:

- `Create backup folder`
- `Download / Resume Model`
- `Download / Resume`
- `Retry Setup`
- `Download / Resume` again after retry

The in-app model download did not reach a valid final GGUF. It persisted:

- Status: `Download failed`
- Message: `The Gemma model download did not complete. The saved partial file can be resumed.`
- Final file exists: `false`
- Partial file exists: `true`
- Partial file bytes: `7093023328`
- Expected bytes: `6975877728`
- Progress: `101.68%`
- Last error: `Model download is incomplete: got 7093023328, expected 6975877728 bytes`

The app's own retry/resume controls did not recover the oversized partial. I did not delete, truncate, replace, or hand-edit model files or config to force the test forward.

## Runtime regression checks

Because the app could not produce a valid final model file or verified model state through the product UI, the directive 078 runtime load path could not be completed.

Observed runtime-related state:

- Verify Checksum app survival result: not reached with a valid final GGUF
- Verify Checksum persisted state/registry result: not reached
- Runtime payload-lock parse/integrity result: installed payload lock is no-BOM and parses successfully at file level
- Bundled runtime payload source result: bundled `ollama.exe` is installed under `C:\Program Files\CivicSuite\_up_\runtime\payload\ollama\ollama.exe`
- Bundled Ollama process path result: not reached through successful Load; the only observed running Ollama process was user-global
- Observed Ollama process: `C:\Users\insty\AppData\Local\Programs\Ollama\ollama.exe serve`
- `OLLAMA_MODELS` / local model store result: not reached
- Runtime health endpoint result: `http://127.0.0.1:15434/api/tags` was not reachable
- Load in Ollama result: not reached because no verified model was available
- System Health runtime/model readiness result: remained not ready; model file `Needs download`, checksum `Needs verification`, runtime `Needs start`, model load `Needs runtime`, registry `Needs registration`

This is a failed city-core gate before the focused runtime load assertion can be completed. The specific directive 077 BOM failure appears fixed in the installed payload lock, but directive 078 still fails because the corrected build cannot complete model setup from a clean local data state: it downloads/persists an oversized `.part` file and does not recover via product retry/resume controls.

## Full directive 067 continuation

Not reached because the targeted prerequisite did not pass. Results for later sections:

- Module manager: not reached beyond module selection summary
- Local Users/RBAC: not reached beyond first local-admin creation/sign-in
- CivicClerk workflow: not reached
- CivicRecords AI workflow: not reached
- Resident/public records request workflow: not reached
- CivicCode workflow: not reached
- Cross-module search/handoff: not reached
- Close/reopen persistence: not reached
- Backup/restore: backup folder step reached; restore not reached
- Support bundle: not reached
- Repair: not reached
- Prepare uninstall: not reached
- Windows uninstall/reinstall/restore: not reached

Windows was not rebooted or restarted during this directive.

## Failure details

FAIL: model setup cannot complete through the CivicSuite UI after a clean local data wipe. The app writes an oversized partial model file (`7093023328` bytes vs expected `6975877728`), reports `Download failed`, and retry/resume does not recover it. This prevents checksum verification, model registration, `Load in Ollama`, `OLLAMA_MODELS` validation, runtime health validation, and the rest of the city-core gate from being reached without forbidden hand-edits to local data.
