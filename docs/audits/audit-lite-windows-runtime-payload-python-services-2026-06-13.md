# Audit Lite: Windows Runtime Payload Python Services Slice

Date: 2026-06-13
Scope: `desktop/scripts/prepare-runtime-payload.ps1`, `desktop/runtime/python-services/`, `desktop/runtime/windows-runtime-payloads.json`, `desktop/runtime/windows-runtime-sources.json`, `desktop/src-tauri/src/supervisor.rs`, and `desktop/tests/static-smoke.mjs`.

## Findings

No unresolved findings.

Unresolved findings: 0 Blocker / 0 Critical / 0 Major / 0 Minor / 0 Nit.

## Slice Summary

- Completed embedded CPython payload preparation for the city-core package by installing CivicCore, CivicRecords AI, CivicClerk, CivicCode, and the CivicSuite runtime bridge into the Windows payload.
- Hardened PostgreSQL payload extraction, EDB download discovery, cached download reuse, and pgvector build invocation through Visual Studio Build Tools discovery.
- Added a local runtime bridge package with `/health` and `/modules` checks that imports all four Python module packages from the embedded runtime.
- Isolated embedded Python from user-site packages with `PYTHONNOUSERSITE=1` and a generated `sitecustomize.py` guard.
- Replaced runtime test-mode defaults with local profile secret bootstrap for CivicRecords import health, while keeping `TESTING` limited to the build-time import verifier.
- Wired the Tauri supervisor to launch runtime services with local data/model/database environment values and user-site package isolation.

## Verification Evidence

- `npm run prepare-runtime-payload`: passed; generated PostgreSQL 17 + pgvector, embedded CPython services, Ollama payload, and `runtime-payload-lock.json`.
- Embedded Python import verifier: passed; imported `civiccore`, `app.main`, `civicclerk.main`, `civiccode.main`, and `civicsuite_runtime.services`.
- Embedded runtime profile smoke: passed with `TESTING` unset, local secret files created, no user-site path in `sys.path`, and `/health` payload status `ok`.
- Required payload file check: passed for PostgreSQL, pgvector, Python module packages, `sitecustomize.py`, and Ollama.
- `npm test` in `desktop`: passed.
- `cargo test` in `desktop/src-tauri`: passed, 52 tests.
- `git diff --check`: passed; only existing line-ending warnings were reported.

## Residual Risk

The generated payload now contains the native runtime files and importable module packages, but the next release-blocking slice must initialize portable PostgreSQL data directories, create the local database/user, run module migrations, and start real services from first run.
