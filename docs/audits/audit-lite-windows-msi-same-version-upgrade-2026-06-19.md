# Audit Lite: Windows MSI Same-Version Upgrade Recovery

Date: 2026-06-19
Branch: work/windows-local-1-design-contract

## Scope

`TESTER-RESULT-098.md` failed before the desktop workflow surface because the unattended tester machine had a stale CivicSuite MSI registration and `MsiSystemRebootPending = 1`; bare-metal cleanup uninstall returned `1603`, and installing the directive 098 target MSI also returned `1603`.

## Finding

The Windows Local CI prerelease MSIs rotate ProductCode while keeping the product version at `0.1.0`. The previous Tauri-generated WiX authoring used `AllowDowngrades="yes"` for major upgrades, which does not author the same-version major-upgrade path we need for repeated prerelease validation on an unrebooted bare-metal tester.

## Change

- `desktop/src-tauri/tauri.conf.json` now sets `bundle.windows.allowDowngrades` to `false`.
- Tauri's stock WiX template now emits `AllowSameVersionUpgrades="yes"` for the MSI major-upgrade row.
- The Windows MSI workflow evidence now records `SameVersionMajorUpgrade=true`.
- `desktop/tests/static-smoke.mjs` fails if the MSI config or workflow evidence stops carrying the same-version upgrade contract.

## Evidence

- `npm --prefix desktop test`
- `npm --prefix desktop run build`
- `npm --prefix desktop run tauri -- build`
- generated `desktop/src-tauri/target/release/wix/x64/main.wxs` contains `AllowSameVersionUpgrades="yes"`
- generated MSI Property table contains `ProductVersion=0.1.0`, fresh ProductCode, and fixed UpgradeCode `{A63FC1D3-5437-5F55-89A2-FEF93FB1F930}`
- generated MSI Upgrade table includes same-version major-upgrade rows for the fixed UpgradeCode
- `cargo fmt --manifest-path desktop/src-tauri/Cargo.toml --check`
- `cargo test restore --manifest-path desktop/src-tauri/Cargo.toml -- --test-threads=1`
- `cargo test --manifest-path desktop/src-tauri/Cargo.toml -- --test-threads=1`
- `npm --prefix desktop run test:browser -- desktop/tests/browser/model-readiness.spec.mjs desktop/tests/browser/workflow-pages.spec.mjs`
- `bash scripts/verify-docs.sh`
- `python scripts/verify-deployment-profile.py --static-only`
- `python scripts/policy/check_stage_evidence.py`
- `git diff --check` with CRLF warnings only

## Residual Risk

This should allow the next MSI to replace a stale same-version CivicSuite MSI registration during install without requiring a reboot. It cannot clear unrelated system-wide Windows pending-reboot state by itself, and the directive must continue to avoid rebooting the unattended tester machine.
