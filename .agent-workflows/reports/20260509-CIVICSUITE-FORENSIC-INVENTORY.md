# CivicSuite Forensic Inventory

Date: 2026-05-09

Status: repaired durable evidence for the CivicSuite recovery workflow.

Purpose: this file records the read-only inventory required before CivicSuite module release work can resume. It is an authority map, not a release audit and not a product-readiness certification.

## Control Plane Result

- Forensic inventory gate: PRESENT.
- Product/module implementation authorization from this file alone: NO.
- Old release labels and old checkboxes: historical evidence only.
- Active target at the time this inventory was repaired: CivicSuite installer.
- Active target status: YELLOW.
- Why YELLOW: Windows and Linux installer package lifecycle evidence exists; macOS full install/repair/verify/uninstall still requires a real macOS host or VM.

## Read-Only Sources Inventoried

- Current handoff:
  - `C:\dev\Claude\CivicSuite\.agent-workflows\HANDOFF_WORKFLOW_PAUSED_2026-05-09_AFTER_PR109.md`
- Current queue:
  - `C:\dev\Claude\ACTIVE_RELEASE_QUEUE.md`
- CivicSuite umbrella repo:
  - `C:\dev\Claude\CivicSuite`
- Unified spec:
  - `C:\dev\Claude\CivicSuite\docs\CivicSuiteUnifiedSpec.md`
- Prior org-state handoff:
  - `C:\dev\Claude\HANDOFF_CIVICSUITE_ORG_STATE_2026-05-08.md`
- Old audit and handoff files under:
  - `C:\dev\Claude`
  - `C:\dev\Claude\CivicSuite\docs`
  - `C:\dev\Claude\CivicSuite\installer\reports`
- Available GitHub org state through `gh repo list CivicSuite --limit 100`.

## Current CivicSuite Umbrella Repo State

- Repo: `C:\dev\Claude\CivicSuite`
- Remote: `https://github.com/CivicSuite/civicsuite.git`
- Branch/status observed:
  - `main...origin/main`
  - untracked: `.agent-workflows/HANDOFF_WORKFLOW_PAUSED_2026-05-09_AFTER_PR109.md`
- Current head:
  - `48cdb08 fix(installer): validate platform release packages (#109)`
- Release tag observed locally:
  - `installer-clerk-core-v0.1.0-beta`
- Public release observed:
  - `CivicSuite Clerk Core Installer 0.1.0 unsigned beta`
  - tag: `installer-clerk-core-v0.1.0-beta`

## CivicSuite Umbrella File Inventory

`rg --files C:\dev\Claude\CivicSuite` found 331 files.

Important categories present:

- project docs: `README.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `LICENSE`, `SECURITY.md`, `SUPPORT.md`, `USER-MANUAL.md`, `docs/index.html`
- governing spec: `docs/CivicSuiteUnifiedSpec.md`
- module specs: `specs/01_catalog.md` through `specs/06_civicapi.md`
- architecture docs: `docs/architecture/ADR-0001...ADR-0007`
- recovery/status docs: `docs/release-recovery-status.md`, `docs/audits/civicsuite-umbrella-audit-full-2026-05-07.md`
- browser/UX evidence: many `docs/browser-qa-*` summaries and screenshots
- installer docs and plans: `installer/README.md`, `docs/installer/suite-installer-plan.md`, `docs/installer/installer-checkpoint-2026-05-09.md`
- installer scripts:
  - `scripts/plan-installer.py`
  - `scripts/run-installer-package-cleanroom.py`
  - `scripts/run-clerk-core-installer.py`
  - `scripts/verify-installer-plan.py`
  - `scripts/verify-suite-state.py`
  - `scripts/verify-secret-scan.py`
  - `scripts/verify-deployment-profile.py`
  - `scripts/verify-docs.sh`
- installer launchers:
  - `installer/windows/plan-installer.ps1`
  - `installer/macos/plan-installer.sh`
  - `installer/linux/plan-installer.sh`
- generated installer packages and native planning artifacts:
  - `installer/generated/packages/clerk-core/...`
  - `installer/generated/native/clerk-core/...`
- release artifacts:
  - `installer/dist/CivicSuite-clerk-core-windows-0.1.0.zip`
  - `installer/dist/CivicSuite-clerk-core-macos-0.1.0.tar.gz`
  - `installer/dist/CivicSuite-clerk-core-linux-0.1.0.tar.gz`
  - `installer/dist/CivicSuite-clerk-core-0.1.0-SHA256SUMS.txt`
  - `installer/dist/CivicSuite-clerk-core-0.1.0-release-manifest.json`

## Unified Spec Inventory

Observed spec path:

- `C:\dev\Claude\CivicSuite\docs\CivicSuiteUnifiedSpec.md`

Top-level spec sections observed:

- Purpose
- Governing Corrections
- Strategic Thesis
- Suite-Wide Non-Negotiables
- Standard Module Architecture
- CivicCore Roadmap
- Canonical Module Catalog
- CivicRecords Canonical Scope
- CivicClerk Canonical Scope
- CivicZone Canonical Scope
- CivicCode Canonical Scope
- CivicAccess Canonical Scope
- Resident Portal Strategy
- Universal Discovery And Municipal Systems Catalog
- Governance And Compliance
- Release And Versioning Rules
- Documentation Standard
- Current Shipped State
- Post-Foundation Build Sequence
- Open Questions Requiring ADRs
- CivicRegWatch Canonical Scope
- CivicAPI Canonical Scope
- Precedence Rules
- Working Rule

Observed canonical catalog includes:

- Tier 0: CivicCore
- Tier 1: CivicRecords, CivicClerk, CivicCode, CivicAccess
- Tier 2: CivicZone, CivicPlan, CivicPermit, CivicInspect
- Tier 3: CivicGrants, CivicProcure, CivicContracts, CivicBoards, CivicNotice
- Tier 4: Civic311, CivicComms, CivicData, CivicRegWatch, CivicAPI
- Tier 5: CivicHR, CivicBudget, CivicLegal, CivicElections
- Tier 6: CivicUtility, CivicCourt, CivicSafety, CivicLibrary, CivicParks

## Available GitHub Org Inventory

`gh repo list CivicSuite --limit 100 --json name,url,isPrivate,defaultBranchRef,updatedAt,pushedAt` observed 27 public repos:

| Repo | Default branch | Last pushed observed |
|---|---:|---:|
| civicsuite | main | 2026-05-09 |
| civicpermit | main | 2026-05-09 |
| civicplan | main | 2026-05-09 |
| civiczone | main | 2026-05-09 |
| civiccode | main | 2026-05-09 |
| civicbudget | main | 2026-05-08 |
| civiclegal | main | 2026-05-08 |
| civiccourt | main | 2026-05-08 |
| civicinspect | main | 2026-05-08 |
| civiccore | main | 2026-05-08 |
| civicrecords-ai | master | 2026-05-07 |
| civicclerk | main | 2026-05-07 |
| civicdata | main | 2026-04-29 |
| civicnotice | main | 2026-04-29 |
| civicutility | main | 2026-04-29 |
| civicsafety | main | 2026-04-29 |
| civicprocure | main | 2026-04-29 |
| civicparks | main | 2026-04-29 |
| civiclibrary | main | 2026-04-29 |
| civichr | main | 2026-04-29 |
| civicelections | main | 2026-04-29 |
| civiccontracts | main | 2026-04-29 |
| civiccomms | main | 2026-04-29 |
| civic311 | main | 2026-04-29 |
| civicboards | main | 2026-04-29 |
| civicgrants | main | 2026-04-29 |
| civicaccess | main | 2026-04-28 |

## Local CivicSuite-Family Repo Inventory

Local directories matching `Civic*` / `civic*` were observed under `C:\dev\Claude`.

Clean and synced local repos observed:

- `civic311` at `b65d21c feat(production-depth): persist service requests (#3)`
- `civicaccess` at `042ae66 feat(production-depth): persist accessibility review records (#5)`
- `civicboards` at `845e777 feat(production-depth): persist board roster records (#3)`
- `civicbudget` at `731a6b4 Mark CivicBudget status provisional during recovery (#5)`
- `civicclerk` at `9971eb6 Merge pull request #154 from CivicSuite/recovery/civicclerk-release-truth-playwright`
- `civiccomms` at `73be36f feat(production-depth): persist communications drafts (#3)`
- `civiccontracts` at `23bcee9 feat(production-depth): persist contract registry records (#4)`
- `civiccore` at `67fc3d0 Merge pull request #53 from CivicSuite/quality/civiccore-audit-fixes`
- `civiccourt` at `666525c Mark CivicCourt status provisional during recovery (#5)`
- `civicdata` at `5d8378d Merge pull request #5 from CivicSuite/feat/workpaper-auth-rbac`
- `civicelections` at `c532f6c feat(production-depth): persist election workpapers (#3)`
- `civicgrants` at `cd20431 feat(production-depth): persist grant records (#4)`
- `civichr` at `7cd481b feat(production-depth): persist HR workpapers (#3)`
- `civicinspect` at `c1691a0 Mark CivicInspect status provisional during recovery (#5)`
- `civiclegal` at `ac51151 Mark CivicLegal status provisional during recovery (#6)`
- `civiclibrary` at `d769918 feat(production-depth): persist library workpapers (#3)`
- `civic-newsroom` at `a50296c chore: add .gitattributes for LF normalization`
- `civicnotice` at `f2d2966 Merge pull request #4 from CivicSuite/feat/civiccore-notice-foundation`
- `civicparks` at `7b9b514 feat(production-depth): persist parks workpapers (#3)`
- `civicpermit` at `64c27ac Merge pull request #8 from CivicSuite/recovery/civicpermit-release-recovery-complete`
- `civicplan` at `572f79e Merge pull request #7 from CivicSuite/recovery/civicplan-release-recovery-complete`
- `civicprocure` at `772210d feat(production-depth): persist procurement workpapers (#4)`
- `civicsafety` at `38038f9 feat(production-depth): persist safety workpapers (#3)`
- `civic-transparency-toolkit` at `8e8a9c5 chore: add .gitattributes for LF normalization`
- `civicutility` at `4342098 feat(production-depth): persist utility workpapers (#3)`
- `civiczone` at `2f7c5e3 Merge pull request #15 from CivicSuite/recovery/civiczone-release-recovery-complete`

Local repos with untracked or modified files observed:

- `CivicSuite`
  - `main...origin/main`
  - untracked pause handoff: `.agent-workflows/HANDOFF_WORKFLOW_PAUSED_2026-05-09_AFTER_PR109.md`
- `civiccode`
  - `main...origin/main`
  - untracked `.tmp-*` audit/browser/runtime scratch files
  - head: `0a1ab09 Merge pull request #52 from CivicSuite/recovery/civiccode-release-status-complete`
- `civicrecords-ai`
  - `master...origin/master`
  - untracked `.tmp-browser-qa-*` scratch dirs
  - head: `fb8950f Merge pull request #68 from CivicSuite/recovery/records-release-truth-gates`
- `civicrecords-ai-install-rehearsal`
  - branch: `fix/sovereignty-live-precondition...origin/fix/sovereignty-live-precondition`
  - modified files: `backend/app/config.py`, `backend/tests/test_config_validation.py`, `install.ps1`, `scripts/detect_hardware.ps1`
- `civic-scanner`
  - `main...origin/main`
  - modified: `README.md`, `build-report.js`, `civic-scanner.md`, `report-schema.json`
  - untracked: `.agent-workflows/`, `.agents/`, `.claude/`, `AGENTS.md`, `tests/`
- `CivicCast`
  - branch: `rung/0.3-schedule-module...origin/rung/0.3-schedule-module`
  - not part of the 27 observed CivicSuite org repos in this inventory.

These local dirty states are not permission to clean, revert, or continue work. They are inventory evidence only.

## Prior Handoff And Audit Evidence Inventory

Important existing evidence files observed in `C:\dev\Claude`:

- `HANDOFF_CIVICSUITE_ORG_STATE_2026-05-08.md`
- `HANDOFF_2026-05-07_CIVICSUITE_RELEASE_WORKFLOW_FAILURE_AND_SHUTDOWN.md`
- `MEMORY_CIVICSUITE_RELEASE_WORKFLOW_FAILURE_2026-05-07.md`
- `HANDOFF_2026-05-05_CIVICCORE_V0221_BASELINE_RELEASE_STAGING.md`
- `HANDOFF_2026-05-02_CIVICCLERK_V019_PAUSED_BEFORE_MERGE.md`
- `HANDOFF_2026-05-02_CIVICCLERK_RETURN_TO_PRIORITY.md`
- `HANDOFF_2026-05-01_CIVICCLERK_COMPLETION_AND_CORE_EXTRACTION_PLAN.md`
- `HANDOFF_2026-04-30_CIVICCLERK_PRODUCTIZATION_PROGRESS.md`
- `CLAUDE-CONFIG-AUDIT.md`
- multiple `AUDIT_FULL_2026-04-29...` and `AUDIT_FULL_2026-04-30...` files
- `CIVICSUITE_OUTSIDE_REVIEW_MERGED_MEMO_2026-04-29.md`
- `HANDOFF_2026-04-28_CIVICSUITE_COMPACT.md`
- `DEV_AUDIT_LOOP.md`
- `AUDIT_DASHBOARD.md`

Important existing CivicSuite repo evidence observed:

- `.agent-workflows/PROJECT_CONTROL_PLANE.md`
- `.agent-workflows/ACTIVE_WORK_QUEUE.md`
- `.agent-workflows/HANDOFF_PAUSED_INSTALLER_WORKFLOW_2026-05-09.md`
- `.agent-workflows/HANDOFF_INSTALLER_VALIDATION_STATUS_2026-05-09.md`
- `.agent-workflows/HANDOFF_WORKFLOW_PAUSED_2026-05-09_AFTER_PR109.md`
- `docs/audits/civicsuite-umbrella-audit-full-2026-05-07.md`
- `installer/reports/installer-package-cleanroom-20260509T193309Z-b90bb614/installer-package-cleanroom.json`
- `installer/reports/installer-package-cleanroom-20260509T193433Z-4582af7c/installer-package-cleanroom.json`
- `installer/reports/installer-package-cleanroom-20260509T193159Z-9945e706/installer-package-cleanroom.json`

## Installer Evidence Inventory

Current public beta release assets observed in the handoff and release state:

```text
c3b022bd48416811cbed6112540d6f5e185829d21ed380104b101464c4b690d1  CivicSuite-clerk-core-windows-0.1.0.zip
f0aa51e8fe6468adcdb981ef1ff4ac8fd4875d02aeed36dd10f1958d779b5950  CivicSuite-clerk-core-macos-0.1.0.tar.gz
d79f36f51040bbbf2ee3ffbf0e9f1633d15d7ac839a248a12f32294edb1e4486  CivicSuite-clerk-core-linux-0.1.0.tar.gz
```

Installer validation evidence observed:

- Windows full lifecycle: `installer/reports/installer-package-cleanroom-20260509T193309Z-b90bb614/installer-package-cleanroom.json`
- Linux full lifecycle: `installer/reports/installer-package-cleanroom-20260509T193433Z-4582af7c/installer-package-cleanroom.json`
- macOS archive/readiness/plan only: `installer/reports/installer-package-cleanroom-20260509T193159Z-9945e706/installer-package-cleanroom.json`

Installer caveat:

- Full macOS runtime install/repair/verify/uninstall has not been proven on a macOS host or VM.

## Current Release Claim Classification

This inventory adopts the safest classification from the repaired queue and the available evidence:

| Class | Repos | Status |
|---|---|---|
| Shared platform | CivicCore | Public v1 tag exists; still treated as provisional until recovery/productization gates are reconciled for any future dependent release claim. |
| Mature product-shaped | CivicRecords AI, CivicClerk | Substantial release evidence exists; still evidence to inspect, not automatic authority for new claims. |
| Reconciled recovery lane | CivicCode, CivicZone, CivicPlan, CivicPermit | Local and remote recovery evidence exists in the queue; these are marked recovered in current queue state, not automatically expanded into all future product claims. |
| Future v1 work | CivicInspect and remaining modules | Foundation/provisional unless individually activated and completed through the current Definition of Done. |
| Umbrella / governance / installer | CivicSuite | Installer is current active target; beta package lifecycle evidence exists for Windows/Linux and partial macOS. |

## Gate Conclusions

1. The missing forensic inventory evidence file has been repaired by this document.
2. `CivicSuiteUnifiedSpec.md` exists at `docs/CivicSuiteUnifiedSpec.md`, not the repo root.
3. Available org state currently shows 27 public CivicSuite repos.
4. Local repo inventory shows several dirty scratch/work states; those must not be erased or assumed irrelevant without target-specific review.
5. Module release work remains governed by the active release lock and queue.
6. CivicSuite installer remains the active target unless the queue is intentionally changed.
7. The current installer status remains YELLOW because macOS full-runtime validation is outstanding.

## Allowed Next Work After This Inventory

Allowed without changing gates:

- continue the active CivicSuite installer target,
- read-only module recovery reconnaissance,
- update durable workflow/control-plane evidence,
- run active-target verification that stays inside the active target scope.

Still forbidden unless explicitly authorized by the active queue and gates:

- editing queued modules,
- starting CivicInspect v1 implementation,
- calling unreconciled modules finished or product-ready,
- deleting dirty scratch files in other repos,
- performing cross-module implementation,
- pushing/merging/tagging/releasing a queued module.

## Commands Used For This Inventory

Representative commands:

```powershell
git -C C:\dev\Claude\CivicSuite status --short --branch
git -C C:\dev\Claude\CivicSuite remote -v
git -C C:\dev\Claude\CivicSuite log --oneline --decorate -10
rg --files C:\dev\Claude\CivicSuite
rg --files C:\dev\Claude\CivicSuite | Measure-Object
rg -n "^(#|##)" C:\dev\Claude\CivicSuite\docs\CivicSuiteUnifiedSpec.md
gh repo list CivicSuite --limit 100 --json name,url,isPrivate,defaultBranchRef,updatedAt,pushedAt
gh release list --repo CivicSuite/civicsuite --limit 20
```

## Recommendation

Recommended next action: continue with the active CivicSuite installer target, carrying the macOS full-runtime validation gap as a known caveat.

Why: the missing inventory gate is now repaired, the installer is the active target, and Windows/Linux evidence is strong enough to keep product recovery moving while macOS validation is scheduled for a real macOS host or VM.

