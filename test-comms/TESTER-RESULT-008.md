# Tester Result 008 - host Ollama model path passed; runtime compose source missing
**Tester machine:** Microsoft Windows 11 Pro 10.0.26200 build 26200; 16,629,244 KB visible RAM; Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz, 6 cores / 12 logical processors.
**Branch head tested:** `79cd52c feat(installer): host-Ollama (GPU) topology for bare-metal city-core install`
**Date/time (UTC):** 2026-06-03T18:07:37.5304154Z

## Virtualization diagnosis
- HypervisorPresent: True
- VirtualizationFirmwareEnabled: False
- INTERPRETATION: false-negative. VT-x is genuinely available because `Win32_ComputerSystem.HypervisorPresent` is `True`.
- Corrected host facts JSON used: `C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\installer\baremetal\windows\logs\host-facts-hypervisor-present.json`

## WSL / Docker / Ollama / Python state
- `wsl --status`: exit code 0; output: `Default Distribution: docker-desktop`; `Default Version: 2`.
- Docker Desktop: running.
- Python: `C:\Program Files\Python312\python.exe --version` reports `Python 3.12.7`.
- Host Ollama: running from `C:\Users\insty\AppData\Local\Programs\Ollama\ollama.exe`.

## Per-stage results
- Stage0 (inspect): passed using corrected `-HostFactsJson`.
- Stage1 (WSL2 enablement): passed with `restart_needed=false`.
- Stage2 (Docker + Ollama + Python): passed, using existing Python at `C:\Program Files\Python312\python.exe`.
- Stage3 (city-core stack): failed during `compose_build` for `civicrecords-ai`.
- Stage3 progress validated on this branch: host Ollama pulled `nomic-embed-text`, pulled `gemma4:e4b`, prewarmed `gemma4:e4b`, and passed the loaded-model check. `ollama ps` showed `gemma4:e4b` loaded with `69%/31% CPU/GPU`, context `4096`.
- Stage3 blocker: lifecycle JSON reports `compose_build` return code 1 with stderr: `open ...\installer\runtime\city-core-baremetal\sources\civicrecords-ai\docker-compose.yml: The system cannot find the file specified.`
- Stage3 runtime source observation: `modules\civicrecords-ai\docker-compose.yml` exists in the published repo, but the generated runtime copy at `installer\runtime\city-core-baremetal\sources\civicrecords-ai\docker-compose.yml` did not exist. That runtime directory contained only `data`, `.env`, and `docker-compose.civicsuite.override.yml`.
- Stage3 hang detail: after logging `Stage3 warm-first installer handoff status failed`, the elevated bootstrap wrapper again did not write a final structured result; the result JSON stayed at the initial non-elevated `status=elevation_requested`. I stopped the stuck elevated wrapper and Python child after evidence capture.
- Stage4 (verify): not reached.

## THE CRITICAL CHECK
- generation_source: null
- generation_model: null
- VERDICT: FAIL - no live AI letter proof was generated because Stage3 stopped before building/starting the stack.

## Suite launcher
- http://localhost:18082 serving: no
- civicrecords API http://127.0.0.1:18163 serving: no
- civicrecords web http://127.0.0.1:18243 serving: no
- Module URLs: none printed.

## Evidence paths
Bootstrap log:
`C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\installer\baremetal\windows\logs\civicsuite-baremetal-bootstrap.log`

Bootstrap result JSON:
`C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\installer\baremetal\windows\logs\civicsuite-baremetal-bootstrap-result.json`

Lifecycle evidence JSON:
`C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\installer\reports\stage3a-baremetal\clerk-core-installer-lifecycle.json`

Key log excerpts:
- `2026-06-03T18:01:16.9665800Z [stage0] Stage0 target inspection finished with status passed`
- `2026-06-03T18:01:48.2018564Z [stage1] Stage1 WSL2 feature enablement finished; restart_needed=False`
- `2026-06-03T18:01:50.3884009Z [stage2] Using existing Python at C:\Program Files\Python312\python.exe`
- `2026-06-03T18:01:50.3972137Z [stage2] Stage2 prerequisite orchestration finished`
- `2026-06-03T18:05:03.9018183Z [stage3] Stage3 warm-first installer handoff status failed`
- Lifecycle steps: `ollama_pull_model` for `nomic-embed-text` returncode 0; `ollama_pull_model` for `gemma4:e4b` returncode 0; `ollama_prewarm_model` for `gemma4:e4b` passed; `ollama_loaded_model_check` for `gemma4:e4b` passed; `compose_build` for `civicrecords-ai` returncode 1.

## Honest notes
This run got further than result 007. The new host-Ollama topology fixed the previous container-Ollama polling stall: the required 9.6 GB model was pulled to host Ollama and successfully loaded/prewarmed with partial GPU use. The next blocker is runtime source materialization for compose: the published module source has `docker-compose.yml`, but the installer-generated runtime source directory did not. No source files were edited.
