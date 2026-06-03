# Tester Result 010 - 12 containers healthy; AI letter proof missing
**Tester machine:** Microsoft Windows 11 Pro 10.0.26200 build 26200; 16,629,244 KB visible RAM; Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz, 6 cores / 12 logical processors.
**Branch head tested:** `9372d3a fix(installer): make host-Ollama compose override replace depends_on (drop container ollama)`
**Date/time (UTC):** 2026-06-03T19:16:34.9367822Z

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
- Stage3 (city-core stack): progressed past the result-009 compose dependency blocker and brought up the full selected stack. Docker reported 12 containers running/healthy across `civicrecords-ai`, `civicclerk`, and `civiccode`.
- Stage3 status caveat: the bootstrap result still recorded Stage3 as `failed` with `exit_code=1`, because the lifecycle runner returned failure at the proof/verify boundary.
- Stage4 (verify): failed. Bootstrap failure message: `Stage4 lifecycle evidence does not contain the CivicRecords draft_response_letter proof.`

## THE CRITICAL CHECK
- generation_source: null
- generation_model: null
- VERDICT: FAIL - the live stack is healthy, but the lifecycle evidence contains no CivicRecords `draft_response_letter` proof and no `generation_source` / `generation_model` fields.

## Suite launcher
- During installer verify, lifecycle evidence reports `suite_launcher_http` passed at `http://127.0.0.1:18082/`.
- After bootstrap exit, direct check of `http://localhost:18082/` could not connect.
- Current module health checks:
  - civicrecords API `http://127.0.0.1:18163/health`: 200, `{"status":"ok","version":"1.7.3"}`
  - civicrecords web `http://127.0.0.1:18243/`: 200
  - civicclerk API `http://127.0.0.1:18939/health`: 200, `{"status":"ok","service":"civicclerk","version":"1.0.3","civiccore":"1.2.0"}`
  - civicclerk web `http://127.0.0.1:18244/`: healthy in lifecycle evidence
  - civiccode API `http://127.0.0.1:18983/health`: 200, `{"status":"ok","service":"civiccode","version":"1.0.8","civiccore":"1.2.0"}`

## Evidence paths
Bootstrap log:
`C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\installer\baremetal\windows\logs\civicsuite-baremetal-bootstrap.log`

Bootstrap result JSON:
`C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\installer\baremetal\windows\logs\civicsuite-baremetal-bootstrap-result.json`

Lifecycle evidence JSON:
`C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\installer\reports\stage3a-baremetal\clerk-core-installer-lifecycle.json`

Key log excerpts:
- `2026-06-03T19:09:28.1460496Z [stage0] Stage0 target inspection finished with status passed`
- `2026-06-03T19:09:58.0809437Z [stage1] Stage1 WSL2 feature enablement finished; restart_needed=False`
- `2026-06-03T19:10:00.3268115Z [stage2] Using existing Python at C:\Program Files\Python312\python.exe`
- `2026-06-03T19:10:00.3322585Z [stage2] Stage2 prerequisite orchestration finished`
- `2026-06-03T19:15:38.9392613Z [stage3] Stage3 warm-first installer handoff status failed`
- `2026-06-03T19:15:48.3957382Z [failure] Stage4 lifecycle evidence does not contain the CivicRecords draft_response_letter proof.`

Runtime container evidence:
- `civicsuite-stage3a-baremetal-records-api-1`: healthy, `0.0.0.0:18163->8000/tcp`
- `civicsuite-stage3a-baremetal-records-frontend-1`: healthy, `0.0.0.0:18243->80/tcp`
- `civicsuite-stage3a-baremetal-clerk-api-1`: healthy, `0.0.0.0:18939->8776/tcp`
- `civicsuite-stage3a-baremetal-clerk-frontend-1`: healthy, `0.0.0.0:18244->80/tcp`
- `civicsuite-stage3a-baremetal-code-api-1`: healthy, `127.0.0.1:18983->8000/tcp`
- backing postgres/redis/ollama containers for records and clerk were also healthy/running.

## Honest notes
This run got further than result 009. The host-Ollama compose dependency fix worked: compose accepted the project, built the services, and all selected module health checks passed. The remaining release-gate failure is proof generation: the lifecycle evidence verifies health and workflows but does not include the required CivicRecords `draft_response_letter` proof or real `generation_source=ollama` / `generation_model=gemma4:e4b` fields. No source files were edited.
