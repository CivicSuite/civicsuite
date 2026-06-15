# TESTER-RESULT-067

## Verdict

BLOCKED - cleanroom-equivalent wipe and artifact verification completed, but this tester context still cannot run the all-users MSI installer because it has only a non-admin medium-integrity token and no usable elevation/UAC harness.

## Directive

- Read and executed: `test-comms/TESTER-DIRECTIVE-067.md`
- Tested branch: `stage-3a-baremetal-windows`
- Tested commit: `fc54d588de65e7f3e0ff3a18d8ce1759ae6eba25`
- Also read as required:
  - `test-comms/TESTER-RESULT-065.md`
  - `test-comms/TESTER-RESULT-066.md`
  - `test-comms/TESTER-DIRECTIVE-066.md`

## Artifact Identity

- PR #192 head commit confirmed: `a8c6715d8434160c8ade722d9459f2247fb7369d`
- Release tag: `windows-local-msi-ci-a8c6715`
- Release URL: `https://github.com/CivicSuite/civicsuite/releases/tag/windows-local-msi-ci-a8c6715`
- MSI URL: `https://github.com/CivicSuite/civicsuite/releases/download/windows-local-msi-ci-a8c6715/CivicSuite_0.1.0_x64_en-US.msi`
- Evidence URL: `https://github.com/CivicSuite/civicsuite/releases/download/windows-local-msi-ci-a8c6715/CivicSuite-msi-evidence.txt`
- MSI file: `CivicSuite_0.1.0_x64_en-US.msi`
- MSI bytes: `1639690816`
- MSI SHA-256: `85b51b6cfe8f4713491261ca8bef070db5a7341419ad2f367670e177cbb11ce5`
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

Preserved prior evidence files, then checked for installed/remnant CivicSuite state before installation.

- Existing CivicSuite uninstall entries: none found
- Existing CivicSuite processes: none found
- `C:\Program Files\CivicSuite`: absent
- `%LOCALAPPDATA%\CivicSuite`: absent
- `%APPDATA%\CivicSuite`: absent
- `C:\ProgramData\CivicSuite`: absent
- `%LOCALAPPDATA%\civicsuite`: absent
- `%APPDATA%\civicsuite`: absent
- `%USERPROFILE%\CivicSuite`: absent
- `%USERPROFILE%\Documents\CivicSuite`: absent
- `%USERPROFILE%\Downloads\CivicSuite_0.1.0_x64_en-US.msi`: absent

No uninstall operation, process stop, or remnant removal was needed because no installed product or common leftover paths were present.

## Starting State After Wipe

- Captured UTC: `2026-06-15T07:10:59.9914257Z`
- OS: Windows 11 Pro
- Version/build: `10.0.26200` / `26200`
- CPU: Intel Core i7-9750H
- Logical processors: `12`
- RAM bytes: `17028345856`
- C: free bytes: `76928643072`
- User: `insty`
- Identity: `DESKTOP-LOOTB7M\insty`
- Admin token: `false`
- Integrity: `Mandatory Label\Medium Mandatory Level`
- Current process: `powershell.exe`
- Session: `1`
- Interactive user session observed: `insty console 1 Active`
- WebView2 registry detection in checked keys: `false`

## Installer Attempt

The MSI was not re-run in the same non-admin silent mode already proven blocked in `TESTER-RESULT-065.md`:

- Prior non-admin silent MSI install returned `1603`.
- MSI log showed Error 1925: insufficient privileges to complete the all-users installation.

The elevated/visible UAC path was also not attempted from this heartbeat context because `TESTER-RESULT-066.md` already established that the automation worker cannot safely launch and drive a visible elevated installer flow, and the current directive explicitly prohibits visible PowerShell or terminal windows. The current process still has only a non-admin medium-integrity token, and no elevated token or approved interactive elevation harness is available.

No Docker, WSL, repo-local bootstrap script, legacy bridge folder, alternate package, reboot, or Windows restart was used.

## Not Reached

Because installation could not be started from a usable elevated context, these checks were not reached:

- unsigned beta notice / SmartScreen installer UX
- first launch
- model download
- System Health
- module manager
- RBAC
- workflows
- cross-module workflows
- offline restart persistence
- backup and restore
- support bundle
- repair
- uninstall/reinstall

## Evidence

- `directive067-evidence/pre-wipe-state.json`
- `directive067-evidence/artifact-reverification.json`
- `directive067-evidence/clean-starting-state-and-token.json`

