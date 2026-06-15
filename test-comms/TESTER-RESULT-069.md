# TESTER-RESULT-069

## Verdict

BLOCKED - the installed app state from result 068 is intact and the app can launch as the normal medium-integrity user, but a leftover elevated CivicSuite desktop process from result 068 remains active, cannot be stopped or window-managed from the medium Codex worker, and prevents the normal app window from being foregrounded/driven for first CivicSuite local-admin setup without using another UAC/elevated path.

This is a tester-harness/window-integrity blocker, not a new MSI install failure.

## Directive

- Read and executed: `test-comms/TESTER-DIRECTIVE-069.md`
- Tested branch: `stage-3a-baremetal-windows`
- Tested commit: `7967b910ac70e78bc0aec3053e21b90019207c08`
- Required continuity files read:
  - `test-comms/TESTER-DIRECTIVE-068.md`
  - `test-comms/TESTER-RESULT-068.md`
  - `test-comms/TESTER-DIRECTIVE-067.md`

## Product Artifact Truth

- PR #192 head under test: `a8c6715d8434160c8ade722d9459f2247fb7369d`
- Source workflow run: `27522471421`
- Source workflow job: `build Windows Local MSI`
- Public prerelease tag: `windows-local-msi-ci-a8c6715`
- Installed executable continued from result 068: `C:\Program Files\CivicSuite\civicsuite-desktop.exe`

## Installed App State

CivicSuite remains installed from result 068.

- Uninstall entry exists: yes
- Uninstall key: `HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\{F6DA9BD7-B75C-405B-9799-ED10E105CEC0}`
- Display name: `CivicSuite`
- Display version: `0.1.0`
- Publisher: `CivicSuite`
- Install location: `C:\Program Files\CivicSuite\`
- Uninstall string: `MsiExec.exe /X{F6DA9BD7-B75C-405B-9799-ED10E105CEC0}`
- Installed executable exists: yes

Result 068 elevated MSI install success was confirmed by reading `TESTER-RESULT-068.md`.

## Starting State / Integrity

- Captured UTC: `2026-06-15T08:05:46.3940088Z`
- Worker identity: `DESKTOP-LOOTB7M\insty`
- Worker admin role: `false`
- Worker integrity: `Mandatory Label\Medium Mandatory Level`
- Worker process: `C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe`

## Elevated Process From Result 068

Before launching a normal app process, a prior elevated CivicSuite process remained:

- PID: `24900`
- Process name: `civicsuite-desktop`
- Path readable from worker: no, `Path` was null
- Main window title: `CivicSuite`
- Responding: yes

Stop attempt from the medium worker:

```text
Cannot stop process "civicsuite-desktop (24900)" because of the following error: Access is denied
```

Non-UAC window-management probe:

- Attempted to move elevated window off-screen: failed
- Attempted to minimize elevated window: failed
- Attempted to foreground normal app window: failed

No additional UAC prompt was intentionally triggered for this directive, consistent with the operator's instruction to prefer paths that do not require UAC when the operator may be away.

## Normal App Launch Evidence

A normal medium-integrity CivicSuite process was launched:

- PID: `29296`
- Path: `C:\Program Files\CivicSuite\civicsuite-desktop.exe`
- Main window title: `CivicSuite`
- Responding: yes

The visible app surface showed:

- `WINDOWS LOCAL 1.0`
- `CivicSuite`
- Staff surface selected
- `Work that needs attention`
- First-run setup card: `City Core setup checklist`

Screenshot evidence:

- `directive069-evidence/normal-app-start.png`
- `directive069-evidence/after-window-management-probe.png`

The normal process started for this directive was stopped after evidence capture:

- PID `29296`: stopped successfully

## App UI Automatable From Tester Context

Result: BLOCKED.

The normal app process exists and is responding, but the visible/foreground CivicSuite window remains controlled by the elevated process from result 068. From the medium worker:

- `Stop-Process` on the elevated PID fails with access denied.
- Moving/minimizing the elevated window fails.
- Foregrounding the normal window fails.
- Keyboard/PageDown/mouse wheel attempts do not advance the visible first-run checklist.

Because directive 069 explicitly says not to launch the CivicSuite desktop app elevated for normal UI automation, I did not use another UAC path to manipulate the elevated process or relaunch the app elevated again.

## First CivicSuite Local Admin Creation Result

Result: BLOCKED, not reached.

The app could not be driven to the first-run "First admin user" step, Settings > First Admin form, or another first-admin setup screen because the prior elevated window remained in control and could not be dismissed from the medium tester context.

No local config files were hand-edited.

## CivicSuite Local Admin Sign-In Result

Result: BLOCKED, not reached.

No CivicSuite local-admin account was created or signed into during this directive.

## Model Setup Result After App Local-Admin Sign-In

Result: BLOCKED, not reached.

Since no first CivicSuite local administrator could be created or signed into through the app UI, model setup after app-local-admin sign-in was not attempted.

## System Health / Admin Gating

Result: BLOCKED, not reached.

## Module Manager

Result: BLOCKED, not reached.

## Local Users / RBAC

Result: BLOCKED, not reached.

## CivicClerk Workflow

Result: BLOCKED, not reached.

## CivicRecords AI Workflow

Result: BLOCKED, not reached.

## Resident / Public Records Request

Result: BLOCKED, not reached.

## CivicCode Workflow

Result: BLOCKED, not reached.

## Cross-Module Search / Handoff

Result: BLOCKED, not reached.

## Close / Reopen Persistence

Result: BLOCKED, not reached beyond confirming the installed app launches to first-run setup.

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

## Evidence Paths

- `directive069-evidence/starting-state.json`
- `directive069-evidence/window-management-probe.json`
- `directive069-evidence/normal-app-start.png`
- `directive069-evidence/page-down-1.png`
- `directive069-evidence/page-down-2.png`
- `directive069-evidence/tabbed-1.png`
- `directive069-evidence/after-window-management-probe.png`
- `directive069-evidence/normal-process-cleanup.json`

## Blocker Details

The next productive run should begin from a state where no elevated `civicsuite-desktop.exe` process remains from result 068. That can likely be achieved by the operator closing the elevated CivicSuite window, signing out, or using an already-elevated/admin context to stop PID `24900`. This directive did not take those paths because they would require elevated UI/control outside the normal medium-integrity app workflow requested by directive 069 and the operator also warned that UAC approval may not be available.

