# TESTER RESULT 055 - CivicInspect standalone and suite integration gate

## Verdict

PASSED.

Readiness, install, verify, launcher, all ten live module route checks, and the CivicInspect public/staff/API workflow passed on branch head `cfc2c5f803793247fafacc460349622a239a2350`.

## Branch truth

- Repo: `CivicSuite/civicsuite`
- Branch tested: `stage-3a-baremetal-windows`
- Branch head tested: `cfc2c5f803793247fafacc460349622a239a2350`
- Required minimum head: `0cab736ddb10d189cceecfcac49f1b31fa63586f`
- Minimum head ancestry: passed
- Prior result read: `test-comms/TESTER-RESULT-054.md`
- Prior result line count: 267
- `installer/modules.json` SHA256: `2DA0F614E5A9D7EC7AF45B60EA75AC2473AD47C09D48BA7DB7B688A07D712A40`
- `civicinspect.source_commit`: `7f578fdc7b32f26b67c732e2d802600369226e9d`
- Source/generated/module manifest edits: none
- Branch evidence: `directive055-branch-evidence.json`

## Host and cleanup evidence

- Standard teardown command: `installer\baremetal\windows\civicsuite-stack-teardown.ps1`
- Initial teardown exit code: 0
- Evidence: `directive055-teardown.out`, `directive055-hostfacts-before-readiness.json`
- Host OS: Windows 11 Pro `10.0.26200`, build `26200`
- CPU: Intel Core i7-9750H
- Hypervisor present: true
- Virtualization firmware enabled: false
- Total physical memory: 17028345856 bytes
- Free physical memory before readiness: 7809180 KB
- Docker version: `Docker version 29.5.2, build 79eb04c`
- Docker MemTotal: 8249237504 bytes
- Docker containers after initial teardown: none
- Docker networks: `bridge`, `host`, `none`
- Ollama version: `0.30.5`
- `ollama ps` before readiness: empty
- Ports 11435, 18082, and 23861 before readiness: no listeners
- Stale process state before readiness: stale `llama-server`, `ollama`, and `ollama app` processes were recorded; no target ports were occupied.

Post-pass cleanup:

- Teardown evidence: `directive055-post-pass-teardown.out`
- Cleanup evidence: `directive055-post-pass-cleanup.json`
- Teardown exit code: 0
- Stopped listeners after test: Ollama PID 10980, suite launcher PID 24456, CivicAccess PID 15416, CivicInspect PID 19548, and Python module listeners on ports 23830, 23840, 23850, 23862, 23863
- Listeners after cleanup on test ports: none
- Docker containers after cleanup: none

## Non-mutating plan

- Command: `python scripts\plan-installer.py --profile proven-suite --menu-style guided --dry-run`
- Exit code: 0
- Evidence: `directive055-plan.out`
- `dry_run`: true
- `mutates_host`: false
- Selected modules: `civiccore`, `civicrecords-ai`, `civicclerk`, `civiccode`, `civiczone`, `civicplan`, `civicpermit`, `civicaccess`, `civicinspect`, `civicgrants`, `civicprocure`
- Launcher URL planned: `http://127.0.0.1:18082/`
- CivicInspect planned URL before offset: `http://127.0.0.1:18861/civicinspect`

## Readiness

- Run ID: `stage3a-proven-suite-clean-machine-r31`
- Install root: `installer\runtime\proven-suite-clean-machine-r31`
- Compose suffix: `stage3a-proven-suite-clean-machine-r31`
- Port offset: 5000
- Host Ollama port: 11435
- Evidence: `directive055-readiness.out`
- Lifecycle copy: `directive055-readiness-lifecycle.json`
- Lifecycle path: `installer\reports\stage3a-proven-suite-clean-machine-r31\clerk-core-installer-lifecycle.json`
- Status: passed
- Started: `2026-06-06T19:38:23.189005+00:00`
- Finished: `2026-06-06T19:39:15.764632+00:00`
- Host Ollama server PID: 10980
- `host_ollama_model_load` selected profile: `cpu_mmap_default`
- Server startup: one connection-refused probe and two `/api/tags` probe timeouts, then tags probe passed
- Model load: passed, released with `done_reason=unload`
- `ollama ps` after readiness: empty

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

Post-readiness diagnostics: `directive055-after-readiness.json`.

## Install

- Evidence: `directive055-install.out`
- Lifecycle copy: `directive055-install-lifecycle.json`
- Lifecycle path: `installer\reports\stage3a-proven-suite-clean-machine-r31\clerk-core-installer-lifecycle.json`
- Extract: `directive055-install-extract.json`
- Status: passed
- Started: `2026-06-06T19:39:43.411612+00:00`
- Finished: `2026-06-06T19:53:58.391886+00:00`
- Install provenance path: `installer\runtime\proven-suite-clean-machine-r31\civicsuite-install-provenance.json`
- Install provenance status: passed
- Source commit list included `civicinspect=7f578fdc7b32f26b67c732e2d802600369226e9d`

## CivicInspect service-start evidence

`python_service_start` for `civicinspect`:

```json
{
  "step": "python_service_start",
  "module": "civicinspect",
  "status": "passed",
  "port": 23861,
  "pid": 17684,
  "log": "C:\\Users\\insty\\Documents\\Codex\\2026-06-02\\you-re-the-civicsuite-tester-on\\civicsuite\\installer\\runtime\\proven-suite-clean-machine-r31\\python-services\\civicinspect\\service.log",
  "pre_stop": {
    "step": "python_service_stop",
    "module": "civicinspect",
    "status": "skipped_no_pid"
  },
  "pre_port_stop": {
    "step": "localhost_port_listener_stop",
    "port": 23861,
    "status": "no_listener"
  },
  "health": {
    "status": "passed",
    "attempts": [
      {
        "returncode": 7,
        "stderr": "curl: (7) Failed to connect to 127.0.0.1 port 23861 after 2020 ms: Could not connect to server",
        "stdout": ""
      },
      {
        "returncode": 0,
        "stderr": "",
        "stdout": "{\"status\":\"ok\",\"service\":\"civicinspect\",\"version\":\"0.2.2\",\"civiccore_version\":\"1.2.0\"}"
      }
    ]
  }
}
```

Conclusion: port 23861 had no pre-existing listener, the installer ran `pre_port_stop`, spawned CivicInspect PID 17684, and the spawned process stayed alive through startup and live workflow. There was no spawned-process exit during startup.

## CivicInspect integration contract evidence

The named installer gate `civicinspect_integration_contracts` passed during install:

```json
{
  "name": "civicinspect_integration_contracts",
  "status": "passed",
  "readiness_status_code": 200,
  "readiness": {
    "status": "ready",
    "ready": true,
    "case_database_configured": true,
    "using_default_local_database": true,
    "schema_ready": true,
    "schema_version": "2026-06-05-001",
    "expected_schema_version": "2026-06-05-001",
    "repeat_case_count": 2,
    "blockers": []
  },
  "contracts_status_code": 200,
  "contracts": {
    "status": "ok",
    "module": "civicinspect",
    "provides": [
      {
        "contract": "civicinspect.inspection_report_draft.v1",
        "endpoint": "/api/v1/civicinspect/reports/draft"
      },
      {
        "contract": "civicinspect.staff_review_queue.v1",
        "endpoint": "/api/v1/civicinspect/staff/reviews"
      },
      {
        "contract": "civicinspect.records_export_checklist.v1",
        "endpoint": "/api/v1/civicinspect/export",
        "target_module": "civicrecords-ai"
      }
    ]
  }
}
```

The verify lifecycle passed overall but did not re-emit the named `civicinspect_integration_contracts` step. Verify evidence:

- Evidence: `directive055-verify.out`
- Lifecycle copy: `directive055-verify-lifecycle.json`
- Extract: `directive055-verify-extract.json`
- Verify status: passed
- Started: `2026-06-06T19:54:39.720391+00:00`
- Finished: `2026-06-06T19:54:40.510446+00:00`
- Warnings: none

## Independent live CivicInspect evidence

Evidence files:

- `directive055-live-civicinspect-workflow.json`
- `directive055-live-civicinspect-create-export.json`
- `directive055-live-summary.json`

CivicInspect API port and launcher:

- CivicInspect API/UI port: 23861
- Launcher URL: `http://127.0.0.1:18082/`
- Launcher config path: `installer\runtime\proven-suite-clean-machine-r31\suite-launcher\civicsuite-launcher-config.js`
- Launcher config entry for CivicInspect: `id=inspect`, `name=CivicInspect`, `href=http://127.0.0.1:23861/civicinspect`, `port=23861`

Independent checks:

| Check | Result |
| --- | --- |
| `GET /civicinspect` | HTTP 200, title marker `CivicInspect Inspection Support` |
| `GET /civicinspect/staff` | HTTP 200, title marker `CivicInspect Staff Workspace` |
| `GET /api/v1/civicinspect/readiness` | HTTP 200, `ready=true`, `schema_ready=true`, `repeat_case_count=2` |
| `GET /api/v1/civicinspect/integration-contracts` | HTTP 200, includes all three required contracts |
| `POST /api/v1/civicinspect/reports/draft` | HTTP 200, `report_id=7a4b7db3-2aac-487f-b0cb-2cc0bd7c4a77`, `staff_review_id=58575db6-c79f-417a-bbdd-797a5b98aa02` |
| Staff-keyed `GET /api/v1/civicinspect/staff/reviews` | HTTP 200, queue includes the created review |
| `POST /api/v1/civicinspect/export` | HTTP 200, records-ready checklist and retention note returned |
| `GET /` launcher | HTTP 200, title marker `CivicSuite Launcher` |

Staff queue headers used:

- `X-CivicInspect-Role: staff`
- `X-CivicInspect-Staff-Key: civicsuite-local-staff-key`

Live integration contracts returned:

- `civicinspect.inspection_report_draft.v1`
- `civicinspect.staff_review_queue.v1`
- `civicinspect.records_export_checklist.v1`

Draft workflow returned:

- `report_id`: `7a4b7db3-2aac-487f-b0cb-2cc0bd7c4a77`
- `staff_review_id`: `58575db6-c79f-417a-bbdd-797a5b98aa02`
- `inspection_id`: `DIR-055-INSPECTION-001`
- `inspector_review_required`: true

Records export returned:

- `case_id`: `DIR-055-INSPECTION-001`
- `title`: `Directive 055 inspection draft`
- `format`: `markdown`
- checklist present
- retention note present

## Live module route checks

All ten selected module route checks returned HTTP 200:

| Module | URL | Status |
| --- | --- | --- |
| civicrecords-ai | `http://127.0.0.1:23080/` | 200 |
| civicclerk | `http://127.0.0.1:23081/` | 200 |
| civiccode | `http://127.0.0.1:23820/civiccode` | 200 |
| civiczone | `http://127.0.0.1:23830/civiczone` | 200 |
| civicplan | `http://127.0.0.1:23840/civicplan` | 200 |
| civicpermit | `http://127.0.0.1:23850/civicpermit` | 200 |
| civicaccess | `http://127.0.0.1:23860/civicaccess` | 200 |
| civicinspect | `http://127.0.0.1:23861/civicinspect` | 200 |
| civicgrants | `http://127.0.0.1:23862/civicgrants` | 200 |
| civicprocure | `http://127.0.0.1:23863/civicprocure` | 200 |

## Final verdict

Directive 055 passed. CivicInspect launched on the intended local runtime, readiness was schema-ready with repeat-case records, integration contracts exposed all three required contracts, install and verify passed, public and staff UI routes returned HTTP 200, the staff-keyed queue worked, and the live create/list/export workflow succeeded.
