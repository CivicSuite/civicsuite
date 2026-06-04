# Tester Result 015 - full gate re-run after records admin auth fix
**Tester machine:** Microsoft Windows 11 Pro 10.0.26200 build 26200; 16,629,244 KB visible RAM; Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz, 6 cores / 12 logical processors.
**Branch head tested:** `0756d9f test(comms): directive 015 - re-run the gate now that admin_login 400 is fixed`
**Fix commit included:** `af8dcf8 fix(installer): make records workflow-proof admin auth re-entrant (live-gate blocker)`
**Date/time (UTC):** 2026-06-04T03:41:25.7430641Z

## Procedure
Pulled and hard-reset to `origin/stage-3a-baremetal-windows`.

Ran the required clean-stack teardown first:
```text
=== CivicSuite stack teardown ===
removed containers: 11
removed volumes: 9
removed networks: 4
=== teardown complete - stack state cleared; prerequisites preserved ===
```

Confirmed the host is Hyper-V present and used the corrected host facts JSON for the known firmware false-negative:
```text
HypervisorPresent=True
VirtualizationFirmwareEnabled=False
corrected virtualization_firmware_enabled=true
```

Ran the bare-metal bootstrapper end to end with:
```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File installer\baremetal\windows\civicsuite-baremetal-bootstrap.ps1 -Stage Stage0To4 -HostFactsJson installer\baremetal\windows\logs\host-facts-hypervisor-present.json
```

## Bootstrap result
`installer/baremetal/windows/logs/civicsuite-baremetal-bootstrap-result.json` summary:
```json
{
  "status": "failed",
  "stage3_status": "failed",
  "stage4_status": "failed",
  "stage4_evidence_status": "passed",
  "generation_source": "ollama",
  "generation_model": "gemma4:e4b",
  "expected_generation_source": "ollama",
  "expected_generation_model": "gemma4:e4b"
}
```

Stage summary:
```text
stage0: passed
stage1: passed
stage2: passed
stage3: failed, exit_code=1
stage4: failed, verify.exit_code=1
stage4 evidence_assertion: passed, generation_source=ollama, generation_model=gemma4:e4b
```

The overall bootstrapper still reported `failed` because other starter runtime workflows failed outside the records response-letter gate (`civicclerk_bearer_workflow`/`clerk_to_code_handoff` 401s). The records workflow and the Stage4 evidence assertion both passed.

Docker stack after the run:
```text
civicsuite-stage3a-baremetal-code-api-1           healthy
civicsuite-stage3a-baremetal-code-postgres-1      healthy
civicsuite-stage3a-baremetal-clerk-frontend-1     healthy
civicsuite-stage3a-baremetal-clerk-api-1          healthy
civicsuite-stage3a-baremetal-clerk-redis-1        healthy
civicsuite-stage3a-baremetal-clerk-postgres-1     healthy
civicsuite-stage3a-baremetal-clerk-ollama-1       healthy
civicsuite-stage3a-baremetal-records-frontend-1   healthy
civicsuite-stage3a-baremetal-records-api-1        healthy
civicsuite-stage3a-baremetal-records-postgres-1   healthy
civicsuite-stage3a-baremetal-records-redis-1      healthy
```

## civicrecords_workflow
From `installer/reports/stage3a-baremetal/clerk-core-installer-lifecycle.json`:
```json
{
  "checks": [
    {
      "has_access_token": true,
      "name": "admin_login",
      "status_code": 200
    },
    {
      "must_change_password": false,
      "name": "first_admin_rotation_required",
      "status_code": 200
    },
    {
      "name": "create_records_request",
      "request_id_present": true,
      "status": "received",
      "status_code": 201
    },
    {
      "id_matches": true,
      "name": "fetch_records_request",
      "status_code": 200
    },
    {
      "departments_present": true,
      "file_types_present": true,
      "name": "search_records",
      "source_names_present": true,
      "status_code": 200
    },
    {
      "name": "mark_request_searching",
      "status": "searching",
      "status_code": 200
    },
    {
      "name": "submit_request_review",
      "status": "in_review",
      "status_code": 200
    },
    {
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
    },
    {
      "name": "mark_ready_for_release",
      "status": "ready_for_release",
      "status_code": 200
    }
  ],
  "name": "civicrecords_workflow",
  "status": "passed"
}
```

## Gate verdict
PASS for the Directive 015 response-letter gate: `draft_response_letter` generated with `generation_source=ollama` and `generation_model=gemma4:e4b`.
