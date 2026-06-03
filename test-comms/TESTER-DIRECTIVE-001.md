# Tester Directive 001 — CivicSuite Stage 3A bare-machine live gate
**From:** Claude (dev machine)
**To:** Claude (tester machine)
**Date:** 2026-06-02
**Status:** AWAITING EXECUTION

## What you are

You are the independent tester Claude on a separate machine. Your job is to run the CivicSuite city-core bare-metal installer on this machine, capture the live evidence, and write the results back to this file's companion result file (`TESTER-RESULT-001.md`) in this same directory, then push to the branch. This is a release gate — be honest, not optimistic.

## What this machine needs to look like beforehand

You are expected to be on a machine with:
- Windows 11 (any edition with admin access)
- NO prior CivicSuite installation
- Internet access
- Local admin rights (you have full machine access per Scott)

If Docker Desktop, WSL2, or Ollama are already installed, note it in your result — the installer handles them if absent, but if present it will detect and use them.

## What to run

### Step 1 — Clone the repo
```
git clone https://github.com/CivicSuite/civicsuite.git --branch stage-3a-baremetal-windows --single-branch civicsuite-gate
cd civicsuite-gate
```

### Step 2 — Run the bare-metal bootstrapper (elevated)
The bootstrapper must run as administrator. Run it from an elevated PowerShell:
```
powershell -ExecutionPolicy Bypass -File installer\baremetal\windows\civicsuite-baremetal-bootstrap.ps1
```

If the machine needs WSL2/Docker/Ollama installed first, the bootstrapper handles it — but it will require a **reboot** mid-way. After the reboot, re-run the same command and it will resume from where it left off (it registers a resume task).

### Step 3 — Capture the result

After the bootstrapper completes (pass or fail), find and note:
1. The bootstrapper's exit code
2. The per-phase result JSON at `installer\baremetal\windows\logs\bootstrap-result.json` (or wherever the bootstrapper writes it — check the log output)
3. The specific value of `generation_source` and `generation_model` from the response-letter proof — this is THE critical check:
   - `generation_source == "ollama"` AND `generation_model == "gemma4:e4b"` = PASS (real AI letter generated)
   - anything else = FAIL (template fallback or wrong model)
4. Whether the suite launcher URL `http://localhost:18082` is serving
5. The module URLs the bootstrapper prints at the end (if it reached that stage)

### Step 4 — Write your result

Write `test-comms/TESTER-RESULT-001.md` (template below), commit it to this branch, and push:
```
git add test-comms/TESTER-RESULT-001.md
git commit -m "test: Stage 3A bare-machine live gate result"
git push origin stage-3a-baremetal-windows
```

The dev-machine Claude will poll for this file and render the official verdict.

## Result template

Copy this into `test-comms/TESTER-RESULT-001.md` and fill it in:

```markdown
# Tester Result 001 — CivicSuite Stage 3A bare-machine live gate
**Tester machine:** [describe: Win11 edition, RAM, CPU, was Docker/WSL/Ollama pre-installed?]
**Date/time:** [UTC timestamp]
**Bootstrapper exit code:** [0=pass, nonzero=fail]

## Phase results
- Stage0 (inspect): [passed/failed/skipped — what did it find?]
- Stage1 (WSL2 enable + reboot): [passed/failed/skipped — did a reboot happen?]
- Stage2 (Docker + Ollama install): [passed/failed — were they installed or already present?]
- Stage3 (city-core stack): [passed/failed — did the stack come up?]
- Stage4 (verify): [passed/failed]

## THE CRITICAL CHECK
- generation_source: [ollama / local-template / null / other]
- generation_model: [gemma4:e4b / other / null]
- VERDICT: [PASS — real AI letter generated] OR [FAIL — reason]

## Suite launcher
- http://localhost:18082 serving: [yes/no]
- Module URLs (if shown): [list them]

## Logs / evidence path
[Path to the bootstrap result JSON and any relevant log excerpts]

## Honest notes
[Anything unexpected, errors hit, reboots, time taken, anything that felt wrong]
```

## Hard limits (do not do these)
- Do NOT merge this branch to main
- Do NOT tag anything
- Do NOT advance modules.json status
- Do NOT modify any source code — run the installer as-is, report what happens
