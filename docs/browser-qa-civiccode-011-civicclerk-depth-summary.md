# Browser QA - CivicCode v0.1.1 + CivicClerk Production Depth Umbrella Sync

- Target: http://127.0.0.1:8765/docs/index.html
- Desktop viewport: 1440x1400; screenshot: docs/browser-qa-civiccode-011-civicclerk-depth-desktop.png (126573 bytes)
- Mobile viewport: 390x1600; screenshot: docs/browser-qa-civiccode-011-civicclerk-depth-mobile.png (83017 bytes)
- Rendered content check: CivicCode `Shipping v0.1.1` badge present.
- Rendered content check: CivicClerk post-release production-depth `/staff` wording present.
- HTTP check: landing page returned successfully through local static server.
- Console check: no JavaScript application bundle is used on this static page; browser QA focused on rendered HTML, responsive screenshot capture, and content assertions.
