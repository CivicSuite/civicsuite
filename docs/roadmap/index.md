# Roadmap

The full four-phase rollout is documented in
[`../../specs/01_catalog.md`](../../specs/01_catalog.md) section 14. A
condensed table view follows.

## Current next step

**Next module lane: CivicCode planning.** CivicRecords AI is shipping at
v1.4.0, civiccore is shipping at v0.2.0, and CivicClerk is shipping at
v0.1.0 with a browser-visible `/staff` workflow foundation. The next
suite-planning lane is CivicCode: the municipal code and ordinance-access
module that CivicZone, CivicLegal, CivicAccess, CivicComms, and CivicClerk
handoffs depend on.

This is planning only. No `CivicSuite/civiccode` runtime repo exists yet.
The next implementation action is a CivicCode Milestone 0 / scaffold
prep run after the planning document is reviewed.

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
| 4 | CivicCode     | Next planning lane; no runtime repo yet      |
| 5 | CivicAccess   | Planned                                      |

## Phase 2 — Land Use & Development

| # | Module               |
|---|----------------------|
| 6 | CivicZone            |
| 7 | CivicPlan            |
| 8 | CivicPermit Assist   |
| 9 | CivicInspect         |

## Phase 3 — Administrative & Resident Services

| #  | Module                |
|----|-----------------------|
| 10 | CivicGrants           |
| 11 | CivicProcure Assist   |
| 12 | CivicContracts        |
| 13 | CivicBoards           |
| 14 | CivicNotice           |
| 15 | Civic311              |
| 16 | CivicComms            |
| 17 | CivicData Bridge      |

## Phase 4 — Internal Business & Specialized

| #  | Module                |
|----|-----------------------|
| 18 | CivicHR Assist        |
| 19 | CivicBudget Assist    |
| 20 | CivicLegal Research   |
| 21 | CivicElections Assist |
| 22 | CivicUtility Assist   |
| 23 | CivicCourt Assist     |
| 24 | CivicSafety Assist    |
| 25 | CivicLibrary          |
| 26 | CivicParks            |
