# Browser QA - CivicCore v0.18.1 Suite Sync

Date: 2026-05-02

Scope:

- Rendered `docs/index.html` after updating the umbrella status snapshot for `civiccore v0.18.1`, `civicrecords-ai v1.4.5`, and `civicclerk v0.1.15`.
- Verified desktop and mobile viewports with headless Chrome through Puppeteer.

Evidence:

- Desktop screenshot: `docs/browser-qa-suite-sync-v0.18.1-desktop.png`
- Mobile screenshot: `docs/browser-qa-suite-sync-v0.18.1-mobile.png`

Checks:

- PASS: landing page renders `civiccore v0.18.1`.
- PASS: landing page renders `civicrecords-ai v1.4.5`.
- PASS: landing page renders `civicclerk v0.1.15`.
- PASS: landing page explains that CivicClerk now uses shared CivicCore retry/circuit primitives for vendor-network live sync.
- PASS: skip link and primary heading are present.
- PASS: desktop and mobile captures completed without page errors.
- PASS: browser console reported no messages.
