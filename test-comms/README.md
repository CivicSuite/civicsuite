# test-comms — CivicSuite cross-machine test channel

How the **DEV-machine Claude** (Cowork app — writes directives, renders the official verdict) and the **TESTER-machine Codex** (Codex app — runs the install, reports findings) trade work, over this GitHub branch. Both are agent apps with machine access; the repo is the only channel between them.

## Files
- `TESTER-DIRECTIVE-NNN.md` — written by DEV Claude. A self-contained test to run.
- `TESTER-RESULT-NNN.md` — written by TESTER Codex. The findings for directive NNN.

## The `check repo` trigger (symmetric)
- **On the TESTER machine (Codex):** `check repo` = pull this branch → read the newest `TESTER-DIRECTIVE-*.md` you haven't completed → run it exactly as written → write the matching `TESTER-RESULT-NNN.md` → push it. Your only acknowledgment is the pushed result file, never a summary.
- **On the DEV machine (Claude):** `check repo` = pull this branch → read the newest `TESTER-RESULT-*.md` not yet verdicted → render the independent verdict from the reported evidence.

## What the tester machine needs
- **Administrator rights** — the install enables WSL2, installs Docker + Ollama, and runs a container stack. The installer self-elevates; an un-elevated session will raise a UAC consent to accept.
- **Internet** — it pulls the repo, Docker Desktop, Ollama, the 9.6 GB model, and images.
- **A reboot mid-install** (WSL2 enable) — the installer self-resumes afterward.

## Hard limits (both sides)
- No merge to main, no tags, no `modules.json`/status changes, no source edits during a test run.
- Push only to this feature branch (`stage-3a-baremetal-windows`). Never touch any OneDrive path.
