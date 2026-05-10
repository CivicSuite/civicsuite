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

The matching umbrella truth files are:

- `docs/CivicSuiteUnifiedSpec.md`
- `docs/release-recovery-status.md`
- `docs/compatibility/index.md`
- `scripts/verify-suite-state.py`
- `installer/modules.json`
- `CHANGELOG.md`

