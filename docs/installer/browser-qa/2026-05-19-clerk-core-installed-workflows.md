# Clerk-Core Installed Browser QA - 2026-05-19

Status: PASSED

Scope: local Docker/browser install of CivicRecords AI 1.6.1 and CivicClerk 1.0.1 for the Clerk-Core starter product. This is browser/user-facing QA evidence, not a claim of city production deployment or macOS lifecycle certification.

## Runtime

- CivicRecords AI health: ok 1.6.1
- CivicClerk health through nginx /api proxy: ok 1.0.1

## Browser Checks

| Check | Product | Viewport | Status | Screenshot |
| --- | --- | --- | --- | --- |
| records-login-desktop | CivicRecords AI | 1440x1000 | passed | docs/installer/browser-qa/screenshots/2026-05-19-clerk-core-installed-workflows/records-login-desktop.png |
| records-login-mobile | CivicRecords AI | 390x844 | passed | docs/installer/browser-qa/screenshots/2026-05-19-clerk-core-installed-workflows/records-login-mobile.png |
| records-admin-desktop | CivicRecords AI | 1440x1000 | passed | docs/installer/browser-qa/screenshots/2026-05-19-clerk-core-installed-workflows/records-admin-desktop.png |
| clerk-staff-desktop | CivicClerk | 1440x1000 | passed | docs/installer/browser-qa/screenshots/2026-05-19-clerk-core-installed-workflows/clerk-staff-desktop.png |
| clerk-staff-mobile | CivicClerk | 390x844 | passed | docs/installer/browser-qa/screenshots/2026-05-19-clerk-core-installed-workflows/clerk-staff-mobile.png |
| clerk-public-desktop | CivicClerk | 1440x1000 | passed | docs/installer/browser-qa/screenshots/2026-05-19-clerk-core-installed-workflows/clerk-public-desktop.png |
| clerk-public-mobile | CivicClerk | 390x844 | passed | docs/installer/browser-qa/screenshots/2026-05-19-clerk-core-installed-workflows/clerk-public-mobile.png |
| clerk-protected-error-desktop | CivicClerk | 1440x1000 | passed_with_expected_protected_state | docs/installer/browser-qa/screenshots/2026-05-19-clerk-core-installed-workflows/clerk-protected-error-desktop.png |

## UX / QA Notes

- Desktop and mobile widths were checked for CivicRecords AI sign-in, CivicClerk staff workflow, and CivicClerk public portal.
- CivicClerk staff was checked with bearer staff auth through the installed nginx path, proving React `/api/...` calls reach FastAPI through the Docker/browser product path.
- The unauthenticated CivicClerk staff path intentionally renders an actionable protected-state message with fix guidance.
- Keyboard focus was advanced with Tab in every checked page and recorded in the JSON evidence.
- Console warnings/errors, page errors, failed responses, and horizontal overflow are recorded per check in the JSON evidence.
