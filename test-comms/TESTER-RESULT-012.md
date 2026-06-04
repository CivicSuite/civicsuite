# Tester Result 012 - clean-stack rerun healthy; AI letter proof still missing
**Tester machine:** Microsoft Windows 11 Pro 10.0.26200 build 26200; 16,629,244 KB visible RAM; Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz, 6 cores / 12 logical processors.
**Branch head tested:** `a600bbe fix(installer): make stack-teardown.ps1 ASCII-only (PS 5.1 parse error on em dashes)`
**Date/time (UTC):** 2026-06-04T02:26:02.9281296Z

## Pre-run stack teardown
- Ran published teardown: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File installer\baremetal\windows\civicsuite-stack-teardown.ps1`
- Teardown output: removed containers: 12; removed volumes: 10; removed networks: 4.
- Purpose: clear stale Docker stack state while preserving WSL2/Docker/Ollama/Python prerequisites, per updated `test-comms/README.md`.

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
- Stage2 (Docker + Ollama + Python): passed. Bootstrap result includes `ollama.bind` with `ollama_host=0.0.0.0`, `firewall=true`, `restarted=true`, `ready=true`.
- Stage3 (city-core stack): reached all selected modules and left the runtime stack healthy after clean teardown. Docker reported 11 running containers: CivicRecords API/frontend/postgres/redis, CivicClerk API/frontend/postgres/redis/ollama, and CivicCode API/postgres. The records stack uses host Ollama through the host-Ollama compose override, so there is no new records Ollama container after the clean teardown.
- Stage3 status caveat: bootstrap result still recorded Stage3 as `failed` with `exit_code=1`, because the lifecycle runner returned failure at the proof/verify boundary.
- Stage4 (verify): failed. Bootstrap failure message: `Stage4 lifecycle evidence does not contain the CivicRecords draft_response_letter proof.`

## THE CRITICAL CHECK
- generation_source: null
- generation_model: null
- VERDICT: FAIL - the clean-stack install is healthy, but lifecycle evidence contains no CivicRecords `draft_response_letter` proof and no `generation_source` / `generation_model` fields.

## Suite launcher
- During installer verify, lifecycle evidence reports `suite_launcher_http` passed at `http://127.0.0.1:18082/`.
- After bootstrap exit, direct check of `http://127.0.0.1:18082/` could not connect.
- Current module health checks:
  - civicrecords API `http://127.0.0.1:18163/health`: 200, `{"status":"ok","version":"1.7.3"}`
  - civicrecords web `http://127.0.0.1:18243/`: healthy in lifecycle evidence
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
- `2026-06-04T02:16:42.2405364Z [stage0] Stage0 target inspection finished with status passed`
- `2026-06-04T02:17:12.7337167Z [stage1] Stage1 WSL2 feature enablement finished; restart_needed=False`
- `2026-06-04T02:17:29.9166068Z [stage2] Host Ollama rebind to 0.0.0.0: restarted=True firewall=True ready=True`
- `2026-06-04T02:17:30.0143734Z [stage2] Using existing Python at C:\Program Files\Python312\python.exe`
- `2026-06-04T02:17:30.0211940Z [stage2] Stage2 prerequisite orchestration finished`
- `2026-06-04T02:23:22.8764296Z [stage3] Stage3 warm-first installer handoff status failed`
- `2026-06-04T02:23:32.3662687Z [failure] Stage4 lifecycle evidence does not contain the CivicRecords draft_response_letter proof.`

Runtime container evidence:
- `civicsuite-stage3a-baremetal-records-api-1`: healthy, `0.0.0.0:18163->8000/tcp`
- `civicsuite-stage3a-baremetal-records-frontend-1`: healthy, `0.0.0.0:18243->80/tcp`
- `civicsuite-stage3a-baremetal-clerk-api-1`: healthy, `0.0.0.0:18939->8776/tcp`
- `civicsuite-stage3a-baremetal-clerk-frontend-1`: healthy, `0.0.0.0:18244->80/tcp`
- `civicsuite-stage3a-baremetal-code-api-1`: healthy, `127.0.0.1:18983->8000/tcp`
- backing postgres/redis containers for all modules were healthy/running; CivicClerk also had its module-local Ollama container healthy.

## Honest notes
This run got back to the result-010 state after the new teardown cleared the result-011 CivicClerk credential blocker. The stack is clean and healthy, host Ollama is rebound and loaded with `gemma4:e4b`, but the release gate still fails because the lifecycle verifier does not create or record the required CivicRecords draft response letter proof. No source files were edited.
