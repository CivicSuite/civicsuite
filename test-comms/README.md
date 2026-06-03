# test-comms — CivicSuite cross-machine test channel

Transport for trading test directives + results between the **DEV-machine Claude** (writes directives, renders verdicts) and the **TESTER-machine Claude** (runs the install, reports findings), over this GitHub branch. No other infrastructure — the repo IS the channel.

## Files
- `TESTER-DIRECTIVE-NNN.md` — written by DEV Claude. A self-contained test to run.
- `TESTER-RESULT-NNN.md` — written by TESTER Claude. The findings for directive NNN.

## The `check repo` trigger (symmetric)
- **On the TESTER machine,** `check repo` = `git fetch` this branch → read the newest `TESTER-DIRECTIVE-*.md` you haven't completed → execute it exactly → write the matching `TESTER-RESULT-NNN.md` → `git commit` + `git push`.
- **On the DEV machine,** `check repo` = `git fetch` this branch → read the newest `TESTER-RESULT-*.md` not yet verdicted → render the independent verdict.
- Neither side trusts the other's self-report blindly. The DEV side renders the official verdict from the reported evidence.

## Hard limits (both sides)
- No merge to main, no tags, no `modules.json`/status changes, no source edits during a test run.
- Push only to this feature branch (`stage-3a-baremetal-windows`).
- Never touch any OneDrive path.
