# Audit Lite - Host Ollama crash recovery

**Date:** 2026-06-06
**Scope:** Review of the Stage 3A readiness fix for Windows host-Ollama `llama-server` crash recovery after `TESTER-RESULT-050.md`.
**Reviewer:** Codex (audit-lite)

## TL;DR

Ship this fix to the test branch. The readiness probe now treats a Windows `llama-server` worker crash as a recoverable profile failure: it records the crash, cleans up workers, stops the managed isolated Ollama server, restarts it, and continues to the next bounded profile. The change is covered by a behavioral regression test matching the reported `0xc0000409` failure class.

## Severity rollup

- Blocker: 0
- Critical: 0
- Major: 0
- Minor: 0
- Nit: 0

## Findings

No findings.

## What's working

- `scripts/run-clerk-core-installer.py` now detects `llama-server process has terminated`, `0xc0000409`, stack-buffer crash text, and `ollama_llama_server` crash markers.
- Crash recovery records `crash_detected`, cleanup evidence, managed-server stop evidence, and restarted-server evidence in the readiness attempts list.
- Recovery continues to the next profile instead of marking the entire host-Ollama readiness gate failed after a single crashed profile.
- `tests/test_stage2_live_install_blockers.py` includes a mutation-targeted test proving a native-default crash can recover through `cpu_mmap_default`.
- The touched-file stale Ruff findings were cleaned by removing unused `bundled` and `sibling` locals in the same runner file.

## Verification

- `python -m pytest tests\test_stage2_live_install_blockers.py -q -k "host_ollama_generate"`: 5 passed
- `python -m pytest tests\test_stage2_live_install_blockers.py -q`: 62 passed
- `python -m ruff check scripts\run-clerk-core-installer.py tests\test_stage2_live_install_blockers.py`: passed
- `python scripts\verify-suite-state.py --remote-only`: passed
- `python scripts\verify-installer-plan.py`: passed

## Watch items

- The next tester run must confirm this recovery path works against the real Windows/Ollama crash, not only the synthetic regression.
- If every profile crashes after restart, the gate should still fail with recorded attempts; that remains intentional.

## Escalation recommendation

No escalation needed. This is a scoped readiness recovery fix with targeted behavioral coverage and full installer-gate verification.
