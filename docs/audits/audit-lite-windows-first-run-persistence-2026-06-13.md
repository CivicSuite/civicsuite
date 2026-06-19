# Audit Lite: Windows First-Run Persistence Slice

Date: 2026-06-13
Scope: `desktop/` Tauri first-run setup state, setup UI controls, browser fallback module state, and focused browser coverage.

## Verdict

PASS.

Unresolved findings: 0 Blocker / 0 Critical / 0 Major / 0 Minor / 0 Nit.

## Slice Summary

- First-run setup progress now persists locally under the CivicSuite Windows profile.
- Setup actions for review, local folders, city profile, first admin, module selection, and backup-folder creation now mutate local state instead of returning a generic placeholder.
- Runtime-dependent actions still refuse to complete until their actual executors exist, so the desktop cannot mark model download, health verification, or finish complete prematurely.
- The desktop UI now exposes a guided current-step action, validates required city/admin fields through Tauri, refreshes setup state after saved actions, and shows plain-English result banners.
- Browser fallback now shows the City Core foundation modules instead of reporting zero installed components.

## Five-Lens Check

### Correctness

PASS. The Rust command validates manifest actions, verifies step/action pairing, writes JSON state atomically enough for the current local profile, creates install/data/backup/log/file/config folders, and keeps runtime/model completion blocked until real executors land.

### UX

PASS. The current setup step has one clear action. City/admin forms appear only when needed. Desktop and mobile screenshots show no horizontal overflow, no text overlap, and no lost action controls.

### Docs

PASS. This report records the new executable behavior and the remaining runtime-dependent boundaries for the next slice.

### Tests

PASS. Added Rust coverage for persisted progress, local folder creation, payload validation, and test-state isolation. Added browser coverage for City Core fallback module count.

### Runtime Behavior

PASS. Local validation covered Rust command behavior, Vite build, static smoke, Playwright flows, and manual Playwright screenshots at 1366px and 390px.

## Verification Evidence

- Rust desktop tests: 21 passed.
- Desktop static smoke: passed.
- Desktop production build: passed.
- Desktop Playwright browser tests: 2 passed.
- Manual Playwright visual checks:
  - 1366px home screenshot, zero horizontal overflow.
  - 390px mobile screenshot, zero horizontal overflow.

## Next Slice Watchlist

- Implement the native/resumable Gemma 4 model downloader with checksum verification before allowing the model step to complete.
- Implement portable runtime install/start/health actions before allowing health verification or finish to complete.
- Add real backup/restore/repair/uninstall executors behind the lifecycle buttons.
