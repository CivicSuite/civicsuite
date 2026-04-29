# CivicSuite Continuity And Succession

This document is the continuity gate for CivicSuite. It exists to make sure the suite can continue operating if the founding maintainer is unavailable.

`Phase 1` platform expansion does **not** begin until the `Phase 0` exit criteria described here are met.

## Current Status

Status snapshot: **2026-04-29**

| Item | Status | Target |
|---|---|---|
| `SUCCESSION.md` on file | Complete | 2026-04-29 |
| Second GitHub org owner added | Pending | 2026-05-05 |
| Release-signing and credential custody documented | In progress | 2026-05-05 |
| Recovery and handoff procedures documented | In progress | 2026-05-05 |
| `Phase 0` complete | Blocked on second owner + custody review | Before `Phase 1` begins |

## Scope

This document covers:

- GitHub org continuity
- release-signing and credential custody
- emergency access and handoff procedures
- release-critical repository ownership
- the minimum information a second maintainer needs to continue operations

This document does **not** replace repo-specific operational runbooks. It identifies the continuity requirements that must exist above them.

## Required Deliverables

`Phase 0` requires all of the following:

1. A second GitHub org owner is active in `CivicSuite`.
2. Release-signing custody and package-publishing custody are documented.
3. Credential custody and emergency access expectations are documented.
4. Release-critical repos and their continuity roles are documented.
5. A second maintainer can continue releases and governance work without relying on unwritten knowledge.

## Release-Critical Repositories

These repos are continuity-critical:

- `civicsuite`
- `civiccore`
- `civicrecords-ai`
- any module repo currently in the shipping or productizing tiers

Each release-critical repo must always have:

- at least one documented primary maintainer
- at least one documented continuity backup
- a known release procedure
- a known rollback path
- a known documentation truth source

## Custody Expectations

The continuity model is shared custody, not single-person memory.

### GitHub Org Custody

- `CivicSuite` must have at least two org owners
- admin access must not depend on a single personal account
- branch-protection changes, repo transfers, and release-admin actions must be recoverable by a second owner

### Release Custody

- GitHub release permissions for shipping and productizing repos must be available to the second owner
- package-publishing access for `civiccore` must be documented
- any signing workflow, checksum publication workflow, or installer publication workflow must be documented end to end

### Credential Custody

- the location and ownership model for release-critical credentials must be documented
- the recovery path for lost local access must be documented
- no continuity procedure should require writing secrets into repo docs

## Minimum Recovery Packet

The second maintainer must be able to locate, without asking:

- the canonical roadmap
- the compatibility matrix
- the release procedure for `civiccore`
- the release procedure for `civicrecords-ai`
- the current shipping/productizing/foundation taxonomy
- the current continuity status
- the repo containing each active suite runbook

Current pointers:

- roadmap: [`docs/roadmap/index.md`](docs/roadmap/index.md)
- compatibility matrix: [`docs/compatibility/index.md`](docs/compatibility/index.md)
- governance index: [`docs/governance/index.md`](docs/governance/index.md)
- charter: [`CHARTER.md`](CHARTER.md)

## Exit Criteria

`Phase 0` is complete only when:

- a second GitHub org owner has been added
- custody expectations have been reviewed and accepted
- continuity documentation is current
- the suite no longer depends on one person’s implicit operational knowledge

Until then, continuity remains an active blocker on deeper roadmap execution.
