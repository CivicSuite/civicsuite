# Installed-Stack Workflow Proof Self-Audit

Date: 2026-05-18
Branch: `chore/clerk-core-installed-workflow-proof`
Scope: Clerk-core starter profile installed-stack workflow proof only.

## Internal Careful-Work Checklist

1. Read callers/consumers: `scripts/run-installer-package-cleanroom.py`,
   `scripts/run-clerk-core-installer.py`, `.github/workflows/installer-cleanroom.yml`,
   `scripts/plan-installer.py`, `scripts/verify-installer-plan.py`,
   `scripts/verify-suite-state.py`, installer docs, release-truth docs, and
   generated package README surfaces.
2. Traced runtime context: package cleanroom extracts the archive, launches the
   generated package entrypoint, and the entrypoint calls
   `run-clerk-core-installer.py` against the installed Docker stack.
3. Pattern fan-out: searched for `workflow_proof`, `bearer`, `agenda`, `packet`,
   `notice`, `minutes`, `public/archive`, `records request`, `response-letter`,
   `backup`, `restore`, and release-lockstep truth surfaces.
4. Data contract changed: `--workflow-proof` now records structured
   CivicRecords AI and CivicClerk workflow evidence in the cleanroom report.
   The installer metadata records the bounded proof scope.
5. Blast radius: umbrella installer scripts, package cleanroom workflow, docs,
   release-truth verifier surfaces, generated package artifacts, and CI
   cleanroom workflow. No queued module repo source was edited.
6. Re-read changed files: reviewed the workflow runner, installer verifier,
   suite-state verifier, docs, metadata, generated artifact summary, and CI
   workflow after edits.
7. Full path narrated: `installer-cleanroom.yml` invokes
   `run-installer-package-cleanroom.py --staff-mode bearer --workflow-proof`;
   the extracted launcher runs install/repair/verify/backup/restore/uninstall;
   the installer runner logs into CivicRecords AI as first admin, creates and
   reviews a request, drafts a human-review-required response, and marks it
   ready for release; it then uses CivicClerk bearer staff auth to create an
   agenda intake, promote it, create a meeting, assemble/finalize a packet,
   record notice proof, motion, vote, citation-gated minutes guardrail, and
   public archive/calendar evidence.
8. New state consumed: workflow proof report fields are consumed by
   `scripts/verify-installer-plan.py`; release-truth wording is consumed by
   `scripts/verify-suite-state.py`; generated archives consume
   `installer/modules.json` proof metadata.
9. Five-lens self-audit recorded below.

## Five-Lens Self-Audit

Engineering: PASS. The workflow proof uses installed service APIs and bearer
staff auth where required. CivicRecords search evidence is intentionally scoped
to the installed search surface/filter endpoint rather than overclaiming full
semantic search.

Security: PASS. Staff writes remain protected by bearer auth, CivicRecords AI
uses first-admin JWT auth, generated reports do not persist the admin password
or bearer token, and AI response output remains staff-reviewed and
non-authoritative.

UX: PASS for runtime/operator evidence. No frontend code changed in this slice,
so browser screenshots are not required for commit. Operator-facing docs now
describe the deeper proof and its limits.

Docs: PASS. `CHANGELOG.md`, `docs/CivicSuiteUnifiedSpec.md`,
`docs/release-recovery-status.md`, `docs/release-lockstep/downstream-pins.md`,
installer docs, generated README files, and installer metadata now share the
same bounded proof language.

Tests/QA: PASS locally. `py_compile`, `verify-suite-state.py --remote-only`,
`verify-installer-plan.py`, `verify-docs.sh`, `verify-release-lockstep.py`, and
`git diff --check` pass. Windows matching-host workflow proof passed against the
final regenerated archive with install, repair, verify, backup, restore,
uninstall, CivicRecords AI workflow proof, and CivicClerk workflow proof. Linux
matching-host workflow proof is the required post-push CI gate for the final
branch SHA.

## Remaining Caveats

- This does not claim city-deployable starter readiness.
- This does not claim live CivicRecords AI and CivicClerk cross-module records
  exchange.
- This does not claim macOS lifecycle certification.
- Post-push CI must prove the final branch SHA on Linux matching-host lifecycle
  with workflow proof enabled.
