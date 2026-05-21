# Clerk-Core Public-Use Audit Packet - 2026-05-20

This packet is prepared for independent Claude/auditor review. It is Codex evidence assembly, not the independent audit decision.

## 1. Verdict

YELLOW / audit-ready. PR #159 is merged, main CI is green, the suite verifier reports `[clerk-core-public-use-gate] PASS`, installed browser/user-facing route-state evidence exists, adversarial local integration mocks were run, and current local module release gates passed for CivicRecords AI and CivicClerk.

Do not promote to public-use/city-ready until the independent audit reviews this packet and any Blocker/Critical findings are fixed.

## 2. Claim Verification Matrix

| Claim | Evidence | Status |
| --- | --- | --- |
| PR #159 merged to main | `gh pr merge 159 -R CivicSuite/civicsuite --squash --delete-branch`; local main refreshed to `2df2965c428fd49a4af27de4ed682a05aca05c36` | PASS |
| Main verify passed | GitHub Actions run `26169272733` | PASS |
| Suite verifier reports CivicRecords AI 1.6.1 | Main verify log: `[civicrecords-ai] PASS 1.6.1` | PASS |
| Suite verifier reports Clerk-Core public-use gate proof | Main verify log: `[clerk-core-public-use-gate] PASS red_until_promotion_evidence` | PASS |
| Installer plan verification passed | Main verify log: `VERIFY-INSTALLER-PLAN: PASSED` | PASS |
| Linux installer lifecycle proves workflow proof, backup, restore, uninstall | Main installer-cleanroom run `26169272666`, Linux lifecycle job with `workflow_proof_requested: true`, `matching_host_lifecycle`, `postgres_backup_dump`, and `restore_probe_pg_restore` | PASS |
| Installed route inventory exists | `docs/installer/browser-qa/2026-05-20-clerk-core-public-use-matrix.md` and JSON evidence | PASS |
| Browser state matrix exists | 20 local browser checks passed; screenshots under `docs/installer/browser-qa/screenshots/2026-05-20-clerk-core-public-use-matrix/` | PASS |
| Adversarial local mocks exist | JSON evidence records bad input, missing staff role, missing/stale record, unavailable/degraded integration posture, public/staff boundary, plus restore precondition evidence in `docs/installer/browser-qa/2026-05-20-clerk-core-restore-precondition.md` | PASS |
| CivicRecords AI local release verifier passes | `C:\Users\scott\OneDrive\Desktop\Claude\civicrecords-verify-release-20260520.log`; exit 0; `VERIFY-RELEASE: PASSED` | PASS |
| CivicClerk local release verifier passes | `C:\Users\scott\OneDrive\Desktop\Claude\civicclerk-verify-release-20260520-rerun2.log`; exit 0; `VERIFY-RELEASE: PASSED` | PASS |
| No macOS lifecycle certification claim introduced | Current-facing changed docs say macOS remains archive/readiness only until matching-host lifecycle evidence exists | PASS |

## 3. Durable Artifact Reads

- `docs/CivicSuiteUnifiedSpec.md`: reconciled to 27 product modules plus CivicCore.
- `installer/modules.json`: full-suite profile contains 27 product modules after CivicCore and the clerk-core profile contains CivicCore, CivicRecords AI, and CivicClerk.
- `STATUS.md`: starter target remains not public-use/city-ready; remaining-module queue is 25 product modules after the starter pair.
- `README.md`: installer remains unsigned OSS beta; macOS is wrapper/archive only until matching-host evidence exists.
- `docs/installer/browser-qa/2026-05-20-clerk-core-public-use-matrix.md`: route inventory and browser state matrix summary.
- `docs/installer/browser-qa/2026-05-20-clerk-core-public-use-matrix.json`: full route inventory, browser evidence, console/focus/overflow results, adversarial mock payloads.
- `C:\Users\scott\OneDrive\Desktop\Claude\ACTIVE_RELEASE_QUEUE.md`: active target remains Clerk-Core only; queued module repos are paused.

## 4. Substantive Content Checks

- CivicRecords AI installed health returned `ok 1.6.1`.
- CivicClerk installed health returned `ok 1.0.1`.
- CivicRecords workflow proof covers request creation, request fetch, search filters, searching status, review submission, draft response letter with human review, and ready-for-release.
- CivicClerk workflow proof covers agenda intake, review, promotion, meeting body, meeting, packet assembly/finalize, notice checklist/posting proof, motion, vote, minutes draft, auto-post guardrail, public archive publish, public calendar, and public archive search.
- CivicClerk browser QA explicitly exercises success, loading, empty, error, and partial states for staff and public surfaces.
- CivicRecords browser QA covers login/dashboard/search/requests while request/search/review/response state proof is handled by installed workflow/API evidence.
- AI-generated outputs remain draft/cited/staff-reviewed/non-authoritative in the proof path.

## 5. Drift Matrix

| Drift | Bad state | Replacement / fix |
| --- | --- | --- |
| Spec count | Docs said 28 product modules plus CivicCore while the spec headings, installer metadata, and live GitHub org enumerate 27 product modules plus CivicCore | Reconciled current-facing docs to 27 product modules plus CivicCore and 25 remaining product modules after the starter pair |
| Queue authority | Old queue still described CivicContracts as active in the candidate sequence | Updated `ACTIVE_RELEASE_QUEUE.md` so Clerk-Core remains the only active target and post-starter module work is paused |
| CivicClerk release verifier | `npx --prefix frontend playwright install chromium` failed on this Windows/WSL path with `uv_cwd` | Changed verifier to `cd frontend` before `npx playwright install chromium` and `npm run test:e2e`; recovery gate updated to check the new command |
| macOS wording | Some current-facing text used certification-style wording | Replaced with bounded matching-host lifecycle evidence language |

## 6. Working Tree And Live Remote State

- CivicSuite local branch: `release/clerk-core-route-state-matrix`.
- CivicSuite tracked changes: new route/state matrix capture script and evidence docs/screenshots; spec-count docs cleanup; public-use audit packet.
- CivicSuite untracked runtime: `installer/runtime/` from local installed stack; do not commit.
- CivicClerk local branch: `fix/docker-api-prefix-proxy`; tracked changes in `scripts/verify-release.sh` and `scripts/verify-recovery-gates.py`.
- CivicRecords AI local branch: `fix/dashboard-audit-log-endpoint`; no tracked changes from this pass; pre-existing `.tmp-browser-qa-*` folders remain untracked.
- Live main CI after PR #159: verify `26169272733` success, installer-cleanroom `26169272666` success.

## 7. Unreported Catches

- The first route/state matrix run failed because the check expected over-specific staff-session copy. The check was corrected to assert the actual user-facing workflow copy and rerun to PASS.
- Repeated CivicRecords browser logins triggered HTTP 429. The capture was corrected to log in once through the API and seed the persisted JWT for staff browser pages.
- CivicClerk release verification initially failed at Playwright install due invocation shape, not due a failing e2e test. Isolated e2e passed, then the release verifier was fixed and rerun to PASS.
- Spec-count cleanup revealed the plan’s inherited “remaining 26 modules” math was wrong after reconciling live/spec/installer evidence. Correct remaining count is 25 product modules after CivicRecords AI and CivicClerk.

## 8. Open Caveats / Release Risks

- Independent audit has not yet approved public-use promotion.
- This packet does not prove external municipal validation, procurement readiness, airgap readiness, or macOS matching-host lifecycle.
- CivicRecords public resident portal routes are inventoried but not promoted in the current private-mode Clerk-Core package.
- The installed-stack proof does not claim live cross-module records exchange.
- CivicClerk verifier changes need their own branch/PR if the team wants the local Windows/WSL verifier fix in upstream `CivicSuite/civicclerk`.

## 9. Paste-Ready Directive

Review the Clerk-Core public-use audit packet at `.agent-workflows/reports/20260520-clerk-core-public-use-audit-packet.md` against the CivicSuite audit gate.

Required reads:

- `docs/installer/browser-qa/2026-05-20-clerk-core-public-use-matrix.md`
- `docs/installer/browser-qa/2026-05-20-clerk-core-public-use-matrix.json`
- `README.md`
- `STATUS.md`
- `docs/CivicSuiteUnifiedSpec.md`
- `installer/modules.json`
- `C:\Users\scott\OneDrive\Desktop\Claude\ACTIVE_RELEASE_QUEUE.md`

Verify GitHub evidence:

```powershell
gh run view 26169272733 -R CivicSuite/civicsuite --log | Select-String -Pattern "civicrecords-ai|clerk-core-public-use-gate|VERIFY-SUITE-STATE|VERIFY-INSTALLER-PLAN|clerk-core-workflow-proof"
gh run view 26169272666 -R CivicSuite/civicsuite --log | Select-String -Pattern "workflow_proof_requested|starter_set_runtime_workflows|civicrecords_workflow|civicclerk_bearer_workflow|backup|restore|matching_host_lifecycle|postgres_backup_dump|restore_probe_pg_restore"
```

Acceptance:

- main verify is green and logs `[civicrecords-ai] PASS 1.6.1`;
- main installer-cleanroom is green and logs workflow proof, backup, and restore proof;
- the route inventory maps CivicRecords AI and CivicClerk public/staff/browser/API routes to audience/auth/QA/state status;
- desktop/mobile browser evidence includes loading, success, empty, error, partial/degraded states, console output, keyboard/focus, and actionable copy;
- local adversarial mocks cover bad input, stale/missing records, spoofed/missing staff roles, unavailable/degraded dependency posture, failed restore precondition, and public/staff boundary failures;
- local CivicRecords AI and CivicClerk release verifiers passed;
- no doc introduces city-ready/public-use-ready/procurement-ready/live cross-module records exchange/macOS lifecycle certification claims.

Halt if any current-facing doc claims public-use readiness, city-ready status, production/procurement readiness, live cross-module records exchange, or macOS lifecycle certification.

## 10. Recommended Next Action

Run the independent audit against this packet. If it returns no unresolved Blocker/Critical findings, prepare the public-use promotion PR/release-tag lockstep path. If it finds Blocker/Critical issues, fix only those issues with careful-work evidence, rerun the relevant gates, and re-audit before any promotion.
