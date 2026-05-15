# CivicSuite Release Recovery Status

Status date: 2026-05-14

## Current Rule

Public "shipping", "product-ready", "city-ready", and "v1.0.0 proves release maturity" claims are blocked unless the module appears below with an explicit recovery-passed status. The 2026-05-09 external audit found that multiple v1.0.0 labels were false.

## Corrective Decision

The project owner selected Option 1: yank/demote false v1.0 releases, but do not re-tag v1.0.0 at a different SHA.

Demotion pattern:

- Delete or supersede the false GitHub v1.0.0 release page.
- Publish a new honest version label instead of rewriting v1.0.0 history.
- Publish wheels using the honest version filename.
- Keep CivicCore URL pins hash-locked with `#sha256=`.
- Update the unified spec, this recovery doc, the compatibility matrix, `scripts/verify-suite-state.py`, `installer/modules.json`, downstream `pyproject.toml`, and changelog together.

## Module Decision Table

| Repo | Previous public label | Corrective label | Decision |
|---|---:|---:|---|
| civiccore | v1.0.0 / v1.0 | v1.1.0 shipped | Real platform; v1.1.0 shipped 2026-05-11 with shared `staff_key_gate` and timing-safe staff-key comparison. v1.0.1 auth-error-payload hardening remains included; v1.0 superseded. |
| civicclerk | v1.0.0 | v1.0.1 shipped | Real product-shaped workflow; v1.0.1 shipped 2026-05-10 with QA-001 security default change. Fresh installs deny anonymous staff writes by default; open mode is explicit local-rehearsal opt-in. |
| civicrecords-ai | v1.4.10 | v1.6.0 shipped | CivicCore v1.0.1 migration shipped 2026-05-11 as v1.5.0; B2 audit punch-list closed 2026-05-12 as v1.6.0 (JWT secret and first-admin password material moved to Docker secret files; container env no longer exposes any `JWT_SECRET*` or `FIRST_ADMIN_PASSWORD*` name). Main now contains a post-v1.6.0 ingestion worker fix that needs a v1.6.1 follow-up release before the next promotion claim. |
| civiccode | v1.0.0 | v0.5.0 | Demote; meaningful runtime depth but not v1.0. D2/B3 rollout moved this repo to CivicCore v1.1.0. |
| civiczone | v1.0.0 | v0.2.0 | Demote; scaffold-depth behavior and mock integrations. |
| civicplan | v1.0.0 | v0.2.0 | Demote; scaffold-depth behavior and mock integrations. D2/B3 rollout moved this repo to CivicCore v1.1.0 and shared `staff_key_gate`. |
| civicpermit | v1.0.0 | v0.2.0 | Demote; scaffold-depth behavior and mock integrations. D2/B3 rollout moved this repo to CivicCore v1.1.0 and shared `staff_key_gate`. |
| civicinspect | v1.0.0 | v0.2.0 | Demote; false label after recovery halt. D2/B3 rollout moved this repo to CivicCore v1.1.0 and shared `staff_key_gate`. |
| civicgrants | v1.0.0 | v0.2.0 | Demote; false label after recovery halt. D2/B3 rollout moved this repo to CivicCore v1.1.0 and shared `staff_key_gate`. |
| civicprocure | v1.0.0 | v0.2.0 | Demote; false label after recovery halt. D2/B3 rollout moved this repo to CivicCore v1.1.0 and shared `staff_key_gate`. |

## Recovery Gates Before Any Future v1 Claim

1. Unified spec scope checked for the module.
2. Required features implemented or intentionally deferred in release notes.
3. Browser-verified UX at desktop and mobile widths for every user-facing path.
4. Loading, success, empty, error, and partial states checked where applicable.
5. Browser console, keyboard/focus, accessibility, and copy review recorded.
6. Adversarial mock validation completed for integration behavior.
7. Full local tests and lint/static checks pass.
8. `scripts/verify-release.sh` passes if present.
9. Documentation updated: README, CHANGELOG, user manual, security/release notes, docs index, and module docs.
10. Independent release-gate audit has no unresolved Blocker or Critical findings.
11. Installer/module-selection integration is proven for the module.
12. CI is green after push/merge/release.

## Drift Incident Log

- **2026-05-07:** the owner halted lateral release sweeping and required active-module locking.
- **2026-05-08 to 2026-05-10:** CivicInspect, CivicGrants, CivicProcure, and other scaffold-depth repos were treated as v1.0.0 despite insufficient product depth.
- **2026-05-09:** external audit identified 154 findings and confirmed the false-label pattern.
- **2026-05-10:** corrective decision recorded: CivicCode -> v0.5.0; CivicZone/CivicPlan/CivicPermit/CivicInspect/CivicGrants/CivicProcure -> v0.2.0; CivicCore/CivicClerk/CivicRecords AI split into recovery releases.
- **2026-05-10:** CivicCore v1.0.1 shipped as a recovery patch with auth-error-payload hardening. The auth hardening removes `token_roles`, `principal`, `principal_roles`, `client_host`, and `trusted_proxy_cidrs` from CivicCore auth error responses; CivicCore v1.0 is superseded.
- **2026-05-10:** CivicClerk v1.0.1 shipped as a recovery patch for QA-001. The default staff auth mode is now `protected`; anonymous writes to `/meeting-bodies`, `/meetings`, `/motions`, and `/votes` return 401 by default. `open` mode remains available only as an explicit local-rehearsal opt-in.
- **2026-05-11:** CivicRecords AI v1.5.0 shipped after migrating from CivicCore v0.22.1 to v1.0.1. The v1.5.0 release workflow exposed and fixed three latent release-infrastructure defects: release-notes YAML parsing, Windows runner attempting Linux Docker Compose verification, and a hermetic CI admin email using the `.local` reserved domain. The full-suite profile is re-enabled after this unified CivicCore pin alignment.
- **2026-05-11:** CivicCore v1.1.0 shipped with the shared `staff_key_gate` helper. CivicCode, CivicPlan, CivicPermit, CivicInspect, CivicGrants, and CivicProcure now consume the hash-locked v1.1.0 wheel for the D2/B3 timing-safe staff-key rollout; CivicRecords AI, CivicClerk, and CivicZone remain on the v1.0.1 recovery pin.
- **2026-05-12:** CivicRecords AI v1.6.0 shipped after closing audit punch-list B2. The Phase 1 (#74) move into Docker secret files left `JWT_SECRET_FILE` and `FIRST_ADMIN_PASSWORD_FILE` pointer env names visible to the container env, which would have failed the directive's literal `docker compose exec -T api env | grep -E "JWT_SECRET|FIRST_ADMIN_PASSWORD"` acceptance command. Phase 1B (#76) removed the pointer env names and tightened the release verifier and contract test to the literal predicate. Phase 2 GREEN rehearsal at civicrecords-ai/.agent-runs/b2-phase2-rehearsal.md.
- **2026-05-14:** CivicRecords AI main contains a post-v1.6.0 Celery ingestion worker event-loop fix. Treat it as a required v1.6.1 follow-up before promoting the records module beyond developer preview.

## Language Rules

Use: "demoted recovery label", "developer preview", "foundation surface", "mock integration", "recovery patch required".

Do not use for demoted modules: "v1.0.0", "product-ready", "city-ready", "shipping product", "production-usable", or "done".
