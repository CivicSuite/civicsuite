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

- Code: Apache License 2.0 (every code repo)
- Documentation: CC BY 4.0
- Prompt libraries (if separated): CC BY-SA 4.0
- Third-party dependencies: permissive or weak-copyleft only; AGPL and
  GPL-3.0 are blocked at the dependency manager level.
- Redis: pinned `<8.0` (BSD); never the SSPL releases.

Project standardized on Apache License 2.0 for code on 2026-04-23. Earlier drafts referenced MIT; that drift has been corrected. Documentation license (CC BY 4.0) and the optional prompt-library license (CC BY-SA 4.0) are unchanged.

## Security disclosure

Report security vulnerabilities by opening a private GitHub Security
Advisory on the affected repository. Do not file public issues for
suspected vulnerabilities. The maintainer will acknowledge within 72 hours
and coordinate a fix and disclosure timeline with the reporter.
