# CivicRecords AI CivicCore Pin Research

Run id: `2026-05-11-civicrecords-version-pin-research`

Goal: document how `civicrecords-ai` currently pins its `civiccore` dependency, and identify whether that pin matches the umbrella `docs/compatibility/index.md` compatibility matrix.

Clear finding: the `civicrecords-ai` CivicCore pin matches the compatibility matrix (`==1.0.1` in both places), but the matrix's `civicrecords-ai` module version is stale: `backend/pyproject.toml` reports `1.6.0` while the matrix row reports `1.5.0`.

## 1. Affected modules

`../civicrecords-ai/backend/pyproject.toml` is the binding Python packaging surface for the module. It declares the project name and version at lines 1-5, with current package version `1.6.0` on line 3, and exposes the install dependency contract in the `[project] dependencies` array starting at line 7. The CivicCore dependency is a direct URL wheel pin on line 20: `civiccore @ https://github.com/CivicSuite/civiccore/releases/download/v1.0.1/civiccore-1.0.1-py3-none-any.whl#sha256=561d7a8f73260d50de79351d330876d2cb3488c0e046a2888e82fe09d1e03969`. That line is the canonical package-manager pin for `civicrecords-ai`.

`CivicSuite/docs/compatibility/index.md` is the umbrella compatibility truth source for module-to-CivicCore pairings. Its opening text says the matrix tracks the contract between `civiccore` and consuming suite modules and is the "release-pairing truth-source" at lines 1-6. The table header is at lines 13-14. The `civicrecords-ai` row is line 16: it records current version `1.5.0`, released `2026-05-11`, compatible CivicCore range ``==1.0.1``, and notes that the recovery release restored full-suite CivicCore pin alignment. The CivicCore pin part matches the package pin; the module version part does not match current `backend/pyproject.toml` line 3.

`CivicSuite/specs/01_catalog.md` is the allowed catalog/specification context that explains why CivicCore pin compatibility matters. It names CivicRecords AI as the architectural template at lines 12 and 40-45, states every module inherits CivicCore at lines 23 and 40-45, and says "CivicCore is the only prerequisite" at lines 147-148. The CivicRecords module card begins at lines 435-442 and states the CivicRecords module depends on CivicCore. This file does not provide an exact pin, but it establishes that CivicCore compatibility is suite architecture, not incidental packaging metadata.

`CivicSuite/specs/02_CivicCore.md`, `specs/03_civicclerk.md`, `specs/04_civiczone.md`, `specs/05_civicregwatch.md`, and `specs/06_civicapi.md` are allowed-path context files that repeatedly state modules depend on CivicCore or must track CivicCore compatibility. For this research question they are background only: the exact `civicrecords-ai` pin is not in these spec files, while the compatibility matrix and `backend/pyproject.toml` carry the operative version contract.

`../civicrecords-ai/CLAUDE.md` is a module-level process contract, not a pin source. It affects any future implementation or push work through mandatory verification and deliverable gates, but this run is research-only and did not run tests, builds, or mutate source. Relevant constraints are quoted in section 3.

No frontend file or workflow YAML needed to be read to answer the pin-vs-matrix question. They are inside the broad `../civicrecords-ai/` allowed path, but the current research target is the package dependency line and the umbrella compatibility row, so frontend and workflow files are unaffected by this research artifact.

## 2. Existing patterns

Pattern 1: `CivicSuite/docs/compatibility/index.md:13-16` uses a single Markdown table row per module with columns for `Module`, `Repo`, `Current version`, `Released`, `Compatible CivicCore range`, `Last verified`, and `Notes`. A downstream planner updating this truth source should mirror that row shape rather than inventing another compatibility format.

Pattern 2: `CivicSuite/docs/compatibility/index.md:121-125` defines the update policy: the matrix is "Updated every time a module ships a new version that changes its civiccore pin" and "Updated every time civiccore ships a new MINOR or MAJOR." That means a future policy check should treat module-version changes and CivicCore-pin changes as separate but related triggers.

Pattern 3: `CivicSuite/docs/compatibility/index.md:73-79` keeps a historical "Tested pairs" table with date, CivicCore version, module/version, result, and evidence. The current row for `civicrecords-ai` is in the active matrix at line 16; historical pairing evidence for prior CivicRecords AI releases appears later, for example `civicrecords-ai 1.4.10` with CivicCore `0.22.0` at line 91.

Pattern 4: `../civicrecords-ai/backend/pyproject.toml:7-20` pins dependencies in the PEP 621 `[project]` dependency array, using direct wheel URLs for CivicCore. The exact pin line includes the GitHub release URL and the SHA256 hash fragment, so a future parser should extract from `pyproject.toml`, not infer from prose.

Pattern 5: `CivicSuite/specs/01_catalog.md:435-442` models module cards with an explicit `Depends on` field. For CivicRecords, that field says `CivicCore`; this is useful for validating that the matrix row is not accidental: the catalog says CivicRecords is a CivicCore-consuming module.

## 3. Constraints from CLAUDE.md

`../civicrecords-ai/CLAUDE.md` exists. These are the specific non-negotiables this research touches, quoted from the file:

`../civicrecords-ai/CLAUDE.md:7-12`:

> **Mandatory pre-push verification (Rule 9 summary -- full text in the skill):** Before ANY `git push`, `gh release create`, `npm publish`, or `python -m build`, verify each of these exists on disk and present the checklist to the human:
> - Professional UML architecture diagrams (class / component / sequence / deployment / activity, as appropriate)
> - docs/index.html landing page with four required action buttons: Repo / Download Installer (direct-from-Releases) / User Manual / README

`../civicrecords-ai/CLAUDE.md:21-23`:

> **Override phrase:** Only the literal phrase `"override rule 9"` from the human in chat bypasses the deliverables gate. No implied authorization, no "just push it," no inferred consent.
> **Verification Log required at task completion.** Every coding task closes with the full Verification Log from the skill -- not a summary of work performed, but evidence of what was verified.

`../civicrecords-ai/CLAUDE.md:128-143`:

> Every sub-project must pass ALL verification gates before merge:
> ### Unit Tests
> - Run with `cd backend && python -m pytest tests/ -v` (no Docker required for pure unit tests)
> - Parser, chunker, embedder tests must pass without a database
> - Integration tests (auth, audit, admin, datasources, documents) require PostgreSQL
> ### Docker Verification
> - `docker compose build` must succeed with no errors
> - `docker compose up -d` must start all services healthy
> - `curl http://localhost:8000/health` must return `{"status": "ok"}`
> - `curl http://localhost:8000/docs` must serve OpenAPI docs

`../civicrecords-ai/CLAUDE.md:182-184`:

> - All dependencies must be permissive or weak-copyleft licensed (MIT, Apache 2.0, BSD, LGPL, MPL)
> - Redis pinned to <8.0.0 (BSD licensed; 8.x changed licensing)
> - No telemetry, analytics, or outbound data transmission

Applicability note: this run is research-only and did not push, release, build, or test. These constraints become binding for a future implementation plan if it changes the pin or compatibility documentation.

## 4. Constraints from ADRs

ADR review was not performed because the manifest explicitly lists `docs/adr/` under `forbidden_paths`. The role file asks for ADR compliance clauses, but the run manifest forbids reading ADRs, so this artifact cannot claim ADR coverage without violating the manifest. A downstream planner should treat ADR constraints as unknown until a future manifest explicitly allows `docs/adr/` reads.

## 5. Open questions

### Director note 1: Is `docs/compatibility/index.md` parseable as structured data, or does a structured `compatibility.yaml` exist?

Evidence:

- `CivicSuite/docs/compatibility/index.md` is the only file under `docs/compatibility/`.
- No `*.yaml`, `*.yml`, `*.json`, `*.toml`, or `*.csv` compatibility file exists under `docs/compatibility/`.
- The active compatibility data is a Markdown table at `docs/compatibility/index.md:13-42`.
- The file also contains prose sections and a second historical table starting at `docs/compatibility/index.md:71-79`.

Trade-off matrix:

| Option | What it means | Benefits | Risks / costs | Research recommendation |
| --- | --- | --- | --- | --- |
| Parse the existing Markdown table directly | A future policy script reads `docs/compatibility/index.md`, identifies the first table, and extracts module rows. | No new artifact; uses the current truth source; no duplication risk. | Markdown table parsing must distinguish the active matrix from the later history table; notes fields contain backticks and prose; column alignment is human-oriented. | Acceptable for a lightweight check if the parser is table-aware and targets the header at line 13. |
| Add a structured `compatibility.yaml` later | Future work introduces a machine-readable source and either generates Markdown from it or checks Markdown against it. | Cleaner policy script; easier schema validation; can distinguish active rows from history. | New source-of-truth decision required; risk of drift if Markdown and YAML are both edited by hand. | Best long-term if compatibility becomes a release-lockstep gate. Final choice belongs to the human director. |
| Treat `docs/compatibility/index.md` as prose only | Future policy script does not parse it and relies on some other source. | Avoids brittle Markdown parsing. | No other structured compatibility source exists in allowed scope; this would leave the current matrix unenforced. | Not recommended unless another truth source is authorized. |

Recommendation: for immediate policy checks, parse the first Markdown table in `docs/compatibility/index.md`; for durable release gating, add or authorize a structured compatibility source and generate/check the Markdown from it. Final choice remains with the human director.

### Director note 2: Which other catalog modules share CivicRecords AI's exact CivicCore pin version?

Evidence:

- `../civicrecords-ai/backend/pyproject.toml:20` pins CivicCore to `v1.0.1`.
- `CivicSuite/docs/compatibility/index.md:16` records `civicrecords-ai` compatible range ``==1.0.1``.
- Other active matrix rows with the same compatible CivicCore range are:
  - `CivicSuite/docs/compatibility/index.md:17`: `civicclerk`, current version `1.0.1`, compatible range ``==1.0.1``.
  - `CivicSuite/docs/compatibility/index.md:21`: `civiczone`, current version `0.2.0`, compatible range ``==1.0.1``.

Trade-off matrix:

| Cohort interpretation | Modules included | Benefits | Risks / caveats | Research recommendation |
| --- | --- | --- | --- | --- |
| Exact current matrix pin cohort | `civicrecords-ai`, `civicclerk`, `civiczone` | Directly evidence-backed from the active compatibility matrix; small cohort. | The matrix is already stale for `civicrecords-ai` module version (`1.5.0` in matrix vs `1.6.0` in pyproject), so the cohort may also lag recent release activity. | Use this as the evidence-backed answer for this research run. |
| Active product/platform repo cohort after recent CivicCore moves | Include only modules whose live `pyproject.toml` pins are verified. | More accurate for future rollout planning. | Requires reading additional sibling repos outside the manifest's allowed paths; not permitted in this run. | Defer to a future manifest that allows those repo reads. |
| Matrix plus historical rows | Include historical releases from the "Tested pairs" table that used `1.0.1`. | Shows provenance of the v1.0.1 sweep. | Historical rows are not current compatibility state and should not drive rollout cohorts. | Do not use historical rows as current cohort membership. |

Recommendation: based on the current matrix, the exact `==1.0.1` cohort is `civicrecords-ai`, `civicclerk`, and `civiczone`. Final rollout grouping should be confirmed against live module `pyproject.toml` files in a future run if the human director wants implementation planning.

### Additional open question: Should the matrix row be considered mismatched because the module version is stale?

Evidence:

- `../civicrecords-ai/backend/pyproject.toml:3` says `version = "1.6.0"`.
- `CivicSuite/docs/compatibility/index.md:16` says `civicrecords-ai` current version is `1.5.0`.
- The same row's compatible CivicCore range is ``==1.0.1``, which matches the `pyproject.toml` CivicCore pin at line 20.

Trade-off matrix:

| Interpretation | Conclusion | Benefits | Risks / caveats | Research recommendation |
| --- | --- | --- | --- | --- |
| Pin-only interpretation | The CivicCore pin matches the matrix. | Directly answers the manifest goal; evidence is clear. | Could hide the stale module-version cell. | Use this for the required one-sentence gap statement, with the stale version caveat. |
| Whole-row interpretation | The matrix row is partially stale because module version differs. | Captures actual drift visible in the evidence. | Goes slightly beyond the pin-only question. | Include as a caveat because a future planner needs it. |

Recommendation: state both facts: the CivicCore pin matches (`1.0.1`), but the compatibility row's module version is stale (`1.5.0` vs `1.6.0`). Final choice on whether to update the matrix belongs to the human director because the manifest says not to propose changes.
