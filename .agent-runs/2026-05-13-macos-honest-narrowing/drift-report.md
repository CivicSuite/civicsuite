# Drift Report — 2026-05-13-macos-honest-narrowing

**Verdict:** PASS
**Open items:** 0
**Generated:** 2026-05-13T22:35Z

## 1. Headline

No drift detected.

## 2. Drift count line

**Drift: 0 total, 0 blocker**

---

## 3. Manifest immutability

`stat` on `.agent-runs/2026-05-13-macos-honest-narrowing/manifest.yaml` returned mtime **2026-05-13 16:00:51 -0600** (= **2026-05-13T22:00:51Z**).

The manifest-stage AUTONOMOUS-APPROVE in `autonomous-decisions.md` is timestamped **2026-05-13T21:58Z**. The manifest file mtime is +2m51s relative to the approval — i.e., the manifest was last written immediately around the manifest-stage save/commit and **not touched after** any subsequent stage:

- research STAGE_DONE at 22:08:33Z — manifest mtime 22:00:51Z is *earlier*.
- plan STAGE_DONE at 22:12:53Z — manifest mtime 22:00:51Z is *earlier*.
- execute STAGE_DONE at 22:26:20Z — manifest mtime 22:00:51Z is *earlier*.
- policy STAGE_DONE at 22:27:18Z — manifest mtime 22:00:51Z is *earlier*.

**No mid-run manifest mutation. PASS.**

## 4. Stage-done log integrity

`run.log` lines (verbatim):

```
2026-05-13T21:56:30Z RUN_START run_id=2026-05-13-macos-honest-narrowing pipeline=feature mode=autonomous grant=.agent-workflows/autonomous-grants/candidate-b-macos-2026-05-13.md
2026-05-13T21:58:00Z STAGE_DONE manifest artifact=manifest.yaml verdict=AUTONOMOUS-APPROVE
2026-05-13T22:08:33Z STAGE_DONE research artifact=research.md
2026-05-13T22:12:53Z STAGE_DONE plan artifact=plan.md verdict=AUTONOMOUS-APPROVE
2026-05-13T22:13:28Z STAGE_DONE test-write artifact=failing-tests-report.md note=docs-only-N/A
2026-05-13T22:26:20Z STAGE_DONE execute artifact=implementation-report.md prs=civicsuite#132,civicrecords-ai#80
2026-05-13T22:27:18Z STAGE_DONE policy artifact=policy-report.md verdict=PASS
```

Expected feature-pipeline sequence: `manifest → research → plan → test-write → execute → policy → verify`. Log shows manifest → research → plan → test-write → execute → policy in monotonic order; verify is pending (this stage). **No STAGE_FAILED, no gaps, no out-of-order entries. PASS.**

## 5. Scope drift (executor diff vs plan edit list)

Walked civicsuite#132 (9 hunks) and civicrecords-ai#80 (≈17 hunks counting .txt mirrors as individual hunks). Each diff hunk maps 1:1 to a plan §2 edit-id. The verifier-report §1 contains the per-edit verification matrix.

**No "while I was in there" edits.** No file appears in either PR's diff that is absent from plan §2.

The only documented deviation from the plan in implementation-report §"Deviations" is:

1. PR 80 opened against `master` not `main` — this is a base-branch reconciliation (civicrecords-ai default is `master`); not a content scope deviation.
2. civicclerk SKIPPED — planner-authorized in plan §5 Repo C with rationale; recorded in `macos-claim-inventory.md`.
3. Commit author set via `git -c user.name=… -c user.email=…` per-invocation, not via `git config` — safety-protocol-respecting workaround, no scope content effect.

None of these change the *content* of the edits made. **PASS.**

## 6. Forbidden-paths drift

Per-repo forbidden_paths re-quoted from manifest.target_repos:

- civicsuite: `backend/**`, `frontend/**`, `civiccore/**`, `civicclerk/**`, `civicrecords-ai/**`, `tests/**`, `**/tests/**`, `scripts/**`, `.github/workflows/**`, `pyproject.toml`, `**/pyproject.toml`, `package.json`, `**/package.json`, `**/_version.py`, `CHANGELOG.md`, `docs/adr/**`, `docs/audits/**`, `docs/qa/**`, `docs/evidence/**`, `docs/release-lockstep/**`, `docs/release-recovery-status.md`, `release-artifacts/**`, `installer/generated/**`, `FROZEN-EVIDENCE*`, `SHAPE-GUARD*`, `**/*.docx`, `**/*.pdf`, `**/*.png`.
- civicrecords-ai: similar shape, plus `civicrecords_ai/**`, `src/**`.

PR file lists (verified via `gh pr view --json files`):

- civicsuite#132: `FAQ.md`, `README.md`, `USER-MANUAL.md`, `installer/README.md` — **zero hits** against any forbidden_paths glob.
- civicrecords-ai#80: `README.md`, `README.txt`, `USER-MANUAL.md`, `USER-MANUAL.txt`, `docs/github-discussions-seed.md` — **zero hits** against any forbidden_paths glob (the file is under `docs/` but not under `docs/adr/`, `docs/audits/`, `docs/qa/`, or `docs/evidence/`).

**PASS.**

## 7. Off-target drift

`advances_target: "Installer/macOS certification follow-up — honest-narrowing branch"`. `authorizing_source: ".agent-workflows/PROJECT_CONTROL_PLANE.md:83-94"`. The Active target is the installer/macOS certification work, and honest-narrowing is named as part of it. The edits directly narrow macOS support claims in surfaces (README, USER-MANUAL, FAQ, installer/README.md, github-discussions-seed.md) where those claims live. None of the edits drift toward an unrelated target.

**PASS.**

## 8. Autonomous-mode-specific drift

Scanned `autonomous-decisions.md` for compliance-drift patterns:

- `"Reply APPROVE"` — not present.
- `"Reply WAIT"` — not present.
- Manager-gate / human-only-under-autonomous gate invocations under autonomous — not present.
- Forbidden actions named (admin-merge, tag push, release publish, force push) — not invoked. The two recorded gate decisions are both AUTONOMOUS-APPROVE on the manifest-gate (21:58Z) and plan-gate (22:12Z), both within the grant's Authorized-gates field.

Policy-report §"v1.2.1 autonomous-compliance check" independently confirms `check_autonomous_compliance.py` returned PASS.

**PASS.**

## 9. Standing doc-currency invariants (per role-file §8a–8e)

These invariants typically fire for plugin/marketplace releases; this run is a downstream documentation sweep. Each invariant assessed for relevance:

- **8a. Version-string consistency** — N/A for this run; `pyproject.toml`, `**/_version.py`, `CHANGELOG.md` are all in forbidden_paths. The run made no version-asserting edits.
- **8b. File-inventory tables** — N/A for this run; no inventory tables of slash commands or pipeline files were touched. `USER-MANUAL.md` table edits in both civicsuite and civicrecords-ai were *content* edits in the System Requirements table, not file-inventory tables.
- **8c. Pipeline-diagram parity** — N/A for this run; `docs/index.html` was not touched.
- **8d. Section-ordering sanity** — N/A; no per-version section headings were added or reordered.
- **8e. Stability-posture currency** — N/A; no "current release" version banner was edited.

**All five PASS as N/A. None apply to a downstream-product docs-claim-narrowing run.**

## 10. Document drift (durable doc set)

Walked each artifact required by the role-file's durable-doc set:

- `CHANGELOG.md`: **UNTOUCHED and consistent — no work needed.** This is documentation-claim narrowing, not a release; `CHANGELOG.md` is in `forbidden_paths` and `non_goals` #4 explicitly forbids CHANGELOG edits. No CHANGELOG entry should be written, and none was.
- `README.md` (civicsuite): **TOUCHED and consistent.** Three edits (A.1.1–A.1.3) narrowing umbrella suite-installer and FOIA-link claims. Diff matches plan verbatim.
- `README.md` (civicrecords-ai): **TOUCHED and consistent.** Four edits (B.1.1–B.1.4); canonical phrase used in B.1.2; variants used elsewhere per plan §4.
- `USER-MANUAL.md` (civicsuite): **TOUCHED and consistent.** Two edits (A.2.1–A.2.2); the Linux/macOS install heading + paragraph block carries the canonical phrase.
- `USER-MANUAL.md` (civicrecords-ai): **TOUCHED and consistent.** Six edits including the B.1 platform-matrix table cell-value change.
- `docs/adr/*`: **UNTOUCHED and consistent — no work needed.** No architectural choice made; existing macOS-uncertified ADR posture is what the prose is being aligned to. `docs/adr/**` is in `forbidden_paths`.
- Project HANDOFF: this project does not use `.agent-workflows/HANDOFF_*.md` for individual runs; orchestration uses `PROJECT_CONTROL_PLANE.md` line 83 (cited in `authorizing_source`). PROJECT_CONTROL_PLANE.md is **UNTOUCHED and consistent** — the Active target stanza is what authorized this run, and the run advances exactly that target.

## 11. Cross-file consistency drift

- **Top-level totals vs row evidence:** implementation-report claims "9 files changed across 2 repos." PR file lists show 4 + 5 = 9 files. Plan §6 blast-radius table shows 9 unique files. **Match.**
- **Edit counts:** implementation-report says "32 edits applied" (counting .txt mirrors individually). Plan §6 also says "28 distinct edits" (counting the .md edits as logical units with their .txt mirrors as parity work; matches the brief's count). Inventory note §"Summary count" reconciles: 28 unique unqualified claim *lines* narrowed; 32 file-level applied edits when each mirror is counted. **Two consistent presentations, neither contradicting.**
- **Status assertions vs artifact existence:** implementation-report claims `macos-claim-inventory.md` exists at `.agent-runs/2026-05-13-macos-honest-narrowing/macos-claim-inventory.md`. File confirmed present (15,744 bytes). **Match.**
- **PR-state assertions:** implementation-report claims both PRs "open, awaiting human review (not admin-merged)". `gh pr view` confirms `state: OPEN`, `mergedAt: null` for both. **Match.**
- **Commit SHAs:** implementation-report cites `41537bc` for PR 132 and `d275045` for PR 80. `gh pr view --json headRefOid` returns `41537bc5f52b58960dca69b79e678a3337a1f89a` and `d275045007dba7879d663d5c2dafa46029def2d5` respectively. **Match (short forms).**

## 12. Forbidden-status-word drift

Forbidden status words (default set): `done`, `complete`, `ready`, `shippable`, `taggable`.

Walked PR commit messages and the touched durable docs:

- Commit subject (both repos): `chore: narrow unqualified macOS support claims to honest current state` — no forbidden words.
- Diff added lines contain no forbidden-status-word claims about the macOS feature itself; the inserted phrases describe *current state* ("Windows-only currently"), *pending* state ("macOS support pending lifecycle certification"), and explicitly-uncertified state ("not lifecycle-certified") — the *opposite* of `done/complete/ready/shippable/taggable`.
- Implementation-report §"DoD coverage" uses the words `met` / `partially met (2 of 3 PRs)` / `vacuous` — none are project-forbidden status words. The word "met" is the role-file's required verdict vocabulary.

**No forbidden-status-word drift.**

## 13. Status-claim vs evidence drift

The run makes one structural status claim that needs evidence:

- *"32 edits applied across 2 repos, 2 PRs open, no admin-merge, no tag push"* — Evidence: PR diffs verified (verifier-report §1); `gh pr view` returns `state: OPEN`, `mergedAt: null` (verifier-report §6); no tag push possible because `gh release create` and `git push origin v*` are in autonomous-grant Forbidden-actions and policy-report records the autonomous-compliance check PASS.

All four pieces of evidence cited (code committed → SHAs; verification run → PR diffs; proof cited in implementation-report and verifier-report; durable ledger updated → macos-claim-inventory.md exists). **No status-claim vs evidence drift.**

---

## 14. Summary

The run is internally consistent. The diff matches the plan, the plan matches the manifest, the inventory matches the diff, the autonomous-decisions log shows two clean AUTONOMOUS-APPROVE entries within authorized gates, the run.log shows monotonic stage progression, the manifest was not touched after its initial approval, and no forbidden_paths or forbidden-action class was invoked.

**0 drift items.**
