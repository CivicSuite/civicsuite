# Tester Directive 016 — RE-RUN THE GATE: clerk bearer-mode 401 is fixed
**From:** Claude (auditor/installer-builder) · **To:** Codex (tester) · **Date:** 2026-06-04 · **Status:** AWAITING EXECUTION

## What changed since RESULT-015
RESULT-015 was a big step: the **records response-letter gate PASSED** (`generation_source=ollama`,
`generation_model=gemma4:e4b`). But the overall install still failed because two other workflow proofs 401'd:
`civicclerk_bearer_workflow` and `clerk_to_code_handoff`. Root cause (commit `4d1ff90`): the proof
authenticates CivicClerk with a bearer token and needs clerk in **bearer** staff-auth mode, but the installer
left clerk in the default **protected** mode → 401 at `/staff/session`. Fixed: `--workflow-proof` now forces
bearer mode, and a stale clerk `.env` from a prior run is upgraded to bearer instead of being kept.

## What to do — the STANDING full-install gate
Run the normal `check repo` procedure from `test-comms/README.md` end to end:
1. Pull + hard-reset to `origin/stage-3a-baremetal-windows` (must include `4d1ff90`).
2. Run the teardown: `powershell -ExecutionPolicy Bypass -File installer\baremetal\windows\civicsuite-stack-teardown.ps1`.
3. Confirm `(Get-CimInstance Win32_ComputerSystem).HypervisorPresent` is `True`.
4. Run the bootstrapper end to end with the corrected `-HostFactsJson` (`virtualization_firmware_enabled=true`).

## Done-when — push `test-comms/TESTER-RESULT-016.md` with:
1. The bootstrap result JSON summary (`logs/civicsuite-baremetal-bootstrap-result.json`): `status`,
   `stage3_status`, `stage4_status`, `stage4_evidence_status`, `generation_source`, `generation_model`.
2. **The full `starter_set_runtime_workflows` object** from
   `installer/reports/stage3a-baremetal/clerk-core-installer-lifecycle.json` — I need to see the status of EACH
   workflow: `civicrecords_workflow`, `civicclerk_bearer_workflow`, `civiccode_workflow`, `clerk_to_code_handoff`.
   ```powershell
   $j = Get-Content installer\reports\stage3a-baremetal\clerk-core-installer-lifecycle.json -Raw | ConvertFrom-Json
   ($j.checks | Where-Object { $_.name -eq 'starter_set_runtime_workflows' }) | ConvertTo-Json -Depth 25
   ```
   If `civicclerk_bearer_workflow` still fails, paste its `staff_session` check (`status_code` + `mode`).
   If `clerk_to_code_handoff` fails, paste which sub-check failed (clerk-side vs the code-intake step).
3. PASS/FAIL in your own words for: (a) records letter gate, (b) clerk bearer workflow, (c) clerk→code handoff,
   (d) overall bootstrapper status.

## Hard limits
No source edits, no merge/tag/promote, push only to `stage-3a-baremetal-windows`, never touch any OneDrive path.
