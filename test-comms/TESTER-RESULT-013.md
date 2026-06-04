# Tester Result 013 - diagnostic: records proof absent before letter step
**Tester machine:** Microsoft Windows 11 Pro 10.0.26200 build 26200; 16,629,244 KB visible RAM; Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz, 6 cores / 12 logical processors.
**Branch head tested:** `f57b816 test(comms): directive 013 - diagnose why records draft_response_letter proof is absent`
**Date/time (UTC):** 2026-06-04T02:47:16.4808285Z

## Diagnostic context
This was a read-only diagnostic against the stack left up by result 012. I did not re-provision or edit source files. The stack was still running when the diagnostic started.

## 1. Records API Ollama environment
Command:
```powershell
docker exec civicsuite-stage3a-baremetal-records-api-1 sh -lc "printenv | grep -i ollama"
```

Raw output:
```text
OLLAMA_BASE_URL=http://host.docker.internal:11434
CIVICRECORDS_USE_HOST_OLLAMA=true
OLLAMA_KEEP_ALIVE=30m
```

## 2. Records container reachability to host Ollama
Command:
```powershell
docker exec civicsuite-stage3a-baremetal-records-api-1 python -c "import urllib.request,sys; r=urllib.request.urlopen('http://host.docker.internal:11434/api/tags',timeout=5); print('reachable', r.status, r.read()[:120])"
```

Raw output:
```text
reachable 200 b'{"models":[{"name":"gemma4:e4b","model":"gemma4:e4b","modified_at":"2026-06-03T20:22:11.4899045-06:00","size":9608350718'
```

## 3. CivicRecords workflow proof object
Command:
```powershell
$j = Get-Content installer\reports\stage3a-baremetal\clerk-core-installer-lifecycle.json -Raw | ConvertFrom-Json
$cw = $j.checks | Where-Object { $_.name -eq 'starter_set_runtime_workflows' }
$records = $cw.checks | Where-Object { $_.name -eq 'civicrecords_workflow' }
$records | ConvertTo-Json -Depth 20
```

Raw output:
```json
{
    "checks":  [
                   {
                       "has_access_token":  false,
                       "name":  "admin_login",
                       "status_code":  400
                   }
               ],
    "name":  "civicrecords_workflow",
    "status":  "failed"
}
```

Interpretation: no `draft_response_letter` check exists because `civicrecords_workflow` failed at `admin_login` before reaching the search/letter steps. The missing proof is not caused by records API container inability to reach host Ollama.

## 4. Records API logs
Command:
```powershell
docker logs --tail 80 civicsuite-stage3a-baremetal-records-api-1
```

Raw output:
```text
INFO:     127.0.0.1:43088 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:48722 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:44108 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:59530 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:57516 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:55504 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:56902 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:40210 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:38608 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:32854 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:46710 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:38148 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:37686 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:53750 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:37150 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:55934 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:56914 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:49322 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:50490 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:51068 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:45642 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:35446 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:34912 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:42270 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:56956 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:47382 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:53448 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:53384 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:32914 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:33564 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:59798 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:37570 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:53170 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:40130 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:52044 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:43892 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:38366 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:37512 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:60426 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:33660 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:42602 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:43968 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:51568 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:52868 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:35262 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:54192 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:45600 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:41224 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:38124 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:59686 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:56542 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:33764 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:51508 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:51120 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:55484 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:42248 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:44990 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:39310 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:54666 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:52694 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:60700 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:44096 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:50906 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:48182 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:41580 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:40126 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:58500 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:49330 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:35448 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:49362 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:54734 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:39150 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:43310 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:60236 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:54740 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:35178 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:53766 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:46642 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:34308 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:42936 - "GET /health HTTP/1.1" 200 OK
```

## Bottom line
The records API container is configured for host Ollama and can reach it successfully. The missing `draft_response_letter` proof is because the CivicRecords workflow fails at `admin_login` (`status_code=400`, `has_access_token=false`) before it reaches embeddings/search/letter generation.
