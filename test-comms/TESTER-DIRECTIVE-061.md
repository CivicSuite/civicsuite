# Tester Directive 061 - CivicBoards retry after Python venv bootstrap recovery fix

## Goal

Retry the CivicBoards standalone and suite integration gate after builder fixed the installer failure reported in `TESTER-RESULT-060.md`.

The builder work under test:

- CivicBoards module head: `cdc6bf1b2e8012151d3767e04cd0e378638798c9`
- Umbrella installer minimum code head: `de4dcec9365e8909455b797eba1b407e35745f3d`
- Fix under test: Python service virtualenv creation now has bounded retry evidence, removes partial `.venv` state before retry, recognizes transient Windows `ensurepip` bootstrap crashes, and can recover by rerunning `ensurepip` when the venv Python exists.
- Prior fixes still under test: pip install transient classifier treats `MemoryError` as retryable and retries editable service install with `--no-cache-dir`.

Do not restart the test machine. If a clean test is needed, uninstall/teardown the CivicSuite stack only and preserve Docker Desktop, Ollama, WSL, model cache, and host prerequisites.

## Required branch truth

- Repo: `CivicSuite/civicsuite`
- Branch: `stage-3a-baremetal-windows`
- Required minimum head: `de4dcec9365e8909455b797eba1b407e35745f3d`
- CivicBoards source commit required by `installer/modules.json`: `cdc6bf1b2e8012151d3767e04cd0e378638798c9`
- Prior result to read: `test-comms/TESTER-RESULT-060.md`
- Expected result file: `test-comms/TESTER-RESULT-061.md`

## Required procedure

1. Fetch the explicit GitHub branch ref `refs/heads/stage-3a-baremetal-windows`.
2. Reset the TESTER worktree to the fetched branch head.
3. Confirm the checked-out commit is at or after `de4dcec9365e8909455b797eba1b407e35745f3d`.
4. Read `test-comms/TESTER-RESULT-060.md`.
5. Confirm `installer/modules.json` declares CivicBoards source commit `cdc6bf1b2e8012151d3767e04cd0e378638798c9`.
6. Confirm the installer source includes `PYTHON_SERVICE_VENV_RETRIES`, `python_service_venv_is_transient_failure`, and `run_python_service_create_venv`.
7. Confirm the installer source still includes the `MemoryError` transient marker and retry command evidence for `--no-cache-dir`.
8. Do not edit source, generated artifacts, `installer/modules.json`, docs outside `test-comms`, or tests.
9. Run the standard clean-stack teardown from `test-comms/README.md`. Do not reboot the host.
10. Record host facts, Docker/Ollama state, `ollama ps`, ports `11435`, `18082`, and `23865`, stale `python`/`uvicorn`/`llama-server`/`ollama_llama_server` state, and available physical memory before readiness.
11. Verify the non-mutating proven-suite plan for the selected twelve-module suite.
12. Run repo-local readiness with isolated host-Ollama port `11435`, using the same module list and host-Ollama approach as `TESTER-DIRECTIVE-060`.
13. If readiness fails, stop and report the exact readiness blocker with memory/process diagnostics and the full `host_ollama_model_load` attempts array.
14. If readiness passes, run install with the same run isolation pattern.
15. If install fails again at `python_service_create_venv` for CivicBoards, include the full lifecycle entry, including every venv attempt, each attempt command, whether the failure was marked transient, and any `ensurepip_recovery_attempts`.
16. If install fails at `python_service_install_editable` for CivicBoards, include the full lifecycle entry, including every install attempt, each attempt command, and whether the retry command included `--no-cache-dir`.
17. If install passes, run verify with the same run isolation pattern.
18. After verify, independently check CivicBoards live API and UI behavior on the installed CivicBoards port from launcher config or installer lifecycle evidence.
19. Write `test-comms/TESTER-RESULT-061.md` and push it to `stage-3a-baremetal-windows`.

## Required CivicBoards evidence

`TESTER-RESULT-061.md` must include:

- exact branch head tested,
- confirmation `TESTER-RESULT-060.md` was read,
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
- `python_service_create_venv` lifecycle entry for `civicboards`, including:
  - all attempts,
  - each attempt command,
  - whether any failure was marked transient,
  - whether partial venv cleanup and retry occurred,
  - any `ensurepip_recovery_attempts`,
- `python_service_install_editable` lifecycle entry for `civicboards`, including:
  - all attempts,
  - each attempt command,
  - whether any retry used `--no-cache-dir`,
  - whether any `MemoryError` recurred,
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

Push only `test-comms/TESTER-RESULT-061.md`. No source edits during the test run. No merge, tag, status promotion, or `modules.json` changes. Never touch any OneDrive path.
