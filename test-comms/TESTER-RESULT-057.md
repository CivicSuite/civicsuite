# TESTER RESULT 057 - CivicProcure standalone and suite integration gate

## Verdict

PASSED.

## Branch and manifest evidence

- Branch tested: `stage-3a-baremetal-windows`
- Head tested: `91bcc7c1cee78f1d77504052f9b2a5425de01c0e`
- Required minimum head: `785a54dd38530a67ac0e09ea9c9260d04cd5bc99`
- Required minimum is ancestor of tested head: yes
- Prior result read: `test-comms/TESTER-RESULT-056.md` (251 lines)
- `installer/modules.json` SHA-256: `85D6A191F32B60C906966E45A4B110778362D6CCE1C742728E436F60E09F390D`
- CivicProcure manifest source commit: `1a6f44a09d85fdd7e8153455b16c5ec4baa63311`
- Source/generated/module manifest edits during test: none committed; only this result file is pushed.

## Host and clean-stack evidence

- Clean-stack teardown before readiness: exit 0 (`directive057-teardown.out`)
- Host facts captured: `directive057-hostfacts-before-readiness.json`
- OS: Microsoft Windows 11 Pro `10.0.26200`, build `26200`
- CPU: Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz
- Hypervisor present: true
- Virtualization firmware enabled: false
- Total physical memory: `17028345856` bytes
- Free physical memory before readiness: `7022520` KB
- Docker: `Docker version 29.5.2, build 79eb04c`
- Docker MemTotal: `8249237504`
- Docker containers after teardown: none
- Docker volumes after teardown: none
- Docker networks after teardown: `bridge`, `host`, `none`
- Ollama: `ollama version is 0.30.5`
- `ollama ps` before readiness: empty
- Ports checked before readiness: no listeners on `11435`, `18082`, or `23863`
- Stale process state before readiness included older `llama-server`, `ollama`, and `ollama app` processes; no target listeners were present.

## Plan evidence

- Plan command: `python scripts\plan-installer.py --profile proven-suite --menu-style guided --dry-run`
- Plan output: `directive057-plan.out`
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

## Readiness evidence

- Readiness command used run isolation:
  - run id: `stage3a-proven-suite-clean-machine-r33`
  - install root: `installer\runtime\proven-suite-clean-machine-r33`
  - compose suffix: `stage3a-proven-suite-clean-machine-r33`
  - port offset: `5000`
  - host Ollama port: `11435`
- Readiness lifecycle path: `directive057-readiness-lifecycle.json`
- Readiness output path: `directive057-readiness.out`
- Readiness status: passed
- Readiness started: `2026-06-06T21:07:18.623051+00:00`
- Readiness finished: `2026-06-06T21:08:11.723967+00:00`
- `ollama ps` after readiness: empty
- Free physical memory after readiness: `8510340` KB

## Install evidence

- Install lifecycle path: `directive057-install-lifecycle.json`
- Install output path: `directive057-install.out`
- Install extract path: `directive057-install-extract.json`
- Install status: passed
- Install started: `2026-06-06T21:08:43.753286+00:00`
- Install finished: `2026-06-06T21:22:54.518578+00:00`
- Launcher listener after install: port `18082`
- CivicProcure listener after install: port `23863`
- Install provenance path: `installer\runtime\proven-suite-clean-machine-r33\civicsuite-install-provenance.json`
- Provenance module source commits:
  - `civicaccess=9576dd579575fe6555f92590912c7686e3521b9f`
  - `civicclerk=af8b989a8d64ba709d1b204ec231364484619f7b`
  - `civiccode=a960bba0a2249d118b593dd61bee3a65a69a9d77`
  - `civicgrants=fcfbe34c7b921dad44d5329397e058614c7d9ed4`
  - `civicinspect=7f578fdc7b32f26b67c732e2d802600369226e9d`
  - `civicpermit=877a13642d82afaca276f7b7107e7ec6ddbab7d1`
  - `civicplan=ceae24c4ab187d0c8f4f81088c5f741c1b59e0ab`
  - `civicprocure=1a6f44a09d85fdd7e8153455b16c5ec4baa63311`
  - `civicrecords-ai=cddc4d2be856badfbc7c6bdd26917a34ef535677`
  - `civiczone=8ffa001b22138a526684153448100fadd7de5fd7`

## CivicProcure service start evidence

Lifecycle entry `python_service_start` for `civicprocure`:

```json
{
  "step": "python_service_start",
  "module": "civicprocure",
  "status": "passed",
  "port": 23863,
  "pid": 3108,
  "log": "C:\\Users\\insty\\Documents\\Codex\\2026-06-02\\you-re-the-civicsuite-tester-on\\civicsuite\\installer\\runtime\\proven-suite-clean-machine-r33\\python-services\\civicprocure\\service.log",
  "pre_stop": {
    "step": "python_service_stop",
    "module": "civicprocure",
    "status": "skipped_no_pid"
  },
  "pre_port_stop": {
    "step": "localhost_port_listener_stop",
    "port": 23863,
    "status": "no_listener"
  },
  "health": {
    "status": "passed",
    "attempts": [
      {
        "returncode": 7,
        "stderr": "curl: (7) Failed to connect to 127.0.0.1 port 23863 after 2023 ms: Could not connect to server\n",
        "stdout": ""
      },
      {
        "returncode": 0,
        "stderr": "",
        "stdout": "{\"status\":\"ok\",\"service\":\"civicprocure\",\"version\":\"0.2.0\",\"civiccore_version\":\"1.2.0\"}"
      }
    ]
  }
}
```

The spawned process did not exit during startup; the health probe recovered from the initial connection-refused attempt and passed.

## CivicProcure integration contract evidence

- Install lifecycle named gate: `civicprocure_integration_contracts`
- Install lifecycle named gate status: passed
- Readiness status code: 200
- Contract status code: 200
- Readiness JSON in the named gate:
  - `status=ready`
  - `ready=true`
  - `workpaper_database_configured=true`
  - `using_default_local_database=true`
  - `schema_ready=true`
  - `schema_version=2026-06-05-001`
  - `expected_schema_version=2026-06-05-001`
  - `blockers=[]`
- Required contracts present:
  - `civicprocure.rfp_draft.v1`
  - `civicprocure.staff_review_queue.v1`
  - `civicprocure.award_packet.v1`
  - `civicprocure.procurement_context.v1`
- Verify lifecycle path: `directive057-verify-lifecycle.json`
- Verify output path: `directive057-verify.out`
- Verify status: passed
- Verify started: `2026-06-06T21:24:13.430583+00:00`
- Verify finished: `2026-06-06T21:24:14.331217+00:00`
- Verify warnings: none observed
- Note: the verify lifecycle passed overall but did not re-emit a separate named `civicprocure_integration_contracts` entry; the named integration-contract gate passed in the install lifecycle and the same contracts were independently checked live below.

## Independent live CivicProcure evidence

- CivicProcure API/UI port: `23863`
- Launcher URL: `http://127.0.0.1:18082/`
- Launcher config path: `installer\runtime\proven-suite-clean-machine-r33\suite-launcher\civicsuite-launcher-config.js`
- Launcher CivicProcure entry:
  - id: `procure`
  - name: `CivicProcure`
  - href: `http://127.0.0.1:23863/civicprocure`
  - port: `23863`

Independent checks:

- `GET /civicprocure`: HTTP 200, title/content marker `CivicProcure Procurement Support`
- `GET /civicprocure/staff`: HTTP 200, title/content marker `CivicProcure Staff Review`
- `GET /api/v1/civicprocure/readiness`: HTTP 200
  - `ready=true`
  - `schema_ready=true`
  - `using_default_local_database=true`
- `GET /api/v1/civicprocure/integration-contracts`: HTTP 200 and included all four required contracts.
- `POST /api/v1/civicprocure/rfps/draft`: HTTP 200
  - created `draft_id=b98c99e7-a457-4401-a6d0-871226e8a553`
  - created `staff_review_id=5aca0389-e66b-49f5-b48f-2a07892dbb95`
- `GET /api/v1/civicprocure/rfps/draft/b98c99e7-a457-4401-a6d0-871226e8a553`: HTTP 200
  - retrieved procurement title `Directive 057 stormwater design services`
  - retrieved procurement type `professional_services_rfp`
- `POST /api/v1/civicprocure/award-packet`: HTTP 200
  - created `packet_id=b6e3db20-4c32-4d53-a017-cdd4c770b849`
  - created `staff_review_id=485fd419-41da-44c1-beda-89e00ddff9c9`
- `GET /api/v1/civicprocure/award-packet/b6e3db20-4c32-4d53-a017-cdd4c770b849`: HTTP 200
  - retrieved solicitation id `RFP-DIR-057`
  - retrieved title `Directive 057 award packet`
  - retrieved procurement-file checklist and retention note
- Staff-keyed `GET /api/v1/civicprocure/staff/reviews`: HTTP 200
  - queue included `review_id=5aca0389-e66b-49f5-b48f-2a07892dbb95`
  - queue included `review_id=485fd419-41da-44c1-beda-89e00ddff9c9`
- `POST /api/v1/civicprocure/context/procurement-review`: HTTP 200
  - `review_required=true`
  - citations included `Solicitation context: solicitation-context-dir-057`
  - citations included `CivicClerk context: civicclerk-agenda-dir-057`
  - citations included `CivicContracts context: civiccontracts-contract-dir-057`

Live workflow evidence files:

- Initial broad UI/API check: `directive057-live-civicprocure-workflow.json`
- Corrected create/get/staff/context workflow: `directive057-live-civicprocure-corrected-workflow.json`

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

- Post-pass teardown output: `directive057-post-pass-teardown.out`
- Post-pass cleanup evidence: `directive057-post-pass-cleanup.json`
- Post-pass teardown exit: 0
- Stopped isolated listeners:
  - `11435` PID `4052` (`ollama`)
  - `18082` PID `20300` (`python`)
  - `23830` PID `9996` (`python`)
  - `23840` PID `13124` (`python`)
  - `23850` PID `23748` (`python`)
  - `23860` PID `9720` (`python`)
  - `23861` PID `7112` (`python`)
  - `23862` PID `17276` (`python`)
  - `23863` PID `16872` (`python`)
- Remaining target listeners after cleanup: none
- Docker containers after cleanup: none
- Docker volumes after cleanup: none

## Final verdict

The CivicProcure standalone and suite integration gate passed. Readiness, install, and verify passed; isolated host-Ollama remained green through the proven-suite flow; launcher was available; all ten module routes returned HTTP 200; CivicProcure public and staff pages returned HTTP 200; readiness reported ready/schema-ready with local persistence; all four CivicProcure integration contracts were present; and the RFP draft, award packet, staff queue, and procurement context workflow succeeded.
