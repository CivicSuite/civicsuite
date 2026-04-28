# Architecture Decision Records

Cross-module architectural decisions are recorded here as ADRs. Each ADR is a
single markdown file named `ADR-NNNN-short-title.md`.

ADRs scoped to a single module live in that module's repo, not here. Use this
folder for decisions that affect two or more modules, the platform contract, or
the suite as a whole.

## Index

- [ADR-0001: Extract CivicCore first](ADR-0001-extract-civiccore-first.md)
- [ADR-0002: SQLAlchemy declarative Base lives in civiccore.models.base](ADR-0002-base-declarative-class-ownership.md)
- [ADR-0003: CivicCore Alembic baselines after the Phase-2 extensions migration](ADR-0003-civiccore-alembic-baseline-strategy.md)
- [ADR-0004: Shared shell boundaries before frontend package extraction](ADR-0004-shared-shell-boundaries.md)
- [ADR-0005: Connector import/export boundaries before vendor write-back](ADR-0005-connector-import-export-boundaries.md)
