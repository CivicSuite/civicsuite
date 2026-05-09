# CivicSuite Installer Checkpoint - 2026-05-09

Status: CivicCore package proof and CivicRecords service/UI cleanroom proof verified.

## Scope Completed

This checkpoint records the first safe installer slice for CivicSuite. The work
created an umbrella-level installer contract and dry-run planner, not a native
installer binary and not a module runtime change.

Completed surfaces:

- `installer/modules.json` covers all 26 tracked CivicSuite repos.
- `scripts/plan-installer.py` resolves profiles, dependencies, menu styles,
  readiness states, artifact/version inputs, service/profile config,
  health-check plans, executor preflight, and the execution gate.
- `scripts/plan-installer.py --profile minimal --generate-install-kit` writes
  the first minimal CivicCore install kit under `installer/generated/minimal`.
- `installer/generated/minimal/install-civiccore.ps1` has been executed once
  and installed CivicCore 1.0.0 into the kit-local `.venv`.
- `installer/generated/minimal/verify-civiccore.ps1` has been executed once and
  verified `import civiccore` reports `1.0.0`.
- `installer/reports/manual-minimal-civiccore-install/proof.json` records the
  execution proof and the generator bug found during the first proof run.
- `installer/generated/minimal/reset-civiccore.ps1` and
  `installer/generated/minimal/reset-civiccore.sh` reset only the kit-local
  `.venv`.
- The generated Windows reset script removed the kit-local `.venv`, the install
  script reinstalled CivicCore 1.0.0, and the verify script again reported
  `1.0.0`.
- `scripts/run-minimal-cleanroom.py` runs the generated minimal kit in a
  disposable Linux container with copied kit inputs and copied CivicCore wheel.
- `installer/reports/manual-minimal-linux-cleanroom-2/cleanroom-proof.json`
  records a passing cleanroom proof in `python:3.12-slim`.
- `scripts/run-civicrecords-cleanroom.py` copies CivicRecords AI into an
  evidence workspace, starts an isolated Docker Compose project, verifies API
  and frontend health, runs live Playwright desktop/mobile checks, saves
  screenshots, and tears the stack down with volumes removed.
- `installer/reports/manual-civicrecords-service-cleanroom-4/service-ui-proof.json`
  records a passing service/UI cleanroom proof.
- `scripts/plan-installer.py --profile clerk-core --run-cleanroom-proof` now
  calls the passing CivicRecords service/UI cleanroom runner through the suite
  installer command surface.
- `scripts/plan-installer.py --profile clerk-core --run-cleanroom-gate` now
  runs the same Docker proof and returns concise pass/fail gate output for API
  health, frontend health, and Playwright desktop/mobile UI verification.
- The planner rejects `--dry-run` when it is combined with a cleanroom proof or
  gate because those modes build/start/teardown Docker resources and write
  evidence.
- `installer/windows/plan-installer.ps1` wraps the planner for Windows.
- `installer/macos/plan-installer.sh` wraps the planner for macOS.
- `installer/linux/plan-installer.sh` wraps the planner for Linux.
- `scripts/verify-installer-plan.py` verifies the manifest, planner, launcher
  wrappers, selector model, readiness states, artifact/version resolver,
  service/profile config, health-check plan, executor preflight, and execution
  gate.
- `scripts/plan-installer.py --write-report` writes validated dry-run plan,
  readiness, approval-gate, artifact/version, service-config, and health-check
  reports under `installer/reports/{run_id}`.

## Current Safety Boundary

The installer work is intentionally non-mutating.

Allowed now:

- print a dry-run install plan
- show the profile and module selector model
- show readiness/error states with fix steps
- inspect dependencies in read-only dry-run mode
- request execution and receive a blocked/non-mutating gate response
- render the future executor state machine in dry-run mode
- render the future evidence/report schema in dry-run mode
- resolve local artifact/version metadata in read-only dry-run mode
- render planned compose/profile service configuration
- render planned health-check obligations
- render blocked executor preflight output
- write non-mutating dry-run evidence reports for plan, readiness, approval
  gate, artifact/version, service-config, and health-check output
- generate a minimal CivicCore install kit inside the repo
- run the generated minimal Windows kit after explicit approval
- run a disposable Linux cleanroom proof for the generated minimal kit
- run a disposable CivicRecords service/UI cleanroom proof with Playwright
- run the clerk-core cleanroom gate for concise pass/fail installer evidence

Not allowed yet:

- install dependencies
- start services or containers
- mutate host state
- install CivicCore or any module
- repair or uninstall services
- package native installers
- change module product code
- run additional generated install scripts without explicit operator approval

## Verified Commands

Focused examples:

```powershell
python scripts\plan-installer.py --profile clerk-core --dry-run
python scripts\plan-installer.py --profile full-suite --dry-run
python scripts\plan-installer.py --profile clerk-core --menu-style guided --show-menu --dry-run
python scripts\plan-installer.py --profile clerk-core --show-readiness --readiness-scenario missing-docker --dry-run
python scripts\plan-installer.py --profile clerk-core --show-readiness --detect-host --dry-run
python scripts\plan-installer.py --profile minimal --execute --dry-run
python scripts\plan-installer.py --profile minimal --show-executor-design --dry-run
python scripts\plan-installer.py --profile minimal --show-evidence-schema --dry-run
python scripts\plan-installer.py --profile clerk-core --dry-run --write-report
python scripts\plan-installer.py --profile clerk-core --show-readiness --readiness-scenario missing-docker --dry-run --write-report
python scripts\plan-installer.py --profile minimal --execute --dry-run --write-report
python scripts\plan-installer.py --profile clerk-core --show-artifacts --dry-run --write-report
python scripts\plan-installer.py --profile clerk-core --show-profile-config --dry-run --write-report
python scripts\plan-installer.py --profile clerk-core --show-health-checks --dry-run --write-report
python scripts\plan-installer.py --profile clerk-core --show-preflight --dry-run
python scripts\plan-installer.py --profile minimal --generate-install-kit
powershell -NoProfile -ExecutionPolicy Bypass -File installer\generated\minimal\install-civiccore.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File installer\generated\minimal\verify-civiccore.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File installer\generated\minimal\reset-civiccore.ps1
python scripts\run-minimal-cleanroom.py --run-id manual-minimal-linux-cleanroom-2
python scripts\run-civicrecords-cleanroom.py --run-id manual-civicrecords-service-cleanroom-4
python scripts\plan-installer.py --profile clerk-core --run-cleanroom-proof --run-id manual-clerk-core-integrated-proof
python scripts\plan-installer.py --profile clerk-core --run-cleanroom-gate --run-id verify-clerk-core-gate
```

Platform launcher examples:

```powershell
installer\windows\plan-installer.ps1 -Profile clerk-core
installer\windows\plan-installer.ps1 -ShowMenu -MenuStyle guided
installer\windows\plan-installer.ps1 -ShowReadiness -ReadinessScenario missing-docker
installer\windows\plan-installer.ps1 -ShowReadiness -DetectHost
installer\windows\plan-installer.ps1 -Execute
installer\windows\plan-installer.ps1 -ShowExecutorDesign
installer\windows\plan-installer.ps1 -ShowEvidenceSchema
installer\windows\plan-installer.ps1 -Profile minimal -WriteReport
installer\windows\plan-installer.ps1 -Profile clerk-core -ShowArtifacts -WriteReport
installer\windows\plan-installer.ps1 -Profile clerk-core -ShowProfileConfig -WriteReport
installer\windows\plan-installer.ps1 -Profile clerk-core -ShowHealthChecks -WriteReport
installer\windows\plan-installer.ps1 -Profile clerk-core -ShowPreflight
installer\windows\plan-installer.ps1 -Profile minimal -GenerateInstallKit
```

```bash
bash installer/macos/plan-installer.sh --profile clerk-core
bash installer/macos/plan-installer.sh --show-menu --menu-style guided
bash installer/macos/plan-installer.sh --show-readiness --readiness-scenario missing-docker
bash installer/macos/plan-installer.sh --show-readiness --detect-host
bash installer/macos/plan-installer.sh --execute
bash installer/macos/plan-installer.sh --show-executor-design
bash installer/macos/plan-installer.sh --show-evidence-schema
bash installer/macos/plan-installer.sh --profile minimal --write-report
bash installer/macos/plan-installer.sh --profile clerk-core --show-artifacts --write-report
bash installer/macos/plan-installer.sh --profile clerk-core --show-profile-config --write-report
bash installer/macos/plan-installer.sh --profile clerk-core --show-health-checks --write-report
bash installer/macos/plan-installer.sh --profile clerk-core --show-preflight
bash installer/macos/plan-installer.sh --profile minimal --generate-install-kit
bash installer/linux/plan-installer.sh --profile clerk-core
bash installer/linux/plan-installer.sh --show-menu --menu-style guided
bash installer/linux/plan-installer.sh --show-readiness --readiness-scenario missing-docker
bash installer/linux/plan-installer.sh --show-readiness --detect-host
bash installer/linux/plan-installer.sh --execute
bash installer/linux/plan-installer.sh --show-executor-design
bash installer/linux/plan-installer.sh --show-evidence-schema
bash installer/linux/plan-installer.sh --profile minimal --write-report
bash installer/linux/plan-installer.sh --profile clerk-core --show-artifacts --write-report
bash installer/linux/plan-installer.sh --profile clerk-core --show-profile-config --write-report
bash installer/linux/plan-installer.sh --profile clerk-core --show-health-checks --write-report
bash installer/linux/plan-installer.sh --profile clerk-core --show-preflight
bash installer/linux/plan-installer.sh --profile minimal --generate-install-kit
```

Verification stack passed:

```powershell
python scripts\verify-installer-plan.py
bash scripts/verify-docs.sh
python scripts\verify-deployment-profile.py --static-only
python scripts\verify-suite-state.py
```

Control-plane eval stack passed:

```powershell
python .agent-workflows\evals\run_all.py
```

## Next Recommended Slice

Recommended next slice: promote the integrated `clerk-core` proof from manual
evidence to a named installer verification gate with concise pass/fail output
for operators.

Why: the suite installer now owns the proof command. The next useful step is
making the result operator-friendly so a failed gate says exactly which layer
failed: build, startup, API health, frontend health, Playwright, or teardown.

Stop before:

- adding a mutating executor implementation
- installing baseline dependencies
- starting Docker containers
- changing CivicCore or module code
- packaging native installer binaries
