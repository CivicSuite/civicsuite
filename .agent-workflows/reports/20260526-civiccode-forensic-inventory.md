# CivicCode Forensic Inventory - 2026-05-26

Pipeline run: `.agent-runs/2026-05-26-civiccode-finish-release`

## Gate Result

The CivicSuite forensic inventory gate is recorded for CivicCode release
completion. This inventory authorizes CivicCode-only release verification and
gap closure. It does not authorize queued module implementation, tag rewriting,
or changes to released CivicCore, CivicRecords AI, or CivicClerk artifacts.

## Active Directive

Scott's current directive is to disregard the immediately prior four-module
and CivicClerk directions, use Agent Pipeline, and finish CivicCode. The root
workspace `ACTIVE_RELEASE_QUEUE.md` names CivicCode only as the active module,
while newer in-repo CivicSuite durable docs already record CivicCode as shipped
at `v1.0.8`. This run reconciles that by verifying the current CivicCode
release state rather than reopening queued modules.

## Local State

- CivicCode repo: `C:\Users\scott\OneDrive\Desktop\Claude\civiccode`
- CivicCode branch: `main...origin/main`
- CivicCode HEAD: `d2eaf13 Merge pull request #73 from CivicSuite/track-c-workflow-contract-tests`
- CivicCode working tree before reports: clean
- CivicSuite umbrella worktree: `C:\Users\scott\OneDrive\Desktop\Claude\CivicSuite-city-core-caboose-item1`
- CivicSuite branch: `track-b-city-core-public-portal-012...origin/main`
- CivicSuite HEAD: `8b03573 Merge pull request #181 from CivicSuite/track-b-city-core-public-portal-012`

## Live Release State

- `CivicSuite/civiccode` release `v1.0.8` is published, non-draft, and not a prerelease.
- `v1.0.8` assets exist:
  - `civiccode-1.0.8-py3-none-any.whl`, digest `sha256:88e7842a2c17c171f741d56a1b320d7967990fc0ebbd19b7647b8dfaddb3ccc4`
  - `civiccode-1.0.8.tar.gz`, digest `sha256:08ab9309b85e6acb41c59781c1e00337858930791f618b135537f38b40d82723`
  - `SHA256SUMS.txt`
  - `release-attestation.json`
  - `release-attestation.json.bundle`
- Older `v1.0.0` release exists as historical/recovered evidence and is
  superseded by `v1.0.8` in current-facing CivicSuite truth.

## Live PR And CI State

- Latest CivicCode PRs are merged through PR #73.
- Latest CivicCode `verify` run on `d2eaf13`: `26386022737`, conclusion `success`.
- CivicCode release workflow for `v1.0.8`: run `26333381386`, conclusion `success`.
- Latest CivicSuite umbrella PR #181 merged at `8b035730781368e3b93568e95f69f3558e144c19`.
- Latest CivicSuite `verify` run `26418533662` and `installer-cleanroom` run
  `26418533704` both concluded `success`.

## Suite Truth

`python scripts\verify-suite-state.py --remote-only` passed from the umbrella
worktree and printed:

- `[civiccore] PASS 1.2.0`
- `[civicrecords-ai] PASS 1.7.3`
- `[civicclerk] PASS 1.0.3`
- `[civiccode] PASS 1.0.8`
- `[city-core-profile] PASS civiccore,civicrecords-ai,civicclerk,civiccode`
- `VERIFY-SUITE-STATE: PASSED`

## CivicCode Source Evidence

The CivicCode repo contains:

- Required documentation artifacts: `README.md`, `CHANGELOG.md`,
  `CONTRIBUTING.md`, `LICENSE`, `.gitignore`, and `docs/index.html`.
- User manual with non-technical and technical sections: `USER-MANUAL.md`.
- Discussion seed: `docs/github-discussions-seed.md`.
- Architecture/implementation references: `docs/index.html`,
  `docs/IMPLEMENTATION_PLAN.md`, `docs/MILESTONES.md`, ADRs under `docs/adr/`.
- Browser/UX evidence under `docs/qa/` and `docs/browser-qa-*`.
- 146 test files under `tests/`.
- Current version surfaces at `1.0.8` in `pyproject.toml`,
  `civiccode/__init__.py`, release docs, and `scripts/verify-release.sh`.
- Published CivicCore dependency pinned to `civiccore v1.2.0` wheel with hash.
- Shared-ingestion and Longmont proof docs under `docs/qa/`.

## Required Inventory Reads

Read or inspected for this inventory:

- `C:\Users\scott\OneDrive\Desktop\Claude\AGENTS.md`
- `C:\Users\scott\OneDrive\Desktop\Claude\ACTIVE_RELEASE_QUEUE.md`
- `C:\Users\scott\OneDrive\Desktop\Claude\CIVICSUITE_AUDIT_GATE.md`
- `.agent-workflows/PROJECT_CONTROL_PLANE.md`
- `.agent-workflows/ACTIVE_WORK_QUEUE.md`
- `README.md`, `STATUS.md`, `CHANGELOG.md`
- `docs/CivicSuiteUnifiedSpec.md`
- `docs/release-recovery-status.md`
- `docs/release-lockstep/downstream-pins.md`
- `installer/modules.json`
- CivicCode `README.md`, `USER-MANUAL.md`, `CHANGELOG.md`, `pyproject.toml`,
  `scripts/verify-release.sh`, workflow list, tests, docs, QA evidence, and
  release artifacts.

## Inventory Decision

CivicCode has current release evidence at `v1.0.8`. The next pipeline action is
not feature implementation; it is gap audit and release-gate confirmation
against the non-technical user/documentation/installer standard.
