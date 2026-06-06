# Engineering Deep-Dive - Stage 3A Proven-Suite Local Integration

**Audit date:** 2026-06-05
**Role:** Principal Engineer
**Scope audited:** installer runtime generation, package planner, suite-state verifier, manifest, focused tests
**Auditor posture:** Balanced

## TL;DR

The engineering slice is sound after fixes made during audit. Launcher config now follows actual lifecycle isolation ports, CivicCode opens the user-facing HTML surface, and remote-only source-pin verification accepts staged GitHub-resolvable commits without requiring default-branch promotion. No unresolved engineering findings remain.

## Severity Roll-Up

| Severity | Count |
|---|---:|
| Blocker | 0 |
| Critical | 0 |
| Major | 0 |
| Minor | 0 |
| Nit | 0 |

## What's Working

- `scripts/run-clerk-core-installer.py` writes selected launcher modules from runtime lifecycle context.
- `scripts/plan-installer.py` preserves bundle/source commit semantics and package launcher config.
- `scripts/verify-suite-state.py` now verifies staged source pins as GitHub-resolvable commits.
- `installer/modules.json` keeps `full-suite` disabled while enabling the bounded `proven-suite` local integration profile.

## What Couldn't Be Assessed

The clean Windows machine was not available inside this local audit.

## Findings

No unresolved engineering findings.

## Fixed During Audit

- CivicCode launcher route changed from the API root to `/civiccode`.
- Isolated launcher config now uses actual port-offset lifecycle ports.
- Local install provenance was refreshed by running installer repair after `installer/modules.json` changed.
- Remote-only source-pin verification now accepts GitHub-resolvable staged source commits.

## Appendix: Artifacts Reviewed

- `scripts/run-clerk-core-installer.py`
- `scripts/plan-installer.py`
- `scripts/verify-suite-state.py`
- `installer/modules.json`
- `tests/test_stage2_live_install_blockers.py`
- `installer/runtime/suite-launcher/src/app.js`
