# Audit Lite - Stage 0 User Manual Topology

**Date:** 2026-05-30
**Scope:** Documentation fix slice for `C:\Users\scott\OneDrive\Desktop\Claude\CivicSuite-live-install-fix-2026-05-29\USER-MANUAL.md`, regenerating the suite topology from `installer\modules.json`.
**Reviewer:** Codex (audit-lite)

## TL;DR

Ship this slice. CI `verify` failed because the generated topology block still showed the old CivicCode source prefix. Running `python scripts\docs\render_topology.py --write` updated the block to `a960bba0a224`, and `bash scripts/verify-docs.sh` now passes locally.

## Severity rollup

- Blocker: 0
- Critical: 0
- Major: 0
- Minor: 0
- Nit: 0

## Findings

No open findings after the second pass.

Resolved during this audit:

### STAGE0-DOC-LITE-001 Major: USER-MANUAL topology block lagged installer/modules.json

**Dimension:** Docs / Runtime
**Evidence:** PR #186 `verify` run `26696103053` failed `bash scripts/verify-docs.sh` with `FAIL: USER-MANUAL.md topology block is stale. Run python scripts/docs/render_topology.py --write`.
**Why it matters:** The user manual is a public truth surface. A stale source commit in the topology table contradicts the restored city-core source pin.
**Fix path:** Ran `python scripts\docs\render_topology.py --write`, changing the CivicCode topology source prefix from `9284fd1a0704` to `a960bba0a224`.
**Blast radius:** User-manual topology only; no product runtime path changes.

## What's working

- The docs verifier caught the stale generated block before merge.
- The generated topology is sourced from `installer\modules.json`, avoiding manual retyping.

## Watch items

- Stage 1 should run `python scripts\docs\render_topology.py --check` after any `installer\modules.json` change.

## Escalation recommendation

No escalation needed. Continue with local docs verification, commit, push, and PR checks.

