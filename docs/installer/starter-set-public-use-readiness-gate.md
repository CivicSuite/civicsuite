# Clerk-Core Public-Use Readiness Gate

Status: RED - beta.4 is outside-test evidence, not a public-use release.

Last verified: 2026-05-20.

This gate is the promotion checklist for moving the Clerk-Core starter product
beyond the current unsigned OSS beta. It covers only the starter profile:
CivicCore, CivicRecords AI, CivicClerk, and the CivicSuite installer.

This document does not promote the full suite, does not promote queued modules,
does not certify procurement use, does not prove live CivicRecords/CivicClerk
business-record exchange, and does not certify macOS lifecycle behavior.

## Current Evidence Baseline

The current outside-test baseline is
`installer-clerk-core-v0.1.0-beta.4`.

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
- Windows has matching-host Docker Desktop lifecycle evidence on Windows 11
  with WSL 2.
- macOS remains archive/readiness only until a Darwin/macOS Docker Desktop host
  runs matching-host lifecycle evidence.
- Installed browser QA evidence exists for CivicRecords AI login/admin paths
  and CivicClerk staff/public/protected-state paths at desktop and mobile
  widths.

## Public-Use Promotion Checklist

| Gate | Status | Evidence or blocker |
|---|---|---|
| Spec scope checked for CivicCore, CivicRecords AI, and CivicClerk | YELLOW | The unified spec sections 8, 9, 13, and 16-19 are the scope source. A final promotion packet must cite each section explicitly. |
| Required starter workflows implemented or deferrals documented | YELLOW | Installed-stack workflow proof exists for records request/search-surface/review/response and clerk agenda/packet/minutes/vote/notice/archive. Final promotion must also document any intentionally deferred public comments, live records exchange, or native installer work. |
| Desktop and mobile browser UX checked for every public and staff path | YELLOW | Installed browser QA exists for the main paths. Final promotion must add a path inventory proving every public/staff route is covered or explicitly out of scope. |
| Loading, success, empty, error, and partial states checked | RED | Current evidence records protected/error state and normal success paths, but does not yet map every user-facing state across both modules. |
| Console, keyboard/focus, accessibility, and copy review recorded | YELLOW | Browser QA records console/focus observations. Final promotion must include an explicit accessibility/copy matrix for every covered path. |
| Adversarial mock validation completed for integration behavior | RED | Installed workflow proof is positive-path plus guardrail evidence. A public-use gate needs adversarial mocks for bad inputs, stale state, spoofed roles, missing dependencies, and unavailable services. |
| Full local tests and lint/static checks pass for touched repos | YELLOW | Suite checks pass. Final promotion must record current CivicRecords AI and CivicClerk repo-local tests for the promotion branch or state an intentional deferral. |
| Module release scripts pass where present | YELLOW | Final promotion must record `scripts/verify-release.sh` or equivalent per touched starter repo where present. |
| Required documentation updated | YELLOW | Starter outside-test docs exist. Final promotion must update README, changelog, user manual, security/release notes, docs index, and installer docs as one release-truth set. |
| Independent release-gate audit has no unresolved Blocker or Critical findings | RED | No final independent public-use release-gate audit is recorded for promotion beyond beta.4. |
| Installer/module-selection integration proven | GREEN | The `clerk-core` profile selects CivicCore, CivicRecords AI, and CivicClerk and has package lifecycle proof. |
| CI is green after push, merge, and release-truth move | YELLOW | beta.4 CI was green. Final promotion needs fresh CI on the final promotion SHA. |

## Required Next Implementation Slices

1. Public/staff route inventory: enumerate every installed CivicRecords AI and
   CivicClerk public/staff route and map each to desktop/mobile QA evidence.
2. UI state matrix: record loading, success, empty, error, and partial states
   for each user-facing route, including actionable copy and keyboard/focus
   behavior.
3. Adversarial integration mocks: test bad inputs, missing context, spoofed or
   missing staff roles, stale data, unavailable module dependencies, failed
   backup/restore preconditions, and public/staff permission boundaries.
4. Per-repo promotion checks: run and record current CivicRecords AI and
   CivicClerk tests, lint/static checks, and release verifier scripts where
   present.
5. Independent public-use release-gate audit: require no unresolved Blocker or
   Critical findings before any release label moves beyond outside-test beta.
6. Final release-truth package: update suite docs, installer docs, compatibility
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
