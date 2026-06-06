# TESTER RESULT 054 - CivicAccess gate retry after stale-listener start fix

## Verdict

PASSED.

Readiness, install, verify, launcher, all ten live module route checks, and the CivicAccess public/staff/API workflow passed on branch head `b8469c8bb03b4f2e1f5122bcf38b43627431b67f`.

## Branch truth

- Repo: `CivicSuite/civicsuite`
- Branch tested: `stage-3a-baremetal-windows`
- Branch head tested: `b8469c8bb03b4f2e1f5122bcf38b43627431b67f`
- Required minimum head: `5d844e953e3f935eeda10c2957ff9312d925fe9e`
- Minimum head ancestry: passed
- Prior result read: `test-comms/TESTER-RESULT-053.md`
- Prior result line count: 284
- `installer/modules.json` SHA256: `19A6D390BA6698EF622E53B396E0013D1647D537B7FA33A90122058431D9DC54`
- `civicaccess.source_commit`: `9576dd579575fe6555f92590912c7686e3521b9f`
- Source/generated/module manifest edits: none
- Branch evidence: `directive054-branch-evidence.json`

## Host and cleanup evidence

- Standard teardown command: `installer\baremetal\windows\civicsuite-stack-teardown.ps1`
- Initial teardown exit code: 0
- Evidence: `directive054-teardown.out`, `directive054-hostfacts-before-readiness.json`
- Host OS: Windows 11 Pro `10.0.26200`, build `26200`
- CPU: Intel Core i7-9750H
- Hypervisor present: true
- Virtualization firmware enabled: false
- Total physical memory: 17028345856 bytes
- Free physical memory before readiness: 8002624 KB
- Docker version: `Docker version 29.5.2, build 79eb04c`
- Docker MemTotal: 8249237504 bytes
- Docker containers after initial teardown: none
- Docker networks: `bridge`, `host`, `none`
- Ollama version: `0.30.5`
- `ollama ps` before readiness: empty
- Ports 11435, 18082, and 23860 before readiness: no listeners
- Stale process state before readiness: stale `llama-server`, `ollama`, and old `python` service processes from earlier runtime folders were recorded; no target ports were occupied.

Post-pass cleanup:

- Teardown evidence: `directive054-post-pass-teardown.out`
- Cleanup evidence: `directive054-post-pass-cleanup.json`
- Teardown exit code: 0
- Stopped listeners after test: Ollama PID 4676, suite launcher PID 17108, CivicAccess PID 18220, and Python module listeners on ports 23830, 23840, 23850, 23861, 23862, 23863
- Listeners after cleanup on test ports: none
- Docker containers after cleanup: none

## Non-mutating plan

- Command: `python scripts\plan-installer.py --profile proven-suite --menu-style guided --dry-run`
- Exit code: 0
- Evidence: `directive054-plan.out`
- `dry_run`: true
- `mutates_host`: false
- Selected modules: `civiccore`, `civicrecords-ai`, `civicclerk`, `civiccode`, `civiczone`, `civicplan`, `civicpermit`, `civicaccess`, `civicinspect`, `civicgrants`, `civicprocure`
- Launcher URL planned: `http://127.0.0.1:18082/`
- CivicAccess planned URL before offset: `http://127.0.0.1:18860/civicaccess`

## Readiness

- Run ID: `stage3a-proven-suite-clean-machine-r30`
- Install root: `installer\runtime\proven-suite-clean-machine-r30`
- Compose suffix: `stage3a-proven-suite-clean-machine-r30`
- Port offset: 5000
- Host Ollama port: 11435
- Evidence: `directive054-readiness.out`
- Lifecycle copy: `directive054-readiness-lifecycle.json`
- Lifecycle path: `installer\reports\stage3a-proven-suite-clean-machine-r30\clerk-core-installer-lifecycle.json`
- Status: passed
- Started: `2026-06-06T18:34:23.028900+00:00`
- Finished: `2026-06-06T18:35:42.714277+00:00`
- Host Ollama server PID: 4676
- `host_ollama_model_load` selected profile: `cpu_mmap_default`
- Server startup: four `/api/tags` probe timeouts, then tags probe passed
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

Post-readiness diagnostics: `directive054-after-readiness.json`.

## Install

- Evidence: `directive054-install.out`
- Lifecycle copy: `directive054-install-lifecycle.json`
- Lifecycle path: `installer\reports\stage3a-proven-suite-clean-machine-r30\clerk-core-installer-lifecycle.json`
- Extract: `directive054-install-extract.json`
- Status: passed
- Started: `2026-06-06T18:36:14.353208+00:00`
- Finished: `2026-06-06T18:50:33.903796+00:00`
- Install provenance path: `installer\runtime\proven-suite-clean-machine-r30\civicsuite-install-provenance.json`
- Install provenance status: passed
- Source commit list included `civicaccess=9576dd579575fe6555f92590912c7686e3521b9f`

## Required stale-listener evidence

Lifecycle candidate file: `directive054-civicaccess-start-candidates.json`.

`python_service_start` for `civicaccess`:

```json
{
  "step": "python_service_start",
  "module": "civicaccess",
  "status": "passed",
  "port": 23860,
  "pid": 10156,
  "log": "C:\\Users\\insty\\Documents\\Codex\\2026-06-02\\you-re-the-civicsuite-tester-on\\civicsuite\\installer\\runtime\\proven-suite-clean-machine-r30\\python-services\\civicaccess\\service.log",
  "pre_stop": {
    "step": "python_service_stop",
    "module": "civicaccess",
    "status": "skipped_no_pid"
  },
  "pre_port_stop": {
    "step": "localhost_port_listener_stop",
    "port": 23860,
    "status": "no_listener"
  },
  "health": {
    "status": "passed",
    "attempts": [
      {
        "returncode": 7,
        "stderr": "curl: (7) Failed to connect to 127.0.0.1 port 23860 after 2029 ms: Could not connect to server",
        "stdout": ""
      },
      {
        "returncode": 0,
        "stderr": "",
        "stdout": "{\"status\":\"ok\",\"service\":\"civicaccess\",\"version\":\"0.2.0\",\"civiccore_version\":\"1.2.0\"}"
      }
    ]
  }
}
```

Stale-listener conclusion: target port 23860 had no pre-existing listener, the installer still ran the new `pre_port_stop` check, spawned CivicAccess PID 10156, and the spawned process stayed alive through startup and live workflow. There was no spawned-process exit failure, so `failure`, `process_returncode`, and `log_tail` are not applicable.

## CivicAccess integration contract evidence

Contract extract: `directive054-contract-extract.json`.

The named installer gate `civicaccess_integration_contracts` passed during install:

```json
{
  "name": "civicaccess_integration_contracts",
  "status": "passed",
  "readiness_status_code": 200,
  "readiness": {
    "status": "ready",
    "ready": true,
    "review_database_configured": true,
    "schema_ready": true,
    "schema_version": "2026-06-05-001",
    "expected_schema_version": "2026-06-05-001",
    "review_count": 0,
    "blockers": []
  },
  "contracts_status_code": 200,
  "contracts": {
    "status": "ok",
    "module": "civicaccess",
    "provides": [
      {
        "contract": "civicaccess.publication_accessibility_review.v1",
        "endpoint": "/api/v1/civicaccess/review"
      },
      {
        "contract": "civicaccess.records_export.v1",
        "endpoint": "/api/v1/civicaccess/reviews/{review_id}/records-export",
        "target_module": "civicrecords-ai"
      }
    ]
  }
}
```

## Verify

- Evidence: `directive054-verify.out`
- Lifecycle copy: `directive054-verify-lifecycle.json`
- Lifecycle path: `installer\reports\stage3a-proven-suite-clean-machine-r30\clerk-core-installer-lifecycle.json`
- Extract: `directive054-verify-extract.json`
- Status: passed
- Started: `2026-06-06T18:51:24.135733+00:00`
- Finished: `2026-06-06T18:51:24.847271+00:00`
- Warnings: none

## Independent live CivicAccess evidence

Evidence files:

- `directive054-live-civicaccess-workflow.json`
- `directive054-live-civicaccess-create-export.json`
- `directive054-live-summary.json`

CivicAccess API port and launcher:

- CivicAccess API/UI port: 23860
- Launcher URL: `http://127.0.0.1:18082/`
- Launcher config path: `installer\runtime\proven-suite-clean-machine-r30\suite-launcher\civicsuite-launcher-config.js`
- Launcher config entry for CivicAccess: `id=access`, `name=CivicAccess`, `href=http://127.0.0.1:23860/civicaccess`, `port=23860`

Independent checks:

| Check | Result |
| --- | --- |
| `GET /civicaccess` | HTTP 200, title marker `CivicAccess Public Accessibility Support` |
| `GET /civicaccess/staff` | HTTP 200, title marker `CivicAccess Staff Workspace` |
| `GET /api/v1/civicaccess/readiness` | HTTP 200, `ready=true`, `schema_ready=true`, `schema_version=2026-06-05-001` |
| `GET /api/v1/civicaccess/integration-contracts` | HTTP 200, includes both required contracts |
| `POST /api/v1/civicaccess/review` | HTTP 200, created `review_id=9280d5fa-a7aa-4293-bece-32d696e70f9a` |
| `GET /api/v1/civicaccess/reviews` | HTTP 200, saved queue includes the created review |
| `POST /api/v1/civicaccess/reviews/{review_id}/records-export` | HTTP 200, `status=records-export-ready`, `target_module=civicrecords-ai`, review id preserved, provenance fields present |
| `GET /` launcher | HTTP 200, title marker `CivicSuite Launcher` |

Live integration contracts returned:

- `civicaccess.publication_accessibility_review.v1`
- `civicaccess.records_export.v1`

Records export returned:

- `status`: `records-export-ready`
- `target_module`: `civicrecords-ai`
- preserved `review.review_id`: `9280d5fa-a7aa-4293-bece-32d696e70f9a`
- provenance fields present: `source_text_preserved=true`, `findings_preserved=true`, `disclaimer_preserved=true`, `created_at=2026-06-06T18:52:18.630406`

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

Directive 054 passed. The stale-listener start fix no longer exposed the old CivicAccess behavior seen in result 053. CivicAccess launched on the intended runtime, readiness was schema-ready with a local runtime data directory, staff UI and integration contracts were available, install/verify passed, and the live create/list/records-export workflow succeeded with `target_module=civicrecords-ai`.
