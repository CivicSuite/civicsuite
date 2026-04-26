# CivicRecords AI Org Transfer Runbook

Status: ready for execution
Owner: CivicSuite maintainer
Source repo: `scottconverse/civicrecords-ai`
Target repo: `CivicSuite/civicrecords-ai`
Prepared: 2026-04-25

## Goal

Move the shipping CivicRecords AI module into the CivicSuite GitHub org so every
suite module lives under `CivicSuite/*`. Preserve history, issues, releases,
tags, discussions, stars, and GitHub redirects by using GitHub's native
repository transfer flow.

## Current GitHub State

- `CivicSuite/civicsuite`: exists, public, default branch `main`.
- `CivicSuite/civiccore`: exists, public, default branch `main`.
- `CivicSuite/civicrecords-ai`: does not exist yet.
- `scottconverse/civicrecords-ai`: exists, public, default branch `master`,
  issues enabled, discussions enabled, wiki disabled, not archived.

## Transfer Strategy

Use GitHub repository transfer:

```bash
gh api \
  --method POST \
  repos/scottconverse/civicrecords-ai/transfer \
  -f new_owner=CivicSuite
```

Do not create a fresh repo and push a mirror unless native transfer fails.
Native transfer is required because it preserves releases, tags, discussions,
issues, PR history, and automatic redirects from the old URL.

## Freeze Window

Before transfer:

1. Ensure no release workflow is running on `scottconverse/civicrecords-ai`.
2. Ensure no PR merge is in progress.
3. Confirm `CivicSuite/civicrecords-ai` still does not exist.
4. Confirm `scottconverse/civicrecords-ai` default branch is still `master`.
5. Record current latest release and asset URLs.

## Current-Facing URL Rewrite Scope

After transfer, update current-facing references from
`scottconverse/civicrecords-ai` to `CivicSuite/civicrecords-ai`.

Records-ai current-facing files:

- `README.md`
- `README.txt`
- `USER-MANUAL.md`
- `USER-MANUAL.txt`
- generated `README.docx`, `README.pdf`, `README-FULL.pdf`
- generated `USER-MANUAL.docx`, `USER-MANUAL.pdf`
- `CODE_OF_CONDUCT.md`
- `CONTRIBUTING.md`
- `SECURITY.md`
- `SUPPORT.md`
- `.github/release-notes-preamble.md`
- `docs/index.html`
- `docs/github-discussions-seed.md`
- `docs/UNIFIED-SPEC.md`
- generated `docs/UNIFIED-SPEC.docx`
- generated `docs/CivicRecordsAI-UnifiedSpec-v3.1.docx`
- generated manuals under `docs/*.html`, `docs/*.docx`, `docs/*.pdf`
- docs generator sources:
  - `backend/scripts/generate_pdf.py`
  - `docs/generate-manual-docx.js`
  - `docs/generate_docx.py`
  - `docs/generate_pdfs.py`

CivicSuite umbrella current-facing files:

- `README.md`
- `README.txt`
- `USER-MANUAL.md`
- `USER-MANUAL.txt`
- generated `USER-MANUAL.docx`, `USER-MANUAL.pdf`
- `CONTRIBUTING.md`
- `SECURITY.md`
- `SUPPORT.md`
- `.github/ISSUE_TEMPLATE/bug_report.md`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `docs/index.html`
- `docs/compatibility/index.md`
- `docs/github-discussions-seed.md`
- `scripts/verify-docs.sh`

CivicCore current-facing files:

- `CONTRIBUTING.md`
- `USER-MANUAL.md`
- `USER-MANUAL.txt`

## References To Preserve As Historical

Do not blindly rewrite old release-history or audit-history references. Preserve
old URLs when they are explicitly historical, for example:

- old release-note narratives in `CHANGELOG.md`
- old v1.2.0 installer examples in historical update notices
- archived `.claude/RESUME-*` context files
- old design/audit review documents
- spec text that describes repository state at a prior point in time

If a historical URL appears in a current support, install, security, or landing
surface, rewrite it. If it appears inside a dated release-history paragraph,
leave it unless the paragraph claims to be current.

## Post-Transfer GitHub Checks

Immediately after transfer:

```bash
gh repo view CivicSuite/civicrecords-ai \
  --json nameWithOwner,visibility,defaultBranchRef,hasIssuesEnabled,hasDiscussionsEnabled,hasWikiEnabled,isArchived,url

gh repo view scottconverse/civicrecords-ai \
  --json nameWithOwner,url
```

Expected:

- `CivicSuite/civicrecords-ai` exists.
- Visibility remains public.
- Default branch remains `master`.
- Issues remain enabled.
- Discussions remain enabled.
- Wiki remains disabled.
- Old `scottconverse/civicrecords-ai` URL redirects.

## Local Remote Updates

After transfer:

```bash
cd civicrecords-ai
git remote set-url origin https://github.com/CivicSuite/civicrecords-ai.git
git fetch origin
git status --short --branch
```

Expected:

- Local `master` tracks `origin/master`.
- No uncommitted local work is lost.
- Existing local feature branches remain local.

## Verification Gates

Records-ai:

```bash
python -m ruff check .
bash scripts/verify-release.sh
cd frontend && node node_modules/vitest/dist/cli.js run
```

CivicSuite:

```bash
python -m ruff check .
bash scripts/verify-docs.sh
```

CivicCore:

```bash
python -m ruff check .
bash scripts/verify-release.sh
```

Browser QA:

- records-ai landing page renders and links to `CivicSuite/civicrecords-ai`.
- CivicSuite landing page links to `CivicSuite/civicrecords-ai`.
- CivicCore docs route records-ai issues to `CivicSuite/civicrecords-ai`.
- Console has zero errors on landing pages.
- Desktop and mobile widths both render correctly.

Release URL checks:

- `https://github.com/CivicSuite/civicrecords-ai/releases/tag/v1.4.0`
- `https://github.com/CivicSuite/civicrecords-ai/releases/download/v1.4.0/CivicRecordsAI-1.4.0-Setup.exe`
- old `scottconverse` release URLs redirect.

## Done Definition

- Native GitHub transfer complete.
- `CivicSuite/civicrecords-ai` is the canonical repo.
- All current-facing docs in all three repos use `CivicSuite/civicrecords-ai`.
- Historical references are intentionally preserved and documented.
- Generated PDF/DOCX/TXT artifacts regenerated where source text changed.
- GitHub Actions green in records-ai after transfer.
- `verify-release.sh` passes in records-ai and civiccore.
- `verify-docs.sh` passes in civicsuite.
- Browser QA passes for all landing pages.
- Compatibility matrix updated.
- No Phase 3 or new-module code started in the same batch.
