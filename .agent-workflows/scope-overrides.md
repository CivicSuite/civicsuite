# Scope override ledger

Every manifest that bypassed `check_active_target.py` via `override_active_target` is logged here.

## 2026-05-24T17:53:13Z - run 2026-05-24-city-core-tracks-b-c-closeout

- Manifest's `advances_target`: `CivicSuite city-core caboose Tracks B + C closeout`
- Override reason (verbatim):

  > The in-repo active queue still names the older CivicCode-only release lock, but Scott's 2026-05-24 consolidated directive explicitly supersedes the prior Track B/C directive and authorizes this multi-repo city-core caboose closeout. This override is limited to release-asset hygiene, cleanroom rehearsal gates, scaffold documentation, and installed-stack proof documents; it does not authorize queued-module feature work or city-core promotion.

## 2026-05-26T06:27:08Z — run 2026-05-26-civiccode-finish-release

- Manifest's `advances_target`: `CivicCode v1.0.0`
- Override reason (verbatim):

  > Scott explicitly reset the current sprint in chat on 2026-05-26: disregard the prior four-module and CivicClerk directions, use the pipeline, and finish CivicCode; he also stated this overrides anything else. This run is restricted to CivicCode release completion and truth reconciliation, and does not authorize queued-module implementation or changes to already released CivicCore, CivicRecords AI, or CivicClerk artifacts.

## 2026-05-26T07:04:52Z — run 2026-05-26-city-core-non-technical-installable

- Manifest's `advances_target`: `City-core non-technical installability for Linux and Windows`
- Override reason (verbatim):

  > Scott's 2026-05-26 directive explicitly supersedes the prior active-target queue and authorizes this city-core installability run across the umbrella plus the four city-core module repos. This override is limited to the stated city-core deliverables and halt triggers.

## 2026-05-27T19:07:05Z — run 2026-05-28-city-core-real-non-technical-release

- Manifest's `advances_target`: `City-core real non-technical user release`
- Override reason (verbatim):

  > Scott's 2026-05-28 directive supersedes the stale PROJECT_CONTROL_PLANE active target, which still names CivicInspect suite-truth reconciliation. This run is explicitly authorized in chat and through the bridge workflow as the next city-core engagement after PR #183, PR #100, and PR #184 pre-engagement merges.
