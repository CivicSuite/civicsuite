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

Current state:

- The manifest defines the local services the supervisor will own.
- The desktop shell reports those services as needing setup until the installer
  places the runtime files.
- Lifecycle actions are declared now so tests can lock the contract before
  process start/stop code is connected to real binaries.
- First-run steps are declared now so the desktop shell renders setup from
  structured state instead of static copy.
