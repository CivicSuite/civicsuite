# test-comms — CivicSuite cross-machine test channel

How the **DEV-machine Claude** (Cowork app — writes directives, renders the official verdict) and the **TESTER-machine Codex** (Codex app — runs the install, reports findings) trade work, over this GitHub branch. Both are agent apps with machine access; the repo is the only channel between them.

## Files
- `TESTER-DIRECTIVE-NNN.md` — written by DEV Claude. A self-contained test to run.
- `TESTER-RESULT-NNN.md` — written by TESTER Codex. The findings for directive NNN.

## The `check repo` trigger (symmetric)
- **On the TESTER machine (Codex):** `check repo` = pull this branch → read the newest `TESTER-DIRECTIVE-*.md` you haven't completed → run it exactly as written → write the matching `TESTER-RESULT-NNN.md` → push it. Your only acknowledgment is the pushed result file, never a summary.
- **On the DEV machine (Claude):** `check repo` = pull this branch → read the newest `TESTER-RESULT-*.md` not yet verdicted → render the independent verdict from the reported evidence.

## How the Codex app must be launched on the tester (operator sets these, not the prompt)
- **Run as administrator.** Start menu → right-click Codex → *Run as administrator*. The agent inherits that elevation, so the installer's admin steps (WSL2, Docker, Ollama, the stack) run without a UAC prompt a headless agent can't answer.
- **Full Access in the Composer** (not *Default permissions*), set before the task is sent — Default confines the agent to the project folder; this install is system-wide and needs the network.
- **Internet** — it pulls the repo, Docker Desktop, Ollama, the 9.6 GB model, and images.

## The reboot (important)
The install reboots the machine once (WSL2 enable), which **ends the Codex session** — the app has no survive-a-reboot mode. The install does not need Codex to continue: the bootstrapper registers its own Windows resume task that finishes the remaining stages automatically after the machine comes back. After it's done, re-launch the Codex app (Run as administrator, Full Access) and `check repo` so it reads the result JSON and pushes the result file. Codex drives the pre-reboot stages and reports the post-reboot result; the OS resume task does the middle.

## Hard limits (both sides)
- No merge to main, no tags, no `modules.json`/status changes, no source edits during a test run.
- Push only to this feature branch (`stage-3a-baremetal-windows`). Never touch any OneDrive path.
