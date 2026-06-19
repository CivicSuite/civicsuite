# Audit Lite: CivicNotice Installed Module

Date: 2026-06-19
Scope: CivicNotice promotion from tracked module to installed City Core module in CivicSuite Windows Local / installer surfaces.

## Verdict

PASS - 0 critical, 0 high, 0 medium, 0 low, 0 follow-up findings.

## What Was Audited

- City Core module manifest and generated installer package inclusion.
- Windows MSI runtime payload checkout, embedded Python install, and import proof.
- Desktop module registry, navigation, role access, guided review, action gating, search, exports, backup hooks, and app-state reporting.
- CivicNotice workflow actions for notice workpaper, posting proof, deadline/checklist, and archive packet export.
- Installer lifecycle runner selection, environment generation, compose scaffolding, install/verify/uninstall hooks, and module database contract.
- End-user documentation, compatibility matrix, operator walkthrough, status page, and topology rendering.

## Findings

None remaining.

## Issues Found And Resolved During Audit

- City Core profile and generated installer packages did not initially include CivicNotice. Fixed by promoting `civicnotice` in `installer/modules.json`, generated package plans, launcher defaults, and module manifest contract checks.
- Desktop UI initially lacked a complete installed-module surface for Public Notices. Fixed by adding navigation, module card fallback, forms, guided review actions, search integration, archive export, and browser regression coverage.
- Runtime payload did not initially prove CivicNotice installs into the embedded Python payload. Fixed by adding the MSI checkout, payload metadata, prepare script install/import, static smoke checks, and payload import proof.
- Installer lifecycle initially rejected `--module civicnotice`. Fixed by adding CivicNotice source prep, environment generation, compose scaffolding, lifecycle install/verify/uninstall participation, and database contract tests.
- Registry profile resolution could remain `custom` after reinstalling the full City Core set because dependency ordering differed from profile order. Fixed by resolving matching profile sets back to the canonical profile order.
- Stale tests still expected four City Core modules. Fixed to assert CivicNotice as the fifth installed City Core module.

## Verification Evidence

- `cargo test --manifest-path desktop\src-tauri\Cargo.toml`: 139 passed.
- `python -m pytest tests\test_module_manifest_contract.py tests\test_clerk_core_installer_http_helpers.py`: 12 passed.
- `python scripts\verify-module-manifest-contract.py`: passed.
- `python scripts\verify-installer-plan.py`: passed.
- `npm --prefix desktop test`: passed.
- `npm --prefix desktop run test:browser`: 14 passed.
- `npm --prefix desktop run build`: passed.
- `cargo fmt --manifest-path desktop\src-tauri\Cargo.toml -- --check`: passed.
- `powershell -NoProfile -ExecutionPolicy Bypass -File desktop\scripts\prepare-runtime-payload.ps1 -RepoRoot C:\dev\Codex\civicsuite -SkipDownloads`: passed and installed CivicNotice into the embedded runtime.
- `desktop\runtime\payload\python\python.exe -c "import civicnotice.main; import importlib.metadata as m; print(m.version('civicnotice'))"`: reported `0.2.0`.
- `bash scripts/verify-docs.sh`: passed.
- `python scripts\verify-deployment-profile.py --static-only`: passed.
- `python scripts\policy\check_stage_evidence.py`: passed.
- `python scripts\docs\render_topology.py --check`: passed.
- `git diff --check`: passed with line-ending warnings only.

## Residual Risk

None identified in scope. The module is covered as an installed City Core module, but production MSI publication remains subject to the normal CI/package release path after merge.
