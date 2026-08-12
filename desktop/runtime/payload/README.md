# Townlight Windows Runtime Payload

This directory is the build-time payload root for the Windows Local 1.0 desktop
installer. Release packaging places portable runtime files here before the
Tauri MSI bundle is built:

- `postgres/` contains portable PostgreSQL 17 with pgvector.
- `python/` contains bundled CPython plus CivicCore and city-core services.
- `ollama/` contains the native Ollama runtime.

The desktop supervisor copies these payloads into the local Townlight runtime
profile during install or repair and refuses to report required services as
installed when required files are missing.
