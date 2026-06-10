# Stage 2 - Full-Suite Program Adoption And Windows Runtime ADRs

## Scope

Stage 2 adopts the full-suite finishing program (all 27 modules, clean-VM
definition of done) and records the two architecture decisions it rests on:
the portable-native Windows runtime (ADR-0008) and the Postgres-backed queue
for the Windows profile (ADR-0009).

Branch:

- `stage-2-full-suite-program-adr-2026-06-10`

Base:

- `CivicSuite/civicsuite` `main` at `8cd37559d769d58c11f21c1ca8e76872cd39950f`

Local worktree:

- `C:\CivicSuiteDev\repos\civicsuite`

## Planned Slices

1. ADR-0008 and ADR-0009 plus architecture index and plan gate file.
2. Full-suite program control document.
3. Suite truth sync: README, README.txt, and STATUS point at the program document.

## Slice Ledger

### Slice 1 - ADRs and plan gate

Status: Complete

Changed files:

- `C:\CivicSuiteDev\repos\civicsuite\docs\architecture\ADR-0008-portable-native-windows-runtime.md`
- `C:\CivicSuiteDev\repos\civicsuite\docs\architecture\ADR-0009-postgres-backed-queue-windows-profile.md`
- `C:\CivicSuiteDev\repos\civicsuite\docs\architecture\index.md`
- `C:\CivicSuiteDev\repos\civicsuite\.claude\plans\2026-06-10-civicsuite-phase-0-foundation.md`
- `C:\CivicSuiteDev\repos\civicsuite\docs\process\stages\stage-2-full-suite-program-adr-2026-06-10.md`

Audit-lite report:

- `C:\CivicSuiteDev\repos\civicsuite\docs\process\audits\audit-lite-stage-2-slice-1-adrs-2026-06-10.md`

Local checks:

- `git diff --check`
- `bash scripts/verify-docs.sh` (PASS in WSL Ubuntu, the CI-equivalent environment)
- `python scripts/verify-secret-scan.py` (PASS)

Pushed commit:

- Recorded in slice 2 per the ledger non-self-reference rule.

### Slice 2 - Program control document

Status: Planned

### Slice 3 - Suite truth sync

Status: Planned

## Stage Closeout

Pending. Filled at stage end with: audit-lite evidence list, PR URL, merge
commit, tag, and CI run IDs. The closeout references
`audit-lite-stage-2-slice-1-adrs-2026-06-10.md` and subsequent slice reports.
