# Tester Directive 058 - CivicContracts standalone and suite integration gate

## Goal

Run the CivicContracts standalone and suite integration gate after builder completed the local-first CivicContracts stage and umbrella installer integration.

The builder work under test:

- CivicContracts module head: `65b711571cdabd61974aa741f40d0e6e9f9c6567`
- Umbrella installer minimum code head: `24f91043bcf35fdac3a06920c95397ad12f901f4`

Do not restart the test machine. If a clean test is needed, uninstall/teardown the CivicSuite stack only and preserve Docker Desktop, Ollama, WSL, model cache, and host prerequisites.

## Required branch truth

- Repo: `CivicSuite/civicsuite`
- Branch: `stage-3a-baremetal-windows`
- Required minimum head: `24f91043bcf35fdac3a06920c95397ad12f901f4`
- CivicContracts source commit required by `installer/modules.json`: `65b711571cdabd61974aa741f40d0e6e9f9c6567`
- Prior result to read: `test-comms/TESTER-RESULT-057.md`
- Expected result file: `test-comms/TESTER-RESULT-058.md`

## Required procedure

1. Fetch the explicit GitHub branch ref `refs/heads/stage-3a-baremetal-windows`.
2. Reset the TESTER worktree to the fetched branch head.
3. Confirm the checked-out commit is at or after `24f91043bcf35fdac3a06920c95397ad12f901f4`.
4. Read `test-comms/TESTER-RESULT-057.md`.
5. Confirm `installer/modules.json` declares CivicContracts source commit `65b711571cdabd61974aa741f40d0e6e9f9c6567`.
6. Do not edit source, generated artifacts, `installer/modules.json`, docs outside `test-comms`, or tests.
7. Run the standard clean-stack teardown from `test-comms/README.md`. Do not reboot the host.
8. Record host facts, Docker/Ollama state, `ollama ps`, ports `11435`, `18082`, and `23864`, stale `python`/`uvicorn`/`llama-server`/`ollama_llama_server` state, and available physical memory before readiness.
9. Verify the non-mutating proven-suite plan for the selected eleven-module suite.
10. Run repo-local readiness with isolated host-Ollama port `11435`, using the same module list and host-Ollama approach as `TESTER-DIRECTIVE-057`.
11. If readiness fails, stop and report the exact readiness blocker with memory/process diagnostics and the full `host_ollama_model_load` attempts array.
12. If readiness passes, run install with the same run isolation pattern.
13. If install fails, include the failing step and the full lifecycle entry for the failing step.
14. If install passes, run verify with the same run isolation pattern.
15. After verify, independently check CivicContracts live API and UI behavior on the installed CivicContracts port from launcher config or installer lifecycle evidence.
16. Write `test-comms/TESTER-RESULT-058.md` and push it to `stage-3a-baremetal-windows`.

## Required CivicContracts evidence

`TESTER-RESULT-058.md` must include:

- exact branch head tested,
- confirmation `TESTER-RESULT-057.md` was read,
- confirmation no source/generated/module manifest files were edited,
- host facts and clean-stack teardown result,
- proven-suite plan result and selected module list,
- readiness lifecycle path and status,
- install lifecycle path and status,
- verify lifecycle path and status,
- install provenance path,
- source commit list proving `civiccontracts=65b711571cdabd61974aa741f40d0e6e9f9c6567`,
- CivicContracts API port and launcher URL,
- launcher config entry for CivicContracts,
- `python_service_start` lifecycle entry for `civiccontracts`, including:
  - `pre_stop`,
  - `pre_port_stop`,
  - spawned PID,
  - service log path,
  - confirmation the spawned process did not exit during startup,
- independent `GET /civiccontracts` result: HTTP 200 and title/content marker,
- independent `GET /civiccontracts/staff` result: HTTP 200 and title/content marker,
- independent `GET /api/v1/civiccontracts/readiness` JSON showing `ready=true`, `schema_ready=true`, and `using_default_local_database=true`,
- independent `GET /api/v1/civiccontracts/integration-contracts` JSON showing all four required contracts:
  - `civiccontracts.contract_draft.v1`
  - `civiccontracts.staff_review_queue.v1`
  - `civiccontracts.procurement_handoff.v1`
  - `civiccontracts.records_export.v1`
- independent `POST /api/v1/civiccontracts/drafts/from-procurement` creating a contract draft from a CivicProcure handoff and returning non-empty `draft_id` and `staff_review_id`,
- independent `GET /api/v1/civiccontracts/drafts/{draft_id}` retrieving the created contract draft,
- independent staff-keyed `GET /api/v1/civiccontracts/staff/reviews` showing the created review in the saved queue,
- independent `POST /api/v1/civiccontracts/registry` creating a registry record and returning a non-empty `contract_id`,
- independent `GET /api/v1/civiccontracts/registry/{contract_id}` retrieving the created registry record,
- independent `POST /api/v1/civiccontracts/renewals/summary` returning renewal summary output for the created registry context,
- independent `POST /api/v1/civiccontracts/export` returning a records export payload,
- verify evidence showing `civiccontracts_integration_contracts` passed,
- live module route checks for all eleven selected modules,
- final verdict.

## Staff key note

The suite installer sets `CIVICCONTRACTS_STAFF_API_KEY` for the CivicContracts service environment. Use the local stage key `civicsuite-local-staff-key` for the independent staff queue request, with headers:

- `X-CivicContracts-Role: staff`
- `X-CivicContracts-Staff-Key: civicsuite-local-staff-key`

## Pass criteria

Pass only if readiness, install, and verify all pass; real host-Ollama `gemma4:e4b` remains green through the proven-suite flow; launcher remains available on `http://127.0.0.1:18082/`; all eleven module route checks pass; CivicContracts public and staff pages return HTTP 200; CivicContracts readiness reports ready/schema-ready with local persistence; CivicContracts integration contracts include all four required contracts; and the procurement handoff draft, staff queue, registry, renewal summary, and export workflows succeed.

If any phase fails, report the exact failing phase and evidence. Do not mark the CivicContracts gate passed until the full sequence is green.

## Constraints

Push only `test-comms/TESTER-RESULT-058.md`. No source edits during the test run. No merge, tag, status promotion, or `modules.json` changes. Never touch any OneDrive path.
