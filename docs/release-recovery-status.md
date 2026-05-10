# CivicSuite Release Recovery Status

Status date: 2026-05-10

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
| civiccore | v1.0.0 / v1.0 | v1.0.1 shipped | Real platform; release-hygiene patch, not demotion. v1.0.1 shipped 2026-05-10 with auth-error-payload hardening (5 fields removed); v1.0 superseded. |
| civicclerk | v1.0.0 | v1.0.1 shipped | Real product-shaped workflow; v1.0.1 shipped 2026-05-10 with QA-001 security default change. Fresh installs deny anonymous staff writes by default; open mode is explicit local-rehearsal opt-in. |
| civicrecords-ai | v1.4.10 | v1.5.0 next | Upgrade to CivicCore v1.0.1, then minor recovery release. |
| civiccode | v1.0.0 | v0.5.0 | Demote; meaningful runtime depth but not v1.0. |
| civiczone | v1.0.0 | v0.2.0 | Demote; scaffold-depth behavior and mock integrations. |
| civicplan | v1.0.0 | v0.2.0 | Demote; scaffold-depth behavior and mock integrations. |
| civicpermit | v1.0.0 | v0.2.0 | Demote; scaffold-depth behavior and mock integrations. |
| civicinspect | v1.0.0 | v0.2.0 | Demote; false label after recovery halt. |
| civicgrants | v1.0.0 | v0.2.0 | Demote; false label after recovery halt. |
| civicprocure | v1.0.0 | v0.2.0 | Demote; false label after recovery halt. |

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

## Language Rules

Use: "demoted recovery label", "developer preview", "foundation surface", "mock integration", "recovery patch required".

Do not use for demoted modules: "v1.0.0", "product-ready", "city-ready", "shipping product", "production-usable", or "done".
