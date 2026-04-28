# CivicSuite — User Manual

This is the orientation manual for the CivicSuite umbrella repo. It is written in three parts so different audiences can read only what's relevant to them:

1. **For municipal decision-makers** — non-technical overview of what CivicSuite is, what's available today, and what the licensing and sovereignty posture means for your city.
2. **For developers and IT staff** — how the umbrella works, where each module lives, and how to evaluate or contribute.
3. **Architecture reference** — diagrams and dependency rules.

A glossary at the end defines every technical term used.

---

## Part 1 — For municipal decision-makers

### What is CivicSuite?

CivicSuite is an **open-source product family** for municipal records and civic operations. It's not one program — it's a planned collection of modules a city can install one at a time, on its own hardware, on its own schedule. Cities never have to send data to a vendor's cloud, never pay per user, and can read or modify the source code anytime.

Today, multiple modules are shipping at different maturity levels: CivicRecords AI is production-usable, while CivicClerk, CivicCode, CivicZone, CivicAccess, CivicPlan, CivicPermit, CivicInspect, CivicGrants, CivicProcure, CivicContracts, CivicBoards, CivicNotice, Civic311, CivicComms, CivicData, CivicHR, CivicBudget, and CivicLegal have runtime-foundation releases. The rest are planned. We say so plainly below — no roadmap inflation, no vaporware.

### What's available today (as of 2026-04-27)

- **civicrecords-ai v1.4.0** — a working, shipping module for managing public records / FOIA requests. Cities can install this today. Repo: <https://github.com/CivicSuite/civicrecords-ai>.
- **civiccore v0.2.0** — the shared "platform" package that every module uses. It is what the records module is built on. As of v0.2.0 it includes a shared LLM (large-language-model) abstraction layer. It is not a product on its own; you only "install" it as a dependency of a module. Repo: <https://github.com/CivicSuite/civiccore>.
- **civicclerk v0.1.0** — a runtime-foundation release for meetings, agendas, packets, minutes, voting, and sunshine-law compliance. It ships the API/schema foundation, compliance guardrails, and a browser-visible staff workflow foundation at `/staff`; full database-backed workflow screens are still planned. Repo: <https://github.com/CivicSuite/civicclerk>.
- **civiccode v0.1.0** — a runtime-foundation release for municipal code and ordinance access. It ships source registry, section/version lifecycle, search and permalinks, deterministic citations, citation-grounded Q&A, staff notes, plain-language summaries, CivicClerk handoff intake, resident lookup pages, local import connectors, and records-ready exports. It still does not ship legal advice, live LLM calls, live codifier sync, or automatic ordinance codification. Repo: <https://github.com/CivicSuite/civiccode>.
- **civiczone v0.1.0** — a runtime-foundation release for parcel-aware zoning and land-use Q&A. It ships canonical zoning schema, Alembic migrations, sample parcel and rule lookups, citation-grounded sample Q&A, planner escalation, staff-context samples, and a public sample UI at `/civiczone`. It still does not ship live GIS ingestion, live LLM calls, authentication/RBAC, planner review queues, official zoning determinations, or legal advice. Repo: <https://github.com/CivicSuite/civiczone>.
- **civicaccess v0.1.0** — a runtime-foundation release for accessibility, plain-language, multilingual, and ADA review support. It ships deterministic sample accessibility review, plain-language rewrite, multilingual variant, records-ready export checklist, and a public sample UI at `/civicaccess`. It still does not ship certified ADA compliance, legal advice, live LLM calls, production translation workflows, document ingestion, or suite-wide integration APIs. Repo: <https://github.com/CivicSuite/civicaccess>.
- **civicplan v0.1.0** — a runtime-foundation release for comprehensive-plan policy lookup and cited planning analysis support. It ships deterministic sample plan-policy lookup, policy-consistency support, staff-analysis outline helper, records-ready export checklist, and a public sample UI at `/civicplan`. It still does not ship official planning determinations, legal advice, live GIS, live LLM calls, plan document ingestion, permitting-system integrations, or production staff-review queues. Repo: <https://github.com/CivicSuite/civicplan>.
- **civicpermit v0.1.0** — a runtime-foundation release for permit pre-application and intake-readiness support. It ships deterministic sample permit requirement lookup, intake-readiness review, submittal outline helper, records-ready export checklist, and a public sample UI at `/civicpermit`. It still does not ship permit approvals, legal advice, live GIS, live LLM calls, plan ingestion, production permitting-system integrations, or system-of-record behavior. Repo: <https://github.com/CivicSuite/civicpermit>.
- **civicinspect v0.1.0** — a runtime-foundation release for inspection support. It ships deterministic sample repeat-case lookup, inspector-owned report draft helper, notice draft helper, records-ready export checklist, and a public sample UI at `/civicinspect`. It still does not ship official findings, citations, fines, notices, inspection scheduling, legal advice, live photo analysis, live LLM calls, or system-of-record integrations. Repo: <https://github.com/CivicSuite/civicinspect>.
- **civicgrants v0.1.0** — a runtime-foundation release for grant opportunity and compliance support. It ships deterministic sample opportunity triage, eligibility-factor matching, application outline helper, compliance calendar helper, audit-ready export checklist, and a public sample UI at `/civicgrants`. It still does not ship live funder feeds, official eligibility decisions, legal advice, live LLM calls, submission portals, or grant system-of-record integrations. Repo: <https://github.com/CivicSuite/civicgrants>.
- **civicprocure v0.1.0** — a runtime-foundation release for procurement drafting and award-packet support. It ships deterministic sample RFP drafting, proposal comparison, exception extraction, scoring summary helper, award-packet checklist, and a public sample UI at `/civicprocure`. It still does not ship live vendor portals, official vendor evaluation decisions, legal advice, live LLM calls, e-procurement submission portals, or procurement system-of-record integrations. Repo: <https://github.com/CivicSuite/civicprocure>.
- **civiccontracts v0.1.0** - a runtime-foundation release for contract repository and renewal visibility support. It ships deterministic sample contract registry, clause topic lookup, expiration tracking, renewal visibility, public-records export checklist, and a public sample UI at `/civiccontracts`. It still does not ship live contract management platforms, official legal interpretation, legal advice, renewal approvals, contract execution workflows, live LLM calls, or contract system-of-record integrations. Repo: <https://github.com/CivicSuite/civiccontracts>.
- **civicboards v0.1.0** - a runtime-foundation release for board and commission administration. It ships deterministic sample board registry, term review plans, vacancy checklists, attendance summaries, notice/records export checklist, and a public sample UI at `/civicboards`. It still does not ship live agenda systems, appointment decisions, legal advice, official notice publication, meeting system write-back, live LLM calls, or board system-of-record integrations. Repo: <https://github.com/CivicSuite/civicboards>.
- **civicnotice v0.1.0** - a runtime-foundation release for public notice compliance support. It ships deterministic sample notice registry, statutory deadline plans, publication-readiness checklists, channel planning, notice/records export checklist, and a public sample UI at /civicnotice. It still does not ship legal sufficiency decisions, legal advice, live LLM calls, official notice publication, publication-system write-back, or notice system-of-record integrations. Repo: <https://github.com/CivicSuite/civicnotice>.
- **civic311 v0.1.0** - a runtime-foundation release for resident service request support. It ships deterministic sample request intake, triage suggestions, duplicate-candidate review, department routing checklists, Open311-compatible export helper, and a public sample UI at /civic311. It still does not ship official dispatch, work-order creation, emergency response, legal advice, live LLM calls, 311 system write-back, or 311 system-of-record integrations. Repo: <https://github.com/CivicSuite/civic311>.
- **civiccomms v0.1.0** - a runtime-foundation release for public communications support. It ships source-readiness review, meeting summary drafts, ordinance explainers, newsletter scaffolds, FAQ prompts, audience-variant drafts, and a public sample UI at /civiccomms. It still does not ship autonomous publication, campaign or advocacy content, legal advice, certified translation, live LLM calls, social media posting, or communications system-of-record integrations. Repo: <https://github.com/CivicSuite/civiccomms>.
- **civicdata v0.1.0** - a runtime-foundation release for open-data and transparency publishing support. It ships dataset normalization, data-dictionary drafts, CKAN package metadata drafts, PII/exemption preflight, archive-bundle checklists, publication planning, and a public sample UI at /civicdata. It still does not ship live CKAN publication, BI dashboards, data warehouse storage, autonomous redaction, or external connector runtime. Repo: <https://github.com/CivicSuite/civicdata>.
- **civichr v0.1.0** - a runtime-foundation release for HR policy support. It ships policy lookup outlines, handbook summaries, job-description drafts, classification references, onboarding/training checklists, intake templates, source review, and sensitive-topic preflight. It still does not ship HRIS, payroll, benefits administration, personnel records management, employment-law advice, personnel-file ingestion, live LLM calls, or external HR/payroll connectors. Repo: <https://github.com/CivicSuite/civichr>.
- **civicbudget v0.1.0** - budget narrative and transparency support foundation. Ships line-item variance analysis, budget narrative drafts, department memo drafts, hearing packet checklists, resident summaries, optional GFOA checklist support, and accessible public sample UI at `/civicbudget`. ERP, budgeting system, accounting, payroll, fund accounting, budget adoption, official approvals, live LLM calls, and live finance-system connector runtime are still not shipped. Repo: <https://github.com/CivicSuite/civicbudget>.
- **civiclegal v0.1.0** - internal legal-record research support foundation. Ships privilege-aware corpus filtering, citation-first city-record search, prior-action lookup, attorney-reviewed memo scaffolds, ordinance comparison checklists, litigation-hold candidate flags, authority citation tracking, and accessible public sample UI at `/civiclegal`. Legal advice, Westlaw/Lexis replacement, autonomous legal conclusions, court filing, e-discovery management, live LLM calls, live privileged corpus ingestion, and external legal-system connector runtime are still not shipped. Repo: <https://github.com/CivicSuite/civiclegal>.

### What's planned but not started

- Six additional modules across seven tiers — see the [module catalog](specs/01_catalog.md).

If you don't see a module on this list with a version number, **it does not exist as code yet**. Specs are not products.

### What this means for your city

- **No vendor lock-in.** You install on your own hardware. If a maintainer disappears, the code is yours. The code license (Apache 2.0) and documentation license (CC BY 4.0) both allow you to fork, modify, and continue using the software indefinitely.
- **No cloud dependency.** Modules are designed to run with no outbound network calls. The default LLM (Gemma 4, served locally via [Ollama](https://ollama.com/)) runs on the city's own machine.
- **No per-seat billing.** You add as many users as you need at no marginal cost.
- **You evaluate one module at a time.** Don't install the suite — install records-ai, see if it solves a real problem in your clerk's office, and decide whether to install another module later.
- **You are responsible for hosting and operations.** This is not a SaaS product. Your IT staff (or a contractor) operates the server. The user manual for each module documents what's required.

### Glossary (Part 1)

- **FOIA** — Freedom of Information Act; the federal and state laws that govern public records requests.
- **LLM** — Large language model; the AI technology used for things like classifying requests, suggesting redactions, and drafting responses.
- **Open source** — software whose code is published publicly under a license that allows anyone to read, modify, or redistribute it.
- **Sovereign deployment** — software that runs entirely on hardware the city controls, with no required outbound calls to a vendor.

---

## Part 2 — For developers and IT staff

### How the umbrella works

The `civicsuite` repo (this one) is **documentation-only**. It contains:

- The [Charter](CHARTER.md) — the project's founding document.
- The [Consistency reference](CONSISTENCY.md) — the audit table of every cross-reference and count, treated as the truth-source.
- Specs for the catalog, civiccore extraction, civicclerk, and civiczone in `specs/`.
- ADRs (Architecture Decision Records) under `docs/architecture/`.
- The [compatibility matrix](docs/compatibility/index.md) — which civicrecords-ai version pins to which civiccore version.
- The [GitHub Pages landing site](docs/index.html).

There is no runtime code in this repo. Each module lives in its own repo.

### Module repos

| Module | Repo | Status |
|---|---|---|
| civicrecords-ai | <https://github.com/CivicSuite/civicrecords-ai> | Shipping v1.4.0. Transferred to the `CivicSuite` GitHub org on 2026-04-25; this is now the canonical home. |
| civiccore | <https://github.com/CivicSuite/civiccore> | Shipping v0.2.0. Phase 2 (LLM module) just landed. |
| civicclerk | <https://github.com/CivicSuite/civicclerk> | Shipping v0.1.0 runtime foundation with `/staff` workflow UI foundation. |
| civiccode | <https://github.com/CivicSuite/civiccode> | Shipping v0.1.0 runtime foundation for municipal-code lookup, citations, local imports, and records-ready exports. |
| civiczone | <https://github.com/CivicSuite/civiczone> | Shipping v0.1.0 runtime foundation for parcel-aware zoning samples and public UI foundation. |
| civicaccess | <https://github.com/CivicSuite/civicaccess> | Shipping v0.1.0 runtime foundation for accessibility review and public UI foundation. |
| civicplan | <https://github.com/CivicSuite/civicplan> | Shipping v0.1.0 runtime foundation for cited plan-policy lookup and public UI foundation. |
| civicpermit | <https://github.com/CivicSuite/civicpermit> | Shipping v0.1.0 runtime foundation for permit requirement lookup and public UI foundation. |
| civicinspect | <https://github.com/CivicSuite/civicinspect> | Shipping v0.1.0 runtime foundation for repeat-case lookup, report drafts, notice drafts, and public UI foundation. |
| civicgrants | <https://github.com/CivicSuite/civicgrants> | Shipping v0.1.0 runtime foundation for opportunity triage, eligibility matching, compliance calendars, and public UI foundation. |
| civicprocure | <https://github.com/CivicSuite/civicprocure> | Shipping v0.1.0 runtime foundation for RFP drafting, proposal comparison, exception extraction, scoring summaries, award-packet checklists, and public UI foundation. |
| civiccontracts | <https://github.com/CivicSuite/civiccontracts> | Shipping v0.1.0 runtime foundation for contract registry, clause topic lookup, expiration tracking, renewal visibility, public-records exports, and public UI foundation. |
| civicboards | <https://github.com/CivicSuite/civicboards> | Shipping v0.1.0 runtime foundation for board registry, term tracking, vacancy tracking, attendance review, notice/records exports, and public UI foundation. |
| civicnotice | <https://github.com/CivicSuite/civicnotice> | Shipping v0.1.0 runtime foundation for notice registry, statutory deadlines, publication-readiness checks, channel planning, notice records exports, and public UI foundation. |
| civic311 | <https://github.com/CivicSuite/civic311> | Shipping v0.1.0 runtime foundation for request intake, triage suggestions, duplicate-candidate review, department routing, Open311-compatible exports, and public UI foundation. |
| civiccomms | <https://github.com/CivicSuite/civiccomms> | Shipping v0.1.0 runtime foundation for source-readiness review, meeting summaries, ordinance explainers, newsletters, FAQs, audience variants, and public UI foundation. |
| civicdata | <https://github.com/CivicSuite/civicdata> | Shipping v0.1.0 runtime foundation for dataset normalization, data dictionaries, CKAN metadata drafts, redaction preflight, archive checklists, publication planning, and public UI foundation. |
| civichr | <https://github.com/CivicSuite/civichr> | Shipping v0.1.0 runtime foundation for HR policy lookup, handbook summaries, job descriptions, classification references, onboarding/training checklists, and intake templates. |
| civicbudget | <https://github.com/CivicSuite/civicbudget> | Shipping v0.1.0 runtime foundation for line-item analysis, budget narratives, department memos, hearing packet checklists, resident summaries, and GFOA checklist support. |
| civiclegal | <https://github.com/CivicSuite/civiclegal> | Shipping v0.1.0 runtime foundation for privilege-aware legal-record search, prior-action lookup, memo scaffolds, ordinance comparison, litigation-hold flags, and citation tracking. |
| future modules | not created yet | Specs only. |

### Dependency direction

- Modules depend on civiccore. **Civiccore never depends on a module.**
- This is enforced in CI in the civiccore repo and is documented in the [extraction spec](specs/02_CivicCore.md) section 5.2.
- Modules are pinned to a civiccore version in their package manifest. The compatibility matrix is the truth-source for which pin is required for which module version.

### How civiccore is consumed

A module like `civicrecords-ai` declares civiccore as a dependency in its `pyproject.toml`:

```toml
dependencies = [
  "civiccore==0.2.0",
  ...
]
```

When a city installs records-ai, civiccore is pulled in as a wheel. There is no monorepo, no submodule, no vendored copy. Civiccore is published to PyPI (or, until publication, distributed as a release wheel from its GitHub repo).

### Evaluating a module

1. Read the module's `README.md` (start with the front-door pitch).
2. Read its `USER-MANUAL.md` for a non-technical operations walkthrough.
3. Check `CHANGELOG.md` to see release cadence and recent breaking changes.
4. Spin up a local install following the module's `CONTRIBUTING.md` setup steps. The umbrella does not host setup instructions for individual modules — those live with the module.
5. If the module's tests pass on a clean clone, the project meets the umbrella's minimum bar.

### Contributing

- **Suite-wide questions, ADRs, governance, roadmap, compatibility matrix** → contribute here. See [CONTRIBUTING.md](CONTRIBUTING.md).
- **Module bugs, module features, module docs** → contribute on the module's repo. The bug-routing decision tree in CONTRIBUTING.md tells you where each kind of bug goes.

### Release coordination

When a module ships a new version, the compatibility matrix on this umbrella must be updated. Cross-cutting changes (e.g. civiccore breaks an API that records-ai uses) require a paired release: civiccore ships first, then records-ai ships pinned to the new civiccore. The release pairing is documented in the matrix.

---

## Part 3 — Architecture reference

![CivicSuite umbrella architecture](docs/diagrams/suite-architecture.svg)

### Suite topology (textual diagram)

```
                        +---------------------------+
                        |   civicsuite (umbrella)   |
                        |   docs, ADRs, governance, |
                        |   compatibility matrix    |
                        +-------------+-------------+
                                      |
              describes & coordinates |
                                      v
                        +---------------------------+
                        |     civiccore (v0.2.0)    |
                        |  SHIPPING TODAY:          |
                        |  migrations, db.Base, llm |
                        |  (providers, templates,   |
                        |  registry, context,       |
                        |  structured output)       |
                        |                           |
                        |  PLACEHOLDER ONLY (empty  |
                        |  __init__.py, no code):   |
                        |  auth, RBAC, audit,       |
                        |  ingest, search,          |
                        |  notifications,           |
                        |  connectors, exemptions,  |
                        |  onboarding, catalog,     |
                        |  verification             |
                        +-------------+-------------+
                                      ^
                  depends on (pinned) |
              +-----------------------+-----------------------+
              |                       |                       |
   +----------+----------+   +--------+---------+   +---------+--------+
   | civicrecords-ai     |   |   civicclerk     |   |   civiczone      |
   |   v1.4.0 SHIPPING   |   | v0.1.0 SHIPPING  |   | v0.1.0 SHIPPING |
   |   FOIA / public     |   |  meetings,       |   |  zoning, parcel  |
   |   records mgmt      |   |  agendas, votes  |   |  workflows       |
   +---------------------+   +------------------+   +------------------+
              |
              | future modules: civiccode, civiccirculate, ...
              | (see specs/01_catalog.md — 26 modules across 7 tiers)
```

### Dependency rule

**Modules import from civiccore. Civiccore never imports from modules.** This is the core architectural constraint of the suite. It is enforced by a lint rule in CI in the civiccore repo. Violating it would silently couple modules to each other through civiccore and destroy the modular install promise.

### Migration / upgrade order

When civiccore ships a backward-compatible version (PATCH or MINOR):

1. civiccore releases the new version.
2. The umbrella's compatibility matrix is updated.
3. Module maintainers update their pin opportunistically (no forced upgrade).

When civiccore ships a breaking version (MAJOR):

1. The breaking change is announced in advance via an ADR.
2. civiccore releases the new MAJOR version.
3. Each module that consumes civiccore ships a paired MAJOR release pinned to the new civiccore version.
4. The compatibility matrix is updated to show both the old (still supported) and new pairing during a transition window.

### Glossary (Part 3)

- **ADR** — Architecture Decision Record; a short, dated document recording a significant architectural decision and its rationale.
- **Pinned version** — a specific exact version a module requires of civiccore (e.g. `==0.2.0`), as opposed to a range.
- **Wheel** — the standard Python package distribution format. civiccore is published as a wheel.
- **CI** — continuous integration; the automated test pipeline that runs on every commit and pull request.
- **Monorepo** — a single repository containing multiple projects. CivicSuite is deliberately *not* a monorepo; each module has its own repo so cities can install modules independently.

---

## What to do when something goes wrong

| Symptom | Where to look |
|---|---|
| Module won't install | The module's `README.md` and `CONTRIBUTING.md` setup steps. Most install errors are resolved by matching the documented Python/PostgreSQL/Redis versions. |
| civiccore pin mismatch | The compatibility matrix at [docs/compatibility/index.md](docs/compatibility/index.md). |
| You found a bug, don't know where to file | The bug-routing decision tree in [CONTRIBUTING.md](CONTRIBUTING.md). |
| Security issue | [SECURITY.md](SECURITY.md). |
| You have a general question | [SUPPORT.md](SUPPORT.md). |
