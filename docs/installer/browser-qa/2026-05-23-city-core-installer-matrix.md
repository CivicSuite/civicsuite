# City-Core Installer Browser QA Matrix - 2026-05-23

Run id: `local-city-core-browser-qa`

Source JSON: `docs/installer/browser-qa/2026-05-23-city-core-installer-matrix.json`

## Viewports

| Viewport | Size |
|---|---|
| Desktop | 1440 x 1000 |
| Mobile | 390 x 900 |

## Results

| Surface | Viewport | URL | Status | Expected Text | Console |
|---|---|---|---:|---|---|
| CivicRecords AI admin | Desktop | `http://127.0.0.1:19000/` | 200 | present | none |
| CivicRecords AI admin | Mobile | `http://127.0.0.1:19000/` | 200 | present | none |
| CivicClerk public portal | Desktop | `http://127.0.0.1:19001/public` | 200 | present | none |
| CivicClerk public portal | Mobile | `http://127.0.0.1:19001/public` | 200 | present | none |
| CivicCode public search | Desktop | `http://127.0.0.1:19740/civiccode/search?q=13.40.020` | 200 | present | none |
| CivicCode public search | Mobile | `http://127.0.0.1:19740/civiccode/search?q=13.40.020` | 200 | present | none |

## Screenshots

| Surface | Desktop | Mobile |
|---|---|---|
| CivicRecords AI admin | `docs/installer/browser-qa/screenshots/2026-05-23-city-core-installer/records-admin-desktop.png` | `docs/installer/browser-qa/screenshots/2026-05-23-city-core-installer/records-admin-mobile.png` |
| CivicClerk public portal | `docs/installer/browser-qa/screenshots/2026-05-23-city-core-installer/clerk-public-desktop.png` | `docs/installer/browser-qa/screenshots/2026-05-23-city-core-installer/clerk-public-mobile.png` |
| CivicCode public search | `docs/installer/browser-qa/screenshots/2026-05-23-city-core-installer/code-public-search-desktop.png` | `docs/installer/browser-qa/screenshots/2026-05-23-city-core-installer/code-public-search-mobile.png` |

All captures passed with expected text present and no console events.
