# ADR-0011: Townlight Names Products And One Manifest Declares Suite State

Status: accepted
Date: 2026-08-17

## Context

The project has moved to the `townlight` GitHub organization, but current-facing
documents, installer metadata, package names, repository aliases, and verification
scripts still repeat the former `Civic*` naming system. Some of those names occupy a
crowded field or create avoidable legal risk. Replacing every string at once would also
break package imports, installer IDs, migrations, configuration, upgrade behavior, and
historical evidence.

Suite truth is duplicated independently in `installer/modules.json`,
`installer/modules.public-status.json`, the compatibility matrix, status documents,
the unified specification, provenance documents, and `scripts/verify-suite-state.py`.
Several of those copies can agree with one another while all are stale relative to the
repositories and releases they describe. The existing installer registry remains the
right owner for detailed operational configuration, but it should not also be the only
place attempting to describe product identity, release state, public maturity, and
legacy migration.

Townlight Records is the first stabilization target. It is a complete records outcome
built from Townlight Core, Records, Notice, and Access rather than an isolated module.
The public website remains deferred until that product passes its beta release gate.

## Decision

`config/suite-state.json` is the canonical committed declaration of suite identity and
state. `config/suite-state.schema.json` is its versioned contract. Deterministic code
validates the declaration and compares it with current installer and public-status
metadata.

The house brand is **Townlight**, written as one word with a lowercase `l`. Public
product names use a readable space: **Townlight Records**, **Townlight Meetings**,
**Townlight Code**, and the same pattern for the rest of the catalog.

Each catalog entry has three deliberately separate identities:

- A stable Townlight ID and public slug, such as `records`.
- A Townlight public name, such as `Townlight Records`.
- Explicit legacy aliases, such as installer ID `civicrecords-ai`, package name
  `civicrecords-ai`, and product names `CivicRecords AI` and `CivicSunshine`.

Legacy aliases remain valid compatibility inputs until a separately approved migration
removes them. New public names do not silently rename imports, database objects,
environment variables, service identifiers, repositories, release tags, or historical
artifacts.

The manifest distinguishes facts that were previously collapsed into one ambiguous
"current version":

- Development version at the default branch.
- Latest released version.
- Version projected into the current installer registry.
- Version projected into the current public-status registry.

It makes the same distinction for CivicCore compatibility. Temporary differences are
therefore explicit data to resolve, not values hidden by a verifier that selects one
meaning based on execution mode.

The truth system has three layers:

1. **Declared state:** the reviewed, committed manifest.
2. **Observed state:** facts collected by deterministic local or remote checks.
3. **Historical evidence:** immutable audits, release notes, and evidence kits.

A passing check means the declared state is internally valid and its recorded legacy
projections match their current files. Later slices will compare declared state with live
repository, release, asset, and CI observations and generate current-facing projections.
Maturity promotion and release approval remain human decisions; passing deterministic
checks never promotes a module by itself.

## Consequences

- All 28 catalog entries can move to Townlight public names without breaking existing
  technical consumers.
- Townlight Records has a machine-readable four-module system boundary.
- Installer and public-status drift becomes a direct, field-specific failure.
- Repository redirects and legacy names are documented migration inputs instead of
  accidental dependencies.
- A later renderer can generate current release tables, compatibility rows, provenance,
  and public status from one declaration.
- ADR-0010 remains authoritative for operational installer fields. This ADR narrows
  `installer/modules.json` to an operational projection rather than the owner of public
  naming and cross-repository release truth.
- Historical `Civic*` evidence is not rewritten.

## Non-Goals

- This slice does not rename repositories, Python packages, imports, services,
  configuration keys, migrations, release tags, or installer IDs.
- This slice does not rewrite public documents, generated installer trees, or historical
  evidence.
- This slice does not replace `scripts/verify-suite-state.py` yet.
- This slice does not claim Townlight Records is beta-ready, city-ready,
  procurement-ready, or production-ready.
- This slice does not create or publish the Townlight website.
- This slice does not alter frozen pull requests.

## Verification

Run the additive truth check and focused contract tests:

```powershell
python scripts/check-suite-state.py
python -m pytest tests/test_suite_state.py tests/test_module_manifest_contract.py -q
python -m json.tool config/suite-state.json
python -m json.tool config/suite-state.schema.json
git diff --check
```

The checker must accept the current legacy display names and repository aliases while
rejecting missing modules, duplicate identities, broken references, dependency cycles,
and drift in current installer or public-status projections.
