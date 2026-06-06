# Tester Directive 055 - CivicInspect standalone and suite integration gate

## Goal

Run the CivicInspect standalone and suite integration gate after builder completed the local-first CivicInspect stage.

The builder work under test:

- CivicInspect module head: `7f578fdc7b32f26b67c732e2d802600369226e9d`
- Umbrella installer head: `0cab736ddb10d189cceecfcac49f1b31fa63586f`

Do not restart the test machine. If a clean test is needed, uninstall/teardown the CivicSuite stack only and preserve Docker Desktop, Ollama, WSL, model cache, and host prerequisites.

## Required branch truth

- Repo: `CivicSuite/civicsuite`
- Branch: `stage-3a-baremetal-windows`
- Required minimum head: `0cab736ddb10d189cceecfcac49f1b31fa63586f`
- CivicInspect source commit required by `installer/modules.json`: `7f578fdc7b32f26b67c732e2d802600369226e9d`
- Prior result to read: `test-comms/TESTER-RESULT-054.md`
- Expected result file: `test-comms/TESTER-RESULT-055.md`

## Required procedure

1. Fetch the explicit GitHub branch ref `refs/heads/stage-3a-baremetal-windows`.
2. Reset the TESTER worktree to the fetched branch head.
3. Confirm the checked-out commit is at or after `0cab736ddb10d189cceecfcac49f1b31fa63586f`.
4. Read `test-comms/TESTER-RESULT-054.md`.
5. Confirm `installer/modules.json` declares CivicInspect source commit `7f578fdc7b32f26b67c732e2d802600369226e9d`.
6. Do not edit source, generated artifacts, `installer/modules.json`, docs outside `test-comms`, or tests.
7. Run the standard clean-stack teardown from `test-comms/README.md`. Do not reboot the host.
8. Record host facts, Docker/Ollama state, `ollama ps`, ports `11435`, `18082`, `23861`, stale `python`/`uvicorn`/`llama-server`/`ollama_llama_server` state, and available physical memory before readiness.
9. Verify the non-mutating proven-suite plan for the selected ten-module suite.
10. Run repo-local readiness with isolated host-Ollama port `11435`, using the same module list and host-Ollama approach as `TESTER-DIRECTIVE-054`.
11. If readiness fails, stop and report the exact readiness blocker with memory/process diagnostics and the full `host_ollama_model_load` attempts array.
12. If readiness passes, run install with the same run isolation pattern.
13. If install fails, include the failing step and the full lifecycle entry for the failing step.
14. If install passes, run verify with the same run isolation pattern.
15. After verify, independently check CivicInspect live API and UI behavior on the installed CivicInspect port from launcher config or installer lifecycle evidence.
16. Write `test-comms/TESTER-RESULT-055.md` and push it to `stage-3a-baremetal-windows`.

## Required CivicInspect evidence

`TESTER-RESULT-055.md` must include:

- exact branch head tested,
- confirmation `TESTER-RESULT-054.md` was read,
- confirmation no source/generated/module manifest files were edited,
- host facts and clean-stack teardown result,
- proven-suite plan result and selected module list,
- readiness lifecycle path and status,
- install lifecycle path and status,
- verify lifecycle path and status,
- install provenance path,
- source commit list proving `civicinspect=7f578fdc7b32f26b67c732e2d802600369226e9d`,
- CivicInspect API port and launcher URL,
- launcher config entry for CivicInspect,
- `python_service_start` lifecycle entry for `civicinspect`, including:
  - `pre_stop`,
  - `pre_port_stop`,
  - spawned PID,
  - service log path,
  - confirmation the spawned process did not exit during startup,
- independent `GET /civicinspect` result: HTTP 200 and title/content marker,
- independent `GET /civicinspect/staff` result: HTTP 200 and title/content marker,
- independent `GET /api/v1/civicinspect/readiness` JSON showing `ready=true`, `schema_ready=true`, and `repeat_case_count >= 1`,
- independent `GET /api/v1/civicinspect/integration-contracts` JSON showing all three contracts:
  - `civicinspect.inspection_report_draft.v1`
  - `civicinspect.staff_review_queue.v1`
  - `civicinspect.records_export_checklist.v1`
- independent `POST /api/v1/civicinspect/reports/draft` creating a draft and returning non-empty `report_id` and `staff_review_id`,
- independent staff-keyed `GET /api/v1/civicinspect/staff/reviews` showing the created review in the saved queue,
- independent `POST /api/v1/civicinspect/export` showing a records-ready checklist and retention note,
- verify evidence showing `civicinspect_integration_contracts` passed,
- live module route checks for all ten selected modules,
- final verdict.

## Staff key note

The suite installer sets `CIVICINSPECT_STAFF_API_KEY` for the CivicInspect service environment. Use the local stage key `civicsuite-local-staff-key` for the independent staff queue request, with headers:

- `X-CivicInspect-Role: staff`
- `X-CivicInspect-Staff-Key: civicsuite-local-staff-key`

## Pass criteria

Pass only if readiness, install, and verify all pass; real host-Ollama `gemma4:e4b` remains green through the proven-suite flow; launcher remains available on `http://127.0.0.1:18082/`; all ten module route checks pass; CivicInspect public and staff pages return HTTP 200; CivicInspect readiness reports ready/schema-ready with local repeat-case records; CivicInspect integration contracts include all three required contracts; and the create/list/export workflow succeeds.

If any phase fails, report the exact failing phase and evidence. Do not mark the CivicInspect gate passed until the full sequence is green.

## Constraints

Push only `test-comms/TESTER-RESULT-055.md`. No source edits during the test run. No merge, tag, status promotion, or `modules.json` changes. Never touch any OneDrive path.
