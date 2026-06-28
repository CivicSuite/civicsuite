# VMHOST-RESULT-015 - model + completion + backup/restore: FAIL

Machine: DESKTOP-2BR3SJR   Time: 2026-06-27 21:43:27
MSI: CivicSuite_0.1.0_x64_en-US.msi  run 28253830442   Sandbox 20 GB.
Per-check detail:
```
backup_restore=FAIL
first_run_wizard=PASS
model_download=PASS
model_load=FAIL
real_completion=FAIL
completion=

```
## Transcript
```

[21:06:19] Installing MSI...
[21:10:42] INSTALL exit: 0
[21:10:42] Launching app with CDP...
[21:10:44] CDP connected
[21:10:44] unsigned-beta ...
[21:10:44]   OK unsigned-beta
[21:10:44] smartscreen ...
[21:10:44]   OK smartscreen
[21:10:44] locations ...
[21:10:44]   OK locations
[21:10:44] modules ...
[21:10:44]   OK modules
[21:10:44] city-profile ...
[21:10:44]   OK city-profile
[21:10:44] create-admin ...
[21:10:44]   OK create-admin
[21:10:44] sign-in ...
[21:10:44]   OK sign-in
[21:10:44] backup-default ...
[21:10:44]   OK backup-default
[21:10:44] === first-run wizard: PASS ===
[21:10:44] MODEL: firing resume-download (fire-and-forget), then polling every 45s (up to 3h)...
[21:11:30]   model: status=Partial download bytes=
[21:12:16]   model: status=Partial download bytes=
[21:13:02]   model: status=Needs runtime bytes=
[21:13:05]   CHECKSUM VERIFIED -> download complete
[21:13:05] === model download+checksum: PASS ===
[21:13:05] load-runtime-model ...
[21:33:05]   FAIL load-runtime-model: cdp timeout
[21:43:05]   backup FAIL: cdp timeout 
[21:43:05] VERDICT: FAIL

```
Live: VMHOST-LIVE-015.md
