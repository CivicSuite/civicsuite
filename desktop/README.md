# CivicSuite Desktop

Status: Windows Local 1.0 desktop shell scaffold

This directory contains the Tauri/WebView2 desktop application for CivicSuite.
The first scaffold is intentionally focused on the shell contract:

- task-first navigation for the city-core workflows
- Staff, Resident/Public, and IT/Admin surfaces
- module manager backed by `installer/modules.json`
- local health and installer-readiness surfaces
- Windows local runtime supervisor manifest and health state
- structured installer and first-run setup contract
- Gemma 4 12B QAT Q4_0 model metadata and readiness state
- honest state copy while the portable runtime and services are still landing

The shell is not a replacement for module services. It is the host that the
portable runtime, installer, and module packages plug into during the next
implementation slices.

The local AI model path is also contract-first. The shell reads
`runtime/gemma4-model.json`, renders the pinned Google/Hugging Face source,
expected GGUF file, expected SHA-256, local path, and readiness checks, and
blocks download or verification actions until the native installer downloader is
wired. Staff workflows must not treat AI as available until the local file,
checksum, runtime, and CivicCore model registry checks are all ready.

`npm test` runs fast static desktop contract checks. `npm run test:browser`
starts the local Vite shell and uses Playwright with the installed Microsoft
Edge channel to verify first-run and model-readiness UI wiring.
