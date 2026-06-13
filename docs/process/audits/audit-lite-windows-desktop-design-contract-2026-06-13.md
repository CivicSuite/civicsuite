# Audit Lite - Windows Desktop Design Contract

**Date:** 2026-06-13
**Scope:** Slice 1 foundation for CivicSuite Windows Local 1.0: desktop design control, module package ADR, module registry contract, verifier, tests, and control-plane reset.
**Reviewer:** Codex (audit-lite)

## TL;DR

Ship this slice. The change establishes the clerk-first Windows desktop UX
contract and turns the future module plug-in shape into a verified registry
contract. The focused tests and installer gate pass, and the only suite-state
limitation is environmental: this machine does not have every future sibling
module checkout locally, while `--remote-only` passes.

## Severity rollup

- Blocker: 0
- Critical: 0
- Major: 0
- Minor: 0
- Nit: 0

## Findings

No findings.

## What is working

- The desktop UX source of truth is now explicit in `docs/design/windows-desktop-design-control.md`, including the Tauri/WebView2 shell, installer/first-run path, task-first navigation, module manager, no Docker/WSL end-user path, and clerk-readable state rules.
- The future-module path is now an accepted architecture decision in `docs/architecture/ADR-0010-module-package-contract.md`, with CivicCore locked as the required platform and product modules installed through a manifest contract.
- `installer/modules.json` carries `module_contract_version: 1`, and `scripts/verify-module-manifest-contract.py` validates the existing 27 product modules plus CivicCore registry shape.
- `scripts/verify-installer-plan.py` now runs the module-manifest verifier, so the new contract is part of the normal installer gate rather than an optional side check.
- Regression tests cover the current registry, city-core module order, planned spec-only modules, and the failure case for a promoted ready module missing source proof.

## Watch items

- The contract file already lists future desktop fields for routes, permissions,
  services, migrations, tasks, health checks, backup/restore hooks, uninstall
  hooks, model requirements, audit events, and surface placement. Those fields
  are intentionally documented but not yet enforced against runtime packages in
  this first slice; enforcement should be added as the Tauri/WebView2 shell and
  portable supervisor land.
- The default local suite-state verifier failed because this machine only has
  the city-core sibling repos plus the umbrella repo checked out. The relevant
  remote-only verifier passed and should remain the umbrella truth check unless
  the remaining future module repos are cloned locally.

## Verification

- `python scripts\verify-module-manifest-contract.py` - PASS
- `python scripts\verify-installer-plan.py` - PASS
- `python scripts\verify-suite-state.py --remote-only` - PASS
- `python scripts\docs\verify_docs_truth.py` - PASS
- `python -m pytest tests\test_module_manifest_contract.py tests\test_clerk_core_installer_http_helpers.py` - PASS, 6 tests
- `python -m compileall scripts\verify-module-manifest-contract.py scripts\verify-installer-plan.py` - PASS
- `git diff --check` - PASS
- Non-ASCII scan for new/modified slice artifacts - PASS

## Escalation recommendation

No escalation needed for this slice. The next audit should be another
audit-lite after the first Tauri/WebView2 desktop shell scaffold, because that
will introduce real runtime and UX behavior.
