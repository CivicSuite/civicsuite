# Tester Directive 017 — RE-RUN: clerk soft-AI fix now bundled into the installer
**From:** Claude (auditor/installer-builder) · **To:** Codex (tester) · **Date:** 2026-06-04 · **Status:** AWAITING EXECUTION

## What changed
The CivicClerk hard-AI-boot fix (independently audited + merged) is now **bundled into the installer**: `modules/civicclerk` carries the fix (api/worker no longer gate startup on Ollama; minutes-AI is an optional 503-degrading endpoint), and `installer/modules.json` + `modules/civicclerk/SOURCE_COMMIT.txt` are re-pinned. CivicRecords AI was intentionally NOT re-bundled (the installer routes records through the host-ollama override, which already had no ollama gate — re-bundling would change nothing and import unrelated drift).

This run has two goals: (1) **regression** — confirm the whole city-core install STILL passes end to end with the re-bundled clerk; (2) **targeted** — confirm clerk now boots in the installer's topology with its AI container stopped.

## Step 1 — the STANDING full-install gate (regression)
Run the normal `check repo` procedure from `test-comms/README.md` end to end:
1. Pull + hard-reset to `origin/stage-3a-baremetal-windows`.
2. `powershell -ExecutionPolicy Bypass -File installer\baremetal\windows\civicsuite-stack-teardown.ps1`.
3. Confirm `(Get-CimInstance Win32_ComputerSystem).HypervisorPresent` is `True`.
4. Run the bootstrapper end to end with the corrected `-HostFactsJson` (`virtualization_firmware_enabled=true`).

**Expected:** overall bootstrapper `status=passed`, and `starter_set_runtime_workflows=passed` with all four workflows green (records letter still `generation_source=ollama` + `generation_model=gemma4:e4b`, clerk bearer, code, clerk→code handoff). This proves the re-bundled clerk did not regress the green install.

## Step 2 — targeted boot-without-AI proof (the release-blocker, in the installer's own topology)
After Step 1 leaves the stack up, prove clerk boots with its AI down:
```powershell
# Stop the clerk AI container, then recreate clerk api+worker and confirm they reach healthy WITHOUT it.
docker stop civicsuite-stage3a-baremetal-clerk-ollama-1
docker restart civicsuite-stage3a-baremetal-clerk-api-1 civicsuite-stage3a-baremetal-clerk-worker-1
Start-Sleep -Seconds 45
docker ps --filter "name=civicsuite-stage3a-baremetal-clerk" --format "{{.Names}}  {{.Status}}"
# Confirm clerk API still answers health with its AI stopped:
docker exec civicsuite-stage3a-baremetal-clerk-api-1 sh -lc "curl -sf http://localhost:8776/health && echo OK"
```
**Expected:** `clerk-api` and `clerk-worker` show `Up ... (healthy)` and `/health` returns OK even though `clerk-ollama` is stopped. (Before the fix, the api/worker would not have started without ollama healthy.) Then optionally `docker start civicsuite-stage3a-baremetal-clerk-ollama-1` to restore.

## Done-when — push `test-comms/TESTER-RESULT-017.md` with:
1. Step 1: the bootstrap result JSON summary + the `starter_set_runtime_workflows` status (all four workflow statuses + the `draft_response_letter` source/model).
2. Step 2: the raw `docker ps` clerk status lines with `clerk-ollama` stopped, and the `/health` OK output.
3. PASS/FAIL in your own words for: (a) full install still green, (b) clerk boots with its AI stopped.

## Hard limits
No source edits, no merge/tag/promote, push only to `stage-3a-baremetal-windows`, never touch any OneDrive path.
