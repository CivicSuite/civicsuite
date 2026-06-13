# Audit Lite - Windows Runtime Supervisor
**Date:** 2026-06-13
**Scope:** Windows local runtime supervisor contract under `desktop/runtime/`, Tauri command bridge in `desktop/src-tauri/src/`, System Health rendering in `desktop/src/`, static smoke coverage, and desktop documentation.
**Reviewer:** Codex (audit-lite)

## TL;DR
Accept this slice. It defines the Windows local runtime services and lifecycle contract, exposes honest plain-English health state through the desktop shell, and blocks supervisor actions until the portable runtime bundle is actually installed. No unresolved findings were found in this slice.

## Severity rollup
- Blocker: 0
- Critical: 0
- Major: 0
- Minor: 0
- Nit: 0

## Findings

None.

## Checks Performed
- Correctness: reviewed `desktop/runtime/windows-local-runtime.json`, `desktop/src-tauri/src/supervisor.rs`, `desktop/src-tauri/src/main.rs`, and `desktop/src/main.js` for local-only runtime declarations, lifecycle action coverage, service validation, and honest blocked action responses before first-run installation.
- UX: reviewed the System Health surface with headless Edge. Evidence: `test-results/desktop-shell/system-health.png` and `test-results/desktop-shell/system-health.txt` confirmed plain-English local health, local data store setup state, local AI model setup state, and no Docker/WSL operator path.
- Docs: reviewed `desktop/README.md` and `desktop/runtime/README.md` for scope honesty and alignment with the Windows Local 1.0 design-control slice.
- Tests: `npm test`, `npm run build`, `cargo fmt --check`, `cargo test`, `cargo check`, and `npx tauri build --debug --no-bundle` all passed.
- Suite controls: `python scripts\verify-module-manifest-contract.py`, `python scripts\verify-installer-plan.py`, `python scripts\verify-suite-state.py --remote-only`, `python scripts\docs\verify_docs_truth.py`, focused pytest checks, `git diff --check`, and the slice ASCII scan passed before this report was added.
- Tool caveat: the in-app Browser plugin was unavailable because its local runtime could not write support assets in the earlier desktop-shell pass. Headless Edge was used for this slice's UI render pass instead; this is not a product finding.

## What's working
- `desktop/runtime/windows-local-runtime.json` declares the required Windows local services for PostgreSQL, bundled Python services, task queue, local model runtime, and local document storage.
- `desktop/src-tauri/src/supervisor.rs` validates the runtime manifest, reports setup-required health state, and refuses lifecycle actions until the runtime bundle exists.
- `desktop/src-tauri/src/main.rs` exposes runtime health and supervisor action state through Tauri commands.
- `desktop/src/main.js` renders the health state with clerk-safe wording and keeps technical detail secondary.
- `desktop/tests/static-smoke.mjs` locks the local-only contract, required lifecycle actions, and expected service ids.

## Watch items
- This slice deliberately does not start real service binaries. The next installer/first-run slice must place the runtime files and connect install/repair entry points.
- Health checks currently report setup-required state by contract. They must become live probes as the portable runtime services land.

## Escalation recommendation
No escalation needed. This is a bounded supervisor-contract slice with passing local checks and no release-blocking findings.
