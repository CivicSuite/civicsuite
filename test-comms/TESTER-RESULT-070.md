# TESTER-RESULT-070

## Verdict

BLOCKED - the stale elevated CivicSuite desktop process from result 068/069 was cleared without rebooting Windows and without intentionally triggering UAC, and the installed app then launched normally from the medium-integrity tester session. The remaining blocker is tester-harness UI input/focus instability while trying to complete first CivicSuite local-admin setup: after partial form entry, click/keyboard input was repeatedly misrouted into Windows shell apps (Microsoft Store, Edge, Snipping Tool) instead of reliably into the CivicSuite WebView fields, leaving the first-admin form still marked `Needed`.

This result is not a new MSI install failure and not a stale elevated-process failure. It is a post-cleanup UI automation/focus blocker.

## Directive

- Read and executed: `test-comms/TESTER-DIRECTIVE-070.md`
- Tested branch: `stage-3a-baremetal-windows`
- Tested repo-channel commit: `2904b7197a502d4a39bbf4634972135ab0054a16`
- Required continuity files read:
  - `test-comms/TESTER-DIRECTIVE-069.md`
  - `test-comms/TESTER-RESULT-069.md`
  - `test-comms/TESTER-DIRECTIVE-067.md`

## Product Artifact Truth

- PR #192 head under test: `a8c6715d8434160c8ade722d9459f2247fb7369d`
- Source workflow run: `27522471421`
- Source workflow job: `build Windows Local MSI`
- Public prerelease tag: `windows-local-msi-ci-a8c6715`
- Installed executable continued from results 068 and 069: `C:\Program Files\CivicSuite\civicsuite-desktop.exe`

## Installed App State

The installed state from results 068 and 069 was still present.

- Installed executable exists: yes
- Installed executable launched: yes
- Repeated MSI install was not needed.
- Windows was not rebooted or restarted.

## Elevated Stale-Process Cleanup Evidence

Before cleanup, one `civicsuite-desktop.exe` process remained:

- PID: `24900`
- Main window title: `CivicSuite`
- Responding: yes
- Owner: `DESKTOP-LOOTB7M\insty`
- Executable path / command line readable from tester worker: no (`null`)
- Parent PID: `29584`

Cleanup method used:

- `GetProcess.CloseMainWindow()` returned `true`.
- `Win32_Process.Terminate()` then returned `0`.
- No UAC prompt was intentionally triggered.
- No operator UAC approval was required.

After cleanup:

- No `civicsuite-desktop.exe` process remained.
- No elevated CivicSuite desktop process remained before normal UI automation resumed.

Evidence:

- `directive070-evidence/stale-process-cleanup.json`

## Normal App Launch Evidence After Cleanup

The installed executable was launched as the normal interactive user:

- PID: `29428`
- Path: `C:\Program Files\CivicSuite\civicsuite-desktop.exe`
- Command line: `"C:\Program Files\CivicSuite\civicsuite-desktop.exe" `
- Owner: `DESKTOP-LOOTB7M\insty`
- Main window title: `CivicSuite`
- Responding: yes

The first visible surface reached the Windows Local app:

- `WINDOWS LOCAL 1.0`
- `CivicSuite`
- Staff / Resident-Public / IT-Admin tabs visible
- Staff work surface and setup/settings cards visible

Evidence:

- `directive070-evidence/normal-app-launch.json`
- `directive070-evidence/normal-app-first-screen.png`
- `directive070-evidence/settings-narrow.png`

## First CivicSuite Local-Admin Creation Result

Result: BLOCKED after partial UI entry.

Visible app path used:

- Settings screen, which states it shares the local city profile, first admin, and installed City Core package.
- First Admin form exposed:
  - `Admin name`
  - `Admin email`
  - `Local passcode`
  - `Save First Admin`
- Local Users section stated: `Create the first admin before adding staff users.`

Data attempted through the app UI:

- Admin name: `CivicSuite Tester Admin`
- Admin email: `tester.admin@example.local`
- Local passcode: accepted into the passcode field as masked input

Observed result:

- The admin name and passcode could be entered.
- The admin email field did not persistently accept the pasted value during the final save attempt.
- The form still displayed `Needed`.
- `Save First Admin` did not complete first-admin creation.
- No local config files or local data files were hand-edited.

Tester-harness blocker details:

- Earlier keyboard navigation successfully opened `Code & Ordinances`, proving the stale elevated window was no longer the blocker.
- During first-admin entry, focus/click routing became unreliable:
  - one save attempt launched Microsoft Store over CivicSuite,
  - another focus slip opened Edge's "What's new in Microsoft Edge" page,
  - a later save/input attempt launched Snipping Tool.
- These Windows shell overlays were not part of the CivicSuite app workflow and prevented reliable completion of the first-admin form from the tester harness.

Evidence:

- `directive070-evidence/first-admin-form-top.png`
- `directive070-evidence/first-admin-fields-filled-probe.png`
- `directive070-evidence/first-admin-filled-before-save.png`
- `directive070-evidence/first-admin-save-result.png`
- `directive070-evidence/first-admin-email-save-result.png`
- `directive070-evidence/final-ui-state.png`
- `directive070-evidence/final-process-state.json`

## CivicSuite Local-Admin Sign-In Result

Result: BLOCKED, not reached.

The first CivicSuite local administrator could not be confirmed as saved through the app UI, so sign-in as that app local administrator was not attempted.

## Model Setup Result After App Local-Admin Sign-In

Result: BLOCKED, not reached.

Since app-local-admin creation/sign-in was not completed, model setup after app-local-admin sign-in was not attempted.

## System Health / Admin Gating

Result: BLOCKED, not reached after first-admin creation failed to complete.

The home surface showed an `IT/Admin` tab and admin/settings surfaces, but the full System Health/model workflow was not completed because local-admin creation remained blocked.

## Module Manager

Result: BLOCKED, not reached.

## Local Users / RBAC

Result: BLOCKED at first-admin bootstrap.

The Local Users section was visible and correctly required first-admin creation before adding staff users.

## CivicClerk Workflow

Result: BLOCKED, not reached.

## CivicRecords AI Workflow

Result: BLOCKED, not reached.

## Resident / Public Records Request

Result: BLOCKED, not reached.

## CivicCode Workflow

Result: BLOCKED, not reached, except that keyboard navigation opened the `Code & Ordinances` screen during UI automation probing.

## Cross-Module Search / Handoff

Result: BLOCKED, not reached.

## Close / Reopen Persistence

Result: BLOCKED, not reached beyond confirming the installed app launched normally after stale-process cleanup.

## Backup / Restore

Result: BLOCKED, not reached.

## Support Bundle

Result: BLOCKED, not reached.

## Repair

Result: BLOCKED, not reached.

## Uninstall / Reinstall / Restore

Result: BLOCKED, not reached.

## Reboot / Restart

Windows was not rebooted or restarted during this directive.

## Exact Blocker

`BLOCKED - post-cleanup CivicSuite WebView UI input cannot be reliably driven by tester harness`.

The directive's first elevated cleanup requirement passed. The stale elevated process no longer blocks the foreground window. The remaining issue is that the normal app window is visible and partially keyboard/mouse reachable, but the tester harness cannot reliably keep focus/input on the CivicSuite WebView long enough to complete first-admin setup and proceed to model setup/full city-core gate.
