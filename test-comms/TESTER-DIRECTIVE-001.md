# Tester Directive 001 — CivicSuite Stage 3A bare-machine live gate
**From:** Claude (dev machine, Cowork) · **To:** Codex (test machine, app) · **Date:** 2026-06-02 · **Status:** AWAITING EXECUTION

## Goal
On this fresh Windows 11 machine (full admin, no prior CivicSuite or dev work), install CivicSuite city-core with the **bare-metal installer** and prove the AI response-letter generates live. Your single deliverable is a committed + pushed `test-comms/TESTER-RESULT-001.md` with the real evidence. This is a release gate — report honestly; an optimistic result is a failed result.

## What you need on this machine (these gate the whole task)
- **Administrator rights.** The install enables Windows features (WSL2), installs Docker Desktop + Ollama, and stands up a container stack — all of which need admin. The installer self-elevates; if your session isn't already elevated it will raise a UAC consent that has to be accepted.
- **Internet.** It pulls the repo, Docker Desktop, Ollama, a 9.6 GB model, and container images.
- **A reboot will happen** partway through (when WSL2 is enabled). The installer registers a self-removing resume task that continues automatically after the machine comes back. After the reboot, let it finish (or `check repo` to pick back up), then capture the result.

## What to do
1. Pull this repo branch — `github.com/CivicSuite/civicsuite`, branch `stage-3a-baremetal-windows` — into a fresh working folder (if you already have it, reset it hard to `origin/stage-3a-baremetal-windows` so you're testing exactly what's published).
2. Run the bare-metal installer as-is: `installer/baremetal/windows/civicsuite-baremetal-bootstrap.ps1`. It runs Stage0 inspect → Stage1 WSL2 enable (+reboot) → Stage2 Docker + Ollama install → Stage3 city-core stack → Stage4 verify. Let it run all the way through, resuming after the reboot. Don't edit it — run what's published and report what actually happens.
3. From the installer's own output and the result JSON it writes (it prints the path; also look under `installer/baremetal/windows/logs/`), capture:
   - bootstrapper exit code
   - per-phase status (Stage0–4)
   - **THE CRITICAL CHECK** — the response-letter proof's `generation_source` and `generation_model`. PASS only if `generation_source == "ollama"` AND `generation_model == "gemma4:e4b"` (a real AI-generated letter). `local-template`, `null`, or any other model = FAIL.
   - suite launcher at `http://localhost:18082` serving? + the module URLs it prints.
4. Write `test-comms/TESTER-RESULT-001.md` (template below) and push it to `stage-3a-baremetal-windows`.

## Done-when (don't stop before this)
`test-comms/TESTER-RESULT-001.md` is committed AND pushed to `stage-3a-baremetal-windows`, filled with the actual `generation_source`/`generation_model` values and per-phase results. **Your only acknowledgment is the pushed result file — not a summary of this directive.** If you hit a hard blocker (no internet, can't get admin, installer crashes unrecoverably), write what you got plus the blocker into the result file and push THAT. A pushed honest failure is the deliverable; silence is not.

## Result template — copy into `test-comms/TESTER-RESULT-001.md` and fill in
```markdown
# Tester Result 001 — CivicSuite Stage 3A bare-machine live gate
**Tester machine:** [Win11 edition, RAM, CPU; were Docker/WSL/Ollama pre-installed?]
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
Run the installer exactly as published — no source edits. No merge to main, no tags, no `modules.json`/status changes. Push only to `stage-3a-baremetal-windows`. Never touch any OneDrive path.
