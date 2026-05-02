# CivicSuite v0.20.0 Suite Sync Browser QA

Date: 2026-05-02

Scope:
- Rendered `docs/index.html` after syncing the umbrella status snapshot for `civiccore v0.20.0`, `civicrecords-ai v1.4.7`, and `civicclerk v0.1.18`.
- Checked that the landing page states explicit unsigned-installer guidance and site-specific deployment proof slots for CivicClerk.

Evidence:
- Desktop viewport: 1440x1100, screenshot `docs/browser-qa-suite-sync-v0.20.0-desktop.png`.
- Mobile viewport: 390x1200, screenshot `docs/browser-qa-suite-sync-v0.20.0-mobile.png`.
- Browser console: no page-load blocking errors observed during headless render.

Content checks:
- PASS: landing page renders `civicrecords-ai v1.4.7`.
- PASS: landing page renders `civicclerk v0.1.18`.
- PASS: landing page renders `civiccore v0.20.0`.
- PASS: CivicClerk copy names explicit unsigned-installer warnings and site-specific municipal proof slots.
