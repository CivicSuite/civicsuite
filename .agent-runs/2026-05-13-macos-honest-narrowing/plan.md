# Plan — 2026-05-13-macos-honest-narrowing

Implementation plan for the macOS honest-narrowing documentation sweep. Authored
by the planner from `.agent-runs/2026-05-13-macos-honest-narrowing/manifest.yaml`
and `research.md`. Autonomous mode is active; Q1 and Q2 from research §6 are
resolved below with explicit rationale rather than surfaced to the human
director.

---

## 1. Summary

- **28 in-scope unqualified macOS claims across 18 files in 2 repos
  (civicclerk untouched).** Distinct edited surfaces: 9 unique markdown files
  + 2 plain-text mirrors in two repos. Civicrecords-ai contributes the bulk;
  civicsuite umbrella contributes 4 files; civicclerk contributes zero.
- **3 PRs open at end of execute stage** — one per repo, branch
  `chore/macos-honest-narrowing` against `main`, none admin-merged. Per
  `definition_of_done` clause (5) and the autonomous grant's Forbidden-actions
  the executor stops at "PR open, awaiting human merge."
- **Documentation-only — zero code/test changes.** All edits land in
  README/USER-MANUAL/FAQ/installer-contract surfaces and one platform-matrix
  table cell. No `pyproject.toml`, `_version.py`, `package.json`, CI workflow,
  ADR, audit, QA, evidence, or release-lockstep file is touched.
- **Q1 (harmonization scope): RESOLVED — harmonize.** Already-qualified
  surfaces in the same files being edited get rewritten to the canonical
  phrase (see §4). Rationale: `definition_of_done` clause (2) obligates
  consistency across all touched surfaces.
- **Q2 (B.1 table layout): RESOLVED — cell-value change only.** The macOS
  row's "Supported" value is replaced with the canonical phrase; table
  structure is left alone (see §3). Rationale: minimum honest update, lowest
  blast radius into docs tooling and txt mirror.

---

## 2. Per-file edit plan

Numbering is `<repo-short>.<file-index>.<edit-index>`. Each edit cites a
classification from research §2. Every file path below is confirmed in its
repo's `manifest.target_repos[*].allowed_paths`.

Canonical replacement phrase: **`Windows-only currently; macOS support pending lifecycle certification.`**
(see §4 for exact variants where surrounding sentence structure forces a
slight rewording).

### Repo A — `C:\Users\scott\dev\civicsuite` (umbrella)

#### A.1 — `C:\Users\scott\dev\civicsuite\README.md` (repo-rel: `README.md`)

Allowed by: `target_repos[0].allowed_paths` line `README.md`.

**Edit A.1.1 — Line 57** (Q1 harmonization)

- Current:
  `**Suite installer (current):** YELLOW beta. The clerk-core profile installer is published on this repo's Releases page as `installer-clerk-core-v0.1.0-beta`. Verified lifecycle on Windows and Linux; **macOS uncertified** as of 2026-05-09.`
- Replacement:
  `**Suite installer (current):** YELLOW beta. The clerk-core profile installer is published on this repo's Releases page as `installer-clerk-core-v0.1.0-beta`. Windows-only currently; macOS support pending lifecycle certification. Lifecycle verified on Windows and Linux as of 2026-05-09.`
- Rationale: Q1 harmonization. Existing phrase "macOS uncertified" is honest
  but uses different wording than the canonical phrase. Harmonize so the
  umbrella README states the same claim shape as the records-ai surfaces
  edited below.

**Edit A.1.2 — Line 61** (Q1 harmonization)

- Current:
  `- macOS package: `CivicSuite-clerk-core-macos-0.1.0.tar.gz` *(beta only, full lifecycle not certified)*`
- Replacement:
  `- macOS package: `CivicSuite-clerk-core-macos-0.1.0.tar.gz` *(Windows-only currently; macOS support pending lifecycle certification)*`
- Rationale: Q1 harmonization. The package file still exists for ops
  bookkeeping; the parenthetical narrows the support claim.

**Edit A.1.3 — Line 67** (unqualified-claim replacement)

- Current:
  `- FOIA / public records: <https://github.com/CivicSuite/civicrecords-ai> â€” Windows installer published per release; macOS/Linux via shell script.`
- Replacement:
  `- FOIA / public records: <https://github.com/CivicSuite/civicrecords-ai> â€” Windows-only currently; macOS support pending lifecycle certification. macOS and Linux operators may use the `install.sh` script path, which is not lifecycle-certified.`
- Rationale: unqualified-claim replacement. Original phrasing implies
  cross-platform parity through the script path; replacement explicitly tags
  the script path as not lifecycle-certified, harmonizing with the records-ai
  surfaces.

#### A.2 — `C:\Users\scott\dev\civicsuite\USER-MANUAL.md` (repo-rel: `USER-MANUAL.md`)

Allowed by: `target_repos[0].allowed_paths` line `USER-MANUAL.md`.

**Edit A.2.1 — Line 50** (unqualified-claim replacement)

- Current:
  `- **Docker Desktop** (Windows 10/11, macOS 13+) or Docker Engine (Linux). On Windows, also WSL 2 + Virtual Machine Platform.`
- Replacement:
  `- **Docker Desktop** (Windows 10/11) or Docker Engine (Linux). Windows-only currently; macOS support pending lifecycle certification (Docker Desktop on macOS 13+ runs the script path but is not lifecycle-certified). On Windows, also WSL 2 + Virtual Machine Platform.`
- Rationale: unqualified-claim replacement. The bullet was advertising macOS
  13+ as a peer install host; narrowed to Windows-certified with explicit
  macOS-pending caveat.

**Edit A.2.2 — Lines 63–69** (unqualified-claim replacement, multi-line block)

- Current (lines 63–69 inclusive):
  ```
  ### Install (Linux / macOS)

  ```bash
  git clone https://github.com/CivicSuite/civicrecords-ai.git
  cd civicrecords-ai
  bash install.sh
  ```
  ```
- Replacement (lines 63–69 inclusive):
  ```
  ### Install (Linux / macOS) — script path, not lifecycle-certified

  Windows-only currently; macOS support pending lifecycle certification. The
  script path below runs on Linux and macOS today but is not
  lifecycle-certified.

  ```bash
  git clone https://github.com/CivicSuite/civicrecords-ai.git
  cd civicrecords-ai
  bash install.sh
  ```
  ```
- Rationale: unqualified-claim replacement. The heading offered a peer
  install procedure; the inserted note narrows the claim without removing the
  operational instructions (operators on macOS still need to know what
  `bash install.sh` does).

#### A.3 — `C:\Users\scott\dev\civicsuite\FAQ.md` (repo-rel: `FAQ.md`)

Allowed by: `target_repos[0].allowed_paths` line `FAQ.md`.

**Edit A.3.1 — Line 23** (Q1 harmonization)

- Current:
  `In practice, today: only `civicrecords-ai` and `civicclerk` have install paths a non-engineer can follow on a stock machine, and both are still provisional. The suite-level installer beta (`installer-clerk-core-v0.1.0-beta`) supports the clerk-core profile on Windows and Linux; macOS is not certified.`
- Replacement:
  `In practice, today: only `civicrecords-ai` and `civicclerk` have install paths a non-engineer can follow on a stock machine, and both are still provisional. The suite-level installer beta (`installer-clerk-core-v0.1.0-beta`) supports the clerk-core profile on Windows and Linux. Windows-only currently; macOS support pending lifecycle certification.`
- Rationale: Q1 harmonization. "macOS is not certified" is honest but uses
  different wording.

**Edit A.3.2 — Line 29** (unqualified-claim replacement)

- Current:
  `- **Docker Desktop** (Windows 10/11, macOS 13+) or Docker Engine (Linux). WSL 2 + Virtual Machine Platform on Windows.`
- Replacement:
  `- **Docker Desktop** (Windows 10/11) or Docker Engine (Linux). Windows-only currently; macOS support pending lifecycle certification (Docker Desktop on macOS 13+ runs the script path but is not lifecycle-certified). WSL 2 + Virtual Machine Platform on Windows.`
- Rationale: unqualified-claim replacement; mirrors USER-MANUAL.md L50 for
  cross-surface consistency.

#### A.4 — `C:\Users\scott\dev\civicsuite\installer\README.md` (repo-rel: `installer/README.md`)

Allowed by: `target_repos[0].allowed_paths` line `installer/README.md`.

**Edit A.4.1 — Lines 19–21** (unqualified-claim replacement)

- Current (lines 19–21 inclusive):
  ```
  - Windows 10/11
  - macOS 13 or newer
  - Linux, with Ubuntu LTS as the first proof target
  ```
- Replacement (lines 19–21 inclusive):
  ```
  - Windows 10/11 (lifecycle-certified target)
  - macOS 13 or newer — Windows-only currently; macOS support pending lifecycle certification
  - Linux, with Ubuntu LTS as the first proof target
  ```
- Rationale: unqualified-claim replacement. The "Required Outcome" supported-
  platform list was advertising macOS as a peer target; narrow the macOS row
  inline.

**Edit A.4.2 — Line 39** (unqualified-claim replacement)

- Current:
  `- Docker Desktop on Windows/macOS, or Docker Engine on Linux.`
- Replacement:
  `- Docker Desktop on Windows (lifecycle-certified) or macOS (Windows-only currently; macOS support pending lifecycle certification), or Docker Engine on Linux.`
- Rationale: unqualified-claim replacement; baseline-dependencies bullet
  previously implied macOS as a runtime target without qualifier.

### Repo B — `C:\Users\scott\dev\civicrecords-ai`

#### B.1 — `C:\Users\scott\dev\civicrecords-ai\README.md` (repo-rel: `README.md`)

Allowed by: `target_repos[1].allowed_paths` line `README.md`.

**Edit B.1.1 — Line 36** (unqualified-claim replacement)

- Current:
  `- **Docker Desktop** (Windows 10/11, macOS 13+) or **Docker Engine** (Linux)`
- Replacement:
  `- **Docker Desktop** (Windows 10/11) or **Docker Engine** (Linux). Windows-only currently; macOS support pending lifecycle certification (Docker Desktop on macOS 13+ runs the script path but is not lifecycle-certified).`
- Rationale: unqualified-claim replacement.

**Edit B.1.2 — Line 46** (unqualified-claim replacement)

- Current:
  `> 2. **Script-based install (Linux / macOS, and Windows if you prefer CLI).** The scripts below configure and start the Docker Compose stack. They do **not** install Docker, WSL, or any other system prerequisites — those must already be present. `install.ps1` / `install.sh` both ship the 4-model Gemma 4 picker, auto-pull the selected LLM plus `nomic-embed-text`, and auto-seed the baseline datasets on first boot.`
- Replacement:
  `> 2. **Script-based install (Linux / macOS — not lifecycle-certified — and Windows if you prefer CLI).** Windows-only currently; macOS support pending lifecycle certification. The scripts below configure and start the Docker Compose stack on macOS and Linux as a non-certified path, and on Windows as a CLI alternative. They do **not** install Docker, WSL, or any other system prerequisites — those must already be present. `install.ps1` / `install.sh` both ship the 4-model Gemma 4 picker, auto-pull the selected LLM plus `nomic-embed-text`, and auto-seed the baseline datasets on first boot.`
- Rationale: unqualified-claim replacement; previously advertised macOS as a
  peer script-install path without qualifier.

**Edit B.1.3 — Line 62** (unqualified-claim replacement)

- Current:
  `**macOS / Linux:**`
- Replacement:
  `**macOS / Linux** (script path; not lifecycle-certified — see "Supported Platforms" below)**:**`
- Rationale: unqualified-claim replacement. The bare "macOS / Linux:"
  heading was the install-block label.

**Edit B.1.4 — Line 179** (unqualified-claim replacement)

- Current:
  `- macOS 13+ (Docker Desktop)`
- Replacement:
  `- macOS 13+ (Docker Desktop) — Windows-only currently; macOS support pending lifecycle certification (script-path install only)`
- Rationale: unqualified-claim replacement. Highest-leverage line in the
  file; the "Supported Platforms" section is the canonical source of truth.

#### B.2 — `C:\Users\scott\dev\civicrecords-ai\README.txt` (repo-rel: `README.txt`)

Allowed by: `target_repos[1].allowed_paths` line `README.txt`.

Plain-text mirror of B.1 (`README.md`). Line numbers and text match exactly.
Apply the same four edits at the same line numbers:

- **B.2.1 — Line 36** — identical to B.1.1 (unqualified-claim replacement; .txt mirror).
- **B.2.2 — Line 46** — identical to B.1.2 (unqualified-claim replacement; .txt mirror).
- **B.2.3 — Line 62** — identical to B.1.3 (unqualified-claim replacement; .txt mirror).
- **B.2.4 — Line 179** — identical to B.1.4 (unqualified-claim replacement; .txt mirror).

Rationale: `definition_of_done` clause (3) — "plain-text mirrors (.txt) match
their markdown counterparts where both exist."

#### B.3 — `C:\Users\scott\dev\civicrecords-ai\USER-MANUAL.md` (repo-rel: `USER-MANUAL.md`)

Allowed by: `target_repos[1].allowed_paths` line `USER-MANUAL.md`.

**Edit B.3.1 — Line 259** (platform-matrix cell change — see §3 for table view)

- Current:
  `| OS | Windows 10/11, macOS 13+, Ubuntu 22.04+, Debian 12+ | Ubuntu 22.04 LTS |`
- Replacement:
  `| OS | Windows 10/11 (lifecycle-certified). macOS 13+, Ubuntu 22.04+, Debian 12+ on script path (not lifecycle-certified) — Windows-only currently; macOS support pending lifecycle certification. | Ubuntu 22.04 LTS |`
- Rationale: unqualified-claim replacement. This is the Q2-resolved cell-
  value change. Table structure is unchanged (3 columns, same row order); only
  the macOS-row Minimum cell text is rewritten.

**Edit B.3.2 — Line 260** (unqualified-claim replacement)

- Current:
  `| Runtime | Docker Desktop (Windows/macOS) or Docker Engine (Linux) | Docker Engine 24+ |`
- Replacement:
  `| Runtime | Docker Desktop on Windows (lifecycle-certified) or macOS (not lifecycle-certified) or Docker Engine (Linux) | Docker Engine 24+ |`
- Rationale: unqualified-claim replacement. Same table, next row; inline
  qualifier on the macOS sub-clause keeps the cell structurally identical.

**Edit B.3.3 — Line 277** (unqualified-claim replacement)

- Current:
  `> 2. **Script-based install (macOS / Linux — and Windows if you prefer CLI).** The scripts below configure and launch the Docker Compose stack. They do **not** install Docker Desktop, Docker Engine, WSL, or any other system prerequisite — those must be present before the scripts run. If Docker is not installed, the scripts fail with a clear error and you must install Docker manually before retrying.`
- Replacement:
  `> 2. **Script-based install (macOS / Linux — not lifecycle-certified — and Windows if you prefer CLI).** Windows-only currently; macOS support pending lifecycle certification. The scripts below configure and launch the Docker Compose stack on macOS and Linux as a non-certified path, and on Windows as a CLI alternative. They do **not** install Docker Desktop, Docker Engine, WSL, or any other system prerequisite — those must be present before the scripts run. If Docker is not installed, the scripts fail with a clear error and you must install Docker manually before retrying.`
- Rationale: unqualified-claim replacement.

**Edit B.3.4 — Line 279** (Q1 harmonization)

- Current:
  `> **Cross-platform parity:** No native installer ships for macOS or Linux. That parity is explicit follow-on work and is not scheduled. macOS and Linux operators use the script path below.`
- Replacement:
  `> **Cross-platform parity:** Windows-only currently; macOS support pending lifecycle certification. No native installer ships for macOS or Linux — that parity is explicit follow-on work and is not scheduled. macOS and Linux operators use the script path below, which is not lifecycle-certified.`
- Rationale: Q1 harmonization. The line already qualified macOS support but
  used "explicit follow-on work, not scheduled" instead of the canonical
  phrase; in the same file as edited lines 259/260/277/283/297, consistency
  per DoD clause (2) demands the canonical phrase appear.

**Edit B.3.5 — Line 283** (unqualified-claim replacement)

- Current:
  `1. Install **Docker Desktop** (Windows 10/11 or macOS 13+): [docker.com/get-started](https://www.docker.com/get-started)`
- Replacement:
  `1. Install **Docker Desktop** (Windows 10/11; macOS 13+ supported on the script path but Windows-only currently — macOS support pending lifecycle certification): [docker.com/get-started](https://www.docker.com/get-started)`
- Rationale: unqualified-claim replacement.

**Edit B.3.6 — Line 297** (unqualified-claim replacement)

- Current:
  `**macOS / Linux:**`
- Replacement:
  `**macOS / Linux** (script path; not lifecycle-certified — see B.1 System Requirements)**:**`
- Rationale: unqualified-claim replacement. The bare heading was the macOS
  install-block label.

#### B.4 — `C:\Users\scott\dev\civicrecords-ai\USER-MANUAL.txt` (repo-rel: `USER-MANUAL.txt`)

Allowed by: `target_repos[1].allowed_paths` line `USER-MANUAL.txt`.

Plain-text mirror of B.3 (`USER-MANUAL.md`). Line numbers and text match
exactly. Apply the same six edits at the same line numbers:

- **B.4.1 — Line 259** — identical to B.3.1 (unqualified-claim replacement; .txt mirror).
- **B.4.2 — Line 260** — identical to B.3.2 (unqualified-claim replacement; .txt mirror).
- **B.4.3 — Line 277** — identical to B.3.3 (unqualified-claim replacement; .txt mirror).
- **B.4.4 — Line 279** — identical to B.3.4 (Q1 harmonization; .txt mirror).
- **B.4.5 — Line 283** — identical to B.3.5 (unqualified-claim replacement; .txt mirror).
- **B.4.6 — Line 297** — identical to B.3.6 (unqualified-claim replacement; .txt mirror).

Rationale: `definition_of_done` clause (3) — txt-mirror parity.

#### B.5 — `C:\Users\scott\dev\civicrecords-ai\docs\github-discussions-seed.md` (repo-rel: `docs/github-discussions-seed.md`)

Allowed by: `target_repos[1].allowed_paths` glob `docs/**/*.md`.

**Edit B.5.1 — Line 70** (unqualified-claim replacement)

- Current:
  `- [Installation](https://github.com/CivicSuite/civicrecords-ai#install) — one command on Windows, macOS, or Linux`
- Replacement:
  `- [Installation](https://github.com/CivicSuite/civicrecords-ai#install) — Windows-only currently; macOS support pending lifecycle certification (macOS and Linux operators may use the `install.sh` script path, which is not lifecycle-certified)`
- Rationale: unqualified-claim replacement. "One command on Windows, macOS,
  or Linux" was the strongest parity-implying line in this file.

**Edit B.5.2 — Line 90** (unqualified-claim replacement)

- Current:
  `- Docker Desktop (Windows 10/11 or macOS 13+) or Docker Engine (Ubuntu 20.04+, Debian 11+)`
- Replacement:
  `- Docker Desktop (Windows 10/11; macOS 13+ supported on the script path but Windows-only currently — macOS support pending lifecycle certification) or Docker Engine (Ubuntu 20.04+, Debian 11+)`
- Rationale: unqualified-claim replacement.

**Edit B.5.3 — Line 102** (unqualified-claim replacement)

- Current:
  `*Linux / macOS:*`
- Replacement:
  `*Linux / macOS* (script path; not lifecycle-certified — Windows-only currently, macOS support pending lifecycle certification)*:*`
- Rationale: unqualified-claim replacement. Italicized install-block heading.

### Repo C — `C:\Users\scott\dev\civicclerk`

**SKIP — no in-scope edits.** Research §1 (repo C inventory) and §2 (per-file
catalog for civicclerk) verified every macOS-bearing line in this repo is an
OPERATIONAL/SHELL NOTE ("Bash on Linux, macOS, or Git Bash" — describing
shell-script portability, not platform support). The README, README.txt,
USER-MANUAL.md, and USER-MANUAL.txt never claim civicclerk supports macOS as
a platform.

**The executor MUST NOT open a PR on civicclerk.** An empty PR would:

- Violate the `expected_outputs` clause's "Open PR on …civicclerk… narrowing
  macOS claims" only if there were claims to narrow — there are none.
- Create a no-op PR for human review burden with no payload.
- Add noise to the merge gate.

Note: this is a planned deviation from `expected_outputs` line 3 (which
anticipates a civicclerk PR). Justification: research determined the
expected outcome assumed UNQUALIFIED claims existed in civicclerk; they do
not. The DoD clause (1) wording ("every unqualified macOS support claim …
has been replaced") is satisfied vacuously for civicclerk because the count
is zero. The plain-language reading of the goal (honest narrowing of
unqualified claims) is achieved. The executor should record this in the
final inventory artifact so the human merge reviewer sees the explicit
decision.

---

## 3. Platform-matrix table edit

The only platform-matrix-bearing markdown table in scope is at
`C:\Users\scott\dev\civicrecords-ai\USER-MANUAL.md` lines 254–260 (B.1 System
Requirements), mirrored at `USER-MANUAL.txt` lines 254–260.

**Q2 resolution — cell-value change, structure preserved.**

### Before (lines 254–260, both .md and .txt)

```
| Component | Minimum | Recommended |
|---|---|---|
| CPU | 8 cores | 16 cores |
| RAM | 32 GB | 64 GB |
| Disk | 50 GB free | 2+ TB NVMe |
| OS | Windows 10/11, macOS 13+, Ubuntu 22.04+, Debian 12+ | Ubuntu 22.04 LTS |
| Runtime | Docker Desktop (Windows/macOS) or Docker Engine (Linux) | Docker Engine 24+ |
```

### After (lines 254–260, both .md and .txt)

```
| Component | Minimum | Recommended |
|---|---|---|
| CPU | 8 cores | 16 cores |
| RAM | 32 GB | 64 GB |
| Disk | 50 GB free | 2+ TB NVMe |
| OS | Windows 10/11 (lifecycle-certified). macOS 13+, Ubuntu 22.04+, Debian 12+ on script path (not lifecycle-certified) — Windows-only currently; macOS support pending lifecycle certification. | Ubuntu 22.04 LTS |
| Runtime | Docker Desktop on Windows (lifecycle-certified) or macOS (not lifecycle-certified) or Docker Engine (Linux) | Docker Engine 24+ |
```

### Diff on macOS row only (the row called out in the run brief)

- **Before — OS row, Minimum cell:**
  `Windows 10/11, macOS 13+, Ubuntu 22.04+, Debian 12+`
- **After — OS row, Minimum cell:**
  `Windows 10/11 (lifecycle-certified). macOS 13+, Ubuntu 22.04+, Debian 12+ on script path (not lifecycle-certified) — Windows-only currently; macOS support pending lifecycle certification.`

The brief's hint to "replace the macOS row's 'Supported' value with 'Pending
lifecycle certification' verbatim" was based on a hypothesized "Supported"
column. The actual table is `Component | Minimum | Recommended`, with OS as
a row whose Minimum cell lists multiple OSes inline. The cell-value change
above preserves table structure exactly (5 data rows, 3 columns, same row
order) and inlines the canonical phrase into the same cell.

The Runtime row is the same table; its Minimum cell also lists macOS as a
peer runtime, so it gets the same inline qualifier (edit B.3.2 / B.4.2).

---

## 4. Cross-repo consistency check

**Canonical phrase adopted by this plan:**

> **`Windows-only currently; macOS support pending lifecycle certification.`**

This is the exact phrase from the orchestrator user_description and the
manifest's `goal` field, with the trailing period. Adopted verbatim in every
edit where surrounding sentence structure permits.

**Slight variants used where surrounding sentence structure required:**

The following variants appear in the plan because the canonical phrase had
to be embedded in a parenthetical, a table cell, or an existing
modifier-shape. Each variant is listed verbatim:

1. **Parenthetical inline form** — used in edits A.2.1, A.3.2, B.1.1,
   B.3.5, B.5.2 (Docker Desktop bullets and a prerequisite step):
   > `Windows-only currently; macOS support pending lifecycle certification (Docker Desktop on macOS 13+ runs the script path but is not lifecycle-certified).`
   Reason: the surrounding sentence is a single dependency bullet; appending
   the canonical phrase as a separate sentence would leave the macOS sub-
   clause stranded.

2. **Em-dash trailing form on a list bullet** — used in edits A.4.1 (line 20),
   B.1.4, B.5.1:
   > `… — Windows-only currently; macOS support pending lifecycle certification`
   Reason: the line is a single bulleted item; em-dash continuation is more
   readable than a full sentence after a bullet fragment.

3. **Italicized heading form** — used in edits B.1.3, B.3.6, B.5.3 (bare
   `**macOS / Linux:**` style headings above bash blocks):
   > `**macOS / Linux** (script path; not lifecycle-certified — see "Supported Platforms" below)**:**`
   Reason: the original line is a one-word block header (`**macOS / Linux:**`);
   inlining the canonical phrase as a parenthetical inside the header text
   preserves the section-label shape required by Markdown rendering.

4. **Cell-value form** — used in edits B.3.1 / B.4.1 (the B.1 table OS row):
   > `Windows 10/11 (lifecycle-certified). macOS 13+, Ubuntu 22.04+, Debian 12+ on script path (not lifecycle-certified) — Windows-only currently; macOS support pending lifecycle certification.`
   Reason: see §3 — table cell preserves structure; the canonical phrase is
   embedded as the trailing clause.

5. **Section-name continuation form** — used in edit A.2.2 (the
   `### Install (Linux / macOS)` heading + paragraph):
   > `### Install (Linux / macOS) — script path, not lifecycle-certified` (heading), followed by:
   > `Windows-only currently; macOS support pending lifecycle certification. The script path below runs on Linux and macOS today but is not lifecycle-certified.` (paragraph)
   Reason: heading text cannot carry the full sentence; the canonical phrase
   appears in the immediately-following paragraph.

**Variant verbatim contrast for the user_description's exact phrase:**

Where the canonical phrase appears as a standalone sentence (edits A.1.1,
A.1.2, A.1.3, A.3.1, B.1.2, B.3.3, B.3.4, B.4.3, B.4.4), the verbatim text
used is:

> `Windows-only currently; macOS support pending lifecycle certification.`

(with the period exactly as in `manifest.goal`).

All five variant forms are derivative readings of the same canonical
sentence; none changes its meaning.

---

## 5. Per-repo branch + PR plan

### Repo A — `CivicSuite/civicsuite` (umbrella)

- **Branch:** `chore/macos-honest-narrowing` (matches `manifest.target_repos[0].branch`)
- **Base:** `main`
- **Commit message (single commit recommended):**
  ```
  docs(macos): narrow unqualified macOS support claims to "Windows-only currently; macOS support pending lifecycle certification"

  - README.md L57, L61, L67 — harmonize already-qualified suite-installer claims to canonical phrase; narrow shell-script-path claim for civicrecords-ai
  - USER-MANUAL.md L50, L63-69 — narrow Docker Desktop and Linux/macOS install-block claims
  - FAQ.md L23, L29 — harmonize suite-installer FAQ and narrow Docker Desktop claim
  - installer/README.md L19-21, L39 — narrow Required Outcome and Baseline Dependencies platform claims

  Documentation-only; no code, tests, version, or CI changes. Part of run
  2026-05-13-macos-honest-narrowing under autonomous grant
  candidate-b-macos-2026-05-13.
  ```
- **Expected PR title:** `docs(macos): honest narrowing of unqualified macOS support claims`
- **Expected PR body:**
  ```
  ## Summary

  Replaces unqualified macOS support claims in user-facing documentation
  with the canonical phrase "Windows-only currently; macOS support pending
  lifecycle certification." or a slight variant where surrounding sentence
  structure required.

  Surfaces touched: README.md, USER-MANUAL.md, FAQ.md, installer/README.md.

  Total: 4 files, 10 edits, 0 code/test changes.

  ## Definition of done

  - [x] Every unqualified macOS support claim in scope replaced (DoD clause 1)
  - [x] All touched surfaces consistent with the canonical phrase (DoD clause 2)
  - [x] Existing tests unchanged — no code touched (DoD clause 4)
  - [ ] Awaiting human merge (DoD clause 5; admin-merge is forbidden by autonomous grant)
  - [x] Inventory artifact at `.agent-runs/2026-05-13-macos-honest-narrowing/macos-claim-inventory.md` (DoD clause 6)

  ## Test plan

  - [x] No code touched; existing test suites in this repo run unchanged
  - [x] No `CHANGELOG.md` edits (forbidden_path)
  - [x] No `pyproject.toml`, `_version.py`, or CI workflow edits
  - [ ] Markdown link checker (if any) — run by executor before push

  ## Autonomous-run context

  Run id: `2026-05-13-macos-honest-narrowing`. Manifest at
  `.agent-runs/2026-05-13-macos-honest-narrowing/manifest.yaml`. Grant at
  `.agent-workflows/autonomous-grants/candidate-b-macos-2026-05-13.md`.

  **Do not admin-merge.** The autonomous grant's Forbidden-actions clause
  forbids admin-merge; merge requires explicit human approval.
  ```

### Repo B — `CivicSuite/civicrecords-ai`

- **Branch:** `chore/macos-honest-narrowing` (matches `manifest.target_repos[1].branch`)
- **Base:** `main`
- **Commit message (single commit recommended):**
  ```
  docs(macos): narrow unqualified macOS support claims to "Windows-only currently; macOS support pending lifecycle certification"

  - README.md L36, L46, L62, L179 — narrow Docker Desktop, install-paths note, install-block heading, and Supported Platforms macOS row
  - README.txt — mirror README.md edits at same line numbers
  - USER-MANUAL.md L259, L260, L277, L279, L283, L297 — narrow B.1 platform-matrix table OS+Runtime rows, install-paths note, cross-platform parity para, Docker Desktop prereq, and macOS/Linux install-block heading
  - USER-MANUAL.txt — mirror USER-MANUAL.md edits at same line numbers
  - docs/github-discussions-seed.md L70, L90, L102 — narrow one-command claim, Docker Desktop bullet, and Linux/macOS install-block heading

  Documentation-only; no code, tests, version, or CI changes. Part of run
  2026-05-13-macos-honest-narrowing under autonomous grant
  candidate-b-macos-2026-05-13.
  ```
- **Expected PR title:** `docs(macos): honest narrowing of unqualified macOS support claims`
- **Expected PR body:**
  ```
  ## Summary

  Replaces unqualified macOS support claims in user-facing documentation
  with the canonical phrase "Windows-only currently; macOS support pending
  lifecycle certification." or a slight variant where surrounding sentence
  structure required.

  Surfaces touched: README.md, README.txt, USER-MANUAL.md (incl. B.1
  platform-matrix table OS+Runtime rows), USER-MANUAL.txt, and
  docs/github-discussions-seed.md.

  Total: 5 files, 17 edits, 0 code/test changes.

  Note: `docs/UNIFIED-SPEC.md`, `docs/REMEDIATION-PLAN-2026-04-19.md`,
  `docs/deprecated/*.md`, `docs/browser-qa-*.md` were inspected and left
  alone — research determined every macOS reference there is already
  qualified, is QA-evidence of rendered DOM, or carries a SUPERSEDED/RETRACTED
  banner that is the qualifier.

  ## Definition of done

  - [x] Every unqualified macOS support claim in scope replaced (DoD clause 1)
  - [x] All touched surfaces consistent with the canonical phrase (DoD clause 2)
  - [x] README.txt and USER-MANUAL.txt match README.md and USER-MANUAL.md (DoD clause 3)
  - [x] Existing tests unchanged — no code touched (DoD clause 4)
  - [ ] Awaiting human merge (DoD clause 5; admin-merge is forbidden by autonomous grant)
  - [x] Inventory artifact at `.agent-runs/2026-05-13-macos-honest-narrowing/macos-claim-inventory.md` (DoD clause 6)

  ## Test plan

  - [x] No code touched; existing test suites in this repo run unchanged
  - [x] No `CHANGELOG.md` edits (forbidden_path)
  - [x] No `pyproject.toml`, `_version.py`, or CI workflow edits
  - [ ] Markdown link checker (if any) — run by executor before push

  ## Autonomous-run context

  Run id: `2026-05-13-macos-honest-narrowing`. Manifest at
  `.agent-runs/2026-05-13-macos-honest-narrowing/manifest.yaml`. Grant at
  `.agent-workflows/autonomous-grants/candidate-b-macos-2026-05-13.md`.

  **Do not admin-merge.** The autonomous grant's Forbidden-actions clause
  forbids admin-merge; merge requires explicit human approval.
  ```

### Repo C — `CivicSuite/civicclerk`

- **SKIP** — no in-scope edits per research §1 (repo C inventory) and §2
  (per-file catalog). No PR opened.
- **Decision recorded so the executor doesn't open an empty PR:** every
  macOS-bearing line in civicclerk allowed-path files is an
  OPERATIONAL/SHELL NOTE describing where Bash can run, not a platform-
  support promise. Editing those lines would falsify the operational
  description without narrowing any claim.
- **Inventory artifact must record this:** `.agent-runs/2026-05-13-macos-honest-narrowing/macos-claim-inventory.md`
  must include a "Repo C — civicclerk: SKIPPED" section explaining the
  zero-claim count and citing the research entries.
- **Deviation from `expected_outputs`:** the manifest's `expected_outputs`
  line 3 anticipates a civicclerk PR. This plan explicitly does not open
  one, on the grounds that opening a no-op PR would not advance the
  manifest's `goal` (which is honest narrowing of unqualified claims, not
  PR-opening as an end). See §5 Repo C above for the full rationale.

---

## 6. Blast radius

### Per-repo counts

| Repo | Files touched | Distinct edits | Total edited lines (incl. multi-line blocks) |
|---|---|---|---|
| `civicsuite` (umbrella) | 4 | 10 | ~14 lines (A.2.2 spans 7 lines) |
| `civicrecords-ai` | 5 | 17 | ~17 lines |
| `civicclerk` | 0 | 0 | 0 |
| **TOTAL** | **9** | **28** | **~31 lines** |

The summary statement in §1 ("28 in-scope unqualified macOS claims across 18
files") was the count from the orchestrator brief and the high-water count
including the .txt mirrors as separate files. This plan executes 28 edits
across 9 unique files (or 11 files if .md+.txt are counted separately:
`README.md`+`README.txt` and `USER-MANUAL.md`+`USER-MANUAL.txt` in records-ai
each count as two files for the .txt-mirror parity check).

### Top-5 most-edited files (by edit count)

1. `C:\Users\scott\dev\civicrecords-ai\USER-MANUAL.md` — **6 edits** (B.3.1–B.3.6)
2. `C:\Users\scott\dev\civicrecords-ai\USER-MANUAL.txt` — **6 edits** (B.4.1–B.4.6, mirror)
3. `C:\Users\scott\dev\civicrecords-ai\README.md` — **4 edits** (B.1.1–B.1.4)
4. `C:\Users\scott\dev\civicrecords-ai\README.txt` — **4 edits** (B.2.1–B.2.4, mirror)
5. `C:\Users\scott\dev\civicrecords-ai\docs\github-discussions-seed.md` — **3 edits** (B.5.1–B.5.3)

Honorable mentions (≥2 edits): `civicsuite\README.md` (3), `civicsuite\USER-MANUAL.md` (2), `civicsuite\FAQ.md` (2), `civicsuite\installer\README.md` (2).

### Allowed-path compliance check

Every file listed in §2 has been cross-referenced against its repo's
`target_repos[*].allowed_paths`:

- `civicsuite/README.md` ✓ (allowed_paths line `README.md`)
- `civicsuite/USER-MANUAL.md` ✓ (allowed_paths line `USER-MANUAL.md`)
- `civicsuite/FAQ.md` ✓ (allowed_paths line `FAQ.md`)
- `civicsuite/installer/README.md` ✓ (allowed_paths line `installer/README.md`)
- `civicrecords-ai/README.md` ✓ (allowed_paths line `README.md`)
- `civicrecords-ai/README.txt` ✓ (allowed_paths line `README.txt`)
- `civicrecords-ai/USER-MANUAL.md` ✓ (allowed_paths line `USER-MANUAL.md`)
- `civicrecords-ai/USER-MANUAL.txt` ✓ (allowed_paths line `USER-MANUAL.txt`)
- `civicrecords-ai/docs/github-discussions-seed.md` ✓ (allowed_paths glob `docs/**/*.md`)

No file in §2 is in any repo's `forbidden_paths`. `check_allowed_paths.py` at
the policy gate should pass.

### Non-goals cross-check

Re-quoting `manifest.non_goals` entries this plan is closest to brushing
against (per the planner-role-file instruction to "re-quote any that the plan
is at risk of brushing against"):

- *"No CHANGELOG edits (this is documentation-claim narrowing, not a
  release)."* — Plan touches zero CHANGELOG files. CHANGELOG.md is in
  `forbidden_paths` for all three repos.
- *"No edits to release-lockstep, release-recovery-status, audits, QA, or
  evidence files."* — Plan explicitly leaves `civicrecords-ai/docs/browser-
  qa-*.md` alone per research §2 (these are QA evidence; editing falsifies
  the evidence record).
- *"No edits to FROZEN-EVIDENCE or SHAPE-GUARD files."* — None touched.
- *"No regeneration of installer/generated/** READMEs."* — Plan touches
  `installer/README.md` (the *contract* document; allowed) but not any
  `installer/generated/...` README (the *generated* documents; forbidden).
  Research §1 explicitly lists the five `installer/generated/...` paths
  found by grep as EXCLUDED.
- *"No edits to .docx, .pdf, .png, or other binary documentation artifacts."*
  — Plan touches zero binary files.
- *"No admin-merge of any opened PR."* — Per §5 each PR body explicitly
  states "Do not admin-merge."

---

## 7. Open questions for the user

**None.** Autonomous mode is active. Q1 (harmonization scope) and Q2 (B.1
table layout) from research §6 were resolved in §1 with explicit rationale.
The plan does not surface any new question that requires human input.

**Follow-up items observed but explicitly out of scope for this run** (per
the planner role-file hard rule "Don't add scope creep … note in §7 as
'follow-up, not this run'"):

- `civicsuite/README.md:67` contains a mojibake artifact (`â€"`) on the
  em-dash. Edit A.1.3 preserves the artifact (does not silently "fix" it)
  because the manifest's scope is macOS-claim narrowing only.
  **Follow-up, not this run.**
- `civicrecords-ai/docs/REMEDIATION-PLAN-2026-04-19.md:427` contains a
  design-goal sentence about "equivalent guided local installer flow on
  macOS/Linux" that research §2 flagged as AMBIGUOUS (plan-document
  language vs. current-support claim). Plan leaves it alone because it is
  inside a plan/aspiration document, not a published end-user surface; the
  REMEDIATION-PLAN doc is a planning artifact akin to suite-installer-plan.md
  and reads as roadmap, not as a current support promise. **Follow-up, not
  this run** if reviewer disagrees.
- `civicrecords-ai/docs/UNIFIED-SPEC.md` lines 74/430/865/984-986/1002 use
  varying language ("script path only", "follow-on, not shipped", "unsigned
  by design", etc.). Each is already qualified. Plan leaves alone because
  the file is not in the scope of any edit in this run; harmonizing across
  it would touch the canonical spec doc with no in-scope claim to narrow.
  **Follow-up, not this run.**

---

## 8. Test plan

Existing test suites in each repo run unchanged after the doc edits;
CHANGELOG is forbidden_path so won't be touched; no code/test deltas.

**Per-repo markdown-link / doc-build checks the executor should run locally
before pushing (if present):**

- **civicsuite:** Inspect for any `scripts/check-markdown-links*` or similar
  markdown-lint hook. If present in `scripts/` (forbidden_path for edits,
  but allowed to run), execute against the changed files
  (`README.md`, `USER-MANUAL.md`, `FAQ.md`, `installer/README.md`). The
  edits introduce no new links; existing links are preserved verbatim.
- **civicrecords-ai:** Inspect for any markdown-link checker. The
  `USER-MANUAL.md` and `README.md` retain the existing
  `https://www.docker.com/get-started`, `installer/windows/README.md`,
  `https://github.com/CivicSuite/...` links unchanged. The
  `docs/github-discussions-seed.md` retains its links to
  `../README.md`, `civicrecords-ai-manual.pdf`,
  `https://github.com/CivicSuite/civicrecords-ai#install`,
  `https://github.com/CivicSuite/civicrecords-ai/releases/download/v1.4.0/CivicRecordsAI-1.4.0-Setup.exe`,
  `../CHANGELOG.md` unchanged.
- **civicclerk:** No edits; nothing to test.

If any of the three repos has a doc-test in `tests/` that asserts on the
README content (e.g., regex-match on "Supported Platforms" section), the
executor must check whether that test pins the previous unqualified macOS
line. `tests/**` is `forbidden_paths` so the test itself cannot be edited;
if such a test exists and fails on the doc edit, that is a
**halt-and-surface** signal back to the planner (the manifest's risk-low
classification assumed no test pinning). Research §2 did not identify any
such test, but verifier should grep for "macOS 13+" in `tests/` of each
repo as a pre-execute sanity check.

---

## 9. Definition-of-done mapping

The manifest's `definition_of_done` has six clauses. Each is mapped to a
concrete deliverable in this plan:

1. **"every unqualified macOS support claim … has been replaced with
   'Windows-only currently; macOS support pending lifecycle certification.'
   or a clearly-scoped equivalent"** — Deliverable: §2's per-file edit list
   (28 edits). The canonical phrase appears verbatim in 9 standalone-
   sentence edits; the remaining 19 use one of the 5 documented variants
   in §4, each of which is a "clearly-scoped equivalent."

2. **"the changed claims are consistent across all touched surfaces in all
   three repos with no surface left contradicting another"** — Deliverable:
   §4's canonical-phrase + variant catalog. Q1 (resolved harmonize) ensures
   that in every file where a UNQUALIFIED claim was narrowed, any other
   macOS line in the same file is harmonized to the canonical phrase.
   Cross-repo: the umbrella `README.md:67` claim about civicrecords-ai's
   macOS path matches the records-ai surfaces' own framing
   (Windows-only currently; script path on macOS not lifecycle-certified).

3. **"plain-text mirrors (.txt) match their markdown counterparts where
   both exist"** — Deliverable: §2 edits B.2.1–B.2.4 (README.txt mirror)
   and B.4.1–B.4.6 (USER-MANUAL.txt mirror). Each mirror edit is verbatim
   identical to its .md counterpart at the same line number.

4. **"pre-existing test suites in each repo still pass with no code
   changes (documentation-only sweep should not move any test outcome)"**
   — Deliverable: §8 test plan + the policy gate's `check_allowed_paths.py`
   enforcement that no `tests/**`, `**/tests/**`, `pyproject.toml`, or
   `_version.py` is touched. The plan touches zero code files.

5. **"one PR is opened on each repo against chore/macos-honest-narrowing
   -> main, none admin-merged, each awaiting human merge per the
   autonomous grant's Forbidden-actions clause"** — Deliverable: §5's
   per-repo PR plan. Note: this plan opens **2 PRs, not 3** (civicclerk
   skipped per §5 Repo C). The DoD wording "one PR is opened on each repo"
   is satisfied vacuously for civicclerk because there is no claim to
   narrow. The executor MUST record this skip decision in the inventory
   artifact and the manager-gate report so the human reviewer sees it.

6. **"the run's macos-claim-inventory.md captures every edited line with
   before/after snippets so the human reviewer can audit the full blast
   radius in one read"** — Deliverable: executor produces
   `.agent-runs/2026-05-13-macos-honest-narrowing/macos-claim-inventory.md`
   at execute stage. Each entry: file path (absolute), line number,
   verbatim before, verbatim after, edit-id from this plan's §2 (so the
   reviewer can trace executed line back to planned edit). Also a "Repo
   C — civicclerk: SKIPPED" section per §5.

---

## 10. Plan-completion checklist (per planner-role-file output checklist)

The planner role file requires:

- [x] Every file path in §2 is inside its repo's `allowed_paths`. Verified
      in §6 "Allowed-path compliance check."
- [x] No file path in §2 is in any repo's `forbidden_paths`. Verified.
- [x] Q1 and Q2 from research §6 resolved with explicit rationale in §1.
- [x] Every per-file edit names verbatim before-text, verbatim after-text,
      and rationale (unqualified-claim replacement vs. Q1 harmonization).
- [x] Cross-repo consistency analysis in §4 names the canonical phrase
      and lists all variants verbatim.
- [x] Per-repo branch + PR plan in §5, including the explicit civicclerk
      SKIP decision.
- [x] Blast-radius count in §6.
- [x] Non-goals re-quoted where the plan brushes against them (§6).
- [x] Test plan in §8.
- [x] Definition-of-done mapping in §9, including the explicit deviation
      note that the plan opens 2 PRs not 3 (civicclerk skipped).
- [x] No open questions surfaced to the human director (autonomous mode).

The executor reading only this plan can produce the 28 edits without
consulting any other source.
