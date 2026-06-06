# CivicSuite Module Status

**Last verified:** 2026-06-05
**Companion to:** [docs/release-recovery-status.md](docs/release-recovery-status.md), [docs/compatibility/index.md](docs/compatibility/index.md), and [docs/CivicSuiteUnifiedSpec.md](docs/CivicSuiteUnifiedSpec.md)

This is the plain-English operating truth for CivicSuite. The unified spec describes architectural intent. This file describes release reality.

## Active City-Core Beta Target

The active city-core promotion package is CivicCore, CivicRecords AI, CivicClerk, CivicCode, and the suite installer. The current released module cars are CivicCore `v1.2.0`, CivicRecords AI `v1.7.3`, CivicClerk `v1.0.3`, and CivicCode `v1.0.8`; PR #183 records predecessor beta-ready truth-reconciled evidence for the four-module non-technical Windows/Linux installer path. Stage 3A now also has a repo-local `proven-suite` integration profile for city-core plus CivicZone, CivicPlan, CivicPermit, CivicAccess, CivicInspect, CivicGrants, and CivicProcure. That profile passed local install/verify and launcher wiring smoke on 2026-06-05, but it is still clean-machine-gate pending. The package remains bounded to unsigned vendored-source installer artifacts; macOS remains beta-level readiness only until a matching-host macOS lifecycle is proven.

The operator path uses live regenerated artifacts. Verify the generated `SHA256SUMS` or release manifest from the active run evidence, confirm the `installer/modules.json` `source_commit` pins for the four city-core repos, and use published module hashes/attestations where applicable. Do not treat old committed `installer/dist` files as canonical unless Scott explicitly confirms artifact restoration. The suite launcher is the local browser front door for city-core; its shared browser session is local runtime state, not a completed municipal SSO or managed cloud-session claim.

Stage 3A Windows bare-metal artifact-refresh gate is green as of tester result
022. Tester result 017 first proved the repo-local bootstrapper could complete
live Ollama response-letter evidence with corrected host facts. Tester result
018 then exposed the real blocker chain: the customer artifact did not yet route
through the bare-metal path, Stage3 failures could leave stale final-result
JSON, and Docker Desktop could return transient EOF/500 build failures. The
current branch fixes route the regenerated Windows 0.1.2 customer artifact to
the Stage 3A progress wrapper, write terminal failed result JSON for Stage3
handoff failures, add bounded Docker Desktop transport retry evidence, and carry
phase-aware failure guidance in the generated artifact. Tester result 022
re-ran the refreshed customer artifact with real `Get-HostFacts`, verified the
expected Windows zip and one-click SHA256 hashes, and passed Stage0 through
Stage4 with `generation_source=ollama`, `generation_model=gemma4:e4b`, and the
launcher serving at `http://127.0.0.1:18082/`. Tester result 021 remains the
prior regenerated-artifact green proof before the `a53bad3` artifact refresh.
This is not a merge, tag, status promotion, public-use, procurement, production,
macOS lifecycle, airgap, or full-suite release claim.

CivicAccess remains OUT of the four-module city-core promotion package after the 2026-05-23 depth probe. It is included only in the separate source-pinned `proven-suite` local integration profile pending clean-machine suite proof.

The false post-starter labels for CivicZone, CivicPlan, CivicPermit, CivicInspect, CivicGrants, and CivicProcure have been displaced by narrower truth-repair states. The seven source-pinned readiness modules now prove local service start, health/readiness surfaces, and launcher routing with CivicCore v1.2.0, but do not yet promote Tier 2 to public-use or city-ready status. The reconciled unified spec, installer metadata, and live GitHub org state enumerate 27 product modules plus CivicCore.

## Status Legend

- **Recovery patch required:** real code exists, but the current public label needs a corrective patch before promotion.
- **Developer preview:** meaningful product-shaped runtime exists, but municipal procurement readiness has not been proven.
- **Demoted recovery label:** a previous v1.0.0 label was false and is being superseded by a lower honest version.
- **Foundation surface:** package/schema/sample API/sample UI depth only; not product-ready.
- **Planned:** spec exists, no runtime repo yet.

## Corrective Release Decision

As of 2026-05-14, the release-integrity decision is:

| Repo | Correct label | Status |
|---|---:|---|
| civiccore | v1.2.0 shipped | Real shared platform; v1.2.0 shipped the shared document-ingestion pipeline and retains the earlier platform hardening. |
| civicclerk | v1.0.3 shipped | Real meeting workflow release car pinned to CivicCore v1.2.0; protected staff auth defaults remain required. |
| civicrecords-ai | v1.7.3 shipped | Developer preview records release car pinned to CivicCore v1.2.0 and consuming shared CivicCore ingestion; v1.7.3 adds release-asset convention bring-up without functional installer behavior changes. |
| civiccode | v1.0.8 shipped | City-core release car pinned to CivicCore v1.2.0; v1.0.8 supersedes the earlier v1.0.0 posture and carries release attestation. |
| civicaccess | v0.2.0 source-pinned readiness | Included only in `proven-suite` local integration; clean-machine gate and public-use readiness pending. |
| civiczone | v0.2.2 source-pinned readiness | Local proven-suite install/verify and launcher route green; clean-machine gate and public-use readiness pending. |
| civicplan | v0.2.2 source-pinned readiness | Local proven-suite install/verify and launcher route green; clean-machine gate and public-use readiness pending. |
| civicpermit | v0.2.2 source-pinned readiness | Local proven-suite install/verify and launcher route green; clean-machine gate and public-use readiness pending. |
| civicinspect | v0.2.2 source-pinned readiness | Local proven-suite install/verify and launcher route green; clean-machine gate and public-use readiness pending. |
| civicgrants | v0.2.0 source-pinned readiness | Local proven-suite install/verify and launcher route green; clean-machine gate and public-use readiness pending. |
| civicprocure | v0.2.0 source-pinned readiness | Local proven-suite install/verify and launcher route green; clean-machine gate and public-use readiness pending. |

All other modules remain foundation surfaces unless their own repo evidence says otherwise and the compatibility matrix agrees.

## What Works Today

- `civiccore` v1.2.0 is the current shared platform release and includes the shared document-ingestion pipeline used by the city-core release cars.
- `civicrecords-ai` v1.7.3 remains developer preview, consumes CivicCore v1.2.0 shared ingestion, and keeps the city-core installer on the vendored-source path.
- `civicclerk` v1.0.3 is the current meeting workflow release car for city-core.
- `civiccode` v1.0.8 is the current municipal-code release car for city-core.
- The suite-level `city-core` installer evidence for PR #183 records predecessor Windows and Linux one-click wrapper smoke, Guided/Manual Docker prerequisite setup paths, Linux Docker signed-repository bootstrap behavior where supported, first-run wizard smoke, 60 GB cleanroom hygiene, local matching-host install/repair/verify/backup/restore/uninstall lifecycle evidence, first-run browser QA evidence, green PR CI, and audit-full evidence under `C:\dev\Claude\CivicSuite-city-core-caboose-item1\.agent-runs\2026-05-26-city-core-non-technical-installable\`. The active Stage 3A Windows bare-metal artifact-refresh gate passed in tester result 022 using the refreshed customer artifact, matching hashes, and real host facts. This is beta-ready truth-reconciled predecessor evidence plus a green Stage 3A Windows gate, not public-use readiness, city-ready status, procurement readiness, production readiness, macOS lifecycle certification, airgap readiness, or full-suite release.
- The suite-level `clerk-core` installer beta now records package cleanroom evidence classification, isolated lifecycle ports/projects, installed-stack workflow proof, and Linux matching-host lifecycle proof for install, repair, verify, backup, restore, and uninstall. Windows and macOS wrapper claims remain bounded to archive/readiness until matching-host lifecycle evidence exists on those hosts.
- The `proven-suite` local integration profile now starts and verifies city-core plus CivicZone, CivicPlan, CivicPermit, CivicAccess, CivicInspect, CivicGrants, and CivicProcure with source-pinned CivicCore v1.2.0 contracts. This proof includes launcher routing to all ten selected services and expected not-ready blocker responses for modules whose local municipal databases are not configured.

## What Does Not Work Yet

A municipality cannot run itself end-to-end on CivicSuite today. Clerk-core now has suite-level Linux lifecycle, Windows lifecycle, backup/restore, installed workflow, installed browser-QA evidence, release-gate evidence, and final artifact checksums for the starter profile. Missing proof still includes module-by-module feature completion for the rest of the unified spec.
