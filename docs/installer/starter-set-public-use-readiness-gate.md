# Clerk-Core Public-Use Readiness Gate

Status: RED - final package evidence is being assembled; this is not a
public-use release.

Last verified: 2026-05-21.

This gate is the promotion checklist for moving the Clerk-Core starter product
beyond the current unsigned OSS beta. It covers only the starter profile:
CivicCore, CivicRecords AI, CivicClerk, and the CivicSuite installer.

This document does not promote the full suite, does not promote queued modules,
does not certify procurement use, does not prove live CivicRecords/CivicClerk
business-record exchange, and does not certify macOS lifecycle behavior.

## Current Evidence Baseline

The current published outside-test baseline is
`installer-clerk-core-v0.1.0-beta.4`. The 2026-05-21 final package evidence
regenerated the unsigned `0.1.0` Clerk-Core archives after CivicClerk main
`45eaccfcc69dd1ae7e2e45d7badd5d188b49397d` merged the staff-session-gated
protected API loading fix.

Evidence already recorded:

- Suite verifier passes with `[civicrecords-ai] PASS 1.6.1`.
- Suite verifier passes with `[clerk-core-workflow-proof] PASS`.
- Docs verifier passes.
- Installer-plan verifier passes.
- Release-lockstep gate passed for the beta.4 truth move.
- Linux matching-host package lifecycle proves install, repair, verify,
  backup, restore, workflow proof, and uninstall.
- Backup proof includes PostgreSQL custom dump evidence.
- Restore proof includes restore-probe `pg_restore` evidence.
- Windows matching-host lifecycle evidence now exists for the regenerated
  package: install, repair, verify, workflow proof, backup, restore, and
  uninstall passed on a Windows host.
- macOS remains beta-level archive/readiness only until a Darwin/macOS Docker
  Desktop host runs matching-host lifecycle evidence.
- Installed browser QA evidence exists for CivicRecords AI login/admin paths
  and CivicClerk staff/public/protected-state paths at desktop and mobile
  widths.
- The 2026-05-20 installed route/state matrix records 20 browser checks and
  154 deduplicated installed routes across CivicRecords AI and CivicClerk.
- The 2026-05-21 package evidence records regenerated Windows, macOS, and Linux
  archive checksums, Windows matching-host lifecycle proof, and macOS beta-level
  archive/readiness proof.
- Restore-precondition evidence records the missing backup manifest failure
  path for a non-existent backup directory.

## Public-Use Promotion Checklist

| Gate | Status | Evidence or blocker |
|---|---|---|
| Spec scope checked for CivicCore, CivicRecords AI, and CivicClerk | YELLOW | The unified spec sections 8, 9, 13, and 16-19 are the scope source. A final promotion packet must cite each section explicitly. |
| Required starter workflows implemented | YELLOW | Installed-stack workflow proof exists for records request/search-surface/review/response and clerk agenda/packet/minutes/vote/notice/archive. Final promotion must prove all required starter workflows and must not use required-work deferrals to move this gate. |
| Desktop and mobile browser UX checked for every public and staff path | YELLOW | The 2026-05-20 installed route/state matrix records desktop/mobile coverage and 154 deduplicated installed routes. Independent audit must verify coverage completeness and require fixes for any missed public/staff route. |
| Loading, success, empty, error, and partial states checked | YELLOW | The 2026-05-20 installed route/state matrix records loading, success, empty, error, and partial state evidence where supported. Independent audit must verify the state coverage is complete enough for promotion and require gap fixes where it is not. |
| Console, keyboard/focus, accessibility, and copy review recorded | YELLOW | Browser QA records console/focus observations and copy notes. Independent audit must verify accessibility/copy completeness for every covered path and require gap fixes where needed. |
| Adversarial mock validation completed for integration behavior | YELLOW | The 2026-05-20 matrix records adversarial local integration probes for bad inputs, missing/stale records, spoofed or missing staff roles, unavailable dependencies, failed restore preconditions, and public/staff boundaries. Independent audit must verify sufficiency before promotion. |
| Full local tests and lint/static checks pass for touched repos | GREEN | Suite checks pass. CivicClerk `scripts/verify-release.sh` passed locally on the source fix branch and CivicClerk main CI passed after merge. CivicRecords AI `scripts/verify-release.sh` passed locally on current `master`. |
| Module release scripts pass where present | GREEN | CivicClerk `scripts/verify-release.sh` and CivicRecords AI `scripts/verify-release.sh` passed locally. |
| Required documentation updated | YELLOW | Starter outside-test docs exist. Final promotion must update README, changelog, user manual, security/release notes, docs index, and installer docs as one release-truth set. |
| Independent release-gate audit has no unresolved Blocker or Critical findings | RED | No final independent public-use release-gate audit is recorded for promotion beyond beta.4. |
| Installer/module-selection integration proven | GREEN | The `clerk-core` profile selects CivicCore, CivicRecords AI, and CivicClerk and has Linux and Windows package lifecycle proof, with macOS bounded to beta-level archive/readiness proof. |
| CI is green after push, merge, and release-truth move | YELLOW | beta.4 CI was green. Final promotion needs fresh CI on the final promotion SHA. |

## Required Next Implementation Slices

1. Independent audit of the 2026-05-20 route/state/adversarial evidence:
   verify the installed route inventory, UI state matrix, accessibility/copy
   observations, adversarial probes, and restore-precondition evidence; require
   gap fixes for any incomplete or misleading coverage.
2. Per-repo promotion checks: run and record current CivicRecords AI and
   CivicClerk tests, lint/static checks, and release verifier scripts where
   present.
3. Independent public-use release-gate audit: require no unresolved Blocker or
   Critical findings before any release label moves beyond outside-test beta.
4. Final release-truth package: update suite docs, installer docs, compatibility
   truth, release notes, verifiers, and artifacts together through the
   release-lockstep path.

## Halt Triggers

Stop promotion work if any of these occur:

- The suite verifier prints CivicRecords AI `1.6.0` as current.
- `[clerk-core-workflow-proof] PASS` disappears from suite verifier output.
- Linux matching-host lifecycle evidence no longer proves backup and restore.
- Any current-facing doc claims public-use readiness, city-ready status,
  production readiness, procurement readiness, full-suite release status, live
  cross-module records exchange, or macOS lifecycle certification.
- Any queued module repo needs implementation work before this starter-product
  gate passes.

## Allowed Current Claim

The allowed claim is:

> `installer-clerk-core-v0.1.0-beta.4` is an unsigned OSS beta for outside
> testing of the CivicCore + CivicRecords AI + CivicClerk starter profile.

Anything stronger requires this gate to move to GREEN with fresh evidence.
