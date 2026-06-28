# VMHOST-RESULT-016 - model load + completion + backup/restore: PASS

Machine: DESKTOP-2BR3SJR   Time: 2026-06-27 22:33:43
MSI: CivicSuite_0.1.0_x64_en-US.msi  run 28253830442   Sandbox 20 GB.
Per-check:
```
backup_restore=PASS
first_run_wizard=PASS
model_download=PASS
model_load=PASS
real_completion=PASS
completion=I am running.

```
## Transcript
```

[22:04:15] Installing MSI...
[22:08:36] INSTALL exit: 0
[22:08:36] Launching app with CDP...
[22:08:37] CDP connected
[22:08:37] unsigned-beta ...
[22:08:38]   OK unsigned-beta
[22:08:38] smartscreen ...
[22:08:38]   OK smartscreen
[22:08:38] locations ...
[22:08:38]   OK locations
[22:08:38] modules ...
[22:08:38]   OK modules
[22:08:38] city-profile ...
[22:08:38]   OK city-profile
[22:08:38] create-admin ...
[22:08:38]   OK create-admin
[22:08:38] sign-in ...
[22:08:38]   OK sign-in
[22:08:38] backup-default ...
[22:08:38]   OK backup-default
[22:08:38] === wizard: PASS ===
[22:08:38] MODEL: fire resume-download, poll verify-checksum (up to 60m)...
[22:09:08]   ...downloading
[22:09:38]   ...downloading
[22:10:08]   ...downloading
[22:10:42]   CHECKSUM VERIFIED
[22:10:42] HEALTH: fire verify-health (bootstraps runtime incl Ollama), poll Ollama reachable (up to 20m)...
[22:11:04]   ...waiting for Ollama
[22:11:26]   ...waiting for Ollama
[22:11:48]   ...waiting for Ollama
[22:12:10]   ...waiting for Ollama
[22:12:32]   ...waiting for Ollama
[22:12:54]   ...waiting for Ollama
[22:13:16]   ...waiting for Ollama
[22:13:38]   ...waiting for Ollama
[22:14:00]   ...waiting for Ollama
[22:14:22]   ...waiting for Ollama
[22:14:44]   ...waiting for Ollama
[22:15:06]   ...waiting for Ollama
[22:15:28]   ...waiting for Ollama
[22:15:50]   ...waiting for Ollama
[22:16:12]   ...waiting for Ollama
[22:16:34]   ...waiting for Ollama
[22:16:56]   ...waiting for Ollama
[22:17:18]   ...waiting for Ollama
[22:17:40]   ...waiting for Ollama
[22:18:02]   ...waiting for Ollama
[22:18:24]   ...waiting for Ollama
[22:18:46]   ...waiting for Ollama
[22:19:08]   ...waiting for Ollama
[22:19:30]   ...waiting for Ollama
[22:19:52]   ...waiting for Ollama
[22:20:14]   ...waiting for Ollama
[22:20:36]   ...waiting for Ollama
[22:20:58]   ...waiting for Ollama
[22:21:20]   ...waiting for Ollama
[22:21:42]   ...waiting for Ollama
[22:22:04]   ...waiting for Ollama
[22:22:26]   ...waiting for Ollama
[22:22:48]   ...waiting for Ollama
[22:23:10]   ...waiting for Ollama
[22:23:33]   ...waiting for Ollama
[22:23:55]   ...waiting for Ollama
[22:24:17]   ...waiting for Ollama
[22:24:39]   ...waiting for Ollama
[22:25:01]   ...waiting for Ollama
[22:25:23]   ...waiting for Ollama
[22:25:45]   ...waiting for Ollama
[22:26:07]   ...waiting for Ollama
[22:26:29]   ...waiting for Ollama
[22:26:51]   ...waiting for Ollama
[22:27:13]   ...waiting for Ollama
[22:27:35]   ...waiting for Ollama
[22:27:57]   ...waiting for Ollama
[22:28:19]   ...waiting for Ollama
[22:28:41]   ...waiting for Ollama
[22:29:03]   ...waiting for Ollama
[22:29:25]   ...waiting for Ollama
[22:29:47]   ...waiting for Ollama
[22:30:09]   ...waiting for Ollama
[22:30:31]   ...waiting for Ollama
[22:30:53]   ...waiting for Ollama
[22:30:53] LOAD: fire load-runtime-model, poll Ollama /api/tags for the model (up to 30m)...
[22:31:13]   ...loading model
[22:31:33]   ...loading model
[22:31:53]   ...loading model
[22:32:13]   Ollama models: civicsuite-gemma4-12b-qat:q4_0
[22:32:13] COMPLETION: civicsuite-gemma4-12b-qat:q4_0 (CPU, slow)...
[22:32:38] REAL COMPLETION: I am running.
[22:32:38]   OK wizard model step
[22:32:38]   REJECTED finish: CivicSuite cannot continue this setup step until these required steps are complete: Health verification.
[22:32:38] BACKUP: fire supervisor backup, poll backup folder (up to 10m)...
[22:32:58]   backup artifact appeared (31 items under backup root)
[22:32:58] RESTORE: fire supervisor restore, poll app state (up to 10m)...
[22:33:20]   app state reloaded after restore
[22:33:20] VERDICT: PASS

```
Live: VMHOST-LIVE-016.md
