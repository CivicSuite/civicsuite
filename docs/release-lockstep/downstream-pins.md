# Downstream Pin Lockstep Record

Status date: 2026-05-26

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

For the 2026-05-23 city-core release train:

| Repo | PR / release context | Package version | CivicCore pin |
|---|---:|---:|---|
| CivicSuite/civiccore | v1.2.0 release | 1.2.0 | n/a |
| CivicSuite/civicrecords-ai | v1.7.3 release | 1.7.3 | `civiccore-1.2.0-py3-none-any.whl#sha256=a94ce958e36fb03c8d961e4db4672ce5bcfa25765c57d75886e999cf15703ec7` |
| CivicSuite/civicclerk | v1.0.3 release | 1.0.3 | `civiccore-1.2.0-py3-none-any.whl#sha256=a94ce958e36fb03c8d961e4db4672ce5bcfa25765c57d75886e999cf15703ec7` |
| CivicSuite/civiccode | #70 | 1.0.8 | `civiccore-1.2.0-py3-none-any.whl#sha256=a94ce958e36fb03c8d961e4db4672ce5bcfa25765c57d75886e999cf15703ec7` |

City-core excludes CivicAccess until its depth probe gaps close and a fresh
re-probe passes. CivicZone, CivicPlan, CivicPermit, and CivicInspect are not
city-core cars; their v0.2.2 releases are no-functional-upgrade truth-repair
labels that keep the existing CivicCore v1.1.0 pin.

For the 2026-05-26 city-core non-technical installability PR:

| Repo | PR / branch context | Package version | CivicCore pin |
|---|---:|---:|---|
| CivicSuite/civiccore | PR #63 / `city-core-non-technical-install-city-core` | 1.2.0 | n/a |
| CivicSuite/civicrecords-ai | PR #100 / `city-core-non-technical-install-city-core` | 1.7.3 | `civiccore-1.2.0-py3-none-any.whl#sha256=a94ce958e36fb03c8d961e4db4672ce5bcfa25765c57d75886e999cf15703ec7` |
| CivicSuite/civicclerk | PR #170 / `city-core-non-technical-install-city-core` | 1.0.3 | `civiccore-1.2.0-py3-none-any.whl#sha256=a94ce958e36fb03c8d961e4db4672ce5bcfa25765c57d75886e999cf15703ec7` |
| CivicSuite/civiccode | PR #74 / `city-core-non-technical-install-city-core` | 1.0.8 | `civiccore-1.2.0-py3-none-any.whl#sha256=a94ce958e36fb03c8d961e4db4672ce5bcfa25765c57d75886e999cf15703ec7` |

No downstream package version or CivicCore pin moves in this PR set. The change
records installer/productization evidence for the already named city-core cars:
vendored-source Windows/Linux one-click artifacts, Guided/Manual Docker
prerequisite setup paths, first-run wizard smoke evidence, first-run browser QA, 60 GB cleanroom
hygiene, and matching-host lifecycle evidence under
`C:\Users\scott\OneDrive\Desktop\Claude\CivicSuite-city-core-caboose-item1\.agent-runs\2026-05-26-city-core-non-technical-installable\`.

For the 2026-05-27 P1.2 source-pin bump:

| Repo | Default branch context | Package version | CivicCore pin | Installer source_commit |
|---|---|---:|---|---|
| CivicSuite/civiccore | main | 1.2.0 | n/a | `f39f1afc76b7bc37f63b76e37a9def8bcb9be0fd` |
| CivicSuite/civicrecords-ai | master, post-PR-#100 merge | 1.7.3 | `civiccore-1.2.0-py3-none-any.whl#sha256=a94ce958e36fb03c8d961e4db4672ce5bcfa25765c57d75886e999cf15703ec7` | `59cabcbe5072d0c843fd57356a7d113bf90537f1` |
| CivicSuite/civicclerk | main | 1.0.3 | `civiccore-1.2.0-py3-none-any.whl#sha256=a94ce958e36fb03c8d961e4db4672ce5bcfa25765c57d75886e999cf15703ec7` | `3bf5293dd6a074140690598a244fce324a988143` |
| CivicSuite/civiccode | main | 1.0.8 | `civiccore-1.2.0-py3-none-any.whl#sha256=a94ce958e36fb03c8d961e4db4672ce5bcfa25765c57d75886e999cf15703ec7` | `d2eaf1392c01cb7cc80e6bac3e2fbf8cb0b398e1` |
PR #183 has green verify, release-lockstep-gate, and installer-cleanroom
checks; exact volatile PR run IDs are recorded in the PR body and run
evidence. CivicRecords AI PR #100 is green at `d7f84a3` for CI run
`26487863170`. The status is beta-ready truth-reconciled after audit-full; this is not
public-use readiness, city-ready status, procurement readiness, production
readiness, macOS lifecycle certification, or full-suite promotion.

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

CivicRecords AI and CivicClerk remain on the CivicCore v1.0.1 recovery pin because they were outside the D2/B3 staff-key rollout scope. CivicZone moved to CivicCore v1.1.0 in its active v1.0.0 release.

For the CivicZone v1.0.0 public-use module release:

| Repo | PR | Version | CivicCore pin |
|---|---:|---:|---|
| CivicSuite/civiczone | #18 | 1.0.0 | `civiccore-1.1.0-py3-none-any.whl#sha256=3ab146f4fea2ae99640d5b1b013be1a9676de5f91b783eaeaa913043a2ae2b87` |

CivicZone release `v1.0.0` peels to `46a9b4174a91b9337e0d8d355f999d62ac90c2a1`; release workflow `26225509133` published wheel, sdist, and SHA256SUMS assets. This lockstep record promotes only CivicZone and does not promote CivicPlan, CivicPermit, CivicInspect, CivicGrants, CivicProcure, queued modules, the full suite, live cross-module records exchange, or macOS lifecycle certification.

For the CivicPlan v1.0.0 public-use module release:

| Repo | PR | Version | CivicCore pin |
|---|---:|---:|---|
| CivicSuite/civicplan | #11 | 1.0.0 | `civiccore-1.1.0-py3-none-any.whl#sha256=3ab146f4fea2ae99640d5b1b013be1a9676de5f91b783eaeaa913043a2ae2b87` |

CivicPlan release `v1.0.0` peels to `5e23679f1122cfb0744e8c71aecdf6cf52283bf0`; main verify run `26229109178`, release workflow `26229189252`, and tag verify run `26229189480` passed. Release assets are wheel `sha256:07bb81db2a33840da26442becbc502e849704d8c5c0c450bd94521272e8f89d7`, sdist `sha256:964e61470d45067627bce9284cbc0e6dc5efbabd66860bb6db9c77ffd0467e50`, and SHA256SUMS `sha256:11642940f4acd54ae29483717c4dd4e640521195bbfc05d6608038fba7dd5a78`. This lockstep record promotes only CivicPlan and does not promote CivicPermit, CivicInspect, CivicGrants, CivicProcure, queued modules, the full suite, live cross-module records exchange, or macOS lifecycle certification.

For the CivicPermit v1.0.0 public-use module release:

| Repo | PR | Version | CivicCore pin |
|---|---:|---:|---|
| CivicSuite/civicpermit | #12 | 1.0.0 | `civiccore-1.1.0-py3-none-any.whl#sha256=3ab146f4fea2ae99640d5b1b013be1a9676de5f91b783eaeaa913043a2ae2b87` |

CivicPermit release `v1.0.0` peels to `da4ee8e3194eedc15361cf1baf9bab1e5bce5d6f`; main verify run `26233364327`, release workflow `26233455321`, and tag verify run `26233454863` passed. Release assets are wheel `sha256:8b8e7f206b334cd513458e6829b287b3a01e81bf5ba92fefb51035caff8c6cd7`, sdist `sha256:db41d1080aeda5c1aebe6467bd27817962ffe990180086f11af53cfcd8ee7c02`, and SHA256SUMS `sha256:49dfde33f2b92e27b6db236738dfbb093722743841ee065cd88b2a43f5cf8c08`. This lockstep record promotes only CivicPermit and does not promote CivicInspect, CivicGrants, CivicProcure, queued modules, the full suite, live cross-module records exchange, or macOS lifecycle certification.

For the CivicInspect v1.0.0 public-use module release:

| Repo | PR | Version | CivicCore pin |
|---|---:|---:|---|
| CivicSuite/civicinspect | #10 | 1.0.0 | `civiccore-1.1.0-py3-none-any.whl#sha256=3ab146f4fea2ae99640d5b1b013be1a9676de5f91b783eaeaa913043a2ae2b87` |

CivicInspect release `v1.0.0` peels to `a018241d801feb89e9ff5bf29666edbeda6a2c9a`; main verify run `26236492518`, release workflow `26236555671`, and tag verify run `26236555694` passed. Release assets are wheel `sha256:b03c5345eee8c2266af8e2135c959ab33e06b7e881bcad10ed63b5d2b18c0ffe`, sdist `sha256:910fe253cd878fa7211e6a374972e69f24355c20ba1018627e98ecb0d6ce9811`, and SHA256SUMS `sha256:cf97455ff0bbdfe2834a8771c6089bb57e93c1bfe9b59159b1b9b44e88263d87`. This lockstep record promotes only CivicInspect and does not promote CivicGrants, CivicProcure, queued modules, the full suite, live cross-module records exchange, or macOS lifecycle certification.

For the CivicCode v1.0.8 city-core release car:

| Repo | PR | Package version | CivicCore pin |
|---|---:|---:|---|
| CivicSuite/civiccode | #70 | 1.0.8 | `civiccore-1.2.0-py3-none-any.whl#sha256=a94ce958e36fb03c8d961e4db4672ce5bcfa25765c57d75886e999cf15703ec7` |

CivicCode v1.0.8 supersedes the earlier v1.0.0 release posture and uses the
published CivicCore v1.2.0 release wheel. Its own release wheel is
`civiccode-1.0.8-py3-none-any.whl#sha256=88e7842a2c17c171f741d56a1b320d7967990fc0ebbd19b7647b8dfaddb3ccc4`.
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

For the Clerk-Core beta.4 release package:

| Repo | PR | Package version | CivicCore pin |
|---|---:|---:|---|
| CivicSuite/civicrecords-ai | n/a | 1.6.1 | `civiccore-1.0.1-py3-none-any.whl#sha256=561d7a8f73260d50de79351d330876d2cb3488c0e046a2888e82fe09d1e03969` |
| CivicSuite/civicclerk | n/a | 1.0.1 | `civiccore-1.0.1-py3-none-any.whl#sha256=561d7a8f73260d50de79351d330876d2cb3488c0e046a2888e82fe09d1e03969` |

No downstream module pin moves for beta.4. The current umbrella release tag is
`installer-clerk-core-v0.1.0-beta.4`; it supersedes beta.3 without rewriting the
public beta.3 tag. The generated SHA256 artifacts are published on the GitHub
release. This remains an unsigned OSS beta outside-test
artifact, not a procurement-ready or city-ready release.

The matching umbrella truth files are:

- `docs/CivicSuiteUnifiedSpec.md`
- `docs/release-recovery-status.md`
- `docs/compatibility/index.md`
- `scripts/verify-suite-state.py`
- `installer/modules.json`
- `CHANGELOG.md`

For the Clerk-Core public-use readiness gate:

| Repo | PR | Package version | CivicCore pin |
|---|---:|---:|---|
| CivicSuite/civicrecords-ai | n/a | 1.6.1 | `civiccore-1.0.1-py3-none-any.whl#sha256=561d7a8f73260d50de79351d330876d2cb3488c0e046a2888e82fe09d1e03969` |
| CivicSuite/civicclerk | n/a | 1.0.1 | `civiccore-1.0.1-py3-none-any.whl#sha256=561d7a8f73260d50de79351d330876d2cb3488c0e046a2888e82fe09d1e03969` |

No downstream module pin moves for the public-use readiness gate. This umbrella
change records the promotion blocker for moving beyond beta.4; it does not
promote CivicRecords AI, CivicClerk, CivicCore, or the suite installer to a new
release label.

For the Clerk-Core installed route/state matrix evidence:

| Repo | PR | Package version | CivicCore pin |
|---|---:|---:|---|
| CivicSuite/civicrecords-ai | n/a | 1.6.1 | `civiccore-1.0.1-py3-none-any.whl#sha256=561d7a8f73260d50de79351d330876d2cb3488c0e046a2888e82fe09d1e03969` |
| CivicSuite/civicclerk | n/a | 1.0.1 | `civiccore-1.0.1-py3-none-any.whl#sha256=561d7a8f73260d50de79351d330876d2cb3488c0e046a2888e82fe09d1e03969` |

No downstream module pin moves for the route/state matrix evidence. This
umbrella change recorded installed-stack QA and adversarial local integration
evidence for the then-RED public-use gate; it did not promote any module or
installer artifact to a new release label.

For the Clerk-Core public-use starter release:

| Repo | PR | Package version | CivicCore pin |
|---|---:|---:|---|
| CivicSuite/civicrecords-ai | n/a | 1.6.1 | `civiccore-1.0.1-py3-none-any.whl#sha256=561d7a8f73260d50de79351d330876d2cb3488c0e046a2888e82fe09d1e03969` |
| CivicSuite/civicclerk | #161 | 1.0.1 | `civiccore-1.0.1-py3-none-any.whl#sha256=561d7a8f73260d50de79351d330876d2cb3488c0e046a2888e82fe09d1e03969` |

No downstream module pin moves for the Clerk-Core public-use starter release.
The umbrella installer tag is `installer-clerk-core-v0.1.0`. The release covers
only CivicCore, CivicRecords AI, CivicClerk, and the `clerk-core` installer
profile. It does not promote queued modules or claim full-suite readiness,
procurement readiness, production hosting certification, airgap readiness, live
cross-module records exchange, or macOS lifecycle certification.

For the CivicCode v1.0.0 public-use module release:

| Repo | PR | Package version | CivicCore pin |
|---|---:|---:|---|
| CivicSuite/civiccode | #56, #57 | 1.0.0 | `civiccore-1.1.0-py3-none-any.whl#sha256=3ab146f4fea2ae99640d5b1b013be1a9676de5f91b783eaeaa913043a2ae2b87` |

CivicCode is the first post-starter active module to complete source release and
suite installer/module-selection truth reconciliation. The repaired `v1.0.0`
tag peels to `cb5f23eb437863b602df2ba2825bb72fd26e1154`; release workflow run
`26219395141` published the wheel, sdist, SHA256SUMS, release attestation, and
attestation bundle. This promotes CivicCode only. It does not promote queued
modules, the full suite, procurement readiness, production hosting
certification, airgap readiness, live cross-module records exchange, or macOS
lifecycle certification.

For the CivicAccess v1.0.0 public-use module release:

| Repo | PR | Package version | CivicCore pin |
|---|---:|---:|---|
| CivicSuite/civicaccess | #6 | 1.0.0 | `civiccore-1.1.0-py3-none-any.whl#sha256=3ab146f4fea2ae99640d5b1b013be1a9676de5f91b783eaeaa913043a2ae2b87` |

CivicAccess completed source release and suite installer/module-selection truth
reconciliation. The `v1.0.0` tag peels to
`e29e701d96817a1aaca053ae8979851d9fb9dc51`; GitHub release assets include the
wheel, sdist, and SHA256SUMS. This promotes CivicAccess only. It does not
promote queued modules, the full suite, procurement readiness, production
hosting certification, airgap readiness, live cross-module records exchange, or
macOS lifecycle certification.

