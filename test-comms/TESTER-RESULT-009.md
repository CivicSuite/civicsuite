# Tester Result 009 - runtime source materialized; host-Ollama compose dependency blocker
**Tester machine:** Microsoft Windows 11 Pro 10.0.26200 build 26200; 16,629,244 KB visible RAM; Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz, 6 cores / 12 logical processors.
**Branch head tested:** `dc4839e fix(installer): always materialize module source into runtime dir (don't skip if dir exists)`
**Date/time (UTC):** 2026-06-03T18:19:42.1681914Z

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
- Stage3 progress validated on this branch: the result-008 missing runtime source blocker is fixed. `installer\runtime\city-core-baremetal\sources\civicrecords-ai\docker-compose.yml` now exists, alongside the override file and module source files.
- Host Ollama remained good: `nomic-embed-text` and `gemma4:e4b` were pulled, `gemma4:e4b` prewarm passed, and loaded-model check passed. `ollama ps` showed `gemma4:e4b` loaded with `69%/31% CPU/GPU`, context `4096`.
- New Stage3 blocker: lifecycle JSON reports `compose_build` return code 1 with stderr: `service "api" depends on undefined service "ollama": invalid compose project`.
- Interpretation: the host-Ollama compose topology removes or disables the container `ollama` service, but the effective compose project still has `api` depending on `ollama`.
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
- `2026-06-03T18:17:36.9466366Z [stage0] Stage0 target inspection finished with status passed`
- `2026-06-03T18:18:07.2221866Z [stage1] Stage1 WSL2 feature enablement finished; restart_needed=False`
- `2026-06-03T18:18:09.3947929Z [stage2] Using existing Python at C:\Program Files\Python312\python.exe`
- `2026-06-03T18:18:09.3996568Z [stage2] Stage2 prerequisite orchestration finished`
- `2026-06-03T18:18:38.6618051Z [stage3] Stage3 warm-first installer handoff status failed`
- Lifecycle steps: `ollama_pull_model` for `nomic-embed-text` returncode 0; `ollama_pull_model` for `gemma4:e4b` returncode 0; `ollama_prewarm_model` for `gemma4:e4b` passed; `ollama_loaded_model_check` for `gemma4:e4b` passed; `compose_build` for `civicrecords-ai` returncode 1.

## Honest notes
This run got further than result 008. Runtime source materialization now works: the compose file is present in the runtime source directory. The next blocker is compose validity under the host-Ollama topology: `api` still depends on an `ollama` service that is no longer defined in the effective compose project. No source files were edited.
