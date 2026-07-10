# Phase D — accessibility acceptance run (2026-07-09)

Run against the **released** CivicSuite Windows Local v1.0.2 MSI in a clean
Windows Sandbox. MSI SHA-256 `bbdeb1b69e846d3ccb8c961502f4b2f158e92623e7bf4dfa9d4c4bf2f9a0fd02`
— byte-identical to the published release asset.

This run executes the `accessibility_acceptance` items that
`docs/roadmap/civicaccess-citycore-integration/phase-D-cleanvm-accessibility-dod.manifest.yaml`
requires and that the previous Phase D evidence kit
(`docs/evidence/civicaccess-v102-phaseD-2026-07-02/`) did **not** contain.

## Verdict: accessibility_passed = FAIL

Four of five acceptance items pass on the real installed UI. One fails, and two
shipped defects were found that block a clean-machine install outright.

| Manifest item | Result | Evidence |
|---|---|---|
| Keyboard-only traversal, focus order, `:focus-visible` | **PASS** | `a11y-results.json` → 59 tab stops on the staff Accessibility view, 39 on the public area; **0** focusable elements without a visible focus indicator |
| Screen-reader / ARIA: landmarks, name/role/value, labelled inputs, aria-live results | **PASS** | `nav[aria-label]` + `main` present; **0** unlabeled inputs; results announce through `div[role=status][aria-live=polite]` |
| WCAG 2.1 AA contrast + visible focus on rendered surfaces | **PASS** | axe-core (wcag2a/2aa/21a/21aa) → **0 violations**, 23 rule-passes (staff) / 24 (public) |
| Export correctness: review → records-export round-trip, **open the artifact and validate the format** | **FAIL** | No artifact is ever written. See F-A11Y-2. |
| Staff boundary: persistence-write rejected without authorization | **PASS (adapted)** | The installed bundle has no HTTP write route (see note). Equivalent local-admin session gate proven: identical write succeeds signed-in, rejected signed-out with *"Sign in with a local staff or administrator account before changing city work."* |

**Boundary note.** The manifest's `X-CivicAccess-Write-Token` item was written for
the Docker deployment. In the Windows-Local bundle CivicAccess is served through
the Tauri `invoke` bridge, not HTTP — port 15480 answers only `/health` and
`/modules` (501 on POST, 404 elsewhere). The session gate is the real boundary on
this stack and it enforces.

## Findings

### F-A11Y-1 — Blocker: the Accessibility tab is unreachable in the shipped app
`desktop/src-tauri/src/main.rs:60 navigation()` omits the `access` entry that
`desktop/src/main.js:24 fallbackState.navigation` declares. The live shell is
served the Rust list, so a clerk never sees the Accessibility tab even with
`civicaccess` installed and enabled (`config/module-selection.json` lists it in
both `installed_module_ids` and `enabled_module_ids`).

The view itself is fully built and correct — it was reached here by retargeting a
nav button's `data-area` and renders all seven workflow forms. This is a one-line
omission in `navigation()`, and it is the same hardcoded-duplicate-config shape
already flagged between `main.js` and `installer/modules.json`.

Consequence: **every CivicAccess feature is dead on the shipped build**, and the
`main.js` fallback list disguised it during development.

### F-A11Y-2 — Major: "Generate Records-Ready Export" writes no artifact
`workflows.rs:8067 civicaccess_records_export()` records an audit entry and
returns *"Open the access exports folder to package the artifact"* — but never
calls `write_export_file()`. Every sibling export does (meetings:4563,
notice:4613, records:6139, code:6727). `Data/exports/` does not exist after a
successful export call; no artifact exists anywhere under the data root.

This is exactly the manifest item that was never run, and it fails.

### F-A11Y-3 — Blocker (clean-machine install): bundled Python is missing `msvcp140.dll`
City-core migrations abort on a genuinely clean Windows machine:
`ValueError: the greenlet library is required ... DLL load failed while importing
_greenlet`. The payload ships `vcruntime140.dll` and `vcruntime140_1.dll` into
`runtime/python/` but omits `msvcp140.dll`, which `_greenlet.cp313-win_amd64.pyd`
needs. Copying that one DLL from the bundled `postgres/bin` fixed the import and
migrations then completed (`MIGRATE_EXIT=0`, "city-core database migrations
verified").

Why July's run missed it: the v1.0.2 evidence kit's second run only re-verified
the **PostgreSQL** VC++ fix; the Python payload was never checked, and by then the
sandbox had been de-cleaned by earlier debugging.

### F-A11Y-4 — Minor: env-less migrate falls back to a default password
`civicsuite_runtime/services.py:76 _set_local_defaults()` seeds
`DATABASE_URL=postgresql+asyncpg://civicsuite:civicsuite@...`. Running
`python -m civicsuite_runtime.migrate` outside the supervisor therefore attempts
a `civicsuite:civicsuite` login and fails with a confusing *"password
authentication failed"* rather than naming the missing `DATABASE_URL`. This cost
real diagnosis time and would mislead any operator following a repair doc.

## Functional walkthrough (all through the real Tauri bridge, real Gemma)

12 passing checks in `functional-invoke-results.json`, including:

- accessibility review, blank + `es` → `needs-fixes` (4 findings, 3 high-severity)
- accessibility review, complete + alt text + `en` → `passes-sample-checks`
- form plan `name, email` → names the missing `contact`, `request`
- publishing checklist unchecked → `blocked`, lists each blocker
- ADA Title II without coordinator review → `needs-staff-review`
- tagged-PDF `1, 3` → `needs-fixes` (skipped level); `1, 2, 3` → plan created
- **live local AI**: plain-language rewrite and German variant both generated by
  `civicsuite-gemma4-12b-qat:q4_0` in 7–9 s, correctly labeled advisory drafts
- delete-review round-trip succeeds

## Files

| File | What |
|---|---|
| `a11y-results.json` | axe-core results + full keyboard traversal sequences, both surfaces |
| `functional-invoke-results.json` | every workflow action's real request/response + auth-boundary probe |
| `form-shape.json` | the seven workflow forms, their fields and actions, as rendered |
| `staff-accessibility-view.png` | the Accessibility view as rendered on the installed app |
| `public-area.png` | the resident/public surface |
| `walkthrough3-final.png`, `walkthrough-final.png` | walkthrough end state |

Harness: `driver/a11y-acceptance.mjs`, `driver/functional-invoke.mjs`,
`driver/finish-acceptance.mjs` (host-side Playwright over CDP into the sandbox's
WebView2), plus the `commands/` PowerShell channel for in-sandbox probes.
