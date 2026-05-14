# macOS-claim inventory — 2026-05-13-macos-honest-narrowing

Full before/after table for every edit applied by the executor stage of run
`2026-05-13-macos-honest-narrowing`, across all repos. Each entry includes
the absolute file path, the plan edit-id (so the reviewer can trace the
executed line back to the planned edit), the verbatim before-text, and the
verbatim after-text.

Canonical replacement phrase: **`Windows-only currently; macOS support pending lifecycle certification.`**

Two repos were edited (civicsuite umbrella, civicrecords-ai). civicclerk
was inspected and explicitly skipped (zero in-scope unqualified claims;
see "Repo C — civicclerk: SKIPPED" at the bottom).

---

## Repo A — `C:\Users\scott\dev\civicsuite` (umbrella)

Branch: `chore/macos-honest-narrowing` off `main`. Commit: `41537bc`. PR:
<https://github.com/CivicSuite/civicsuite/pull/132>.

### A.1.1 — `C:\Users\scott\dev\civicsuite\README.md` line 57 (Q1 harmonization)

**Before:**

> `**Suite installer (current):** YELLOW beta. The clerk-core profile installer is published on this repo's Releases page as `installer-clerk-core-v0.1.0-beta`. Verified lifecycle on Windows and Linux; **macOS uncertified** as of 2026-05-09.`

**After:**

> `**Suite installer (current):** YELLOW beta. The clerk-core profile installer is published on this repo's Releases page as `installer-clerk-core-v0.1.0-beta`. Windows-only currently; macOS support pending lifecycle certification. Lifecycle verified on Windows and Linux as of 2026-05-09.`

### A.1.2 — `C:\Users\scott\dev\civicsuite\README.md` line 61 (Q1 harmonization)

**Before:**

> `- macOS package: `CivicSuite-clerk-core-macos-0.1.0.tar.gz` *(beta only, full lifecycle not certified)*`

**After:**

> `- macOS package: `CivicSuite-clerk-core-macos-0.1.0.tar.gz` *(Windows-only currently; macOS support pending lifecycle certification)*`

### A.1.3 — `C:\Users\scott\dev\civicsuite\README.md` line 67 (unqualified-claim replacement)

**Before:**

> `- FOIA / public records: <https://github.com/CivicSuite/civicrecords-ai> â€" Windows installer published per release; macOS/Linux via shell script.`

**After:**

> `- FOIA / public records: <https://github.com/CivicSuite/civicrecords-ai> â€" Windows-only currently; macOS support pending lifecycle certification. macOS and Linux operators may use the `install.sh` script path, which is not lifecycle-certified.`

### A.2.1 — `C:\Users\scott\dev\civicsuite\USER-MANUAL.md` line 50 (unqualified-claim replacement)

**Before:**

> `- **Docker Desktop** (Windows 10/11, macOS 13+) or Docker Engine (Linux). On Windows, also WSL 2 + Virtual Machine Platform.`

**After:**

> `- **Docker Desktop** (Windows 10/11) or Docker Engine (Linux). Windows-only currently; macOS support pending lifecycle certification (Docker Desktop on macOS 13+ runs the script path but is not lifecycle-certified). On Windows, also WSL 2 + Virtual Machine Platform.`

### A.2.2 — `C:\Users\scott\dev\civicsuite\USER-MANUAL.md` lines 63–69 (unqualified-claim replacement, multi-line block)

**Before (lines 63–69 inclusive):**

```
### Install (Linux / macOS)

```bash
git clone https://github.com/CivicSuite/civicrecords-ai.git
cd civicrecords-ai
bash install.sh
```
```

**After:**

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

### A.3.1 — `C:\Users\scott\dev\civicsuite\FAQ.md` line 23 (Q1 harmonization)

**Before:**

> `In practice, today: only `civicrecords-ai` and `civicclerk` have install paths a non-engineer can follow on a stock machine, and both are still provisional. The suite-level installer beta (`installer-clerk-core-v0.1.0-beta`) supports the clerk-core profile on Windows and Linux; macOS is not certified.`

**After:**

> `In practice, today: only `civicrecords-ai` and `civicclerk` have install paths a non-engineer can follow on a stock machine, and both are still provisional. The suite-level installer beta (`installer-clerk-core-v0.1.0-beta`) supports the clerk-core profile on Windows and Linux. Windows-only currently; macOS support pending lifecycle certification.`

### A.3.2 — `C:\Users\scott\dev\civicsuite\FAQ.md` line 29 (unqualified-claim replacement)

**Before:**

> `- **Docker Desktop** (Windows 10/11, macOS 13+) or Docker Engine (Linux). WSL 2 + Virtual Machine Platform on Windows.`

**After:**

> `- **Docker Desktop** (Windows 10/11) or Docker Engine (Linux). Windows-only currently; macOS support pending lifecycle certification (Docker Desktop on macOS 13+ runs the script path but is not lifecycle-certified). WSL 2 + Virtual Machine Platform on Windows.`

### A.4.1 — `C:\Users\scott\dev\civicsuite\installer\README.md` lines 19–21 (unqualified-claim replacement, multi-line list)

**Before:**

```
- Windows 10/11
- macOS 13 or newer
- Linux, with Ubuntu LTS as the first proof target
```

**After:**

```
- Windows 10/11 (lifecycle-certified target)
- macOS 13 or newer — Windows-only currently; macOS support pending lifecycle certification
- Linux, with Ubuntu LTS as the first proof target
```

### A.4.2 — `C:\Users\scott\dev\civicsuite\installer\README.md` line 39 (unqualified-claim replacement)

**Before:**

> `- Docker Desktop on Windows/macOS, or Docker Engine on Linux.`

**After:**

> `- Docker Desktop on Windows (lifecycle-certified) or macOS (Windows-only currently; macOS support pending lifecycle certification), or Docker Engine on Linux.`

---

## Repo B — `C:\Users\scott\dev\civicrecords-ai`

Branch: `chore/macos-honest-narrowing` off `master` (repo's actual default
branch; manifest used "main" generically). Commit: `d275045`. PR:
<https://github.com/CivicSuite/civicrecords-ai/pull/80>.

### B.1.1 — `C:\Users\scott\dev\civicrecords-ai\README.md` line 36 (unqualified-claim replacement)

**Before:**

> `- **Docker Desktop** (Windows 10/11, macOS 13+) or **Docker Engine** (Linux)`

**After:**

> `- **Docker Desktop** (Windows 10/11) or **Docker Engine** (Linux). Windows-only currently; macOS support pending lifecycle certification (Docker Desktop on macOS 13+ runs the script path but is not lifecycle-certified).`

### B.1.2 — `C:\Users\scott\dev\civicrecords-ai\README.md` line 46 (unqualified-claim replacement)

**Before:**

> `> 2. **Script-based install (Linux / macOS, and Windows if you prefer CLI).** The scripts below configure and start the Docker Compose stack. They do **not** install Docker, WSL, or any other system prerequisites — those must already be present. `install.ps1` / `install.sh` both ship the 4-model Gemma 4 picker, auto-pull the selected LLM plus `nomic-embed-text`, and auto-seed the baseline datasets on first boot.`

**After:**

> `> 2. **Script-based install (Linux / macOS — not lifecycle-certified — and Windows if you prefer CLI).** Windows-only currently; macOS support pending lifecycle certification. The scripts below configure and start the Docker Compose stack on macOS and Linux as a non-certified path, and on Windows as a CLI alternative. They do **not** install Docker, WSL, or any other system prerequisites — those must already be present. `install.ps1` / `install.sh` both ship the 4-model Gemma 4 picker, auto-pull the selected LLM plus `nomic-embed-text`, and auto-seed the baseline datasets on first boot.`

### B.1.3 — `C:\Users\scott\dev\civicrecords-ai\README.md` line 62 (unqualified-claim replacement)

**Before:**

> `**macOS / Linux:**`

**After:**

> `**macOS / Linux** (script path; not lifecycle-certified — see "Supported Platforms" below)**:**`

### B.1.4 — `C:\Users\scott\dev\civicrecords-ai\README.md` line 179 (unqualified-claim replacement)

**Before:**

> `- macOS 13+ (Docker Desktop)`

**After:**

> `- macOS 13+ (Docker Desktop) — Windows-only currently; macOS support pending lifecycle certification (script-path install only)`

### B.2.1–B.2.4 — `C:\Users\scott\dev\civicrecords-ai\README.txt` lines 36, 46, 62, 179

Plain-text mirror of B.1.1–B.1.4. Verbatim identical before-text and
after-text at the same line numbers. Each mirror was independently applied
to README.txt to satisfy definition-of-done clause (3) "plain-text mirrors
(.txt) match their markdown counterparts where both exist."

### B.3.1 — `C:\Users\scott\dev\civicrecords-ai\USER-MANUAL.md` line 259 (platform-matrix cell change, see plan §3)

**Before:**

> `| OS | Windows 10/11, macOS 13+, Ubuntu 22.04+, Debian 12+ | Ubuntu 22.04 LTS |`

**After:**

> `| OS | Windows 10/11 (lifecycle-certified). macOS 13+, Ubuntu 22.04+, Debian 12+ on script path (not lifecycle-certified) — Windows-only currently; macOS support pending lifecycle certification. | Ubuntu 22.04 LTS |`

### B.3.2 — `C:\Users\scott\dev\civicrecords-ai\USER-MANUAL.md` line 260 (unqualified-claim replacement)

**Before:**

> `| Runtime | Docker Desktop (Windows/macOS) or Docker Engine (Linux) | Docker Engine 24+ |`

**After:**

> `| Runtime | Docker Desktop on Windows (lifecycle-certified) or macOS (not lifecycle-certified) or Docker Engine (Linux) | Docker Engine 24+ |`

### B.3.3 — `C:\Users\scott\dev\civicrecords-ai\USER-MANUAL.md` line 277 (unqualified-claim replacement)

**Before:**

> `> 2. **Script-based install (macOS / Linux — and Windows if you prefer CLI).** The scripts below configure and launch the Docker Compose stack. They do **not** install Docker Desktop, Docker Engine, WSL, or any other system prerequisite — those must be present before the scripts run. If Docker is not installed, the scripts fail with a clear error and you must install Docker manually before retrying.`

**After:**

> `> 2. **Script-based install (macOS / Linux — not lifecycle-certified — and Windows if you prefer CLI).** Windows-only currently; macOS support pending lifecycle certification. The scripts below configure and launch the Docker Compose stack on macOS and Linux as a non-certified path, and on Windows as a CLI alternative. They do **not** install Docker Desktop, Docker Engine, WSL, or any other system prerequisite — those must be present before the scripts run. If Docker is not installed, the scripts fail with a clear error and you must install Docker manually before retrying.`

### B.3.4 — `C:\Users\scott\dev\civicrecords-ai\USER-MANUAL.md` line 279 (Q1 harmonization)

**Before:**

> `> **Cross-platform parity:** No native installer ships for macOS or Linux. That parity is explicit follow-on work and is not scheduled. macOS and Linux operators use the script path below.`

**After:**

> `> **Cross-platform parity:** Windows-only currently; macOS support pending lifecycle certification. No native installer ships for macOS or Linux — that parity is explicit follow-on work and is not scheduled. macOS and Linux operators use the script path below, which is not lifecycle-certified.`

### B.3.5 — `C:\Users\scott\dev\civicrecords-ai\USER-MANUAL.md` line 283 (unqualified-claim replacement)

**Before:**

> `1. Install **Docker Desktop** (Windows 10/11 or macOS 13+): [docker.com/get-started](https://www.docker.com/get-started)`

**After:**

> `1. Install **Docker Desktop** (Windows 10/11; macOS 13+ supported on the script path but Windows-only currently — macOS support pending lifecycle certification): [docker.com/get-started](https://www.docker.com/get-started)`

### B.3.6 — `C:\Users\scott\dev\civicrecords-ai\USER-MANUAL.md` line 297 (unqualified-claim replacement)

**Before:**

> `**macOS / Linux:**`

**After:**

> `**macOS / Linux** (script path; not lifecycle-certified — see B.1 System Requirements)**:**`

### B.4.1–B.4.6 — `C:\Users\scott\dev\civicrecords-ai\USER-MANUAL.txt` lines 259, 260, 277, 279, 283, 297

Plain-text mirror of B.3.1–B.3.6. Verbatim identical before-text and
after-text at the same line numbers. Each mirror was independently applied
to USER-MANUAL.txt to satisfy definition-of-done clause (3).

### B.5.1 — `C:\Users\scott\dev\civicrecords-ai\docs\github-discussions-seed.md` line 70 (unqualified-claim replacement)

**Before:**

> `- [Installation](https://github.com/CivicSuite/civicrecords-ai#install) — one command on Windows, macOS, or Linux`

**After:**

> `- [Installation](https://github.com/CivicSuite/civicrecords-ai#install) — Windows-only currently; macOS support pending lifecycle certification (macOS and Linux operators may use the `install.sh` script path, which is not lifecycle-certified)`

### B.5.2 — `C:\Users\scott\dev\civicrecords-ai\docs\github-discussions-seed.md` line 90 (unqualified-claim replacement)

**Before:**

> `- Docker Desktop (Windows 10/11 or macOS 13+) or Docker Engine (Ubuntu 20.04+, Debian 11+)`

**After:**

> `- Docker Desktop (Windows 10/11; macOS 13+ supported on the script path but Windows-only currently — macOS support pending lifecycle certification) or Docker Engine (Ubuntu 20.04+, Debian 11+)`

### B.5.3 — `C:\Users\scott\dev\civicrecords-ai\docs\github-discussions-seed.md` line 102 (unqualified-claim replacement)

**Before:**

> `*Linux / macOS:*`

**After:**

> `*Linux / macOS* (script path; not lifecycle-certified — Windows-only currently, macOS support pending lifecycle certification)*:*`

---

## Repo C — civicclerk: SKIPPED

Branch not opened. Zero in-scope unqualified macOS claims; per research §1
and §2, every macOS-bearing line in civicclerk's allowed-path files
(`README.md`, `README.txt`, `USER-MANUAL.md`, `USER-MANUAL.txt`) is an
OPERATIONAL/SHELL NOTE describing where the bash rehearsal scripts can run
("Bash on Linux, macOS, or Git Bash"). Those are statements about
shell-script portability, not platform-support promises. Editing them would
falsify the operational description and narrow no claim. The civicclerk
README and USER-MANUAL never assert "supports macOS" as a platform.

This is a planned deviation from `expected_outputs` line 3 of the manifest,
which anticipated a civicclerk PR. The deviation is documented in plan §5
Repo C and §9 (Definition-of-done mapping), and was explicitly resolved by
the planner with rationale "opening a no-op PR would not advance the
manifest's `goal` (honest narrowing of unqualified claims)."

Research entries that establish the zero-claim count for civicclerk:

- Research §1 Repo C — lists every file in scope (4 markdown/txt files) and
  classifies every macOS hit as OPERATIONAL/SHELL NOTE.
- Research §2 Repo C — per-file catalog showing every macOS occurrence is
  "Bash on Linux, macOS, or Git Bash" or equivalent shell-portability text.
- Research §4 Divergence #3 — "civicclerk makes no platform support claim
  and ships no macOS path. … No edits needed in civicclerk."

---

## Summary count

| Repo | Files touched | Distinct edits | Net lines added | Net lines removed |
|---|---|---|---|---|
| `civicsuite` (umbrella) | 4 | 9 | +14 | -10 |
| `civicrecords-ai` | 5 | 23 | +23 | -23 |
| `civicclerk` | 0 (SKIPPED) | 0 | 0 | 0 |
| **TOTAL** | **9** | **32** | **+37** | **-33** |

Note on edit count: plan §6 advertised "28 distinct edits" by counting each
in-scope unqualified claim as one logical edit and including .txt mirrors
in the same count. The inventory above lists 32 entries because B.2.x and
B.4.x mirror groups are individually addressable but were summarized as
group rows in this inventory. The underlying number of unique unqualified
claim *lines* narrowed across all surfaces is 28 (matching plan §1
summary).

Plan §6 file-count: 9 unique files (or 11 if .md+.txt are counted
separately, as the executor did in practice). Confirmed.
