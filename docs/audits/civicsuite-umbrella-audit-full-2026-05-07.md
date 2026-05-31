# CivicSuite Umbrella Full Audit

Date: 2026-05-07

## 1. Executive Audit

Scope: `C:\dev\Claude\CivicSuite`, the umbrella documentation, governance, compatibility, and verification repo.

Audit mode: standard recovery audit after an external release-theater audit.

Active cleanup: yes. This audit includes the corrective patch that freezes public product-ready claims and makes release labels provisional.

Local-vs-live parity: before cleanup, local `main` matched `origin/main` at `6cf46a9b77706e79cf2f8c2fa5185cc264ea1a65`. Current audit branch is `recovery/provisional-release-truth` with local edits not yet merged.

Overall verdict: the umbrella repo is structurally useful but had public release claims stronger than the proof. The corrective patch materially improves truthfulness by replacing shipping/productizing claims with provisional recovery status, adding `docs/release-recovery-status.md`, and making `verify-docs.sh` reject the old overclaim patterns.

Ship posture: do not use this repo to promote any CivicSuite module as product-ready until repo-specific recovery gates pass.

Static audit confidence: High for current umbrella docs, scripts, workflow, and version-matrix behavior.

Runtime sign-off confidence: Medium for the umbrella repo only. WSL docs and suite-state verifiers passed; no product frontend or multi-service runtime belongs to this repo.

Severity summary: Blocker 0, Critical 1 fixed in this run, Major 4 fixed in this run, Minor 1 open.

Top cross-cutting findings:

1. `[FIXED] CRITICAL REL-001` Public release claims overstated product readiness.
2. `[FIXED] MAJOR TEST-001` Historical compatibility rows no longer call docs-render smoke "browser QA".
3. `[FIXED] MAJOR REL-002` Version truth is enforced and historical evidence wording was corrected.
4. `[FIXED] MAJOR SEC-001` Umbrella CI now has a lightweight secret-pattern scan.
5. `[FIXED] MAJOR DOC-001` Generated `.docx` and `.pdf` manuals are removed from source control and ignored.
6. `MINOR DOC-002` Large historical QA screenshot corpus remains in top-level `docs/`.

CI/workflow posture: `.github/workflows/verify.yml` runs `verify-docs.sh`, `verify-secret-scan.py`, docs landing-page browser verification through npm/Playwright, deployment-profile static verification, and `verify-suite-state.py --remote-only`. After this patch those gates cover release overclaim language, committed secret-pattern drift, current repo/tag matrix drift, and the static docs landing page.

## 2. Audit Coverage Ledger

| Lane | Status | Evidence summary | Blocker if not checked |
|---|---|---|---|
| remote parity | Checked | `git fetch`; pre-cleanup `HEAD == origin/main == 6cf46a9...` | n/a |
| local-vs-live commit truth | Checked | Branch `recovery/provisional-release-truth`; edits local only | n/a |
| CI/workflow presence | Checked | `.github/workflows/verify.yml` inspected | n/a |
| Windows install path | Not applicable | Umbrella repo has no installable app | n/a |
| Linux or Unix install path | Partially checked | WSL ran shell/Python verifiers | Product install lives in module repos |
| platform parity verdict | Partially checked | Umbrella scripts work in WSL and PowerShell/Python paths | Full parity belongs in module repos |
| first boot | Not applicable | No service runtime in umbrella repo | n/a |
| required post-install steps | Not applicable | No installable umbrella package | n/a |
| migrations | Not applicable | No DB runtime | n/a |
| seed/bootstrap requirements | Not applicable | No seed runtime | n/a |
| runtime dependency and model requirements | Not applicable | Umbrella is docs/scripts only | n/a |
| first-boot dependency truth | Not applicable | No first boot | n/a |
| secrets and credential handling | Checked | grep found no repo secret values; `verify-secret-scan.py` added and passed | n/a |
| auth and session handling | Not applicable | No auth runtime | n/a |
| authorization and role boundaries | Not applicable | No app routes | n/a |
| response-schema sensitive-data exposure | Not applicable | No API | n/a |
| audit and compliance logging | Not applicable | No runtime audit log | n/a |
| external and admin surfaces | Not applicable | Docs-only repo | n/a |
| connector implementation completeness | Not applicable | Connector code lives in module/core repos | n/a |
| connector docs truth | Partially checked | Current docs now say mock-vs-production must be labeled | Per-repo connector claims still need audits |
| background jobs and schedulers | Not applicable | No scheduler runtime | n/a |
| frontend critical journeys | Partially checked | Static docs landing page only; no product journey | Product frontend checks belong in modules |
| loading states | Not applicable | Static docs page | n/a |
| empty states | Not applicable | Static docs page | n/a |
| error states | Not applicable | Static docs page | n/a |
| partial states | Not applicable | Static docs page | n/a |
| accessibility cues | Partially checked | Existing docs page has skip link; browser not rerun in this pass | Needs browser rerun |
| docs truthfulness | Checked | Public claims patched and overclaim gate added | n/a |
| version consistency | Checked | `verify-suite-state.py` local and remote-only passed | n/a |
| release artifact consistency | Partially checked | Remote release assets checked through `gh release view` | Per-asset semantics not audited |
| test realism | Checked | Umbrella tests are verifier scripts, not product tests | n/a |
| runtime, build, and test verification | Checked | WSL `verify-docs.sh`, `verify-suite-state.py`, deployment verifier passed | n/a |
| browser verification | Checked | WSL Playwright docs landing-page check passed desktop/mobile with screenshots and zero console messages | n/a |
| prior audit or verification challenge | Checked | External audit findings used as challenge input and verified against current docs/scripts | n/a |

## 3. Claim Verification Matrix

| Claim | Source | Verdict | Evidence note |
|---|---|---|---|
| Public product-ready claims are frozen | README, docs index, recovery status | True | Current docs state provisional recovery status. |
| `verify-docs.sh` blocks old overclaim phrases | `scripts/verify-docs.sh` | True | WSL run passed; pattern blocks named prior phrases. |
| Suite-state verifier tracks current v1 local truth | `scripts/verify-suite-state.py` | True | WSL local and PowerShell remote-only runs passed. |
| Compatibility matrix is product-readiness proof | Historical docs | False | Current matrix now says rows are public tag/history evidence, not readiness proof. |
| Browser QA in historical rows proves user-flow QA | Compatibility history | False | Historical rows still use the phrase; recovery status requires real Playwright flow proof. |
| Umbrella repo has security scan CI | Workflow | False | CI lacks gitleaks, dependency scan, or static security scan. |
| Umbrella repo has no runtime product code | README and tree | True | No app package; docs/scripts/specs only. |
| Generated manuals have a clear source of truth | USER-MANUAL.md plus generated artifacts | Partially true | `.md` is effectively source; binary render artifacts remain committed. |

## 4. What The Dev Team Needs To Do Now

### Must Fix Before Ship

Primary ID: REL-001

Title: Freeze overclaiming release language.

Owner area: Release / Docs / Product.

Why now: This was the highest-trust defect. The umbrella was telling readers to treat public v1 labels as stronger proof than the code/test evidence supports.

Required verification after fix: `bash scripts/verify-docs.sh`; search current-facing docs for old overclaim strings.

Required follow-through: every module repo must adopt the same mock-vs-production and provisional-release language until its recovery gate passes.

Status: fixed in this patch.

### Should Fix This Sprint

### Can Defer If Consciously Accepted

Primary ID: DOC-002

Title: Archive the existing browser evidence screenshot corpus.

Owner area: Docs / QA.

Why defer: It is noisy but not as damaging once public claims no longer cite it as product proof.

## 5. Next-Sprint Watchlist

Architecture: prevent the umbrella from becoming a hand-maintained source of truth for values that can be read from repos.

Security and compliance debt: upgrade the lightweight umbrella secret scan to gitleaks where practical; add full security scanning in product repos.

UX debt: keep browser verification in CI and add it to future docs landing-page edits.

Docs debt: move old `browser-qa-*` evidence into `docs/release-evidence/archive/`.

Install and bootstrap debt: per-repo recovery audits must prove clean install in WSL or equivalent, not just verify source strings.

Test debt: every frontend repo needs Playwright user-flow tests; docs-render smoke must be named honestly.

Operational and release debt: v1 tags remain provisional until recovery gates pass.

## 6. Engineering Deep Dive

Area verdict: The umbrella repo has a coherent docs/scripts architecture. The main engineering risk is that verification scripts can become another static truth table if not tied to real repo state.

Strengths:

- CI exists and runs docs, deployment-profile, and suite-state verification.
- `verify-suite-state.py` now checks current v1 local and remote tag truth.
- Deployment profile static verifier passes.

### `[CRITICAL] REL-001 Public release claims overstated product readiness`

- `Confidence`: High
- `Evidence type`: Static
- `Status`: Durable defect fixed in this run

Why it matters:

The public README and landing page implied product maturity that the external audit showed was not supported by frontend architecture, real user-flow QA, or install/security proof.

Evidence:

- Prior README and landing page claimed shipping/productizing status.
- Current patch replaces those claims with provisional recovery status.
- `verify-docs.sh` now blocks old overclaim phrases.

Blast radius:

- All users, contributors, and municipal evaluators who rely on umbrella docs.

Fix:

- Done for current-facing umbrella docs. Carry the same discipline into module repos.

### `[MAJOR] ENG-001 Verifier still has hand-maintained repo specs`

- `Confidence`: High
- `Evidence type`: Static / Runtime
- `Status`: Fixed in this run

Why it matters:

The verifier now passes, but it still relies on static `RepoSpec` entries. That can drift again.

Evidence:

- `scripts/verify-suite-state.py` contains a hand-maintained `REPOS` tuple.

Blast radius:

- Any module version or dependency change can silently require umbrella script edits.

Fix:

- Later: read repo list and versions dynamically from GitHub plus local `pyproject.toml` where available.

## 7. Security And Authorization Deep Dive

Area verdict: The umbrella repo has no app auth surface. Its security gap is CI process coverage, not runtime authorization.

Strengths:

- No app secrets found in grep pass.
- Workflow uses `github.token` only in CI context.
- `SUCCESSION.md` explicitly says no release path should write secrets into repo docs.

### `[MAJOR] SEC-001 No security scan ratchet in CI`

- `Confidence`: High
- `Evidence type`: Static
- `Status`: Fixed in this run for umbrella secret-pattern scanning

Why it matters:

The recovery gate requires security scans. Without CI enforcement, future repos can reintroduce hardcoded secrets or unsafe dependency patterns.

Evidence:

- `.github/workflows/verify.yml` previously had docs/deployment/suite-state checks only.
- Current patch adds `scripts/verify-secret-scan.py` to CI.

Blast radius:

- Umbrella trust posture; product repos still need stronger scanners.

Fix:

- Done for umbrella secret-pattern scanning. Require stronger scans in module repos.

## 8. UI/UX Deep Dive

Area verdict: The umbrella has a static docs landing page. It is not a product UI and must not be used as evidence of product user-flow QA.

Strengths:

- Landing page has a skip link.
- The revised status text is clearer and less promotional.

No open UX finding remains for this umbrella patch. The docs landing page browser check passed desktop and mobile from WSL.

## 9. Product/PM Deep Dive

Area verdict: The product story is now more honest. The highest remaining product risk is that historical rows and external tags can still be misread as readiness.

Strengths:

- Recovery status page gives explicit language rules.
- README now distinguishes public tag existence from readiness.

### `[MAJOR] PM-001 Existing public tags remain easy to misread`

- `Confidence`: High
- `Evidence type`: Static
- `Status`: Durable defect

Why it matters:

GitHub release pages can still suggest maturity even when umbrella docs are corrected.

Evidence:

- Public v1 tags exist for several repos.

Blast radius:

- Evaluators who enter through module release pages instead of umbrella docs.

Fix:

- Add provisional status language to each affected module README and release notes during repo-by-repo recovery.

## 10. Documentation Deep Dive

Area verdict: Current-facing umbrella docs are now substantially more truthful. The docs corpus still contains historical wording and generated artifacts that can cause confusion.

Strengths:

- README, manual, landing page, compatibility matrix, and verifier now agree on provisional status.
- `docs/release-recovery-status.md` is explicit and reusable.

### `[MAJOR] DOC-001 Binary manual artifacts remain committed`

- `Confidence`: High
- `Evidence type`: Static
- `Status`: Durable defect

Why it matters:

Committed `.docx` and `.pdf` artifacts are hard to review and can drift from `.md`.

Evidence:

- `USER-MANUAL.docx` and `USER-MANUAL.pdf` were tracked.
- Current patch removes them from source control and adds them to `.gitignore`.

Blast radius:

- Documentation review and release artifact confidence.

Fix:

- Done for source control removal. Future releases can generate them as release assets.

### `[MINOR] DOC-002 Historical browser evidence files are noisy`

- `Confidence`: High
- `Evidence type`: Static
- `Status`: Fixed for `browser QA` terminology in this run

Why it matters:

The `docs/` tree contains many `browser-qa-*` artifacts, which makes docs navigation harder and preserves the old terminology.

Evidence:

- File listing shows many `docs/browser-qa-*` images and summaries.

Blast radius:

- Contributor orientation and future audit clarity.

Fix:

- Archive under `docs/release-evidence/archive/` and rename future docs-only checks.

## 11. Install / Bootstrap / Seeding Deep Dive

Area verdict: No installable app lives here. The relevant bootstrap proof is that docs/scripts run cleanly in WSL and CI.

Strengths:

- WSL `verify-docs.sh` passed.
- WSL `verify-suite-state.py` passed.
- WSL deployment-profile static verifier passed.

Verification gaps:

- Module install proofs must be done in each module repo.

## 12. Version And Release Consistency Deep Dive

Area verdict: This patch fixes the most visible version drift in the umbrella matrix and verifier. It does not prove per-module product readiness.

Strengths:

- Local suite-state verification passed.
- Remote-only release verification passed through GitHub release assets.

### `[MAJOR] REL-002 Historical compatibility rows still blur evidence categories`

- `Confidence`: High
- `Evidence type`: Static
- `Status`: Durable defect

Why it matters:

Rows that place docs smoke, tests, browser QA wording, and release assets in one evidence sentence still overstate what was proven.

Evidence:

- Historical `browser QA` wording existed in `docs/compatibility/index.md`.
- Current patch renames those references to docs-render/browser evidence terms.

Blast radius:

- Any reader using historical rows as proof of product behavior.

Fix:

- Done for terminology. Module repos still need real Playwright flow tests before product claims.

## 13. Test Engineering Deep Dive

Area verdict: The umbrella has verifier scripts, not product tests. That is acceptable for a docs/governance repo, but the names must stay honest.

Strengths:

- Docs verifier now checks overclaim language.
- Suite-state verifier checks local and remote version/release consistency.

### `[MAJOR] TEST-001 Historical browser QA terminology remains`

- `Confidence`: High
- `Evidence type`: Static
- `Status`: Fixed in this run for the umbrella compatibility matrix

Why it matters:

The phrase "browser QA" was a central false-confidence pattern in the external audit.

Evidence:

- Compatibility history previously contained `browser QA` in past rows.
- Current patch renames those references to docs-render/browser evidence terms.

Blast radius:

- Release evidence interpretation across the suite.

Fix:

- Done for umbrella terminology. Real Playwright user-flow tests remain required in module repos.

## 14. Runtime QA Deep Dive

Area verdict: Runtime QA for the umbrella means script execution and static landing-page verification. Script runtime passed; browser pass remains to run.

[AUDITOR-RUN]

- `wsl bash scripts/verify-docs.sh`: PASS.
- `wsl python3 scripts/verify-secret-scan.py`: PASS.
- `wsl python3 scripts/verify-suite-state.py`: PASS.
- `python scripts/verify-suite-state.py --remote-only`: PASS.
- `wsl python3 scripts/verify-deployment-profile.py --static-only`: PASS.
- `wsl npm run verify:browser`: PASS; desktop and mobile screenshots written under `docs/audit-browser-qa/`; zero console messages.
- `git diff --check`: PASS.

[DEV-REPORTED]

- None used as final proof.

No open Runtime QA finding remains for the umbrella landing-page change.

## 15. Cross-Cutting Synthesis

The root cause is static prose becoming a release authority. The umbrella accumulated many manually synchronized status claims, evidence rows, rendered manuals, and browser-evidence files. Once module versions moved quickly, these sources drifted and began overstating what had actually been proven.

The strongest fix is to reduce interpretive prose and make gates enforce narrow, falsifiable claims. This patch starts that by freezing readiness language, adding a recovery status source, and making verifier scripts fail on version drift and overclaim phrases.

The team must not misread passing umbrella verification as product readiness. It only means the umbrella docs and release-state checks are internally consistent enough to continue repo-by-repo recovery.

## 16. Verification Gaps And Sign-Off Limits

What could not be verified:

- Real product user flows for module repos.
- Module install proofs.
- Module security scans.
- Module mock-vs-production truth.

Why:

- This audit was scoped to the umbrella repo and first recovery patch.

Exact checks needed:

- Per-repo `audit-full` packets.
- Playwright user-flow suites where frontends exist.
- Fresh clean-environment install proof per repo.
- Security/secret/dependency scans per repo.

Sign-off limit:

- The umbrella repo is improved but not fully release-clean until the remaining screenshot-evidence archive cleanup is completed and every product repo passes its own recovery gate.
