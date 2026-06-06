# Tester Directive 051 - CivicAccess gate retry after host-Ollama crash recovery

## Goal

Rerun the CivicAccess standalone and suite integration gate after builder commit `3661ff32d1ebfa25686a160a6713fbb8aa549f98` fixed the `TESTER-RESULT-050.md` readiness failure.

`TESTER-RESULT-050.md` failed at `host_ollama_model_load` because Windows/Ollama returned:

```text
llama-server process has terminated: exit status 0xc0000409
```

The new builder fix detects that crash class, records it, cleans up worker state, stops/restarts the managed isolated Ollama server, and continues to the next bounded profile. This retry must prove the fix on the real test machine and then complete the full CivicAccess API/UI evidence if readiness and install pass.

Do not restart the test machine. If a clean test is needed, uninstall/teardown the CivicSuite stack only and preserve Docker Desktop, Ollama, WSL, model cache, and host prerequisites.

## Required branch truth

- Repo: `CivicSuite/civicsuite`
- Branch: `stage-3a-baremetal-windows`
- Required minimum head: `3661ff32d1ebfa25686a160a6713fbb8aa549f98`
- Builder fix under test: `3661ff32d1ebfa25686a160a6713fbb8aa549f98`
- CivicAccess source commit required by `installer/modules.json`: `9576dd5eaa17c5c7b4dbbe1cefa1f94fd82f8fd3`
- Prior result to read: `test-comms/TESTER-RESULT-050.md`
- Expected result file: `test-comms/TESTER-RESULT-051.md`

## Required procedure

1. Fetch the explicit GitHub branch ref `refs/heads/stage-3a-baremetal-windows`.
2. Reset the TESTER worktree to the fetched branch head.
3. Confirm the checked-out commit is at or after `3661ff32d1ebfa25686a160a6713fbb8aa549f98`.
4. Read `test-comms/TESTER-RESULT-050.md`.
5. Confirm `installer/modules.json` declares CivicAccess source commit `9576dd5eaa17c5c7b4dbbe1cefa1f94fd82f8fd3`.
6. Do not edit source, generated artifacts, `installer/modules.json`, docs outside `test-comms`, or tests.
7. Run the standard clean-stack teardown from `test-comms/README.md`. Do not reboot the host.
8. Record host facts, Docker/Ollama state, `ollama ps`, port `11435` state, port `18082` state, stale `llama-server`/`ollama_llama_server` state, and available physical memory before readiness.
9. Verify the non-mutating proven-suite plan for the selected ten-module suite.
10. Run repo-local readiness with isolated host-Ollama port `11435`, using the same module list and host-Ollama approach as `TESTER-DIRECTIVE-050`.
11. If readiness fails, stop and report the exact readiness blocker with memory/process diagnostics and the full `host_ollama_model_load` attempts array.
12. If readiness passes, run install with the same run isolation pattern.
13. If install passes, run verify with the same run isolation pattern.
14. After verify, independently check CivicAccess live API and UI behavior on the installed CivicAccess port from launcher config or installer lifecycle evidence.
15. Write `test-comms/TESTER-RESULT-051.md` and push it to `stage-3a-baremetal-windows`.

## Required crash-recovery evidence

`TESTER-RESULT-051.md` must include the full `host_ollama_model_load` check from readiness, including:

- `selected_profile`,
- all `attempts`,
- whether any attempt has `crash_detected=true`,
- `crash_cleanup` if present,
- `managed_server_stop` if present,
- `server_after_crash_restart` if present,
- `release_after_probe`,
- memory before readiness and after readiness,
- Ollama process and `llama-server` process state before readiness and after readiness.

If the crash no longer occurs, say so explicitly and still include the attempts array. If the crash occurs and recovery succeeds, readiness should continue and pass. If every profile fails, report the exact final attempt and leave the gate failed.

## Required CivicAccess evidence

If install and verify run, `TESTER-RESULT-051.md` must include:

- exact branch head tested,
- confirmation `TESTER-RESULT-050.md` was read,
- confirmation no source/generated/module manifest files were edited,
- host facts and clean-stack teardown result,
- proven-suite plan result and selected module list,
- readiness lifecycle path and status,
- install lifecycle path and status,
- verify lifecycle path and status,
- install provenance path,
- `installer/modules.json` hash,
- source commit list proving `civicaccess=9576dd5eaa17c5c7b4dbbe1cefa1f94fd82f8fd3`,
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

Push only `test-comms/TESTER-RESULT-051.md`. No source edits during the test run. No merge, tag, status promotion, or `modules.json` changes. Never touch any OneDrive path.
