# CivicAccess City-Core Depth Re-Probe — 2026-06-29

**Verdict: PASS.** This re-probe formally reverses the 2026-05-23 NEEDS-WORK depth-probe demotion
(branch `probe/civicaccess-depth-2026-05-23`) and licenses adding CivicAccess to the city-core
profile as the sixth module. It is the evidence gate (`reprobe_pass`) required by the Phase C
manifest (`docs/roadmap/civicaccess-citycore-integration/phase-C-citycore-profile-flip.manifest.yaml`).

- **Module:** CivicAccess `v0.4.0` (`CivicSuite/civicaccess`, source_commit `7b24516fd89584d84c12394b9385eddd1e8c6897`)
- **Platform pin:** CivicCore `v1.2.0`
- **Scope:** registry/truth milestone. The full clean-VM accessibility Definition of Done is Phase D.

## Why the demotion existed

On 2026-05-23 a depth probe recorded a NEEDS-WORK verdict against CivicAccess (then `v0.2.0`
source truth, after a false `v1.0.0` release). The open gaps were: #1 clean install on the pinned
CivicCore wheel, #2 staff/public authz boundary on persistent writes, #3 module audit logging,
#4 backup/restore proof, #5 desktop runtime/registry wiring, #6 clean-VM browser QA + accessibility
acceptance. See `docs/release-recovery-status.md` and the civicaccess repo `PROBE-PROGRESS.md`.

## Re-probe results

| Probe element | Verdict | Evidence |
|---|---|---|
| #1 Clean install (CivicCore v1.2.0 wheel pin) | PASS | civicaccess `pyproject` pins the v1.2.0 release wheel + SHA256; `verify-release.sh` builds in a fresh venv; live `/ready` returned `ready=true` (schema created on first connect). |
| #2 Staff/public authz | PASS | Trusted-write token guards `POST /review` and `POST /reviews/{id}/records-export` (403 missing/invalid, 503 unconfigured). Live: no-token → 403, valid-token → 200 on both write routes; public `/analyze` is stateless (no token, persists nothing). civicaccess `tests/test_citycore_hardening.py`. |
| #3 Audit logging | PASS | `audit_events` table; `review.create` audited atomically with the record, `review.records_export` on export. civicaccess Phase A tests + live records-export. |
| #4 Backup/restore | PASS | Postgres reconnect-durability round-trip + SQLite dev-fallback backup/restore round-trip (civicaccess `tests/test_postgres_persistence.py`, `tests/test_citycore_hardening.py`). |
| #5 Desktop runtime + registry wiring | PASS | Phase B (civicsuite PR #213, main `959e29e`): runtime-valid module record, Rust workflow/role/export maps, token injection, `/health` + migration wiring; `cargo test` (166) + `verify` green; the `desktop<->CivicCore real-runtime integration test` passed on main. |
| #6 CURRENT browser-QA | PASS | Live service exercised end-to-end — **12/12 functional checks** (health, readiness, public `/analyze`, both write routes' authz, persistence, records-export, plain-language, integration-contracts, both UIs served). Rendered in a real browser: the public checker ran a review (→ "Needs fixes" with an actionable WCAG fix); the staff workspace rendered with the write-token field, "Ready" readiness, and the two published contracts. |

## Functional re-probe transcript (2026-06-29, civicaccess v0.4.0, local run)

```
[PASS] health 200 + civiccore 1.2.0
[PASS] readiness ready
[PASS] public /analyze 200 + findings + not persisted
[PASS] authz: review no-token -> 403
[PASS] authz: review with-token -> 200 + review_id
[PASS] list reviews shows persisted
[PASS] authz: records-export no-token -> 403
[PASS] records-export with-token -> records-ready
[PASS] plain-language rewrite works
[PASS] integration-contracts published
[PASS] public UI served + uses /analyze
[PASS] staff UI served + token field + no leaked secret
ALL PASS (12 checks)
```

Browser-QA: public checker (`/civicaccess`) rendered and "Run review" returned a live "Needs fixes"
result via `POST /analyze`; staff workspace (`/civicaccess/staff`) rendered with the operator
write-token field (server secret never embedded), readiness "Ready", and the published
`civicaccess.publication_accessibility_review.v1` + `civicaccess.records_export.v1` contracts.

## Outcome

Probe gaps #1–#5 are closed with committed evidence; #6 (current browser-QA) passed live in this
re-probe. The 2026-05-23 NEEDS-WORK demotion is reversed. CivicAccess `v0.4.0` is promoted to the
sixth city-core module.

**Not the program Definition of Done.** The exhaustive clean-VM accessibility acceptance (keyboard-only,
screen-reader/ARIA, WCAG 2.1 AA contrast/focus on the rendered surfaces, export-correctness, and the
six-module install on a clean VM) is Phase D. The currently published `civicsuite-windows-local-v1.0.1`
MSI bundles the first five city-core modules; the six-module MSI is the next build.
