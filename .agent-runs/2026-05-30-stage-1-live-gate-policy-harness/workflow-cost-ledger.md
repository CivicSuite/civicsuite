# Workflow Cost Ledger - Stage 1 Live Gate Policy Harness

Captured at: 2026-05-30T23:45Z
Diff base: origin/main

Workflow files:

- `.github/workflows/verify.yml`

Cost directives applied:

1. Reused the existing `verify` job instead of adding a new workflow.
2. Added one Python policy step before dependency-heavy Node/browser setup, so failures stop early.
3. Added no new matrix dimensions.
4. Added no scheduled triggers.
5. Added no new self-hosted runner labels.
6. Added no new artifact uploads.
7. Added `actions/setup-node` npm cache coverage before `npm ci`.
8. Added no secrets beyond existing checkout permissions.
9. Kept the check deterministic and local to repository files.
10. Removed duplicate push-to-`main` validation and kept PR validation with path filters plus concurrency cancellation.
