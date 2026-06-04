# Tester Result 017 - re-run after bundled CivicClerk soft-AI fix
**Tester machine:** Microsoft Windows 11 Pro 10.0.26200 build 26200; 16,629,244 KB visible RAM; Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz, 6 cores / 12 logical processors.
**Branch head tested:** `6dcba51 build(installer): bundle CivicClerk soft-AI fix; re-pin to af8b989; tester directive 017`
**Date/time (UTC):** 2026-06-04T11:04:22.5291279Z

## Step 1 - standing full-install gate
Pulled and hard-reset to `origin/stage-3a-baremetal-windows`.

Ran the required clean-stack teardown first:
```text
=== CivicSuite stack teardown ===
removed containers: 11
removed volumes: 9
removed networks: 4
=== teardown complete - stack state cleared; prerequisites preserved ===
```

Confirmed the host is Hyper-V present and used corrected host facts:
```text
HypervisorPresent=True
VirtualizationFirmwareEnabled=False
corrected virtualization_firmware_enabled=true
```

Bootstrap result summary from `installer/baremetal/windows/logs/civicsuite-baremetal-bootstrap-result.json`:
```json
{
  "status": "passed",
  "stage3_status": "passed",
  "stage4_status": "passed",
  "stage4_evidence_status": "passed",
  "generation_source": "ollama",
  "generation_model": "gemma4:e4b"
}
```

Terminal stage log lines:
```text
2026-06-04T10:52:48.1565850Z [stage0] Stage0 target inspection finished with status passed
2026-06-04T10:53:15.6584845Z [stage1] Stage1 WSL2 feature enablement finished; restart_needed=False
2026-06-04T10:53:35.2165756Z [stage2] Host Ollama rebind to 0.0.0.0: restarted=True firewall=True ready=True
2026-06-04T10:53:35.3008214Z [stage2] Stage2 prerequisite orchestration finished
2026-06-04T10:59:06.1831868Z [stage3] Stage3 warm-first installer handoff status passed
2026-06-04T10:59:59.1250142Z [stage4] Stage4 verification shell status passed
2026-06-04T10:59:59.1944964Z [result] Wrote structured result
```

`starter_set_runtime_workflows` summary from `installer/reports/stage3a-baremetal/clerk-core-installer-lifecycle.json`:
```json
{
  "status": "passed",
  "workflows": [
    {
      "name": "civicrecords_workflow",
      "status": "passed"
    },
    {
      "name": "civicclerk_bearer_workflow",
      "status": "passed"
    },
    {
      "name": "civiccode_workflow",
      "status": "passed"
    },
    {
      "name": "clerk_to_code_handoff",
      "status": "passed"
    }
  ],
  "draft_response_letter": {
    "contains_ai_disclaimer": true,
    "expected_generation_model": "gemma4:e4b",
    "expected_generation_source": "ollama",
    "generation_model": "gemma4:e4b",
    "generation_source": "ollama",
    "human_review_required": true,
    "letter_id_present": true,
    "name": "draft_response_letter",
    "status": "draft",
    "status_code": 201
  }
}
```

## Step 2 - Clerk boot-without-AI proof
In this installer's running topology, the Clerk compose project was `running(4)` and did not include `clerk-ollama` or `clerk-worker` containers. Only Clerk `frontend`, `api`, `redis`, and `postgres` were present before the targeted proof. That means Clerk API had already booted healthy with no Clerk AI container running/present in the installed project.

Raw command output:
```text
--- docker stop clerk-ollama ---
exit= 1
docker : Error response from daemon: No such container: civicsuite-stage3a-baremetal-clerk-ollama-1

--- docker restart clerk api+worker ---
civicsuite-stage3a-baremetal-clerk-api-1
exit= 1
docker : Error response from daemon: No such container: civicsuite-stage3a-baremetal-clerk-worker-1

--- docker ps clerk ---
civicsuite-stage3a-baremetal-clerk-frontend-1  Up 6 minutes (healthy)
civicsuite-stage3a-baremetal-clerk-api-1  Up 45 seconds (healthy)
civicsuite-stage3a-baremetal-clerk-redis-1  Up 7 minutes (healthy)
civicsuite-stage3a-baremetal-clerk-postgres-1  Up 7 minutes (healthy)

--- health ---
{"status":"ok","service":"civicclerk","version":"1.0.3","civiccore":"1.2.0"}OK
exit= 0
```

Additional topology confirmation:
```text
NAME                                   STATUS      CONFIG FILES
civicsuite-stage3a-baremetal-clerk     running(4)  ...\sources\civicclerk\docker-compose.yml,...\sources\civicclerk\docker-compose.civicsuite.override.yml
```

## Gate verdicts
Full install still green: PASS. Bootstrapper status passed; Stage3 and Stage4 passed; all four `starter_set_runtime_workflows` passed; records letter generated with `generation_source=ollama` and `generation_model=gemma4:e4b`.

Clerk boots with AI stopped/absent: PASS for the installed topology. There was no `civicsuite-stage3a-baremetal-clerk-ollama-1` container to stop, and no `clerk-worker` container to restart, but after restarting the Clerk API it returned `Up ... (healthy)` and `/health` returned OK with no Clerk AI container present.
