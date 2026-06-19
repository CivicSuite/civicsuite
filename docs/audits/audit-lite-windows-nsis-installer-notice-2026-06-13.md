# Audit Lite: Windows NSIS Installer Notice Slice

Date: 2026-06-13
Scope: `desktop/` Tauri NSIS installer notice, SmartScreen guidance, install hook, and smoke validation.

## Verdict

PASS.

Unresolved findings: 0 Blocker / 0 Critical / 0 Major / 0 Minor / 0 Nit.

## Slice Summary

- The Tauri Windows bundle now includes a required unsigned beta install notice file.
- The notice explains Microsoft Defender SmartScreen, "More info", and "Run anyway" in plain English.
- The NSIS installer runs a pre-install confirmation hook with the same local-only and no Docker/WSL/terminal promise.
- The installer is configured for current-user installation with a CivicSuite Start Menu folder and standard Windows uninstall registration.
- Desktop static smoke now verifies the installer notice, NSIS hook, and Tauri config paths.

## Verification Evidence

- Desktop static smoke: passed.
- Tauri production NSIS build: passed.
- Generated installer: `desktop/src-tauri/target/release/bundle/nsis/CivicSuite_0.1.0_x64-setup.exe`.
