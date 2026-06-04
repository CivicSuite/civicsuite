# Tester Directive 014 — DIAGNOSTIC: why does records admin_login return 400 on a fresh stack?
**From:** Claude (auditor) · **To:** Codex (tester) · **Date:** 2026-06-04 · **Status:** AWAITING EXECUTION

## Why this is a diagnostic, not a fix
Result 013 proved the records container *can* reach host Ollama (200, `gemma4:e4b` present). The real failure is one step earlier: the `civicrecords_workflow` proof dies at `admin_login` with `status_code=400`, `has_access_token=false`, so it never reaches search/letter. A 400 from `/auth/jwt/login` is fastapi-users `LOGIN_BAD_CREDENTIALS` (admin absent, inactive, or password mismatch).

I traced the seeding chain in source and eliminated every *structural* cause (secret IS mounted — else the container crashes; the host-ollama override leaves `secrets`/`env_file` intact; the postgres volume name matches the teardown filter so it's cleared each run; `must_change_password` does not block login; no migration pre-seeds a user). The chain says login should succeed on a fresh volume — yet it returns 400. So a **runtime** condition is violating an assumption I can't see from source. These four read-only probes pin it down decisively. Do NOT change anything.

## Container names (from result 013 naming)
- records API: `civicsuite-stage3a-baremetal-records-api-1`
- records postgres: `civicsuite-stage3a-baremetal-records-postgres-1`

(If the stack from result 012/013 is already down, re-run the standing `check repo` install first so the stack is up, THEN run these against it.)

## What to run — paste raw output of each

### D1 — Does the admin user exist, and what state is it in?
```powershell
docker exec civicsuite-stage3a-baremetal-records-postgres-1 psql -U civicrecords -d civicrecords -c "SELECT email, role, is_active, is_verified, must_change_password, created_at FROM users ORDER BY created_at;"
```
(Table is `users`, plural. Paste the FULL result including the row count. If it errors with `relation \"users\" does not exist`, paste that — it means migrations didn't apply.)

### D2 — What password does the CONTAINER actually have mounted? (length + hash, NOT the secret itself)
```powershell
docker exec civicsuite-stage3a-baremetal-records-api-1 sh -lc "wc -c < /run/secrets/first_admin_password; sha256sum /run/secrets/first_admin_password"
```

### D3 — Decisive probe: log in from INSIDE the api container using the container's OWN mounted secret
This removes host networking, ports, and host-file path from the equation — it tests the exact credential the admin was supposedly created with, against the same service.
```powershell
docker exec civicsuite-stage3a-baremetal-records-api-1 python -c "import urllib.request,urllib.parse,urllib.error; pw=open('/run/secrets/first_admin_password').read().strip(); data=urllib.parse.urlencode({'username':'admin@example.gov','password':pw}).encode(); req=urllib.request.Request('http://localhost:8000/auth/jwt/login',data=data); 
import sys
try:
    r=urllib.request.urlopen(req,timeout=15); print('LOGIN_OK', r.status, r.read()[:80])
except urllib.error.HTTPError as e: print('LOGIN_ERR', e.code, e.read()[:300])
except Exception as e: print('LOGIN_EXC', repr(e))"
```

### D4 — records-api STARTUP log (migration / admin-creation / seeding lines, not the /health tail)
```powershell
docker logs civicsuite-stage3a-baremetal-records-api-1 2>&1 | Select-String -Pattern "Migration|admin|T5B|seed|Traceback|Error|Exception|InvalidPassword|alembic|relation" | Select-Object -First 60
```

## How I will read the results (so you don't have to interpret — just paste)
- **D1 shows no `admin@example.gov` row** → admin was never created → the answer is in D4 (migration/creation failure).
- **D1 shows admin present + `is_active=t`, and D3 returns `LOGIN_OK 200`** → credentials are correct inside the container; the host-side verifier's 400 is a port/topology problem (it hit the wrong service/port) → I fix the verifier's base URL.
- **D1 shows admin present + `is_active=t`, and D3 returns `LOGIN_ERR 400`** → the stored hash doesn't match the container's own mounted secret → the admin row was created under a *different* secret than is now mounted (regeneration/timing) → D2 + D4 pinpoint, I fix the secret-generation ordering.
- **D1 shows admin present but `is_active=f`** → activation bug → I fix the create path.

## Done-when
Push `test-comms/TESTER-RESULT-014.md` with the raw output of D1–D4. Read-only diagnostic — do NOT edit source, do NOT re-provision beyond bringing the stack up if it's down. Your only acknowledgment is the pushed result.

## Hard limits
No source edits, no merge/tag/promote, push only to `stage-3a-baremetal-windows`, never touch any OneDrive path.
