# Audit Lite — Stage 2 Slice 1: ADR-0008, ADR-0009, architecture index, plan gate
**Date:** 2026-06-10
**Scope:** New files `docs/architecture/ADR-0008-portable-native-windows-runtime.md`, `docs/architecture/ADR-0009-postgres-backed-queue-windows-profile.md`, two index rows in `docs/architecture/index.md`, and `.claude/plans/2026-06-10-civicsuite-phase-0-foundation.md` (plan-gate copy).
**Reviewer:** Claude (audit-lite)

## TL;DR
Ship. Both ADRs follow the house style (Status/Date/Context/Decision/Boundaries/Consequences), make falsifiable claims, and cross-reference each other consistently. Two pre-commit findings (sensitive content in the public plan copy; one project-identifying reference) were fixed during this pass and verified gone.

## Severity rollup
- Blocker: 0
- Critical: 0
- Major: 0 (1 found and fixed pre-commit)
- Minor: 0 (1 found and fixed pre-commit)
- Nit: 0

## Findings

### FINDING-001 Major (FIXED pre-commit): Plan copy carried private account/resource details into a public repo
**Dimension:** Correctness & Security
**Evidence:** `.claude/plans/2026-06-10-civicsuite-phase-0-foundation.md` originally embedded the owner's GitHub billing posture (remaining Actions minutes, LFS quota), local drive free-space figures, sibling-project workspace paths, and a VM password-location note.
**Why it matters:** This repo is public; account resource posture and machine layout are not for publication.
**Fix path:** Applied — authorizations paragraph generalized, isolation contract de-specified, credentials note moved off-repo. Verified by grep: no billing figures, no sibling-project paths, no password references remain.

### FINDING-002 Minor (FIXED pre-commit): ADR-0008 plan text named a sibling project as pattern proof
**Dimension:** Docs
**Evidence:** Plan Task 5 quoted draft ADR text citing the sibling project by name; the committed ADR-0008 says "a sibling project on the same development hardware."
**Why it matters:** Suite docs should not depend on or advertise unrelated projects.
**Fix path:** Applied — both the ADR and the plan copy use the anonymous form.

## What's working
- ADR-0008's Context states the acceptance test (clerk double-click on stock Windows) concretely enough to be falsifiable, and Boundaries explicitly preserves the Linux container profile — no scope bleed.
- ADR-0009 names the load-bearing trade (one stateful service instead of two) and binds modules to the `civiccore.tasks` abstraction with a lint-enforceable rule, which is what makes backend parity testable later.
- Index rows match filename and title exactly; links resolve (verified by `bash scripts/verify-docs.sh` PASS in the CI-equivalent WSL environment).

## Watch items
- ADR-0009 commits CivicCore to backend-parity contract tests; when `civiccore.tasks` is built, that promise must land in the same PR as the implementation or it becomes the next "empty placeholder" pattern.

## Escalation recommendation
No escalation needed. Docs-only slice; both findings were fixed and verified within the pass.
