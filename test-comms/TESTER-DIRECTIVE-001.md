# Tester Directive 001 — CivicSuite Stage 3A bare-machine live gate
**From:** Claude (dev machine) · **To:** Codex (test machine) · **Date:** 2026-06-02 · **Status:** AWAITING EXECUTION

## Goal
On THIS fresh Windows 11 machine (full admin, no prior CivicSuite/dev work), run the CivicSuite city-core **bare-metal installer** end to end and PROVE the AI response-letter generates live. Your single deliverable is a committed + pushed `test-comms/TESTER-RESULT-001.md` containing the real evidence. This is a release gate — report honestly; optimism is failure.

## Run requirements (these gate the whole task — confirm before starting)
- **Network access is REQUIRED.** This clones a repo and downloads Docker Desktop, Ollama, a 9.6 GB model, and container images. In a default workspace-write / network-off sandbox these WILL halt at the boundary. This task must run with network granted (full-access run mode).
- **Admin/elevation is REQUIRED.** Run from an ALREADY-ELEVATED shell so the bootstrapper's self-elevation check passes without an interactive UAC prompt it can't answer headless.
- **A reboot WILL happen** mid-install (when WSL2 is enabled). The bootstrapper registers a self-terminating resume task that continues after the reboot. After the machine returns, re-invoke (or `check repo`) so it finishes and you can capture the result.

## Steps
1. Clone (or pull) the repo + branch:
   `git clone https://github.com/CivicSuite/civicsuite.git --branch stage-3a-baremetal-windows --single-branch civicsuite-gate`
   `cd civicsuite-gate`  (if it already exists, `git -C civicsuite-gate fetch && git -C civicsuite-gate reset --hard origin/stage-3a-baremetal-windows`)
2. From the elevated shell, run the bare-metal bootstrapper:
   `powershell -ExecutionPolicy Bypass -File installer\baremetal\windows\civicsuite-baremetal-bootstrap.ps1`
   It runs Stage0 inspect → Stage1 WSL2 enable (+reboot) → Stage2 Docker+Ollama install → Stage3 city-core stack → Stage4 verify. Let it complete (resume after the reboot).
3. Capture — from the bootstrapper's own output and its result JSON (it prints/writes the path; look under `installer\baremetal\windows\logs\` or wherever its output says):
   - bootstrapper exit code
   - per-phase status (Stage0–4)
   - **THE CRITICAL CHECK** — the response-letter proof's `generation_source` and `generation_model`. PASS only if `generation_source == "ollama"` AND `generation_model == "gemma4:e4b"` (a real AI-generated letter). Anything else (`local-template`, `null`, wrong model) = FAIL.
   - suite launcher `http://localhost:18082` serving? + the module URLs it prints.
4. Write `test-comms/TESTER-RESULT-001.md` (template below), then commit + push:
   `git add test-comms/TESTER-RESULT-001.md`
   `git commit -m "test: Stage 3A bare-machine live gate result"`
   `git push origin stage-3a-baremetal-windows`

## Done-when (do not stop before this)
`test-comms/TESTER-RESULT-001.md` is committed AND pushed to `stage-3a-baremetal-windows`, filled with the actual `generation_source`/`generation_model` values and per-phase results. **Do not reply with a summary of this directive — your only acknowledgment is the pushed result file.** If you hit a hard blocker (no network grant, can't elevate, bootstrapper crashes unrecoverably), write what you got plus the blocker into the result file and push THAT — a pushed honest failure is the deliverable, silence is not.

## Result template — copy into `test-comms/TESTER-RESULT-001.md` and fill in
```markdown
# Tester Result 001 — CivicSuite Stage 3A bare-machine live gate
**Tester machine:** [Win11 edition, RAM, CPU; was Docker/WSL/Ollama pre-installed?]
**Date/time (UTC):** [...]
**Bootstrapper exit code:** [0=pass, nonzero=fail]

## Phase results
- Stage0 (inspect): [passed/failed/skipped — findings]
- Stage1 (WSL2 enable + reboot): [passed/failed — did a reboot happen + resume?]
- Stage2 (Docker + Ollama install): [passed/failed — installed or already present?]
- Stage3 (city-core stack): [passed/failed — did the 12-container stack come up healthy?]
- Stage4 (verify): [passed/failed]

## THE CRITICAL CHECK
- generation_source: [ollama / local-template / null / other]
- generation_model: [gemma4:e4b / other / null]
- VERDICT: [PASS — real AI letter] OR [FAIL — reason]

## Suite launcher
- http://localhost:18082 serving: [yes/no]
- Module URLs: [list]

## Evidence path
[path to the bootstrap result JSON + key log excerpts]

## Honest notes
[anything unexpected: errors, reboots, time taken, anything that felt wrong]
```

## Hard limits
No merge to main, no tags, no `modules.json`/status changes, no source edits (run the installer AS-IS — report what happens). Push only to `stage-3a-baremetal-windows`. Never touch OneDrive paths.
