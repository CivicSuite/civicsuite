# CivicSuite Project Control Plane

Last updated: 2026-05-09

## Project Goal

Recover CivicSuite from prior fragmented work, finish the installer, then resume module-by-module product recovery until the suite can ship as a real municipal software product.

## Operating Model

- Work from durable state, not memory.
- Keep exactly one active target unless the user explicitly authorizes parallel implementation.
- Batch related work and verification to avoid dragging the user through tiny approval loops.
- Continue within an authorized sprint until a real blocker, destructive action, failed scope boundary, or explicit pause.
- Every recommendation must include the recommendation, the decision, and why.
- Write a handoff before pause, compaction, or long-run transfer.

## Current Scope Boundary

Active target: CivicSuite installer OS cleanroom validation.

Allowed now:

- Inspect installer docs, scripts, generated packages, release artifacts, and cleanroom evidence.
- Build or run validation harnesses needed for Windows/macOS/Linux installer proof.
- Update installer validation docs and evidence.
- Fix installer defects found by cleanroom validation.

Not allowed now:

- Start product module recovery.
- Edit unrelated CivicSuite modules.
- Create releases unrelated to the installer.
- Use destructive host operations.
- Touch secrets, signing keys, paid services, or production systems without explicit approval.

## Definition Of Done For Current Target

The installer validation target is complete only when:

1. Windows install path is validated from a clean extracted release package, or a concrete host/VM blocker is documented with evidence.
2. macOS install path is validated from a clean extracted release package, or a concrete host/VM blocker is documented with evidence.
3. Existing Linux extracted-package lifecycle proof remains passing.
4. Readiness, plan, install, repair, verify, uninstall, and gate behavior are covered where the OS permits.
5. Unsigned beta user guidance is checked against the actual package behavior.
6. Installer docs and checkpoint status match the evidence.
7. If package contents change, artifacts/checksums/release assets are regenerated and verified.
8. A handoff or completion report records all evidence paths and remaining caveats.

## Stop Conditions

Stop and ask before:

- destructive VM/host operations,
- installing privileged host dependencies,
- using paid cloud or Apple/Windows signing infrastructure,
- pushing a new release tag if package contents changed,
- leaving installer validation for module recovery.

## Reporting Format

- Active target:
- Goal:
- Status: RED / YELLOW / GREEN
- Completed:
- Remaining:
- Evidence:
- Next action:
- Scope boundary:

