# Browser QA - CivicRecords AI v1.4.4 Suite Sync

Date: 2026-05-01

- Target: `docs/index.html`
- Desktop screenshot: `docs/browser-qa-records-ai-144-suite-sync-desktop.png`
- Mobile screenshot: `docs/browser-qa-records-ai-144-suite-sync-mobile.png`
- Browser command: Microsoft Edge headless against `file:///C:/dev/Claude/civicsuite/docs/index.html`.
- Visible checks: suite status table shows `civicrecords-ai v1.4.4`; shared-platform note shows `civiccore v0.17.0`; desktop and mobile captures completed without visible clipping of the status cards.
- Runtime note: the first `Get-Item` check raced screenshot writes, then both screenshot files were confirmed on disk.
