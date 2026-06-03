# Tester Result 006 - Python provisioned; missing module source blocker
**Tester machine:** Microsoft Windows 11 Pro 10.0.26200 build 26200; 16,629,244 KB visible RAM; Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz, 6 cores / 12 logical processors.
**Branch head tested:** `77d3ffa fix(installer): provision Python for Stage3 (fresh Windows has only the Store alias)`
**Date/time (UTC):** 2026-06-03T16:05:35.9081250Z

## Virtualization diagnosis
- HypervisorPresent: True
- VirtualizationFirmwareEnabled: False
- INTERPRETATION: false-negative. VT-x is genuinely available because `Win32_ComputerSystem.HypervisorPresent` is `True`.
- Corrected host facts JSON used: `C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\installer\baremetal\windows\logs\host-facts-hypervisor-present.json`

## WSL / Docker / Ollama / Python state
- `wsl --status`: exit code 0; output: `Default Distribution: docker-desktop`; `Default Version: 2`
- Docker spike: passed with `docker_present=true`, `installed=false`, `wsl_integration=true`, `engine_ready=true`.
- Ollama: present at `C:\Users\insty\AppData\Local\Programs\Ollama\ollama.exe`; `ollama list` succeeds and currently shows no pulled models.
- Python: provisioned by the bootstrap. `C:\Program Files\Python312\python.exe --version` reports `Python 3.12.7`.

## Per-stage results
- Stage0 (inspect): passed using corrected `-HostFactsJson`.
- Stage1 (WSL2 enablement): passed with `restart_needed=false`.
- Stage2 (Docker + Ollama + Python): passed. This validates the `77d3ffa` Python provisioning fix: the bootstrap downloaded `python-installer.exe`, installed Python silently all-users, resolved `C:\Program Files\Python312\python.exe`, and logged `Stage2 prerequisite orchestration finished`.
- Stage3 (city-core stack): failed immediately after entering the lifecycle runner. The lifecycle JSON reports `status=failed` with error: `Missing source for civicrecords-ai. Expected bundled source at ...\civicsuite\modules\civicrecords-ai or local checkout at ...\civicrecords-ai.`
- Stage3 hang detail: after the lifecycle JSON wrote the missing-source failure at `2026-06-03T16:01:19.157424+00:00`, the elevated bootstrap wrapper did not write a final structured result. `civicsuite-baremetal-bootstrap-result.json` remained the initial `status=elevation_requested` handoff. I stopped the stuck elevated wrapper and its idle Python child after evidence capture.
- Stage4 (verify): not reached.

## THE CRITICAL CHECK
- generation_source: null
- generation_model: null
- VERDICT: FAIL - no live AI letter proof was generated because Stage3 could not find the `civicrecords-ai` source.

## Suite launcher
- http://localhost:18082 serving: no
- Module URLs: none printed.

## Evidence paths
Bootstrap log:
`C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\installer\baremetal\windows\logs\civicsuite-baremetal-bootstrap.log`

Bootstrap result JSON:
`C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\installer\baremetal\windows\logs\civicsuite-baremetal-bootstrap-result.json`

Docker spike result JSON:
`C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\installer\baremetal\windows\logs\docker-desktop\docker-desktop-spike-result.json`

Lifecycle evidence JSON:
`C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\installer\reports\stage3a-baremetal\clerk-core-installer-lifecycle.json`

Key log excerpts:
- `2026-06-03T15:59:49.4322449Z [stage0] Stage0 target inspection finished with status passed`
- `2026-06-03T16:00:17.5006377Z [stage1] Stage1 WSL2 feature enablement finished; restart_needed=False`
- `2026-06-03T16:00:19.8632894Z [stage2] Downloading Python installer to ...\python-installer.exe`
- `2026-06-03T16:00:46.7429272Z [stage2] Installing Python silently (all users)`
- `2026-06-03T16:01:18.5444720Z [stage2] Python installed at C:\Program Files\Python312\python.exe`
- `2026-06-03T16:01:18.5479998Z [stage2] Stage2 prerequisite orchestration finished`
- `2026-06-03T16:01:19.5904785Z [stage3] Stage3 warm-first installer handoff status failed`
- Lifecycle JSON error: missing source for `civicrecords-ai` at both `modules\civicrecords-ai` and sibling `..\civicrecords-ai`.

## Honest notes
This run got further than result 005. Python provisioning works on the fresh Windows tester and Stage2 now completes with Docker, Ollama, and Python in place. The next blocker is package/source completeness for Stage3: the published branch does not include `modules\civicrecords-ai`, and there is no sibling checkout at the path the lifecycle runner expects. No source files were edited.
