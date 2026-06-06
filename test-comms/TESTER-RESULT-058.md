# TESTER RESULT 058 - CivicContracts standalone and suite integration gate

## Verdict

PASSED.

## Branch and manifest evidence

- Branch tested: `stage-3a-baremetal-windows`
- Head tested: `f4ec1214ba4688df64eda96c0327ee5e260b5e4e`
- Required minimum head: `24f91043bcf35fdac3a06920c95397ad12f901f4`
- Required minimum is ancestor of tested head: yes
- Prior result read: `test-comms/TESTER-RESULT-057.md` (249 lines)
- `installer/modules.json` SHA-256: `8F8CD1CA32DFB24F1C02C82AFF5DCC4A05E18482AFA7BF11194D7AAF50E02A32`
- CivicContracts manifest source commit: `65b711571cdabd61974aa741f40d0e6e9f9c6567`
- Source/generated/module manifest edits during test: none committed; only this result file is pushed.

## Host and clean-stack evidence

- Clean-stack teardown before readiness: exit 0 (`directive058-teardown.out`)
- Host facts captured: `directive058-hostfacts-before-readiness.json`
- OS: Microsoft Windows 11 Pro `10.0.26200`, build `26200`
- CPU: Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz
- Hypervisor present: true
- Virtualization firmware enabled: false
- Total physical memory: `17028345856` bytes
- Free physical memory before readiness: `7668808` KB
- Docker: `Docker version 29.5.2, build 79eb04c`
- Docker MemTotal: `8249237504`
- Docker containers after teardown: none
- Docker volumes after teardown: none
- Docker networks after teardown: `bridge`, `host`, `none`
- Ollama: `ollama version is 0.30.5`
- `ollama ps` before readiness: empty
- Ports checked before readiness: no listeners on `11435`, `18082`, or `23864`
- Stale process state before readiness included older `llama-server`, `ollama`, and `ollama app` processes; no target listeners were present.

## Plan evidence

- Plan command: `python scripts\plan-installer.py --profile proven-suite --menu-style guided --dry-run`
- Plan output: `directive058-plan.out`
- Plan exit: 0
- Plan was non-mutating: yes
- Selected eleven-module suite:
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
  - `civiccontracts`
- Planned launcher URL: `http://127.0.0.1:18082/`

## Readiness evidence

- Readiness command used run isolation:
  - run id: `stage3a-proven-suite-clean-machine-r34`
  - install root: `installer\runtime\proven-suite-clean-machine-r34`
  - compose suffix: `stage3a-proven-suite-clean-machine-r34`
  - port offset: `5000`
  - host Ollama port: `11435`
- Readiness lifecycle path: `directive058-readiness-lifecycle.json`
- Readiness output path: `directive058-readiness.out`
- Readiness status: passed
- Readiness started: `2026-06-06T21:41:07.654748+00:00`
- Readiness finished: `2026-06-06T21:42:07.501557+00:00`
- Isolated host Ollama server PID: `20916`
- Host Ollama tags probe initially timed out, then passed and listed `gemma4:e4b` plus `nomic-embed-text:latest`.

## Install evidence

- Install lifecycle path: `directive058-install-lifecycle.json`
- Install output path: `directive058-install.out`
- Install extract path: `directive058-install-extract.json`
- Install status: passed
- Install started: `2026-06-06T21:42:37.302497+00:00`
- Install finished: `2026-06-06T21:58:16.307480+00:00`
- Install provenance path: `installer\runtime\proven-suite-clean-machine-r34\civicsuite-install-provenance.json`
- Provenance module source commits:
  - `civicaccess=9576dd579575fe6555f92590912c7686e3521b9f`
  - `civicclerk=af8b989a8d64ba709d1b204ec231364484619f7b`
  - `civiccode=a960bba0a2249d118b593dd61bee3a65a69a9d77`
  - `civiccontracts=65b711571cdabd61974aa741f40d0e6e9f9c6567`
  - `civicgrants=fcfbe34c7b921dad44d5329397e058614c7d9ed4`
  - `civicinspect=7f578fdc7b32f26b67c732e2d802600369226e9d`
  - `civicpermit=877a13642d82afaca276f7b7107e7ec6ddbab7d1`
  - `civicplan=ceae24c4ab187d0c8f4f81088c5f741c1b59e0ab`
  - `civicprocure=1a6f44a09d85fdd7e8153455b16c5ec4baa63311`
  - `civicrecords-ai=cddc4d2be856badfbc7c6bdd26917a34ef535677`
  - `civiczone=8ffa001b22138a526684153448100fadd7de5fd7`

## CivicContracts service start evidence

Lifecycle entry `python_service_start` for `civiccontracts`:

```json
{
  "step": "python_service_start",
  "module": "civiccontracts",
  "status": "passed",
  "port": 23864,
  "pid": 10980,
  "log": "C:\\Users\\insty\\Documents\\Codex\\2026-06-02\\you-re-the-civicsuite-tester-on\\civicsuite\\installer\\runtime\\proven-suite-clean-machine-r34\\python-services\\civiccontracts\\service.log",
  "pre_stop": {
    "step": "python_service_stop",
    "module": "civiccontracts",
    "status": "skipped_no_pid"
  },
  "pre_port_stop": {
    "step": "localhost_port_listener_stop",
    "port": 23864,
    "status": "no_listener"
  },
  "health": {
    "status": "passed",
    "attempts": [
      {
        "returncode": 7,
        "stderr": "curl: (7) Failed to connect to 127.0.0.1 port 23864 after 2030 ms: Could not connect to server\n",
        "stdout": ""
      },
      {
        "returncode": 0,
        "stderr": "",
        "stdout": "{\"status\":\"ok\",\"service\":\"civiccontracts\",\"version\":\"0.1.1\",\"civiccore_version\":\"1.2.0\"}"
      }
    ]
  }
}
```

The spawned process did not exit during startup; the health probe recovered from the initial connection-refused attempt and passed.

## CivicContracts integration contract evidence

- Install lifecycle named gate: `civiccontracts_integration_contracts`
- Install lifecycle named gate status: passed
- Readiness status code: 200
- Contract status code: 200
- Readiness JSON in the named gate:
  - `status=ready`
  - `ready=true`
  - `registry_database_configured=true`
  - `using_default_local_database=true`
  - `schema_ready=true`
  - `schema_version=civiccontracts-local-first-v1`
  - `expected_schema_version=civiccontracts-local-first-v1`
  - `blockers=[]`
- Required contracts present:
  - `civiccontracts.contract_draft.v1`
  - `civiccontracts.staff_review_queue.v1`
  - `civiccontracts.procurement_handoff.v1`
  - `civiccontracts.records_export.v1`
- Verify lifecycle path: `directive058-verify-lifecycle.json`
- Verify output path: `directive058-verify.out`
- Verify status: passed
- Verify started: `2026-06-06T22:09:35.407223+00:00`
- Verify finished: `2026-06-06T22:09:36.407922+00:00`
- Verify warnings: none observed
- Note: the first verify wrapper timed out before writing output, so verify was rerun by itself. The completed verify lifecycle passed overall but did not re-emit a separate named `civiccontracts_integration_contracts` entry; the named integration-contract gate passed in the install lifecycle and the same contracts were independently checked live below.

## Independent live CivicContracts evidence

- CivicContracts API/UI port: `23864`
- Launcher URL: `http://127.0.0.1:18082/`
- Launcher config path: `installer\runtime\proven-suite-clean-machine-r34\suite-launcher\civicsuite-launcher-config.js`
- Launcher CivicContracts entry:
  - id: `contracts`
  - name: `CivicContracts`
  - href: `http://127.0.0.1:23864/civiccontracts`
  - port: `23864`

Independent checks:

- `GET /civiccontracts`: HTTP 200, title/content marker `CivicContracts Contract Repository`
- `GET /civiccontracts/staff`: HTTP 200, title/content marker `CivicContracts Staff Review`
- `GET /api/v1/civiccontracts/readiness`: HTTP 200
  - `ready=true`
  - `schema_ready=true`
  - `using_default_local_database=true`
- `GET /api/v1/civiccontracts/integration-contracts`: HTTP 200 and included all four required contracts.
- `POST /api/v1/civiccontracts/drafts/from-procurement`: HTTP 200
  - created `draft_id=contract-draft-739c5db85ce3`
  - created `staff_review_id=contract-review-21a5674a25dd`
- `GET /api/v1/civiccontracts/drafts/contract-draft-739c5db85ce3`: HTTP 200
  - retrieved `contract_id=CON-DIR-058`
  - retrieved `contract_type=professional_services_agreement`
- Staff-keyed `GET /api/v1/civiccontracts/staff/reviews`: HTTP 200
  - queue included `review_id=contract-review-21a5674a25dd`
  - queue included `draft_id=contract-draft-739c5db85ce3`
  - queue included `contract_id=CON-DIR-058`
- `POST /api/v1/civiccontracts/registry`: HTTP 200
  - created `contract_id=CON-DIR-058`
- `GET /api/v1/civiccontracts/registry/CON-DIR-058`: HTTP 200
  - retrieved vendor `Example Engineering LLC`
  - retrieved `contract_type=professional_services_agreement`
- `POST /api/v1/civiccontracts/renewals/summary`: HTTP 200
  - returned `renewal_status=needs-staff-review`
  - returned `staff_review_required=true`
- `POST /api/v1/civiccontracts/export`: HTTP 200
  - returned title `Directive 058 contract records export`
  - returned records export checklist
  - returned retention note `Keep contract records according to municipal retention schedule and contract terms.`

Live workflow evidence files:

- Initial broad UI/API check: `directive058-live-civiccontracts-workflow.json`
- Corrected create/get/staff/registry/renewal/export workflow: `directive058-live-civiccontracts-corrected-workflow.json`

## Eleven-module live route checks

All eleven selected module route checks returned HTTP 200:

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
- `civiccontracts`: `http://127.0.0.1:23864/civiccontracts`

## Cleanup evidence

- Post-pass teardown output: `directive058-post-pass-teardown.out`
- Post-pass cleanup evidence: `directive058-post-pass-cleanup.json`
- Post-pass teardown exit: 0
- Docker teardown removed 10 containers, 8 volumes, and 4 networks.
- Stopped isolated listeners:
  - `20916` (`ollama`) on port `11435`
  - `13436` (`python`) on port `18082`
  - `9392` (`python`) on port `23830`
  - `24244` (`python`) on port `23840`
  - `3172` (`python`) on port `23850`
  - `13504` (`python`) on port `23860`
  - `6276` (`python`) on port `23861`
  - `15056` (`python`) on port `23862`
  - `11672` (`python`) on port `23863`
  - `9992` (`python`) on port `23864`
- Remaining target listeners after cleanup: none
- Docker containers after cleanup: none
- Docker volumes after cleanup: none

## Final verdict

The CivicContracts standalone and suite integration gate passed. Readiness, install, and verify passed; isolated host-Ollama remained green through the proven-suite flow; launcher was available; all eleven module routes returned HTTP 200; CivicContracts public and staff pages returned HTTP 200; readiness reported ready/schema-ready with local persistence; all four CivicContracts integration contracts were present; and the procurement handoff draft, staff queue, registry, renewal summary, and records export workflows succeeded.
