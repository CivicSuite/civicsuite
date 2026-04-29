# Governance

## Continuity

Continuity is now an explicit suite gate, not a deferred governance aspiration.

- Continuity plan: [`../../SUCCESSION.md`](../../SUCCESSION.md)
- Charter: [`../../CHARTER.md`](../../CHARTER.md)
- Roadmap: [`../roadmap/index.md`](../roadmap/index.md)

As of 2026-04-29, the `CivicSuite` GitHub org still has a single visible member/owner (`scottconverse`). `Phase 1` platform expansion does not begin until `Phase 0` continuity exit criteria are met.

## Maintainership

Scott Converse is the founding maintainer of the `civicsuite` umbrella, `civiccore`, and `civicrecords-ai` repositories. The continuity goal is to move from implicit single-maintainer custody to explicit shared custody with documented recovery and handoff procedures.

Community contributions are welcomed via pull request to any repository. See [`../../CONTRIBUTING.md`](../../CONTRIBUTING.md) for the bug-routing decision tree and contribution process.

## Licensing Posture

The full license matrix is documented in [`../../CONSISTENCY.md`](../../CONSISTENCY.md) section 6. Summary:

- Code: Apache License 2.0
- Documentation: CC BY 4.0
- Prompt libraries, if separated: CC BY-SA 4.0
- Third-party dependencies: permissive or weak-copyleft only; AGPL and GPL-3.0 are blocked
- Redis: pinned `<8.0` (BSD); never the SSPL releases

## Security Disclosure

Report security vulnerabilities by opening a private GitHub Security Advisory on the affected repository. Do not file public issues for suspected vulnerabilities. The maintainer will acknowledge within 72 hours and coordinate a fix and disclosure timeline with the reporter.
