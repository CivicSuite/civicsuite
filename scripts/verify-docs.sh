#!/usr/bin/env bash
# verify-docs.sh â€” civicsuite umbrella docs sanity check
# 1) Required artifacts exist
# 2) No stale current-facing strings (CHANGELOG history exempt)
# Exits 1 on first failure; prints PASS at the end.
set -u
fail=0

REQUIRED=(
  README.md
  README.txt
  USER-MANUAL.md
  USER-MANUAL.txt
  CHANGELOG.md
  CONTRIBUTING.md
  LICENSE
  SECURITY.md
  CODE_OF_CONDUCT.md
  SUPPORT.md
  .gitignore
  docs/index.html
  docs/compatibility/index.md
  docs/deployment/local-demo-profile.md
  docs/ux/shared-shell-inventory.md
  docs/architecture/ADR-0004-shared-shell-boundaries.md
  docs/connectors/import-export-template.md
  docs/architecture/ADR-0005-connector-import-export-boundaries.md
  docs/civiccore/v0.3-extraction-proposal.md
  docs/architecture/ADR-0006-civiccore-v0-3-extraction-scope.md
  docs/roadmap/civicclerk-production-depth-workflow.md
  docs/architecture/ADR-0007-first-production-depth-workflow.md
  docs/github-discussions-seed.md
  scripts/verify-deployment-profile.py
  scripts/verify-suite-state.py
  .github/PULL_REQUEST_TEMPLATE.md
  .github/ISSUE_TEMPLATE/bug_report.md
  .github/ISSUE_TEMPLATE/feature_request.md
  .github/ISSUE_TEMPLATE/documentation.md
)

echo "==> Required-artifact check"
for f in "${REQUIRED[@]}"; do
  if [ ! -f "$f" ]; then
    echo "  MISSING: $f"
    fail=1
  fi
done

echo "==> Stale current-facing strings check (CHANGELOG, ADRs, SUPERVISOR.md exempt as history)"
# Flag stale current-facing strings after the records-ai transfer.
PATTERN='Phase 0 scaffold|civiccore[^,]{0,30}0\.1\.0|github\.com/scottconverse/civicrecords-ai|scottconverse/civicrecords-ai|will transfer|transfer has not happened|transfer hasn'\''t happened'
HITS=$(grep -rn -E "$PATTERN" README.md USER-MANUAL.md docs/ \
       --include='*.md' --include='*.html' 2>/dev/null \
       | grep -vE 'CHANGELOG|docs/architecture/ADR-|docs/SUPERVISOR\.md|docs/compatibility/index\.md|docs/github-discussions-seed\.md|docs/governance/civicrecords-ai-org-transfer-runbook\.md' \
       || true)
if [ -n "$HITS" ]; then
  echo "  STALE STRINGS FOUND:"
  echo "$HITS" | sed 's/^/    /'
  fail=1
fi

if [ $fail -ne 0 ]; then
  echo "FAIL"
  exit 1
fi
echo "PASS"
