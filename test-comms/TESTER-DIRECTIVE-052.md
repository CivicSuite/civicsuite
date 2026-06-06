# Tester Directive 052 - CivicAccess gate retry after source pin correction

## Goal

Rerun the CivicAccess standalone and suite integration gate after builder commit `1ef35d970b9e209cf4c69449dab3105e27776eb5` corrected the CivicAccess source pin.

`TESTER-RESULT-051.md` proved readiness passed with `cpu_mmap_default`, but install failed because the suite manifest pinned CivicAccess to a non-existent full SHA. The corrected CivicAccess source commit is:

```text
9576dd579575fe6555f92590912c7686e3521b9f
```

Do not restart the test machine. If a clean test is needed, uninstall/teardown the CivicSuite stack only and preserve Docker Desktop, Ollama, WSL, model cache, and host prerequisites.

## Required branch truth

- Repo: `CivicSuite/civicsuite`
- Branch: `stage-3a-baremetal-windows`
- Required minimum head: `1ef35d970b9e209cf4c69449dab3105e27776eb5`
- Builder fix under test: `1ef35d970b9e209cf4c69449dab3105e27776eb5`
- CivicAccess source commit required by `installer/modules.json`: `9576dd579575fe6555f92590912c7686e3521b9f`
- Prior result to read: `test-comms/TESTER-RESULT-051.md`
- Expected result file: `test-comms/TESTER-RESULT-052.md`

## Required procedure

1. Fetch the explicit GitHub branch ref `refs/heads/stage-3a-baremetal-windows`.
2. Reset the TESTER worktree to the fetched branch head.
3. Confirm the checked-out commit is at or after `1ef35d970b9e209cf4c69449dab3105e27776eb5`.
4. Read `test-comms/TESTER-RESULT-051.md`.
5. Confirm `installer/modules.json` declares CivicAccess source commit `9576dd579575fe6555f92590912c7686e3521b9f`.
6. Confirm the CivicAccess GitHub archive URL for that commit is reachable or that source resolution succeeds during install.
7. Do not edit source, generated artifacts, `installer/modules.json`, docs outside `test-comms`, or tests.
8. Run the standard clean-stack teardown from `test-comms/README.md`. Do not reboot the host.
9. Record host facts, Docker/Ollama state, `ollama ps`, port `11435` state, port `18082` state, stale `llama-server`/`ollama_llama_server` state, and available physical memory before readiness.
10. Verify the non-mutating proven-suite plan for the selected ten-module suite.
11. Run repo-local readiness with isolated host-Ollama port `11435`, using the same module list and host-Ollama approach as `TESTER-DIRECTIVE-051`.
12. If readiness fails, stop and report the exact readiness blocker with memory/process diagnostics and the full `host_ollama_model_load` attempts array.
13. If readiness passes, run install with the same run isolation pattern.
14. If install passes, run verify with the same run isolation pattern.
15. After verify, independently check CivicAccess live API and UI behavior on the installed CivicAccess port from launcher config or installer lifecycle evidence.
16. Write `test-comms/TESTER-RESULT-052.md` and push it to `stage-3a-baremetal-windows`.

## Required source-resolution evidence

`TESTER-RESULT-052.md` must include:

- `installer/modules.json` hash,
- source commit list proving `civicaccess=9576dd579575fe6555f92590912c7686e3521b9f`,
- install source-cache evidence for CivicAccess,
- whether CivicAccess was resolved from bundled source, sibling checkout, or GitHub archive,
- if fetched, the archive URL used and confirmation it did not return 404,
- `SOURCE_COMMIT.txt` evidence for CivicAccess in the install cache/runtime source if present.

## Required readiness evidence

Include the full `host_ollama_model_load` check from readiness, including:

- `selected_profile`,
- all `attempts`,
- whether any attempt has `crash_detected=true`,
- `release_after_probe`,
- memory before readiness and after readiness,
- Ollama process and `llama-server` process state before readiness and after readiness.

## Required CivicAccess evidence

If install and verify run, `TESTER-RESULT-052.md` must include:

- exact branch head tested,
- confirmation `TESTER-RESULT-051.md` was read,
- confirmation no source/generated/module manifest files were edited,
- host facts and clean-stack teardown result,
- proven-suite plan result and selected module list,
- readiness lifecycle path and status,
- install lifecycle path and status,
- verify lifecycle path and status,
- install provenance path,
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

Push only `test-comms/TESTER-RESULT-052.md`. No source edits during the test run. No merge, tag, status promotion, or `modules.json` changes. Never touch any OneDrive path.
