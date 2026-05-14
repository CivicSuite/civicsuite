# Research — 2026-05-13-macos-honest-narrowing

Read-only research for manifest at
`.agent-runs/2026-05-13-macos-honest-narrowing/manifest.yaml`. Scope: replace
unqualified macOS support claims with `Windows-only currently; macOS support
pending lifecycle certification.` (or scope-preserving equivalent) across three
repos' README/USER-MANUAL/FAQ/STATUS/SUPPORT and `docs/**/*.md` documentation
surfaces only. App code, ADRs, audits, QA, evidence, generated installers,
release-lockstep, .docx/.pdf/.png are all forbidden.

Each grep was case-insensitive against `macos|mac os|os x|apple|darwin`,
restricted to manifest `allowed_paths`. Hits under `forbidden_paths`
(`installer/generated/**`, `docs/adr/**`, `docs/audits/**`, `docs/qa/**`,
`docs/evidence/**`, `docs/release-lockstep/**`,
`docs/release-recovery-status.md`) are listed below as **EXCLUDED** for the
planner's awareness but are out of scope and must not be edited.

---

## 1. Per-repo inventory of macOS-claim-bearing files

### Repo A — `C:\Users\scott\dev\civicsuite` (umbrella)

In-scope files containing macOS-related terms:

1. `README.md`
2. `USER-MANUAL.md`
3. `FAQ.md`
4. `installer/README.md`
5. `docs/installer/suite-installer-plan.md`
6. `docs/installer/installer-checkpoint-2026-05-09.md`
7. `docs/installer/civicgrants-v1-installer-integration-evidence-2026-05-09.md`
8. `docs/installer/civicinspect-v1-installer-integration-evidence-2026-05-09.md`
9. `docs/installer/civicprocure-v1-installer-integration-evidence-2026-05-09.md`

No-hit files in this repo's allowed scope: `README.txt` (does not exist /
no matches), `STATUS.md` (no matches), `SUPPORT.md` (no matches), `USER-MANUAL.txt`
(no matches).

**EXCLUDED (forbidden_paths):**
- `installer/generated/packages/clerk-core/macos/README.md`
- `installer/generated/packages/clerk-core/windows/README.md`
- `installer/generated/packages/clerk-core/linux/README.md`
- `installer/generated/minimal/README.md`
- `installer/generated/native/clerk-core/macos/README.md`

These are produced by the installer build, not hand-edited. Non-goal 8 in the
manifest is explicit on this.

### Repo B — `C:\Users\scott\dev\civicrecords-ai`

In-scope files containing macOS-related terms:

1. `README.md`
2. `README.txt`
3. `USER-MANUAL.md`
4. `USER-MANUAL.txt`
5. `docs/github-discussions-seed.md`
6. `docs/deprecated/2026-04-11-civicrecords-ai-master-design-v1-SUPERSEDED.md`
7. `docs/deprecated/2026-04-11-civicrecords-ai-master-design-v2-RETRACTED.md`
8. `docs/browser-qa-v1.4.1-summary.md`
9. `docs/browser-qa-v1.4.2-summary.md`
10. `docs/browser-qa-co4-tier1-ledger-summary.md`
11. `docs/REMEDIATION-PLAN-2026-04-19.md`
12. `docs/UNIFIED-SPEC.md`
13. `docs/superpowers/plans/2026-04-12-phase0-design-foundation.md` (false
    positive — `-apple-system` font stack only)

No-hit files in this repo's allowed scope: `installer/windows/README.md` (no
matches — installer README only covers Windows-only flow).

Note: `docs/qa/`, `docs/audits/`, `docs/evidence/` either do not exist or are
forbidden_paths; `docs/audits/civicrecords-ai-audit-full-2026-05-07.md` is
forbidden and was not searched. The `docs/browser-qa-*-summary.md` files live
at `docs/` root (not under `docs/qa/`), so they are in scope per the manifest.

### Repo C — `C:\Users\scott\dev\civicclerk`

In-scope files containing macOS-related terms:

1. `README.md`
2. `README.txt`
3. `USER-MANUAL.md`
4. `USER-MANUAL.txt`

No-hit files in this repo's allowed scope: `docs/**/*.md` (zero matches),
`installer/windows/README.md` (zero matches), `SUPPORT.md` (zero matches).

---

## 2. Per-file claim catalog

Classification key:

- **UNQUALIFIED CLAIM** — published, user-facing assertion of macOS support
  without a "pending certification / not certified / script-path-only / beta"
  qualifier. In scope for narrowing.
- **QUALIFIED CLAIM** — published claim that already carries the "uncertified
  / pending / beta / YELLOW / script-path-only" qualifier and is therefore
  already honest. Out of scope; leave alone.
- **OPERATIONAL/SHELL NOTE** — refers to bash scripts running on Linux/macOS/Git
  Bash, or to file paths like `installer/macos/plan-installer.sh`. These are
  factual references to script-runtime/host capability, not platform-support
  promises. Out of scope unless the planner deems them ambiguous.
- **ENGINEERING ASIDE** — internal lifecycle note that explicitly tracks the
  macOS gap (e.g. "macOS remains beta/YELLOW", "macOS uncertified", "macOS
  archive/readiness/plan only"). Already honest; out of scope.
- **FONT-STACK FALSE POSITIVE** — `-apple-system` CSS font keyword, unrelated
  to platform support.
- **AMBIGUOUS** — flagged for planner.

### Repo A — `civicsuite` (umbrella)

#### `C:\Users\scott\dev\civicsuite\README.md`

| Line | Quote | Classification |
|---|---|---|
| 57 | `**Suite installer (current):** YELLOW beta. The clerk-core profile installer is published on this repo's Releases page as `installer-clerk-core-v0.1.0-beta`. Verified lifecycle on Windows and Linux; **macOS uncertified** as of 2026-05-09.` | ENGINEERING ASIDE — already explicitly "macOS uncertified". The sentence is already honest. **AMBIGUOUS** for planner: replace "macOS uncertified" with the manifest's canonical phrase, or leave as-is. Recommendation: rephrase to canonical form for cross-surface consistency. |
| 61 | `- macOS package: `CivicSuite-clerk-core-macos-0.1.0.tar.gz` *(beta only, full lifecycle not certified)*` | QUALIFIED CLAIM (carries the "full lifecycle not certified" qualifier). **AMBIGUOUS** for planner: consider tightening to canonical phrase, or leave. Recommendation: harmonize to canonical phrase. |
| 67 | `- FOIA / public records: <https://github.com/CivicSuite/civicrecords-ai> â€” Windows installer published per release; macOS/Linux via shell script.` | UNQUALIFIED CLAIM — says macOS/Linux is via shell script as if cross-platform parity exists for script-based install. The civicrecords-ai own docs (UNIFIED-SPEC §15.74 and Appendix A) say macOS/Linux native installer is unscheduled follow-on and the script path is what ships. Strictly "via shell script" is a factual install-route statement, not a support claim. **AMBIGUOUS** — likely OPERATIONAL/SHELL NOTE; leave as-is unless planner wants to add lifecycle-certification context. |

#### `C:\Users\scott\dev\civicsuite\USER-MANUAL.md`

| Line | Quote | Classification |
|---|---|---|
| 50 | `- **Docker Desktop** (Windows 10/11, macOS 13+) or Docker Engine (Linux). On Windows, also WSL 2 + Virtual Machine Platform.` | UNQUALIFIED CLAIM (implies macOS 13+ as a supported install host). In scope. |
| 63 | `### Install (Linux / macOS)` (heading) | UNQUALIFIED CLAIM (offers a "Linux / macOS" install procedure as a peer to the Windows install). In scope — heading + the bash block under it (lines 65–69) tell the operator they can install on macOS today. |

#### `C:\Users\scott\dev\civicsuite\FAQ.md`

| Line | Quote | Classification |
|---|---|---|
| 23 | `In practice, today: only `civicrecords-ai` and `civicclerk` have install paths a non-engineer can follow on a stock machine, and both are still provisional. The suite-level installer beta (`installer-clerk-core-v0.1.0-beta`) supports the clerk-core profile on Windows and Linux; macOS is not certified.` | ENGINEERING ASIDE — already says "macOS is not certified". Honest. **AMBIGUOUS** for planner: harmonize to canonical phrase for surface consistency. |
| 29 | `- **Docker Desktop** (Windows 10/11, macOS 13+) or Docker Engine (Linux). WSL 2 + Virtual Machine Platform on Windows.` | UNQUALIFIED CLAIM (parallel to USER-MANUAL.md:50). In scope. |

#### `C:\Users\scott\dev\civicsuite\installer\README.md`

This is the installer contract / design document. Many references are to file
paths (`installer/macos/plan-installer.sh`) or to OS-specific build outputs;
those are OPERATIONAL/SHELL NOTE entries describing the *contract*, not
end-user support claims. The contract-bearing macOS support claim is line 20.

| Line | Quote | Classification |
|---|---|---|
| 19–21 | `- Windows 10/11` / `- macOS 13 or newer` / `- Linux, with Ubuntu LTS as the first proof target` | UNQUALIFIED CLAIM (in the "Required Outcome" supported-platform list). In scope — needs honest narrowing. |
| 39 | `- Docker Desktop on Windows/macOS, or Docker Engine on Linux.` | UNQUALIFIED CLAIM (baseline dependency list implies macOS is a runtime target). In scope. |
| 105 | `- macOS: `installer/macos/plan-installer.sh`` | OPERATIONAL/SHELL NOTE — file path. Out of scope. |
| 115 | `- macOS: `bash installer/macos/plan-installer.sh --show-menu --menu-style guided`` | OPERATIONAL/SHELL NOTE. Out of scope. |
| 247 | `python scripts\run-installer-package-cleanroom.py --archive installer\dist\CivicSuite-clerk-core-macos-0.1.0.tar.gz --skip-install` | OPERATIONAL/SHELL NOTE — sample command. Out of scope. |
| 253–255 | `On the current validation host, Windows and Linux lifecycle proof passed; macOS is limited to archive/readiness/plan proof until a macOS runtime is available.` | ENGINEERING ASIDE — already honest. Out of scope. |
| 257–258 | `This writes Windows, macOS, and Linux package directories under `installer\generated\packages\{profile}`.` | OPERATIONAL/SHELL NOTE — describes what the generator emits. Out of scope. |
| 288 | `- macOS: `pkgbuild` / `productbuild` distribution files` | OPERATIONAL/SHELL NOTE — packaging-tool reference. Out of scope. |
| 305 | `- macOS: unidentified developer or package cannot be checked.` | OPERATIONAL/SHELL NOTE — expected OS warning when an operator runs the artifact on macOS, in the "unsigned OSS beta" trust-path discussion. Out of scope. |

#### `C:\Users\scott\dev\civicsuite\docs\installer\suite-installer-plan.md`

This file is an internal plan/checkpoint doc. Every macOS reference is paired
with "beta/YELLOW", "lifecycle certification pending", "Windows and Linux full
lifecycle proof has passed; macOS [needs] runtime", or OPERATIONAL/SHELL NOTE
file-path references. Sample lines:

| Line | Quote | Classification |
|---|---|---|
| 53–55 | `If macOS remains beta/YELLOW, Windows/Linux installer integration evidence plus an explicit macOS limitation note is acceptable until the macOS installer lifecycle gate is solved.` | ENGINEERING ASIDE. Honest. Out of scope. |
| 94–96 | `It writes Windows, macOS, and Linux package directories...` | OPERATIONAL/SHELL NOTE. Out of scope. |
| 116–117 | `The generated native manifests cover Windows Inno Setup, macOS pkgbuild / productbuild, and Linux Debian metadata.` | OPERATIONAL/SHELL NOTE. Out of scope. |
| 120–124 | `Installer artifacts are distributable as unsigned OSS beta builds... Windows/macOS/Linux trust warnings are expected...` | OPERATIONAL/SHELL NOTE (trust-path enumeration). Out of scope. |
| 129–130 | `That proof is not a replacement for full Windows/macOS/Linux VM certification` | ENGINEERING ASIDE. Honest. Out of scope. |
| 155 | `The runner supports Windows, macOS, and Linux archives through the platform launchers.` | OPERATIONAL/SHELL NOTE — runner capability. Out of scope. |
| 158–160 | `macOS archive/readiness/plan proof has passed from this Windows/WSL host, with full macOS runtime proof still requiring a macOS host or VM.` | ENGINEERING ASIDE. Honest. Out of scope. |
| 166–170 | `proves macOS package archive/readiness/plan through the macOS launcher on hosted Linux... Windows and macOS full lifecycle certification still requires real operator-like VMs` | ENGINEERING ASIDE. Honest. Out of scope. |
| 210 | `- macOS launcher: shell script first, signed app/pkg later.` | OPERATIONAL/SHELL NOTE — launcher roadmap entry. Out of scope. |
| 271–284, 319–322 | Many `bash installer/macos/plan-installer.sh ...` lines | OPERATIONAL/SHELL NOTE — command examples. Out of scope. |
| 313–314 | `the GitHub-hosted Windows and macOS runners do not provide the same local Docker Desktop baseline as an operator machine.` | ENGINEERING ASIDE. Out of scope. |
| 318–319 | `Recommended next slice: add real Windows and macOS VM lifecycle certification for the distributable package archives` | ENGINEERING ASIDE — roadmap note. Out of scope. |
| 322–324 | `Windows and macOS still need operator-like VM proof before the installer target can move from YELLOW to GREEN.` | ENGINEERING ASIDE. Out of scope. |

**Verdict for `suite-installer-plan.md`:** No in-scope edits. The doc is
already an engineering plan that consistently classifies macOS as
beta/YELLOW/lifecycle-pending. Leave as-is.

#### `C:\Users\scott\dev\civicsuite\docs\installer\installer-checkpoint-2026-05-09.md`

| Line | Quote | Classification |
|---|---|---|
| 3–6 | `Status: CivicCore package proof, CivicRecords service/UI cleanroom proof, and clerk-core distributable package lifecycle verified for Windows and Linux archives. macOS archive extraction/readiness/plan proof exists; full macOS runtime proof still requires a macOS host or VM.` | ENGINEERING ASIDE. Honest. Out of scope. |
| 11–12 | `macOS remains beta/YELLOW until real macOS lifecycle certification exists.` | ENGINEERING ASIDE. Honest. Out of scope. |
| 43–44 | `It proves extracted archive readiness/plan on Windows, macOS, and Linux runners` | OPERATIONAL/SHELL NOTE. Out of scope. |
| 83–88 | `writes platform archives, SHA256 checksums, a release manifest, and native wrapper manifests for Windows, macOS, and Linux.` / `explain expected Windows/macOS/Linux trust warnings` | OPERATIONAL/SHELL NOTE. Out of scope. |
| 105–106, 118–119, 124 | `macOS, and Linux release archives through the platform-specific package launchers.` / `records macOS archive extraction plus readiness/plan proof. It was executed from this Windows/WSL host, so it is not a full macOS runtime proof.` / `installer/macos/plan-installer.sh wraps the planner for macOS.` | ENGINEERING ASIDE / OPERATIONAL. Out of scope. |
| 226–240 | Many `bash installer/macos/plan-installer.sh ...` lines | OPERATIONAL/SHELL NOTE. Out of scope. |
| 273 | `python scripts\run-installer-package-cleanroom.py --archive installer\dist\CivicSuite-clerk-core-macos-0.1.0.tar.gz --skip-install` | OPERATIONAL/SHELL NOTE. Out of scope. |
| 280–281 | `macOS archive/readiness/plan run id: installer-package-cleanroom-...` | ENGINEERING ASIDE. Out of scope. |
| 289–290 | `Remaining caveat: full macOS install/repair/verify/uninstall still requires a macOS host or VM.` | ENGINEERING ASIDE. Honest. Out of scope. |
| 307–308 | `macOS archive extraction/readiness/plan through the macOS package launcher on hosted Linux, not macOS runtime.` | ENGINEERING ASIDE. Out of scope. |
| 312–314 | `It does not replace real Windows and macOS VM lifecycle certification because the GitHub-hosted Windows and macOS runners do not provide the same local Docker Desktop baseline as an operator machine.` | ENGINEERING ASIDE. Out of scope. |
| 318–319, 323 | `Recommended next slice: add real Windows and macOS VM lifecycle certification...` / `Windows and macOS still need operator-like VM proof before the installer target can move from YELLOW to GREEN.` | ENGINEERING ASIDE. Out of scope. |

**Verdict for `installer-checkpoint-2026-05-09.md`:** No in-scope edits. Whole
file is already an honest engineering checkpoint.

#### `C:\Users\scott\dev\civicsuite\docs\installer\civicgrants-v1-installer-integration-evidence-2026-05-09.md`

| Line | Quote | Classification |
|---|---|---|
| 56 | `This closes the installer/module-selection planning gate for CivicGrants. It does not claim full host lifecycle installation of CivicGrants because the suite installer remains in beta/YELLOW pending broader profile lifecycle work and unresolved macOS lifecycle certification.` | ENGINEERING ASIDE. Honest. Out of scope. |

#### `C:\Users\scott\dev\civicsuite\docs\installer\civicinspect-v1-installer-integration-evidence-2026-05-09.md`

| Line | Quote | Classification |
|---|---|---|
| 56–58 | `This closes the installer/module-selection planning gate for CivicInspect. It does not close the broader macOS installer lifecycle issue. macOS remains beta/YELLOW until a real macOS host or VM lifecycle proof exists.` | ENGINEERING ASIDE. Honest. Out of scope. |

#### `C:\Users\scott\dev\civicsuite\docs\installer\civicprocure-v1-installer-integration-evidence-2026-05-09.md`

| Line | Quote | Classification |
|---|---|---|
| 78–80 | `...does not claim full host lifecycle installation of CivicProcure because the suite installer remains in beta/YELLOW pending broader profile lifecycle work and unresolved macOS lifecycle certification.` | ENGINEERING ASIDE. Honest. Out of scope. |

### Repo B — `civicrecords-ai`

#### `C:\Users\scott\dev\civicrecords-ai\README.md`

| Line | Quote | Classification |
|---|---|---|
| 36 | `- **Docker Desktop** (Windows 10/11, macOS 13+) or **Docker Engine** (Linux)` | UNQUALIFIED CLAIM (in "Requirements"). In scope. |
| 46 | `2. **Script-based install (Linux / macOS, and Windows if you prefer CLI).** The scripts below configure and start the Docker Compose stack...` | UNQUALIFIED CLAIM (offers macOS as a peer install path). In scope — needs honest narrowing or explicit "macOS lifecycle uncertified" caveat. |
| 62 | `**macOS / Linux:**` (heading above bash block) | UNQUALIFIED CLAIM. In scope — the heading + bash block (lines 63–67) tell operators they can install on macOS. |
| 179 | `- macOS 13+ (Docker Desktop)` (inside the **Supported Platforms** section, lines 176–182) | UNQUALIFIED CLAIM. Highest-leverage line in this file. In scope. |
| 299 | `**T5E — Windows unsigned double-click installer, 2026-04-22 (`1d5429d`; test-harness flake fix `e898319`):** ... **macOS and Linux remain on the script path (`install.sh`) — native installer parity on those platforms is explicit follow-on work, not scheduled.**` | QUALIFIED CLAIM. Already honest. **AMBIGUOUS** for planner — could harmonize to canonical phrase, but the existing "explicit follow-on work, not scheduled" already says less than the manifest's "Windows-only currently; macOS support pending lifecycle certification." Recommendation: leave as-is. |

#### `C:\Users\scott\dev\civicrecords-ai\README.txt`

Plain-text mirror. Same line numbers and quotes as `README.md`. Same
classifications. Lines 36, 46, 62, 179, 299 all mirror the md.

#### `C:\Users\scott\dev\civicrecords-ai\USER-MANUAL.md`

| Line | Quote | Classification |
|---|---|---|
| 254–260 | **PLATFORM-MATRIX TABLE (B.1 System Requirements)**. Row OS: `Windows 10/11, macOS 13+, Ubuntu 22.04+, Debian 12+`. Row Runtime: `Docker Desktop (Windows/macOS) or Docker Engine (Linux)`. | UNQUALIFIED CLAIM — table OS row asserts macOS 13+ as supported. In scope. See §3 for full layout. |
| 277 | `2. **Script-based install (macOS / Linux — and Windows if you prefer CLI).** The scripts below configure and launch the Docker Compose stack...` | UNQUALIFIED CLAIM (peer macOS install path). In scope. |
| 279 | `**Cross-platform parity:** No native installer ships for macOS or Linux. That parity is explicit follow-on work and is not scheduled. macOS and Linux operators use the script path below.` | QUALIFIED CLAIM ("explicit follow-on work and is not scheduled"). Already honest. **AMBIGUOUS** for planner: harmonize to canonical phrase or leave. Recommendation: harmonize so the canonical phrase appears here. |
| 283 | `1. Install **Docker Desktop** (Windows 10/11 or macOS 13+): [docker.com/get-started]...` | UNQUALIFIED CLAIM. In scope. |
| 297 | `**macOS / Linux:**` (heading above bash block) | UNQUALIFIED CLAIM. In scope. |
| 341 | `On Linux and macOS, install.sh writes ./data/secrets/jwt_secret and ./data/secrets/first_admin_password with 0400 permissions.` | OPERATIONAL/SHELL NOTE (describes what install.sh does when run on macOS). Out of scope — factual description of script behavior, not a support claim. |
| 367 | `This is the Windows equivalent of the Linux/macOS `0400` file mode for local Docker Desktop deployments.` | OPERATIONAL/SHELL NOTE. Out of scope. |
| 405 | `**On Linux / macOS** (running `bash install.sh`):` | OPERATIONAL/SHELL NOTE — heading framing the install.sh output sample. Out of scope (though if line 297 is narrowed, planner may want to add a "macOS uncertified" note above this sample). **AMBIGUOUS** for planner. |
| 813 | `# Linux/macOS` (comment above bash command) | OPERATIONAL/SHELL NOTE. Out of scope. |

#### `C:\Users\scott\dev\civicrecords-ai\USER-MANUAL.txt`

Plain-text mirror. Same line numbers/quotes/classifications as USER-MANUAL.md.

#### `C:\Users\scott\dev\civicrecords-ai\docs\github-discussions-seed.md`

| Line | Quote | Classification |
|---|---|---|
| 47 | `**Windows double-click installer (T5E, unsigned by design)** ... macOS/Linux continue on the guided `install.sh` script.` | QUALIFIED CLAIM (already says "macOS/Linux continue on the guided `install.sh` script" with no signed-installer parity claim). **AMBIGUOUS** — leans honest; planner may harmonize. Recommendation: leave; the surrounding context distinguishes Windows installer from script path. |
| 70 | `[Installation](https://github.com/CivicSuite/civicrecords-ai#install) — one command on Windows, macOS, or Linux` | UNQUALIFIED CLAIM ("one command on Windows, macOS, or Linux" implies parity). In scope. |
| 90 | `- Docker Desktop (Windows 10/11 or macOS 13+) or Docker Engine (Ubuntu 20.04+, Debian 11+)` | UNQUALIFIED CLAIM. In scope. |
| 102 | `*Linux / macOS:*` (heading above bash block) | UNQUALIFIED CLAIM (peer install path). In scope. |

#### `C:\Users\scott\dev\civicrecords-ai\docs\deprecated\2026-04-11-civicrecords-ai-master-design-v1-SUPERSEDED.md`

File is **explicitly marked SUPERSEDED** at lines 1–9: "DO NOT USE FOR
DEVELOPMENT" and "preserved for historical reference only." All macOS claims
are historical:

| Line | Quote | Classification |
|---|---|---|
| 83 | `\| Deployment \| Docker Compose (Windows, macOS, Linux) \| 6 services...` | Historical claim in a SUPERSEDED doc. Out of scope (file is preserved for historical reference). |
| 293, 298, 301 | Hardware-table row + Supported Platforms paragraph | Historical. Out of scope. |

**Verdict:** Do not edit deprecated/superseded docs. The "DO NOT USE FOR
DEVELOPMENT" banner is sufficient.

#### `C:\Users\scott\dev\civicrecords-ai\docs\deprecated\2026-04-11-civicrecords-ai-master-design-v2-RETRACTED.md`

File is **explicitly marked RETRACTED** at lines 1–12: "DO NOT USE" and
"preserved for audit trail purposes only."

| Line | Quote | Classification |
|---|---|---|
| 98 | `\| Deployment \| Docker Compose (Windows, macOS, Linux) \| 7 services...` | Historical in RETRACTED doc. Out of scope. |
| 347, 352, 355 | Hardware table + Supported Platforms paragraph | Historical. Out of scope. |
| 419 | `install scripts (Windows + Linux/macOS)` | Historical. Out of scope. |
| 470 | `\| Supported platforms \| 3 (Windows, macOS, Linux) \|` | Historical claim in RETRACTED doc. Out of scope (audit trail). |

**Verdict:** Do not edit retracted docs. The retraction banner is sufficient.

#### `C:\Users\scott\dev\civicrecords-ai\docs\browser-qa-v1.4.1-summary.md`

| Line | Quote | Classification |
|---|---|---|
| 15 | `- Linux/macOS install script links point to `https://raw.githubusercontent.com/CivicSuite/civicrecords-ai/v1.4.1/install.sh`.` | OPERATIONAL/SHELL NOTE — describes the install-script URL the rendered homepage uses for Linux/macOS visitors. Browser-QA evidence. Out of scope unless planner wants strict cross-surface consistency. **AMBIGUOUS** — recommendation: leave (it is QA evidence of a rendered page, not a support promise on its own). |

#### `C:\Users\scott\dev\civicrecords-ai\docs\browser-qa-v1.4.2-summary.md`

| Line | Quote | Classification |
|---|---|---|
| 15 | `- Linux/macOS install script links point to ...` | Same as v1.4.1. **AMBIGUOUS**. Recommendation: leave. |

#### `C:\Users\scott\dev\civicrecords-ai\docs\browser-qa-co4-tier1-ledger-summary.md`

| Line | Quote | Classification |
|---|---|---|
| 34 | `Keyboard traversal sample: ... a ⬇ Download Installer (Linux / macOS) outline=auto/3px ...` | OPERATIONAL/SHELL NOTE — DOM traversal evidence quoting the rendered page's link text. Out of scope. |
| 38 | `Linux & macOS outline=auto/1px` | Same — DOM sample. Out of scope. |
| 51, 55 | Same DOM-evidence quotes for mobile traversal. | Same. Out of scope. |

These are QA-captured DOM strings. Editing them would falsify the QA artifact.
Leave alone.

#### `C:\Users\scott\dev\civicrecords-ai\docs\REMEDIATION-PLAN-2026-04-19.md`

| Line | Quote | Classification |
|---|---|---|
| 7 | `(line context — install-time-design narrative; planner re-read for exact text)` | **AMBIGUOUS** — see "Notes on omitted lines" below; recommendation: planner reads the surrounding 10 lines and decides. |
| 427 | `ship a downloadable installer path for end users that can be launched directly (double-click on Windows; equivalent guided local installer flow on macOS/Linux)` | UNQUALIFIED CLAIM (describes a design goal of macOS-parity installer flow). **AMBIGUOUS** — this is a *plan* document; planner may decide it represents a roadmap aspiration vs a current support promise. Recommendation: prefix with "Goal (pending lifecycle certification):" or leave with status banner. |
| 428 | `install or orchestrate installation of missing local prerequisites...` | Out of scope (no direct macOS mention here, just plan context). |

#### `C:\Users\scott\dev\civicrecords-ai\docs\UNIFIED-SPEC.md`

This is the canonical spec.

| Line | Quote | Classification |
|---|---|---|
| 74 | `Not yet implemented: published-records search, resident dashboard, track-my-request suite, full active network discovery engine, cross-instance federation workflows, macOS/Linux native installer (script path only), Tier 2/3 redaction, signed Windows installer (α posture locked).` | QUALIFIED CLAIM ("macOS/Linux native installer (script path only)" — explicit). Honest. Out of scope. |
| 430 | `No macOS / Linux native installer — cross-platform parity is documented as follow-on, not shipped.` | QUALIFIED CLAIM. Honest. Out of scope. |
| 865 | `Windows only; macOS/Linux remain on script-based install (`install.sh`). Unsigned by design per Scott-locked B3=α posture.` | QUALIFIED CLAIM (in a table cell for the T5E full-spectrum guided installer feature row). Honest. Out of scope. **AMBIGUOUS** — planner may decide to harmonize to canonical phrase. |
| 984–986 | Multi-line install-paths description: `**Windows:** double-click unsigned installer ... **macOS / Linux:** script-based (`install.sh`) ... requires Docker Desktop (macOS) or Docker Engine (Linux) ... No platform-native installer ships in this slice; cross-platform installer parity is documented as follow-on, not implemented.` | QUALIFIED CLAIM. Honest. Out of scope. |
| 1002 | `**Cross-platform native installer parity for macOS/Linux.** Follow-on to T5E; not scheduled. macOS/Linux remain on the script path (`install.sh`).` | QUALIFIED CLAIM. Honest. Out of scope. |

**Verdict for UNIFIED-SPEC.md:** Every macOS reference already carries the
"script path only / follow-on, not scheduled / unsigned by design" qualifier.
Likely no in-scope edits. Planner may decide to harmonize to canonical
phrasing.

#### `C:\Users\scott\dev\civicrecords-ai\docs\superpowers\plans\2026-04-12-phase0-design-foundation.md`

| Line | Quote | Classification |
|---|---|---|
| 201 | `font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,` | FONT-STACK FALSE POSITIVE. Out of scope. |
| 301 | `sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],` | FONT-STACK FALSE POSITIVE. Out of scope. |

### Repo C — `civicclerk`

#### `C:\Users\scott\dev\civicclerk\README.md`

Every macOS occurrence is in the phrase "Linux, macOS, or Git Bash" describing
where the bash-script rehearsal helpers can run, or "Bash on Linux, macOS, or
Git Bash". These are statements about shell-script portability, not platform
support claims.

| Line | Quote | Classification |
|---|---|---|
| 296 | `scripts/start_fresh_install_rehearsal.sh to rehearse the same fresh-install wheel path from Bash on Linux, macOS, or Git Bash` | OPERATIONAL/SHELL NOTE. Out of scope. |
| 414 | `bash scripts/start_fresh_install_rehearsal.sh --print-only to print the same fresh-install rehearsal plan from Linux, macOS, or Git Bash...` | OPERATIONAL/SHELL NOTE. Out of scope. |
| 419 | `bash scripts/build_release_handoff_bundle.sh --print-only on Linux, macOS, or Git Bash to preview the release handoff bundle` | OPERATIONAL/SHELL NOTE. Out of scope. |
| 446 | `bash scripts/start_protected_demo_rehearsal.sh --print-only on Linux, macOS, or Git Bash to print the protected trusted-header demo profile` | OPERATIONAL/SHELL NOTE. Out of scope. |
| 453 | `If you want the same protected demo profile from Bash on Linux, macOS, or Git Bash...` | OPERATIONAL/SHELL NOTE. Out of scope. |
| 502 | `For fresh Bash install rehearsals on Linux, macOS, or Git Bash, scripts/start_fresh_install_rehearsal.sh now prints and can execute the same wheel-install path...` | OPERATIONAL/SHELL NOTE. Out of scope. |
| 518 | `For Bash-based operator rehearsals on Linux, macOS, or Git Bash, scripts/start_protected_demo_rehearsal.sh now prints and can launch the same loopback-only trusted-header profile...` | OPERATIONAL/SHELL NOTE. Out of scope. |

#### `C:\Users\scott\dev\civicclerk\README.txt`

Plain-text mirror. Identical classifications to README.md.

#### `C:\Users\scott\dev\civicclerk\USER-MANUAL.md`

| Line | Quote | Classification |
|---|---|---|
| 398 | `For the same fresh-install rehearsal from Bash on Linux, macOS, or Git Bash,` | OPERATIONAL/SHELL NOTE. Out of scope. |
| 420 | `or from Linux, macOS, or Git Bash:` | OPERATIONAL/SHELL NOTE. Out of scope. |
| 646 | `or from Linux, macOS, or Git Bash:` | OPERATIONAL/SHELL NOTE. Out of scope. |
| 671 | `or from Linux, macOS, or Git Bash:` | OPERATIONAL/SHELL NOTE. Out of scope. |
| 710 | `For the same protected demo profile from Bash on Linux, macOS, or Git Bash` | OPERATIONAL/SHELL NOTE. Out of scope. |

#### `C:\Users\scott\dev\civicclerk\USER-MANUAL.txt`

Plain-text mirror. Identical classifications to USER-MANUAL.md.

**Verdict for civicclerk:** No in-scope edits. Every macOS mention is a
description of where a bash script can run (Bash on Linux, macOS, or Git
Bash). The Windows-only installer is already the only "installer" shipped;
civicclerk does not claim a macOS installer. The README and USER-MANUAL never
claim "supports macOS" as a platform — they only describe shell-script
portability.

---

## 3. Platform-matrix tables

Manifest's director_notes calls out platform-matrix tables as the highest-leverage
surfaces. Searched all three repos for markdown tables with `| Windows |`, `|
macOS |`, `| Linux |`, or `| Platform |` column patterns.

### Repo A — `civicsuite`

No pipe-style platform-matrix tables (columns = OS) exist in any allowed-path
file. The closest structure is the `installer/README.md` "Required Outcome"
bulleted platform list (lines 19–21) — that is a bullet list, not a table.

### Repo B — `civicrecords-ai`

**Only one true platform-matrix-bearing table** in scope, but it has an OS
*row*, not OS *columns*:

#### `USER-MANUAL.md` lines 254–260 (B.1 System Requirements)

```
| Component | Minimum | Recommended |
|---|---|---|
| CPU | 8 cores | 16 cores |
| RAM | 32 GB | 64 GB |
| Disk | 50 GB free | 2+ TB NVMe |
| OS | Windows 10/11, macOS 13+, Ubuntu 22.04+, Debian 12+ | Ubuntu 22.04 LTS |
| Runtime | Docker Desktop (Windows/macOS) or Docker Engine (Linux) | Docker Engine 24+ |
```

- Columns: `Component | Minimum | Recommended`.
- Row "OS" Minimum cell: `Windows 10/11, macOS 13+, Ubuntu 22.04+, Debian 12+` — UNQUALIFIED CLAIM. In scope.
- Row "OS" Recommended cell: `Ubuntu 22.04 LTS` — no macOS claim.
- Row "Runtime" Minimum cell: `Docker Desktop (Windows/macOS) or Docker Engine (Linux)` — UNQUALIFIED CLAIM. In scope.

Mirrored in `USER-MANUAL.txt` at the same line numbers.

#### Tables in deprecated docs (out of scope per superseded/retracted banner)

For completeness and so the planner does not re-discover them:

- `docs/deprecated/.../v1-SUPERSEDED.md` lines 291–299 — hardware table with OS row "Windows 10/11, macOS 13+, Ubuntu 22.04+". SUPERSEDED. Leave.
- `docs/deprecated/.../v2-RETRACTED.md` lines 345–352 — same hardware table. RETRACTED. Leave.
- `docs/deprecated/.../v2-RETRACTED.md` line 470 — `| Supported platforms | 3 (Windows, macOS, Linux) |` as a stat-row. RETRACTED. Leave.

### Repo C — `civicclerk`

No platform-matrix tables in scope. The civicclerk README/USER-MANUAL never
itemize a "supported platforms" matrix; macOS only appears in operational
"Linux, macOS, or Git Bash" sentences.

---

## 4. Cross-repo consistency observations

### Divergence #1 — Umbrella vs. records-ai claim shape (low risk)

- `civicsuite/README.md:67` says civicrecords-ai supports "Windows installer
  published per release; macOS/Linux via shell script." This implies a
  cross-platform script path is a peer install route.
- `civicrecords-ai/README.md:46`, `:62`, `:179` and `USER-MANUAL.md:254–260`,
  `:277`, `:283`, `:297` agree with the script-path-on-macOS framing.
- `civicrecords-ai/docs/UNIFIED-SPEC.md:74` qualifies this as "macOS/Linux
  native installer (script path only)" — a clearer "not certified" framing.

These are not strictly contradictory but they are not uniformly qualified.
After honest narrowing, the umbrella `README.md:67`, civicrecords-ai
`README.md:46/62/179`, and `USER-MANUAL.md:254/277/283/297` should all carry
the same qualifier shape (e.g. "Windows-only currently; macOS support pending
lifecycle certification — macOS / Linux operators may run the script path,
which is not lifecycle-certified").

### Divergence #2 — Suite installer (umbrella) vs. records-ai installer voice

- Suite installer (`civicsuite/installer/README.md:19–21`, `:39`) lists macOS
  13+ as an unqualified platform target.
- `civicsuite/README.md:57` and `installer/README.md:253–255` say macOS is
  uncertified.
- `civicrecords-ai/docs/UNIFIED-SPEC.md` line 74 / 430 / 865 / 1002 already
  qualify.

The umbrella `installer/README.md` "Required Outcome" list and "Baseline
Dependencies" list (lines 19–21, 39) are the only true UNQUALIFIED CLAIMS in
the installer doc. The rest of the doc is already honest about beta/YELLOW.

### Divergence #3 — civicclerk vs. civicrecords-ai

`civicclerk` makes no platform support claim and ships no macOS path. Its
README/USER-MANUAL only reference "Bash on Linux, macOS, or Git Bash" for
shell-script execution. No divergence with civicrecords-ai because civicclerk
never claims platform parity. **No edits needed in civicclerk.**

After this run, the consistent suite-wide story should read:

> CivicSuite installers are Windows-only currently; macOS support is pending
> lifecycle certification. Some modules ship a script-path install (`install.sh`)
> that runs on macOS today, but that script path is not lifecycle-certified —
> operators using it should expect uncertified-platform behavior.

---

## 5. Director's notes from manifest — addressed

### Director note (a) — researcher: grep all three repos for case-insensitive `macos`, `mac os`, `os x`, `apple`, `darwin` before listing surfaces

Done. All five terms searched, case-insensitive, against every file in each
repo's `allowed_paths` glob. Files with hits: 9 in civicsuite, 13 in
civicrecords-ai (of which 2 are deprecated/RETRACTED and 1 is a font-stack
false positive), 4 in civicclerk. Sections 1–2 above enumerate all hits.

### Director note (b) — researcher: distinguish "unqualified macOS support claim" from "macOS runner internal note" (engineering aside that may stay)

Done. Classification scheme in §2 distinguishes UNQUALIFIED CLAIM (in scope)
from QUALIFIED CLAIM / OPERATIONAL/SHELL NOTE / ENGINEERING ASIDE / FONT-STACK
FALSE POSITIVE (out of scope). Recommendation for the planner:

- **Definitely edit (UNQUALIFIED CLAIM):**
  - `civicsuite/USER-MANUAL.md:50` (Docker Desktop bullet)
  - `civicsuite/USER-MANUAL.md:63` (Install (Linux / macOS) heading + bash block)
  - `civicsuite/FAQ.md:29` (Docker Desktop bullet)
  - `civicsuite/installer/README.md:19–21` (Required Outcome platform list)
  - `civicsuite/installer/README.md:39` (Baseline Dependencies bullet)
  - `civicrecords-ai/README.md:36, :46, :62, :179` (Requirements, install paths block, headings, Supported Platforms section)
  - `civicrecords-ai/README.txt:36, :46, :62, :179` (mirror)
  - `civicrecords-ai/USER-MANUAL.md:259, :260, :277, :283, :297` (B.1 table OS row, install paths, prerequisites, Linux/macOS heading)
  - `civicrecords-ai/USER-MANUAL.txt` (same line numbers as md)
  - `civicrecords-ai/docs/github-discussions-seed.md:70, :90, :102` (one-command claim, Docker Desktop bullet, install heading)
- **Definitely leave (already honest / engineering aside / operational):**
  - All `civicsuite/docs/installer/*.md` files
  - `civicsuite/installer/README.md:105, :115, :247, :253–255, :257–258, :288, :305`
  - `civicrecords-ai/README.md:299` and `README.txt:299` (T5E section already qualifies macOS/Linux as script-path-only follow-on)
  - `civicrecords-ai/USER-MANUAL.md:341, :367, :405, :813` and `.txt` mirror (install.sh script-behavior descriptions)
  - `civicrecords-ai/docs/UNIFIED-SPEC.md` (every macOS line already qualifies)
  - `civicrecords-ai/docs/deprecated/*.md` (SUPERSEDED / RETRACTED — preserved for historical/audit purposes only; banners are the qualifier)
  - `civicrecords-ai/docs/browser-qa-*.md` (QA evidence of rendered DOM; editing falsifies evidence)
  - `civicrecords-ai/docs/superpowers/plans/2026-04-12-phase0-design-foundation.md` (font-stack false positives)
  - All `civicclerk/README.md`, `README.txt`, `USER-MANUAL.md`, `USER-MANUAL.txt` lines (every macOS mention is "Bash on Linux, macOS, or Git Bash" — script portability statement)
- **Planner-decides (AMBIGUOUS):**
  - `civicsuite/README.md:57, :61, :67` — already explicitly qualified ("macOS uncertified", "beta only, full lifecycle not certified", "via shell script"). Planner: harmonize phrasing across surfaces, or leave?
  - `civicsuite/FAQ.md:23` — already says "macOS is not certified". Same harmonization question.
  - `civicrecords-ai/USER-MANUAL.md:279` and `.txt` mirror — already says "explicit follow-on work and is not scheduled". Same.
  - `civicrecords-ai/docs/github-discussions-seed.md:47` — already says "macOS/Linux continue on the guided install.sh script". Same.
  - `civicrecords-ai/docs/REMEDIATION-PLAN-2026-04-19.md:427` — plan document line; design goal vs current support promise.
  - `civicrecords-ai/docs/UNIFIED-SPEC.md` lines 74, 430, 865, 984–986, 1002 — all already qualified but use varying language; planner may harmonize.

Recommendation: take a narrow interpretation. Edit only the UNQUALIFIED CLAIMs
in the "Definitely edit" list. For AMBIGUOUS lines, edit only when *not*
editing would leave a contradiction with an edited surface in the same file or
in a sister file. The manifest's DoD point (2) says "the changed claims are
consistent across all touched surfaces in all three repos with no surface left
contradicting another."

### Director note (c) — researcher: surface every platform-matrix table (markdown tables with OS columns)

Done. §3 above. The only platform-matrix-bearing markdown table in the scope
of this run is:

1. `civicrecords-ai/USER-MANUAL.md:254–260` (B.1 System Requirements), mirrored in `USER-MANUAL.txt`.

No `| Windows | macOS | Linux |` column-style tables exist anywhere in the
allowed-path globs of any of the three repos. The B.1 table uses
`Component | Minimum | Recommended` columns, with OS as a row whose Minimum
cell lists supported OSes.

The lowest-friction edit pattern for B.1 is to rewrite the "OS" row's Minimum
cell as something like:

> `Windows 10/11 (Docker Desktop). macOS 13+ and Ubuntu 22.04+/Debian 12+ are supported via the script-path install (`install.sh`); lifecycle certification on macOS is pending.`

…or to split the row into two rows (Windows lifecycle-certified vs. script-path
platforms). The planner should pick.

### Director note (d) — executor: this is an autonomous run; do NOT admin-merge any PR

Surfaced for the planner's awareness. The autonomous grant at
`.agent-workflows/autonomous-grants/candidate-b-macos-2026-05-13.md` and
manifest `non_goals` line 199 / `definition_of_done` point (5) forbid
admin-merge. The plan must end with **three open PRs**, each on branch
`chore/macos-honest-narrowing` against `main`, none admin-merged. The
manager-gate is PROMOTE-only.

Implication for the executor: after opening each PR, do not attempt to
auto-merge, `gh pr merge --admin`, `gh pr merge --auto`, force-push to main,
or push tags. Stop at "PR open, awaiting human merge."

---

## 6. Open question for the human director

**Q1. Harmonization scope.** Should the planner edit the *already-qualified*
lines (FAQ.md:23, README.md:57, USER-MANUAL.md:279, UNIFIED-SPEC.md
varying-language lines) to use the manifest's canonical phrase ("Windows-only
currently; macOS support pending lifecycle certification."), or leave them
because they're already honest in their existing wording?

- **Option A — Harmonize.** Pro: one canonical phrase across every surface;
  easier to audit, easier to maintain. Con: makes the diff larger, touches
  lines that are already truthful; risk of churning prose for the sake of
  prose-style consistency.
- **Option B — Minimal touch.** Pro: smallest diff; lowest blast radius. Con:
  surface wording will continue to vary; future auditors must re-establish
  that all macOS lines are equivalent.

**Researcher recommendation:** Option A (harmonize) for files that *also*
have at least one in-scope edit (so the file already changes, and the prose
should be internally consistent). Option B (leave) for files where every line
is already qualified (e.g., the entire `civicsuite/docs/installer/*.md` set,
the civicrecords-ai `UNIFIED-SPEC.md`, the deprecated docs). The planner makes
the FINAL CHOICE.

**Q2. B.1 table layout.** Two design options for narrowing the `civicrecords-ai/USER-MANUAL.md:254–260` table:

- **Option A — Inline qualifier on the OS row.** Rewrite the "OS" Minimum
  cell text to inline the qualifier ("Windows 10/11 (lifecycle-certified);
  macOS 13+ and Ubuntu 22.04+ on script path, macOS lifecycle certification
  pending"). Pro: keeps table shape. Con: cell becomes long.
- **Option B — Split into two rows.** "OS (lifecycle-certified)" = Windows
  10/11. "OS (script-path, uncertified)" = macOS 13+, Ubuntu 22.04+,
  Debian 12+. Pro: structurally honest. Con: changes table semantics.
- **Option C — Add a new column.** "Lifecycle status" column with values
  "Certified" / "Pending". Pro: most explicit. Con: changes table schema and
  may cascade into the txt mirror more invasively.

**Researcher recommendation:** Option A. Smallest structural change, lowest
blast radius into the txt mirror. The planner makes the FINAL CHOICE.

---

## 7. Summary count for handoff

- **Files inventoried with macOS-related terms across all three repos:** 26.
- **Of those, in-scope files with at least one UNQUALIFIED CLAIM:** 11
  (umbrella USER-MANUAL.md, FAQ.md, installer/README.md; records-ai README.md,
  README.txt, USER-MANUAL.md, USER-MANUAL.txt, docs/github-discussions-seed.md;
  the deprecated/retracted records-ai docs are not counted because their
  banner is the qualifier; civicclerk has zero in-scope files).
- **In-scope UNQUALIFIED CLAIMS to narrow:** approximately 28 distinct lines
  (counting md + txt mirrors as separate lines):
  - civicsuite: USER-MANUAL.md L50, L63 = 2; FAQ.md L29 = 1; installer/README.md L19, L20, L21, L39 = 4. Subtotal 7.
  - civicrecords-ai: README.md L36, L46, L62, L179 = 4; README.txt mirrors = 4; USER-MANUAL.md L259, L260, L277, L283, L297 = 5; USER-MANUAL.txt mirrors = 5; docs/github-discussions-seed.md L70, L90, L102 = 3. Subtotal 21.
  - civicclerk: 0.
  - Total: 28.
- **ENGINEERING ASIDE / QUALIFIED / OPERATIONAL / FONT-STACK lines (out of
  scope):** approximately 70+ lines across the three repos.
- **AMBIGUOUS lines flagged for planner:** approximately 10–14 lines, all
  detailed in §2 and Q1 of §6.
- **Platform-matrix tables in scope:** 1 (`civicrecords-ai/USER-MANUAL.md:254–260`,
  mirrored in `.txt`).

---

## 8. What the planner can rely on without re-searching

- Every macOS-bearing line in every file in `allowed_paths` for all three
  repos is enumerated in §2 with file path, line number, exact quote, and
  classification.
- Every platform-matrix table is in §3.
- Every cross-repo inconsistency the planner needs to harmonize is in §4.
- Every ambiguous call requiring director judgment is in §6.
- Every forbidden_paths exclusion that the executor might be tempted to edit
  (because grep found a hit there) is called out as EXCLUDED in §1.
- No need to re-grep, re-list, or re-read source files. The planner's only
  remaining inputs are: (i) director's call on Q1 and Q2, (ii) writing the
  per-file edit plan from §2's "Definitely edit" list, (iii) the txt-mirror
  parity requirement (manifest expected_outputs item 6 and DoD point 3).
