# Windows MSI CI lifecycle coverage and gaps (v0.1)

**Scope:** what the `windows-msi-lifecycle` job in
`.github/workflows/desktop-windows-msi.yml` verifies against the **exact MSI
this workflow builds** (consumed via `needs: windows-local-msi` +
`download-artifact`), and what it cannot verify on a GitHub-hosted Windows
runner. This closes the verifiable subset of audit finding **T-C2** ("Windows CI
never installs the MSI; full lifecycle is Linux-only against the legacy 0.1.x
archive").

## What the Windows MSI lifecycle job verifies (runs in CI)

| Lifecycle stage | How it is exercised | Pass signal |
|---|---|---|
| **Install** | `msiexec /i <built.msi> /quiet /norestart /l*v` (runner is elevated, so no interactive UAC) | msiexec exit code `0` |
| **Install integrity** | Read ARP/uninstall registry keys; resolve the install dir (`InstallLocation`, else the ARP `DisplayIcon` path) and confirm a non-uninstaller application exe is present | ARP entry present, install dir resolved, main binary (`civicsuite-desktop.exe`, the Cargo binary name) discovered by scan present |
| **First-run / backup / restore (logic)** | `cargo test first_run`, `cargo test backup`, `cargo test restore` against the desktop crate with an isolated `CIVICSUITE_DESKTOP_STATE_DIR` | the first-run, backup, and restore unit/integration tests pass (includes `first_run_uninstall_action_uses_real_supervisor_final_backup`, `restore_replaces_profile_from_latest_backup`, backup manifest/tamper guards) |
| **Uninstall** | `msiexec /x <built.msi> /quiet /norestart /l*v` | msiexec exit code `0` |
| **Uninstall integrity** | Re-read ARP keys and the install dir | ARP entry gone, the application exe removed |

The main binary is **discovered by scan** (first non-`unins*` exe under the
resolved install dir), not matched against a hardcoded name: Tauri/WiX names the
exe from the Cargo binary (`civicsuite-desktop.exe`), which can differ from the
product display name, so this job does not hardcode `CivicSuite.exe`.

This install-integrity step does **not** check for the bundled
`runtime-payload-lock.json` (the portable Postgres/Python/Ollama payload). On
real machines the runtime payload is downloaded at first run, and CI MSI builds
do not stage it under the install dir, so checking for it here would be a false
signal. The data-plane half of the lifecycle (bundled PostgreSQL 17 + pgvector
bring-up, embedded CPython city services, and the PostgreSQL-backed task-queue
worker) is proven separately and against the real prepared payload by the
`desktop-civiccore-integration` job (audit finding T-C1), which is the only job
that references `runtime-payload-lock.json`.

## Documented gaps (NOT verifiable on hosted runners)

1. **GUI-driven interactive first-run wizard.** The shipped product is a
   Tauri/WebView2 desktop GUI with no headless entry point (`main()` just calls
   `run()`), so the click-through wizard (notice → SmartScreen → locations →
   modules → city profile → first admin → model setup → finish) cannot be driven
   on a hosted runner without a real interactive desktop UI-automation session.
   The first-run **logic** is covered by `cargo test first_run`; the **GUI
   walkthrough on the installed RC** is performed under **QA-B1** on a clean
   machine (Beelink/Windows Sandbox), not on a hosted CI runner. The install /
   verify / uninstall portion of QA-B1 has been run on a fresh Windows Sandbox
   (msiexec install and uninstall exit 0, ARP entry registered then removed,
   binary at `C:\Program Files\CivicSuite\civicsuite-desktop.exe`); the
   interactive click-through wizard and the model-heavy steps below remain the
   open part of that clean-VM gate.

2. **GUI-driven backup/restore from inside the running app.** Same reason: the
   backup/restore **logic** runs under `cargo test backup` / `cargo test
   restore`, but exercising the buttons in the installed GUI needs the same
   clean-VM/UI session as QA-B1.

3. **~6.97 GB Gemma model download + local AI load.** First-run pulls the model
   from Hugging Face; this is too heavy and too slow for a routine CI job and is
   intentionally **not** performed here. The model artifact integrity (SHA-256 +
   exact size pin) is enforced in product code (`model.rs`), and the live URL was
   probed (HTTP 200, exact size, ungated) by the GauntletGate audit. A model
   pull belongs in the clean-VM walkthrough, not per-PR CI.

4. **Repair (`msiexec /f`) and in-product uninstall-elevation UX.** Not yet in
   this job. Standard MSI repair could be added cheaply; the in-product uninstall
   path needing admin (1603/1730) is tracked as **QA-M2** and is a UX concern
   above the MSI lifecycle.

## Why this is the maximal verifiable subset

Everything that does **not** require pixels on a screen is exercised here against
the real installed MSI and the real runtime crate: silent install, file/registry
integrity, the first-run/backup/restore logic, and silent uninstall. The
remaining gap is exactly the interactive, model-heavy walkthrough that the audit
isolates as the QA-B1 clean-VM work; it cannot be honestly claimed from a hosted
runner, so it is named here rather than faked. QA-B1's non-interactive
install/verify/uninstall portion has already been performed on a clean Windows
Sandbox (see CHANGELOG, "Validated (QA-B1, clean machine)"); the interactive
wizard and the model pull are the part that still must run on a real desktop
session.
