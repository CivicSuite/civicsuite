# Installer Backup/Restore Self-Audit

Date: 2026-05-18
Branch: `chore/clerk-core-city-release`
Scope: Clerk-core installer lifecycle slice only.

## Internal Careful-Work Checklist

1. Read callers/consumers: `scripts/run-installer-package-cleanroom.py`,
   `scripts/plan-installer.py`, `.github/workflows/installer-cleanroom.yml`,
   `scripts/verify-installer-plan.py`, `installer/README.md`, and
   `docs/installer/starter-set-release-contract.md`.
2. Traced runtime context: package cleanroom extracts an archive, calls the
   generated platform launcher, then the launcher calls
   `scripts/run-clerk-core-installer.py` from the extracted bundle.
3. Pattern fan-out: searched for `backup`, `restore`, `repair`, `uninstall`,
   `verify_profile`, `proof_required`, and lifecycle evidence modes.
4. Data contract changed: lifecycle modes now include `backup` and `restore`;
   matching-host lifecycle evidence now requires those modes; starter modules'
   `proof_required` lists now include backup/restore.
5. Blast radius: umbrella installer scripts, generated package artifacts,
   installer metadata, docs, and CI workflow name/sequence. No product module
   source and no queued module repo code were edited.
6. Re-read changed files: reviewed the diffs for the lifecycle runner, package
   runner, planner, verifier, docs, and workflow before validation.
7. Full path narrated: `run-installer-package-cleanroom.py` now runs
   `install -> repair -> verify -> backup -> restore -> uninstall`; the
   generated launcher routes `backup`/`restore` to
   `run-clerk-core-installer.py`; backup writes PostgreSQL custom dumps and a
   manifest; restore checks SHA256 and restores each dump into a temporary
   restore-probe database before deleting the probe.
8. New state consumed: backup artifacts are consumed by restore through
   `backup-manifest.json`; matching-host evidence is consumed by
   `scripts/verify-installer-plan.py`.
9. Five-lens self-audit recorded below.

## Five-Lens Self-Audit

Engineering: PASS. The lifecycle runner has explicit modes, binary-safe
`pg_dump`/`pg_restore` paths, selected-module scoping, and SHA256 validation
before restore rehearsal.

Security: PASS with caveat. Backup dumps contain municipal data and must be
protected by operators. This slice records dumps under the installer runtime
backup directory and validates integrity, but it does not add encryption,
off-host retention, or key management.

UX: PASS for docs/launcher discoverability. Generated package help and README
text now name backup/restore and explain what restore validates. No frontend UI
was changed, so browser QA is not applicable to this slice.

Docs: PASS. `installer/README.md`, `docs/installer/starter-set-release-contract.md`,
generated package READMEs, and installer metadata now match the lifecycle
contract.

Tests/QA: PASS for static and archive-readiness validation. Local proof:
`py_compile`, `verify-installer-plan.py`, `verify-suite-state.py --remote-only`,
`verify-docs.sh`, `verify-release-lockstep.py`, `git diff --check`, and package
archive readiness with `--skip-install`. Full matching-host backup/restore
lifecycle proof is delegated to CI after push.

## Remaining Caveats

- This does not claim city-deployable starter readiness.
- This does not claim macOS lifecycle certification.
- This does not complete the deeper CivicRecords AI request/search/review/
  response workflow proof or CivicClerk agenda/packet/minutes/vote/notice/
  archive workflow proof.
