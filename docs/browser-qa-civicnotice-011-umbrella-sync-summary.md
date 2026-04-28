# Browser QA - CivicNotice v0.1.1 Umbrella Sync

Date: 2026-04-28

Scope:

- `docs/index.html` after syncing CivicNotice to v0.1.1 and `civiccore==0.3.0`.

Evidence:

- Desktop screenshot: `docs/browser-qa-civicnotice-011-umbrella-sync-desktop.png`
- Mobile screenshot: `docs/browser-qa-civicnotice-011-umbrella-sync-mobile.png`

Checks:

- CivicNotice card displays `Shipping v0.1.1`.
- CivicNotice copy names `civiccore==0.3.0` alignment.
- CivicNotice still honestly states legal sufficiency decisions, legal advice, live LLM calls, official notice publication, publication-system write-back, and notice system-of-record integrations are not shipped.
- Desktop and mobile captures report no horizontal overflow (`scrollWidth == innerWidth`).

Result: PASS.
