# CivicCode Release Gate Packet - 2026-05-26

## 1. Verdict

GREEN. CivicCode is finished as the current municipal-code release car in the
recorded evidence reviewed this run. The current release is `v1.0.8`, which
supersedes the older `v1.0.0` posture.

## 2. Claim Verification Matrix

| Claim | Evidence | Status |
| --- | --- | --- |
| CivicCode current release is `v1.0.8` | CivicCode `pyproject.toml`, README/manual/changelog, `scripts/verify-release.sh`, live GitHub release | PASS |
| Release assets exist | Live `v1.0.8` release includes wheel, sdist, SHA256SUMS, attestation JSON, attestation bundle | PASS |
| CivicCode consumes CivicCore shared ingestion | `pyproject.toml` pins CivicCore `v1.2.0`; README/manual and Longmont proof reference shared ingestion | PASS |
| Local release verifier passes | `bash scripts/verify-release.sh` ended `VERIFY-RELEASE: PASSED` | PASS |
| Suite truth recognizes CivicCode | `verify-suite-state.py --remote-only` printed `[civiccode] PASS 1.0.8` | PASS |
| City-core profile includes CivicCode | Suite verifier printed `[city-core-profile] PASS civiccore,civicrecords-ai,civicclerk,civiccode` | PASS |
| Installer plan verifies | `python scripts\verify-installer-plan.py` printed `VERIFY-INSTALLER-PLAN: PASSED` | PASS |
| Umbrella docs verify | `bash scripts/verify-docs.sh` printed `PASS` | PASS |
| Release-lockstep gate | Not applicable because this evidence-only branch did not change a release-tag truth artifact set | N/A |
| Docs are complete for the release standard | README, CHANGELOG, CONTRIBUTING, LICENSE, `.gitignore`, docs index, user manual, landing page, architecture/ADR docs, discussion seed present | PASS |
| Browser UX evidence exists and was re-run | CivicCode release verifier public browser QA passed 12 scenarios with zero console/page errors | PASS |
| Queued modules were not touched | No CivicAccess/CivicZone/CivicPlan/CivicPermit/CivicInspect implementation changes | PASS |

## 3. Durable Artifact Reads

- `.agent-workflows/reports/20260526-civiccode-forensic-inventory.md`
- `.agent-workflows/reports/20260526-civiccode-gap-audit.md`
- `.agent-runs/2026-05-26-civiccode-finish-release/implementation-report.md`
- `.agent-runs/2026-05-26-civiccode-finish-release/verification-report.md`
- CivicCode `README.md`, `USER-MANUAL.md`, `CHANGELOG.md`, `docs/index.html`
- CivicSuite `STATUS.md`, `CHANGELOG.md`, `docs/CivicSuiteUnifiedSpec.md`,
  `docs/release-recovery-status.md`,
  `docs/release-lockstep/downstream-pins.md`, `installer/modules.json`

## 4. Substantive Content Checks

- CivicCode public and staff product docs describe the legal-boundary model:
  cited answers, non-authoritative summaries, staff-review-required local AI
  output, no legal determinations.
- CivicCode docs describe non-technical user flow under `/civiccode` and
  technical operator flow for install, Docker demo, migration, smoke, and
  backup/restore rehearsal.
- CivicCode docs and QA evidence include Longmont full-PDF shared-ingestion
  proof through CivicCore.
- Release verifier proves tests, docs, Ruff, frontend build/typecheck, browser
  QA, build artifacts, and SHA256SUMS generation.

## 5. Drift Matrix

| Drift | Bad state | Replacement / fix |
| --- | --- | --- |
| Active target drift | Older control-plane text still points at later CivicInspect work, while the current owner directive says CivicCode | Pipeline manifest records a scoped override and policy accepted it |
| Root queue vintage | Root queue still phrases target as CivicCode `v1.0.0`; current shipped car is `v1.0.8` | This packet records `v1.0.8` as the current release and treats `v1.0.0` as superseded |
| Prior chat ambiguity | CivicCode was discussed as unfinished despite current evidence | This run verified current release, suite, docs, and local release gates |

## 6. Working Tree And Live Remote State

- CivicCode local branch: `main...origin/main`, HEAD `d2eaf13`.
- CivicCode local working tree: clean after release verification.
- CivicSuite umbrella worktree: contains pipeline/evidence changes for this run
  and the scope override ledger entry.
- CivicCode latest remote verify: run `26386022737`, success.
- CivicCode `v1.0.8` release workflow: run `26333381386`, success.
- CivicSuite latest remote verify: run `26418533662`, success.
- CivicSuite latest remote installer-cleanroom: run `26418533704`, success.
- Local umbrella docs verifier passed.
- Local umbrella installer-plan verifier passed.
- Local release-lockstep verifier was not applicable for this evidence-only
  branch because no release-tag truth artifact set changed.

## 7. Unreported Catches

- The pipeline manifest initially used a nested `target_repos` shape that this
  repo's stdlib schema parser rejects. The manifest was corrected and re-pinned.
- Scope lock initially pointed at a non-rung control file. A run-local numeric
  release-plan rung was added and `check_scope_lock.py` passed.
- Preflight logged an active-target override because the local control-plane
  had drifted beyond Scott's current CivicCode directive.

## 8. Open Caveats / Release Risks

- INTENTIONAL DEFERRAL: No new release tag was created because current `v1.0.8`
  release evidence already satisfies the CivicCode target.
- INTENTIONAL DEFERRAL: No release-tag PR is required for this evidence-only
  closure packet; release-lockstep remains required for future release-truth
  artifact changes.
- INTENTIONAL DEFERRAL: This packet does not claim procurement readiness,
  production hosting certification, external municipal validation, airgap
  readiness, signed/non-warning installers, or macOS lifecycle certification.
- INTENTIONAL DEFERRAL: Queued module implementation remains out of scope.

## 9. Paste-Ready Directive

Continue from the CivicCode release-gate packet only if new evidence contradicts
this packet.

Current context:

- CivicCode repo: `C:\dev\Claude\civiccode`
- CivicCode HEAD: `d2eaf13`
- CivicCode release: `v1.0.8`
- CivicSuite worktree:
  `C:\dev\Claude\CivicSuite-city-core-caboose-item1`
- Pipeline run: `.agent-runs/2026-05-26-civiccode-finish-release`

Commands to rerun:

```powershell
cd C:\dev\Claude\civiccode
bash scripts/verify-release.sh

cd C:\dev\Claude\CivicSuite-city-core-caboose-item1
python scripts\verify-suite-state.py --remote-only
python scripts\policy\run_all.py --run 2026-05-26-civiccode-finish-release
```

Acceptance criteria:

- `VERIFY-RELEASE: PASSED`
- `[civiccode] PASS 1.0.8`
- `[city-core-profile] PASS civiccore,civicrecords-ai,civicclerk,civiccode`
- `POLICY: ALL CHECKS PASSED`
- no current-facing doc demotes CivicCode below `v1.0.8`
- no queued module files are changed

Halt triggers:

- any release verifier failure;
- any suite verifier failure for CivicCode;
- any request to rewrite public tags/assets;
- any queued module implementation;
- any new Blocker/Critical finding.

Forbidden claims/actions:

- Do not claim procurement-ready, production-certified, externally validated,
  airgap-ready, signed/non-warning installer ready, or macOS lifecycle certified.
- Do not retag, delete tags, force-push, or rewrite release history.

## 10. Recommended Next Action

Treat CivicCode as finished at `v1.0.8`. The next work should be a separate
owner-authorized target, not additional CivicCode implementation.
