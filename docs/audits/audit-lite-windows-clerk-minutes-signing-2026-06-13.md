# Audit Lite: Windows Clerk Minutes Signing Gate

Date: 2026-06-13
Branch: work/windows-local-1-design-contract
Slice: CivicClerk adopted-minutes signing before public archive

## Findings

No unresolved findings.

## Evidence Reviewed

- Backend meeting state now persists signer, signature attestation, and signed timestamp with serde defaults for existing local data in `desktop/src-tauri/src/workflows.rs:205`.
- `sign-minutes` requires adopted minutes, signer name, and attestation, blocks duplicate signing, records audit evidence, and preserves archive mutation guards in `desktop/src-tauri/src/workflows.rs:2158` and `desktop/src-tauri/src/workflows.rs:5160`.
- Draft replacement is blocked after adoption/signing so official minutes cannot be silently overwritten in `desktop/src-tauri/src/workflows.rs:1701`.
- Packet/archive exports include a `Minutes Signature` section, and archive now requires signed minutes in `desktop/src-tauri/src/workflows.rs:2256`, `desktop/src-tauri/src/workflows.rs:2620`, and `desktop/src-tauri/src/workflows.rs:2687`.
- Staff/public search indexes signer and attestation only on the correct surfaces, and pre-archive public projection clears signature fields in `desktop/src-tauri/src/workflows.rs:4679` and `desktop/src-tauri/src/workflows.rs:4970`.
- Lifecycle regression covers archive-before-signature blocking, adopted-minutes replacement blocking, signed fields, export content, signer search, public archive projection, and existing post-archive mutation guards in `desktop/src-tauri/src/workflows.rs:5582`.
- Desktop UI adds guided review, signer/attestation controls, a Sign Minutes action, signed status display, payload wiring, and local search inclusion in `desktop/src/main.js:1372`, `desktop/src/main.js:1675`, `desktop/src/main.js:2316`, `desktop/src/main.js:2368`, `desktop/src/main.js:3121`, and `desktop/src/main.js:4338`.
- Browser workflow smoke verifies the signing controls remain visible in `desktop/tests/browser/workflow-pages.spec.mjs:65`.
- Operator walkthrough now includes signing adopted minutes with attestation evidence before archive in `docs/installer/operator-walkthrough.md:75`.

## Verification

- `cargo fmt` passed.
- `cargo test meeting_workflow_persists_agenda_notice_minutes_votes_comments_actions_and_archive -- --test-threads=1` passed.
- `npm run test:browser` passed: 11 tests.
- `cargo test -- --test-threads=1` passed: 96 tests.
- `npm test -- --runInBand` passed.
- `npm run build` passed.
- `cargo check` passed from `desktop/src-tauri`.
- `python scripts\verify-module-manifest-contract.py` passed.
- `python scripts\verify-deployment-profile.py --static-only` passed.
- `bash scripts/verify-docs.sh` passed.
- `python scripts\verify-installer-plan.py` passed.
- `git diff --check` passed with only CRLF normalization warnings.

## Residual Risk

This validates the local workflow, browser surface, export/search behavior, and release plan checks. It does not replace the later clean-machine installed-app walkthrough for MSI install, reboot persistence, backup/restore, repair, uninstall, and reinstall.
