# Audit Lite - Windows First-Run Setup
**Date:** 2026-06-13
**Scope:** Windows first-run setup contract under `desktop/runtime/`, Tauri first-run state bridge in `desktop/src-tauri/src/`, Home/System Health setup rendering in `desktop/src/`, static smoke coverage, and desktop/runtime documentation.
**Reviewer:** Codex (audit-lite)

## TL;DR
Accept this slice. It replaces static installer copy with a structured Windows Local 1.0 first-run contract, renders the full setup checklist in the desktop shell, and keeps install/repair/uninstall actions blocked until the native installer executor exists. No unresolved findings were found in this slice.

## Severity rollup
- Blocker: 0
- Critical: 0
- Major: 0
- Minor: 0
- Nit: 0

## Findings

None.

## Checks Performed
- Correctness: reviewed `desktop/runtime/windows-first-run.json`, `desktop/src-tauri/src/first_run.rs`, `desktop/src-tauri/src/main.rs`, and `desktop/src/main.js` for required first-run steps, local-only operator path, structured state transitions, and blocked host-mutating actions.
- UX: reviewed the rendered first-run setup surface with headless Edge. Evidence: `test-results/desktop-shell/first-run.png` and `test-results/desktop-shell/first-run.html` confirmed the setup checklist includes unsigned beta notice, SmartScreen guidance, local paths, model download, first admin user, backup, health, and lifecycle entry points.
- Docs: reviewed `desktop/README.md` and `desktop/runtime/README.md` for scope honesty and alignment with the Windows Local 1.0 design-control slice.
- Tests: `npm test`, `npm run build`, `cargo fmt --check`, `cargo test`, `cargo check`, and `npx tauri build --debug --no-bundle` all passed.
- Suite controls: `python scripts\verify-module-manifest-contract.py`, `python scripts\verify-installer-plan.py`, `python scripts\verify-suite-state.py --remote-only`, `python scripts\docs\verify_docs_truth.py`, focused pytest checks, `git diff --check`, and the slice ASCII scan passed before this report was added.
- Runtime cleanup: the temporary Vite server used for headless Edge proof was stopped after the render pass.

## What's working
- `desktop/runtime/windows-first-run.json` defines the required first-run steps from the Windows desktop design control, including unsigned beta, SmartScreen, locations, modules, model, city profile, first admin, backup, health, and finish.
- `desktop/src-tauri/src/first_run.rs` validates the manifest, resolves Windows-local default paths, exposes setup state, and tests deterministic step advancement.
- `desktop/src-tauri/src/main.rs` includes first-run state in `get_app_state` and exposes preview/action commands for future installer wiring.
- `desktop/src/main.js` renders the setup checklist from structured state on Home and System Health without presenting host mutation as live.
- `desktop/tests/static-smoke.mjs` locks the required first-run steps, actions, and no-developer-tooling operator path.

## Watch items
- This slice deliberately does not mutate host state. The native installer executor still needs to connect folder creation, runtime placement, model download, city/admin persistence, repair, backup, and uninstall.
- The next model slice should replace the model step's setup-required state with pinned model metadata, checksum validation, and readiness state.

## Escalation recommendation
No escalation needed. This is a bounded first-run setup slice with passing local checks and no release-blocking findings.
