# Audit Lite — Stage 2 Slice 4: verify workflow self-hosted runner compatibility
**Date:** 2026-06-10
**Scope:** One-line change in `.github/workflows/verify.yml` (drop `--with-deps` from the Playwright install step) plus stage ledger entry.
**Reviewer:** Claude (audit-lite)

## TL;DR
Ship. The change unblocks a job that hangs forever on the self-hosted runner and replaces an implicit sudo requirement with an explicit, documented runner-image responsibility. Live verification: the prior run sat in `Install browser for docs landing page check` indefinitely; root cause confirmed as `--with-deps` invoking sudo under a non-sudo account.

## Severity rollup
- Blocker: 0
- Critical: 0
- Major: 0
- Minor: 0
- Nit: 0

## Findings
None open. The considered-and-rejected alternative (passwordless sudo for the runner account) is recorded in the ledger — it would have granted root-adjacent power to the account that executes pull-request code.

## What's working
- The workflow comment states the constraint and points at the ledger, so the next person who "fixes" it back to `--with-deps` has to walk past the explanation (`.github/workflows/verify.yml:55-58`).
- Hosted GitHub runners would also pass this step: Playwright's Chromium ships against the Ubuntu deps already present on `ubuntu-latest` images, so the change does not couple the workflow exclusively to the local runner.
- Runner-image dependency preinstall is reproducible: package list recorded in the slice 4 ledger entry context (WSL Ubuntu 24.04 root-side apt install).

## Watch items
- If a future workflow needs more browsers (firefox/webkit), their OS deps must be added to the runner image the same way — the ledger note is the procedure.

## Escalation recommendation
No escalation needed. One-line CI fix with documented root cause.
