# CivicSuite New-Session Handoff - Role Experiment Complete, B2 Phase 2 RED

Date: 2026-05-11

Status: PAUSED BY USER

Reason: prepare for a new session / context compaction after completing a research-only role experiment and recording the CivicRecords AI B2 Phase 2 halt state.

## 1. Read This First On Resume

The next session should read these in order:

1. This handoff.
2. `C:\Users\scott\OneDrive\Desktop\Claude\CivicSuite\.agent-runs\SESSION_MEMORY_2026-05-11_AFTER_ROLE_EXPERIMENT_AND_B2_PHASE2_RED.md`
3. `C:\Users\scott\OneDrive\Desktop\Claude\CivicSuite\.agent-workflows\PROJECT_CONTROL_PLANE.md`
4. `C:\Users\scott\OneDrive\Desktop\Claude\CivicSuite\.agent-workflows\ACTIVE_WORK_QUEUE.md`
5. `C:\Users\scott\OneDrive\Desktop\Claude\civicrecords-ai\.agent-runs\b2-phase2-rehearsal.md`

Important: skills/plugins remain quarantined for CivicSuite work unless Scott explicitly authorizes the exact skill or plugin in the current message. Use normal shell/file tools directly, and preserve user/previous-agent changes.

## 2. Current Active Work

Active target remains audit punch-list B2 security-secret handling recovery for `civicrecords-ai`.

Current status: RED at Phase 2 gate.

No tag push is authorized while Phase 2 is RED.

## 3. Just-Completed Work In This Session

### Research-Only Role Experiment

Scott asked:

> Read the file at `C:\Users\scott\OneDrive\Desktop\Claude\_recon\civicsuite-codex-role-experiment\CODEX_PROMPT.md` and execute it exactly as written. Do not deviate from its role file and manifest. When the artifact is complete, stop.

Executed exactly as the prompt required:

- Treated `C:\Users\scott\OneDrive\Desktop\Claude\CivicSuite\` as the umbrella working directory.
- Read only within the manifest's allowed scope:
  - `../civicrecords-ai/`
  - `docs/compatibility/`
  - `specs/`
- Did not run tests, builds, linters, or mutating scripts.
- Wrote exactly one research artifact:
  - `C:\Users\scott\OneDrive\Desktop\Claude\CivicSuite\.agent-runs\2026-05-11-civicrecords-version-pin-research\research.md`

Research finding:

- `../civicrecords-ai/backend/pyproject.toml:20` pins CivicCore to `v1.0.1` with SHA256 fragment `561d7a8f73260d50de79351d330876d2cb3488c0e046a2888e82fe09d1e03969`.
- `CivicSuite/docs/compatibility/index.md:16` records `civicrecords-ai` compatible CivicCore range as ``==1.0.1``.
- Therefore the CivicCore pin matches the matrix.
- Caveat: `../civicrecords-ai/backend/pyproject.toml:3` says `version = "1.6.0"`, while `docs/compatibility/index.md:16` still lists `civicrecords-ai` current version `1.5.0`.

The role experiment is complete. Do not keep working on it unless Scott explicitly asks.

## 4. CivicRecords AI B2 State Before Pause

### Phase 1 Completed

CivicRecords AI B2 Phase 1 PR:

- PR: `https://github.com/CivicSuite/civicrecords-ai/pull/74`
- Title: `feat(security): move records secrets to Docker secret files`
- Merge SHA: `902db173366359124e4d8e84f3c440df61aa62f4`
- Merged: 2026-05-11
- GitHub CI run: `25688368816`
- CI result: all 5 jobs passed
  - Backend (pytest via docker compose)
  - T2C bootstrap-failure smoke test
  - Frontend (vitest + build)
  - Release recovery gates
  - ruff (lint)

Phase 1 scope that landed:

- `backend/app/config.py` reads secret file values for `JWT_SECRET` and `FIRST_ADMIN_PASSWORD`.
- `docker-compose.yml` mounts file-backed secrets.
- `install.sh` and `install.ps1` generate/migrate secrets into `data/secrets`.
- `.env.example`, CI, release workflow, docs, generated deliverables, and tests were updated.
- Version moved to `1.6.0` in module artifacts.
- Full local `bash scripts/verify-release.sh` passed before the PR merge.

### Phase 2 RED

Phase 2 rehearsal artifact:

- `C:\Users\scott\OneDrive\Desktop\Claude\civicrecords-ai\.agent-runs\b2-phase2-rehearsal.md`
- This file is currently untracked in the `civicrecords-ai` repo.

Phase 2 blockers:

1. `install.sh` cannot complete on this local host because `scripts/detect_hardware.sh` reports only 14 GB RAM and the installer requires 32 GB.
2. The literal B2 acceptance command still fails:

```bash
docker exec <records-api> env | grep -E "JWT_SECRET|FIRST_ADMIN_PASSWORD"
```

Observed output:

```text
FIRST_ADMIN_PASSWORD_FILE=/run/secrets/first_admin_password
JWT_SECRET_FILE=/run/secrets/jwt_secret
```

Interpretation:

- Raw secret values are hidden.
- The container environment still exposes secret-related `_FILE` pointer names.
- The sprint directive's stated acceptance criterion was stricter: the grep must return zero lines.
- Therefore Phase 2 cannot pass and `v1.6.0` must not be tagged yet.

## 5. Recommended Next Work

Open a follow-up CivicRecords AI Phase 1B PR before any tag push.

Recommended implementation scope:

1. Remove `JWT_SECRET_FILE` and `FIRST_ADMIN_PASSWORD_FILE` from `docker-compose.yml` service environment.
2. In `backend/app/config.py`, default to `/run/secrets/jwt_secret` and `/run/secrets/first_admin_password` when direct legacy env vars are absent.
3. Preserve local/unit-test configurability without reintroducing `JWT_SECRET*` or `FIRST_ADMIN_PASSWORD*` container env names.
4. Update `backend/tests/test_docker_secret_contract.py` so it asserts the literal B2 grep contract, not only absence of raw `JWT_SECRET=` and `FIRST_ADMIN_PASSWORD=`.
5. Update `scripts/verify-release.sh` so it runs the literal acceptance command:

```bash
docker compose exec -T api env | grep -E 'JWT_SECRET|FIRST_ADMIN_PASSWORD'
```

and passes only when the command returns zero lines.

6. Update docs if the operator-facing env names or migration instructions change.
7. Run full local verification.
8. Push PR, wait for CI green, merge.
9. Rerun Phase 2 rehearsal and stop at the human Phase 2 tag-push approval gate.

## 6. Current Repo State

### CivicSuite Umbrella

Command snapshot:

```text
## main...origin/main
 M installer/dist/CivicSuite-clerk-core-0.1.0-SHA256SUMS.txt
 M installer/dist/CivicSuite-clerk-core-0.1.0-release-manifest.json
 M installer/dist/CivicSuite-clerk-core-linux-0.1.0.tar.gz
 M installer/dist/CivicSuite-clerk-core-macos-0.1.0.tar.gz
 M installer/dist/CivicSuite-clerk-core-windows-0.1.0.zip
 M installer/generated/minimal/README.md
 M installer/generated/minimal/civiccore-install-plan.json
 M installer/generated/minimal/install-civiccore.ps1
 M installer/generated/minimal/install-civiccore.sh
 M installer/generated/minimal/requirements.txt
 M installer/generated/packages/clerk-core/linux/install-plan.json
 M installer/generated/packages/clerk-core/macos/install-plan.json
 M installer/generated/packages/clerk-core/windows/install-plan.json
?? .agent-runs/
?? .agent-workflows/HANDOFF_2026-05-10_CIVICCORE_V101_PIN_SWEEP_COMPLETE.md
?? .agent-workflows/HANDOFF_2026-05-10_DEMOTION_BATCH_COMPLETE.md
?? .agent-workflows/HANDOFF_2026-05-10_WORKFLOW_PAUSED_AFTER_CIVICRECORDS_V150_GREEN.md
?? .agent-workflows/HANDOFF_2026-05-11_SESSION_PAUSE_D2_B3_PHASE0_COMPLETE.md
?? .agent-workflows/HANDOFF_2026-05-11_WORKFLOW_PAUSED_AFTER_D2_B3_GREEN.md
?? .agent-workflows/HANDOFF_PR111_MACOS_RUNNER_QUEUED_2026-05-09.md
?? .agent-workflows/HANDOFF_WORKFLOW_PAUSED_2026-05-09_AFTER_PR111_CLOSE.md
```

Notes:

- The modified installer generated/dist files predate this handoff and were not touched for the role experiment.
- `.agent-runs/` is untracked and now includes the role-experiment research artifact plus session memory.
- This handoff is also newly untracked.

### CivicRecords AI

Command snapshot before this handoff:

```text
## master...origin/master
?? .agent-runs/b2-phase2-rehearsal.md
?? .tmp-browser-qa-v1410-desktop/
?? .tmp-browser-qa-v1410-mobile/
?? .tmp-browser-qa-v144-desktop/
?? .tmp-browser-qa-v144-mobile/
?? .tmp-browser-qa-v146-desktop/
?? .tmp-browser-qa-v146-mobile/
```

Notes:

- `master` is fast-forwarded to PR #74 merge SHA `902db173366359124e4d8e84f3c440df61aa62f4`.
- `.tmp-browser-qa-*` dirs are pre-existing scratch; do not delete or commit unless explicitly scoped.
- `.agent-runs/b2-phase2-rehearsal.md` is the current RED gate record and should be preserved.

## 7. Do Not Do On Resume

- Do not tag or release `civicrecords-ai v1.6.0` while Phase 2 is RED.
- Do not touch `civiccore`, `civicclerk`, or any other module for B2 unless Scott explicitly expands scope.
- Do not clean, revert, or overwrite pre-existing dirty files.
- Do not use skill/plugin workflows unless explicitly authorized in the current user message.
- Do not treat the role-experiment artifact as authorization to edit the compatibility matrix; it was research-only.

## 8. Stoplight Status

Active module: `civicrecords-ai`

Target version: `v1.6.0`

Current status: RED

What is done:

- B2 Phase 0 approved.
- B2 Phase 1 PR #74 merged with CI green.
- Research-only role experiment completed and artifact written.
- New session memory and handoff written.

What is not done:

- B2 Phase 2 rehearsal is not green.
- `v1.6.0` is not tagged or released.
- Umbrella reconciliation for `v1.6.0` is not started.
- Final B2 completion handoff/PCP/queue update is not written.

Next action:

- Start the follow-up Phase 1B PR to remove the `_FILE` env pointer names from the container environment and make the literal B2 grep return zero lines.

Scope boundary:

- CivicRecords AI only. Research artifact complete. No other CivicSuite module work is in scope.
