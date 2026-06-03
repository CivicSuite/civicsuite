# test-comms — CivicSuite cross-machine test channel

Transport for trading test directives + results between the **DEV-machine Claude** (writes directives, renders the official verdict) and the **TESTER-machine Codex** (runs the install, reports findings), over this GitHub branch. No other infrastructure — the repo IS the channel.

## Files
- `TESTER-DIRECTIVE-NNN.md` — written by DEV Claude. A self-contained test to run.
- `TESTER-RESULT-NNN.md` — written by TESTER Codex. The findings for directive NNN.

## The `check repo` trigger (symmetric)
- **On the TESTER machine (Codex),** `check repo` = `git fetch` this branch → read the newest `TESTER-DIRECTIVE-*.md` you haven't completed → execute it exactly → write the matching `TESTER-RESULT-NNN.md` → `git commit` + `git push`. Your only acknowledgment is the pushed result file, never a summary.
- **On the DEV machine (Claude),** `check repo` = `git fetch` this branch → read the newest `TESTER-RESULT-*.md` not yet verdicted → render the independent verdict from the reported evidence.

## Tester run requirements (Codex)
- **Network access required** (clone + download Docker/Ollama/model/images) — default network-off sandbox will halt; run with network granted.
- **Admin/elevation required** — run from an already-elevated shell so the bootstrapper doesn't hit an unanswerable UAC prompt.
- **Expect a reboot** mid-install (WSL2 enable); the bootstrapper self-resumes.

## Hard limits (both sides)
- No merge to main, no tags, no `modules.json`/status changes, no source edits during a test run.
- Push only to this feature branch (`stage-3a-baremetal-windows`). Never touch OneDrive paths.
