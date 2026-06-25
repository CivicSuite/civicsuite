Verdict: FAIL

# TESTER-RESULT-112 - Stage C corrected confirmation plus lifecycle gates

Branch tested: `stage-3a-baremetal-windows`
HEAD tested: `9ec1c8ac483f13f680eb49a48ea9a6a4b629fad2`
Directive: `test-comms/TESTER-DIRECTIVE-112.md`
Result file: `test-comms/TESTER-RESULT-112.md`
Evidence directory: `directive112-evidence/`

## Channel and environment

- Fetched/pruned remotes and scanned remote branches with `test-comms`, plus `stage*`, `test*`, `tester*`, and `track*` names.
- Only `origin/stage-3a-baremetal-windows` had a newer tester directive than tester result: `TESTER-DIRECTIVE-112.md` after `TESTER-RESULT-111.md`.
- Stage/name branches without `test-comms` only had generic source files with `directive` in the name, such as `scripts/policy/directive_utils.py`; no alternate `TESTER-DIRECTIVE` file was found outside `test-comms`.
- `%LOCALAPPDATA%`: `C:\Users\insty\AppData\Local`
- `CIVICSUITE_DESKTOP_STATE_DIR`: empty
- App launches used the installed executable and only WebView2 CDP args when inspection was needed. No custom `--user-data-dir` or state override was used.

Evidence:
- `directive112-evidence/channel-and-env-before.json`
- `directive112-evidence/wide-branch-scan.json`
- `directive112-evidence/channel-after-fetch-head.txt`
- `directive112-evidence/channel-after-ls-remote.txt`
- `directive112-evidence/channel-after-summary.json`

## C6 - Reopen persistence

FAIL: real durability blocker confirmed.

On-disk `%LOCALAPPDATA%\CivicSuite\config\first-run-progress.json` is valid JSON and includes completed setup steps through `health`, but it does not include the final `finish` / `open-app` step in `completed_step_ids`. `first-admin.json` exists.

Two normal close/relaunch cycles with the installed exe and the same `%LOCALAPPDATA%` both returned to the first-run wizard:

- Relaunch 1: `wizardPresent: true`, `firstRun.finished: false`, `current_step_id: "finish"`
- Relaunch 2: `wizardPresent: true`, `firstRun.finished: false`, `current_step_id: "finish"`

This refutes the automation-artifact theory for C6. The final open-app step is not durably recorded, so first-run is not actually complete across a normal relaunch.

Evidence:
- `directive112-evidence/C6-progress-on-disk.json`
- `directive112-evidence/C6-normal-relaunch-1.json`
- `directive112-evidence/C6-normal-relaunch-2.json`
- `directive112-evidence/C6-relaunch-summary.json`

## C3 - CivicCode import persistence

PASS after corrected automation.

The import was driven through the required two-step guided-review handshake:

1. Filled the CivicCode import form with title, citation, source reference, imported-by, and source text.
2. Clicked `[data-work-action="import-code-source"]` and observed the review panel.
3. Clicked `[data-review-confirm="import-code-source"]`.

After the confirm step, `city_work.code_sources` contained persisted `D112 Confirmed Code Source` entries with citation `D112-CODE-001`, source evidence paths under `%LOCALAPPDATA%\CivicSuite\Data\files\code\d112-code-001\`, SHA-256 hashes, and audit entries for `import-code-source`.

Evidence:
- `directive112-evidence/C3-review-before-confirm.json`
- `directive112-evidence/C3-after-confirm.json`
- `directive112-evidence/C3-city-work-after-confirm.json`
- `directive112-evidence/C3-code-sources.json`

## C2 - CivicRecords marker provenance

PASS.

The persisted records request still contains `D111-AI-MODEL-MARKER-20260625` in both request summary and search notes. A non-empty local-AI `response_draft` exists. The draft does not echo the opaque marker, which is acceptable for this directive because the gate is provenance, not echo. The audit trail records that the draft was generated with `civicsuite-gemma4-12b-qat:q4_0`.

Evidence:
- `directive112-evidence/C2-provenance.json`

## C7 - Backup / restore

PASS, with timing note.

The first backup click opened the guided review gate. After explicitly confirming `Confirm Backup Now`, the desktop app created a manual backup under `C:\Users\insty\Documents\CivicSuite Backups\civicsuite-manual-backup-1782411723-24708`.

Restore was first requested before `backup-manifest.json` had appeared, and the app correctly reported no valid backup manifest. After the backup writer completed, `backup-manifest.json` appeared and the restore was retried through `Confirm Restore Latest Backup`.

Restore completed from the manual backup, created a pre-restore safety backup, preserved the local model cache, and left local services stopped for explicit health verification.

Evidence:
- `directive112-evidence/C7-backup-restore.json`
- `directive112-evidence/C7-backup-restore-confirmed.json`
- `directive112-evidence/C7-backup-manifest-wait.json`
- `directive112-evidence/C7-restore-after-manifest.json`
- `directive112-evidence/C7-restore-final-wait.json`

## C8 - MSI uninstall / reinstall

BLOCKED by directive stop rule before uninstall.

The required MSI was located and verified:

- Path: `directive109-evidence/CivicSuite_0.1.0_x64_en-US.msi`
- Size: `1645426125`
- SHA-256: `2e5b163c7737b3534d2e5eef4fe9fd87a6af9ed0509e54b072ae7caa22db27ac`

Preflight reboot-pending checks found `PendingFileRenameOperations` set under Session Manager:

- `ComponentBasedServicing`: false
- `WindowsUpdate`: false
- `SessionManagerPendingFileRename`: true
- `ComputerRename`: false

Per directive: reboot-pending flag means STOP, record `environment/blocker`, do not reboot, do not retry. No uninstall or reinstall was attempted.

Evidence:
- `directive112-evidence/C8-preflight.json`

## Classification

Overall FAIL due to C6 real durability loss. C3 and C2 pass with corrected automation. C7 passes after waiting for backup manifest creation. C8 was not run because the directive's no-reboot/reboot-pending stop rule was triggered before uninstall.
