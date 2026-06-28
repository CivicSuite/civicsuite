# CivicSuite Windows Local — Bundled Module Provenance

**Last updated:** 2026-06-25
**Scope:** the Windows Local city-core MSI artifact and the source it bundles.
**Companion to:** [STATUS.md](STATUS.md), [`installer/modules.json`](installer/modules.json) (`source_commit` pins).

## Why this file exists

The Windows Local MSI does not install the published GitHub *release* of each
module. It bundles module source **pinned by commit** (`source_commit` in
`installer/modules.json`). For some modules the bundled commit is **ahead of**
the latest published release tag. This file discloses exactly which commits the
MSI ships and how they relate to the published releases, so a city can verify
the trust path instead of assuming "release tag == what runs."

This is a deliberate, disclosed state for the pre-release city-core beta: the
bundled commits carry fixes that are not yet cut as formal release tags. It is
**not** a claim that the published release tags contain this code.

## City-core bundled commits vs published releases

The MSI (city-core profile: CivicCore, CivicRecords AI, CivicClerk, CivicCode,
CivicNotice) bundles these exact commits. The "Bundled vs published" column
states whether the pinned commit is ahead of, or equal to, the latest published
release tag for that repo.

| Module | Repo | Bundled `source_commit` | Published release tag | Bundled vs published |
|---|---|---|---|---|
| CivicCore | CivicSuite/civiccore | `1a53f0680fffce34efeb939cbeb9915b6e208d6c` | v1.2.0 | at/derived from v1.2.0 line |
| CivicRecords AI | CivicSuite/civicrecords-ai | `e2208827b660faa7d3fc1eab2271a8eae18526ee` | **v1.7.3** | **AHEAD of v1.7.3 (undisclosed until this note)** |
| CivicClerk | CivicSuite/civicclerk | `fa1874edfe977bfc36ddea2939df6464b5bc16be` | **v1.0.4** | **AHEAD of v1.0.4 (undisclosed until this note)** |
| CivicCode | CivicSuite/civiccode | `a960bba0a2249d118b593dd61bee3a65a69a9d77` | v1.0.8 | at/derived from v1.0.8 line |
| CivicNotice | CivicSuite/civicnotice | `2bf0c9d7b764af84cd042657a972e84213a261d5` | v0.2.0 (bundled source; see note) | at/derived from v0.2.0 line |

> Short commit forms used elsewhere: civicrecords-ai `e2208827`, civicclerk
> `fa1874ed`, civiccore `1a53f06`, civiccode `a960bba0`, civicnotice `2bf0c9d`.

### Specifically disclosed (the two ahead-of-release modules)

- **CivicRecords AI** ships commit `e2208827`, which is **ahead of** the latest
  published release **v1.7.3**. The MSI's installed code is therefore newer than
  anything available under the `v1.7.3` release tag on GitHub.
- **CivicClerk** ships commit `fa1874ed`, which is **ahead of** the latest
  published release **v1.0.4**. The MSI's installed code is therefore newer than
  anything available under the `v1.0.4` release tag on GitHub.

These two cases were previously undisclosed. Until each repo cuts a release tag
at (or above) its bundled commit, the trust path for these modules is the
`source_commit` pin in `installer/modules.json` plus the MSI checksum/manifest
from the release evidence — **not** the `v1.7.3` / `v1.0.4` release tags.

## How to verify what the MSI actually ships

1. Read `installer/modules.json` and record each module's `source_commit`.
2. Confirm those commits exist in the corresponding `CivicSuite/<repo>` history.
3. Verify the MSI checksum / release manifest from the active PR/release evidence
   (see STATUS.md, "Active City-Core Target (GA candidate / open public beta)").
4. For CivicRecords AI and CivicClerk, do **not** rely on the published release
   tag as the source of truth — use the pinned commit above.

## Restoring a clean trust path (follow-up, not blocking this disclosure)

The durable fix is to cut release tags at or above the bundled commits (e.g. a
`v1.7.4` for civicrecords-ai and a `v1.0.5` for civicclerk that include
`e2208827` / `fa1874ed`), then re-pin `installer/modules.json` to those tagged
commits so "what ships" once again equals "a published release." Until then,
this file is the authoritative disclosure of the gap.
