# ADR-0003: CivicCore Alembic baselines after the Phase-2 extensions migration

## Status

Accepted — 2026-04-23.

## Context

Spec `02_CivicCore.md` section 14 says civiccore seeds its Alembic version history "starting from the latest CivicRecords AI migration that touched a shared table." Day-3 inventory found that the most recent multi-shared-table migration is `backend/alembic/versions/787207afc66a_phase2_extensions_12_new_tables_and_.py`, which creates **12 tables** in a single revision spanning both CivicCore-owned and records-owned ownership zones (per spec section 10).

Hand-splitting that migration into a civiccore migration plus a records migration would require rewriting both halves, modifying every existing deployment's Alembic history, and risks breakage for cities currently running CivicRecords AI v1.2.x.

Day-3 inventory Section F.2, reviewed 2026-04-23 by audit agent: "Don't hand-split. Write an ADR with the exact baseline revision and upgrade story."

## Decision

Civiccore's Alembic baseline is the **revision immediately after `787207afc66a`**. (The exact rev id is determined when the Phase-1 PR opens — at the time of writing, `787207afc66a` is the head of the records repo's `migrations/versions/` directory; the baseline is `head + 1` whatever that becomes.)

Mechanics:

1. **Civiccore's baseline migration** declares the shared-table schema using `CREATE TABLE IF NOT EXISTS` semantics (or wraps `op.create_table` in an Alembic-friendly conditional via `inspect(connection).get_table_names()`). It is a no-op against any database that already ran `787207afc66a`.

2. **Existing CivicRecords AI deployments** upgrade civiccore for the first time by running:
   ```
   civiccore-migrate stamp head
   civiccore-migrate upgrade head
   ```
   The `stamp head` recognizes that the shared tables already exist (they were created by `787207afc66a`) and marks civiccore's history as caught up. Subsequent civiccore migrations apply normally.

3. **Fresh installs** run `civiccore-migrate upgrade head` first (which creates the shared tables), then `civicrecords-migrate upgrade head` (whose `787207afc66a` becomes a no-op for the shared portions through the same idempotent guards).

4. **Records keeps `787207afc66a` intact in its own history.** No surgical rewrite. The migration's "ownership" lives in records repo for backward-compatibility purposes; civiccore's baseline gives the same end-state for fresh installs without touching the records migration.

The records-side migration runner is taught (in the Phase-1 PR) to defer shared-table creation to civiccore: it queries Alembic's version table for `civiccore` first, and skips its own shared-table operations if civiccore is at-or-above the baseline.

## Consequences

- Existing v1.2.x deployments upgrade with one extra `stamp head` command. Document this in the records v1.3 release notes and in civiccore v0.1.0's CHANGELOG.
- Fresh deployments need both runners invoked in order. The `civiccore` and `civicrecords-ai` packages each ship a `migrate` entry-point script; documentation calls them out explicitly.
- The "split the migration in place" alternative is rejected: too risky for a project whose core promise is sovereignty (cities can't roll back if a migration breaks).
- This decision applies only to the cross-cutting `787207afc66a`. All future civiccore migrations are clean and standalone.
