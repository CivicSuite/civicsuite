# Audit Lite: Windows Operator Walkthrough

Date: 2026-06-13

Scope: `docs/installer/operator-walkthrough.md`, rewritten from the legacy Docker/archive operator path to the Windows Local desktop MSI clerk path.

## Findings

No open findings.

## Evidence Reviewed

- The walkthrough now states the clerk path does not require Docker, WSL, a terminal, or a developer account.
- Install steps now cover the Windows installer, SmartScreen/unsigned beta warning, first-run setup, City Core module profile, Gemma 4 12B QAT Q4_0 model download/checksum, city profile, first admin, and local health verification.
- Verification and smoke-test sections now use the desktop app surfaces: System Health, Settings/module manager, Meetings & Notices, Records Requests, Resident/Public records status lookup, Code & Ordinances, and Search City Knowledge.
- Backup/restore/uninstall sections now describe local backup manifests, pre-restore/final-uninstall backups, and the Windows uninstall entry instead of container removal.

## Verification

- `bash scripts/verify-docs.sh` passed.
- `python scripts/policy/check_stage_evidence.py` passed.
- `git diff --check -- docs/installer/operator-walkthrough.md` passed.
- `rg "Start Docker|Install WSL|Docker Desktop on Windows|WSL2 enabled|containers|docker|wsl" docs/installer/operator-walkthrough.md` returned no matches.

## Residual Risk

- The walkthrough is now aligned to the intended Windows Local product path. It still needs clean-machine MSI evidence before it can be treated as completed beta-install proof.
