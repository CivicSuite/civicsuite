# VMHOST-RESULT-014 - Full first-run + 6.97GB model + real completion (Criticals #2 & #3): FAIL

Machine: DESKTOP-2BR3SJR   Time: 2026-06-27 20:49:01
MSI: CivicSuite_0.1.0_x64_en-US.msi  from CI run 28253830442   Method: Windows Sandbox 20 GB, fresh Windows
Drove the REAL first-run IPC over CDP (unsigned-beta -> smartscreen -> locations -> modules -> city-profile -> create-admin -> sign-in -> backup -> download-model -> load-runtime-model -> verify-health -> finish), then called the bundled Ollama directly for one real completion.
Real model completion captured: 


## Step-by-step transcript (inside the Sandbox)
```

[19:44:19] Installing MSI (1.5GB runtime)...
[19:48:32] INSTALL exit: 0
[19:48:32] Launching app with WebView2 CDP...
[19:48:33] CDP page connected: ws://127.0.0.1:9222/devtools/page/976912728DB521B38C0F2F1FA0931272
[19:48:33] Step: unsigned-beta notice ...
[19:48:34]   OK Step: unsigned-beta notice (status=Saved)
[19:48:34] Step: smartscreen ...
[19:48:34]   OK Step: smartscreen (status=Saved)
[19:48:34] Step: locations ...
[19:48:34]   OK Step: locations (status=Saved)
[19:48:34] Step: select city-core modules ...
[19:48:34]   OK Step: select city-core modules (status=Saved)
[19:48:34] Step: city profile ...
[19:48:34]   OK Step: city profile (status=Saved)
[19:48:34] Step: create first admin ...
[19:48:34]   OK Step: create first admin (status=Saved)
[19:48:34] Sign in as admin ...
[19:48:34]   OK Sign in as admin (status=Signed in)
[19:48:34] Step: backup default ...
[19:48:34]   OK Step: backup default (status=Saved)
[19:48:34] Step: DOWNLOAD MODEL (~6.97GB from Hugging Face + checksum - the long step; host heartbeats while this runs)
[19:48:34] download-model ...
[20:48:34]   FAIL download-model: cdp timeout
[20:48:37] First-run finished flag: False
[20:48:39] FAIL: Ollama completion error: Unable to connect to the remote server
[20:48:39] VERDICT: FAIL

```
Live: VMHOST-LIVE-014.md
