# Implementation report — 2026-05-13-macos-honest-narrowing

Executor stage for run `2026-05-13-macos-honest-narrowing`. Documentation-only
sweep narrowing unqualified macOS support claims across two repos
(civicsuite umbrella, civicrecords-ai); civicclerk explicitly skipped per
plan §5 (zero in-scope unqualified claims). No code, test, schema, version,
or release-artifact changes.

---

## Pre-edit fact-forcing preamble

Per executor role file's binding pre-edit gate, for every file touched in
this run the following facts were verified before any edit was applied:

1. **Importers / callers.** The 9 touched files are all markdown / plain-text
   documentation surfaces (READMEs, USER-MANUALs, FAQ, installer contract,
   github-discussions-seed). They are not imported or invoked by any code;
   no symbol export, no module import, no CI rule reads them. The
   civicrecords-ai `README.md` is referenced from the umbrella
   `civicsuite/README.md:67` (FOIA module link) — the link target URL is
   unchanged.
2. **Public API affected.** None. These files describe the externally-
   advertised platform-support matrix. The "API" (the published claim) is
   narrowed from "Windows + macOS + Linux equally supported" to
   "Windows-only currently; macOS support pending lifecycle certification."
   No code interface, route, or CLI flag is affected.
3. **Data schema touched.** None. No DB rows, JSON payloads, manifest fields,
   or structured-log shapes are read or written by the edits. The only
   table edited is the `civicrecords-ai/USER-MANUAL.md` B.1 System
   Requirements markdown table (lines 254–260); its structure (3 columns ×
   5 data rows) is preserved verbatim per plan §3 Q2 resolution. Only the
   OS-row Minimum cell text and the Runtime-row Minimum cell text change.
4. **Manifest goal, verbatim:** "Sweep README, USER-MANUAL, FAQ, STATUS, and
   platform-matrix surfaces across the CivicSuite umbrella plus
   civicrecords-ai and civicclerk to replace unqualified macOS support
   claims with 'Windows-only currently; macOS support pending lifecycle
   certification,' honestly narrowing the published platform matrix to
   match actual lifecycle-certified support."

Per-file pre-edit verification was performed by reading each target file's
relevant line span and comparing it to the plan's verbatim before-string
before any Edit call. All 32 edit operations matched the plan's expected
before-state on first attempt; no plan-vs-file mismatches were encountered.

---

## Per-repo summary

### Repo A — `CivicSuite/civicsuite` (umbrella)

| | |
|---|---|
| Branch | `chore/macos-honest-narrowing` |
| Base | `main` |
| Files changed | 4 (`README.md`, `USER-MANUAL.md`, `FAQ.md`, `installer/README.md`) |
| Edits applied | 9 (plan edit-ids A.1.1–A.4.2) |
| Lines added | 14 |
| Lines removed | 10 |
| Commit SHA | `41537bc` |
| Commit subject | `chore: narrow unqualified macOS support claims to honest current state` |
| PR URL | <https://github.com/CivicSuite/civicsuite/pull/132> |
| PR state | open, awaiting human review (not admin-merged) |

### Repo B — `CivicSuite/civicrecords-ai`

| | |
|---|---|
| Branch | `chore/macos-honest-narrowing` |
| Base | `master` (this repo's actual default branch; the manifest used "main" generically) |
| Files changed | 5 (`README.md`, `README.txt`, `USER-MANUAL.md`, `USER-MANUAL.txt`, `docs/github-discussions-seed.md`) |
| Edits applied | 23 (plan edit-ids B.1.1–B.5.3; .txt mirrors counted individually) |
| Lines added | 23 |
| Lines removed | 23 |
| Commit SHA | `d275045` |
| Commit subject | `chore: narrow unqualified macOS support claims to honest current state` |
| PR URL | <https://github.com/CivicSuite/civicrecords-ai/pull/80> |
| PR state | open, awaiting human review (not admin-merged) |

Note on base branch: the civicrecords-ai default branch is `master`, not
`main`. The manifest and the executor task instructions referred to "main"
generically; the actual default branch was verified via
`git remote show origin` (`HEAD branch: master`) and the PR was opened
against the real default. This is a naming reconciliation, not a deviation
from the manifest's intent.

### Repo C — `CivicSuite/civicclerk` — SKIPPED

No branch opened, no PR opened, no edits made. Per plan §5 Repo C
("civicclerk untouched — zero in-scope edits") and §9 (Definition-of-done
mapping note "this plan opens 2 PRs, not 3"). Research §1 and §2 confirmed
every macOS-bearing line in civicclerk's allowed-path files is an
OPERATIONAL/SHELL NOTE describing where the bash rehearsal helpers can run
("Bash on Linux, macOS, or Git Bash"); none is a published platform-support
promise. Opening an empty PR would not advance the manifest's goal of
"honest narrowing of unqualified claims."

This deviation from `expected_outputs` line 3 (which anticipated a
civicclerk PR) was authorized by the planner with explicit rationale in
plan §5 Repo C, and is acknowledged here for the human merge reviewer.

---

## Inventory verification — every in-scope claim addressed

Cross-referenced research.md §2 (per-file claim catalog) and §5 (director
note b "Definitely edit" list) against the edits actually applied:

### civicsuite (umbrella)

| Research-listed unqualified claim | Plan edit-id | Applied? |
|---|---|---|
| `USER-MANUAL.md:50` Docker Desktop bullet | A.2.1 | yes |
| `USER-MANUAL.md:63` Install (Linux / macOS) heading + bash block (lines 63–69) | A.2.2 | yes |
| `FAQ.md:29` Docker Desktop bullet | A.3.2 | yes |
| `installer/README.md:19–21` Required Outcome platform list | A.4.1 | yes |
| `installer/README.md:39` Baseline Dependencies bullet | A.4.2 | yes |
| `README.md:57` (Q1 harmonization — already-qualified line) | A.1.1 | yes |
| `README.md:61` (Q1 harmonization) | A.1.2 | yes |
| `README.md:67` (unqualified-claim replacement) | A.1.3 | yes |
| `FAQ.md:23` (Q1 harmonization) | A.3.1 | yes |

### civicrecords-ai

| Research-listed unqualified claim | Plan edit-id | Applied? |
|---|---|---|
| `README.md:36` Requirements Docker Desktop | B.1.1 | yes |
| `README.md:46` Script-based install paragraph | B.1.2 | yes |
| `README.md:62` `**macOS / Linux:**` heading | B.1.3 | yes |
| `README.md:179` Supported Platforms macOS bullet | B.1.4 | yes |
| `README.txt:36, 46, 62, 179` (mirror of README.md) | B.2.1–B.2.4 | yes |
| `USER-MANUAL.md:259` B.1 table OS row | B.3.1 | yes |
| `USER-MANUAL.md:260` B.1 table Runtime row | B.3.2 | yes |
| `USER-MANUAL.md:277` Script-based install paragraph | B.3.3 | yes |
| `USER-MANUAL.md:279` Cross-platform parity callout (Q1 harmonization) | B.3.4 | yes |
| `USER-MANUAL.md:283` Docker Desktop prerequisite | B.3.5 | yes |
| `USER-MANUAL.md:297` `**macOS / Linux:**` heading | B.3.6 | yes |
| `USER-MANUAL.txt:259, 260, 277, 279, 283, 297` (mirror of USER-MANUAL.md) | B.4.1–B.4.6 | yes |
| `docs/github-discussions-seed.md:70` "one command on Windows, macOS, or Linux" | B.5.1 | yes |
| `docs/github-discussions-seed.md:90` Docker Desktop bullet | B.5.2 | yes |
| `docs/github-discussions-seed.md:102` `*Linux / macOS:*` heading | B.5.3 | yes |

**No in-scope unqualified claim was deferred.** Every entry in research §5's
"Definitely edit" list and every entry in plan §2's per-file edit plan was
applied at the line specified, with the verbatim before/after strings
specified.

### Out-of-scope items confirmed not touched

Per plan §2 explicit decisions:

- `civicclerk/**` — zero edits (entire repo skipped).
- `civicsuite/docs/installer/*.md` — already honest engineering checkpoints;
  not touched.
- `civicrecords-ai/docs/UNIFIED-SPEC.md` — every line already qualified;
  not touched.
- `civicrecords-ai/docs/deprecated/*.md` — SUPERSEDED/RETRACTED banners are
  the qualifier; not touched.
- `civicrecords-ai/docs/browser-qa-*.md` — QA evidence of rendered DOM;
  editing would falsify evidence; not touched.
- `civicrecords-ai/docs/REMEDIATION-PLAN-2026-04-19.md:427` — flagged
  AMBIGUOUS by research §2 and explicitly left alone by plan §7
  follow-up note.

---

## Allowed-paths compliance check

For each file edited:

| Repo | File | Matches allowed_paths entry |
|---|---|---|
| civicsuite | `README.md` | `README.md` |
| civicsuite | `USER-MANUAL.md` | `USER-MANUAL.md` |
| civicsuite | `FAQ.md` | `FAQ.md` |
| civicsuite | `installer/README.md` | `installer/README.md` |
| civicrecords-ai | `README.md` | `README.md` |
| civicrecords-ai | `README.txt` | `README.txt` |
| civicrecords-ai | `USER-MANUAL.md` | `USER-MANUAL.md` |
| civicrecords-ai | `USER-MANUAL.txt` | `USER-MANUAL.txt` |
| civicrecords-ai | `docs/github-discussions-seed.md` | `docs/**/*.md` |

No edited file matches any `forbidden_paths` glob. The forbidden lists
explicitly exclude `docs/adr/**`, `docs/audits/**`, `docs/qa/**`,
`docs/evidence/**`, `docs/release-lockstep/**`,
`docs/release-recovery-status.md`, `installer/generated/**`, `tests/**`,
`scripts/**`, `.github/workflows/**`, `**/pyproject.toml`,
`**/package.json`, `**/_version.py`, `CHANGELOG.md`, FROZEN-EVIDENCE*,
SHAPE-GUARD*, and all `*.docx`/`*.pdf`/`*.png` binaries — none of which
were touched. The civicsuite umbrella has two untracked-but-not-committed
items under `.agent-workflows/autonomous-grants/` and
`.agent-workflows/autonomous-grants-ledger.md`; these are pre-existing
working-tree items outside the editor's scope and are NOT included in the
commit (verified via `git diff --name-only` after staging — only the 4
edited files were staged).

---

## Cross-repo consistency check — canonical phrase verbatim

The canonical phrase **`Windows-only currently; macOS support pending lifecycle certification.`** appears verbatim (with terminal period) as a standalone sentence in the following edited surfaces:

- `civicsuite/README.md` L57 (A.1.1)
- `civicsuite/FAQ.md` L23 (A.3.1)
- `civicsuite/USER-MANUAL.md` L65 (the inserted paragraph under the renamed Install heading, edit A.2.2)
- `civicrecords-ai/README.md` L46 (B.1.2)
- `civicrecords-ai/README.txt` L46 (B.2.2)
- `civicrecords-ai/USER-MANUAL.md` L277 (B.3.3)
- `civicrecords-ai/USER-MANUAL.md` L279 (B.3.4)
- `civicrecords-ai/USER-MANUAL.txt` L277 (B.4.3)
- `civicrecords-ai/USER-MANUAL.txt` L279 (B.4.4)
- `civicrecords-ai/USER-MANUAL.md` L259 (B.3.1, table cell embedded)
- `civicrecords-ai/USER-MANUAL.txt` L259 (B.4.1, table cell embedded)

The five documented variants in plan §4 (parenthetical inline,
em-dash trailing, italicized heading, cell-value, section-name
continuation) appear where surrounding sentence structure required them.
Each is a "clearly-scoped equivalent" per definition_of_done clause (1).

No surface uses a contradicting wording. Specifically:

- Both repos' Docker Desktop prereq bullets use the parenthetical inline
  form ("(Docker Desktop on macOS 13+ runs the script path but is not
  lifecycle-certified)").
- All three bare `**macOS / Linux:**` / `*Linux / macOS:*` headings (one in
  civicrecords-ai README.md, one in USER-MANUAL.md, one in
  github-discussions-seed.md) use the same italicized-heading form,
  with cross-references to "Supported Platforms"/"B.1 System
  Requirements" respectively (whichever is the canonical platform
  matrix in that file).
- The umbrella `README.md:67` (civicrecords-ai install path summary)
  and the records-ai surfaces both frame the script path as
  "not lifecycle-certified", matching wording.

---

## Definition-of-done coverage

| DoD clause | Status | Evidence |
|---|---|---|
| (1) Every unqualified macOS support claim … replaced with canonical phrase or clearly-scoped equivalent | met | 32 edits applied; inventory above; no in-scope claim deferred |
| (2) Changed claims consistent across all touched surfaces, no surface contradicts another | met | Cross-repo consistency check above; canonical phrase verbatim in 11 surfaces; 5 documented variants used where structure required, all derivative of the canonical sentence |
| (3) .txt mirrors match .md counterparts where both exist | met | B.2.1–B.2.4 (README.txt) and B.4.1–B.4.6 (USER-MANUAL.txt) applied identical text at the same line numbers as B.1.1–B.1.4 and B.3.1–B.3.6 respectively |
| (4) Pre-existing test suites still pass with no code changes | met (vacuous) | Zero code files touched. No test under `tests/**` modified. Test outcome cannot move because no executable surface was changed. |
| (5) One PR opened per repo, none admin-merged, awaiting human merge | partially met (2 of 3 PRs; civicclerk skipped per plan §5) | civicsuite PR #132 open; civicrecords-ai PR #80 open; both `OPEN` state with no admin-merge attempted; civicclerk explicitly skipped with planner rationale |
| (6) `macos-claim-inventory.md` captures every edited line with before/after | met | `.agent-runs/2026-05-13-macos-honest-narrowing/macos-claim-inventory.md` (this directory) |

---

## Hard-constraint compliance (autonomous grant Forbidden-actions)

| Action | Performed? |
|---|---|
| `gh pr merge --admin` | NO |
| `gh pr merge` (any form) | NO |
| `git push origin v*` / `git push --tags` | NO |
| `git push --force` / `git push -f` | NO |
| `gh release create` | NO |
| Edit any path outside per-repo allowed_paths | NO |
| Edit any path inside per-repo forbidden_paths | NO |

All commands executed in this stage are recorded in the harness transcript.
`check_autonomous_compliance.py` at the policy stage will see two
non-admin-merged `OPEN` PRs and clean allowed-paths compliance.

---

## Deviations from plan

1. **civicrecords-ai PR opened against `master`, not `main`.** The plan
   §5 Repo B and the manifest's narrative used the name "main"
   generically. The repo's actual default branch is `master`. The PR was
   opened against the real default branch. This is a branch-name
   reconciliation, not a content deviation.

2. **civicclerk PR not opened.** Plan §5 Repo C explicitly authorized this
   skip with full rationale (zero in-scope unqualified claims; opening an
   empty PR would not advance the manifest goal). The deviation is from
   `expected_outputs` line 3 of the manifest, and is documented in plan
   §9 (Definition-of-done mapping clause 5: "this plan opens 2 PRs, not
   3") and the inventory's "Repo C — civicclerk: SKIPPED" section.

3. **Commit author configured per-invocation, not via `git config`.**
   The host had no `git config user.{name,email}`. Per safety protocol
   ("NEVER update the git config"), commits were created with
   `git -c user.name=… -c user.email=…` flags (per-invocation, not
   persistent). Author recorded as `scottconverse
   <scottconverse@users.noreply.github.com>` — the GitHub-noreply form
   matches the active gh CLI identity. No `~/.gitconfig` or per-repo
   `.git/config` was modified. This was unavoidable to create commits at
   all; flagged here so the verifier can audit.

No other deviations.

---

## Return string

`Executor: 32 edits across 2 repos, 2 PRs opened (https://github.com/CivicSuite/civicsuite/pull/132, https://github.com/CivicSuite/civicrecords-ai/pull/80), commit shas 41537bc, d275045, no admin-merge, no tag push. macos-claim-inventory.md written.`
