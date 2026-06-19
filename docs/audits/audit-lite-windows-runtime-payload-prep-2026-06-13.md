# Audit Lite: Windows Runtime Payload Preparation Slice

Date: 2026-06-13
Scope: `desktop/` runtime source manifest, payload preparation script, package script, generated-payload ignore guard, and static validation.

## Verdict

PASS.

Unresolved findings: 0 Blocker / 0 Critical / 0 Major / 0 Minor / 0 Nit.

## Slice Summary

- Added a Windows runtime source manifest for EDB PostgreSQL 17 binaries, pgvector, CPython embeddable Windows runtime, and Ollama Windows runtime.
- Added a PowerShell release-prep script that downloads/extracts runtime payloads, enables `import site` for embedded Python, discovers the latest PostgreSQL 17 Windows binary archive, fetches Ollama from the latest GitHub release asset, and builds pgvector when MSVC tools are available.
- Added an npm script for release payload preparation.
- Added a payload `.gitignore` so generated runtime binaries do not accidentally enter source control.
- Desktop static smoke now verifies the runtime source manifest and payload-prep script hooks.

## Verification Evidence

- Desktop static smoke: passed.
- PowerShell script parse check: passed.
