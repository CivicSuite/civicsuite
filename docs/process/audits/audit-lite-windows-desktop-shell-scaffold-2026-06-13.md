# Audit Lite - Windows Desktop Shell Scaffold
**Date:** 2026-06-13
**Scope:** Tauri/WebView2 desktop shell scaffold under `desktop/`, including the local UI, Tauri command state, module-registry integration, lockfiles, generated icon, and smoke checks.
**Reviewer:** Codex (audit-lite)

## TL;DR
Accept this slice. It creates a real Tauri/WebView2 desktop application scaffold, keeps the clerk-facing UI honest about scaffolded runtime pieces, reads the suite module registry, and builds a local desktop executable without bundling an installer yet. No unresolved findings were found in this slice.

## Severity rollup
- Blocker: 0
- Critical: 0
- Major: 0
- Minor: 0
- Nit: 0

## Findings

None.

## Checks Performed
- Correctness: reviewed `desktop/src-tauri/src/main.rs`, `desktop/src/main.js`, `desktop/src-tauri/tauri.conf.json`, and the static smoke test for module-registry state, task-first navigation, honest scaffold states, and no Docker/WSL clerk-path instructions.
- UX: reviewed rendered home surface with headless Edge. Evidence: `test-results/desktop-shell/home.png` and decoded DOM assertion confirmed `Meetings & Notices`, `Records Requests`, `Code & Ordinances`, `Search City Knowledge`, `System Health`, `Settings`, and local-only city-core copy.
- Docs: reviewed `desktop/README.md` for scope honesty and alignment with the Windows Local 1.0 design-control slice.
- Tests: `npm test`, `npm run build`, `cargo fmt --check`, `cargo test`, `cargo check`, and `npx tauri build --debug --no-bundle` all passed.
- Runtime: `npx tauri build --debug --no-bundle` built `desktop/src-tauri/target/debug/civicsuite-desktop.exe`; Vite served the UI at `http://127.0.0.1:5174/` and headless Edge captured the rendered home screen.
- Suite controls: `python scripts\verify-module-manifest-contract.py`, `python scripts\verify-installer-plan.py`, `python scripts\verify-suite-state.py --remote-only`, `python scripts\docs\verify_docs_truth.py`, and focused pytest checks passed before this audit report was added.
- Tool caveat: the in-app Browser plugin failed before executing page automation because its local runtime could not write support assets. Headless Edge was used for the UI render pass instead; this is not a product finding.

## What's working
- `desktop/src-tauri/src/main.rs` exposes `get_app_state` from Tauri and derives city-core installed modules from `installer/modules.json`.
- `desktop/src/main.js` renders task-first staff navigation plus Staff, Resident/Public, and IT/Admin surfaces without presenting unfinished workflows as live.
- `desktop/tests/static-smoke.mjs` guards the primary labels, Tauri identifier, registry include, and absence of start/install Docker/WSL instructions in the clerk shell.
- `desktop/scripts/generate-icon.mjs` deterministically produces the Windows icon asset required by Tauri resource builds.

## Watch items
- Full installer bundling is intentionally deferred to the installer slice; this slice proves the executable path with `--no-bundle`.
- Module services and portable runtime checks are intentionally shown as setup/scaffold states until the runtime slice wires them.

## Escalation recommendation
No escalation needed. This is a bounded scaffold slice with passing local checks and no release-blocking findings.
