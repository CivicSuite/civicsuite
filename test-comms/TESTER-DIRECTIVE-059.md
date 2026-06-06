# Tester Directive 059 - CivicBoards standalone and suite integration gate

## Goal

Run the CivicBoards standalone and suite integration gate after builder completed the local-first CivicBoards stage and umbrella installer integration.

The builder work under test:

- CivicBoards module head: `cdc6bf1b2e8012151d3767e04cd0e378638798c9`
- Umbrella installer minimum code head: `da3c2fe8f093d7d665343a0013c4db2437efba9f`

Do not restart the test machine. If a clean test is needed, uninstall/teardown the CivicSuite stack only and preserve Docker Desktop, Ollama, WSL, model cache, and host prerequisites.

## Required branch truth

- Repo: `CivicSuite/civicsuite`
- Branch: `stage-3a-baremetal-windows`
- Required minimum head: `da3c2fe8f093d7d665343a0013c4db2437efba9f`
- CivicBoards source commit required by `installer/modules.json`: `cdc6bf1b2e8012151d3767e04cd0e378638798c9`
- Prior result to read: `test-comms/TESTER-RESULT-058.md`
- Expected result file: `test-comms/TESTER-RESULT-059.md`

## Required procedure

1. Fetch the explicit GitHub branch ref `refs/heads/stage-3a-baremetal-windows`.
2. Reset the TESTER worktree to the fetched branch head.
3. Confirm the checked-out commit is at or after `da3c2fe8f093d7d665343a0013c4db2437efba9f`.
4. Read `test-comms/TESTER-RESULT-058.md`.
5. Confirm `installer/modules.json` declares CivicBoards source commit `cdc6bf1b2e8012151d3767e04cd0e378638798c9`.
6. Do not edit source, generated artifacts, `installer/modules.json`, docs outside `test-comms`, or tests.
7. Run the standard clean-stack teardown from `test-comms/README.md`. Do not reboot the host.
8. Record host facts, Docker/Ollama state, `ollama ps`, ports `11435`, `18082`, and `23865`, stale `python`/`uvicorn`/`llama-server`/`ollama_llama_server` state, and available physical memory before readiness.
9. Verify the non-mutating proven-suite plan for the selected twelve-module suite.
10. Run repo-local readiness with isolated host-Ollama port `11435`, using the same module list and host-Ollama approach as `TESTER-DIRECTIVE-058`.
11. If readiness fails, stop and report the exact readiness blocker with memory/process diagnostics and the full `host_ollama_model_load` attempts array.
12. If readiness passes, run install with the same run isolation pattern.
13. If install fails, include the failing step and the full lifecycle entry for the failing step.
14. If install passes, run verify with the same run isolation pattern.
15. After verify, independently check CivicBoards live API and UI behavior on the installed CivicBoards port from launcher config or installer lifecycle evidence.
16. Write `test-comms/TESTER-RESULT-059.md` and push it to `stage-3a-baremetal-windows`.

## Required CivicBoards evidence

`TESTER-RESULT-059.md` must include:

- exact branch head tested,
- confirmation `TESTER-RESULT-058.md` was read,
- confirmation no source/generated/module manifest files were edited,
- host facts and clean-stack teardown result,
- proven-suite plan result and selected module list,
- readiness lifecycle path and status,
- install lifecycle path and status,
- verify lifecycle path and status,
- install provenance path,
- source commit list proving `civicboards=cdc6bf1b2e8012151d3767e04cd0e378638798c9`,
- CivicBoards API port and launcher URL,
- launcher config entry for CivicBoards,
- `python_service_start` lifecycle entry for `civicboards`, including:
  - `pre_stop`,
  - `pre_port_stop`,
  - spawned PID,
  - service log path,
  - confirmation the spawned process did not exit during startup,
- independent `GET /civicboards` result: HTTP 200 and title/content marker,
- independent `GET /civicboards/staff` result: HTTP 200 and title/content marker,
- independent `GET /api/v1/civicboards/readiness` JSON showing `ready=true`, `schema_ready=true`, and `using_default_local_database=true`,
- independent `GET /api/v1/civicboards/integration-contracts` JSON showing all four required contracts:
  - `civicboards.board_roster.v1`
  - `civicboards.staff_review_queue.v1`
  - `civicboards.notice_packet.v1`
  - `civicboards.records_export.v1`
- independent `POST /api/v1/civicboards/registry` creating a board roster record and returning `board_id`,
- independent `GET /api/v1/civicboards/registry/{board_id}` retrieving the created board roster record,
- independent `POST /api/v1/civicboards/attendance` creating an attendance review and returning a non-empty `attendance_id`,
- independent `GET /api/v1/civicboards/attendance/{attendance_id}` retrieving the created attendance review,
- independent staff-keyed `GET /api/v1/civicboards/staff/reviews` showing the attendance-triggered review in the saved queue,
- independent staff-keyed `POST /api/v1/civicboards/staff/reviews` creating an explicit board review and returning a non-empty `review_id`,
- independent staff-keyed `GET /api/v1/civicboards/staff/reviews` showing the explicit review in the saved queue,
- independent `POST /api/v1/civicboards/vacancies` returning public notice checklist output,
- independent `POST /api/v1/civicboards/export` returning records export checklist and retention note,
- verify evidence showing `civicboards_integration_contracts` passed,
- live module route checks for all twelve selected modules,
- final verdict.

## Staff key note

The suite installer sets `CIVICBOARDS_STAFF_API_KEY` for the CivicBoards service environment. Use the local stage key `civicsuite-local-staff-key` for independent staff queue requests, with headers:

- `X-CivicBoards-Role: staff`
- `X-CivicBoards-Staff-Key: civicsuite-local-staff-key`

## Pass criteria

Pass only if readiness, install, and verify all pass; real host-Ollama `gemma4:e4b` remains green through the proven-suite flow; launcher remains available on `http://127.0.0.1:18082/`; all twelve module route checks pass; CivicBoards public and staff pages return HTTP 200; CivicBoards readiness reports ready/schema-ready with local persistence; CivicBoards integration contracts include all four required contracts; and the board roster, attendance review, staff queue, vacancy checklist, and records export workflows succeed.

If any phase fails, report the exact failing phase and evidence. Do not mark the CivicBoards gate passed until the full sequence is green.

## Constraints

Push only `test-comms/TESTER-RESULT-059.md`. No source edits during the test run. No merge, tag, status promotion, or `modules.json` changes. Never touch any OneDrive path.
