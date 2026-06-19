# Audit Lite - Windows MSI CI Artifact Gate - 2026-06-13

## Scope

Reviewed the new Windows desktop MSI build workflow and the desktop static
smoke guard that makes the workflow part of the local contract checks.

Changed files:

- `.github/workflows/desktop-windows-msi.yml`
- `desktop/tests/static-smoke.mjs`

Intended behavior:

- CI can build the real Tauri/WebView2 Windows Local MSI on `windows-latest`.
- The workflow prepares the portable runtime payload from pinned adjacent
  CivicCore, CivicRecords AI, CivicClerk, and CivicCode commits.
- The workflow uploads the generated MSI plus SHA-256/build evidence for
  clean-machine installation testing.
- The static smoke test fails if the MSI workflow loses the MSI target, runtime
  payload build, artifact upload, no-Docker/no-WSL evidence, or pinned module
  refs.

## Findings

None.

Severity counts: Blocker 0 / Critical 0 / Major 0 / Minor 0 / Nit 0.

## Verification

- `npm test` in `desktop/`: passed; desktop static smoke checks include the new
  MSI workflow contract.
- Workflow YAML parse via Python/PyYAML: passed.
- `cargo test` in `desktop/src-tauri/`: passed, 57 tests.
- `cargo fmt --check` in `desktop/src-tauri/`: passed.
- `git diff --check`: passed.

## Residual Risk

- The new GitHub Actions workflow must run after push and produce the uploaded
  `civicsuite-windows-local-msi` artifact before it can be used as clean-machine
  installer evidence.
- This slice proves the build/artifact gate. It does not replace the required
  clean Windows install, launch, first-run, persistence, backup/restore, repair,
  uninstall, and reinstall walkthrough gate.
