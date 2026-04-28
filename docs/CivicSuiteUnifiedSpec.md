# CivicSuite Unified Specification

**Canonical suite specification for CivicSuite, CivicCore, CivicRecords AI, CivicClerk, CivicZone, and future modules**

Version: 1.0  
Status: Canonical planning specification  
Date: 2026-04-26  
License: Apache License 2.0 for code; CC BY 4.0 for documentation unless a repository-specific LICENSE says otherwise.  
Supersedes: `CivicSuiteAI_Module_Catalog_v1`, `Open Source AI for Municipalities`, and module-specific draft specs where they conflict with this document.  
Preserves: Feature, workflow, schema, prompt, testing, and product requirements from the source documents unless explicitly marked superseded, deferred, or corrected here.

## 1. Purpose

This document is the working source of truth for the CivicSuite product family.

It consolidates the useful content from:

- `CivicSuiteAI_Module_Catalog_v1`
- `CivicRecordsAI-UnifiedSpec-v3.0`
- `CivicCore_v0_1_Extraction_Spec`
- `CivicClerk_Module_Spec_v0_1`
- `CivicZone_Module_Spec_v0_1`
- `Open Source AI for Municipalities`
- Current repository truth in `CivicSuite/civicsuite`, `CivicSuite/civiccore`, `CivicSuite/civicrecords-ai`, and `CivicSuite/civicclerk`

The goal is not to reduce the suite to a pitch. The goal is to preserve the full product surface while removing drift, stale licensing language, stale module counts, ambiguous dependency claims, and inconsistent shipped/planned labels.

## 2. Governing Corrections

These corrections override older source documents.

### 2.1 License

All CivicSuite code repositories use **Apache License 2.0**.

Documentation uses **CC BY 4.0** unless a repository-specific LICENSE says otherwise. Code snippets inside documentation are governed by Apache License 2.0.

Older drafts referenced MIT. That language is superseded. Apache 2.0 is the civic/municipal default because it remains permissive while giving public-sector legal/procurement reviewers clearer patent and contribution language.

### 2.2 Module Count And Tiers

The suite catalog contains **26 named modules across 7 tiers**:

- Tier 0: Foundation
- Tier 1: Clerk Core
- Tier 2: Land Use & Development
- Tier 3: Administrative Expansion
- Tier 4: Operations
- Tier 5: Internal Business
- Tier 6: Specialized

Older drafts said "26 modules across 6 tiers." That was an arithmetic/category drift. This document standardizes on 7 tiers, counting Tier 0 through Tier 6.

### 2.3 Repository Placement

All CivicSuite module repositories live under the `CivicSuite` GitHub organization. Personal-account repositories are transitional only and should not be used for canonical project links.

Current canonical repositories:

- `CivicSuite/civicsuite` - umbrella documentation, governance, compatibility, roadmap.
- `CivicSuite/civiccore` - shared platform library.
- `CivicSuite/civicrecords-ai` - public records / FOIA product.
- `CivicSuite/civicclerk` - meeting/agendas/minutes product.
- `CivicSuite/civiccode` - municipal code and ordinance access product.
- `CivicSuite/civicaccess` - accessibility, plain-language, multilingual, and ADA support product.
- `CivicSuite/civiczone` - parcel-aware zoning and land-use support product.
- `CivicSuite/civicplan` - comprehensive-plan policy lookup and planning analysis support product.
- `CivicSuite/civicpermit` - permit pre-application and intake-readiness support product.
- `CivicSuite/civicinspect` - inspection support product.
- `CivicSuite/civicgrants` - grant opportunity and compliance support product.
- `CivicSuite/civicprocure` - procurement drafting and award-packet support product.
- `CivicSuite/civiccontracts` - contract repository and renewal visibility support product.
- `CivicSuite/civicboards` - board and commission administration support product.
- `CivicSuite/civicnotice` - public notice compliance support product.

Future module repositories should be created under `CivicSuite/` from the start.

### 2.4 CivicCore Capability Truth

The long-term CivicCore responsibility set includes auth, RBAC, audit, LLM abstraction, document ingestion, hybrid search, connectors, notifications, onboarding, city profile, catalog, exemption rules, sovereignty controls, and shared module shell conventions.

Current shipped CivicCore v0.3.0 is narrower than the long-term platform vision, but broader than the v0.2.0 LLM-only extraction:

- `civiccore.migrations`
- `civiccore.db.Base`
- `civiccore.llm` providers, templates, registry, context utilities, and structured output helpers
- Hash-chained audit primitives
- Source/provenance metadata contracts
- Offline import/export manifest schemas
- Export-bundle helpers and checksum manifest utilities
- Local city profile configuration

Placeholder packages are not implementation. Any public-facing document must say this clearly.

## 3. Strategic Thesis

CivicSuite is an open-source, local-first municipal operations suite for small and mid-sized cities.

It is designed around four realities:

1. Municipal data is sensitive, fragmented, and often legally constrained.
2. Small cities cannot afford enterprise SaaS pricing, per-seat traps, or cloud-only AI posture.
3. Clerks, planners, attorneys, finance staff, and department leads need practical workflow tools, not novelty chatbots.
4. AI output must be cited, reviewable, locally governed, and subordinate to human decision-making.

CivicSuite is **not** an ERP replacement, utility billing system, CAD/RMS, court case-management system, or permitting system of record on day one. It wins in the layer around municipal knowledge work: records, meetings, ordinances, zoning, notices, contracts, grants, procurement writing, public communication, accessibility, and internal policy Q&A.

## 4. Suite-Wide Non-Negotiables

Every module inherits these rules.

### 4.1 Product Principles

- Staff workflows come before flashy resident features.
- Resident-facing features ship when they improve trust, transparency, and self-service without creating legal ambiguity.
- Each module degrades gracefully when the LLM is unavailable.
- Modules are installable independently; CivicCore is the only required foundation.
- Interfaces must be calm, accessible, government-appropriate, and actionable.
- Every error, empty state, warning, and compliance flag must tell the user what happened and what to do next.

### 4.2 AI Principles

- AI drafts; humans decide.
- No auto-release, auto-denial, auto-redaction, auto-enforcement, or auto-determination.
- Every material answer cites source material.
- Prompt libraries are versioned, auditable, and configurable.
- Model, prompt, data-source, and output provenance are recorded.
- Local inference is the default. No outbound telemetry.
- External/cloud LLM providers may be supported as optional adapters only when explicitly configured by the city.

### 4.3 Sovereignty Principles

- Cities own their data.
- The system must support air-gapped and segmented deployments.
- Runtime operation must not require vendor telemetry.
- Connectors must be transparent and inspectable.
- Exports must be possible in open, documented formats.

### 4.4 Documentation And QA Principles

- Documentation ships with code.
- Every module must have README, README.txt, user manual, professional landing page, architecture docs, discussion seeds, issue templates, PR template, support/security/contributing docs, and license files.
- Version numbers must be consistent across code, tests, docs, landing pages, release notes, installer metadata, and generated binaries.
- Browser-visible UI must be QA-verified at desktop and mobile widths before release.
- Current-state truth must be separated from roadmap aspiration.

## 5. Standard Module Architecture

Every runtime module follows the CivicRecords AI pattern unless an ADR explicitly overrides it.

### 5.1 Backend

- FastAPI application
- PostgreSQL 17 with pgvector where vector search is needed
- Redis 7.2
- Celery and Celery Beat for background work
- Alembic migrations
- CivicCore dependency pinned to a compatible released version
- Per-module schema or clearly bounded table namespace
- Foreign keys into CivicCore shared tables where needed
- Hash-chained audit logging once CivicCore audit extraction lands

### 5.2 Frontend

- React staff shell
- Module-specific staff pages
- Module-specific resident/public pages where appropriate
- Shared accessibility, navigation, and public-trust conventions
- No color-only status indicators
- Visible focus states
- Keyboard-complete workflows
- Actionable empty/error states

### 5.3 AI And Prompting

- Module-specific YAML prompt library, never hardcoded prompt strings for policy-bearing workflows
- CivicCore LLM provider abstraction
- CivicCore template resolver with civiccore defaults, code overrides, and module/city overrides
- Citation requirements enforced in prompt contracts and output validation
- Evaluation harness for prompt behavior before release

### 5.4 Data And Search

- Documents and chunks eventually belong in CivicCore shared infrastructure.
- Module-specific tables belong in the module schema/namespace.
- Search must be permission-aware.
- Public search must never leak staff-only or closed-session content.
- Every answer that looks like advice must distinguish information from determination.

### 5.5 Connectors

Connector support should follow this priority:

1. File drop / CSV / export import for small cities.
2. Common local filesystems and document repositories.
3. Open APIs where available.
4. Vendor-specific integrations only where high-value.
5. Write-back connectors only after read/import paths are stable and auditable.

## 6. CivicCore Roadmap

CivicCore is the shared platform, not a user-facing product.

### 6.1 Shipped

Current shipped CivicCore v0.3.0 includes:

- Migration runner and baseline migration strategy
- Shared SQLAlchemy `Base`
- LLM provider interface and provider registry
- Ollama, OpenAI, and Anthropic provider adapters
- Provider config objects and provider factory
- Prompt template model, resolver, and override registry
- Model registry model/service/router
- Context budgeting and token utilities
- Structured output retry helper
- Hash-chained audit primitives
- Source/provenance metadata contracts
- Offline import/export manifest schemas
- Export-bundle helpers and checksum manifest utilities
- Local city profile configuration

### 6.2 Planned Extractions

Future CivicCore phases must extract shared capabilities from module implementations in disciplined increments:

- Auth and RBAC
- User, department, and service-account administration
- Web onboarding wizard
- Document ingestion and document/chunk storage
- Hybrid lexical/vector search
- Live connector sync, credential storage, vendor write-back, and connector runtime
- Notification templates and delivery logs
- Exemption/public-records rules
- Verification, provenance, and human-in-the-loop enforcement
- Shared resident portal shell conventions
- Shared staff app-shell conventions
- Module registry / installed-module catalog

No module may depend on planned CivicCore behavior unless that behavior is released in a versioned CivicCore artifact.

## 7. Canonical Module Catalog

### Tier 0 - Foundation

#### CivicCore

Owner: IT / platform team  
Depends on: none  
Status: shipping v0.3.0, with many planned extractions
Purpose: shared infrastructure layer for every module. CivicCore owns the common libraries, migrations, LLM abstraction, shared schema conventions, audit/provenance/manifest/export primitives, city profile configuration, and future auth/search/live-connector primitives.

### Tier 1 - Clerk Core

#### CivicRecords

Owner: City Clerk / Records Officer / Legal reviewer  
Depends on: CivicCore  
Status: shipping v1.4.0  
Purpose: open-records intake, workflow, search, exemption review, response drafting, fee tracking, audit trail, and planned public request portal.

#### CivicClerk

Owner: City Clerk / Council Support / City Manager's Office  
Depends on: CivicCore. Optional integration with CivicRecords for records-search visibility.  
Status: shipping v0.1.1 foundation  
Purpose: agenda intake, packet assembly, staff report normalization, notice compliance, motion/vote capture, minute drafting, ordinance/resolution extraction, searchable meeting archive, and public meeting portal.

Dependency note: older catalog text listed CivicRecords because shared document/search infrastructure was still inside CivicRecords. The corrected dependency is CivicCore once that infrastructure is extracted; CivicRecords integration remains optional.

#### CivicCode

Owner: City Clerk / Legal / Codification Department  
Depends on: CivicCore, CivicClerk  
Status: shipping v0.1.0 foundation
Purpose: municipal code as a first-class product. Residents and staff ask what the code says about a topic and receive cited answers tied to authoritative code sections. CivicClerk feeds adopted ordinance/resolution events into CivicCode.

#### CivicAccess

Owner: Clerk / Communications / IT / ADA Coordinator  
Depends on: CivicCore  
Status: shipping v0.1.1 foundation
Purpose: accessible forms, accessible publishing workflows, multilingual and plain-language rewrites, ADA Title II review, records-ready exports, and accessibility support reused by every module.

### Tier 2 - Land Use & Development

#### CivicZone

Owner: Planning & Development / Community Development  
Depends on: CivicCore, CivicCode  
Status: shipping v0.1.0 foundation  
Purpose: parcel-aware zoning and land-use Q&A. Residents ask what zone a property is in, what uses are allowed, what setbacks apply, and when planner review is required. CivicZone never makes a zoning determination.

#### CivicPlan

Owner: Planning & Development / City Manager's Office  
Depends on: CivicCore, CivicZone, CivicClerk  
Status: shipping v0.1.1 foundation  
Purpose: comprehensive plans, small-area plans, transportation plans, parks plans, and sustainability plans become searchable, cited, and usable in staff analysis.

#### CivicPermit

Owner: Planning / Building / Community Development  
Depends on: CivicCore, CivicCode, CivicZone  
Status: shipping v0.1.0 foundation  
Purpose: pre-application and intake copilot for permits and development review. Not a permitting system of record.

#### CivicInspect

Owner: Code Enforcement / Building / Fire Prevention  
Depends on: CivicCore, CivicCode  
Status: shipping v0.1.0 foundation  
Purpose: inspection assistant for photo/voice-to-report drafting, repeat-case lookup, and notice generation. Inspectors own every decision.

### Tier 3 - Administrative Expansion

#### CivicGrants

Owner: City Manager / Finance / Administration / Economic Development  
Depends on: CivicCore, CivicRecords  
Status: shipping v0.1.0 foundation  
Purpose: opportunity triage, eligibility matching, application drafting, compliance calendars, and audit-ready grant files.

#### CivicProcure

Owner: Finance / Purchasing / Clerk / Legal  
Depends on: CivicCore, CivicClerk, CivicContracts  
Status: shipping v0.1.0 foundation  
Purpose: RFP drafting, proposal comparison, exception extraction, scoring summaries, board memos, and award packets.

#### CivicContracts

Owner: Clerk / Legal / Finance / Department contract managers  
Depends on: CivicCore, CivicProcure, CivicRecords  
Status: shipping v0.1.0 foundation  
Purpose: central contract repository with clause Q&A, expiration tracking, renewal visibility, and public-records-aware exports.

#### CivicBoards

Owner: City Clerk / Board liaisons  
Depends on: CivicCore, CivicClerk  
Status: shipping v0.1.0 foundation  
Purpose: non-Council boards and commissions: members, terms, vacancies, attendance, agendas, packets, minutes, and public notices.

#### CivicNotice

Owner: City Clerk / Communications  
Depends on: CivicCore, CivicAccess, CivicClerk, CivicProcure, CivicBoards  
Status: shipping v0.1.0 foundation  
Purpose: compliance workflow for public hearings, legal notices, bid notices, vacancies, and statutory publication deadlines.

### Tier 4 - Operations

#### Civic311

Owner: Public Works / Utilities / Neighborhood Services / Code Enforcement  
Depends on: CivicCore, CivicAccess, CivicCode  
Status: planned  
Purpose: resident service request intake with AI triage, deduplication, routing, and Open311-compatible export.

#### CivicComms

Owner: Clerk / Communications / Administration / Mayor & Manager's Office  
Depends on: CivicCore, CivicClerk, CivicCode, CivicAccess  
Status: planned  
Purpose: source-backed public explainers, meeting summaries, ordinance summaries, newsletters, FAQ generation, and multilingual public notices.

#### CivicData

Owner: IT / Clerk / Administration / Analysts  
Depends on: CivicCore  
Status: shipping v0.1.0 foundation  
Purpose: municipal system normalization, open-data-ready packages, searchable archive bundles, CKAN integration, and records retention exports. v0.1.0 ships dataset normalization, data-dictionary drafts, CKAN metadata drafts, PII/exemption preflight, archive-bundle checklists, publication planning, and an accessible public sample UI. Live CKAN publishing, BI dashboards, data warehouse storage, autonomous redaction, and external connector runtime are not shipped.

### Tier 5 - Internal Business

#### CivicHR

Owner: Human Resources  
Depends on: CivicCore  
Status: shipping v0.1.0 foundation  
Purpose: personnel policy Q&A, job description drafting, onboarding packet generation, and internal HR knowledge support. Not an HRIS. v0.1.0 ships policy lookup outlines, handbook summaries, job-description drafts, classification references, onboarding/training checklists, intake templates, source review, sensitive-topic preflight, and an accessible public sample UI. HRIS, payroll, benefits administration, personnel records management, employment-law advice, personnel-file ingestion, live LLM calls, and external HR/payroll connector runtime are not shipped.

#### CivicBudget

Owner: Finance / City Manager / Department budget leads  
Depends on: CivicCore, CivicClerk, CivicData  
Status: shipping v0.1.0 runtime foundation  
Purpose: budget memo drafting, departmental budget narratives, line-item analysis, and hearing packet prep. Not a budgeting system.

#### CivicLegal

Owner: City Attorney / Paralegal / Clerk  
Depends on: CivicCore, CivicCode, CivicClerk, CivicContracts  
Status: shipping v0.1.0 runtime foundation  
Purpose: Q&A over the city's own legal corpus, including ordinances, resolutions, contracts, legal opinions, litigation history, statutes, and prior Council actions.

#### CivicElections

Owner: City Clerk / Election Official  
Depends on: CivicCore, CivicCode, CivicAccess  
Status: shipping v0.1.0 runtime foundation  
Purpose: support for cities running their own elections: candidate filing guidance, voter information Q&A, ballot question drafting support, election worker training, and accessible materials.

### Tier 6 - Specialized

#### CivicUtility

Owner: Utilities / Customer Service  
Depends on: CivicCore, Civic311  
Status: shipping v0.1.0 runtime foundation  
Purpose: utility customer-service copilot for account lookup, billing Q&A, payment arrangement drafting, and service request intake. Not a billing system.

#### CivicCourt

Owner: Court Clerk / Municipal Court  
Depends on: CivicCore in isolated profile  
Status: shipping v0.1.0 runtime foundation  
Purpose: document preparation and search support for municipal court clerks. Sensitive deployment; tight scoping required.

#### CivicSafety

Owner: Public Safety administration  
Depends on: CivicCore in isolated CJIS-aware profile  
Status: shipping v0.1.0 runtime foundation  
Purpose: policy/procedure Q&A, non-CJIS administrative workflows, and public-information-officer support. Explicitly excludes operational dispatch and CJIS-bound data unless a future CJIS compliance program exists.

#### CivicLibrary

Owner: Library Director / Reference Librarians  
Depends on: CivicCore  
Status: shipping v0.1.0 runtime foundation  
Purpose: library policy Q&A, program and event Q&A, collection-metadata reference assistance, collection-development guidance, and accessibility support. Explicitly excludes patron records, ILS integration, circulation actions, professional-reference replacement, legal advice, live LLM calls, and connector runtime.

#### CivicParks

Owner: Parks & Recreation Director  
Depends on: CivicCore, Civic311  
Status: shipping v0.1.0 runtime foundation
Purpose: parks/facility/program Q&A, registration-link assistance, policy lookup, maintenance request triage, and resident-facing parks information. Explicitly excludes payment processing, registration writes, participant records, reservation writes, crew dispatch, live LLM calls, and connector runtime.

## 8. CivicRecords Canonical Scope

CivicRecords is Module 1 and the architectural template.

### 8.1 Product Promise

Any resident should be able to search for public records, request what is missing, and understand the status of the request without insider knowledge of government structure.

Any records clerk should be able to triage, search, review, redact, and respond from one calm interface instead of email, spreadsheets, and paper.

### 8.2 Current Capability Themes

- Request workflow management
- Search sessions, queries, and results
- Records request intake and tracking
- Request documents and request timeline
- Request messages
- Response letter drafting
- Fee schedules, fee line items, fee waivers
- Notification templates and notification log
- Exemption rules and exemption flags
- Data sources and connector templates
- Document cache
- Public landing/register/submit surfaces where implemented
- Admin/settings/user-management surfaces

### 8.3 Request Lifecycle

Canonical lifecycle:

`received -> clarification_needed -> assigned -> searching -> in_review -> ready_for_release -> drafted -> approved -> fulfilled -> closed`

### 8.4 Non-Negotiable Records Rules

- No automatic release.
- No automatic denial.
- No automatic redaction.
- AI outputs are drafts and require staff review.
- Exemptions must cite rule/category/source.
- Public-facing request language must be plain and actionable.
- Search and document visibility must respect permissions and staff-only boundaries.

### 8.5 Planned Records Work

- Public request portal completeness
- Public request tracking
- Redaction ledger
- Stronger discovery/connection engine
- SMTP delivery completion where not fully implemented
- Federation workflows where appropriate
- Accessibility fixes from the v3.0 audit: touch targets, focus visibility, skip navigation, non-color-only badges, keyboard completion, form-error focus, screen-reader validation

## 9. CivicClerk Canonical Scope

CivicClerk is Module 2 and ships a v0.1.0 runtime foundation.

### 9.1 Product Promise

CivicClerk replaces brittle meeting-management workflows with a clerk-first, locally deployed system for agendas, packets, minutes, voting, notices, and public meeting records. It is citation-grounded and sunshine-law aware.

### 9.2 The Nine CivicClerk Functions

CivicClerk covers:

1. Agenda item intake
2. Packet assembly
3. Staff report normalization
4. Meeting notice and posting compliance
5. Motion, vote, and action-item capture
6. Minute drafting from packet/transcript/notes with sentence citations
7. Ordinance/resolution extraction, diffing, and handoff to CivicCode
8. Meeting archive search across packets/minutes/transcripts
9. Public meeting portal with accessible posting

### 9.3 CivicClerk Does Not

- Replace the clerk.
- Make legal compliance determinations without human review.
- Publish notices without clerk confirmation.
- Open closed-session content to public queries.
- Replace livestream platforms.
- Replace codification systems on day one.

### 9.4 Agenda Item Lifecycle

Canonical agenda item lifecycle:

`DRAFTED -> SUBMITTED -> DEPT_APPROVED -> LEGAL_REVIEWED -> CLERK_ACCEPTED -> ON_AGENDA -> IN_PACKET -> POSTED -> HEARD -> DISPOSED -> ARCHIVED`

Invalid transitions are rejected at the API layer and audit logged.

### 9.5 Meeting Lifecycle

Canonical meeting lifecycle:

`SCHEDULED -> NOTICED -> PACKET_POSTED -> IN_PROGRESS -> RECESSED -> ADJOURNED -> TRANSCRIPT_READY -> MINUTES_DRAFTED -> MINUTES_POSTED -> MINUTES_ADOPTED -> MINUTES_SIGNED -> ARCHIVED`

Additional paths:

- Cancelled meeting path
- Emergency/special meeting path with statutory-basis capture
- Closed/executive session blocks with separate notice/minutes controls

### 9.6 Clerk-Facing Workflows

- Create and maintain meeting bodies.
- Schedule regular, special, emergency, and cancelled meetings.
- Manage agenda item intake and departmental approvals.
- Assemble packets in correct order.
- Track posting deadlines and posting proof.
- Capture motions, seconds, votes, abstentions, recusals, and absences.
- Draft minutes from packet, transcript, and clerk notes.
- Produce signed/adopted minutes archive.
- Preserve correction history for motions/votes/minutes.

### 9.7 Staff-Facing Workflows

- Draft agenda items.
- Attach staff reports and supporting documents.
- Submit reports for department/legal/clerk review.
- Normalize staff reports into standard format.
- Route revisions without losing history.
- Sign off with audit record.

### 9.8 Member-Facing Workflows

- View packets.
- Review item history.
- View staff reports, attachments, and prior versions according to role.
- Record votes and conflicts where appropriate.

### 9.9 Public-Facing Workflows

- Public meeting calendar.
- Meeting detail page.
- Agenda and packet download.
- Public comment intake where enabled.
- Adopted minutes archive.
- Searchable meeting archive.
- Accessible posting and plain-language summaries where approved.

### 9.10 CivicClerk Data Model

CivicClerk introduces module-specific tables in the `civicclerk` schema. The runtime implementation should use this list as the starting point and must document any ADR-approved deviation.

Canonical tables:

- `civicclerk.meeting_bodies`
- `civicclerk.meetings`
- `civicclerk.agenda_items`
- `civicclerk.staff_reports`
- `civicclerk.motions`
- `civicclerk.votes`
- `civicclerk.public_comments`
- `civicclerk.notices`
- `civicclerk.minutes`
- `civicclerk.transcripts`
- `civicclerk.action_items`
- `civicclerk.packet_versions`
- `civicclerk.ordinances_adopted`
- `civicclerk.closed_sessions`

Required cross-cutting properties:

- Versioned packet snapshots.
- Immutable motion/vote records after capture; corrections reference originals.
- Staff-only ACL for closed-session material.
- Document references into CivicCore document tables once those tables are fully extracted.
- Permission-aware archive search.

### 9.11 CivicClerk Prompt Library

CivicClerk prompts ship as versioned YAML. Minimum prompt set:

- Agenda item summary
- Staff report normalizer
- Packet completeness reviewer
- Notice compliance reviewer
- Motion/vote summary
- Minute drafter
- Ordinance/resolution extractor
- Closed-session safe summarizer/refuser
- Public plain-language meeting explainer

Public-facing output prompts require clerk and attorney approval before deployment.

### 9.12 CivicClerk REST/API Scope

The CivicClerk module spec designs approximately 25 endpoints. Implementation should cover:

- Meeting bodies
- Meetings
- Agenda items
- Staff reports
- Packets
- Notices/postings
- Motions
- Votes
- Minutes
- Transcripts
- Public comments
- Action items
- Ordinance/resolution handoff
- Archive search
- Admin prompt/config surfaces

### 9.13 CivicClerk Frontend Scope

The CivicClerk module spec designs approximately 20 pages. Runtime planning should include:

- Staff dashboard
- Meeting calendar
- Meeting detail
- Agenda builder
- Agenda item intake
- Staff report editor
- Packet builder
- Notice checklist/posting proof
- Live meeting capture
- Minutes drafting/review
- Motions/votes/action-items page
- Transcript management
- Public comment review
- Closed-session staff-only workspace
- Archive search
- Public meeting calendar
- Public meeting detail
- Admin settings
- Prompt library admin
- Connector/import admin

### 9.14 CivicClerk Integrations

Priority integrations:

- Granicus / Legistar / PrimeGov / NovusAGENDA import readers
- Video/livestream link embedding
- Caption/transcript ingest
- City website CMS posting
- CivicCode handoff API for adopted ordinances/resolutions
- CivicRecords search integration
- Codification-system export where CivicCode is absent

### 9.15 CivicClerk Test Matrix

Required test areas:

- Agenda lifecycle
- Meeting lifecycle
- Packet assembly
- Notice compliance
- Motion/vote capture
- Minute drafting with citations
- Transcription and segment timestamps
- Closed-session boundary
- Public comment handling
- Migration/import fidelity
- RBAC and packet visibility
- Archive search permissions
- Accessibility
- Air-gap behavior
- CivicCore compatibility matrix

## 10. CivicZone Canonical Scope

CivicZone is the first major Tier 2 product after Clerk Core.

### 10.1 Product Promise

CivicZone answers routine parcel-aware zoning questions with citations while never making a zoning determination. It gives residents and planners the 80% answer and routes the 20% judgment cases to staff.

### 10.2 Resident Workflows

- Enter address or select parcel.
- See zone, overlays, mapped constraints, and source citations.
- Ask plain-language questions such as "Can I build an ADU?"
- Receive cited informational answer with explicit non-determination disclaimer.
- Learn when variance, CUP, or planner review may be needed.

### 10.3 Staff Workflows

- Planner Q&A with code cross-references.
- Ambiguity review queue.
- High-volume question analytics.
- Draft staff-report outline support.
- Review and improve flagged answers.

### 10.4 CivicZone Data Model

Canonical CivicZone tables:

- `civiczone.zones`
- `civiczone.overlays`
- `civiczone.parcels`
- `civiczone.use_categories`
- `civiczone.use_rules`
- `civiczone.dimensional_rules`
- `civiczone.citations`
- `civiczone.precedents`
- `civiczone.interpretation_notes`
- `civiczone.zone_questions`

### 10.5 CivicZone Prompt And Safety Rules

- Every answer says it is not a zoning determination.
- Answers cite zoning code sections.
- Determination requests are refused or escalated.
- Out-of-jurisdiction questions are refused.
- Low-confidence results escalate to planner review.
- Staff-only precedent context is never exposed to residents.

### 10.6 CivicZone Integrations

Priority integrations:

- Esri ArcGIS REST Feature Service
- GeoJSON fallback for offline/non-Esri cities
- CivicCode internal API for authoritative code text
- CivicClerk internal API for variance/CUP hearing minutes as staff-only precedent context
- CivicPlan internal API for comprehensive-plan policy context
- CivicAccess internal API for plain-language rewrites
- County assessor data import
- CKAN publication for anonymized trends

### 10.7 CivicZone Test Matrix

Required test areas:

- Parcel lookup
- Use-matrix lookup
- Dimensional pre-check
- Variance/CUP explainer
- Citation contract
- Disclaimer enforcement
- Refusal rules
- RBAC
- GIS ingestion
- Air-gap behavior
- Accessibility
- Performance
- CivicCore compatibility matrix

## 11. CivicCode Canonical Scope

CivicCode is a critical Tier 1 dependency for CivicZone and shipped before CivicZone runtime work began.

Purpose:

- Authoritative municipal code store.
- Cited code Q&A for staff and residents.
- Plain-language explanations alongside authoritative text.
- Ordinance adoption feed from CivicClerk.
- Amendment/version history.
- Section resolution service for CivicZone, CivicLegal, CivicAccess, and CivicComms.

Non-negotiables:

- It must not give legal advice.
- It must cite exact sections.
- It must distinguish adopted law from pending ordinance language.
- It must preserve code version/date context.

## 12. CivicAccess Canonical Scope

CivicAccess is the suite-wide accessibility and plain-language layer.

Purpose:

- Accessible forms.
- Accessible publishing workflow.
- WCAG review support.
- Plain-language rewrites.
- Multilingual variants.
- ADA Title II review support.
- Tagged-heading PDF expectations.
- Records-ready accessible exports.

It should be treated as horizontal infrastructure that every public-facing module eventually uses.

## 13. Resident Portal Strategy

The old CivicRecords-only "public portal" concept is too narrow.

Each module needs its own public surface, unified by a shared resident portal shell:

- Request a record: CivicRecords
- Find a meeting: CivicClerk
- Read code: CivicCode
- Ask zoning questions: CivicZone
- Submit service request: Civic311
- Read notices: CivicNotice
- View accessibility-friendly content: CivicAccess

The resident portal should not become a forced monolith. It is a shell and routing layer over module-owned public surfaces.

## 14. Universal Discovery And Municipal Systems Catalog

The CivicRecords discovery architecture is a suite-level asset, not merely a records feature.

The Municipal Systems Catalog should become:

- A connector directory.
- A map of the city's existing systems.
- A module recommendation engine.
- An onboarding checklist.
- A data-sensitivity map.
- A governance artifact showing what is connected, indexed, ignored, or deliberately air-gapped.

Connector domains include:

- Finance and budgeting
- Public safety
- Land use and permitting
- HR
- Document management
- Email and communication
- Utilities and public works
- Courts/legal
- Parks and recreation
- Asset/fleet management
- Legacy/custom systems

Protocols include:

- File system / SMB
- SMTP / IMAP journal
- REST API
- ODBC / JDBC
- GIS REST API
- Vendor SDK
- Manual/export drop

## 15. Governance And Compliance

### 15.1 Human In The Loop

Every consequential AI output remains a draft. Approval authority is role-based and auditable.

### 15.2 Auditability

Each module must record:

- Who acted
- What was changed
- Which source material was used
- Which model generated the draft
- Which prompt version was used
- Which human approved or rejected it

### 15.3 Public Records And Retention

Modules must assume their outputs may themselves become public records. Export, retention, and legal hold behavior must be considered in every module.

### 15.4 Accessibility

Public surfaces target WCAG 2.2 AA. Staff surfaces should also meet practical keyboard, focus, contrast, and screen-reader expectations.

### 15.5 Air-Gap And Network Behavior

No module may require outbound runtime calls in the default local deployment profile. External provider integrations must be explicit, configurable, and disabled by default.

## 16. Release And Versioning Rules

Every repo must keep version truth synchronized across:

- Code/package metadata
- README and README.txt
- User manuals
- Landing page
- CHANGELOG
- Installer metadata where applicable
- Tests that assert displayed version
- Generated docs/binaries
- GitHub release notes
- Compatibility matrix

Every release must have:

- Version bump
- CHANGELOG section
- Verification log
- Passing CI
- Release assets where applicable
- SHA/checksum where applicable
- GitHub release marked Latest when appropriate

## 17. Documentation Standard

Every repo must include:

- `README.md`
- `README.txt`
- `USER-MANUAL.md`
- `USER-MANUAL.txt`
- Generated `USER-MANUAL.pdf` and `.docx` when tooling exists
- `CHANGELOG.md`
- `CONTRIBUTING.md`
- `CODE_OF_CONDUCT.md`
- `SECURITY.md`
- `SUPPORT.md`
- `LICENSE`
- `LICENSE-CODE` when docs and code use different licenses
- `.github/ISSUE_TEMPLATE/`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `docs/index.html`
- Architecture docs with actual diagrams where architecture is user-facing
- GitHub Discussions seed posts

For a shipping product, these docs must be honest about what ships today and what is planned.

## 18. Current Shipped State

As of 2026-04-28:

- `civicrecords-ai` ships as v1.4.0.
- `civiccore` ships as v0.3.0.
- `civicsuite` is the umbrella documentation/governance repo.
- `civicclerk` ships as v0.1.0 with runtime foundations for schema, lifecycle enforcement, packet/notice compliance, motion/vote/action capture, minutes citations, public archive endpoints, prompt evals, connector imports, browser QA gates, and post-release main now has live `/staff` workflow screens for intake, packet assembly/export, notice checklist, meeting outcomes, minutes draft, public archive, and connector import. Full database persistence/authentication hardening remains planned.
- `civiccode` ships as v0.1.1 with runtime foundations for source registry, section/version lifecycle, search/permalinks, citations, citation-grounded Q&A, staff notes, plain-language summaries, CivicClerk handoff intake, public lookup pages, local imports, records-ready exports, and `civiccore==0.3.0` alignment. Legal advice, live LLM calls, live codifier sync, CivicAccess runtime integration, and automatic ordinance codification are not shipped.
- `civiczone` ships as v0.1.1 with runtime foundations for canonical zoning schema, Alembic migrations, sample parcel/zone lookup, sample use and dimensional rule APIs, citation-grounded sample resident Q&A, planner escalation/staff context samples, accessible public sample UI, and `civiccore==0.3.0` alignment. Live GIS ingestion, live LLM calls, authentication/RBAC, planner review queues, official zoning determinations, and legal advice are not shipped.
- `civicaccess` ships as v0.1.1 with runtime foundations for accessibility review, plain-language rewrite, multilingual sample variants, records-ready export checklist, accessible public sample UI, and `civiccore==0.3.0` alignment. Certified ADA compliance, legal advice, live LLM calls, production translation workflows, document ingestion, and suite-wide integration APIs are not shipped.
- `civicplan` ships as v0.1.1 with runtime foundations for cited plan-policy lookup, policy-consistency support, staff-analysis outline helper, records-ready export checklist, accessible public sample UI, and `civiccore==0.3.0` alignment. Official planning determinations, legal advice, live GIS, live LLM calls, plan document ingestion, permitting-system integrations, and production staff-review queues are not shipped.
- `civicpermit` ships as v0.1.0 with runtime foundations for permit requirement lookup, intake-readiness review, submittal outline helper, records-ready export checklist, and accessible public sample UI. Permit approvals, legal advice, live GIS, live LLM calls, plan ingestion, production permitting-system integrations, and system-of-record behavior are not shipped.
- `civicinspect` ships as v0.1.0 with runtime foundations for repeat-case lookup, inspector-owned report draft helper, notice draft helper, records-ready export checklist, and accessible public sample UI. Official findings, citations, fines, notices, inspection scheduling, legal advice, live photo analysis, live LLM calls, and system-of-record integrations are not shipped.
- `civicgrants` ships as v0.1.0 with runtime foundations for opportunity triage, eligibility-factor matching, application outline helper, compliance calendar helper, audit-ready export checklist, and accessible public sample UI. Live funder feeds, official eligibility decisions, legal advice, live LLM calls, submission portals, and grant system-of-record integrations are not shipped.
- `civicprocure` ships as v0.1.0 with runtime foundations for RFP drafting, proposal comparison, exception extraction, scoring summary helper, award-packet checklist, and accessible public sample UI. Live vendor portals, official vendor evaluation decisions, legal advice, live LLM calls, e-procurement submission portals, and procurement system-of-record integrations are not shipped.
- `civiccontracts` ships as v0.1.0 with runtime foundations for contract registry, clause topic lookup, expiration tracking, renewal visibility helper, public-records export checklist, and accessible public sample UI. Live contract management platforms, official legal interpretation, legal advice, renewal approvals, contract execution workflows, live LLM calls, and contract system-of-record integrations are not shipped.
- `civicboards` ships as v0.1.0 with runtime foundations for board registry, term tracking, vacancy tracking, attendance review, notice/records export checklist, and accessible public sample UI. Live agenda systems, appointment decisions, legal advice, official notice publication, meeting system write-back, live LLM calls, and board system-of-record integrations are not shipped.
- `civicnotice` ships as v0.1.0 with runtime foundations for notice registry, statutory deadline plans, publication-readiness checklists, channel planning, notice/records export checklist, and accessible public sample UI. Legal sufficiency decisions, legal advice, live LLM calls, official notice publication, publication-system write-back, and notice system-of-record integrations are not shipped.
- `civic311` ships as v0.1.0 with runtime foundations for resident service request intake, deterministic triage suggestions, duplicate-candidate review, department routing checklists, Open311-compatible export helper, and accessible public sample UI. Official dispatch, work-order creation, emergency response, legal advice, live LLM calls, 311 system write-back, and 311 system-of-record integrations are not shipped.
- `civiccomms` ships as v0.1.0 with runtime foundations for source-readiness review, meeting summary drafts, ordinance explainers, newsletter scaffolds, FAQ prompts, audience-variant drafts, and accessible public sample UI. Autonomous publication, campaign or advocacy content, legal advice, certified translation, live LLM calls, social media posting, and communications system-of-record integrations are not shipped.
- `civicdata` ships as v0.1.0 with runtime foundations for dataset normalization, data-dictionary drafts, CKAN package metadata drafts, PII/exemption preflight, archive-bundle checklists, publication planning, and accessible public sample UI. Live CKAN publication, BI dashboards, data warehouse storage, autonomous redaction, and external connector runtime are not shipped.
- `civichr` ships as v0.1.0 with runtime foundations for HR policy lookup outlines, handbook summaries, job-description drafts, classification references, onboarding/training checklists, intake templates, source review, sensitive-topic preflight, and accessible public sample UI. HRIS, payroll, benefits administration, personnel records management, employment-law advice, personnel-file ingestion, live LLM calls, and external HR/payroll connector runtime are not shipped.
- `civicbudget` ships as v0.1.0 with runtime foundations for line-item variance analysis, budget narrative drafts, department memo drafts, hearing packet checklists, resident summaries, optional GFOA checklist support, and accessible public sample UI. ERP, budgeting system, accounting, payroll, fund accounting, budget adoption, official approvals, live LLM calls, and live finance-system connector runtime are not shipped.
- `civiclegal` ships as v0.1.0 with runtime foundations for privilege-aware corpus filtering, citation-first city-record search, prior-action lookup, attorney-reviewed memo scaffolds, ordinance comparison checklists, litigation-hold candidate flags, authority citation tracking, and accessible public sample UI. Legal advice, Westlaw/Lexis replacement, autonomous legal conclusions, court filing, e-discovery management, live LLM calls, live privileged corpus ingestion, and external legal-system connector runtime are not shipped.
- `civicelections` ships as v0.1.0 with runtime foundations for cited voter guidance, candidate filing checklists, worker training Q&A, ballot-summary drafts, campaign-finance summaries, canvass checklists, accessibility review, and accessible public sample UI. Voter registration, ballot marking, tabulation, election conduct automation, campaign finance system of record, official certification, live LLM calls, and election-system connector runtime are not shipped.
- All 26 catalog modules have runtime-foundation releases; CivicCode, CivicZone, CivicAccess, and CivicPlan have advanced to v0.1.1 for CivicCore v0.3.0 alignment, while the remaining module releases stay pinned as recorded in the compatibility matrix. Remaining work is post-foundation depth, connectors, deployment hardening, and cross-module UX.

## 19. Post-Foundation Build Sequence

The v0.1.0 foundation lane is complete across all 26 catalog modules. The next sequence is hardening the suite into deployable, integrated municipal workflows:

1. Stabilize the shared deployment profile across CivicCore, CivicRecords AI, and the module runtime foundations.
2. Define the first cross-module resident/staff shell boundaries without turning the suite into a monorepo.
3. Prioritize connector templates by risk: read-only import first, export bundles second, write-back only after audited read/import paths are stable.
4. Choose the first production-depth workflow lane from real municipal operator value, not from catalog order alone.
5. Update the compatibility matrix every time any module or CivicCore releases.

Parallel CivicCore work should extract only the shared capabilities needed by the active module and should not invent unused abstractions.

## 20. Open Questions Requiring ADRs

These are not blockers to this spec, but they require explicit ADRs before implementation choices harden:

- Exact CivicClerk MVP table list if reduced from the canonical table set.
- Whether CivicClerk v0.1 includes public comments.
- Whether transcription is v0.1 or v0.2.
- Post-foundation module depth and integration sequencing after all 26 v0.1.0 foundations shipped.
- Shared resident portal shell boundaries.
- CivicCore auth/RBAC extraction order.
- CivicCore document/search extraction order.
- Prompt-library repository strategy.
- Data-release strategy for state statutory rules.

## 21. Precedence Rules

When documents conflict:

1. Current repository source code and release artifacts define what ships.
2. This unified specification defines the intended suite architecture and product roadmap.
3. Module-specific specs define detailed module behavior unless superseded here.
4. Older DOCX drafts are historical inputs.
5. Marketing/landing pages must follow shipped truth and may not promote planned behavior as shipped.

## 22. Working Rule

No future CivicSuite implementation sprint should begin from memory or from an isolated module scaffold. It should begin by reading this document, the relevant module-specific spec, current repo state, and the current compatibility matrix.

