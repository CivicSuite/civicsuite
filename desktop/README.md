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
- honest state copy while the portable runtime and services are still landing

The shell is not a replacement for module services. It is the host that the
portable runtime, installer, and module packages plug into during the next
implementation slices.
