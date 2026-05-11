# Session Memory - 2026-05-11

Use this as the compact state snapshot for the next session.

## Current State

- Latest user request: prepare for a new-session handoff, write memory, and pause.
- No product source edits are in progress in CivicSuite.
- A research-only role experiment was completed exactly as prompted:
  - Prompt file read: `C:\Users\scott\OneDrive\Desktop\Claude\_recon\civicsuite-codex-role-experiment\CODEX_PROMPT.md`
  - Artifact written: `C:\Users\scott\OneDrive\Desktop\Claude\CivicSuite\.agent-runs\2026-05-11-civicrecords-version-pin-research\research.md`
  - Finding: `civicrecords-ai` currently pins CivicCore `v1.0.1`; the umbrella compatibility matrix also records `==1.0.1`, so the pin matches. Caveat: the matrix row still lists `civicrecords-ai` version `1.5.0`, while `../civicrecords-ai/backend/pyproject.toml` now says `1.6.0`.
- CivicRecords AI B2 Phase 1 was completed before the role experiment:
  - PR: `https://github.com/CivicSuite/civicrecords-ai/pull/74`
  - Merge SHA: `902db173366359124e4d8e84f3c440df61aa62f4`
  - CI: green on run `25688368816`
  - Scope: file-backed Docker secrets for `JWT_SECRET` and `FIRST_ADMIN_PASSWORD`, docs and Rule 9 deliverables updated.
- CivicRecords AI B2 Phase 2 is RED and halted before tag push:
  - Artifact written but not pushed: `C:\Users\scott\OneDrive\Desktop\Claude\civicrecords-ai\.agent-runs\b2-phase2-rehearsal.md`
  - Blocker 1: `install.sh` cannot complete on this host because `scripts/detect_hardware.sh` reports 14 GB RAM and requires 32 GB.
  - Blocker 2: the literal B2 acceptance command still fails because `_FILE` pointer env vars remain visible:
    - `FIRST_ADMIN_PASSWORD_FILE=/run/secrets/first_admin_password`
    - `JWT_SECRET_FILE=/run/secrets/jwt_secret`
  - Important nuance: raw secret values are hidden, but the directive required zero matching `JWT_SECRET|FIRST_ADMIN_PASSWORD` env names.

## Recommended Next Move

Start a bounded Phase 1B PR in `civicrecords-ai` before any v1.6.0 tag:

1. Remove `JWT_SECRET_FILE` and `FIRST_ADMIN_PASSWORD_FILE` from the container environment.
2. Make `backend/app/config.py` default to `/run/secrets/jwt_secret` and `/run/secrets/first_admin_password` when direct legacy env vars are absent.
3. Update the contract test and `scripts/verify-release.sh` to enforce the literal command:
   `docker exec <records-api> env | grep -E "JWT_SECRET|FIRST_ADMIN_PASSWORD"` must return zero lines.
4. Rerun full verification.
5. Then rerun Phase 2 rehearsal and stop for the human tag-push gate.

## Do Not Do

- Do not tag or release `civicrecords-ai v1.6.0` until Phase 2 is green.
- Do not touch CivicClerk, CivicCore, the seven demoted releases, or other modules for B2 unless explicitly authorized.
- Do not use skills or plugin workflows unless Scott explicitly authorizes the exact skill/plugin in the current message.
- Do not clean or revert pre-existing dirty installer generated artifacts in `CivicSuite` unless explicitly scoped.

## Workspace Dirt To Expect

`CivicSuite` has pre-existing modified installer generated/dist files and untracked older handoffs/run artifacts. These predate the current pause and should be preserved.

`civicrecords-ai` has untracked old `.tmp-browser-qa-*` scratch dirs and the new untracked Phase 2 rehearsal artifact.
