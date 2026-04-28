# Browser QA — CivicPlan v0.1.1 Umbrella Sync

Date: 2026-04-28

Scope:

- `docs/index.html`
- CivicPlan v0.1.1 compatibility copy
- CivicCore v0.3.0 alignment copy

Evidence:

- Desktop screenshot: `docs/browser-qa-civicplan-011-umbrella-sync-desktop.png`
- Mobile screenshot: `docs/browser-qa-civicplan-011-umbrella-sync-mobile.png`

Checks:

- Desktop render captured at 1440x1200.
- Mobile render captured at 390x1200.
- Landing page uses the responsive CSS fixed during the CivicAccess umbrella sync; no clipping observed in the captured mobile hero/quick-link view.
- Landing page copy now states CivicCode, CivicZone, CivicAccess, and CivicPlan advanced to v0.1.1 for CivicCore v0.3.0 alignment.
- CivicPlan module card now presents CivicPlan v0.1.1 and `civiccore==0.3.0` alignment.
- No user-facing claims were added for official planning determinations, legal advice, live GIS, live LLM calls, plan ingestion, permitting integrations, or production staff-review queues.

Result: PASS
