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

For the CivicRecords AI v1.5.0 CivicCore migration:

| Repo | PR | Package version | CivicCore pin |
|---|---:|---:|---|
| CivicSuite/civicrecords-ai | #69 | 1.5.0 | `civiccore-1.0.1-py3-none-any.whl#sha256=561d7a8f73260d50de79351d330876d2cb3488c0e046a2888e82fe09d1e03969` |

For the CivicCore v1.1.0 staff-key gate release:

| Repo | PR | Package version | CivicCore pin |
|---|---:|---:|---|
| CivicSuite/civiccode | #55 | 0.5.0 | `civiccore-1.1.0-py3-none-any.whl#sha256=3ab146f4fea2ae99640d5b1b013be1a9676de5f91b783eaeaa913043a2ae2b87` |
| CivicSuite/civicplan | #10 | 0.2.0 | same hash-locked CivicCore wheel |
| CivicSuite/civicpermit | #11 | 0.2.0 | same hash-locked CivicCore wheel |
| CivicSuite/civicinspect | #9 | 0.2.0 | same hash-locked CivicCore wheel |
| CivicSuite/civicgrants | #8 | 0.2.0 | same hash-locked CivicCore wheel |
| CivicSuite/civicprocure | #8 | 0.2.0 | same hash-locked CivicCore wheel |

CivicRecords AI, CivicClerk, and CivicZone remain on the CivicCore v1.0.1 recovery pin because they were outside the D2/B3 staff-key rollout scope.

For the CivicRecords AI v1.6.0 B2 Docker secret extraction release:

| Repo | PR | Package version | CivicCore pin |
|---|---:|---:|---|
| CivicSuite/civicrecords-ai | #76 | 1.6.0 | `civiccore-1.0.1-py3-none-any.whl#sha256=561d7a8f73260d50de79351d330876d2cb3488c0e046a2888e82fe09d1e03969` |

CivicRecords AI remains on the CivicCore v1.0.1 recovery pin; the B2 release did not move the CivicCore pin.

For the CivicRecords AI v1.6.1 ingestion worker event-loop recovery patch:

| Repo | PR | Package version | CivicCore pin |
|---|---:|---:|---|
| CivicSuite/civicrecords-ai | #84 | 1.6.1 | `civiccore-1.0.1-py3-none-any.whl#sha256=561d7a8f73260d50de79351d330876d2cb3488c0e046a2888e82fe09d1e03969` |

CivicRecords AI remains on the CivicCore v1.0.1 recovery pin; the v1.6.1 patch did not move the CivicCore pin.

For the Clerk-Core City Release setup:

| Repo | PR | Package version | CivicCore pin |
|---|---:|---:|---|
| CivicSuite/civicregwatch | n/a | planned, no runtime repo | n/a |
| CivicSuite/civicapi | n/a | planned, no runtime repo | n/a |

CivicRegWatch and CivicAPI are spec/planning entries only. This umbrella change records them as planned, non-selectable installer modules and does not move any downstream package pin.

For the Clerk-Core installed workflow proof:

| Repo | PR | Package version | CivicCore pin |
|---|---:|---:|---|
| CivicSuite/civicrecords-ai | n/a | 1.6.1 | `civiccore-1.0.1-py3-none-any.whl#sha256=561d7a8f73260d50de79351d330876d2cb3488c0e046a2888e82fe09d1e03969` |
| CivicSuite/civicclerk | n/a | 1.0.1 | `civiccore-1.0.1-py3-none-any.whl#sha256=561d7a8f73260d50de79351d330876d2cb3488c0e046a2888e82fe09d1e03969` |

No downstream module pin moved for this slice. The umbrella installer proof now exercises the installed starter profile's CivicRecords AI request/search-surface/review/response path and CivicClerk agenda/packet/minutes/vote/notice/archive path, but it does not promote either module to a new release label and does not claim live cross-module record exchange.

For the Clerk-Core beta.3 release-gate package:

| Repo | PR | Package version | CivicCore pin |
|---|---:|---:|---|
| CivicSuite/civicrecords-ai | n/a | 1.6.1 | `civiccore-1.0.1-py3-none-any.whl#sha256=561d7a8f73260d50de79351d330876d2cb3488c0e046a2888e82fe09d1e03969` |
| CivicSuite/civicclerk | n/a | 1.0.1 | `civiccore-1.0.1-py3-none-any.whl#sha256=561d7a8f73260d50de79351d330876d2cb3488c0e046a2888e82fe09d1e03969` |

No downstream module pin moves for beta.3. The current umbrella release tag is
`installer-clerk-core-v0.1.0-beta.3`; it superseded beta.2 after the
release-tag PR passed release-lockstep and the generated SHA256 artifacts were
published on the GitHub release. This remains an unsigned OSS beta outside-test
artifact, not a procurement-ready or city-ready release.

The matching umbrella truth files are:

- `docs/CivicSuiteUnifiedSpec.md`
- `docs/release-recovery-status.md`
- `docs/compatibility/index.md`
- `scripts/verify-suite-state.py`
- `installer/modules.json`
- `CHANGELOG.md`

