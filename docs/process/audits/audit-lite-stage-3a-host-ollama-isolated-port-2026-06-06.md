# Audit Lite - Stage 3A Host Ollama Isolated Port
**Date:** 2026-06-06
**Scope:** Reviewed the Stage 3A installer change that responds to `TESTER-RESULT-038.md` by adding a configurable host-Ollama endpoint and isolated `ollama serve` startup path.
**Reviewer:** Codex (audit-lite)

## TL;DR
Ship this slice to the tester. The prior gate was blocked by inaccessible stale workers on the default host-Ollama service; this change lets readiness and runtime containers use a separate host-Ollama port so the product is not tied to a poisoned default service.

## Severity rollup
- Blocker: 0
- Critical: 0
- Major: 0
- Minor: 0
- Nit: 0

## Findings
None.

## What's working
- Correctness: `scripts/run-clerk-core-installer.py:498` centralizes host-Ollama local/container base URLs, and `scripts/run-clerk-core-installer.py:523` can start `ollama serve` on the configured endpoint.
- Runtime wiring: `scripts/run-clerk-core-installer.py:1915` rewrites runtime `docker-compose.host-ollama.yml` to `host.docker.internal:<configured-port>` so service containers and readiness use the same Ollama server.
- CLI: `--host-ollama-port` allows clean-machine tests to avoid a stale default `11434` service without changing the model or generation-source gate.
- Tests: `tests/test_stage2_live_install_blockers.py` covers configured HTTP probe URL, isolated server startup env, and runtime compose port rewrite.
- Verification: `python -m pytest tests\test_stage2_live_install_blockers.py -q` passed 49/49; `python scripts\verify-installer-plan.py` and `python scripts\verify-suite-state.py --remote-only` passed.

## Escalation recommendation
No escalation needed for this slice. The tester should rerun on an isolated host-Ollama port and report whether the separate server avoids the stale default workers.
