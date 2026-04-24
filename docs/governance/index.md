# Governance

## Maintainership

Scott Converse is the initial maintainer of the civicsuite umbrella, civiccore,
and civicrecords-ai repositories. Module repositories adopt their own
maintainer line as they ship.

Community contributions are welcomed via pull request to any repository.
See [`../CONTRIBUTING.md`](../CONTRIBUTING.md) for the bug-routing decision
tree.

## Licensing posture

The full license matrix is documented in
[`../../CONSISTENCY.md`](../../CONSISTENCY.md) section 6. Summary:

- Code: MIT License (every code repo)
- Documentation: CC BY 4.0
- Prompt libraries (if separated): CC BY-SA 4.0
- Third-party dependencies: permissive or weak-copyleft only; AGPL and
  GPL-3.0 are blocked at the dependency manager level.
- Redis: pinned `<8.0` (BSD); never the SSPL releases.

There is no "MIT 2.0." If any draft or third-party document references it,
correct it.

## Security disclosure

Report security vulnerabilities by opening a private GitHub Security
Advisory on the affected repository. Do not file public issues for
suspected vulnerabilities. The maintainer will acknowledge within 72 hours
and coordinate a fix and disclosure timeline with the reporter.
