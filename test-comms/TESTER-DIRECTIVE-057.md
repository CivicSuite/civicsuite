# Tester Directive 057 - CivicProcure standalone and suite integration gate

## Goal

Run the CivicProcure standalone and suite integration gate after builder completed the local-first CivicProcure stage and umbrella installer integration.

The builder work under test:

- CivicProcure module head: `1a6f44a09d85fdd7e8153455b16c5ec4baa63311`
- Umbrella installer minimum code head: `785a54dd38530a67ac0e09ea9c9260d04cd5bc99`

Do not restart the test machine. If a clean test is needed, uninstall/teardown the CivicSuite stack only and preserve Docker Desktop, Ollama, WSL, model cache, and host prerequisites.

## Required branch truth

- Repo: `CivicSuite/civicsuite`
- Branch: `stage-3a-baremetal-windows`
- Required minimum head: `785a54dd38530a67ac0e09ea9c9260d04cd5bc99`
- CivicProcure source commit required by `installer/modules.json`: `1a6f44a09d85fdd7e8153455b16c5ec4baa63311`
- Prior result to read: `test-comms/TESTER-RESULT-056.md`
- Expected result file: `test-comms/TESTER-RESULT-057.md`

## Required procedure

1. Fetch the explicit GitHub branch ref `refs/heads/stage-3a-baremetal-windows`.
2. Reset the TESTER worktree to the fetched branch head.
3. Confirm the checked-out commit is at or after `785a54dd38530a67ac0e09ea9c9260d04cd5bc99`.
4. Read `test-comms/TESTER-RESULT-056.md`.
5. Confirm `installer/modules.json` declares CivicProcure source commit `1a6f44a09d85fdd7e8153455b16c5ec4baa63311`.
6. Do not edit source, generated artifacts, `installer/modules.json`, docs outside `test-comms`, or tests.
7. Run the standard clean-stack teardown from `test-comms/README.md`. Do not reboot the host.
8. Record host facts, Docker/Ollama state, `ollama ps`, ports `11435`, `18082`, and `23863`, stale `python`/`uvicorn`/`llama-server`/`ollama_llama_server` state, and available physical memory before readiness.
9. Verify the non-mutating proven-suite plan for the selected ten-module suite.
10. Run repo-local readiness with isolated host-Ollama port `11435`, using the same module list and host-Ollama approach as `TESTER-DIRECTIVE-056`.
11. If readiness fails, stop and report the exact readiness blocker with memory/process diagnostics and the full `host_ollama_model_load` attempts array.
12. If readiness passes, run install with the same run isolation pattern.
13. If install fails, include the failing step and the full lifecycle entry for the failing step.
14. If install passes, run verify with the same run isolation pattern.
15. After verify, independently check CivicProcure live API and UI behavior on the installed CivicProcure port from launcher config or installer lifecycle evidence.
16. Write `test-comms/TESTER-RESULT-057.md` and push it to `stage-3a-baremetal-windows`.

## Required CivicProcure evidence

`TESTER-RESULT-057.md` must include:

- exact branch head tested,
- confirmation `TESTER-RESULT-056.md` was read,
- confirmation no source/generated/module manifest files were edited,
- host facts and clean-stack teardown result,
- proven-suite plan result and selected module list,
- readiness lifecycle path and status,
- install lifecycle path and status,
- verify lifecycle path and status,
- install provenance path,
- source commit list proving `civicprocure=1a6f44a09d85fdd7e8153455b16c5ec4baa63311`,
- CivicProcure API port and launcher URL,
- launcher config entry for CivicProcure,
- `python_service_start` lifecycle entry for `civicprocure`, including:
  - `pre_stop`,
  - `pre_port_stop`,
  - spawned PID,
  - service log path,
  - confirmation the spawned process did not exit during startup,
- independent `GET /civicprocure` result: HTTP 200 and title/content marker,
- independent `GET /civicprocure/staff` result: HTTP 200 and title/content marker,
- independent `GET /api/v1/civicprocure/readiness` JSON showing `ready=true`, `schema_ready=true`, and `using_default_local_database=true`,
- independent `GET /api/v1/civicprocure/integration-contracts` JSON showing all four required contracts:
  - `civicprocure.rfp_draft.v1`
  - `civicprocure.staff_review_queue.v1`
  - `civicprocure.award_packet.v1`
  - `civicprocure.procurement_context.v1`
- independent `POST /api/v1/civicprocure/rfps/draft` creating an RFP draft and returning a non-empty `draft_id` and `staff_review_id`,
- independent `GET /api/v1/civicprocure/rfps/draft/{draft_id}` retrieving the created RFP draft,
- independent `POST /api/v1/civicprocure/award-packet` creating an award packet and returning a non-empty `packet_id` and `staff_review_id`,
- independent `GET /api/v1/civicprocure/award-packet/{packet_id}` retrieving the created award packet,
- independent staff-keyed `GET /api/v1/civicprocure/staff/reviews` showing the created reviews in the saved queue,
- independent `POST /api/v1/civicprocure/context/procurement-review` returning CivicClerk/CivicContracts context citations and `review_required=true`,
- verify evidence showing `civicprocure_integration_contracts` passed,
- live module route checks for all ten selected modules,
- final verdict.

## Staff key note

The suite installer sets `CIVICPROCURE_STAFF_API_KEY` for the CivicProcure service environment. Use the local stage key `civicsuite-local-staff-key` for the independent staff queue request, with headers:

- `X-CivicProcure-Role: staff`
- `X-CivicProcure-Staff-Key: civicsuite-local-staff-key`

## Pass criteria

Pass only if readiness, install, and verify all pass; real host-Ollama `gemma4:e4b` remains green through the proven-suite flow; launcher remains available on `http://127.0.0.1:18082/`; all ten module route checks pass; CivicProcure public and staff pages return HTTP 200; CivicProcure readiness reports ready/schema-ready with local persistence; CivicProcure integration contracts include all four required contracts; and the RFP draft, award packet, staff queue, and procurement context workflow succeeds.

If any phase fails, report the exact failing phase and evidence. Do not mark the CivicProcure gate passed until the full sequence is green.

## Constraints

Push only `test-comms/TESTER-RESULT-057.md`. No source edits during the test run. No merge, tag, status promotion, or `modules.json` changes. Never touch any OneDrive path.
