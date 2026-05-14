# Critic Report — 2026-05-13-macos-honest-narrowing

**Verdict:** PASS
**Open items:** 0 blockers; 3 cleanup (non-blocker, suggest-only)
**Generated:** 2026-05-13T22:35Z

**Findings: 3 total, 0 blocker, 0 critical, 0 major, 3 minor**

## 1. Headline

No blocking findings. Three minor cleanup observations are surfaceable for follow-up but do not block PR merge.

---

## 2. Blocker findings

None.

## 3. Critical findings

None.

## 4. Major findings

None.

## 5. Minor findings (Cleanup — suggestable, not blocking)

### M1. Docker-Desktop-on-macOS phrasing is awkwardly self-referential

- **Path:** `C:\Users\scott\dev\civicsuite\installer\README.md:39` (also similar shape in civicrecords-ai/README.md:36, civicrecords-ai/USER-MANUAL.md:283, civicsuite/USER-MANUAL.md:50).
- **Final text:** `Docker Desktop on Windows (lifecycle-certified) or macOS (Windows-only currently; macOS support pending lifecycle certification), or Docker Engine on Linux.`
- **Issue:** The line asserts "Docker Desktop on macOS (Windows-only currently…)" — i.e. "macOS… Windows-only." A reader who parses this strictly sees a contradiction inside the parenthetical. The intent is "Docker Desktop ships for both Windows and macOS, but only the Windows side is lifecycle-certified for us." A cleaner phrasing would be: `Docker Desktop on Windows (lifecycle-certified) or macOS (uncertified — see "Supported Platforms"), or Docker Engine on Linux.` This preserves the canonical-phrase use elsewhere (e.g., the Supported Platforms bullet) without forcing the contradictory inline form.
- **Recommended destination:** `next-cleanup.md`. Not a blocker because the inline form is documented as variant #1 in plan §4 and the reader can recover meaning from context; but the variant is the *weakest* of the five plan §4 variants from a UX standpoint.

### M2. B.1 table OS-row Minimum cell is dense to parse

- **Path:** `C:\Users\scott\dev\civicrecords-ai\USER-MANUAL.md:259` (and `.txt` mirror line 259).
- **Final text:** `| OS | Windows 10/11 (lifecycle-certified). macOS 13+, Ubuntu 22.04+, Debian 12+ on script path (not lifecycle-certified) — Windows-only currently; macOS support pending lifecycle certification. | Ubuntu 22.04 LTS |`
- **Issue:** Three structural ideas are stacked in one table cell: (a) Windows = certified, (b) three other OSes on script path = not certified, (c) macOS-specific canonical phrase. A reader scanning the table sees a long run-on sentence in a small cell. Crucially, the cell *equates* macOS-and-Ubuntu-and-Debian under "not lifecycle-certified" then *singles out* macOS for "pending lifecycle certification" — which is consistent with the run's goal but reads oddly because Linux is also script-path-only and the table doesn't say what its lifecycle posture is. The plan §3 Q2 resolution chose this form deliberately to minimize blast radius into table structure; that trade-off is documented. Cleanup option: split the OS row into two rows (one for certified, one for script-path) on a future release pass.
- **Recommended destination:** `next-cleanup.md`. Not a blocker because table *structure* preservation was an explicit Q2 resolution per plan §1 and §3, and the resulting cell is still factually accurate.

### M3. Mojibake on civicsuite/README.md:67 preserved by design but visible in published claim

- **Path:** `C:\Users\scott\dev\civicsuite\README.md:67`.
- **Final text:** `- FOIA / public records: <https://github.com/CivicSuite/civicrecords-ai> â€" Windows-only currently; macOS support pending lifecycle certification. macOS and Linux operators may use the `install.sh` script path, which is not lifecycle-certified.`
- **Issue:** The `â€"` (mojibake for em-dash) was pre-existing and the plan §7 explicitly chose to preserve it because the manifest's scope is macOS-claim narrowing only, not text-encoding cleanup. The implementation-report and plan both record this decision. This *is the correct call* under the manifest contract; it's noted here only so the manager and human merger have the artifact-level evidence trail. A separate follow-up to fix the encoding would be appropriate after this PR lands.
- **Recommended destination:** `next-cleanup.md` (separate one-line PR after merge).

---

## 6. (No subsections § 6 needed — minor findings exhausted in §5.)

---

## 7. Adversarial lenses

### Engineering lens

This is a documentation-only run. No source code, no test code, no schemas, no CI workflows, no config files. The only "engineering" content to inspect is the *wording precision* of the canonical replacement phrase.

- **Canonical phrase:** `Windows-only currently; macOS support pending lifecycle certification.`
- **Wording precision:** "Windows-only currently" is a strong, falsifiable claim about the present state. "macOS support pending lifecycle certification" names a specific, named gate ("lifecycle certification") that distinguishes this from vague hedges like "macOS in beta" or "macOS coming soon." The qualifier *is* meaningful, not hand-wavy: lifecycle certification is the same gate referenced in `civicsuite/docs/installer/suite-installer-plan.md` (`If macOS remains beta/YELLOW...`) and the umbrella's release-recovery infrastructure.
- **Could it be misread?** Edge case: "Windows-only currently" could be read as "no other OS works at all" rather than "no other OS is *lifecycle-certified*." The plan acknowledges this and pairs the canonical phrase with explicit "script path, not lifecycle-certified" qualifiers everywhere a script path is described. Net: the wording is durable and survives literal reading.
- **No findings against this lens.** Engineering checked: canonical phrase used verbatim or in five documented variants (plan §4); no app code touched (forbidden_paths exclusion); no security vector, race condition, or N+1 query relevant to a docs change.

### UX lens

I read three randomly chosen changed files cold as a fresh user:

**File 1: `civicsuite/FAQ.md` (lines 19–34, around edit A.3.1 + A.3.2).**

Impression: clear. The phrasing "supports the clerk-core profile on Windows and Linux. Windows-only currently; macOS support pending lifecycle certification." is a clean two-sentence pivot — first sentence asserts the certified surface (Windows + Linux on the suite installer), second sentence narrows the user-facing claim. The Docker Desktop bullet at L29 is the variant #1 form ("...Windows-only currently; macOS support pending lifecycle certification (Docker Desktop on macOS 13+ runs the script path but is not lifecycle-certified)"), which is denser but still parseable.

**File 2: `civicrecords-ai/USER-MANUAL.md` lines 252–300 (around the B.1 table + B.2 install block).**

Impression: B.2 install block is clear after the edits. B.1 table cell (line 259) is dense — see M2 above. The user reading top-down sees: (a) System Requirements table → macOS is "not lifecycle-certified" inside the OS row's Minimum cell, (b) Cross-platform parity callout → canonical phrase + "no native installer ships", (c) Script-based install heading → canonical phrase + "not lifecycle-certified". Three reinforcing assertions of the same narrowed claim. Reader comes away with the correct understanding.

**File 3: `civicsuite/installer/README.md` lines 15–47 (Required Outcome + Baseline Dependencies).**

Impression: Required Outcome list (lines 19–21) is clear after edit A.4.1 — Windows tagged "lifecycle-certified target", macOS tagged with the canonical phrase via em-dash trailing form, Linux unchanged. Baseline Dependencies line 39 has the awkward "Docker Desktop on Windows (lifecycle-certified) or macOS (Windows-only currently; macOS support pending lifecycle certification)" — see M1 above.

**Net UX verdict:** All three files communicate the correct narrowed claim to a fresh reader. Two cells/lines are denser than ideal but factually correct; flagged as M1/M2.

### Tests lens

Docs-only run; no new tests added. The manifest's DoD clause (4) asserts test outcome cannot move (structural argument: no test surface touched, see verifier-report §5). Per role-file Tests-lens question for docs-only runs:

- **Markdown-link-check infrastructure:** Spot-checked the changed files for new links — none introduced; existing links preserved verbatim (e.g., `docker.com/get-started`, `https://github.com/CivicSuite/civicrecords-ai#install`, `installer/windows/README.md`). No link-target change → existing markdown-link CI (if any) cannot break on this PR.
- **Doc-CI surface to catch future divergence:** The civicsuite umbrella's `scripts/policy/` includes `check_manifest_schema.py`, `check_allowed_paths.py`, `check_no_todos.py`, `check_adr_gate.py` — none of these checks the *claim-text consistency* across surfaces. A follow-up would be useful: a small CI step that asserts the canonical phrase, once adopted, must appear in any file that contains "macOS" in a platform-support context. Recommend as a v0.5.2-ish hardening, not blocking this run.
- **No findings against this lens for this run.** The structural argument (no test surface touched → no test outcome can move) is sound; tests-passed criterion is met deductively.

### Docs lens

Cross-checked the 9 changed files for internal consistency:

- **Canonical phrase appearance across surfaces:** Verified in 11+ places (see verifier-report §3). No surface contradicts another.
- **.txt mirror parity:** civicrecords-ai/README.txt diff hunks at lines 36/46/62/179 are byte-identical (modulo absent diff suppression) to README.md at the same lines. Same for USER-MANUAL.txt vs USER-MANUAL.md at lines 259/260/277/279/283/297. (Confirmed via the PR 80 diff which shows the same hunk applied twice.) **Match.**
- **CHANGELOG:** Correctly absent (`CHANGELOG.md` ∈ forbidden_paths; non_goal #4 forbids).
- **Status-word abuse:** none of the changed surfaces uses `done` / `complete` / `ready` / `shippable` / `taggable` about the macOS feature. The opposite — explicit "not lifecycle-certified" / "pending lifecycle certification" — is what's written.
- **Plain-text mirrors in civicsuite umbrella:** civicsuite has `USER-MANUAL.txt` (no macOS content — verified grep returns zero hits) and `README.txt` (a different, shorter document, not a full mirror — also zero macOS hits). No parity work needed.
- **No findings against this lens** beyond the three minor cleanup items in §5.

### QA lens

Cross-file contradiction check across nearby surfaces:

- `civicsuite/docs/installer/suite-installer-plan.md` — pre-existing macOS lines ("If macOS remains beta/YELLOW...", "macOS launcher: shell script first, signed app/pkg later", "Windows and macOS full lifecycle certification still...") are *already honest* and use compatible language. Pre-existing and not in scope; not edited; **not in contradiction with this PR's canonical phrase.**
- `civicsuite/docs/installer/civicgrants-v1-installer-integration-evidence-2026-05-09.md:56` — pre-existing line "unresolved macOS lifecycle certification" matches the canonical-phrase posture exactly. **Not in contradiction.**
- `civicsuite/docs/release-recovery-status.md` — in forbidden_paths; the implementation-report correctly did not touch it. Grep of this file for macOS strings returns 0 hits, so there's no inherited stale claim to chain into. **Not in contradiction.**
- `civicclerk/README.md` — every macOS reference is shell-portability-only ("Bash on Linux, macOS, or Git Bash"). Plan §5 Repo C SKIP is **the correct call**. Editing these would falsify the operational description. **Not in contradiction.**
- Civicrecords-ai inventory of un-edited docs: `docs/UNIFIED-SPEC.md` lines 74/430/865/984-986/1002 — each uses qualified language ("script path only", "follow-on, not shipped", "unsigned by design"). Plan §7 leaves them alone as "follow-up, not this run." Spot-check: none asserts "macOS supported" without qualifier. **Not in contradiction.**

- **No findings against this lens.** The blast radius is contained. No chained inconsistency.

### Scope lens

- **allowed_paths:** verified — 4 + 5 = 9 changed files, all match per-repo allowed_paths globs (see verifier-report §2).
- **forbidden_paths:** verified — zero hits (see drift-report §6).
- **non_goals drift:** none. No app-code change (non-goal #1 ✓), no version bump (non-goal #2 ✓), no release artifact (non-goal #3 ✓), no CHANGELOG edit (non-goal #4 ✓), no CI/workflow change (non-goal #5 ✓), no release-lockstep/QA/evidence file (non-goal #6 ✓), no FROZEN-EVIDENCE/SHAPE-GUARD edit (non-goal #7 ✓), no installer/generated regeneration (non-goal #8 ✓), no binary edits (non-goal #9 ✓), no admin-merge (non-goal #10 ✓; verifier-report §6 confirms), no released-module retag (non-goal #11 ✓).
- **No findings against this lens.**

---

## 8. What the verifier might have missed

Verifier-report says all six DoD clauses MET (one marked vacuously for clause 4). I independently re-checked each:

- **Clause 1 (every unqualified claim narrowed):** I cross-referenced research §5 ("Definitely edit" list) and plan §2 (per-file edit plan) against the PR diffs — every entry is in the diff. **Confirmed.**
- **Clause 2 (cross-surface consistency):** I spot-read three random surfaces (FAQ, USER-MANUAL, installer/README) for fresh-user impression — all three communicate the same narrowed claim. **Confirmed.**
- **Clause 3 (.txt mirrors):** I confirmed the PR 80 diff applies identical hunks to README.md and README.txt, USER-MANUAL.md and USER-MANUAL.txt. **Confirmed.**
- **Clause 4 (tests):** structural argument (no test path touched) is sound. **Confirmed.**
- **Clause 5 (PRs open, none admin-merged):** `gh pr view` returns `state: OPEN, mergedAt: null` for both. civicclerk SKIP is documented in plan, implementation-report, and inventory; the deviation is recorded so the human merge reviewer sees it. **Confirmed.**
- **Clause 6 (inventory artifact):** I read `macos-claim-inventory.md`. Every individual edit-id A.1.1–A.4.2 and B.1.1–B.5.3 has verbatim before/after; mirror groups B.2.x and B.4.x are listed as parity references back to their .md counterparts. A pedantic reading would count this as a slight presentation gap (the .txt mirrors aren't quoted individually) but the reviewer can audit the parity claim by reading the .md entry — the wording is verbatim identical. **Confirmed.**

**Verifier findings independently confirmed.** I disagree with no verdict in verifier-report. The verifier did not call the UX-density issues (M1, M2) but those are critic-lens cleanup, not exit-criteria.

---

## 9. What the judge missed

No `judge-log.yaml` is present in this run's `.agent-runs/` directory. This pipeline did not run a v0.4 judge layer (autonomous mode v1.2.1 used grant-gated autonomous-decisions.md in lieu of per-action judge entries). N/A.

---

## 10. Recommended manager verdict

**PROMOTE.**

The run is internally consistent (drift-report 0 items), structurally sound (verifier-report 0 open), and the three minor cleanup observations (M1, M2, M3) are non-blocking and recommend-able to `next-cleanup.md`. The manifest's `definition_of_done` is honestly clearable as written (with the planner-authorized civicclerk SKIP documented in plan §5, implementation-report §"Deviations", and macos-claim-inventory.md "Repo C — civicclerk: SKIPPED").

The autonomous grant's Forbidden-actions clause was respected — both PRs sit OPEN/MERGEABLE/null mergedAt awaiting human merge. The manager-gate is PROMOTE-only per the grant, and that's what this report recommends.

No blockers exist. Promote.
