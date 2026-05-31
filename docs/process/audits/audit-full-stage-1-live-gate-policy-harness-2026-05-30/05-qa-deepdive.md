# QA Deep Dive - Stage 1 Live Gate Policy Harness

## Scope

Reviewed runtime checks and release-process behavior for Stage 1.

## Findings

No open findings.

## Runtime Checks

- Stage branch evidence check passed.
- Policy contract test passed.
- Workflow-cost check passed.
- Workflow-cost ledger check passed.
- Documentation verification passed.
- Secret scan passed.
- Suite-state remote verification passed.
- Workflow YAML parse check passed.
- Git diff whitespace check passed.

## Release-Lockstep Note

`python scripts\verify-release-lockstep.py` failed when run locally because Stage 1 does not change the release truth artifact set required for a `release-tag` PR. This stage should not be labeled `release-tag`; the release-lockstep gate is not the relevant merge gate for this process-only branch.

## What Works

- The hook blocked dirty working tree self-invocation as designed.
- Clean-tree hook paths were exercised by actual pushes.
- CI now runs stage evidence validation before dependency-heavy setup.

## Residual Risk

GitHub-hosted CI still needs to run on the PR head after the audit package commit. If GitHub CI reports a workflow syntax or environment issue not visible locally, that is a real Stage 1 blocker until fixed.

## QA Interpretation

Stage 1 QA is about process behavior under realistic agent/developer actions. The most important runtime proof is that every Stage 1 push passed through the local pre-push hook after the Codex-reviewed slice was committed. That proves the hook is installed and active in this checkout.

The CI-side proof is partially local until the PR runs. Local validation covered:

- Python policy execution;
- policy contract tests;
- workflow-cost budget;
- workflow-cost ledger presence;
- YAML parse of `verify.yml`.

GitHub Actions still needs to execute the final workflow on the PR head. That is why the PR merge step remains gated on CI after this package is pushed.

## Negative Testing

The hook dirty-tree behavior was observed: invoking the hook while Slice 2 changes were still uncommitted failed with the expected dirty working tree message. That is not a defect; it is the first guard in the hook. Clean-tree behavior was exercised through actual pushes.

The policy test covers a missing-ledger/missing-report branch and confirms that non-stage branches skip stage evidence requirements. This prevents the check from breaking normal repository branches that do not use the stage process.

## Release Gate Applicability

Release-lockstep is a truth-artifact gate. Stage 1 does not move release truth. Running `python scripts\verify-release-lockstep.py` without a release-tag context produced the expected failure because the branch lacks the full truth-artifact movement set. The correct QA call is to leave the Stage 1 PR unlabeled as `release-tag`.

## QA Recommendation For Merge

Merge only after the PR's `verify` job passes on GitHub. If `verify` is skipped because the path filters are wrong, that is a Stage 1 blocker because this stage specifically changed the `verify` workflow. If it runs and passes, the Stage 1 QA bar is met for the scoped harness.

## Evidence Altitude

The evidence altitude for Stage 1 is process-runtime, not product-runtime. That distinction matters:

- Hook proof: live local Git push path.
- CI proof before PR: static workflow parse and local policy execution.
- CI proof after PR: GitHub Actions execution on the branch head.
- Product proof: not in scope.

No Stage 1 evidence should be read as proof that the city-core installer works. It proves that future city-core installer work is less likely to disappear before it reaches GitHub.

## Failure Modes Covered

Stage 1 directly covers these prior failure modes:

- dirty local work not pushed before interruption;
- missing durable stage ledger;
- audit evidence left only in local scratch space;
- workflow changes made without workflow-cost replay evidence;
- CI and local hook enforcing different rules.

The remaining failure mode is human bypass: someone could uninstall the local hook. CI now provides the second line of defense for PRs, which is why this stage needed both the hook and `check_stage_evidence.py`.
