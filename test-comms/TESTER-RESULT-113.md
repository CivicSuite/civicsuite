Verdict: BACKEND-OK-FRONTEND-OK

# TESTER-RESULT-113 - C6 finish persistence layer isolation

Branch tested: `stage-3a-baremetal-windows`
HEAD tested: `64bfe64237fc14d43326a527b0826e892cbbfc8a`
Directive: `test-comms/TESTER-DIRECTIVE-113.md`
Result file: `test-comms/TESTER-RESULT-113.md`
Evidence directory: `directive113-evidence/`

## Channel

- Recorded `git ls-remote` and `FETCH_HEAD` before the run and before result.
- Same `%LOCALAPPDATA%` throughout: `C:\Users\insty\AppData\Local`
- `CIVICSUITE_DESKTOP_STATE_DIR` was empty.
- Launches used the installed exe with only `WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS=--remote-debugging-port=9222 --remote-allow-origins=*`.
- No reboot, install, uninstall, wipe, or first-run reset was performed.

Evidence:
- `directive113-evidence/channel-before-ls-remote.txt`
- `directive113-evidence/channel-before-fetch-head.txt`
- `directive113-evidence/channel-after-ls-remote.txt`
- `directive113-evidence/channel-after-fetch-head.txt`

## Important Starting-State Caveat

Directive 113 expected the current machine state to still have a wizard at `finish` with `finish` absent from `%LOCALAPPDATA%\CivicSuite\config\first-run-progress.json`.

That premise was no longer true at the start of this run. The starting disk file already contained `finish`:

```json
"completed_step_ids": [
  "unsigned-beta",
  "smartscreen",
  "locations",
  "modules",
  "city-profile",
  "first-admin",
  "backup",
  "model",
  "health",
  "finish"
]
```

The write time was `2026-06-25T12:16:34.3319796-06:00`, which predates this directive run and matches the prior lifecycle flow. This appears consistent with the directive-112 backup/restore having restored the completed first-run state. Because the directive prohibited first-run reset or state manipulation, I did not remove `finish` or recreate the missing-finish state.

## Test A - Starting Disk and App State

Disk state:

- File: `C:\Users\insty\AppData\Local\CivicSuite\config\first-run-progress.json`
- Size: `271` bytes
- Valid JSON: yes
- Contains `finish`: yes

After launching the installed app, the rendered app showed:

- `wizardPresent: false`
- `finishButtonPresent: false`
- `finishButtonOuterHTML: null`
- The visible product surface was the normal CivicSuite app, not first-run.

Evidence:
- `directive113-evidence/A-progress-before.json`
- `directive113-evidence/A-dom-after-launch.json`

## Test B - Real UI Finish Click

Skipped because there was no first-run wizard and no `[data-first-run-action="open-app"][data-step-id="finish"]` button to click. The disk file already contained `finish` before Test B. A same-content snapshot was saved for the required evidence slot.

Evidence:
- `directive113-evidence/B-progress-after-ui-click.json`

## Test C - Direct Backend Invoke

Skipped because `finish` was already present before Test B/C. Re-invoking `first_run_action("open-app", "finish")` would not isolate whether the backend can land a missing `finish`; it would only repeat an already-completed action against a finished profile. A same-content snapshot was saved for the required evidence slot.

Evidence:
- `directive113-evidence/C-progress-after-direct-invoke.json`

## Test D - Normal Relaunch Durability

Closed the installed app, waited, relaunched `C:\Program Files\CivicSuite\civicsuite-desktop.exe` with the same `%LOCALAPPDATA%`, and read both disk and app state.

Disk after relaunch:

- Contains `finish`: yes
- Size: `271` bytes
- Last write time unchanged: `2026-06-25T12:16:34.3319796-06:00`

`get_app_state.first_run` after relaunch:

- `finished: true`
- `current_step_id: null`
- `steps[*].finish.completed: true`
- `wizardPresent: false`
- `finishButtonPresent: false`

Evidence:
- `directive113-evidence/D-progress-after-relaunch.json`
- `directive113-evidence/D-after-relaunch.json`

## Classification

The current clean post-restore profile is durable: disk contains `finish`, `get_app_state.first_run.finished` is true, and a normal relaunch stays on the product surface with no wizard.

This supports `BACKEND-OK-FRONTEND-OK` for the current state, but with the caveat that Test B could not be re-driven because the missing-finish condition had already disappeared before this directive began. The RESULT-112 missing-finish condition was therefore not reproducible from the current, no-reset state.
