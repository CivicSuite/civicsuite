# Tester Result 014 - diagnostic: records admin_login 400
**Tester machine:** Microsoft Windows 11 Pro 10.0.26200 build 26200; 16,629,244 KB visible RAM; Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz, 6 cores / 12 logical processors.
**Branch head tested:** `680de58 test(comms): directive 014 - diagnose records admin_login 400 (in-container login probe)`
**Date/time (UTC):** 2026-06-04T03:12:18.5179955Z

## Diagnostic context
This was a read-only diagnostic against the stack left up by result 012/013. I did not re-provision or edit source files. The stack was running when the diagnostic started.

## D1 - Admin user state
Command:
```powershell
docker exec civicsuite-stage3a-baremetal-records-postgres-1 psql -U civicrecords -d civicrecords -c "SELECT email, role, is_active, is_verified, must_change_password, created_at FROM users ORDER BY created_at;"
```

Raw output:
```text
       email       | role  | is_active | is_verified | must_change_password |          created_at           
-------------------+-------+-----------+-------------+----------------------+-------------------------------
 admin@example.gov | admin | t         | t           | f                    | 2026-06-04 02:19:38.686854+00
(1 row)
```

## D2 - Mounted admin password secret length/hash
Command:
```powershell
docker exec civicsuite-stage3a-baremetal-records-api-1 sh -lc "wc -c < /run/secrets/first_admin_password; sha256sum /run/secrets/first_admin_password"
```

Exit code: 1

Raw output:
```text
sh: 1: cannot open /run/secrets/first_admin_password: No such file
sha256sum: /run/secrets/first_admin_password: No such file or directory
```

## D3 - In-container login with mounted secret
Command:
```powershell
docker exec civicsuite-stage3a-baremetal-records-api-1 python -c "import urllib.request,urllib.parse,urllib.error; pw=open('/run/secrets/first_admin_password').read().strip(); data=urllib.parse.urlencode({'username':'admin@example.gov','password':pw}).encode(); req=urllib.request.Request('http://localhost:8000/auth/jwt/login',data=data); 
import sys
try:
    r=urllib.request.urlopen(req,timeout=15); print('LOGIN_OK', r.status, r.read()[:80])
except urllib.error.HTTPError as e: print('LOGIN_ERR', e.code, e.read()[:300])
except Exception as e: print('LOGIN_EXC', repr(e))"
```

Exit code: 1

Raw output:
```text
Traceback (most recent call last):
  File "<string>", line 1, in <module>
FileNotFoundError: [Errno 2] No such file or directory: '/run/secrets/first_admin_password'
```

## D4 - Records API startup log filter
Command:
```powershell
docker logs civicsuite-stage3a-baremetal-records-api-1 2>&1 | Select-String -Pattern "Migration|admin|T5B|seed|Traceback|Error|Exception|InvalidPassword|alembic|relation" | Select-Object -First 60
```

Exit code: 1

Raw output:
```text
Migrations: up to date
T5B first-boot seeding: exemption_rules={'created': 175, 'skipped': 0}, disclosure_templates={'created': 5, 'skipped': 
0, 'missing_files': []}, notification_templates={'created': 12, 'skipped': 0}
```

## Supplemental check
Because D2 and D3 failed on the missing secret path, I checked `/run/secrets` and relevant environment variables.

Command:
```powershell
docker exec civicsuite-stage3a-baremetal-records-api-1 sh -lc "ls -la /run /run/secrets 2>&1; printenv | sort | grep -Ei 'ADMIN|PASSWORD|SECRET|AUTH|USER|RECORDS'"
```

Raw output:
```text
/run:
total 16
drwxr-xr-x 1 root root 4096 Jun  4 02:19 .
drwxr-xr-x 1 root root 4096 Jun  4 02:19 ..
drwxrwxrwt 2 root root 4096 May 18 00:00 lock
drwxr-xr-x 2 root root 4096 Jun  4 02:19 secrets

/run/secrets:
ls: cannot access '/run/secrets/jwt_secret': No such file or directory
ls: cannot access '/run/secrets/first_admin_password': No such file or directory
total 8
drwxr-xr-x 2 root root 4096 Jun  4 02:19 .
drwxr-xr-x 1 root root 4096 Jun  4 02:19 ..
-????????? ? ?    ?       ?            ? first_admin_password
-????????? ? ?    ?       ?            ? jwt_secret
CIVICCORE_SUITE_SESSION_SECRET=SpWAmmacNqi9845UKL-EApgHBxqdqDSHXVNPdfbSfBWtv9IUAhOXrOmpSTIXE0Mz
CIVICRECORDS_API_PORT=18163
CIVICRECORDS_GPU_ENABLED=true
CIVICRECORDS_SECRET_DIR=./data/secrets
CIVICRECORDS_USE_HOST_OLLAMA=true
CIVICRECORDS_WEB_PORT=18243
DATABASE_URL=postgresql+asyncpg://civicrecords:civicrecords@postgres:5432/civicrecords
FIRST_ADMIN_EMAIL=admin@example.gov
```

## Bottom line
D1 shows `admin@example.gov` exists and is active/verified with `must_change_password=false`. D2/D3 show the records API container cannot read `/run/secrets/first_admin_password`; the in-container login probe cannot test the password because the secret path is unavailable. The supplemental `ls` shows `/run/secrets` contains broken/inaccessible-looking entries for `first_admin_password` and `jwt_secret`.
