# TESTER-RESULT-068

## Verdict

BLOCKED - elevated MSI installation succeeded, but the post-install city-core gate could not continue because model setup requires a local-administrator app context and the elevated desktop app window cannot be driven by this medium-integrity automation worker.

This is not the same blocker as `TESTER-RESULT-067.md`: the required elevated installer path was actually attempted and the MSI installed successfully.

## Directive

- Read and executed: `test-comms/TESTER-DIRECTIVE-068.md`
- Tested branch: `stage-3a-baremetal-windows`
- Tested commit: `56c8653ac54effc5d97a12b5aadd569799d3c7b2`
- Required continuity files read:
  - `test-comms/TESTER-DIRECTIVE-067.md`
  - `test-comms/TESTER-RESULT-067.md`
  - `test-comms/TESTER-RESULT-066.md`
  - `test-comms/TESTER-RESULT-065.md`

## Artifact Identity

- PR #192 head commit confirmed: `a8c6715d8434160c8ade722d9459f2247fb7369d`
- Source workflow run: `27522471421`
- Source workflow job: `build Windows Local MSI`
- Release tag: `windows-local-msi-ci-a8c6715`
- Release URL: `https://github.com/CivicSuite/civicsuite/releases/tag/windows-local-msi-ci-a8c6715`
- MSI URL: `https://github.com/CivicSuite/civicsuite/releases/download/windows-local-msi-ci-a8c6715/CivicSuite_0.1.0_x64_en-US.msi`
- Evidence URL: `https://github.com/CivicSuite/civicsuite/releases/download/windows-local-msi-ci-a8c6715/CivicSuite-msi-evidence.txt`
- Installer filename: `CivicSuite_0.1.0_x64_en-US.msi`
- Installer bytes: `1639690816`
- Installer SHA-256: `85b51b6cfe8f4713491261ca8bef070db5a7341419ad2f367670e177cbb11ce5`
- Evidence bytes: `548`
- Evidence SHA-256: `5bb4eeecd08532d0c4434c6ab712dcfa08e0a9646aa7b2f891db55f8d9636164`

Evidence file contents:

```text
CivicSuite Windows Local MSI build evidence
GeneratedAtUtc=2026-06-15T04:55:48.5852962Z
File=CivicSuite_0.1.0_x64_en-US.msi
Bytes=1639690816
SHA256=85b51b6cfe8f4713491261ca8bef070db5a7341419ad2f367670e177cbb11ce5
UpgradeCode=a63fc1d3-5437-5f55-89a2-fef93fb1f930
InstallerBundle=msi
UnsignedBetaNotice=desktop/installer/windows/unsigned-beta-install-notice.txt
UnsignedBetaNoticeSurface=msi-license-file
SmartScreenGuidance=More info -> Run anyway
NoDockerPrerequisite=true
NoWslPrerequisite=true
RuntimePayload=desktop/runtime/payload
```

## Cleanroom-Equivalent Wipe

Preserved prior evidence under local non-OneDrive evidence folders, then repeated the directive 067 cleanroom checks before installation.

- Existing CivicSuite uninstall entries before install: none found
- Existing CivicSuite processes before install: none found
- `C:\Program Files\CivicSuite`: absent before install
- `%LOCALAPPDATA%\CivicSuite`: absent before install
- `%APPDATA%\CivicSuite`: absent before install
- `C:\ProgramData\CivicSuite`: absent before install
- `%LOCALAPPDATA%\civicsuite`: absent before install
- `%APPDATA%\civicsuite`: absent before install
- `%USERPROFILE%\CivicSuite`: absent before install
- `%USERPROFILE%\Documents\CivicSuite`: absent before install
- `%USERPROFILE%\Downloads\CivicSuite_0.1.0_x64_en-US.msi`: absent before install

No uninstall operation, process stop, or remnant removal was needed before this run.

## Starting State After Wipe

- Captured UTC: `2026-06-15T07:24:36.3764937Z`
- OS: Windows 11 Pro
- Version/build: `10.0.26200` / `26200`
- CPU: Intel Core i7-9750H
- Logical processors: `12`
- RAM bytes: `17028345856`
- C: free bytes: captured in `directive068-evidence/starting-state.json`
- User: `insty`
- Identity: `DESKTOP-LOOTB7M\insty`
- Worker token admin role: `false`
- Worker integrity: `Mandatory Label\Medium Mandatory Level`
- Worker process: `powershell.exe`
- WebView2 checked registry keys: not detected in the checked keys

## Elevated Installer Attempt

- Elevation path attempted: `Start-Process -FilePath msiexec.exe -Verb RunAs -Wait`
- MSI command arguments: `/i CivicSuite_0.1.0_x64_en-US.msi /qn /norestart ALLUSERS=1 /L*v elevated-msi-install.log`
- UAC prompt expected: yes
- UAC prompt approved: yes, based on the elevated `msiexec.exe` process starting and completing
- Process started: yes
- Elevated installer PID recorded: `9972`
- Install exit code: `0`
- Install log path: `directive068-evidence/elevated-msi-install.log`

MSI log evidence:

```text
Product: CivicSuite -- Installation completed successfully.
Windows Installer installed the product. Product Name: CivicSuite. Product Version: 0.1.0. Product Language: 1033. Manufacturer: CivicSuite. Installation success or error status: 0.
MainEngineThread is returning 0
```

## Installed State

- Final uninstall entry: present
- Product code: `{F6DA9BD7-B75C-405B-9799-ED10E105CEC0}`
- Display name: `CivicSuite`
- Display version: `0.1.0`
- Publisher: `CivicSuite`
- Install location: `C:\Program Files\CivicSuite\`
- Uninstall string: `MsiExec.exe /X{F6DA9BD7-B75C-405B-9799-ED10E105CEC0}`
- Install target exists: `C:\Program Files\CivicSuite`
- Installed executable: `C:\Program Files\CivicSuite\civicsuite-desktop.exe`
- Installed executable size: `12398080`
- Installed runtime payload directory: `C:\Program Files\CivicSuite\_up_\runtime`

## Installer UX / Unsigned Beta / SmartScreen

The install was run through an elevated quiet MSI path with `/qn`, so no installer wizard, license surface, unsigned beta notice, or SmartScreen screen was displayed during the successful install attempt. The installed app first-run checklist later displayed an unsigned beta notice step.

## First Launch

- Launch path: `C:\Program Files\CivicSuite\civicsuite-desktop.exe`
- Medium-token app launch: succeeded
- Main window title: `CivicSuite`
- Process responding: yes
- First visible screen: Staff surface, "Work that needs attention", first-run "City Core setup checklist"
- Screenshot evidence:
  - `directive068-evidence/desktop-after-first-launch.png`
  - `directive068-evidence/desktop-first-run-pagedown.png`
  - `directive068-evidence/after-file-picker-close.png`

The first-run checklist included:

- "Welcome and unsigned beta notice"
- "Windows SmartScreen explanation"
- Model setup for `google/gemma-4-12b-it-qat-q4_0-gguf`

## Model Download / Checksum / Load / Register

Result: BLOCKED before model download.

The model setup card showed:

- Google source: `google/gemma-4-12b-it-qat-q4_0-gguf`
- Status: `Not downloaded`
- Saved: `0.0 GB`
- Progress: `0.00%`
- Message: `No verified or partial Gemma model download is saved on this machine.`
- Local path message: `Sign in as local administrator to view the model file`

Actions attempted from the installed desktop app:

- Clicked/keyboard-activated the first-run setup path.
- Opened the model folder through the app. Windows Explorer opened `C:\CivicSuite\Data\models`; the folder was empty.
- Clicked `Download / Resume` from the medium-token app. No model file appeared under `C:\CivicSuite\Data\models`, no progress changed, and no downloader process or app data activity was observed after waiting.
- Launched the installed app with `Start-Process -Verb RunAs`. The elevated app started and displayed the CivicSuite window, but this medium-integrity automation worker could not drive the elevated UI due Windows integrity/UIPI isolation.

Because the only apparent way past model setup is an administrator app context, and the available automation worker cannot send input to that elevated WebView window, the rest of the post-install gate could not be completed in this harness.

## System Health / Admin Gating

Result: BLOCKED, not reached through app workflow.

The left navigation displayed `System Health - Local services, model, backup, repair`, but the gate did not advance past model setup, and the elevated app UI could not be driven from this worker.

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

Result: BLOCKED, not reached beyond basic app launch. The installed app launched and showed the first-run checklist, but setup did not complete.

## Backup / Restore

Result: BLOCKED, not reached.

## Support Bundle

Result: BLOCKED, not reached.

## Repair

Result: BLOCKED, not reached.

## Uninstall / Reinstall / Restore

Result: BLOCKED, not reached because the first-run model setup gate could not be completed.

## Process Cleanup

- Medium app process launched by the tester was stopped.
- Elevated app process PID `24900` could not be stopped from the medium worker: `Access is denied`.

## Reboot / Restart

Windows was not rebooted or restarted during this directive.

## Evidence Paths

- `directive068-evidence/required-files-read.json`
- `directive068-evidence/cleanroom-wipe.json`
- `directive068-evidence/starting-state.json`
- `directive068-evidence/artifact-verification.json`
- `directive068-evidence/elevated-install-attempt.json`
- `directive068-evidence/elevated-msi-install.log`
- `directive068-evidence/first-launch-process.json`
- `directive068-evidence/app-data-inventory.json`
- `directive068-evidence/uia-window-dump.txt`
- `directive068-evidence/desktop-after-first-launch.png`
- `directive068-evidence/desktop-first-run-pagedown.png`
- `directive068-evidence/after-file-picker-close.png`
- `directive068-evidence/after-download-click-state.json`
- `directive068-evidence/elevated-app-launch.json`
- `directive068-evidence/elevated-app-initial.png`
- `directive068-evidence/normal-app-resized.png`
- `directive068-evidence/final-state.json`
- `directive068-evidence/uninstall-entry-specific.json`
- `directive068-evidence/process-cleanup.json`

## Blocker Details

The elevated installer path is available and works on this machine. The remaining blocker is post-install automation:

1. The medium-token installed app reaches first-run but will not start model download and says local model file access requires signing in as local administrator.
2. The installed app can be launched elevated, but this Codex worker remains medium-integrity and cannot send keyboard/mouse automation into that elevated WebView window.
3. No Docker, WSL, repo-local bootstrap script, legacy bridge folder, alternate package, reboot, or Windows restart was used.
