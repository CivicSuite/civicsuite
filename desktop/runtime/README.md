# CivicSuite Windows Local Runtime

This directory defines the desktop supervisor contract for the Windows Local
1.0 profile.

`windows-local-runtime.json` is not a generated installer output. It is the
source contract the Tauri shell reads while the installer and portable runtime
bundle are implemented.

Current state:

- The manifest defines the local services the supervisor will own.
- The desktop shell reports those services as needing setup until the installer
  places the runtime files.
- Lifecycle actions are declared now so tests can lock the contract before
  process start/stop code is connected to real binaries.
