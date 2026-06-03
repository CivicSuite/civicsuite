# Tester Result 003 - WSL2-fixed install rerun + live AI-letter proof
**Tester machine:** Microsoft Windows 11 Pro 10.0.26200 build 26200; 16,629,244 KB visible RAM; Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz, 6 cores / 12 logical processors.
**Date/time (UTC):** 2026-06-03T07:17:16.8219786Z

## Virtualization diagnosis
- HypervisorPresent: True
- VirtualizationFirmwareEnabled: False
- INTERPRETATION: false-negative. VT-x is genuinely available because `Win32_ComputerSystem.HypervisorPresent` is `True`.
- Corrected host facts JSON used: `C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\installer\baremetal\windows\logs\host-facts-hypervisor-present.json`

## WSL / Docker state
- `wsl --status`: exit code 0; output: `Default Distribution: docker-desktop`; `Default Version: 2`
- `wsl -l -v`: exit code 0; output: `docker-desktop` running, version 2
- Docker Desktop: installed during this run.
- Docker spike: final rerun passed with `docker_present=true`, `wsl_integration=true`, `engine_ready=true`.

## Per-stage results
- Stage0 (inspect): passed using corrected `-HostFactsJson`.
- Stage1 (WSL2 enable + reboot): passed. First run installed WSL2 and VirtualMachinePlatform, returned `restart_required`, and the machine was rebooted. Resume task reran Stage1 successfully. A later Docker/WSL boundary also returned `restart_required`; after reboot, Stage1 passed with `restart_needed=false`.
- Stage2 (Docker + Ollama install): failed after progress. Docker Desktop downloaded, installed, and became engine-ready on rerun. Ollama installer downloaded fully (`OllamaSetup.exe`, 1,393,457,880 bytes), then `Start-Process ... /S -Wait` hung with visible process/window `OllamaSetup.tmp` title `Setup - Ollama version 0.30.2`. No `ollama.exe` appeared at `$env:LOCALAPPDATA\Programs\Ollama\ollama.exe`.
- Stage3 (city-core stack): not reached.
- Stage4 (verify): not reached.

## THE CRITICAL CHECK
- generation_source: null
- generation_model: null
- VERDICT: FAIL - no live AI letter proof was generated because the installer stopped in Stage2 before Ollama/model/stack setup completed.

## Suite launcher
- http://localhost:18082 serving: no
- Module URLs: none printed.

## Evidence paths
Bootstrap result JSON:
`C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\installer\baremetal\windows\logs\civicsuite-baremetal-bootstrap-result.json`

Docker spike result JSON:
`C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\installer\baremetal\windows\logs\docker-desktop\docker-desktop-spike-result.json`

Lifecycle evidence JSON:
`C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\installer\reports\stage3a-baremetal\clerk-core-installer-lifecycle.json` was missing.

Key log excerpts:
- `2026-06-03T06:09:40.1190250Z [stage0] Stage0 target inspection finished with status passed`
- `2026-06-03T06:10:07.3505008Z [stage1] Stage1 WSL2 feature enablement finished; restart_needed=True`
- `2026-06-03T06:45:53.0428280Z [start] Starting CivicSuite bare-metal bootstrap stage Stage1`
- `2026-06-03T06:46:24.8536609Z [stage1] Stage1 WSL2 feature enablement finished; restart_needed=False`
- `2026-06-03T06:52:48.8343834Z` Docker spike final result: `status=passed`, `engine_ready=true`
- `2026-06-03T06:52:49.9452552Z [stage2] Downloading Ollama installer to ...\OllamaSetup.exe`
- `2026-06-03T07:10:07.1488263Z [stage2] Starting Ollama installer silently`
- Stuck process evidence at 2026-06-03T07:17:16Z: `OllamaSetup` and `OllamaSetup.tmp`; window title `Setup - Ollama version 0.30.2`; `ollama.exe` missing.

## Honest notes
This run got much further than 002. WSL2 was installed and survived reboot; Docker Desktop installed after a long download, initially failed because the engine was not ready yet, then passed on a clean rerun once Docker was up. The next fresh-machine blocker is the Ollama installer: despite the published `/S` silent argument, it opened/stayed in a setup window and never completed within the observed window. I stopped the stuck Ollama installer processes after capturing evidence so the machine was not left waiting indefinitely. No source files were edited.
