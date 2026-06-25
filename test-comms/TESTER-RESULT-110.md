# TESTER-RESULT-110
Verdict: PARTIAL
Directive head: stage-3a-baremetal-windows at `a2f2a426d3255c550c1ff8b6aba4c4b831c1909a`

## Channel
- Before probe: `git ls-remote origin refs/heads/stage-3a-baremetal-windows` returned `a2f2a426d3255c550c1ff8b6aba4c4b831c1909a`; `FETCH_HEAD` after fetch was `a2f2a426d3255c550c1ff8b6aba4c4b831c1909a`.
- Push check: `git push --dry-run origin stage-3a-baremetal-windows` returned `Everything up-to-date`.
- Before result write: `git ls-remote` and `FETCH_HEAD` again both returned `a2f2a426d3255c550c1ff8b6aba4c4b831c1909a`.
- Can push: yes.

## %LOCALAPPDATA%\CivicSuite
- Exists: yes.
- Top-level contents:
  - `C:\Users\insty\AppData\Local\CivicSuite\config`
  - `C:\Users\insty\AppData\Local\CivicSuite\Data`
- Size summary:
  - `config`: exists, 3 files, 1206 bytes
  - `Data`: exists, 0 files, 0 bytes
  - `runtime`: absent
  - `backups`: absent
- Config/profile files now present:
  - `config\locations.json`: install root `C:\Users\insty\AppData\Local\CivicSuite`, data root `C:\Users\insty\AppData\Local\CivicSuite\Data`, backup root `C:\Users\insty\Documents\CivicSuite Backups`
  - `config\module-selection.json`: profile `city-core`; enabled modules `civiccore`, `civicrecords-ai`, `civicclerk`, `civiccode`, `civicnotice`
  - `config\first-run-progress.json`: completed steps `unsigned-beta`, `smartscreen`, `locations`, `modules`; `last_action` = `select-modules`
- First-admin record: not found.
- City-profile selection beyond `city-core` module profile: not found.

## Database
- Product Postgres data dir: absent.
- `%LOCALAPPDATA%\CivicSuite\Data` exists but contains no files.
- No initialized user-runtime Postgres data directory or CivicCore/city DB was found.
- Program Files still contains the bundled payload source at `C:\Program Files\CivicSuite\_up_\runtime\payload\postgres`, but that is only the installed payload, not an initialized product data directory.

## Runtime processes
- `civicsuite-desktop.exe`: absent at probe time.
- Bundled `ollama.exe`: absent.
- Bundled `postgres.exe`: absent.
- CivicSuite runtime `python.exe`: absent.
- Only matching process was unrelated `C:\Program Files\Python312\python.exe` PID 18772, already listening on `127.0.0.1:18082`.

## Listeners / health
- `127.0.0.1:15434`: down; `GET http://127.0.0.1:15434/api/tags` failed with `Unable to connect to the remote server`.
- `127.0.0.1:15480`: down; `GET http://127.0.0.1:15480/health` failed with `Unable to connect to the remote server`.
- Other observed matching listener: unrelated `python.exe` on `127.0.0.1:18082`.

## Model
- `C:\Users\insty\AppData\Local\CivicSuite\Data\models`: absent.
- `C:\Users\insty\AppData\Local\CivicSuite\models`: absent.
- `C:\Users\insty\AppData\Local\CivicSuite\runtime\ollama\models`: absent.
- No `gemma-4-12b-it-qat-q4_0.gguf`, `.part`, sidecar, or model download artifact found.

## App screen
- Current state: no installed-app window was available to capture because `civicsuite-desktop.exe` was not running at probe time. I did not launch it, per the read-only directive.
- Screenshot path requested: `directive110-evidence/current-app-screen.png`; not created because there was no current app window.
- Status file: `directive110-evidence/current-app-screen-status.json`.

## Logs
- No first-run/setup/supervisor/runtime logs were found under `%LOCALAPPDATA%\CivicSuite`; only the three config JSON files were present.
- No user-runtime logs were present because `%LOCALAPPDATA%\CivicSuite\runtime` is absent.
- Under `C:\Program Files\CivicSuite`, only installed payload/reference files were found; no live supervisor/runtime log tail showing backend service startup was found.

## Honest notes
- The manual click-through did create some frontend/setup state on disk, so this is not `NOTHING-MATERIALIZED`.
- The materialization stopped after config/module-selection state: no admin/city profile, no runtime directory, no Postgres data directory, no Ollama, no runtime API, and no model download state were present.
- No installer, wipe, uninstall, app launch, first-run action, download, or reboot was performed during this read-only probe.
