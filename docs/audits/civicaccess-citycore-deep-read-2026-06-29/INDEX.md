# CivicSuite Module 6 (CivicAccess) deep-read — INDEX

**Generated**: 2026-06-29 (workflow run `wf_f2142395-937`)
**Scope**: every repo in github.com/CivicSuite (27 repos), every test, every CHANGELOG, the desktop integration in the umbrella repo, all four phases of the CivicAccess city-core integration plan.
**Method**: 35 subagents (27 per-repo deep readers + 4 cross-repo synthesis + 3 adversarial refutation + 1 final report integrator). Total: 2.9M subagent tokens, 1301 tool calls, 30 minutes wall-clock.

## Read first

- [FINAL-REPORT.md](FINAL-REPORT.md) — bottom-line, options, recommendation, citations

## Cross-repo syntheses (start here for architecture)

- [arch-truth](syntheses/arch-truth.md) — how the shipping desktop ACTUALLY consumes city-core modules (Rust workflows.rs vs Python services)
- [civicaccess-truth](syntheses/civicaccess-truth.md) — what CivicAccess is + what Phase B/C did + what's still missing
- [civicnotice-precedent](syntheses/civicnotice-precedent.md) — the reference precedent (PR #193) CivicAccess should mirror
- [civiccore-contracts](syntheses/civiccore-contracts.md) — the platform CivicAccess rides on

## Adversarial refutations (each defaulted to refute=true)

- [civicaccess functionally inert](refutations/refute-civicaccess-functionally-inert.md) — FAILED to refute (claim stands)
- [Rust port is only path](refutations/refute-rust-port-is-only-path.md) — REFUTED (alternatives exist)
- [revert PR #214 is safest](refutations/refute-revert-phase-c-is-safest.md) — REFUTED (forward-fix wins)

## Per-repo profiles (27)

- [civic311](per-repo-profiles/civic311.md) — Civic311 is the CivicSuite module for resident service request intake, deterministic triage, duplicate-candidate review,
- [civicaccess](per-repo-profiles/civicaccess.md) — CivicAccess is the CivicSuite module for accessibility, plain-language, multilingual, and ADA Title II review-support wo
- [civicboards](per-repo-profiles/civicboards.md) — CivicBoards is the CivicSuite module for board and commission roster support, term tracking, vacancy tracking, attendanc
- [civicbudget](per-repo-profiles/civicbudget.md) — CivicBudget is the CivicSuite budget narrative and transparency support module for preparing line-item variance notes, d
- [civicclerk](per-repo-profiles/civicclerk.md) — CivicClerk is the CivicSuite module for municipal meetings, agendas, packets, minutes, votes, notices, and public meetin
- [civiccode](per-repo-profiles/civiccode.md) — Municipal code and ordinance access for the CivicSuite product family.
- [civiccomms](per-repo-profiles/civiccomms.md) — CivicComms is the CivicSuite module for source-backed public explainers, meeting summaries, ordinance summaries, newslet
- [civiccontracts](per-repo-profiles/civiccontracts.md) — CivicContracts is the CivicSuite module for central contract registry support, clause topic lookup, expiration tracking,
- [civiccore](per-repo-profiles/civiccore.md) — CivicSuite shared platform package providing migrations, SQLAlchemy ORM base, LLM provider abstraction, audit/provenance
- [civiccourt](per-repo-profiles/civiccourt.md) — CivicCourt is the CivicSuite municipal court clerk support module providing cited procedure Q&A, form drafts, restricted
- [civicdata](per-repo-profiles/civicdata.md) — CivicData Bridge: open-data preparation foundation with field normalization, CKAN package drafts, publication planning, 
- [civicelections](per-repo-profiles/civicelections.md) — Election administration support foundation for cited voter guidance, candidate filing checklists, worker training Q&A, b
- [civicgrants](per-repo-profiles/civicgrants.md) — Grant opportunity triage, eligibility-factor matching, application outline support, compliance-calendar scaffolding, sta
- [civichr](per-repo-profiles/civichr.md) — CivicHR is the CivicSuite internal HR policy support module providing personnel-policy lookup, handbook summaries, job-d
- [civicinspect](per-repo-profiles/civicinspect.md) — CivicInspect is the CivicSuite module for inspection support: repeat-case lookup, inspector-owned report drafting, notic
- [civiclegal](per-repo-profiles/civiclegal.md) — CivicSuite internal legal-record research support module providing deterministic privilege-aware corpus filtering, citat
- [civiclibrary](per-repo-profiles/civiclibrary.md) — Municipal library support foundation for CivicSuite: cited library policy Q&A, program and event Q&A, optional database-
- [civicnotice](per-repo-profiles/civicnotice.md) — FastAPI service for public hearing notices, legal notices, bid notices, vacancy notices, statutory publication deadlines
- [civicparks](per-repo-profiles/civicparks.md) — Parks and recreation support foundation for CivicSuite: cited parks policy Q&A, program and facility Q&A, registration a
- [civicpermit](per-repo-profiles/civicpermit.md) — CivicPermit is the CivicSuite module for permit pre-application and development-review intake support.
- [civicplan](per-repo-profiles/civicplan.md) — Comprehensive-plan policy lookup and cited planning analysis support for CivicSuite.
- [civicprocure](per-repo-profiles/civicprocure.md) — CivicProcure is the CivicSuite module for procurement RFP drafting, proposal comparison, exception extraction, scoring s
- [civicrecords-ai](per-repo-profiles/civicrecords-ai.md) — Open-source, locally-hosted AI that helps American cities respond to open records requests, with AI-powered search, exem
- [civicsafety](per-repo-profiles/civicsafety.md) — Non-CJIS public-safety administrative support foundation with policy Q&A, training checklists, PIO drafts, public statis
- [civicsuite](per-repo-profiles/civicsuite.md) — Umbrella governance, roadmap, ADRs, compatibility matrix, and installer scaffolding for CivicSuite municipal product fam
- [civicutility](per-repo-profiles/civicutility.md) — Utility customer-service copilot foundation for cited policy Q&A, CSR-safe account context, payment-arrangement drafts, 
- [civiczone](per-repo-profiles/civiczone.md) — CivicZone is CivicSuite's parcel-aware zoning and land-use Q&A module providing deterministic cited answers with residen

## Raw artifacts

- `raw/workflow-output.json` — the full structured JSON the workflow returned (467 KB)
- `raw/journal.jsonl` — workflow event log (372 KB)
- Per-subagent transcripts (11 MB total, 35 `agent-*.jsonl` files) — kept in the originating Cowork session at `~/.claude/projects/C--Users-Scott-Desktop-CODE/<session>/subagents/workflows/wf_f2142395-937/`; not committed to the repo to keep this audit dir under 2 MB.
