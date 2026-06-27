# VMHOST-RESULT-013 - Clean-Machine BOOT proof (Critical #1 + C3): PASS

Machine: DESKTOP-2BR3SJR   Time: 2026-06-27 13:34:08
MSI: CivicSuite_0.1.0_x64_en-US.msi  from CI run 28253830442   Method: Windows Sandbox 8 GB, fresh Windows
Proves: app launches, WebView2 window RENDERS (CDP page target), survives >60s (no boot crash), single-instance (C3) holds on 2nd launch.
Does NOT cover (-> directive 014): first-run wizard click-through, 6.97 GB model download+load, real AI completion, real workflow, GUI backup/restore.
Screenshot: VMHOST-RESULT-013-screenshot.png (if captured)

## Transcript (inside the Sandbox)
```

[13:28:15] Sandbox booted. Installing MSI...
[13:32:27] INSTALL exit: 0
[13:32:27] BINARY: C:\Program Files\CivicSuite\civicsuite-desktop.exe
[13:32:27] Launching app with WebView2 CDP on :9222 ...
[13:32:53] WINDOW RENDERED -> CDP page target title="CivicSuite" url=http://tauri.localhost/
[13:33:33] PROCESS ALIVE >60s (no boot crash)
[13:33:33] Screenshot captured.
[13:33:33] Launching 2nd instance (single-instance / C3 check)...
[13:33:45] SINGLE-INSTANCE OK: still 1 main process after 2nd launch (C3 holds)
[13:33:45] VERDICT: PASS

```
Live: VMHOST-LIVE-013.md
