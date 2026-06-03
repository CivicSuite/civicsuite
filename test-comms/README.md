# test-comms — CivicSuite cross-machine test channel

How the **DEV-machine Claude** (Cowork app — writes directives, renders the official verdict) and the **TESTER-machine Codex** (Codex app — runs the install, reports findings) trade work, over this GitHub branch. Both are agent apps with machine access; the repo is the only channel between them.

## Files
- `TESTER-DIRECTIVE-NNN.md` — written by DEV Claude. A self-contained test to run.
- `TESTER-RESULT-NNN.md` — written by TESTER Codex. The findings for directive NNN.

## The `check repo` trigger (symmetric)
- **On the TESTER machine (Codex) — STANDING re-run procedure (no new directive needed each cycle):** `check repo` =
  1. Pull and hard-reset your clone to `origin/stage-3a-baremetal-windows` (test exactly what's published — the installer is being fixed gap-by-gap, so always take the latest).
  2. Confirm `(Get-CimInstance Win32_ComputerSystem).HypervisorPresent` is `True` (VT-x is genuinely on; the installer's own check is a not-yet-fixed false-negative).
  3. Run the bootstrapper end-to-end with the corrected `-HostFactsJson` (real host facts, `virtualization_firmware_enabled=true`) so Stage0 passes; let it self-elevate, install, and **reboot** as many times as needed. After each reboot, re-launch and `check repo` to continue.
  4. When it reaches a terminal point — the AI-letter proof, OR a blocker it can't pass — write the **next-numbered** `TESTER-RESULT-NNN.md` (diagnosis, per-stage results, the critical `generation_source`/`generation_model` check, evidence paths, honest notes) and push it. Your only acknowledgment is the pushed result file, never a summary.
  - A `TESTER-DIRECTIVE-NNN.md` is only written for a SPECIAL one-off test; absent a newer one, the standing procedure above is what `check repo` runs. (Directives 001–003 are history; the procedure here supersedes them.)
- **On the DEV machine (Claude):** `check repo` = pull this branch → read the newest `TESTER-RESULT-*.md` not yet verdicted → render the independent verdict from the reported evidence.

## How the Codex app runs on the tester (operator sets these, not the prompt)
- **Do NOT try to run Codex as administrator — it can't, and it doesn't need to.** The Codex app is a packaged (MSIX) app; its command worker runs at medium integrity by design and stays non-admin no matter how it's launched. That's fine: the **installer self-elevates** a separate `powershell.exe` via `Start-Process -Verb RunAs` (silent on a machine set to elevate admins without prompting). Codex only has to *launch* it.
- **Full Access in the Composer** (not *Default permissions*), set before the task is sent — needed so the worker can clone outside the project folder, spawn the installer process, and reach the network. This is about file/network scope, not integrity level.
- **Internet** — it pulls the repo, Docker Desktop, Ollama, the 9.6 GB model, and images.

## The reboot (important)
The first (non-elevated) bootstrapper invocation returns status `elevation_requested` and exits — expected, not done. The elevated child it spawned does the real work and **reboots the machine once** (WSL2 enable), which ends the Codex session. The install doesn't need Codex to continue: a self-registered Windows resume task finishes the remaining stages elevated after reboot. Once it's done, re-launch Codex (Full Access; admin not required) and `check repo` so it reads the result JSON + lifecycle evidence and pushes the result file. Codex launches and reports; the elevated child + OS resume task do the install.

## Hard limits (both sides)
- No merge to main, no tags, no `modules.json`/status changes, no source edits during a test run.
- Push only to this feature branch (`stage-3a-baremetal-windows`). Never touch any OneDrive path.
