# FINDING — clerk workflow proofs 401 because the proof never installs clerk in bearer mode

**Severity:** Major — blocks the city-core install from going fully green (records letter gate already passes; clerk + clerk→code workflow proofs fail).
**Owner:** Bare-metal installer / lifecycle runner (`scripts/run-clerk-core-installer.py`) — fixed here.
**Found by:** Auditor/installer-builder (Claude), via TESTER-RESULT-015 (the gate re-run after the records admin-auth fix).
**Status:** FIXED (`resolve_staff_mode` + `write_clerk_env` upgrade-on-existing). Awaiting live re-confirmation.

## Symptom
RESULT-015: the records response-letter gate PASSED (`generation_source=ollama`, `generation_model=gemma4:e4b`),
but the overall install still reported `failed` because two other starter-set workflow proofs 401'd:
`civicclerk_bearer_workflow` and `clerk_to_code_handoff`.

## Root cause (traced from source, not inferred)
1. The workflow proof authenticates CivicClerk with a **static bearer token** (`CLERK_WORKFLOW_PROOF_BEARER`)
   and expects clerk to be in **bearer** staff-auth mode:
   - `verify_clerk_bearer_workflow` → `GET /staff/session` with `Authorization: Bearer …`, requires `mode == bearer`.
   - `verify_clerk_to_code_handoff` → first call `POST /meetings` with the same bearer header.
   Both are invoked unconditionally whenever clerk is selected (`verify_starter_set_workflow_contract`).
2. But the runner's `--staff-mode` defaults to `protected`, and `--workflow-proof` did **not** change it. The
   bare-metal bootstrapper (`Invoke-InstallerLifecycle`) never passes `--staff-mode bearer`, so clerk installed
   in **protected** mode. A bearer token against a protected clerk → **401 at `/staff/session`** (and at the
   handoff's first clerk call). So the clerk proofs have never passed on this box.
3. Compounding idempotency bug: `write_clerk_env` early-returned when a `.env` already existed, so even once
   bearer was requested, a **stale protected `.env`** from a prior run (teardown clears Docker state, not the
   host runtime dir) was kept — `ensure_env_value` only adds-when-missing and could not upgrade the mode.

`clerk_to_code_handoff`'s 401 is the same clerk-bearer cause (its first call is clerk-side). Its later
code-intake step uses `CIVICCODE_INTAKE_SECRET`, which both the clerk and code `.env` preserve consistently
across runs, so it is not implicated in the 401 — the next live run confirms that step end to end.

## Fix
- `resolve_staff_mode(requested_mode, workflow_proof)`: `--workflow-proof` forces `bearer` over the default,
  resolved once in `main()` and used for the install, verify, and repair passes so they agree. This matches the
  existing design intent (`verify()` only checks protected-default when **not** workflow_proof).
- `write_clerk_env`: on an existing `.env`, **upgrade** `CIVICCLERK_STAFF_AUTH_MODE` and write the
  `CIVICCLERK_STAFF_AUTH_TOKEN_ROLES` allowlist via a new update-or-add `set_env_value` helper, so a stale
  protected file is corrected rather than silently kept.

Tests (`tests/test_stage2_live_install_blockers.py`):
`test_resolve_staff_mode_forces_bearer_for_workflow_proof`, `test_set_env_value_updates_existing_and_adds_missing`,
`test_write_clerk_env_upgrades_stale_protected_env_to_bearer`, `test_write_clerk_env_fresh_bearer_writes_token_roles`.
Full stage2 + bootstrapper suites: 39 passed.
