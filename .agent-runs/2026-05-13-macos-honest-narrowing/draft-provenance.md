# Draft Provenance — 2026-05-13-macos-honest-narrowing

Drafted by manifest-drafter at 2026-05-13T21:18Z under agent-pipeline-claude v1.2.1.

This run executes under an active autonomous grant
(`.agent-workflows/autonomous-grants/candidate-b-macos-2026-05-13.md`,
validated AUTONOMOUS-ACTIVE with 5.3h remaining, manager-gate PROMOTE-only).
Manifest includes the v1.2.1 `gate_policy: autonomous` and `autonomous_grant`
fields and the v1.2.0+ per-repo `target_repos` field. Three sibling repos are
in scope: the umbrella plus civicrecords-ai and civicclerk.

## Sources walked

- `.agent-workflows/PROJECT_CONTROL_PLANE.md` lines 81-106 — §"Current Scope
  Boundary" Active target on line 83 ("Installer/macOS certification
  follow-up"), "Allowed now" list lines 89-94 (authorizes scoped fixes for
  the macOS follow-up after platform/support claims are inventoried), and
  "Not allowed now" list lines 96-106 (informs forbidden_paths and
  non_goals). Used for `goal`, `advances_target`, `authorizing_source`,
  `forbidden_paths`, `non_goals`, `definition_of_done`.
- `.agent-workflows/PROJECT_CONTROL_PLANE.md` lines 108-117 — §"Definition Of
  Done For Current Target" items 1-3. Used for `definition_of_done` (the
  scope-naming, real-proof-or-honest-narrowing, and local-test-and-docs
  coverage bars).
- `.agent-workflows/autonomous-grants/candidate-b-macos-2026-05-13.md` —
  full file. Used for `gate_policy`, `autonomous_grant`, and the
  admin-merge / tag-push / release-publish / force-push prohibitions in
  `non_goals` and `director_notes`.
- `.pipelines/manifest-template.yaml` — full file. Used for the canonical
  field shape and field-comment style.
- `.pipelines/roles/manifest-drafter.md` — full file. Used for
  field-derivation rules, provenance-file shape, and Return-value-contract.
- Directory listings of `C:/Users/scott/dev/civicsuite`,
  `C:/Users/scott/dev/civicrecords-ai`, and
  `C:/Users/scott/dev/civicclerk`. Used to verify the documentation
  surfaces actually exist before naming them in `allowed_paths`.
- `.agent-runs/2026-05-11-d2-b3-staff-key-gate/manifest.yaml` — reference
  for in-project manifest style and forbidden-paths conventions
  (FROZEN-EVIDENCE, SHAPE-GUARD, release-artifacts, docs/audits,
  docs/qa, docs/evidence patterns).

## Documentation surfaces verified on disk

- **civicsuite (umbrella):** `README.md`, `README.txt`, `USER-MANUAL.md`,
  `USER-MANUAL.txt`, `FAQ.md`, `STATUS.md`, `SUPPORT.md`, `installer/README.md`.
  Binary mirrors (`README.docx`, `README.pdf`, `README-FULL.pdf`,
  `USER-MANUAL.docx`, `USER-MANUAL.pdf`) are explicitly forbidden — these
  are rendered, not hand-edited. `installer/generated/native/*/macos/README.md`
  and `installer/generated/packages/*/macos/README.md` are also forbidden
  because they are produced by the installer build pipeline, not authored.
- **civicrecords-ai:** `README.md`, `README.txt`, `USER-MANUAL.md`,
  `USER-MANUAL.txt`, `installer/windows/README.md`. Binary mirrors forbidden.
- **civicclerk:** `README.md`, `README.txt`, `USER-MANUAL.md`,
  `USER-MANUAL.txt`, `installer/windows/README.md`. The many
  `MILESTONE_*_DONE.md` and `PRODUCTION_DEPTH_*_DONE.md` files at the root
  are forbidden — they are append-only historical records, not platform-
  matrix-bearing surfaces.

## Field-by-field provenance

| Field | Source | Confidence |
|:------|:-------|:-----------|
| id | orchestrator input | n/a |
| type | orchestrator input (`feature`, documentation-only sweep) | n/a |
| gate_policy | autonomous-grant validated AUTONOMOUS-ACTIVE | high |
| autonomous_grant | orchestrator input (path verified on disk) | high |
| target_repos | orchestrator multi-repo context + on-disk verification | high |
| branch | orchestrator hard-constraint (`chore/macos-honest-narrowing`) | high |
| goal | orchestrator suggested wording, used verbatim; cross-checked against PROJECT_CONTROL_PLANE.md line 83 | high |
| advances_target | PROJECT_CONTROL_PLANE.md line 83 verbatim + orchestrator branch label | high |
| authorizing_source | PROJECT_CONTROL_PLANE.md lines 83-94 (Active-target stanza + Allowed-now list) | high |
| allowed_paths (per-repo) | on-disk verification of documentation surfaces in each repo | high |
| allowed_paths (top-level union) | union of per-repo entries, restricted to documentation surfaces | high |
| forbidden_paths | orchestrator hard-constraints (no app code, no version bumps, no release artifacts) + PROJECT_CONTROL_PLANE.md Not-allowed-now list + project conventions for FROZEN-EVIDENCE, SHAPE-GUARD, docs/audits, docs/qa, docs/evidence, installer/generated | high |
| non_goals | orchestrator hard-constraints + autonomous-grant Forbidden-actions clause + PROJECT_CONTROL_PLANE.md Not-allowed-now list | high |
| expected_outputs | orchestrator hard-constraint (one PR per repo, none admin-merged) + role-file's "each entry testable" rule + auto-added inventory artifact for blast-radius auditability | high |
| required_gates | template default (autonomous grant pre-authorizes manifest/plan/merge per its Authorized-gates field; the verifier records grant citation when flipping these) | high |
| risk | orchestrator hard-constraint (`low` — docs-only, no app behavior changes) | high |
| rollback_plan | orchestrator hard-constraint, with note about autonomous-grant admin-merge prohibition | high |
| definition_of_done | PROJECT_CONTROL_PLANE.md §Definition-Of-Done items 1-3 + orchestrator hard-constraints (consistency across surfaces, tests still pass, PRs opened not merged, inventory written) | high |
| director_notes | role-file guidance (specific gotchas the user surfaced) — claim-phrasing variability, distinguishing published claims from internal notes, the platform-matrix-table density problem, and the autonomous-grant admin-merge prohibition for the executor | medium |

## Hand-required fields

None this run — all fields auto-derived from the orchestrator input plus
project artifacts on disk. The orchestrator pre-supplied the goal wording,
the branch name, the multi-repo target list, the autonomous-grant path,
the authorizing-source citation, and the risk level; the drafter verified
each against the canonical sources (PROJECT_CONTROL_PLANE.md, the grant
file, manifest-template.yaml, and on-disk repo layouts) and filled in
allowed_paths, forbidden_paths, non_goals, expected_outputs,
rollback_plan, definition_of_done, and director_notes from those sources.

## Forbidden-status-word check

Scanned `goal` and `definition_of_done` for `done`, `complete`, `ready`,
`shippable`, `taggable`:

- `goal`: clean.
- `definition_of_done`: clean — uses "satisfied," "replaced," "consistent,"
  "still pass," "opened," "awaiting human merge," and "captures." No
  forbidden status words.

(Note: the section heading `## Definition Of Done For Current Target` in
PROJECT_CONTROL_PLANE.md is a section name, not text inside the manifest's
`goal` or `definition_of_done` fields, so it does not count.)

## Revisions

- 1st draft 21:18 UTC — initial pass under autonomous grant, three-repo
  target, documentation-only scope.
