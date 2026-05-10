# CivicClerk B1 Security Default Complete - 2026-05-10

## Scope

Active target: CivicClerk B1 security default and v1.0.1 recovery patch.

Goal: change CivicClerk's default staff auth mode from `open` to `protected`, keep `open` as explicit local-rehearsal opt-in, capture browser/UX evidence, publish CivicClerk v1.0.1, and reconcile CivicSuite umbrella truth through the release-lockstep gate.

Status: GREEN.

## CivicClerk Product Work

- PR: https://github.com/CivicSuite/civicclerk/pull/156
- Merge SHA: `c25cded3e913f9d37eee6ac46734088c3573359d`
- Release: https://github.com/CivicSuite/civicclerk/releases/tag/v1.0.1
- v1.0.0 release: marked superseded with a pointer to v1.0.1 and security-hardening language.

Behavior shipped:

- Default staff auth mode is `protected`.
- Anonymous writes to `/meeting-bodies`, `/meetings`, `/motions`, and `/votes` return 401 by default.
- `open` mode remains available only by explicit opt-in for local rehearsal.
- User-facing staff-app copy was updated to explain the protected default and point operators to `/staff/auth-readiness`.

Release artifacts:

| Artifact | SHA256 |
|---|---|
| `civicclerk-1.0.1-py3-none-any.whl` | `e6d9fd34406c1bad74c3400f1a32ae9f4d883bcf455f9c6a05f171d8869b76a7` |
| `civicclerk-1.0.1.tar.gz` | `3ac5baec7ed32b55701ef4f85230404098482beb471377f8324e7e1d9` |

## Browser/UX Evidence

CivicClerk evidence paths:

- `docs/browser-qa-b1-default-protected-summary.md`
- `docs/browser-qa-b1-default-protected-desktop.png`
- `docs/browser-qa-b1-default-protected-mobile.png`
- `docs/browser-qa-v1.0.1-release-desktop.png`
- `docs/browser-qa-v1.0.1-release-mobile.png`

Observed:

- `/staff/auth-readiness` reports `mode == "protected"` by default.
- Anonymous write probes return 401.
- Staff app renders actionable protected-default copy instead of a stack trace.
- Browser console had no page exceptions or runtime crashes beyond expected rejected write requests.

## Verification

CivicClerk local verification before PR:

- `bash scripts/verify-release.sh` passed.
- Backend tests: 588 passed.
- Docs/recovery/secret/import gates passed.
- Browser QA passed.
- Prompt evals passed.
- Frontend build passed.
- Frontend Vitest: 33 passed.
- Frontend Playwright: 4 passed.
- Package build, runtime install proof, and release contract passed.

CivicClerk GitHub CI on PR #156:

- `cleanroom`: passed.
- `verify`: passed.

## Umbrella Truth Reconciliation

- PR: https://github.com/CivicSuite/civicsuite/pull/117
- Merge SHA: `6b4ad386b159b19ef5fb12eaeab585a73264c22f`

Umbrella updates included:

- `docs/CivicSuiteUnifiedSpec.md`
- `scripts/verify-suite-state.py`
- `installer/modules.json`
- `docs/release-recovery-status.md`
- `CHANGELOG.md`
- `docs/compatibility/index.md`
- `docs/release-lockstep/downstream-pins.md`
- `README.md`
- `docs/diagrams/suite-architecture.mmd`
- `docs/diagrams/suite-architecture.svg`
- `docs/roadmap/index.md`
- `scripts/run-clerk-core-installer.py`
- `scripts/verify-installer-plan.py`

Umbrella GitHub CI on PR #117:

- `release-lockstep-gate`: passed.
- `verify`: passed.
- `linux archive full lifecycle`: passed.
- `linux archive readiness and plan`: passed.
- `macos archive readiness and plan`: passed.
- `windows archive readiness and plan`: passed.

Installer behavior now records:

- Default clerk-core install staff mode: `protected`.
- Explicit `--staff-mode open`: allowed, but prints warning.
- Verify mode probes `/staff/auth-readiness` and representative anonymous writes when the CivicClerk API is healthy.

Warning banner:

```text
WARNING: --staff-mode open allows anonymous writes to civicclerk endpoints.
WARNING: Use ONLY for local rehearsal. Never on a network-reachable host.
WARNING: Re-run with --staff-mode protected for any deployment evaluation.
```

## Final Suite Verification

Command:

```text
python scripts/verify-suite-state.py --remote-only
```

Output:

```text
==> CivicSuite suite-state verification
workspace: C:\Users\scott\OneDrive\Desktop\Claude
repos: 26
remote release checks: enabled
local sibling clone checks: disabled
[civiccore] PASS 1.0.1 (CivicSuite/civiccore)
[civicrecords-ai] PASS 1.4.10 (CivicSuite/civicrecords-ai)
[civicclerk] PASS 1.0.1 (CivicSuite/civicclerk)
[civiccode] PASS 0.5.0 (CivicSuite/civiccode)
[civiczone] PASS 0.2.0 (CivicSuite/civiczone)
[civicaccess] PASS 0.1.1 (CivicSuite/civicaccess)
[civicplan] PASS 0.2.0 (CivicSuite/civicplan)
[civicpermit] PASS 0.2.0 (CivicSuite/civicpermit)
[civicinspect] PASS 0.2.0 (CivicSuite/civicinspect)
[civicgrants] PASS 0.2.0 (CivicSuite/civicgrants)
[civicprocure] PASS 0.2.0 (CivicSuite/civicprocure)
[civiccontracts] PASS 0.1.1 (CivicSuite/civiccontracts)
[civicboards] PASS 0.1.1 (CivicSuite/civicboards)
[civicnotice] PASS 0.1.1 (CivicSuite/civicnotice)
[civic311] PASS 0.1.1 (CivicSuite/civic311)
[civiccomms] PASS 0.1.1 (CivicSuite/civiccomms)
[civicdata] PASS 0.1.2 (CivicSuite/civicdata)
[civichr] PASS 0.1.1 (CivicSuite/civichr)
[civicbudget] PASS 0.1.2 (CivicSuite/civicbudget)
[civiclegal] PASS 0.1.2 (CivicSuite/civiclegal)
[civicelections] PASS 0.1.1 (CivicSuite/civicelections)
[civicutility] PASS 0.1.1 (CivicSuite/civicutility)
[civiccourt] PASS 0.1.2 (CivicSuite/civiccourt)
[civicsafety] PASS 0.1.1 (CivicSuite/civicsafety)
[civiclibrary] PASS 0.1.1 (CivicSuite/civiclibrary)
[civicparks] PASS 0.1.1 (CivicSuite/civicparks)
VERIFY-SUITE-STATE: PASSED
```

## Open Work After This Sweep

Recommended next active target:

1. CivicRecords AI CivicCore migration and v1.5.0 release.

Why: CivicRecords AI is real and still pins CivicCore v0.22.1. Migrating it to CivicCore v1.0.1 is the next release-truth blocker and unblocks the future full-suite installer profile.

Then:

2. Installer/macOS certification follow-up.
3. Audit punch-list section B/C/D recovery.

## Caveats

- The umbrella worktree still contains pre-existing unstaged generated installer artifacts and older handoff files. They were intentionally not included in PR #117.
- CivicRecords AI still requires its separate CivicCore v1.0.1 migration sprint.
- The seven demoted releases from PR #115 were not modified.
