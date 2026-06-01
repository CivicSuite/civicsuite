# Audit Lite - Stage 2 C1/M1-M4 Installer Hardening
**Date:** 2026-06-01
**Scope:** Reviewed the umbrella diff for C1 local-AI readiness/proof hardening, M1 behavioral tests, M2 existing-stack provenance, M3 streamed-process handling, M4 model-vs-template assertion, and related operator docs.
**Reviewer:** Codex (audit-lite)

## TL;DR
Ship this slice after commit/push. The false-positive path is closed: model-load failures are required failures, response-letter workflow proof requires `generation_source=ollama` and `generation_model=gemma4:e4b`, existing-stack verification is bound to install provenance, and process timeout/unknown-returncode handling is tested behaviorally. One generated-artifact whitespace issue was found and fixed before this report.

## Severity rollup
- Blocker: 0
- Critical: 0
- Major: 0
- Minor: 0
- Nit: 0

## Findings
None unresolved.

## Fixed During Audit
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\USER-MANUAL.txt` had trailing whitespace from Pandoc's plain-text table render. The generated text artifact was trimmed and `git diff --check` now passes.

## What's working
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\scripts\run-clerk-core-installer.py:840` keeps slow Ollama prewarm as a warning but makes non-zero model-load failures required failures.
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\scripts\run-clerk-core-installer.py:1527` records and enforces response-letter generation source/model during workflow proof.
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\scripts\run-clerk-core-installer.py:411` verifies `civicsuite-install-provenance.json` before existing-stack proof can pass.
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\scripts\run-installer-package-cleanroom.py:80` waits after kill and treats unknown return code as failure.
- `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\tests\test_stage2_live_install_blockers.py` now exercises the failure branches directly instead of only grepping source strings.

## Runtime
- `python -m pytest tests/test_stage2_live_install_blockers.py -q`
- Result: 17 passed.
- `python scripts/plan-installer.py --profile city-core --dry-run --show-readiness --readiness-scenario low-resources`
- Result: exit 1 as expected, readiness status `blocked`, with 12 GB `gemma4:e4b` fix steps.
- `git diff --check`
- Result: passed after trimming `USER-MANUAL.txt`.

## Escalation recommendation
No new escalation from this slice. The full Stage 2 branch still requires the independent clean-VM re-gate after all sprint-punchlist fixes are pushed.
