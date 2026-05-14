# Failing-tests report — 2026-05-13-macos-honest-narrowing

## Verdict

**N/A — documentation-only run, no test surface.**

## Reasoning

This run sweeps `README*`, `USER-MANUAL*`, `FAQ*`, `STATUS*`, `SUPPORT*`, `docs/**/*.md`, `installer/README.md`, and `installer/windows/README.md` across two repos (civicsuite umbrella + civicrecords-ai; civicclerk skipped per plan §5). All paths are documentation; the manifest's `forbidden_paths` excludes every source-code path, test directory, and CI workflow file.

The manifest's `definition_of_done` clause (4) states: *"pre-existing test suites in each repo still pass with no code changes (documentation-only sweep should not move any test outcome)."* That clause is asserting an *absence of regression*, not the addition of new tests. Writing failing tests for a documentation change would be incoherent — there's no behavior to assert against.

## What the verifier should check

When the verifier stage runs, it should:
1. Confirm `git diff` against base shows only doc-extension files (`*.md`, `*.txt`, `installer/README.md`).
2. Re-run the pre-existing test suites in each repo (`pytest` for Python repos, `npm test` for frontend) and confirm no test outcome moves vs base.
3. Confirm no `.py`, `.ts`, `.tsx`, `.js`, `.yaml` (workflow), or `_version.*` files appear in the diff.

## What the executor should NOT do

Add new test files. Modify existing tests. Edit any `.github/workflows/*` file. All of these are in `forbidden_paths` for every repo in `target_repos`.

## Artifact role

This artifact exists for the audit trail per the feature.yaml pipeline definition (stage `test-write` writes `failing-tests-report.md`). Its contents document why no failing tests were written for this specific documentation-only run.
