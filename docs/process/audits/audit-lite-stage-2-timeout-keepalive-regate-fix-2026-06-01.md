# Audit Lite - Stage 2 Timeout / Keep-Alive Re-Gate Fix
**Date:** 2026-06-01
**Scope:** Reviewed the umbrella installer changes for the clean-VM response-letter timeout regression: `scripts/run-clerk-core-installer.py`, `scripts/plan-installer.py`, `tests/test_stage2_live_install_blockers.py`, `installer/modules.json`, generated city-core artifacts, and user-facing docs/manual artifacts.
**Reviewer:** Codex (audit-lite)

## TL;DR
Ship this scoped slice to the branch for independent clean-VM re-gate. The previous 8-second Records AI LLM timeout and 90-second install prewarm budget were too short for CPU-hosted `gemma4:e4b`; this slice keeps waits bounded while making the real Ollama response-letter path viable. The minor readiness fail-open issue is also closed by blocking when host RAM cannot be detected.

## Severity rollup
- Blocker: 0
- Critical: 0
- Major: 0
- Minor: 0
- Nit: 0

## Findings

None.

## What's working
- `scripts/run-clerk-core-installer.py` now writes `RESPONSE_LETTER_LLM_TIMEOUT_SECONDS=120`, configures `OLLAMA_KEEP_ALIVE=30m`, and raises model prewarm to a bounded 300 seconds.
- `scripts/plan-installer.py` now fails closed when memory detection returns `None`, while recording `memory_bytes: 0` and `memory_detected: false` in readiness evidence.
- `tests/test_stage2_live_install_blockers.py` covers the new timeout, keep-alive, 300-second prewarm budget, and undetectable-RAM fail-closed path.
- `installer/modules.json` pins CivicRecords AI to `cddc4d2be856badfbc7c6bdd26917a34ef535677`, the pushed Records AI timeout/keep-alive commit.
- Generated city-core `0.1.2` artifacts were regenerated with `CIVICSUITE_SOURCE_ROOT_CIVICRECORDS_AI=C:\dev\Claude\civicrecords-ai-stage2-response-letter`.

## Verification
- `python -m pytest tests/test_stage2_live_install_blockers.py -q` -> 20 passed, 1 warning.
- `bash scripts/verify-docs.sh` -> PASS.
- `git diff --check` -> passed.
- `python scripts/gen-user-manual.py` -> regenerated `USER-MANUAL.pdf` and `USER-MANUAL.docx`.
- `pandoc USER-MANUAL.md -t plain -o USER-MANUAL.txt` -> regenerated plain-text manual, then trailing whitespace was trimmed.
- `python scripts/plan-installer.py --profile city-core --dry-run --generate-release-artifacts --package-platform all --installer-version 0.1.2` with `CIVICSUITE_SOURCE_ROOT_CIVICRECORDS_AI=C:\dev\Claude\civicrecords-ai-stage2-response-letter` -> regenerated release artifacts and checksums.

## Watch items

The release evidence still depends on Claude's independent clean-VM re-gate proving that the regenerated artifact returns `generation_source=ollama` and `generation_model=gemma4:e4b` under the CPU-hosted path. This audit does not claim that external gate has passed.

## Escalation recommendation

No escalation needed for this scoped diff. The required next gate is the already-planned independent clean-VM re-gate, not a broader Codex audit.
