# CivicSuite Desktop

Status: Windows Local 1.0 desktop app in active completion

This directory contains the Tauri/WebView2 desktop application for CivicSuite.
The Windows desktop app is the local operator surface for CivicCore and the
City Core module package:

- task-first navigation for the city-core workflows
- Staff, Resident/Public, and IT/Admin surfaces
- module manager backed by `installer/modules.json` and local profile state
- local health and installer-readiness surfaces
- Windows local runtime supervisor manifest and health state
- structured installer and first-run setup contract
- Gemma 4 12B QAT Q4_0 model metadata and readiness state
- backup, restore, repair, and uninstall entry points for the local profile

The app owns the clerk-facing Windows path. Portable runtime payloads, module
contracts, local workflow persistence, and installer lifecycle actions plug
into this surface as the completion work advances.

The local AI model path is also contract-first. The shell reads
`runtime/gemma4-model.json`, renders the pinned Google/Hugging Face source,
expected GGUF file, expected SHA-256, local path, and readiness checks, and
blocks download or verification actions until the native installer downloader is
wired. Staff workflows must not treat AI as available until the local file,
checksum, runtime, and CivicCore model registry checks are all ready.

`npm test` runs fast static desktop contract checks. `npm run test:browser`
starts the local Vite app and uses Playwright with the installed Microsoft
Edge channel to verify first-run, model-readiness, module-manager, and workflow
UI wiring.
