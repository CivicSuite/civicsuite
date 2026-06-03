# Tester Result 005 - Stage2 passes; Stage3 Python alias blocker
**Tester machine:** Microsoft Windows 11 Pro 10.0.26200 build 26200; 16,629,244 KB visible RAM; Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz, 6 cores / 12 logical processors.
**Branch head tested:** `5a5ac19 fix(installer): don't -Wait on the Ollama installer; poll for ollama.exe`
**Date/time (UTC):** 2026-06-03T14:57:08.2052828Z

## Virtualization diagnosis
- HypervisorPresent: True
- VirtualizationFirmwareEnabled: False
- INTERPRETATION: false-negative. VT-x is genuinely available because `Win32_ComputerSystem.HypervisorPresent` is `True`.
- Corrected host facts JSON used: `C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\installer\baremetal\windows\logs\host-facts-hypervisor-present.json`

## WSL / Docker / Ollama state
- `wsl --status`: exit code 0; output: `Default Distribution: docker-desktop`; `Default Version: 2`
- `wsl -l -v`: exit code 0; output: `docker-desktop` running, version 2
- Docker spike: passed with `docker_present=true`, `installed=false`, `wsl_integration=true`, `engine_ready=true`.
- Ollama: present at `C:\Users\insty\AppData\Local\Programs\Ollama\ollama.exe`; `ollama list` by full path succeeds and currently shows no pulled models.

## Per-stage results
- Stage0 (inspect): passed using corrected `-HostFactsJson`.
- Stage1 (WSL2 enablement): passed with `restart_needed=false`.
- Stage2 (Docker + Ollama): passed. This confirms the `5a5ac19` change fixed the prior stuck `Start-Process -Wait` behavior; the bootstrap advanced past Ollama and wrote `Stage2 prerequisite orchestration finished`.
- Stage3 (city-core stack): failed immediately with `exit_code=9009`.
- Stage3 diagnosis: the bootstrap default is `-PythonPath python`. On this fresh Windows machine, `where python` resolves only to `C:\Users\insty\AppData\Local\Microsoft\WindowsApps\python.exe`, the Microsoft Store app execution alias. `python --version` prints `Python was not found; run without arguments to install from the Microsoft Store...`; `py` is not installed. I did not inject Codex's private bundled Python path because that would mask the published bare-metal installer dependency gap.
- Stage4 (verify): not reached. It failed because lifecycle evidence was not created: `installer\reports\stage3a-baremetal\clerk-core-installer-lifecycle.json` is missing.

## THE CRITICAL CHECK
- generation_source: null
- generation_model: null
- VERDICT: FAIL - no live AI letter proof was generated because Stage3 could not start without a real system Python.

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
- `2026-06-03T14:54:29.0760127Z [stage0] Stage0 target inspection finished with status passed`
- `2026-06-03T14:54:59.1086741Z [stage1] Stage1 WSL2 feature enablement finished; restart_needed=False`
- `2026-06-03T14:55:02.2010903Z [stage2] Stage2 prerequisite orchestration finished`
- `2026-06-03T14:55:03.2923976Z [stage3] Stage3 warm-first installer handoff status failed`
- `2026-06-03T14:55:04.3481926Z [failure] Stage4 lifecycle evidence was not found at ...\installer\reports\stage3a-baremetal\clerk-core-installer-lifecycle.json.`

## Honest notes
This run got one step further than result 004. Docker and Ollama are now both accepted by the bootstrap, and the Stage2 fix is validated on the tester box. The next published-installer blocker is that Stage3 assumes a working `python` command on Windows, but this fresh Windows 11 machine has only the Store alias and no `py` launcher. No source files were edited.
