# Roadmap

The full four-phase rollout is documented in
[`../../specs/01_catalog.md`](../../specs/01_catalog.md) section 14. A
condensed table view follows.

## Current next step

**Current module lane: CivicSafety shipped v0.1.0.** CivicRecords AI is shipping
at v1.4.0, civiccore is shipping at v0.2.0, CivicClerk is shipping at v0.1.0
with a browser-visible `/staff` workflow foundation, and CivicCode is shipping
at v0.1.0 with the municipal-code contract that CivicZone, CivicLegal,
CivicAccess, CivicComms, and CivicClerk handoffs depend on. CivicZone is
shipping at v0.1.0 with parcel lookup, zoning rule lookup, cited sample Q&A,
planner escalation, and public UI foundation. CivicAccess is shipping at
v0.1.0 with accessibility review, plain-language rewrite, multilingual sample
variants, records-ready export checklist, and public UI foundation. CivicPlan is
shipping at v0.1.0 with cited plan-policy lookup, policy-consistency support,
staff-analysis outlines, records-ready exports, and public UI foundation.
CivicPermit is shipping at v0.1.0 with permit requirement lookup,
intake-readiness review, submittal outlines, records-ready exports, and public
UI foundation. CivicInspect is shipping at v0.1.0 with repeat-case lookup,
report draft support, notice draft support, records-ready exports, and public
UI foundation. CivicGrants is shipping at v0.1.0 with opportunity triage,
eligibility-factor matching, application outlines, compliance calendars,
audit-ready exports, and public UI foundation. CivicProcure is shipping at
v0.1.0 with RFP drafting, proposal comparison, exception extraction, scoring
summary helper, award-packet checklist, and accessible public UI foundation. CivicContracts is shipping at v0.1.0 with contract registry, clause topic lookup, expiration tracking, renewal visibility, public-records exports, and accessible public UI foundation. CivicBoards is shipping at v0.1.0 with board registry, term tracking, vacancy tracking, attendance review, notice/records exports, and accessible public UI foundation. CivicNotice is shipping at v0.1.0 with notice registry, statutory deadline plans, publication-readiness checks, channel planning, notice records exports, and accessible public UI foundation. Civic311 is shipping at v0.1.0 with request intake, triage suggestions, duplicate-candidate review, department routing, Open311-compatible exports, and accessible public UI foundation. CivicComms is shipping at v0.1.0 with source-readiness review, meeting summaries, ordinance explainers, newsletter scaffolds, FAQ prompts, audience variants, and accessible public UI foundation. CivicData Bridge is shipping at v0.1.0 with dataset normalization, data-dictionary drafts, CKAN package metadata drafts, PII/exemption preflight, archive-bundle checklists, publication planning, and accessible public UI foundation.

CivicHR, CivicBudget, CivicLegal, CivicElections, CivicUtility, CivicCourt, and CivicSafety have shipped their v0.1.0 foundations. The next suite implementation lane can
plan against the CivicCore, CivicRecords AI, CivicClerk, CivicCode,
CivicZone, CivicAccess, CivicPlan, CivicPermit, CivicInspect, CivicGrants,
CivicProcure, CivicContracts, CivicBoards, CivicNotice, Civic311, CivicComms, CivicData, CivicHR, CivicBudget, CivicLegal, CivicElections, CivicUtility, CivicCourt, and CivicSafety release contracts. CivicLibrary is the next planned module lane.

The detailed execution plan is
[`civiccode-next-module-plan.md`](civiccode-next-module-plan.md). The
prior CivicClerk plan remains as historical context in
[`civicclerk-next-module-plan.md`](civicclerk-next-module-plan.md).

## Phase 1 — Establish the sovereign municipal platform (Clerk Core)

| # | Module        | Status                                       |
|---|---------------|----------------------------------------------|
| 1 | CivicCore     | Shipping v0.2.0; shared migrations, db base, and LLM abstraction |
| 2 | CivicRecords AI | Shipping v1.4.0; transferred to CivicSuite org |
| 3 | CivicClerk    | Shipping v0.1.0; `/staff` workflow UI foundation shipped |
| 4 | CivicCode     | Shipping v0.1.0; municipal-code lookup, citations, local imports, and records-ready exports |
| 5 | CivicAccess   | Shipping v0.1.0                             |

## Phase 2 — Land Use & Development

| # | Module               | Status          |
|---|----------------------|-----------------|
| 6 | CivicZone            | Shipping v0.1.0 |
| 7 | CivicPlan            | Shipping v0.1.0 |
| 8 | CivicPermit Assist   | Shipping v0.1.0 |
| 9 | CivicInspect         | Shipping v0.1.0 |

## Phase 3 — Administrative & Resident Services

| #  | Module                | Status       |
|----|-----------------------|--------------|
| 10 | CivicGrants           | Shipping v0.1.0 |
| 11 | CivicProcure Assist   | Shipping v0.1.0 |
| 12 | CivicContracts        | Shipping v0.1.0 |
| 13 | CivicBoards           | Shipping v0.1.0 |
| 14 | CivicNotice           | Shipping v0.1.0 |
| 15 | Civic311              | Shipping v0.1.0 |
| 16 | CivicComms            | Shipping v0.1.0 |
| 17 | CivicData Bridge      | Shipping v0.1.0 |

## Phase 4 — Internal Business & Specialized

| #  | Module                |
|----|-----------------------|
| 18 | CivicHR Assist        | Shipping v0.1.0 |
| 19 | CivicBudget Assist    | Planned next |
| 20 | CivicLegal Research   |
| 21 | CivicElections Assist |
| 22 | CivicUtility Assist   |
| 23 | CivicCourt Assist     | Shipping v0.1.0 |
| 24 | CivicSafety Assist    | Shipping v0.1.0 |
| 25 | CivicLibrary          | Planned next |
| 26 | CivicParks            |
