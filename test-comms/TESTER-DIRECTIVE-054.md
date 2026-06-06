# Tester Directive 054 - CivicAccess gate retry after stale-listener start fix

## Goal

Rerun the CivicAccess standalone and suite integration gate after builder commit `5d844e953e3f935eeda10c2957ff9312d925fe9e` fixed the installer false-positive service-start path.

`TESTER-RESULT-053.md` proved:

- Transient pip retry behavior cleared the prior network install failure path.
- CivicAccess editable install reported success from source commit `9576dd579575fe6555f92590912c7686e3521b9f`.
- The gate failed at `civicaccess_integration_contracts` because the live CivicAccess port exposed old readiness behavior and did not expose `/civicaccess/staff` or `/api/v1/civicaccess/integration-contracts`.

The new builder fix makes Python service startup reject stale listeners by stopping any existing listener on the target module port before launch and failing if the newly spawned uvicorn process exits even when `/health` responds. It also provides CivicAccess a local runtime data directory under the install root.

Do not restart the test machine. If a clean test is needed, uninstall/teardown the CivicSuite stack only and preserve Docker Desktop, Ollama, WSL, model cache, and host prerequisites.

## Required branch truth

- Repo: `CivicSuite/civicsuite`
- Branch: `stage-3a-baremetal-windows`
- Required minimum head: `5d844e953e3f935eeda10c2957ff9312d925fe9e`
- Builder fix under test: `5d844e953e3f935eeda10c2957ff9312d925fe9e`
- CivicAccess source commit required by `installer/modules.json`: `9576dd579575fe6555f92590912c7686e3521b9f`
- Prior result to read: `test-comms/TESTER-RESULT-053.md`
- Expected result file: `test-comms/TESTER-RESULT-054.md`

## Required procedure

1. Fetch the explicit GitHub branch ref `refs/heads/stage-3a-baremetal-windows`.
2. Reset the TESTER worktree to the fetched branch head.
3. Confirm the checked-out commit is at or after `5d844e953e3f935eeda10c2957ff9312d925fe9e`.
4. Read `test-comms/TESTER-RESULT-053.md`.
5. Confirm `installer/modules.json` declares CivicAccess source commit `9576dd579575fe6555f92590912c7686e3521b9f`.
6. Do not edit source, generated artifacts, `installer/modules.json`, docs outside `test-comms`, or tests.
7. Run the standard clean-stack teardown from `test-comms/README.md`. Do not reboot the host.
8. Record host facts, Docker/Ollama state, `ollama ps`, ports `11435`, `18082`, and `23860`, stale `python`/`uvicorn`/`llama-server`/`ollama_llama_server` state, and available physical memory before readiness.
9. Verify the non-mutating proven-suite plan for the selected ten-module suite.
10. Run repo-local readiness with isolated host-Ollama port `11435`, using the same module list and host-Ollama approach as `TESTER-DIRECTIVE-053`.
11. If readiness fails, stop and report the exact readiness blocker with memory/process diagnostics and the full `host_ollama_model_load` attempts array.
12. If readiness passes, run install with the same run isolation pattern.
13. If install fails, include the failing step and the full lifecycle entry for the failing step.
14. If install passes, run verify with the same run isolation pattern.
15. After verify, independently check CivicAccess live API and UI behavior on the installed CivicAccess port from launcher config or installer lifecycle evidence.
16. Write `test-comms/TESTER-RESULT-054.md` and push it to `stage-3a-baremetal-windows`.

## Required stale-listener evidence

`TESTER-RESULT-054.md` must include:

- the `python_service_start` lifecycle entry for `civicaccess`,
- `pre_stop` status,
- `pre_port_stop` status and any stopped PID list,
- spawned CivicAccess PID,
- CivicAccess service log path,
- confirmation that the spawned process did not exit during startup,
- if install fails because the spawned process exits, include `failure`, `process_returncode`, `health`, and `log_tail`.

## Required CivicAccess evidence

If install and verify run, `TESTER-RESULT-054.md` must include:

- exact branch head tested,
- confirmation `TESTER-RESULT-053.md` was read,
- confirmation no source/generated/module manifest files were edited,
- host facts and clean-stack teardown result,
- proven-suite plan result and selected module list,
- readiness lifecycle path and status,
- install lifecycle path and status,
- verify lifecycle path and status,
- install provenance path,
- source commit list proving `civicaccess=9576dd579575fe6555f92590912c7686e3521b9f`,
- CivicAccess API port and launcher URL,
- launcher config entry for CivicAccess,
- independent `GET /civicaccess` result: HTTP 200 and title/content marker,
- independent `GET /civicaccess/staff` result: HTTP 200 and title/content marker,
- independent `GET /api/v1/civicaccess/readiness` JSON showing `ready=true` and `schema_ready=true`,
- independent `GET /api/v1/civicaccess/integration-contracts` JSON showing both:
  - `civicaccess.publication_accessibility_review.v1`
  - `civicaccess.records_export.v1`
- independent `POST /api/v1/civicaccess/review` creating a review and returning a non-empty `review_id`,
- independent `GET /api/v1/civicaccess/reviews` showing the created review in the saved queue,
- independent `POST /api/v1/civicaccess/reviews/{review_id}/records-export` showing:
  - endpoint status `records-export-ready`,
  - `target_module=civicrecords-ai`,
  - preserved review id,
  - provenance fields present,
- verify evidence showing `civicaccess_integration_contracts` passed,
- live module route checks for all ten selected modules,
- final verdict.

## Pass criteria

Pass only if readiness, install, and verify all pass; real host-Ollama `gemma4:e4b` remains green through the proven-suite flow; launcher remains available on `http://127.0.0.1:18082/`; all ten module route checks pass; CivicAccess public and staff pages return HTTP 200; CivicAccess readiness reports ready/schema-ready; CivicAccess integration contracts include both required contracts; and the create/list/export API workflow succeeds with `target_module=civicrecords-ai`.

If any phase fails, report the exact failing phase and evidence. Do not mark the CivicAccess gate passed until the full sequence is green.

## Constraints

Push only `test-comms/TESTER-RESULT-054.md`. No source edits during the test run. No merge, tag, status promotion, or `modules.json` changes. Never touch any OneDrive path.
