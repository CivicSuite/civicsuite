# Tester Directive 001 — CivicSuite Stage 3A bare-machine live gate
**From:** Claude (dev machine, Cowork) · **To:** Codex (test machine, app) · **Date:** 2026-06-02 (rev 2) · **Status:** AWAITING EXECUTION

## Goal
On this Windows 11 machine, install CivicSuite city-core with the **bare-metal installer** and prove the AI response-letter generates live. Your single deliverable is a committed + pushed `test-comms/TESTER-RESULT-001.md` with the real evidence. This is a release gate — report honestly; an optimistic result is a failed result.

## Run mode — IMPORTANT, this changed
- **You do NOT need to be elevated. Do not try to make this Codex session run as administrator.** The Codex app is a packaged (MSIX) app; its command worker runs at medium integrity by design and cannot be elevated — that is expected and does not matter here. **The installer elevates itself** (see below). Earlier guidance to "stop if not admin" was wrong — ignore it.
- **Set the Composer to Full Access** (not Default permissions) before you start. You still need this so you can clone outside the project folder, spawn the installer process, and reach the network. Full Access is about file/network scope, not your integrity level.
- **Internet required** — clones the repo and downloads Docker Desktop, Ollama, a 9.6 GB model, and images.

## How elevation actually works here (read this)
When you run the bootstrapper as a non-admin, its `Ensure-Elevated` step relaunches **a separate `powershell.exe` via `Start-Process -Verb RunAs`** (NOT the Codex app). On this machine that elevates **silently — no UAC prompt** — to a real High-integrity process that does the actual install. You already proved this exact call works (`Start-Process -Verb RunAs powershell.exe` → `Admin check: True`).
- The FIRST (non-elevated) invocation will write result status **`elevation_requested`** and exit 0. **This is EXPECTED — it is NOT completion and NOT a failure.** The real work runs in the elevated child it spawned.
- The elevated run performs Stage0→4, **reboots the machine once** (WSL2 enable), and a self-registered Windows resume task finishes the remaining stages elevated after reboot — all without Codex.

## What to do
1. Pull this repo branch — `github.com/CivicSuite/civicsuite`, branch `stage-3a-baremetal-windows` — into a fresh folder (if it exists, hard-reset to `origin/stage-3a-baremetal-windows` so you test exactly what's published).
2. Run the installer as-is: `installer/baremetal/windows/civicsuite-baremetal-bootstrap.ps1`. Do not edit it. Expect `elevation_requested` from the first invocation and a reboot during the elevated run.
3. After the machine is back and the elevated install has finished (when I relaunch you and say `check repo`), read its outputs from your repo clone:
   - bootstrapper result JSON: `installer/baremetal/windows/logs/civicsuite-baremetal-bootstrap-result.json` (exit status + per-stage results)
   - **THE CRITICAL CHECK** — the response-letter proof at `installer/reports/stage3a-baremetal/clerk-core-installer-lifecycle.json`: its `generation_source` and `generation_model`. PASS only if `generation_source == "ollama"` AND `generation_model == "gemma4:e4b"`. `local-template`, `null`, or any other model = FAIL.
   - suite launcher at `http://localhost:18082` serving? + the module URLs.
4. Write `test-comms/TESTER-RESULT-001.md` (template below), replacing the prior blocker result, and push it to `stage-3a-baremetal-windows`.

## Done-when (don't stop before this)
`test-comms/TESTER-RESULT-001.md` committed AND pushed to `stage-3a-baremetal-windows`, filled with the actual `generation_source`/`generation_model` values and per-stage results. **Your only acknowledgment is the pushed result file — not a summary.** If you hit a hard blocker (no internet, the elevated child never runs, installer crashes unrecoverably), write what you got plus the blocker into the result file and push THAT.

## Result template — copy into `test-comms/TESTER-RESULT-001.md` and fill in
```markdown
# Tester Result 001 — CivicSuite Stage 3A bare-machine live gate
**Tester machine:** [Win11 edition + build, RAM, CPU; were Docker/WSL/Ollama pre-installed?]
**Date/time (UTC):** [...]
**Bootstrapper result status:** [passed / failed / elevation_requested-then-? — describe]

## Phase results (from the elevated run)
- Stage0 (inspect): [passed/failed — findings; did the Windows-version check pass on this Build?]
- Stage1 (WSL2 enable + reboot): [passed/failed — did it reboot + resume?]
- Stage2 (Docker + Ollama install): [passed/failed]
- Stage3 (city-core stack): [passed/failed — 12 containers healthy?]
- Stage4 (verify): [passed/failed]

## THE CRITICAL CHECK
- generation_source: [ollama / local-template / null / other]
- generation_model: [gemma4:e4b / other / null]
- VERDICT: [PASS — real AI letter] OR [FAIL — reason]

## Suite launcher
- http://localhost:18082 serving: [yes/no]
- Module URLs: [list]

## Evidence path
[paths to bootstrap result JSON + lifecycle evidence JSON + key log excerpts]

## Honest notes
[anything unexpected: elevation behavior, reboot/resume, time taken, anything that felt wrong]
```

## Hard limits
Run the installer exactly as published — no source edits. No merge to main, no tags, no `modules.json`/status changes. Push only to `stage-3a-baremetal-windows`. Never touch any OneDrive path.
