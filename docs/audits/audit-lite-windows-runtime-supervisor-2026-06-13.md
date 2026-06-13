# Audit Lite: Windows Runtime Supervisor Slice

Date: 2026-06-13
Scope: `desktop/` runtime supervisor actions, System Health controls, first-run health gate, and regenerated topology docs.

## Verdict

PASS.

Unresolved findings: 0 Blocker / 0 Critical / 0 Major / 0 Minor / 0 Nit.

## Slice Summary

- Runtime supervision moved from static placeholder responses to local state-backed install, start, stop, health, repair, and logs actions.
- The supervisor creates local data/log/file/postgres folders, records runtime service state, probes TCP/HTTP/filesystem/supervisor health, and refuses to mark missing bundled binaries as ready.
- First-run `verify-health` now checks required runtime health instead of returning a permanent placeholder block.
- System Health now exposes per-service action buttons, with browser preview refusing mutation and the Tauri desktop bridge owning real host changes.
- `USER-MANUAL.md` topology was regenerated after CI reported stale generated docs.

## Five-Lens Check

### Correctness

PASS. The supervisor does real local filesystem preparation, process spawning when a declared binary exists, process stop by stored PID, and health probing. Required runtime services remain not ready when bundled executables are absent.

### UX

PASS. Health cards now offer explicit clerk/admin actions without exposing terminal commands. Browser preview clearly explains that runtime mutation requires the Windows desktop app.

### Docs

PASS. Slice behavior is recorded here and generated topology docs were refreshed.

### Tests

PASS. Rust coverage includes runtime manifest validation, missing-binary refusal, local folder/state creation, filesystem service health, and first-run health gating.

### Runtime Behavior

PASS. Local validation covered Rust command behavior, static smoke, production build, Playwright browser flows, and responsive Playwright screenshots for the health screen.

## Verification Evidence

- Rust desktop tests: 27 passed.
- Desktop static smoke: passed.
- Desktop production build: passed.
- Desktop Playwright browser tests: 4 passed.
- Manual Playwright visual checks:
  - 1366px health screenshot, zero horizontal overflow.
  - 390px health screenshot, zero horizontal overflow.
- Generated docs: `python scripts/docs/render_topology.py --write`.

## Next Slice Watchlist

- Add the actual portable PostgreSQL, CPython service, Ollama, and module-service runtime payloads to the Windows installer/build path.
- Implement backup, restore, and uninstall lifecycle executors behind the same supervisor surface.
- Connect CivicCore model registration once the local model runtime is available.
