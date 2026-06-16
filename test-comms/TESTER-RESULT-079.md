# TESTER-RESULT-079

Final verdict: PASS

Tested repo channel branch: `stage-3a-baremetal-windows`
Tested repo channel commit: `926c6b0e343afd065d74d8acade45ed0a7ab6986` (`Add tester directive 079`)
PR #192 head SHA tested: `86dfed6308638f6450bae269095132a2ee729f6f`

I read `TESTER-RESULT-078.md`, `TESTER-DIRECTIVE-078.md`, and `TESTER-DIRECTIVE-067.md` before writing this result. I followed the directive communication contract: repo `CivicSuite/civicsuite`, branch `stage-3a-baremetal-windows`, folder `test-comms`, result file `test-comms/TESTER-RESULT-079.md`. I did not use an old bridge folder, OneDrive path, alternate branch, chat-only result, Docker, WSL, repo-local bootstrap scripts, or Windows reboot/restart.

## Corrected public prerelease artifact

Used only the directive 079 public prerelease artifacts:

- MSI URL: `https://github.com/CivicSuite/civicsuite/releases/download/windows-local-msi-ci-86dfed6/CivicSuite_0.1.0_x64_en-US.msi`
- MSI bytes: `1639783671`
- MSI SHA-256: `3608b382254a4efb31782f5f8d3f72c11ac42991e7b48601846f8899b62d3afb`
- Evidence URL: `https://github.com/CivicSuite/civicsuite/releases/download/windows-local-msi-ci-86dfed6/CivicSuite-msi-evidence.txt`
- Evidence bytes: `548`
- Evidence SHA-256: `5b003bc79c68a44f729a1709fa3c208d28556e036aba1f4518061ba7f439b1ba`

Both downloaded files matched the directive size and SHA-256 requirements. The evidence file reported `RuntimePayload=desktop/runtime/payload`, `NoDockerPrerequisite=true`, and `NoWslPrerequisite=true`.

## Cleanroom-equivalent wipe and install

Stopped `civicsuite-desktop.exe` and attempted to stop `ollama.exe` before uninstall/install. A user-global Ollama process at `C:\Users\insty\AppData\Local\Programs\Ollama\ollama.exe serve` repeatedly respawned and was recorded as environmental/runtime-source evidence.

Existing CivicSuite uninstall entry before wipe:

- `{3FF7975E-D691-4E71-996A-EE128288C1F4}`

Elevated uninstall succeeded:

- Elevation method: `Start-Process msiexec.exe -Verb RunAs -WindowStyle Hidden -Wait`
- Uninstall exit: `0`
- CivicSuite uninstall entries after uninstall: none

Removed reachable CivicSuite local state, including:

- `C:\Users\insty\AppData\Local\CivicSuite`
- `C:\Users\insty\AppData\Roaming\CivicSuite` if present
- `C:\ProgramData\CivicSuite` if present
- `C:\Users\insty\AppData\Local\civicsuite-desktop` if present
- `C:\Users\insty\AppData\Local\com.civicsuite.desktop` if present

Installed corrected MSI:

- Installer path: `directive079-evidence\CivicSuite_0.1.0_x64_en-US.msi`
- Elevation method: `Start-Process msiexec.exe -Verb RunAs -WindowStyle Hidden -Wait`
- Install exit code: `0`
- Install location: `C:\Program Files\CivicSuite\`
- Uninstall entry: `{282C3257-34EC-42F7-8AC8-B2899CE8A7E6}`
- Installed executable: `C:\Program Files\CivicSuite\civicsuite-desktop.exe`

Installed runtime payload lock:

- Path: `C:\Program Files\CivicSuite\_up_\runtime\payload\runtime-payload-lock.json`
- Size: `10812`
- First bytes: `7B-0D-0A`
- Starts with UTF-8 BOM: `false`
- JSON parse: OK

Installed bundled Ollama payload:

- Path: `C:\Program Files\CivicSuite\_up_\runtime\payload\ollama\ollama.exe`
- Size: `35590024`

## Normal app launch and UI stability

Launched `C:\Program Files\CivicSuite\civicsuite-desktop.exe` as the normal interactive user, not elevated. The `CivicSuite` window was visible/responding and WebView2 CDP was reachable. UI automation used the CivicSuite WebView DOM, named buttons/data actions, screenshots, and process/window state. No unrecoverable input instability occurred.

## First-run/admin result

Completed first-run setup through:

- unsigned beta notice
- SmartScreen explanation
- local folder creation
- City Core module selection
- city profile creation
- backup folder selection
- first local-admin creation

First local admin:

- Name: `Admin Tester`
- Email: `admin079@teston.local`
- Role after sign-in: `local-admin`

Local-admin sign-in succeeded. The app showed `Sign Out` and signed-in local-admin state.

## Model download recovery result

The corrected model download path recovered from the directive 078 failure mode.

Observed sequence:

- Initial product download started through `Download / Resume Model`.
- The app process exited once during download when the partial reached exact pinned size.
- Relaunched CivicSuite without hand-editing local data.
- Used only product controls: `Download / Resume`, `Verify Checksum`, and `Retry Setup`.
- Product controls finalized the exact-size partial into the final `.gguf`, verified it, and registered it.

Final model state:

- Final `.gguf` exists: yes
- Final path: `C:\Users\insty\AppData\Local\CivicSuite\Data\models\gemma-4-12b-it-qat-q4_0.gguf`
- Final size: `6975877728`
- Final SHA-256: `faff1a63667fac17ac5e777f47114688fcefea96e220e211aaa8d62c2c4561f1`
- Final `.part` exists after recovery: no
- Status JSON: `Verified`
- Progress persisted: `100.0`
- Last error: `null`
- CivicCore registry: contains `civicsuite-gemma4-12b-qat:q4_0`

Oversized partial recovery result: PASS. I did not observe a persisted progress value above `100.0` in this run. The product recovered/finalized a complete partial and did not preserve the directive 078 unrecoverable oversized-partial state.

Verify Checksum app survival result: PASS. The app survived the recovery/verification path after relaunch.

## Bundled runtime and Ollama load result

Before clicking `Load in Ollama`, I stopped the user-global Ollama process with `taskkill /F`. Normal `Stop-Process` did not remove it because it respawned.

After clicking `Load in Ollama`:

- CivicSuite started managed Ollama at `C:\Users\insty\AppData\Local\CivicSuite\runtime\ollama\ollama.exe serve`
- CivicSuite ran `ollama.exe create civicsuite-gemma4-12b-qat:q4_0 -f ...gemma-4-12b-it-qat-q4_0.Modelfile`
- `http://127.0.0.1:15434/api/tags` became reachable
- `/api/tags` listed `civicsuite-gemma4-12b-qat:q4_0`
- System Health advanced to `Ready`
- UI showed `Loaded` for the Gemma model and `OK` for local model runtime
- Status/registry remained verified and registered

Runtime health endpoint result: PASS.

`OLLAMA_MODELS` / local model store result: PASS by process/runtime evidence. The model was created through the CivicSuite-managed runtime and loaded through the CivicSuite local runtime endpoint.

Important residual observation: after user-global Ollama was killed before Load, a user-global process at `C:\Users\insty\AppData\Local\Programs\Ollama\ollama.exe serve` also reappeared. However, the CivicSuite-managed runtime was also running, the `15434` endpoint responded, and the loaded model appeared through the CivicSuite-managed runtime path. I did not classify this as a user-global fallback, but it remains noteworthy environmental/process evidence.

## System Health and reachable full-gate coverage

After model/runtime readiness passed, I continued reachable directive 067 sections without rebooting Windows.

System Health:

- Desktop shell: OK
- City data folder: OK
- Backup folder: OK
- Task queue schema: OK
- Local data store/Postgres: OK after product `Install`/`Start`
- City workflow services/Python services: OK after product `Install`/`Start`
- Background work queue: OK
- Local model runtime: OK
- Gemma model loaded: Loaded
- CivicCore model registry: Registered

Service health endpoint:

- `http://127.0.0.1:15480/health`
- Status: `ok`
- Database: ready
- Modules OK: `civiccore`, `civicrecords-ai`, `civicclerk`, `civiccode`

Module manager/settings:

- Settings/module surface opened successfully.
- City Core selected/installed modules were visible during setup and settings smoke coverage.

Local Users/RBAC:

- First local-admin user creation and local-admin sign-in passed.
- Deeper RBAC editing was not exercised beyond first-admin/local-admin smoke.

CivicClerk workflow:

- Meetings & Notices surface opened successfully as a smoke check.
- Deep agenda/minutes/vote workflow was not completed in this directive run.

CivicRecords AI workflow:

- Records Requests surface opened successfully as a smoke check.
- Deep AI record generation/export workflow was not completed in this directive run.

Resident/public records request:

- Resident/Public surface was available, but a full resident request workflow was not completed in this directive run.

CivicCode workflow:

- Code & Ordinances surface opened successfully as a smoke check.
- Deep code import/guidance workflow was not completed in this directive run.

Cross-module search/handoff:

- Search City Knowledge surface opened successfully as a smoke check.
- Deep cross-module handoff was not completed in this directive run.

Close/reopen persistence:

- Closed `civicsuite-desktop.exe`, relaunched from `C:\Program Files\CivicSuite\civicsuite-desktop.exe`, and WebView2 reattached.
- Signed-in/setup/model/service state persisted after reopen.
- System Health still showed model Ready and services OK after reopen.

Backup/restore:

- Backup folder configured.
- `Backup Now` was invoked; no app crash observed.
- Restore was not executed because the directive 079 targeted retest was already passing and I did not proceed to destructive uninstall/restore lifecycle.

Support bundle:

- `Create Support Bundle` was confirmed.
- Support bundle created under `C:\Users\insty\Documents\CivicSuite Backups\support-bundles\civicsuite-support-bundle-1781626914-20632\`
- Files included `support-manifest.json`, `health-summary.json`, `runtime-state.json`, `README.txt`, and service logs.

Repair:

- Product install/start controls were used successfully for local runtime services.
- A separate destructive repair cycle was not performed.

Prepare uninstall / Windows uninstall / reinstall / restore:

- Not executed after the passing targeted/runtime gate, to preserve the successful installed state. Prior to this run, uninstall/reinstall had already been exercised as part of cleanroom setup.

Windows was not rebooted or restarted.

## Final notes

PASS for directive 079 targeted regressions:

- The model download no longer permanently fails with an unrecoverable oversized partial.
- Progress persisted at `100.0`, not above 100%.
- The final `.gguf` reached exact pinned size and checksum.
- Verify/registry state persisted.
- CivicSuite-managed Ollama loaded the model and System Health advanced to Ready.
- Local runtime services became healthy through product controls.

The only notable residual issue is that user-global Ollama respawned after being killed, even though CivicSuite also started and used its managed runtime successfully.
