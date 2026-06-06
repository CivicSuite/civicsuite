# Tester Directive 056 - CivicGrants standalone and suite integration gate

## Goal

Run the CivicGrants standalone and suite integration gate after builder completed the local-first CivicGrants stage.

The builder work under test:

- CivicGrants module head: `fcfbe34c7b921dad44d5329397e058614c7d9ed4`
- Umbrella installer head: `4fa5006af94421523a1be600d5e0a77a5436f3cb`

Do not restart the test machine. If a clean test is needed, uninstall/teardown the CivicSuite stack only and preserve Docker Desktop, Ollama, WSL, model cache, and host prerequisites.

## Required branch truth

- Repo: `CivicSuite/civicsuite`
- Branch: `stage-3a-baremetal-windows`
- Required minimum head: `4fa5006af94421523a1be600d5e0a77a5436f3cb`
- CivicGrants source commit required by `installer/modules.json`: `fcfbe34c7b921dad44d5329397e058614c7d9ed4`
- Prior result to read: `test-comms/TESTER-RESULT-055.md`
- Expected result file: `test-comms/TESTER-RESULT-056.md`

## Required procedure

1. Fetch the explicit GitHub branch ref `refs/heads/stage-3a-baremetal-windows`.
2. Reset the TESTER worktree to the fetched branch head.
3. Confirm the checked-out commit is at or after `4fa5006af94421523a1be600d5e0a77a5436f3cb`.
4. Read `test-comms/TESTER-RESULT-055.md`.
5. Confirm `installer/modules.json` declares CivicGrants source commit `fcfbe34c7b921dad44d5329397e058614c7d9ed4`.
6. Do not edit source, generated artifacts, `installer/modules.json`, docs outside `test-comms`, or tests.
7. Run the standard clean-stack teardown from `test-comms/README.md`. Do not reboot the host.
8. Record host facts, Docker/Ollama state, `ollama ps`, ports `11435`, `18082`, `23862`, stale `python`/`uvicorn`/`llama-server`/`ollama_llama_server` state, and available physical memory before readiness.
9. Verify the non-mutating proven-suite plan for the selected ten-module suite.
10. Run repo-local readiness with isolated host-Ollama port `11435`, using the same module list and host-Ollama approach as `TESTER-DIRECTIVE-055`.
11. If readiness fails, stop and report the exact readiness blocker with memory/process diagnostics and the full `host_ollama_model_load` attempts array.
12. If readiness passes, run install with the same run isolation pattern.
13. If install fails, include the failing step and the full lifecycle entry for the failing step.
14. If install passes, run verify with the same run isolation pattern.
15. After verify, independently check CivicGrants live API and UI behavior on the installed CivicGrants port from launcher config or installer lifecycle evidence.
16. Write `test-comms/TESTER-RESULT-056.md` and push it to `stage-3a-baremetal-windows`.

## Required CivicGrants evidence

`TESTER-RESULT-056.md` must include:

- exact branch head tested,
- confirmation `TESTER-RESULT-055.md` was read,
- confirmation no source/generated/module manifest files were edited,
- host facts and clean-stack teardown result,
- proven-suite plan result and selected module list,
- readiness lifecycle path and status,
- install lifecycle path and status,
- verify lifecycle path and status,
- install provenance path,
- source commit list proving `civicgrants=fcfbe34c7b921dad44d5329397e058614c7d9ed4`,
- CivicGrants API port and launcher URL,
- launcher config entry for CivicGrants,
- `python_service_start` lifecycle entry for `civicgrants`, including:
  - `pre_stop`,
  - `pre_port_stop`,
  - spawned PID,
  - service log path,
  - confirmation the spawned process did not exit during startup,
- independent `GET /civicgrants` result: HTTP 200 and title/content marker,
- independent `GET /civicgrants/staff` result: HTTP 200 and title/content marker,
- independent `GET /api/v1/civicgrants/readiness` JSON showing `ready=true`, `schema_ready=true`, `using_default_local_database=true`, and `opportunity_count >= 1`,
- independent `GET /api/v1/civicgrants/integration-contracts` JSON showing all four contracts:
  - `civicgrants.opportunity_triage.v1`
  - `civicgrants.application_outline.v1`
  - `civicgrants.staff_review_queue.v1`
  - `civicgrants.audit_file_export.v1`
- independent `POST /api/v1/civicgrants/applications/outline` creating an outline and returning a non-empty `staff_review_id`,
- independent staff-keyed `GET /api/v1/civicgrants/staff/reviews` showing the created review in the saved queue,
- independent `POST /api/v1/civicgrants/compliance/calendar` returning a non-empty `compliance_id`,
- independent `GET /api/v1/civicgrants/compliance/{compliance_id}` retrieving the created compliance calendar,
- independent `POST /api/v1/civicgrants/export` showing an audit-file checklist and retention note,
- verify evidence showing `civicgrants_integration_contracts` passed,
- live module route checks for all ten selected modules,
- final verdict.

## Staff key note

The suite installer sets `CIVICGRANTS_STAFF_API_KEY` for the CivicGrants service environment. Use the local stage key `civicsuite-local-staff-key` for the independent staff queue request, with headers:

- `X-CivicGrants-Role: staff`
- `X-CivicGrants-Staff-Key: civicsuite-local-staff-key`

## Pass criteria

Pass only if readiness, install, and verify all pass; real host-Ollama `gemma4:e4b` remains green through the proven-suite flow; launcher remains available on `http://127.0.0.1:18082/`; all ten module route checks pass; CivicGrants public and staff pages return HTTP 200; CivicGrants readiness reports ready/schema-ready with local grant opportunity records; CivicGrants integration contracts include all four required contracts; and the create/list/compliance/export workflow succeeds.

If any phase fails, report the exact failing phase and evidence. Do not mark the CivicGrants gate passed until the full sequence is green.

## Constraints

Push only `test-comms/TESTER-RESULT-056.md`. No source edits during the test run. No merge, tag, status promotion, or `modules.json` changes. Never touch any OneDrive path.
