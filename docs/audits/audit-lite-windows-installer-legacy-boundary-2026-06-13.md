# Audit Lite: Windows Installer Legacy Boundary

Date: 2026-06-13
Scope: Legacy suite-installer README boundary, static suite-launcher copy, and missing tracked native wrapper required by installer verification.

## Findings

No findings.

## Evidence

- `installer/README.md` now identifies the directory as legacy Docker/browser planner and beta package history, while pointing the Windows Local 1.0 clerk path to `desktop/` in `installer/README.md:3`.
- The README explicitly says the legacy installer directory is not the non-technical clerk install path and must not be read as a Docker or WSL requirement for the Windows desktop app in `installer/README.md:7`.
- The README points the current Windows Local 1.0 path at the Tauri/WebView2 desktop installer, first-run, module manager, local runtime, model readiness, health, backup, restore, repair, and uninstall surfaces in `installer/README.md:13`.
- The suite-launcher README and package description no longer describe the runtime as a scaffold in `installer/runtime/suite-launcher/README.md:3` and `installer/runtime/suite-launcher/package.json:5`.
- The suite-launcher error state now directs operators to local runtime verification instead of Docker in `installer/runtime/suite-launcher/src/app.js:71` and `installer/runtime/suite-launcher/src/app.js:284`.
- The legacy installer verifier's missing expected Windows wrapper is now tracked at `installer/generated/native/clerk-core/windows/CivicSuiteInstaller.iss:1`.

## Verification

- `npm test` in `installer/runtime/suite-launcher` passed.
- `npm test` in `desktop` passed.
- `python scripts/verify-installer-plan.py` passed after tracking the missing clerk-core native Windows wrapper.
- Targeted text scan over `installer/README.md`, `installer/runtime/suite-launcher`, and `desktop` showed no remaining wrong-path "confirm Docker" or "Install WSL" operator copy outside tests that assert those phrases are absent.
- `git diff --check` passed.

## Residual Risk

- The legacy planner scripts and historical installer docs still intentionally describe Docker-based beta workflows. This slice prevents them from being mistaken for the Windows Local 1.0 clerk path; replacing the old planner with a native Windows installer executor is broader installer implementation work.
