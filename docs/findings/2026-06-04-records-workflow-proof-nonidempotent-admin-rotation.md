# FINDING — records workflow proof's admin-password rotation is non-idempotent (live-install gate blocker)

**Severity:** Critical — **blocked the city-core live gate** (the `draft_response_letter` proof was permanently absent from the evidence Stage4 reads).
**Owner:** Bare-metal installer / lifecycle runner (`scripts/run-clerk-core-installer.py`) — fixed here.
**Found by:** Auditor/installer-builder (Claude), via the cross-machine tester loop (TESTER-RESULT-013 + 014).
**Status:** FIXED in `verify_records_workflow` + regression test `test_records_workflow_admin_login_is_reentrant_after_rotation`. Awaiting live re-confirmation on the tester box.

## Symptom
On a fresh, healthy 12-container stack the records `civicrecords_workflow` proof failed at its first step:
`admin_login → status_code=400, has_access_token=false`, so it never reached search/letter and the
`draft_response_letter` proof was absent. The networking hypothesis (records container cannot reach host
Ollama) was disproved by RESULT-013: the container reaches host Ollama fine (HTTP 200, `gemma4:e4b` present).

## Root cause
The bare-metal bootstrapper runs the workflow proof **twice** in one install:

```
civicsuite-baremetal-bootstrap.ps1
  line 686:  Invoke-InstallerLifecycle -Mode "install" -WorkflowProof   # install() -> verify() -> proof (pass #1)
  line 692:  Invoke-InstallerLifecycle -Mode "verify"  -WorkflowProof   # verify() -> proof (pass #2)
```

`verify_records_workflow` exercises the forced first-login rotation: it logs in with the **seeded** admin
secret (`data/secrets/first_admin_password`), then PATCHes the password to a **random throwaway**
(`f"Rotated-{uuid4().hex}-A1!"`) which is never persisted, and the admin's `must_change_password` flips to
`false`. That makes pass #1 succeed but leaves the admin password equal to a discarded random value.

Pass #2 (verify mode) logs in with the seeded secret again — which no longer matches — so fastapi-users
returns **400 LOGIN_BAD_CREDENTIALS** and the proof dies at `admin_login`. Stage4 reads the **verify-mode**
lifecycle evidence (the second, failed pass), so the gate sees no `draft_response_letter` proof.

**Evidence fingerprint (RESULT-014):** D1 showed the admin present + active with `must_change_password=f`
(proving a rotation already happened), while the seeded-secret login returned 400 — the exact signature of a
one-way rotation followed by a second login attempt with the now-stale seed.

This is a genuine idempotency defect, not a test-harness artifact: any real re-install or re-verify against an
existing stack hits the same wall (relevant to the "robust across messy/varied city boxes" bar).

## Fix
Make the proof's admin authentication **re-entrant with a deterministic rotation target** derived from the
stable seeded secret, so any later pass can re-derive it without persisted state:

- `rotated_password = f"Rotated-{password}-A1!"` (was `f"Rotated-{uuid4().hex}-A1!"`).
- After a failed seeded-secret login, retry with `rotated_password`; if that authenticates, continue.
- When `must_change_password` is already false (re-entry), the rotation step is skipped and the proof proceeds
  straight to create-request → search → letter.

Pass #1 rotates deterministically; pass #2 re-derives the rotated password and authenticates; both passes now
produce the `draft_response_letter` proof. Locked by a behavioral test that only authenticates the exact
deterministic rotated string (a random rotation would fail the test).

## Secondary observation (lower severity — logged, not gate-blocking)
At diagnostic time (RESULT-014, supplemental `ls -la /run/secrets`) the records-api container showed both
file-backed Docker secrets as inaccessible stat entries:

```
-????????? ? ? ? ? ? first_admin_password
-????????? ? ? ? ? ? jwt_secret
```

Config loaded those secrets successfully at container startup (the container is healthy and the admin was
created), so this is a **post-startup staleness** of the Windows-host→WSL2→container file-share bind for the
`chmod 0400` secret files — not the cause of the gate failure (the installer's verifier reads the host secret
file directly, and the running api/worker cache `settings` from startup). It is a latent robustness risk: a
container **restart** would re-read `/run/secrets` and could fail config validation. Worth hardening
separately (e.g. tmpfs-materialize the secret content, or relax the host-file permission model for the Docker
Desktop file-share) but it does not block this gate.
