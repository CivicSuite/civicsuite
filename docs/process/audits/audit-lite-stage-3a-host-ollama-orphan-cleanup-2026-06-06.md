# Audit Lite - Stage 3A Host Ollama Orphan Cleanup
**Date:** 2026-06-06
**Scope:** Reviewed the Stage 3A installer change that responds to `TESTER-RESULT-036.md` by cleaning stale host-Ollama `llama-server` workers before and between readiness/prewarm profile attempts.
**Reviewer:** Codex (audit-lite)

## TL;DR
Ship this slice to the tester. The prior result showed `ollama ps` empty while multiple `llama-server` processes remained, so this change makes the installer clear stale host-Ollama workers before attempting a real `gemma4:e4b` load.

## Severity rollup
- Blocker: 0
- Critical: 0
- Major: 0
- Minor: 0
- Nit: 0

## Findings
None.

## What's working
- Correctness: `scripts/run-clerk-core-installer.py:618` runs API unload plus stale `llama-server`/`ollama_llama_server` termination before the ladder and after failed profiles.
- Safety: the cleanup is scoped to host-Ollama model worker processes; it does not uninstall Ollama, delete models, change Docker state, or mutate project data.
- Evidence: readiness and install prewarm records include `initial_cleanup`, per-attempt unload results, and per-attempt orphan-server stop evidence.
- Tests: `tests/test_stage2_live_install_blockers.py:328` proves cleanup runs before the first profile and after every failed profile; `tests/test_stage2_live_install_blockers.py:400` proves Windows taskkill targets.
- Verification: `python -m pytest tests\test_stage2_live_install_blockers.py -q` passed 46/46; `python scripts\verify-installer-plan.py` and `python scripts\verify-suite-state.py --remote-only` passed.

## Escalation recommendation
No escalation needed for this slice. If this still fails on the tester, the next likely blocker is host/model compatibility rather than stale process contamination.
