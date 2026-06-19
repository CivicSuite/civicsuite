# Audit Lite: Windows Model Action Slice

Date: 2026-06-13
Scope: `desktop/` Tauri local model setup actions, checksum verification, resumable download bridge, UI controls, and focused browser coverage.

## Verdict

PASS.

Unresolved findings: 0 Blocker / 0 Critical / 0 Major / 0 Minor / 0 Nit.

## Slice Summary

- Local model setup now has native actions for opening the model folder, verifying the pinned GGUF checksum, and running a resumable `curl` download path.
- Checksum verification requires the expected file size and SHA-256 before writing the local `.sha256.verified` marker.
- Tests avoid accidental multi-GB downloads and cover missing-file handling, local folder creation, and checksum-marker behavior with an isolated test state directory.
- The desktop UI now exposes explicit model setup buttons and a result banner. Browser preview refuses mutation and explains that native actions require the Windows desktop bridge.

## Five-Lens Check

### Correctness

PASS. The model command validates the pinned manifest, writes checksum markers only after size and SHA-256 match, creates local model folders through the desktop state root, and keeps unsupported actions rejected.

### UX

PASS. Model setup actions are visible beside the readiness panel, use explicit consent wording, and do not start a silent download. Desktop and mobile screenshot checks found no horizontal overflow or hidden model buttons.

### Docs

PASS. This report records the executable model behavior and the still-pending runtime/registry gates.

### Tests

PASS. Rust tests cover the native action path and browser tests cover visible controls plus browser-preview refusal.

### Runtime Behavior

PASS. Local validation covered native Rust command behavior, Vite build, static smoke, Playwright flows, and responsive Playwright screenshots at 1366px and 390px.

## Verification Evidence

- Rust desktop tests: 23 passed.
- Desktop static smoke: passed.
- Desktop production build: passed.
- Desktop Playwright browser tests: 3 passed.
- Manual Playwright visual checks:
  - 1366px home screenshot, zero horizontal overflow.
  - 390px mobile screenshot, zero horizontal overflow.

## Next Slice Watchlist

- Connect the first-run `download-model` step to the verified model artifact state instead of leaving it blocked behind the placeholder executor.
- Implement local runtime start/health and CivicCore model registry checks before allowing AI workflows to run.
- Add disk-space checks before invoking the multi-GB download.
