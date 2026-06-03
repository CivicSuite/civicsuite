# Tester Result 007 - bundled records source + model pull passed; Stage3 stalled after Ollama polling
**Tester machine:** Microsoft Windows 11 Pro 10.0.26200 build 26200; 16,629,244 KB visible RAM; Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz, 6 cores / 12 logical processors.
**Branch head tested:** `637042f feat(installer): bundle pinned city-core module sources (Stage 3A self-contained payload)`
**Date/time (UTC):** 2026-06-03T17:29:37.1512846Z

## Virtualization diagnosis
- HypervisorPresent: True
- VirtualizationFirmwareEnabled: False
- INTERPRETATION: false-negative. VT-x is genuinely available because `Win32_ComputerSystem.HypervisorPresent` is `True`.
- Corrected host facts JSON used: `C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\installer\baremetal\windows\logs\host-facts-hypervisor-present.json`

## WSL / Docker / Ollama / Python state
- `wsl --status`: exit code 0; output: `Default Distribution: docker-desktop`; `Default Version: 2`.
- Docker Desktop: running.
- Python: `C:\Program Files\Python312\python.exe --version` reports `Python 3.12.7`.
- Bundled module source check: `modules\civicrecords-ai` is now present on this branch, and Stage3 progressed past the previous missing-source blocker.

## Per-stage results
- Stage0 (inspect): passed using corrected `-HostFactsJson`.
- Stage1 (WSL2 enablement): passed with `restart_needed=false`.
- Stage2 (Docker + Ollama + Python): passed, using existing Python at `C:\Program Files\Python312\python.exe`.
- Stage3 (city-core stack): failed by stall/hang after the records Ollama service came up and both required models were available. The only running project container was `civicsuite-stage3a-baremetal-records-ollama-1`, healthy, from `ollama/ollama:latest`; no API, frontend, worker, postgres, redis, civicclerk, civiccode, or suite-launcher containers were started.
- Stage3 detail: Docker logs showed `nomic-embed-text:latest` and `gemma4:e4b` pulled successfully. After that, the installer kept issuing periodic `HEAD /` and `GET /api/tags` requests every ~10 seconds, `ollama ps` showed no loaded model, the lifecycle JSON was not rewritten, and the bootstrap result JSON remained the initial non-elevated `status=elevation_requested` handoff.
- Stage4 (verify): not reached.

## THE CRITICAL CHECK
- generation_source: null
- generation_model: null
- VERDICT: FAIL - no live AI letter proof was generated because Stage3 stalled after the records Ollama model setup/polling phase and never reached lifecycle proof generation.

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

Important caveat: the lifecycle JSON above was stale from result 006 (`finished_at=2026-06-03T16:01:19.157424+00:00`) and still contained the old missing-source failure. The current run never rewrote it after starting at `2026-06-03T17:05:12Z`.

Key log excerpts:
- `2026-06-03T17:05:13.4915630Z [stage0] Stage0 target inspection finished with status passed`
- `2026-06-03T17:05:40.4170681Z [stage1] Stage1 WSL2 feature enablement finished; restart_needed=False`
- `2026-06-03T17:05:42.6490297Z [stage2] Using existing Python at C:\Program Files\Python312\python.exe`
- `2026-06-03T17:05:42.6550496Z [stage2] Stage2 prerequisite orchestration finished`
- Docker model evidence: `nomic-embed-text:latest` present, `gemma4:e4b` present with id `c6eb396dbd59`, size `9.6 GB`.
- Docker service evidence: `civicsuite-stage3a-baremetal-records-ollama-1   Up ... (healthy)   ollama/ollama:latest   11434/tcp`
- Docker log pattern after model availability: repeated `HEAD "/"` and `GET "/api/tags"` returning 200, with no later `/api/generate` proof activity observed.

## Honest notes
This run got further than result 006. The bundled `civicrecords-ai` source fix is validated, and the 9.6 GB `gemma4:e4b` model pull completed successfully inside the records Ollama container. The next blocker is Stage3 control flow after the records Ollama/model phase: the elevated bootstrap wrapper and Python child stayed alive without updating the lifecycle JSON or starting the rest of the stack. I stopped the stuck elevated wrapper and its child processes after evidence capture. No source files were edited.
