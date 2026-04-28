# Local Demo Profile Rehearsal - 2026-04-28

Scope: `deploy/post-foundation-demo.compose.yml`

Purpose: verify the current post-foundation local demo profile from the umbrella repo after CivicRecords AI `1.4.1` and CivicCore `0.3.0` alignment.

## Fixes Found During Rehearsal

- CivicClerk wheel pins were stale: the compose profile installed CivicCore `0.2.0` and CivicClerk `0.1.0`.
- The profile verifier expected CivicClerk `0.1.0` and CivicCore `0.2.0` for CivicClerk health.
- The Postgres container created database `civicrecords`, while records-ai `.env` points `DATABASE_URL` at `civicrecords_test`.
- The records-ai frontend nginx config expects upstream hostname `api`; the umbrella compose service is named `civicrecords-api`, so a network alias was required.

## Verification

```text
python scripts\verify-deployment-profile.py
==> Deployment profile verification
VERIFY-DEPLOYMENT-PROFILE: PASSED
```

```text
bash scripts/verify-docs.sh
==> Required-artifact check
==> Stale current-facing strings check (CHANGELOG, ADRs, SUPERVISOR.md, compatibility history exempt)
PASS
```

```text
python scripts\verify-suite-state.py --remote
VERIFY-SUITE-STATE: PASSED
```

```text
python -m ruff check scripts
All checks passed!
```

```text
docker compose -f deploy\post-foundation-demo.compose.yml config
Rendered successfully with CivicCore 0.3.0, CivicClerk 0.1.1, CivicCode 0.1.1, CivicZone 0.1.1, DATABASE_URL civicrecords_test, and POSTGRES_DB civicrecords_test.
```

```text
docker compose -f deploy\post-foundation-demo.compose.yml up --build -d
Completed successfully after profile fixes.
```

## Runtime Health

```text
http://localhost:8080
status=200; length=410

http://localhost:8000/health
{"status":"ok","version":"1.4.1"}

http://localhost:8010/health
{"status":"ok","service":"civicclerk","version":"0.1.1","civiccore":"0.3.0"}

http://localhost:8020/health
{"status":"ok","service":"civiccode","version":"0.1.1","civiccore":"0.3.0"}

http://localhost:8030/health
{"status":"ok","service":"civiczone","version":"0.1.1","civiccore_version":"0.3.0"}
```

## Browser QA

In-app browser console verification:

```text
records-ai-home: http://localhost:8080/ - CivicRecords AI - Admin - 0 console errors
civicclerk-staff: http://localhost:8010/staff - CivicClerk Staff Workflow Screens - 0 console errors
civiccode: http://localhost:8020/civiccode - Read the municipal code - CivicCode - 0 console errors
civiczone: http://localhost:8030/civiczone - CivicZone Public Lookup - 0 console errors
```

Screenshot evidence:

- `docs/deployment/evidence/records-ai-home-desktop.png`
- `docs/deployment/evidence/records-ai-home-mobile.png`
- `docs/deployment/evidence/civicclerk-staff-desktop.png`
- `docs/deployment/evidence/civicclerk-staff-mobile.png`
- `docs/deployment/evidence/civiccode-desktop.png`
- `docs/deployment/evidence/civiccode-mobile.png`
- `docs/deployment/evidence/civiczone-desktop.png`
- `docs/deployment/evidence/civiczone-mobile.png`
- `docs/deployment/evidence/local-demo-profile-playwright-qa.json`

## Stack Status

All compose services reached healthy state:

```text
civicclerk              healthy
civiccode               healthy
civicrecords-api        healthy
civicrecords-frontend   healthy
civiczone               healthy
postgres                healthy
redis                   healthy
```

## Notes

- This was a local demo-profile rehearsal on the current development machine, not a pristine VM install.
- The pre-existing `civicrecords-ai` compose stack was stopped without deleting its volumes to free ports `8000` and `8080`.
- Demo-stack volumes were recreated once after the Postgres database-name fix so `POSTGRES_DB=civicrecords_test` initialized correctly.
