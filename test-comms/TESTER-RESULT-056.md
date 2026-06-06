# TESTER RESULT 056 - CivicGrants standalone and suite integration gate

## Verdict

PASSED.

## Branch and manifest evidence

- Branch tested: `stage-3a-baremetal-windows`
- Head tested: `0283db7bb47cd2b4d5e635022a94340c98cd85ab`
- Required minimum head: `4fa5006af94421523a1be600d5e0a77a5436f3cb`
- Required minimum is ancestor of tested head: yes
- Prior result read: `test-comms/TESTER-RESULT-055.md` (281 lines)
- `installer/modules.json` SHA-256: `A7E33341E0A915152E1D475C0FBC8D1EDE8BF8B8C3F7F696EEAF77EBEC7B39C5`
- CivicGrants manifest source commit: `fcfbe34c7b921dad44d5329397e058614c7d9ed4`
- Source/generated/module manifest edits during test: none committed; only this result file is pushed.

## Host and clean-stack evidence

- Clean-stack teardown before readiness: exit 0 (`directive056-teardown.out`)
- Host facts captured: `directive056-hostfacts-before-readiness.json`
- OS: Microsoft Windows 11 Pro `10.0.26200`, build `26200`
- CPU: Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz
- Hypervisor present: true
- Virtualization firmware enabled: false
- Total physical memory: `17028345856` bytes
- Free physical memory before readiness: `7392948` KB
- Docker: `Docker version 29.5.2, build 79eb04c`
- Docker MemTotal: `8249237504`
- Docker containers after teardown: none
- Docker volumes after teardown: none
- Docker networks after teardown: `bridge`, `host`, `none`
- Ollama: `ollama version is 0.30.5`
- `ollama ps` before readiness: empty
- Ports checked before readiness: no listeners on `11435`, `18082`, or `23862`
- Stale process state before readiness included older `llama-server`, `ollama`, and `ollama app` processes; no target listeners were present.

## Plan evidence

- Plan command: `python scripts\plan-installer.py --profile proven-suite --menu-style guided --dry-run`
- Plan output: `directive056-plan.out`
- Plan exit: 0
- Plan was non-mutating: yes
- Selected ten-module suite:
  - `civicrecords-ai`
  - `civicclerk`
  - `civiccode`
  - `civiczone`
  - `civicplan`
  - `civicpermit`
  - `civicaccess`
  - `civicinspect`
  - `civicgrants`
  - `civicprocure`
- Planned launcher URL: `http://127.0.0.1:18082/`
- Planned CivicGrants route before offset: `http://127.0.0.1:18862/civicgrants`

## Readiness evidence

- Readiness command used run isolation:
  - run id: `stage3a-proven-suite-clean-machine-r32`
  - install root: `installer\runtime\proven-suite-clean-machine-r32`
  - compose suffix: `stage3a-proven-suite-clean-machine-r32`
  - port offset: `5000`
  - host Ollama port: `11435`
- Readiness lifecycle path: `directive056-readiness-lifecycle.json`
- Readiness output path: `directive056-readiness.out`
- Readiness status: passed
- Readiness started: `2026-06-06T20:31:03.451282+00:00`
- Readiness finished: `2026-06-06T20:31:54.924694+00:00`
- Isolated host Ollama listener: PID `18264` on port `11435`
- Host Ollama model-load selected profile: `cpu_mmap_default`
- Host Ollama release/unload returned 0 with done reason `unload`
- `ollama ps` after readiness: empty
- Free physical memory after readiness: `8784016` KB

## Install evidence

- Install lifecycle path: `directive056-install-lifecycle.json`
- Install output path: `directive056-install.out`
- Install extract path: `directive056-install-extract.json`
- Install status: passed
- Install started: `2026-06-06T20:32:29.190963+00:00`
- Install finished: `2026-06-06T20:46:51.863545+00:00`
- Free physical memory after install: `3932940` KB
- Launcher listener after install: port `18082`, PID `7664`
- CivicGrants listener after install: port `23862`, PID `16180`
- Install provenance path: `installer\runtime\proven-suite-clean-machine-r32\civicsuite-install-provenance.json`
- Provenance module source commits:
  - `civicaccess=9576dd579575fe6555f92590912c7686e3521b9f`
  - `civicclerk=af8b989a8d64ba709d1b204ec231364484619f7b`
  - `civiccode=a960bba0a2249d118b593dd61bee3a65a69a9d77`
  - `civicgrants=fcfbe34c7b921dad44d5329397e058614c7d9ed4`
  - `civicinspect=7f578fdc7b32f26b67c732e2d802600369226e9d`
  - `civicpermit=877a13642d82afaca276f7b7107e7ec6ddbab7d1`
  - `civicplan=ceae24c4ab187d0c8f4f81088c5f741c1b59e0ab`
  - `civicprocure=0aa998feab3736db071920e3869462598758c23d`
  - `civicrecords-ai=cddc4d2be856badfbc7c6bdd26917a34ef535677`
  - `civiczone=8ffa001b22138a526684153448100fadd7de5fd7`

## CivicGrants service start evidence

Lifecycle entry `python_service_start` for `civicgrants`:

```json
{
  "step": "python_service_start",
  "module": "civicgrants",
  "status": "passed",
  "port": 23862,
  "pid": 19320,
  "log": "C:\\Users\\insty\\Documents\\Codex\\2026-06-02\\you-re-the-civicsuite-tester-on\\civicsuite\\installer\\runtime\\proven-suite-clean-machine-r32\\python-services\\civicgrants\\service.log",
  "pre_stop": {
    "step": "python_service_stop",
    "module": "civicgrants",
    "status": "skipped_no_pid"
  },
  "pre_port_stop": {
    "step": "localhost_port_listener_stop",
    "port": 23862,
    "status": "no_listener"
  },
  "health": {
    "status": "passed",
    "attempts": [
      {
        "returncode": 7,
        "stderr": "curl: (7) Failed to connect to 127.0.0.1 port 23862 after 2035 ms: Could not connect to server\n",
        "stdout": ""
      },
      {
        "returncode": 0,
        "stderr": "",
        "stdout": "{\"status\":\"ok\",\"service\":\"civicgrants\",\"version\":\"0.2.0\",\"civiccore_version\":\"1.2.0\"}"
      }
    ]
  }
}
```

The spawned service did not exit during startup; the health probe recovered from the initial connection-refused attempt and passed.

## CivicGrants integration contract evidence

- Install lifecycle named gate: `civicgrants_integration_contracts`
- Install lifecycle named gate status: passed
- Readiness status code: 200
- Contract status code: 200
- Readiness JSON in the named gate:
  - `status=ready`
  - `ready=true`
  - `grant_database_configured=true`
  - `using_default_local_database=true`
  - `schema_ready=true`
  - `schema_version=2026-06-05-001`
  - `expected_schema_version=2026-06-05-001`
  - `opportunity_count=2`
  - `blockers=[]`
- Required contracts present:
  - `civicgrants.opportunity_triage.v1`
  - `civicgrants.application_outline.v1`
  - `civicgrants.staff_review_queue.v1`
  - `civicgrants.audit_file_export.v1`
- Verify lifecycle path: `directive056-verify-lifecycle.json`
- Verify output path: `directive056-verify.out`
- Verify status: passed
- Verify started: `2026-06-06T20:47:39.413819+00:00`
- Verify finished: `2026-06-06T20:47:40.231767+00:00`
- Verify warnings: none observed
- Note: the verify lifecycle passed overall but did not re-emit a separate named `civicgrants_integration_contracts` entry; the named integration-contract gate passed in the install lifecycle and the same contracts were independently checked live below.

## Independent live CivicGrants evidence

- CivicGrants API/UI port: `23862`
- Launcher URL: `http://127.0.0.1:18082/`
- Launcher config path: `installer\runtime\proven-suite-clean-machine-r32\suite-launcher\civicsuite-launcher-config.js`
- Launcher CivicGrants entry:
  - id: `grants`
  - name: `CivicGrants`
  - href: `http://127.0.0.1:23862/civicgrants`
  - port: `23862`

Independent checks:

- `GET /civicgrants`: HTTP 200, title/content marker `CivicGrants Grant Support`
- `GET /civicgrants/staff`: HTTP 200, title/content marker `CivicGrants Staff Review`
- `GET /api/v1/civicgrants/readiness`: HTTP 200
  - `ready=true`
  - `schema_ready=true`
  - `using_default_local_database=true`
  - `opportunity_count=2`
- `GET /api/v1/civicgrants/integration-contracts`: HTTP 200 and included all four required contracts.
- `POST /api/v1/civicgrants/applications/outline`: HTTP 200
  - created `staff_review_id=1ad36d97-fd74-4b1c-9cc4-f200e75121fb`
- Staff-keyed `GET /api/v1/civicgrants/staff/reviews`: HTTP 200
  - queue included `review_id=1ad36d97-fd74-4b1c-9cc4-f200e75121fb`
  - grant id `DIR-056-GRANT-001`
  - status `open`
- `POST /api/v1/civicgrants/compliance/calendar`: HTTP 200
  - created `compliance_id=11e539e3-6df6-4020-89d2-d526b2602628`
- `GET /api/v1/civicgrants/compliance/11e539e3-6df6-4020-89d2-d526b2602628`: HTTP 200
  - retrieved award name `Directive 056 compliance calendar`
  - reporting frequency `quarterly`
- `POST /api/v1/civicgrants/export`: HTTP 200
  - returned grant id `DIR-056-GRANT-001`
  - returned title `Directive 056 audit file export`
  - returned audit-file checklist
  - returned retention note `Keep grant records according to municipal retention schedule and award terms.`

Live workflow evidence files:

- Initial broad UI/API check: `directive056-live-civicgrants-workflow.json`
- Corrected create/list/compliance/export workflow: `directive056-live-civicgrants-corrected-workflow.json`

## Ten-module live route checks

All ten selected module route checks returned HTTP 200:

- `civicrecords-ai`: `http://127.0.0.1:23080/`
- `civicclerk`: `http://127.0.0.1:23081/`
- `civiccode`: `http://127.0.0.1:23820/civiccode`
- `civiczone`: `http://127.0.0.1:23830/civiczone`
- `civicplan`: `http://127.0.0.1:23840/civicplan`
- `civicpermit`: `http://127.0.0.1:23850/civicpermit`
- `civicaccess`: `http://127.0.0.1:23860/civicaccess`
- `civicinspect`: `http://127.0.0.1:23861/civicinspect`
- `civicgrants`: `http://127.0.0.1:23862/civicgrants`
- `civicprocure`: `http://127.0.0.1:23863/civicprocure`

## Cleanup evidence

- Post-pass teardown output: `directive056-post-pass-teardown.out`
- Post-pass cleanup evidence: `directive056-post-pass-cleanup.json`
- Post-pass teardown exit: 0
- Stopped isolated listeners:
  - `11435` PID `18264` (`ollama`)
  - `18082` PID `7664` (`python`)
  - `23830` PID `17276` (`python`)
  - `23840` PID `3336` (`python`)
  - `23850` PID `12080` (`python`)
  - `23860` PID `19388` (`python`)
  - `23861` PID `11708` (`python`)
  - `23862` PID `16180` (`python`)
  - `23863` PID `16948` (`python`)
- Remaining target listeners after cleanup: none
- Docker containers after cleanup: none
- Docker volumes after cleanup: none

## Final verdict

The CivicGrants standalone and suite integration gate passed. Readiness, install, and verify passed; isolated host-Ollama remained green through the proven-suite flow; launcher was available; all ten module routes returned HTTP 200; CivicGrants public and staff pages returned HTTP 200; readiness reported ready/schema-ready with local grant opportunities; all four CivicGrants integration contracts were present; and the outline, staff queue, compliance calendar, compliance retrieval, and audit export workflow succeeded.
