# ADR 0001 — Canonical architectural decisions live in the unified spec

Status: Accepted
Date: 2026-05-13
Decider: Scott (project owner)

## Context

CivicSuite has dozens of closed architectural decisions: messaging substrate (NATS JetStream), Whisper runtime (faster-whisper / CTranslate2), license (Apache 2.0 code, CC BY 4.0 docs), repository layout (monorepo with `civiccast.*` and `civicsuite.*` namespace packages), database (PostgreSQL 17 + pgvector), frontend stack (React 18 + Vite + TS + Tailwind + shadcn/ui), the three-surface model (Staff / Resident / IT-Admin), the three-tier publish for public records (portal + Internet Archive + syndication), and many others.

Those decisions currently live inline in [`docs/CivicSuiteUnifiedSpec.md`](../CivicSuiteUnifiedSpec.md), particularly §22 ("Open and closed decisions"), the module-specific canonical-scope sections (§8 CivicRecords, §9 CivicClerk, §10 CivicZone, §11 CivicCode, §12 CivicAccess), the standard module architecture in §5, and the non-negotiables in §4.

The `agent-pipeline-claude` plugin's `check_adr_gate.py` policy enforces that any manifest naming a `closed_decision` has a corresponding ADR under `docs/adr/`. Without at least one ADR file present, the gate disables itself, and the pipeline silently loses a verification surface.

## Decision

Until each closed decision is extracted into its own per-decision ADR, **this ADR (0001) stands as the bridging document**. Manifests that name a `closed_decision` may reference this ADR file, and the closed decision itself must trace to a specific section of `docs/CivicSuiteUnifiedSpec.md`.

This activates `check_adr_gate.py` for CivicSuite from day one of pipeline-driven work, even before per-decision ADRs are extracted.

## Consequences

- **Positive.** The ADR policy gate is live. Manifests cannot silently invoke a closed decision without anchoring it to a spec section.
- **Positive.** The unified spec remains the single readable place to understand "why does CivicSuite work this way." A reader doesn't have to walk 20 ADR files to reconstruct the architecture.
- **Negative.** The bridge is thin. If a manifest names a closed decision, the gate confirms an ADR file exists; the reviewer still has to check that the specific spec section actually supports the decision the manifest is invoking.
- **Mitigation.** As pipeline-driven work touches individual decisions, extract each into its own per-decision ADR (`0002-*.md`, `0003-*.md`, etc.) referencing the same spec section. Over time, the bridge contracts to a small set of decisions that live only here.

## Migration path

When a per-decision ADR is extracted:

1. Create `docs/adr/NNNN-<slug>.md` with Context / Decision / Consequences sections.
2. The new ADR cites the unified spec section it formalized.
3. Future manifests reference the new ADR by number instead of this bridge.

## References

- `docs/CivicSuiteUnifiedSpec.md` — canonical source of closed decisions.
- `.pipelines/roles/manifest-drafter.md` — the role that names `closed_decision` in manifests.
- `scripts/policy/check_adr_gate.py` — the policy gate this ADR activates.
