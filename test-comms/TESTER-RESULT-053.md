# TESTER RESULT 053 - CivicAccess gate retry after transient pip retry fix

## Verdict

FAILED during install.

The transient pip retry fix appears effective for this run: every selected Python service `python_service_install_editable` step completed successfully on attempt 1, including the prior failing `civicplan` editable install. No selected module hit a transient network failure and no retry was required.

The gate failed later at installer step `civicaccess_integration_contracts`. CivicAccess started its public UI, but the integration contract check failed because readiness reported `ready=false`, `schema_ready=false`, and `/api/v1/civicaccess/integration-contracts` returned HTTP 404.

## Branch truth

- Repo: `CivicSuite/civicsuite`
- Branch tested: `stage-3a-baremetal-windows`
- Branch head tested: `d611a0bb1232c49a0d24665e53050ff8f4bc2034`
- Required minimum head: `e2b7bb721d0fb0aae3fc5c20cf2460d685f6f8cb`
- Minimum head ancestry: passed
- Prior result read: `test-comms/TESTER-RESULT-052.md`
- Prior result line count: 322
- `installer/modules.json` SHA256: `19A6D390BA6698EF622E53B396E0013D1647D537B7FA33A90122058431D9DC54`
- `civicaccess.source_commit`: `9576dd579575fe6555f92590912c7686e3521b9f`
- Source/generated/module manifest edits: none
- Wide branch scan evidence: `directive053-wide-scan.json`

## Clean-stack teardown and host facts

- Standard teardown command: `installer\baremetal\windows\civicsuite-stack-teardown.ps1`
- Teardown exit code: 0
- Teardown evidence: `directive053-teardown.out`, `directive053-teardown-and-stale-cleanup.json`
- Host facts evidence: `directive053-hostfacts-before-readiness.json`
- Host OS: Windows 11 Pro `10.0.26200`, build `26200`
- CPU: Intel Core i7-9750H
- Hypervisor present: true
- Virtualization firmware enabled: false
- Total physical memory: 17028345856 bytes
- Free physical memory before readiness: 7954684 KB
- Docker version: `Docker version 29.5.2, build 79eb04c`
- Docker MemTotal: 8249237504 bytes
- Docker containers after teardown: none
- Docker volumes after teardown: none
- Docker networks: `bridge`, `host`, `none`
- Ollama version: `0.30.5`
- `ollama ps` before readiness: empty
- Port 11435 before readiness: no listener
- Port 18082 before readiness: no listener
- Stale llama/ollama processes observed before readiness: `llama-server.exe` PIDs 9592, 13896, 24320, 7304; `ollama app.exe` PID 2484; `ollama.exe` PID 6600

## Non-mutating plan

- Command: `python scripts\plan-installer.py --profile proven-suite --menu-style guided --dry-run`
- Exit code: 0
- Evidence: `directive053-plan.out`
- `dry_run`: true
- `mutates_host`: false
- Selected modules: `civiccore`, `civicrecords-ai`, `civicclerk`, `civiccode`, `civiczone`, `civicplan`, `civicpermit`, `civicaccess`, `civicinspect`, `civicgrants`, `civicprocure`
- Launcher URL planned: `http://127.0.0.1:18082/`
- CivicAccess planned URL before offset: `http://127.0.0.1:18860/civicaccess`

## Readiness

- Command run ID: `stage3a-proven-suite-clean-machine-r29`
- Install root: `installer\runtime\proven-suite-clean-machine-r29`
- Compose project suffix: `stage3a-proven-suite-clean-machine-r29`
- Port offset: 5000
- Host Ollama port: 11435
- Evidence: `directive053-readiness.out`
- Lifecycle path: `installer\reports\stage3a-proven-suite-clean-machine-r29\clerk-core-installer-lifecycle.json`
- Status: passed
- Started: `2026-06-06T17:49:14.247731+00:00`
- Finished: `2026-06-06T17:50:22.127634+00:00`
- Ollama server PID: 9160
- `host_ollama_model_load` selected profile: `cpu_mmap_default`
- `host_ollama_model_load` status: passed
- `native_default` attempt: failed with CUDA host memory allocation failure, including `failed to allocate buffer of size 5831117920` and `unable to allocate CUDA_Host buffer`
- `cpu_mmap_default` attempt: succeeded with `num_gpu: 0`, `use_mlock: false`, `use_mmap: true`
- Model release after probe: return code 0, `done_reason=unload`
- No `0xc0000409` crash was visible in the readiness tail.

Readiness port map:

| Module | API/Web port |
| --- | --- |
| civicrecords-ai | api 23000, web 23080 |
| civicclerk | api 23776, web 23081 |
| civiccode | 23820 |
| civiczone | 23830 |
| civicplan | 23840 |
| civicpermit | 23850 |
| civicaccess | 23860 |
| civicinspect | 23861 |
| civicgrants | 23862 |
| civicprocure | 23863 |
| suite-launcher | 18082 |

Post-readiness evidence: `directive053-after-readiness.json`.

## Install

- Command run ID: `stage3a-proven-suite-clean-machine-r29`
- Evidence: `directive053-install.out`
- Lifecycle path: `installer\reports\stage3a-proven-suite-clean-machine-r29\clerk-core-installer-lifecycle.json`
- Extracted summary: `directive053-extracted-summary.json`
- Status: failed
- Installer process exit code: 1
- Started: `2026-06-06T17:50:50.664845+00:00`
- Finished: `2026-06-06T18:04:40.165706+00:00`
- Failed step: `civicaccess_integration_contracts`
- Failed step return code: not applicable; this is an installer HTTP contract-check step, not a subprocess command step
- Failed step stderr: not applicable; failure details were recorded in lifecycle JSON

Failed step details:

```json
{
  "name": "civicaccess_integration_contracts",
  "status": "failed",
  "readiness_status_code": 200,
  "readiness": {
    "status": "not-ready",
    "ready": false,
    "review_database_configured": false,
    "schema_ready": false,
    "schema_version": null,
    "expected_schema_version": null,
    "review_count": 0,
    "blockers": [
      "Set CIVICACCESS_REVIEW_DB_URL to a local review-record database."
    ]
  },
  "contracts_status_code": 404,
  "contracts": {
    "detail": "Not Found"
  },
  "fix_steps": [
    "Confirm CivicAccess is pinned to the standalone-persistence source commit.",
    "Confirm /api/v1/civicaccess/readiness reports ready=true and schema_ready=true.",
    "Confirm /api/v1/civicaccess/integration-contracts includes records_export and publication_accessibility_review contracts."
  ]
}
```

## Required install retry evidence

Full raw stdout for each attempt is in `directive053-extracted-summary.json` and the lifecycle JSON. Each attempts array below preserves attempt number, return code, stderr, transient classification, and success marker.

```json
[
  {
    "module": "civiczone",
    "step": "python_service_install_editable",
    "returncode": 0,
    "attempts": [
      {
        "attempt": 1,
        "returncode": 0,
        "stderr": "",
        "transient_failure": false,
        "stdout_marker": "Successfully installed civiccore-1.2.0 civiczone-0.2.2"
      }
    ]
  },
  {
    "module": "civicplan",
    "step": "python_service_install_editable",
    "returncode": 0,
    "attempts": [
      {
        "attempt": 1,
        "returncode": 0,
        "stderr": "",
        "transient_failure": false,
        "stdout_marker": "Successfully installed civiccore-1.2.0 civicplan-0.2.2"
      }
    ]
  },
  {
    "module": "civicpermit",
    "step": "python_service_install_editable",
    "returncode": 0,
    "attempts": [
      {
        "attempt": 1,
        "returncode": 0,
        "stderr": "",
        "transient_failure": false,
        "stdout_marker": "Successfully installed civiccore-1.2.0 civicpermit-0.2.2"
      }
    ]
  },
  {
    "module": "civicaccess",
    "step": "python_service_install_editable",
    "returncode": 0,
    "attempts": [
      {
        "attempt": 1,
        "returncode": 0,
        "stderr": "",
        "transient_failure": false,
        "stdout_marker": "Successfully installed civicaccess-0.2.0 civiccore-1.2.0"
      }
    ]
  },
  {
    "module": "civicinspect",
    "step": "python_service_install_editable",
    "returncode": 0,
    "attempts": [
      {
        "attempt": 1,
        "returncode": 0,
        "stderr": "",
        "transient_failure": false,
        "stdout_marker": "Successfully installed civiccore-1.2.0 civicinspect-0.2.2"
      }
    ]
  },
  {
    "module": "civicgrants",
    "step": "python_service_install_editable",
    "returncode": 0,
    "attempts": [
      {
        "attempt": 1,
        "returncode": 0,
        "stderr": "",
        "transient_failure": false,
        "stdout_marker": "Successfully installed civiccore-1.2.0 civicgrants-0.2.0"
      }
    ]
  },
  {
    "module": "civicprocure",
    "step": "python_service_install_editable",
    "returncode": 0,
    "attempts": [
      {
        "attempt": 1,
        "returncode": 0,
        "stderr": "",
        "transient_failure": false,
        "stdout_marker": "Successfully installed civiccore-1.2.0 civicprocure-0.2.0"
      }
    ]
  }
]
```

Transient network failure summary: none observed. No module required a later retry attempt.

## CivicAccess live evidence after install failure

Install failed before verify, so the required full CivicAccess create/list/export workflow was not run and the gate is not passed. I still captured live probes while the partially installed stack was up.

- Evidence: `directive053-live-access-probes.json`
- CivicAccess API/UI port: 23860
- Launcher URL: `http://127.0.0.1:18082/`
- `GET http://127.0.0.1:23860/civicaccess`: HTTP 200, title/content marker `CivicAccess Public Accessibility Support`
- `GET http://127.0.0.1:23860/civicaccess/staff`: HTTP 404, body `{"detail":"Not Found"}`
- `GET http://127.0.0.1:23860/api/v1/civicaccess/readiness`: HTTP 200, `ready=false`, `schema_ready=false`, blocker `Set CIVICACCESS_REVIEW_DB_URL to a local review-record database.`
- `GET http://127.0.0.1:23860/api/v1/civicaccess/integration-contracts`: HTTP 404, body `{"detail":"Not Found"}`
- `GET http://127.0.0.1:18082/`: HTTP 200, title/content marker `CivicSuite Launcher`

## Verify

Verify was not run because install failed. No pass claim is made.

## Post-failure diagnostics and cleanup

- Post-install failure diagnostics: `directive053-after-install-failure.json`
- Free physical memory after install failure: 4818788 KB
- `ollama ps` after install failure: empty
- Listener after install failure: port 11435 PID 9160, port 18082 PID 18196
- Docker containers after install failure: records/clerk/code services running
- Post-failure teardown evidence: `directive053-post-failure-teardown.out`
- Post-failure cleanup evidence: `directive053-post-failure-cleanup.json`
- Post-failure teardown exit code: 0
- Stopped listeners after teardown: `ollama` PID 9160, `python` PID 18196, `python` PID 8308
- Listeners after cleanup on 11435, 18082, 23860, 23080, 23776: none
- Docker containers after cleanup: none

## Final verdict

Directive 053 failed at install step `civicaccess_integration_contracts`. The pip retry fix cleared the prior `civicplan` transient install failure path, but CivicAccess is not yet ready/schema-ready in the installed suite and does not expose the required integration contracts endpoint.
