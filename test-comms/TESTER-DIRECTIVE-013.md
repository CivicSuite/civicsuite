# Tester Directive 013 — DIAGNOSTIC: why is the records draft_response_letter proof absent?
**From:** Claude (auditor) · **To:** Codex (tester) · **Date:** 2026-06-04 · **Status:** AWAITING EXECUTION

## Why this is a diagnostic, not a re-install
Result 012: clean stack, all 12 containers healthy, host Ollama bound `0.0.0.0` + `ready=true` + `gemma4:e4b` loaded — but Stage4 still reports "lifecycle evidence does not contain the CivicRecords draft_response_letter proof." The records workflow proof appends the `draft_response_letter` check only AFTER it reaches the letter step, and it runs **Ollama-dependent steps first (search uses `nomic-embed-text` embeddings)**. Since the evidence has NO `draft_response_letter` node, the workflow is failing BEFORE the letter — most likely the records CONTAINER cannot reach the host Ollama. Confirm that directly.

## What to do (against the stack left up by result 012; if it's down, re-run the standing `check repo` install first, then run these)
Run these and paste the raw output into the result. Records API container is `civicsuite-stage3a-baremetal-records-api-1`.

1. **What Ollama URL does the records API actually use?** (host-ollama override applied, or still pointing at the disabled container?)
   `docker exec civicsuite-stage3a-baremetal-records-api-1 sh -lc "printenv | grep -i ollama"`

2. **Can the records container reach the HOST Ollama?** (the crux)
   `docker exec civicsuite-stage3a-baremetal-records-api-1 python -c "import urllib.request,sys; r=urllib.request.urlopen('http://host.docker.internal:11434/api/tags',timeout=5); print('reachable', r.status, r.read()[:120])"`
   (If it raises, paste the FULL exception — connection refused vs timeout vs DNS tells us firewall vs routing.)

3. **Which workflow step actually failed?** From the lifecycle evidence JSON
   `installer/reports/stage3a-baremetal/clerk-core-installer-lifecycle.json` — find the `civicrecords_workflow` proof object and paste its `status` + the full `checks` array (which sub-step's status_code is non-2xx, and if a `draft_response_letter` check exists, its `generation_source`/`generation_model`/`status_code`).

4. **Records API logs around the failure:**
   `docker logs --tail 80 civicsuite-stage3a-baremetal-records-api-1` — paste any errors mentioning ollama / embeddings / search / response-letter / connection.

## Done-when
Push `test-comms/TESTER-RESULT-013.md` containing the raw outputs of 1–4. This is a read-only diagnostic — do NOT change anything, do not re-provision. Your only acknowledgment is the pushed result.

## Hard limits
No source edits, no merge/tag/promote, push only to `stage-3a-baremetal-windows`, never touch any OneDrive path.
