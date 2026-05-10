# Downstream Pin Lockstep Record

Status date: 2026-05-10

This file records the downstream module version/pin changes that accompany the
umbrella release-truth updates. It exists because the CivicSuite org uses
separate repositories, so a single GitHub PR cannot literally touch every
module `pyproject.toml` and the umbrella docs at the same filesystem path.

For this recovery batch:

| Repo | Branch | Package version | CivicCore pin |
|---|---|---:|---|
| CivicSuite/civiccode | `release/demote-false-v1` | 0.5.0 | `civiccore-1.0.0-py3-none-any.whl#sha256=92d3d9984e3b3651586a342503f0789464b7618a2a030fce91d736e199d696e0` |
| CivicSuite/civiczone | `release/demote-false-v1` | 0.2.0 | same hash-locked CivicCore wheel |
| CivicSuite/civicplan | `release/demote-false-v1` | 0.2.0 | same hash-locked CivicCore wheel |
| CivicSuite/civicpermit | `release/demote-false-v1` | 0.2.0 | same hash-locked CivicCore wheel |
| CivicSuite/civicinspect | `release/demote-false-v1` | 0.2.0 | same hash-locked CivicCore wheel |
| CivicSuite/civicgrants | `release/demote-false-v1` | 0.2.0 | same hash-locked CivicCore wheel |
| CivicSuite/civicprocure | `release/demote-false-v1` | 0.2.0 | same hash-locked CivicCore wheel |

For the CivicCore v1.0.1 security-hardening recovery patch:

| Repo | PR | Package version | CivicCore pin |
|---|---:|---:|---|
| CivicSuite/civicinspect | #8 | 0.2.0 | `civiccore-1.0.1-py3-none-any.whl#sha256=561d7a8f73260d50de79351d330876d2cb3488c0e046a2888e82fe09d1e03969` |
| CivicSuite/civiczone | #17 | 0.2.0 | same hash-locked CivicCore wheel |
| CivicSuite/civicgrants | #7 | 0.2.0 | same hash-locked CivicCore wheel |
| CivicSuite/civicprocure | #7 | 0.2.0 | same hash-locked CivicCore wheel |
| CivicSuite/civiccode | #54 | 0.5.0 | same hash-locked CivicCore wheel |
| CivicSuite/civicplan | #9 | 0.2.0 | same hash-locked CivicCore wheel |
| CivicSuite/civicpermit | #10 | 0.2.0 | same hash-locked CivicCore wheel |
| CivicSuite/civicclerk | #155 | 1.0.0 | same hash-locked CivicCore wheel |

For the CivicClerk v1.0.1 QA-001 security-default recovery patch:

| Repo | PR | Package version | CivicCore pin |
|---|---:|---:|---|
| CivicSuite/civicclerk | #156 | 1.0.1 | `civiccore-1.0.1-py3-none-any.whl#sha256=561d7a8f73260d50de79351d330876d2cb3488c0e046a2888e82fe09d1e03969` |

The matching umbrella truth files are:

- `docs/CivicSuiteUnifiedSpec.md`
- `docs/release-recovery-status.md`
- `docs/compatibility/index.md`
- `scripts/verify-suite-state.py`
- `installer/modules.json`
- `CHANGELOG.md`

