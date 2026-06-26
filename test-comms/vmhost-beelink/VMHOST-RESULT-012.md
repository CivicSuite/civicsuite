# VMHOST-RESULT-012 - QA-B1 Clean-Machine Sandbox Validation: PASS

Machine: DESKTOP-2BR3SJR   Time: 2026-06-26 13:18:15
MSI from CI run: 28253830442
MSI file: CivicSuite_0.1.0_x64_en-US.msi  (1569 MB)
Method: Windows Sandbox (8 GB RAM, fresh disposable Windows, no prior CivicSuite install)

## Step-by-step transcript (from inside the Sandbox)
```

[13:12:24] Sandbox booted. Locating MSI...
[13:12:24] MSI: CivicSuite_0.1.0_x64_en-US.msi (1569 MB)
[13:12:24] INSTALL: msiexec /i /quiet starting (1.5 GB runtime - this takes a few minutes)...
[13:16:40] INSTALL exit code: 0
[13:16:40] INSTALL OK
[13:16:40] VERIFY: looking for ARP/uninstall entry...
[13:16:40] ARP entry: CivicSuite 0.1.0
[13:16:40] BINARY: C:\Program Files\CivicSuite\civicsuite-desktop.exe (12734 KB)
[13:16:40] UNINSTALL: msiexec /x /quiet starting...
[13:17:57] UNINSTALL exit code: 0
[13:17:57] UNINSTALL OK: ARP entry removed
[13:17:57] VERDICT: PASS

```

Live narrative: VMHOST-LIVE-012.md
