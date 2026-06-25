# TESTER-DIRECTIVE-113 — Isolate the C6 "finish not persisted" layer (backend vs frontend vs prior-state)

## Purpose

RESULT-112 confirmed C6 empirically: on disk, `first-run-progress.json` has steps through `health`
but NOT the final `finish` step, and normal relaunches return to the wizard at `current_step_id="finish"`.
BUT the shipped backend is unit-test-proven correct: `first_run_finish_reports_completed_product_surface`
writes all-steps-except-finish, calls `first_run_action("open-app","finish")`, and asserts on a fresh
read `finished==true`. And the frontend finish button is wired `data-first-run-action="open-app"
data-step-id="finish"`. So code+test say it should persist, yet the box shows it missing. **Isolate
the layer with a clean, fast, non-destructive test.** No install, no model download, no uninstall.

## STOP / LIMITS

> - **NEVER REBOOT** (no Restart/shutdown/logoff). The box has a pending-file-rename flag — do NOT
>   act on it, do NOT reboot. Just run this test.
> - **No install/uninstall/wipe/first-run-reset.** Continue from the current state (wizard at
>   `finish`). Same `%LOCALAPPDATA%` throughout; do NOT set `CIVICSUITE_DESKTOP_STATE_DIR` or a
>   custom `--user-data-dir`.
> - Push only to `stage-3a-baremetal-windows`. Result = `test-comms/TESTER-RESULT-113.md`. Record
>   `git ls-remote` + `FETCH_HEAD` before start and before result.

## Test A — capture the starting disk state

1. Read `%LOCALAPPDATA%\CivicSuite\config\first-run-progress.json` verbatim (content + byte size +
   last-write time). Confirm it lacks `finish`. Save `directive113-evidence/A-progress-before.json`.
2. Launch the installed exe normally with WebView2 remote-debugging (port 9222, no user-data-dir
   override). Read `get_app_state.first_run` → record `current_step_id`, `finished`, and whether the
   wizard's current step is `finish`.

## Test B — drive the finish step through the REAL UI (as a user would)

3. In the rendered wizard, locate the current `finish` step's button
   `[data-first-run-action="open-app"][data-step-id="finish"]`. Capture its outerHTML and whether it
   is `disabled`. Click it via CDP `Input.dispatchMouseEvent` (real click at its box center), OR via
   a real `.click()` through `Runtime.evaluate`. Capture the `.action-result` / any toast text.
4. **IMMEDIATELY (before closing the app, before any other action)** re-read
   `%LOCALAPPDATA%\CivicSuite\config\first-run-progress.json`. Is `finish` now in
   `completed_step_ids`? Save `directive113-evidence/B-progress-after-ui-click.json` (content + size +
   write time). Also read `get_app_state.first_run.finished`.

## Test C — if B did not persist, drive the BACKEND directly

5. If after Test B `finish` is still absent from disk, invoke the Tauri command directly via
   `window.__TAURI_INTERNALS__.invoke("first_run_action", { action: "open-app", stepId: "finish", payload: null })`
   and capture the returned `FirstRunActionResult` (accepted / status / message) verbatim.
6. **IMMEDIATELY** re-read the on-disk progress file. Is `finish` now present? Save
   `directive113-evidence/C-progress-after-direct-invoke.json` (content + size + write time). Read
   `get_app_state.first_run.finished`.

## Test D — durability across a normal relaunch

7. Whichever of B or C made `finished=true`, fully close the app, wait 3s, relaunch the installed exe
   normally (same `%LOCALAPPDATA%`), and read on-disk progress + `get_app_state.first_run.finished` +
   wizardPresent. Save `directive113-evidence/D-after-relaunch.json`.

## Verdict (top of result) — pick exactly one

- `Verdict: BACKEND-OK-FRONTEND-OK` — Test B (UI click) persisted `finish` to disk and Test D shows it
  durable (finished stays true, no wizard). → C6 is NOT a clean-flow bug; the earlier missing-`finish`
  came from the messy multi-directive prior state. **1.0.0 beta-clear on the C6 axis.**
- `Verdict: FRONTEND-GAP` — Test B (UI click) did NOT persist `finish` (no disk change, finished stays
  false), but Test C (direct backend invoke) DID persist it and Test D is durable. → real bug is in the
  frontend finish-step wiring (the UI click doesn't reach `first_run_action`). Capture exactly what the
  click did (console/network/`.action-result`).
- `Verdict: BACKEND-GAP` — even Test C (direct invoke, accepted result) did NOT land `finish` on disk on
  an immediate re-read. → backend/environment write problem (e.g., file lock, write to a different
  path). Capture the exact path written vs the path read, and any error.

Include all four evidence files, the exact on-disk file contents at each step (before / after-UI /
after-direct / after-relaunch), file write-times, and the finish-button outerHTML.

## Hard limits

No reboot, no install/uninstall, no first-run reset, same `%LOCALAPPDATA%`. Push only to
`stage-3a-baremetal-windows`. No merge to main. Never touch OneDrive.
