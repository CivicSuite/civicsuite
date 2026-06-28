# VMHOST-RESULT-017 - FINAL QA-B1 on the 1.0.1 MSI (first-run + model + completion + clerk workflow + backup/restore): PASS

Machine: DESKTOP-2BR3SJR   Time: 2026-06-28 06:17:27
MSI: CivicSuite_1.0.1_x64_en-US.msi  run 28318711830   Sandbox 20 GB.
Per-check:
```
clerk_workflow=PASS
first_run_wizard=PASS
model_load=PASS
backup_restore=PASS
real_completion=PASS
model_download=PASS
completion=I am running.

```
## Transcript
```

[05:48:13] Installing MSI...
[05:52:28] INSTALL exit: 0
[05:52:28] Launching app with CDP...
[05:52:30] CDP connected
[05:52:30] unsigned-beta ...
[05:52:31]   OK unsigned-beta
[05:52:31] smartscreen ...
[05:52:31]   OK smartscreen
[05:52:31] locations ...
[05:52:31]   OK locations
[05:52:31] modules ...
[05:52:31]   OK modules
[05:52:31] city-profile ...
[05:52:31]   OK city-profile
[05:52:31] create-admin ...
[05:52:31]   OK create-admin
[05:52:31] sign-in ...
[05:52:31]   OK sign-in
[05:52:31] backup-default ...
[05:52:31]   OK backup-default
[05:52:31] === wizard: PASS ===
[05:52:31] MODEL: fire resume-download, poll verify-checksum (up to 60m)...
[05:53:01]   ...downloading
[05:53:31]   ...downloading
[05:54:01]   ...downloading
[05:54:34]   CHECKSUM VERIFIED
[05:54:34] HEALTH: fire verify-health (bootstraps runtime incl Ollama), poll Ollama reachable (up to 20m)...
[05:54:57]   ...waiting for Ollama
[05:55:19]   ...waiting for Ollama
[05:55:41]   ...waiting for Ollama
[05:56:03]   ...waiting for Ollama
[05:56:25]   ...waiting for Ollama
[05:56:47]   ...waiting for Ollama
[05:57:09]   ...waiting for Ollama
[05:57:31]   ...waiting for Ollama
[05:57:53]   ...waiting for Ollama
[05:58:15]   ...waiting for Ollama
[05:58:37]   ...waiting for Ollama
[05:58:59]   ...waiting for Ollama
[05:59:21]   ...waiting for Ollama
[05:59:43]   ...waiting for Ollama
[06:00:05]   ...waiting for Ollama
[06:00:27]   ...waiting for Ollama
[06:00:49]   ...waiting for Ollama
[06:01:11]   ...waiting for Ollama
[06:01:33]   ...waiting for Ollama
[06:01:55]   ...waiting for Ollama
[06:02:17]   ...waiting for Ollama
[06:02:39]   ...waiting for Ollama
[06:03:01]   ...waiting for Ollama
[06:03:23]   ...waiting for Ollama
[06:03:45]   ...waiting for Ollama
[06:04:07]   ...waiting for Ollama
[06:04:29]   ...waiting for Ollama
[06:04:51]   ...waiting for Ollama
[06:05:13]   ...waiting for Ollama
[06:05:35]   ...waiting for Ollama
[06:05:57]   ...waiting for Ollama
[06:06:19]   ...waiting for Ollama
[06:06:41]   ...waiting for Ollama
[06:07:03]   ...waiting for Ollama
[06:07:25]   ...waiting for Ollama
[06:07:47]   ...waiting for Ollama
[06:08:09]   ...waiting for Ollama
[06:08:31]   ...waiting for Ollama
[06:08:53]   ...waiting for Ollama
[06:09:15]   ...waiting for Ollama
[06:09:37]   ...waiting for Ollama
[06:09:59]   ...waiting for Ollama
[06:10:21]   ...waiting for Ollama
[06:10:43]   ...waiting for Ollama
[06:11:05]   ...waiting for Ollama
[06:11:27]   ...waiting for Ollama
[06:11:49]   ...waiting for Ollama
[06:12:11]   ...waiting for Ollama
[06:12:34]   ...waiting for Ollama
[06:12:56]   ...waiting for Ollama
[06:13:18]   ...waiting for Ollama
[06:13:40]   ...waiting for Ollama
[06:14:02]   ...waiting for Ollama
[06:14:24]   ...waiting for Ollama
[06:14:46]   ...waiting for Ollama
[06:14:46] LOAD: fire load-runtime-model, poll Ollama /api/tags for the model (up to 30m)...
[06:15:06]   ...loading model
[06:15:26]   ...loading model
[06:15:46]   ...loading model
[06:16:06]   Ollama models: civicsuite-gemma4-12b-qat:q4_0
[06:16:06] COMPLETION: civicsuite-gemma4-12b-qat:q4_0 (CPU, slow)...
[06:16:31] REAL COMPLETION: I am running.
[06:16:31]   OK wizard model step
[06:16:31]   REJECTED finish: CivicSuite cannot continue this setup step until these required steps are complete: Health verification.
[06:16:31] CLERK WORKFLOW: submit-public-records-request...
[06:16:31]   submitted records request; tracking=REQ-0001
[06:16:31]   lookup OK -> records request round-trips (intake persisted + retrievable)
[06:16:31] BACKUP: fire supervisor backup, poll backup folder (up to 10m)...
[06:16:51]   backup artifact appeared (33 items under backup root)
[06:16:51] RESTORE: fire supervisor restore, poll app state (up to 10m)...
[06:17:12]   app state reloaded after restore
[06:17:12] VERDICT: PASS

```
Live: VMHOST-LIVE-017.md
