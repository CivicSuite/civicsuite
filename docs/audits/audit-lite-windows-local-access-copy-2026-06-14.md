# Audit Lite: Windows Local Access Copy

Date: 2026-06-14

Scope:
- `desktop/src/main.js`
- `desktop/tests/static-smoke.mjs`

## Findings

None.

## Evidence

- The signed-out access panel now separates staff/admin city-work sign-in from local-admin-only setup, users, modules, backup/restore, model, and runtime authority. Evidence: `desktop/src/main.js:1215` and `desktop/src/main.js:1219`.
- Failed sign-in guidance now says local passcode instead of local administrator passcode, which matches staff-user sign-in. Evidence: `desktop/src/main.js:4980`.
- Static smoke coverage pins the corrected boundary language so the UI does not regress back to an admin-only city-work claim. Evidence: `desktop/tests/static-smoke.mjs:133`.

## Verification

- `npm test -- --runInBand`
- `npm run test:browser`
- `npm run build`

## Residual Risk

This slice is copy-only and does not re-test the Rust auth/RBAC backend. The backend was covered in the immediately preceding local-users/RBAC slice.
