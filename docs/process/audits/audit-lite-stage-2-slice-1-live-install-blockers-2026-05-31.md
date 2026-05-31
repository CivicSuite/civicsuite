# Audit Lite - Stage 2 Slice 1 Live-Install Blockers
**Date:** 2026-05-31
**Scope:** Reviewed the Stage 2 slice that wires city-core shared session secrets into module API containers, removes the suite-launcher Node-only runtime dependency, makes blocked readiness checks return non-zero, lowers the cleanroom disk floor to 25 GB, and prepares Ollama models before live Records AI/CivicCode workflows.
**Reviewer:** Codex (audit-lite)

## TL;DR
This slice is fit to push as the static/contract fix slice. It closes the known local defects in installer wiring and adds focused regression coverage, but it still requires the next runtime slice to prove the built package on Docker with real launcher/login/logout/models/workflows.

## Severity rollup
- Blocker: 0
- Critical: 0
- Major: 0
- Minor: 0
- Nit: 0

## Findings

None.

## What's working
- Correctness/Security: `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\scripts\run-clerk-core-installer.py:618` now injects `CIVICCORE_SUITE_SESSION_SECRET` into Records AI, Clerk, and Code API override files; `tests\test_stage2_live_install_blockers.py:31` asserts all three generated overrides carry the shared session and revocation env.
- Runtime: `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\scripts\plan-installer.py:2034` and `:2394` keep Node serving when available but fall back to Python's stdlib HTTP server, so the launcher no longer depends on operator-installed Node.
- Runtime: `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\scripts\plan-installer.py:4019` returns exit code 1 for blocked readiness output; verified with `python scripts/plan-installer.py --profile city-core --dry-run --show-readiness --readiness-scenario missing-docker`, which returned `exit=1`.
- Runtime: `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\scripts\run-clerk-core-installer.py:708` pulls `nomic-embed-text` and `gemma4:e4b`, then prewarms `gemma4:e4b` with an Ollama run before installer verification, moving the cold-load risk out of the operator's first response-letter workflow.
- Docs/Operator copy: `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\scripts\plan-installer.py:2497` and regenerated package READMEs now state the 25 GB disk floor instead of the stale 60 GB wording.
- Tests: `python -m pytest tests/test_stage2_live_install_blockers.py tests/test_city_core_suite_session_contract.py scripts/policy/test_city_core_suite_session_closeout_contract.py -q` passed with `9 passed, 10 warnings`.
- Static hygiene: `git diff --check` passed.

## Watch items
- The response-letter timeout is mitigated by model pull plus LLM prewarm in this slice, but the proof remains the next runtime slice: build the package and run the real Records AI response-letter workflow against Docker evidence.
- The generated `civicsuite-launcher-config.js` files are newly included because `index.html` loads that script before `src/app.js`; omitting them would keep the static launcher fallback from serving the complete package.

## Escalation recommendation
No audit-team escalation for this slice. The scope is narrow and covered by static/contract tests; runtime proof belongs to the next Stage 2 slice before any handoff to Claude.
