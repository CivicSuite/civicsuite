# CivicSuite Windows Local Runtime

This directory defines the desktop supervisor contract for the Windows Local
1.0 profile.

`windows-local-runtime.json` is not a generated installer output. It is the
source contract the Tauri shell reads while the installer and portable runtime
bundle are implemented.

`windows-first-run.json` is the structured installer and first-run checklist
for the same Windows Local 1.0 profile. It keeps the unsigned beta notice,
SmartScreen guidance, local paths, module selection, model download, city
profile, first admin, backup, health, repair, and uninstall steps testable
before the native installer executor mutates host state.

`windows-runtime-payloads.json` defines the portable runtime payloads that the
desktop supervisor installs or repairs from the bundled Tauri resource folder:
portable PostgreSQL 17 with pgvector, bundled CPython city services, and the
native Ollama runtime.

`gemma4-model.json` is the pinned local model contract for the Windows Local
1.0 profile. It identifies the official Gemma 4 12B QAT Q4_0 GGUF source,
Ollama runtime id, expected file size, required SHA-256 checksum, resumable
consent-gated download policy, and readiness checks that must pass before AI
workflows are enabled.

Current state:

- The runtime manifest defines the local services the supervisor owns.
- The payload manifest defines the files install/repair can copy into the local
  runtime profile.
- The desktop shell reports required services as needing setup until their
  bundled runtime payloads are present and their health checks pass.
- Lifecycle actions now prepare folders, copy available payloads, start/stop
  declared service processes, probe health, collect logs, back up, restore, and
  prepare uninstall.
- First-run steps are declared now so the desktop shell renders setup from
  structured state instead of static copy.
- Model readiness is declared now so the desktop shell can show blocked,
  checksum-required local model state without silently starting a network
  download.
