# CivicSuite

**An open-source, sovereignly-deployable, local-LLM municipal operations suite.** Modular. Apache 2.0 / CC BY 4.0. Runs on the city's own hardware — no cloud, no telemetry, no per-seat pricing.

This `civicsuite` repository is the **umbrella / orientation repo** for the CivicSuite product family. It holds suite-wide documentation, ADRs, the roadmap, governance, and the civiccore↔module compatibility matrix. It contains no runtime code — every module lives in its own repo.

## Suite status (as of 2026-04-28)

**Shipping:**

- **civicrecords-ai v1.4.0** — open-source FOIA / public records management. Repo: <https://github.com/CivicSuite/civicrecords-ai>. (Transferred to the `CivicSuite` GitHub org on 2026-04-25.)
- **civiccore v0.3.0** — shared platform package. **Shipping today:** migration runner + shared baselines (`civiccore.migrations`), shared SQLAlchemy `Base` (`civiccore.db`), LLM abstraction (`civiccore.llm`), hash-chained audit primitives, source/provenance contracts, offline import/export manifest schemas, export-bundle helpers, and local city profile configuration. **Future / planned extraction:** auth/RBAC, document ingestion, hybrid search, notification delivery, web onboarding flows, 50-state exemption engine, sovereignty verification, live connector sync, credential storage, vendor write-back, and legal determinations. Repo: <https://github.com/CivicSuite/civiccore>.

- **civicclerk v0.1.0 + post-release production-depth main** — meeting/agenda/minutes runtime foundation. Ships schema, lifecycle enforcement, packet/notice checks, immutable motion/vote/action capture, citation-gated minutes drafts, public archive endpoints, prompt eval gates, connector imports, browser QA gates, and live `/staff` workflow screens for intake, packet assembly/export, notice checklist, meeting outcomes, minutes draft, public archive, and connector import. Full database persistence/authentication hardening is still planned. Repo: <https://github.com/CivicSuite/civicclerk>.

- **civiccode v0.1.1** - municipal code and ordinance access runtime foundation, now aligned to `civiccore==0.3.0`. Ships source registry, section/version lifecycle, search and permalinks, deterministic citations, citation-grounded Q&A, staff interpretation notes, plain-language summaries, CivicClerk handoff intake, resident public lookup pages, local import connectors, and records-ready exports. Legal advice, live LLM calls, live codifier sync, and automatic ordinance codification are still not shipped. Repo: <https://github.com/CivicSuite/civiccode>.

- **civiczone v0.1.1** - parcel-aware zoning and land-use Q&A foundation, now aligned to `civiccore==0.3.0`. Ships canonical zoning schema, Alembic migrations, sample parcel/zone lookup, sample use and dimensional rule APIs, citation-grounded sample resident Q&A, planner escalation/staff context samples, and an accessible public sample UI at `/civiczone`. Live GIS ingestion, live LLM calls, authentication/RBAC, planner review queues, official zoning determinations, and legal advice are still not shipped. Repo: <https://github.com/CivicSuite/civiczone>.

- **civicaccess v0.1.1** - accessibility, plain-language, multilingual, and ADA review support foundation, now aligned to `civiccore==0.3.0`. Ships deterministic sample accessibility review, plain-language rewrite, multilingual variant, records-ready export checklist, and accessible public sample UI at `/civicaccess`. Certified ADA compliance, legal advice, live LLM calls, production translation workflows, document ingestion, and suite-wide integration APIs are still not shipped. Repo: <https://github.com/CivicSuite/civicaccess>.

- **civicplan v0.1.1** - comprehensive-plan policy lookup and cited planning analysis foundation, now aligned to `civiccore==0.3.0`. Ships deterministic sample plan-policy lookup, policy-consistency support, staff-analysis outline helper, records-ready export checklist, and accessible public sample UI at `/civicplan`. Official planning determinations, legal advice, live GIS, live LLM calls, plan document ingestion, permitting-system integrations, and production staff-review queues are still not shipped. Repo: <https://github.com/CivicSuite/civicplan>.

- **civicpermit v0.1.1** - permit pre-application and intake-readiness foundation, now aligned to `civiccore==0.3.0`. Ships deterministic sample permit requirement lookup, intake-readiness review, submittal outline helper, records-ready export checklist, and accessible public sample UI at `/civicpermit`. Permit approvals, legal advice, live GIS, live LLM calls, plan ingestion, production permitting-system integrations, and system-of-record behavior are still not shipped. Repo: <https://github.com/CivicSuite/civicpermit>.

- **civicinspect v0.1.1** - inspection support foundation, now aligned to `civiccore==0.3.0`. Ships deterministic sample repeat-case lookup, inspector-owned report draft helper, notice draft helper, records-ready export checklist, and accessible public sample UI at `/civicinspect`. Official findings, citations, fines, notices, inspection scheduling, legal advice, live photo analysis, live LLM calls, and system-of-record integrations are still not shipped. Repo: <https://github.com/CivicSuite/civicinspect>.

- **civicgrants v0.1.1** - grant opportunity and compliance support foundation, now aligned to `civiccore==0.3.0`. Ships deterministic sample opportunity triage, eligibility-factor matching, application outline helper, compliance calendar helper, audit-ready export checklist, and accessible public sample UI at `/civicgrants`. Live funder feeds, official eligibility decisions, legal advice, live LLM calls, submission portals, and grant system-of-record integrations are still not shipped. Repo: <https://github.com/CivicSuite/civicgrants>.
- **civicprocure v0.1.1** - procurement drafting and award-packet support foundation, now aligned to `civiccore==0.3.0`. Ships deterministic sample RFP drafting, proposal comparison, exception extraction, scoring summary helper, award-packet checklist, and accessible public sample UI at `/civicprocure`. Live vendor portals, official vendor evaluation decisions, legal advice, live LLM calls, e-procurement submission portals, and procurement system-of-record integrations are still not shipped. Repo: <https://github.com/CivicSuite/civicprocure>.
- **civiccontracts v0.1.1** - contract repository and renewal visibility foundation, now aligned to `civiccore==0.3.0`. Ships deterministic sample contract registry, clause topic lookup, expiration tracking, renewal visibility, public-records export checklist, and accessible public sample UI at `/civiccontracts`. Live contract management platforms, official legal interpretation, legal advice, renewal approvals, contract execution workflows, live LLM calls, and contract system-of-record integrations are still not shipped. Repo: <https://github.com/CivicSuite/civiccontracts>.
- **civicboards v0.1.1** - board and commission administration foundation, now aligned to `civiccore==0.3.0`. Ships deterministic sample board registry, term review plans, vacancy checklists, attendance summaries, notice/records export checklist, and accessible public sample UI at `/civicboards`. Live agenda systems, appointment decisions, legal advice, official notice publication, meeting system write-back, live LLM calls, and board system-of-record integrations are still not shipped. Repo: <https://github.com/CivicSuite/civicboards>.
- **civicnotice v0.1.1** - public notice compliance foundation, now aligned to `civiccore==0.3.0`. Ships deterministic sample notice registry, statutory deadline plans, publication-readiness checklists, channel planning, notice/records export checklist, and accessible public sample UI at `/civicnotice`. Legal sufficiency decisions, legal advice, live LLM calls, official notice publication, publication-system write-back, and notice system-of-record integrations are still not shipped. Repo: <https://github.com/CivicSuite/civicnotice>.
- **civic311 v0.1.1** - resident service request foundation, now aligned to `civiccore==0.3.0`. Ships deterministic sample request intake, triage suggestions, duplicate-candidate review, department routing checklists, Open311-compatible export helper, and accessible public sample UI at `/civic311`. Official dispatch, work-order creation, emergency response, legal advice, live LLM calls, 311 system write-back, and 311 system-of-record integrations are still not shipped. Repo: <https://github.com/CivicSuite/civic311>.
- **civiccomms v0.1.0** - public communications foundation. Ships source-readiness review, meeting summary draft outlines, ordinance explainer drafts, newsletter scaffolds, FAQ prompts, audience-variant drafts, and accessible public sample UI at `/civiccomms`. Autonomous publication, campaign or advocacy content, legal advice, certified translation, live LLM calls, social media posting, and communications system-of-record integrations are still not shipped. Repo: <https://github.com/CivicSuite/civiccomms>.
- **civicdata v0.1.0** - open-data and transparency publishing foundation. Ships dataset normalization, data-dictionary drafts, CKAN package metadata drafts, PII/exemption preflight, archive-bundle checklists, publication planning, and an accessible public sample UI at `/civicdata`. Live CKAN publication, BI dashboards, data warehouse storage, autonomous redaction, and external connector runtime are still not shipped. Repo: <https://github.com/CivicSuite/civicdata>.
- **civicutility v0.1.0** - utility customer-service support foundation. Ships cited utility-policy Q&A, CSR-safe read-only account context, payment-arrangement drafts, service-request intake, and accessible public sample UI at `/civicutility`. Utility billing, payment processing, rate-engine behavior, shutoff/reconnect decisions, account writes, live LLM calls, live billing connectors, and Civic311 write-back are still not shipped. Repo: <https://github.com/CivicSuite/civicutility>.
- **civiccourt v0.1.0** - municipal court clerk support foundation. Ships cited procedure Q&A, court form drafts, restricted-record-aware search, hearing preparation checklists, and accessible public sample UI at `/civiccourt`. Court case management, e-filing, warrant issuance, judicial decisions, legal advice, live LLM calls, and court CMS connectors are still not shipped. Repo: <https://github.com/CivicSuite/civiccourt>.
- **civicsafety v0.1.0** - non-CJIS public-safety administrative support foundation. Ships cited policy/SOP Q&A, training checklists, PIO draft support, aggregate public-statistics summaries, and accessible public sample UI at `/civicsafety`. CJI ingestion, CAD/RMS integration, dispatch, enforcement, investigations, evidence workflows, legal advice, live LLM calls, and connector runtime are still not shipped. Repo: <https://github.com/CivicSuite/civicsafety>.
- **civiclibrary v0.1.0** - municipal library policy and reference support foundation. Ships cited library policy Q&A, program and event Q&A, collection-metadata reference search, collection-development guidance, and accessible public sample UI at `/civiclibrary`. Patron records, ILS integration, circulation actions, professional-reference replacement, legal advice, live LLM calls, and connector runtime are still not shipped. Repo: <https://github.com/CivicSuite/civiclibrary>.
- **civicparks v0.1.0** - parks and recreation support foundation. Ships cited parks policy Q&A, program and facility Q&A, registration-link assistance, maintenance request triage, and accessible public sample UI at `/civicparks`. Payments, registrations, participant records, reservation writes, crew dispatch, live LLM calls, and connector runtime are still not shipped. Repo: <https://github.com/CivicSuite/civicparks>.

**Planned, not started:**
- 0 additional modules across the catalog. The v0.1.0 foundation lane has shipped for every catalog module; later work is feature depth, integration hardening, and production workflow expansion.

See the [compatibility matrix](docs/compatibility/index.md) for the canonical version pairings.
See the [local demo deployment profile](docs/deployment/local-demo-profile.md) for the first bounded post-foundation stack: CivicRecords AI + CivicClerk + CivicCode + CivicZone.

## Quick start

There is nothing to "install" from the umbrella. Pick a module and follow its repo's setup guide:

- For FOIA / public records management today, start with [civicrecords-ai](https://github.com/CivicSuite/civicrecords-ai).
- For platform / library use, start with [civiccore](https://github.com/CivicSuite/civiccore).

If you're orienting yourself for the first time, read in this order:

1. [docs/CivicSuiteUnifiedSpec.md](docs/CivicSuiteUnifiedSpec.md) — canonical suite specification and precedence rules.
2. [USER-MANUAL.md](USER-MANUAL.md) — three-part orientation manual (decision-makers, developers, architecture).
3. [CHARTER.md](CHARTER.md) — founding document.
4. [specs/01_catalog.md](specs/01_catalog.md) — the source catalog draft folded into the unified spec.
5. [docs/architecture/](docs/architecture/) — ADRs.

## Current module lane

All 26 catalog modules have runtime-foundation releases; CivicCode, CivicZone, CivicAccess, CivicPlan, CivicPermit, CivicInspect, CivicGrants, CivicProcure, CivicContracts, CivicBoards, CivicNotice, and Civic311 have advanced to v0.1.1 for CivicCore v0.3.0 alignment. The next suite lane is post-foundation hardening: production workflow depth, connector design, deployment packaging, and cross-module UX polish.

## What's in this repo

```
civicsuite/
├── README.md, README.txt           ← you are here
├── USER-MANUAL.md, .txt, .pdf, .docx ← orientation manual
├── CHANGELOG.md                    ← suite-wide doc/governance changelog
├── CONTRIBUTING.md                 ← how to file bugs (with module-routing tree)
├── LICENSE (CC BY 4.0)             ← documentation license
├── LICENSE-CODE (Apache 2.0)       ← license for any code snippets
├── SECURITY.md, CODE_OF_CONDUCT.md, SUPPORT.md
├── CHARTER.md                      ← founding doc
├── CONSISTENCY.md                  ← truth-source audit table
├── specs/                          ← canonical specs (catalog, civiccore extraction, civicclerk, civiczone)
├── docs/
│   ├── index.html                  ← GitHub Pages landing
│   ├── CivicSuiteUnifiedSpec.md    ← canonical suite specification
│   ├── architecture/               ← ADRs
│   ├── catalog/                    ← module catalog
│   ├── compatibility/index.md      ← civiccore↔module pin matrix
│   ├── governance/                 ← repo standards, transfer plan
│   ├── principles/                 ← suite-wide design principles
│   ├── roadmap/                    ← release cadence and module sequence
│   ├── github-discussions-seed.md  ← seed posts for GitHub Discussions
│   └── SUPERVISOR.md               ← human-supervisor operating card
├── .github/                        ← issue + PR templates
└── scripts/verify-docs.sh          ← required-artifact + stale-string check
```

## Where related projects live

| Module | Repo | Role |
|---|---|---|
| civicrecords-ai | <https://github.com/CivicSuite/civicrecords-ai> | Module 1, shipping. Transferred to CivicSuite org on 2026-04-25. |
| civiccore | <https://github.com/CivicSuite/civiccore> | Shared platform package. Pinned by every module. |
| civicclerk | <https://github.com/CivicSuite/civicclerk> | Module 2, v0.1.0 runtime foundation released; post-release main has live `/staff` workflow screens for intake, packet export, notice, outcomes, minutes, archive, and connector import. |
| civiccode | <https://github.com/CivicSuite/civiccode> | Module 3, v0.1.1 released; municipal-code lookup, citations, local imports, records-ready exports, and `civiccore==0.3.0` alignment. |
| civiczone | <https://github.com/CivicSuite/civiczone> | Module 6, v0.1.1 released; parcel lookup, zoning rule lookups, cited sample Q&A, planner escalation, public UI foundation, and `civiccore==0.3.0` alignment. |
| civicaccess | <https://github.com/CivicSuite/civicaccess> | Module 5, v0.1.1 released; accessibility review, plain-language rewrite, multilingual variants, records-ready exports, public UI foundation, and `civiccore==0.3.0` alignment. |
| civicplan | <https://github.com/CivicSuite/civicplan> | Module 7, v0.1.1 released; cited plan-policy lookup, consistency support, staff-analysis outlines, records-ready exports, public UI foundation, and `civiccore==0.3.0` alignment. |
| civicpermit | <https://github.com/CivicSuite/civicpermit> | Module 8, v0.1.0 runtime foundation released; permit requirement lookup, intake-readiness review, submittal outlines, records-ready exports, and public UI foundation. |
| civicinspect | <https://github.com/CivicSuite/civicinspect> | Module 9, v0.1.0 runtime foundation released; repeat-case lookup, report drafts, notice drafts, records-ready exports, and public UI foundation. |
| civicgrants | <https://github.com/CivicSuite/civicgrants> | Module 10, v0.1.0 runtime foundation released; opportunity triage, eligibility matching, application outlines, compliance calendars, audit-ready exports, and public UI foundation. |
| civicprocure | <https://github.com/CivicSuite/civicprocure> | Module 11, v0.1.1 released; RFP drafting, proposal comparison, exception extraction, scoring summaries, award-packet checklists, public UI foundation, and `civiccore==0.3.0` alignment. |
| civiccontracts | <https://github.com/CivicSuite/civiccontracts> | Module 12, v0.1.1 released; contract registry, clause topic lookup, expiration tracking, renewal visibility, public-records export checklists, public UI foundation, and `civiccore==0.3.0` alignment. |
| civicboards | <https://github.com/CivicSuite/civicboards> | Module 13, v0.1.1 released; board registry, term tracking, vacancy tracking, attendance review, notice/records exports, public UI foundation, and `civiccore==0.3.0` alignment. |
| civicnotice | <https://github.com/CivicSuite/civicnotice> | Module 14, v0.1.1 released; notice registry, statutory deadlines, publication-readiness checks, channel planning, notice records exports, public UI foundation, and `civiccore==0.3.0` alignment. |
| civic311 | <https://github.com/CivicSuite/civic311> | Module 15, v0.1.1 released; request intake, triage suggestions, duplicate-candidate review, department routing, Open311-compatible exports, public UI foundation, and `civiccore==0.3.0` alignment. |
| civiccomms | <https://github.com/CivicSuite/civiccomms> | Module 16, v0.1.0 runtime foundation released; source-readiness review, meeting summaries, ordinance explainers, newsletters, FAQs, audience variants, and public UI foundation. |
| civicdata | <https://github.com/CivicSuite/civicdata> | Module 17, v0.1.0 runtime foundation released; dataset normalization, data dictionaries, CKAN metadata drafts, redaction preflight, archive checklists, and publication planning. |
| civichr | <https://github.com/CivicSuite/civichr> | Module 18, v0.1.0 runtime foundation released; HR policy lookup, handbook summaries, job descriptions, classification references, onboarding/training checklists, and intake templates. |
| civicbudget | <https://github.com/CivicSuite/civicbudget> | Module 19, v0.1.0 runtime foundation released; line-item analysis, budget narratives, department memos, hearing packet checklists, resident summaries, and GFOA checklist support. |
| civiclegal | <https://github.com/CivicSuite/civiclegal> | Module 20, v0.1.0 runtime foundation released; privilege-aware legal-record search, prior-action lookup, memo scaffolds, ordinance comparison, litigation-hold flags, and citation tracking. |
| civicelections | <https://github.com/CivicSuite/civicelections> | Module 21, v0.1.0 runtime foundation released; voter guidance, filing checklists, worker training, ballot summaries, campaign-finance summaries, canvass checklists, and accessibility review. |
| civicutility | <https://github.com/CivicSuite/civicutility> | Module 22, v0.1.0 runtime foundation released; utility-policy Q&A, CSR-safe account context, payment-arrangement drafts, service-request intake, and public UI foundation. |
| civiccourt | <https://github.com/CivicSuite/civiccourt> | Module 23, v0.1.0 runtime foundation released; procedure Q&A, court form drafts, restricted-record-aware search, hearing prep checklists, and public UI foundation. |
| civicsafety | <https://github.com/CivicSuite/civicsafety> | Module 24, v0.1.0 runtime foundation released; non-CJIS policy/SOP Q&A, training checklists, PIO draft support, aggregate public-statistics summaries, and public UI foundation. |
| civiclibrary | <https://github.com/CivicSuite/civiclibrary> | Module 25, v0.1.0 runtime foundation released; library policy Q&A, program/event answers, collection-metadata reference search, collection-development guidance, and public UI foundation. |
| civicparks | <https://github.com/CivicSuite/civicparks> | Module 26, v0.1.0 runtime foundation released; parks policy Q&A, program/facility answers, registration-link assistance, maintenance triage, and public UI foundation. |

Future module repos will land under `CivicSuite/` as separate repos.

## Architecture

![CivicSuite suite architecture](docs/diagrams/suite-architecture.svg)

CivicSuite governs the umbrella, ships civiccore as a shared library, and is consumed by per-product modules. Solid arrows are runtime dependencies; dotted arrows are governance/documentation.

## Architecture in one paragraph

Every module inherits the same boring stack: FastAPI on Uvicorn, PostgreSQL 17 with pgvector, Redis 7.2 (pinned below 8.0 for license reasons), Celery + Celery Beat, and Ollama serving Gemma 4 for local LLM inference. Embeddings come from `nomic-embed-text` via Ollama. The frontend is React behind nginx. The dependency rule is one-way: modules depend on civiccore; civiccore never depends on a module. Cities run everything on their own hardware. No cloud, no telemetry, no per-seat pricing.

## Licensing

- **Documentation:** CC BY 4.0 (this `LICENSE`).
- **Code snippets** in this repo (if any): Apache License 2.0 (see `LICENSE-CODE`).
- Each module repo has its own LICENSE — most are Apache 2.0 for code and CC BY 4.0 for docs.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the bug-routing decision tree (most bugs belong on a module repo, not here) and how to propose documentation changes. By participating, you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).

## Support

See [SUPPORT.md](SUPPORT.md) for where to ask questions based on what kind of question you have. See [SECURITY.md](SECURITY.md) for vulnerability reporting.
- **civicbudget v0.1.0** - budget narrative and transparency support foundation. Ships line-item variance analysis, budget narrative drafts, department memo drafts, hearing packet checklists, resident summaries, optional GFOA checklist support, and accessible public sample UI at `/civicbudget`. ERP, budgeting system, accounting, payroll, fund accounting, budget adoption, official approvals, live LLM calls, and live finance-system connector runtime are still not shipped. Repo: <https://github.com/CivicSuite/civicbudget>.
- **civiclegal v0.1.0** - internal legal-record research support foundation. Ships privilege-aware corpus filtering, citation-first city-record search, prior-action lookup, attorney-reviewed memo scaffolds, ordinance comparison checklists, litigation-hold candidate flags, authority citation tracking, and accessible public sample UI at `/civiclegal`. Legal advice, Westlaw/Lexis replacement, autonomous legal conclusions, court filing, e-discovery management, live LLM calls, live privileged corpus ingestion, and external legal-system connector runtime are still not shipped. Repo: <https://github.com/CivicSuite/civiclegal>.
- **civicelections v0.1.0** - election administration support foundation. Ships cited voter guidance, candidate filing checklists, worker training Q&A, ballot-summary drafts, campaign-finance summaries, canvass checklists, accessibility review, and accessible public sample UI at `/civicelections`. Voter registration, ballot marking, tabulation, election conduct automation, campaign finance system of record, official certification, live LLM calls, and election-system connector runtime are still not shipped. Repo: <https://github.com/CivicSuite/civicelections>.
