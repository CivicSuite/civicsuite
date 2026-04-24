# Changelog

All notable changes to the civicsuite umbrella repo are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial scaffold of the civicsuite umbrella repository (Phase 0).
- Charter, consistency reference, and four canonical specs (catalog, CivicCore extraction, CivicClerk, CivicZone) imported from the workspace draft.
- Empty `docs/` skeleton with stub index files for catalog, principles, architecture, roadmap, governance, and compatibility.
- ADR-0001: extract CivicCore as a non-breaking refactor before any second module starts.
- LICENSE (CC BY 4.0) for documentation; LICENSE-CODE (MIT) for example code snippets.
- CONTRIBUTING.md with the bug-routing decision tree from CivicCore Extraction Spec section 18.

### Changed
- License for code switched from MIT to Apache License 2.0 (LICENSE-CODE updated; CONSISTENCY.md section 6 and all four specs updated to match). Documentation license (CC BY 4.0 in LICENSE) is unchanged.
- Three doc-drift fixes flagged by audit review of Day-3 inventory: governance/index.md license bullet, CONTRIBUTING.md repo URLs, LICENSE snippets footer.
- Spec 02 sections 8 and 9 updated to match actual civicrecords-ai paths (LLM module, sovereignty verification, app-shell, letters/fees locations).
- CONSISTENCY.md drift-watch item 6 added.
- ADR-0002 (SQLAlchemy declarative Base lives in civiccore.models.base) and ADR-0003 (CivicCore Alembic baselines after 787207afc66a) added to the architecture index.
