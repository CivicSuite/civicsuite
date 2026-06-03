# Tester Result 001 - CivicSuite Stage 3A bare-machine live gate
**Tester machine:** Windows reported as `Windows 10 Pro` by `Get-ComputerInfo`; RAM/CPU unavailable because local system inventory calls returned `Access denied`; Docker/Ollama not found on PATH, `wsl.exe` present.
**Date/time (UTC):** 2026-06-03T03:10:45.7515206Z
**Bootstrapper exit code:** not run - blocked before installer start

## Phase results
- Stage0 (inspect): failed - Codex session was not elevated; directive says to stop if not running as administrator.
- Stage1 (WSL2 enable + reboot): skipped - installer was not run.
- Stage2 (Docker + Ollama install): skipped - installer was not run.
- Stage3 (city-core stack): skipped - installer was not run.
- Stage4 (verify): skipped - installer was not run.

## THE CRITICAL CHECK
- generation_source: null
- generation_model: null
- VERDICT: FAIL - no AI letter was generated because the required elevated run mode was missing.

## Suite launcher
- http://localhost:18082 serving: no
- Module URLs: none printed; installer was not run.

## Evidence path
No bootstrap result JSON was created because execution stopped before running `installer/baremetal/windows/civicsuite-baremetal-bootstrap.ps1`.

Key evidence:
- Elevation check command: `([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)`
- Elevation check result: `False`
- System inventory attempts using `Get-CimInstance` and `systeminfo` returned `Access denied`.
- Tool discovery: `wsl.exe` present; `docker` and `ollama` not found on PATH.

## Honest notes
The directive explicitly says: "If you find you are NOT elevated, stop and have the app relaunched as administrator - do not try to push past it." I therefore did not run the bare-metal installer.
