**Decision: PROMOTE**

- **Run id:** 2026-05-13-macos-honest-narrowing
- **Generated:** 2026-05-13T22:40Z
- **Mode:** autonomous (grant `.agent-workflows/autonomous-grants/candidate-b-macos-2026-05-13.md`, AUTONOMOUS-ACTIVE at decision time)
- **PRs:** [CivicSuite/civicsuite#132](https://github.com/CivicSuite/civicsuite/pull/132) commit `41537bc`; [CivicSuite/civicrecords-ai#80](https://github.com/CivicSuite/civicrecords-ai/pull/80) commit `d275045`. Both OPEN, MERGEABLE, `mergedAt: null`.

---

## Executive summary

This run swept unqualified macOS support claims across the CivicSuite umbrella and civicrecords-ai (civicclerk was planner-authorized SKIP — every macOS mention is shell-portability operational text, not a published platform-support claim) and replaced them with the canonical sentence "Windows-only currently; macOS support pending lifecycle certification." or one of five documented variants in plan §4. Verifier, drift, and critic all return PASS with 0 blockers; critic surfaces three minor cleanup observations (M1–M3) that are explicitly classified as non-blocking. Recommendation is PROMOTE — manager approves promotion to human-merge gate.

---

## Auto-promote bypass justification

`auto-promote-report.md` returned NOT_ELIGIBLE on two of six conditions. Both are literal-string-pattern misses against a docs-only run, not substantive policy or test failures:

### 1. `policy-passed` — FAIL (literal-string match)

The auto-promote check looks for the exact string `POLICY: ALL CHECKS PASSED` in `policy-report.md`. That literal phrase is not present. However, the substantive evidence is unambiguous:

- `policy-report.md:7` cites `python scripts/policy/run_all.py --run 2026-05-13-macos-honest-narrowing` — **exit 0**.
- `policy-report.md:11-14` table shows all four checks PASS: `check_manifest_schema` PASS, `check_allowed_paths` PASS (vacuous — feature branches already pushed), `check_no_todos` PASS (vacuous — no source dirs), `check_adr_gate` PASS.
- `policy-report.md:20` cites `check_autonomous_compliance.py` — **PASS** ("OK: autonomous-mode compliance check passed (or run was HUMAN-MODE)").
- `policy-report.md:38` writes verbatim "**PASS.** Local policy checks all pass. Autonomous-compliance script exit 0. No drift indicators."

The pipeline policy stage is materially passed; the auto-promote script's matcher was tuned for a sentinel string the umbrella's v1.2.0 `run_all.py` does not currently emit (the v1.2.0+ hardening scripts that would emit it are missing from the umbrella's local `scripts/policy/` per `policy-report.md:32`). Manager judgment: the policy check stands as PASS.

### 2. `tests-passed` — FAIL (literal-string match against docs-only run)

The auto-promote check looks for `N passed, 0 failed` or `all tests passed` in `implementation-report.md`. Those phrases are absent because no tests were run. This is structurally correct, not a defect:

- `failing-tests-report.md:3` records the test-write stage as `Verdict: N/A — documentation-only run, no test surface.`
- All test paths (`tests/**`, `**/tests/**`) are in `forbidden_paths` in every per-repo scope (manifest lines 38–39, 74–75, 110–111).
- `verifier-report.md` §5 supplies the structural proof: PR file lists are `*.md` / `*.txt` / `installer/README.md` only; "No path matching any test-bearing or test-config glob is changed. No test outcome can have moved because no executable surface was changed."
- DoD clause (4) — "pre-existing test suites in each repo still pass with no code changes" — is an absence-of-regression assertion, satisfied by construction.

Running pytest would be informational and produce no evidence of fitness. The auto-promote signal cannot fire on a docs-only run by design.

**Both auto-promote failures are literal-pattern misses, not substantive findings. The manager-stage human-approval gate (which auto-promote defers to whenever conditions fail) is the right place to land — this report supplies the substantive sign-off.**

---

## Resolution per finding

One row per finding from verifier-report, drift-report, critic-report, and auto-promote-report. Disposition vocabulary: ACCEPT (the observation stands; promotion proceeds with rationale), FIX-BEFORE-PROMOTE (must be addressed first), DEFER (legit but non-blocking; log as cleanup follow-up), N-A (does not apply).

| Source | Finding | Severity | Resolution | Disposition |
|---|---|---|---|---|
| verifier-report.md §7 | clause (1) — every unqualified macOS claim narrowed | MET | Plan §2 edits verbatim in diff; verifier §1 matrix shows 100% verbatim match | N-A |
| verifier-report.md §7 | clause (2) — cross-surface consistency | MET | Canonical phrase in 11 surfaces; 5 documented variants used where structure requires; no contradiction | N-A |
| verifier-report.md §7 | clause (3) — .txt mirrors match .md | MET | PR 80 B.2.x / B.4.x hunks byte-identical to .md counterparts at same line numbers | N-A |
| verifier-report.md §7 | clause (4) — pre-existing tests still pass | MET (structural) | No test surface touched; outcome cannot move (see §5 of verifier) | N-A |
| verifier-report.md §7 | clause (5) — PRs open, none admin-merged | MET (with documented deviation) | 2 of 3 PRs opened; civicclerk SKIP planner-authorized in plan §5 Repo C; both PRs OPEN/MERGEABLE/null | N-A |
| verifier-report.md §7 | clause (6) — `macos-claim-inventory.md` complete | MET | File present (15,744 bytes) with verbatim before/after per edit-id | N-A |
| verifier-report.md §7 | `expected_outputs` (3) — civicclerk PR | NOT APPLICABLE | Planner-authorized SKIP per plan §5 Repo C; research confirmed zero in-scope claims (all macOS refs are shell-portability operational text, not published support claims) | ACCEPT |
| drift-report.md §2 | Drift items | 0 total, 0 blocker | Manifest unchanged after manifest-stage approval (mtime 22:00:51Z precedes all subsequent stage timestamps); diff matches plan 1:1; no forbidden_paths hit; no forbidden-action class invoked | N-A |
| critic-report.md §5 M1 | Docker-Desktop-on-macOS phrasing awkwardly self-referential ("...macOS (Windows-only currently...)") at `installer/README.md:39` and three mirror locations | Minor (Cleanup) | Variant #1 (parenthetical inline) is documented in plan §4; reader can recover meaning from surrounding context; cleaner future phrasing recommended ("uncertified — see Supported Platforms") | DEFER → `next-cleanup.md` |
| critic-report.md §5 M2 | B.1 table OS-row Minimum cell at `civicrecords-ai/USER-MANUAL.md:259` is dense (three structural ideas stacked) | Minor (Cleanup) | Plan §3 Q2 resolution deliberately preserved table structure to minimize blast radius; cell content is factually accurate; row-split is a future-release cleanup, not a regression | DEFER → `next-cleanup.md` |
| critic-report.md §5 M3 | Pre-existing mojibake (`â€"` for em-dash) at `civicsuite/README.md:67` preserved | Minor (Cleanup) | Pre-existing; plan §7 deliberately preserved it because manifest scope is macOS-claim narrowing, not text-encoding cleanup; not a regression introduced by this run | DEFER → `next-cleanup.md` |
| auto-promote-report.md | `policy-passed` FAIL — `POLICY: ALL CHECKS PASSED` literal absent | Procedural | Substantive policy PASS established in `policy-report.md` (run_all.py exit 0; all 4 local checks PASS; autonomous-compliance PASS); literal-string mismatch is auto-promote-script harness artifact, not policy failure | ACCEPT |
| auto-promote-report.md | `tests-passed` FAIL — `N passed, 0 failed` literal absent | Procedural | Docs-only run with all test paths in `forbidden_paths`; no tests could run; DoD clause (4) satisfied by construction (verifier §5 structural deduction) | ACCEPT |

**Totals: 13 rows. 5 ACCEPT (4 procedural / planner-authorized + 1 N/A SKIP). 0 FIX-BEFORE-PROMOTE. 3 DEFER (M1, M2, M3 → `next-cleanup.md`). 5 N-A (verifier MET clauses + drift 0-count line, which are positive evidence not findings to resolve).**

---

## DoD walkthrough

Manifest `definition_of_done` (manifest.yaml line 225) contains six numbered clauses. Each:

| DoD clause | Verdict | One-line evidence |
|---|---|---|
| (1) Every unqualified macOS claim replaced with canonical phrase or clearly-scoped equivalent | PROMOTABLE | verifier-report.md §1 — every plan edit-id appears verbatim in diff (32 edits applied; 0 deferred) |
| (2) Changed claims consistent across all touched surfaces, no surface contradicts another | PROMOTABLE | verifier-report.md §3 — canonical phrase in 11 surfaces + 5 documented variants; critic-report.md §7 QA-lens confirms cross-file consistency |
| (3) Plain-text mirrors (.txt) match .md counterparts where both exist | PROMOTABLE | verifier-report.md §1 — PR 80 B.2.x/B.4.x hunks identical to B.1.x/B.3.x at same line numbers; civicsuite has no full .txt mirror so parity check is vacuous there |
| (4) Pre-existing test suites still pass with no code changes | PROMOTABLE | verifier-report.md §5 — structural deduction (no test surface, no test-config surface, no CI workflow surface touched in either PR's file list) |
| (5) One PR opened per repo, none admin-merged, awaiting human merge | PROMOTABLE (with documented planner-authorized SKIP) | 2 of 3 PRs opened (#132, #80); civicclerk SKIP authorized in plan §5 Repo C with rationale (zero in-scope claims); both opened PRs OPEN/MERGEABLE/null (verifier §6) |
| (6) `macos-claim-inventory.md` captures every edited line with before/after snippets | PROMOTABLE | File present at `.agent-runs/2026-05-13-macos-honest-narrowing/macos-claim-inventory.md` (15,744 bytes; verifier §4 clause 6 confirms verbatim before/after per edit-id) |

All six clauses PROMOTABLE. The clause-5 deviation (civicclerk SKIP) is planner-authorized at plan §5 Repo C, documented in implementation-report §"Deviations" item 2, recorded in inventory's "Repo C — civicclerk: SKIPPED" section, and acknowledged in verifier-report §7 as NOT APPLICABLE for `expected_outputs (3)`. This is consistent with the role-file's PARTIAL-with-explicit-deferral exception pattern.

---

## Recommended action

**Verdict: PROMOTE.**

Specific human-merge action required (must be performed by Scott, not the autonomous agent):

1. **Admin-merge PR #132 (CivicSuite/civicsuite, commit `41537bc`)** against `main`.
2. **Admin-merge PR #80 (CivicSuite/civicrecords-ai, commit `d275045`)** against `master` (civicrecords-ai default branch; see implementation-report §"Deviations" item 1 for the branch-name reconciliation).
3. **No tag push.** This is documentation-claim narrowing, not a release. CHANGELOG is in `forbidden_paths` and `non_goals` #4; `pyproject.toml` and `_version.py` were not touched.
4. **No release publish.** No release artifact in scope (`release-artifacts/**` in `forbidden_paths`).
5. **Optionally schedule the three M1/M2/M3 cleanup observations** in `next-cleanup.md` for a future docs-currency pass (clearer parenthetical wording at `installer/README.md:39` and three siblings; table-structure split for `civicrecords-ai/USER-MANUAL.md:259`; mojibake fix at `civicsuite/README.md:67`). None of these gate the current PRs.

After merges, the umbrella's published platform matrix is honestly narrowed to match actual lifecycle-certified support, advancing the active target ("Installer/macOS certification follow-up — honest-narrowing branch") per `PROJECT_CONTROL_PLANE.md:83`.

---

## Forbidden actions reminder

The manager-stage recommendation is PROMOTE-only. The manager has **NOT** performed and **CANNOT** authorize, even given this recommendation:

- **`gh pr merge --admin`** (or any form of merge) on PR #132 or PR #80. Scott performs the merge himself at the human-merge gate.
- **Tag push** (`git push origin v*`, `git push --tags`). Out of scope for this run (`non_goals` #3); explicitly Forbidden in the autonomous grant.
- **Release publish** (`gh release create`). Out of scope (`non_goals` #3); explicitly Forbidden in the autonomous grant.
- **Force push** (`git push --force`, `git push -f`). Explicitly Forbidden in the autonomous grant.
- **Edits to any path outside per-repo `allowed_paths`** or inside per-repo `forbidden_paths`. None occurred (verifier-report §2; drift-report §6).
- **Manifest mutation post-approval.** Verified untouched (drift-report §3).

The grant's "manager-gate APPROVE (PROMOTE only)" authorization maps this recommendation to AUTONOMOUS-APPROVE on the manager gate. The human-merge gate that follows remains human-only per the grant's `Forbidden-actions` clause and `non_goals` #10 of the manifest.

---

**Manager: PROMOTE. 13 findings resolved: 5 ACCEPT, 0 FIX, 3 DEFER (+ 5 N-A positive-evidence rows). Verifier/drift/critic all PASS with 0 blockers; auto-promote NOT_ELIGIBLE is a literal-string-pattern miss on a docs-only run with no substantive policy or test defect.**
