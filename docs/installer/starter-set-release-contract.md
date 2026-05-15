# Starter-Set Release Contract

Status: maintained installer contract for the CivicCore + CivicRecords AI +
CivicClerk starter set.

Last verified: 2026-05-15.

## Scope

The starter set is the first operator-facing CivicSuite install target:

- CivicCore installs first and remains non-selectable because every module
  depends on it.
- CivicRecords AI and CivicClerk are selectable modules in the custom profile
  and are both included by default in the `clerk-core` profile.
- macOS archives and wrapper manifests are generated, but macOS lifecycle testing is intentionally on hold. Linux and Windows proof are the priority.

Outside-party testing instructions live in
[`starter-set-outside-test-guide.md`](starter-set-outside-test-guide.md).

This contract does not promote the rest of the suite as product-ready. Later
modules must earn their own installer proof before they become part of an
operator default profile.

## Version Pair

The maintained starter-set pair for this slice is:

| Component | Release | Contract |
|---|---:|---|
| CivicCore | 1.1.0 current platform release | Installs first in the umbrella installer and provides the shared platform baseline. |
| CivicRecords AI | 1.6.1 | Selectable records module; runtime line remains pinned to CivicCore 1.0.1 while the shared platform advances. |
| CivicClerk | 1.0.1 | Selectable clerk module; `/health` must report `version=1.0.1` and `civiccore=1.0.1`. |

The CivicCore 1.1.0 release is the current shared-platform release for new
suite planning. CivicRecords AI v1.6.1 and CivicClerk v1.0.1 still consume the
published CivicCore v1.0.1 wheel, so their runtime proof must verify the module
health surfaces instead of assuming the umbrella platform version is the same as
the module dependency pin.

## Installer Contract

The umbrella installer contract is enforced by
`python scripts/verify-installer-plan.py`:

- `clerk-core` resolves to `civiccore`, `civicrecords-ai`, `civicclerk` in that
  order.
- `custom --module civicrecords-ai --module civicclerk` still resolves
  CivicCore first.
- Generated Linux, Windows, and macOS archives exclude local state such as
  virtual environments, test reports, `.agent-runs`, `.env`, build outputs, and
  module-local generated artifacts.
- Generated package README and launcher files warn that the public installer is
  intentionally unsigned, explain expected OS warnings, and require SHA256 plus
  official-source verification before bypassing those warnings.

## Runtime Contract

The maintained runtime proof path is
`python scripts/run-clerk-core-installer.py install`, followed by `verify`,
`repair`, and `uninstall` on the same host class.

The `verify` mode must check:

- CivicRecords AI API health.
- CivicRecords AI web health.
- CivicClerk API health.
- CivicClerk web health.
- CivicClerk protected-default staff auth, including denied anonymous staff
  writes.
- Starter-set CivicCore contract: CivicRecords AI reports v1.6.1, and
  CivicClerk reports v1.0.1 with CivicCore v1.0.1.

This is a release contract for the starter-set installer and module runtime
pairing. It is not yet a claim that CivicRecords AI and CivicClerk exchange workflow records with each other through a live cross-module business API.
That workflow-level handoff remains a follow-on productization slice after the
installer can reliably install, verify, repair, and remove the starter set on
Linux and Windows.
