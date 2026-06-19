# Audit Lite: Windows Runtime Payloads Slice

Date: 2026-06-13
Scope: `desktop/` runtime payload manifest, Tauri resource bundling, supervisor install/repair payload copy path, and tests.

## Verdict

PASS.

Unresolved findings: 0 Blocker / 0 Critical / 0 Major / 0 Minor / 0 Nit.

## Slice Summary

- Added a Windows runtime payload manifest for portable PostgreSQL 17 with pgvector, bundled CPython city services, and native Ollama.
- Added a build-time payload root under `desktop/runtime/payload/` and configured Tauri to bundle it as an NSIS resource.
- Install/repair now copies bundled payloads into the local runtime profile when payload files are present.
- Required services still remain blocked when payload files or required executables are incomplete.
- Tests now prove both missing-payload refusal and fake bundled PostgreSQL payload installation.

## Verification Evidence

- Desktop static smoke: passed.
- Rust desktop tests: 36 passed.
- Desktop production build: passed.
- Desktop Playwright browser tests: 7 passed.
- Tauri production NSIS build: passed.
