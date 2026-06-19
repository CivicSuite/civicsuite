# Audit Lite - Windows MSI rustfmt CI fix

Date: 2026-06-15

Scope: PR #192 Windows Local MSI workflow failure on head
`978384747b0cc797b98033a22c7f71fb4d23fcff`, specifically the Rust formatting
gate after the Tauri Rust test suite passed.

## Findings

None. The fix is mechanical formatting only.

## Evidence Reviewed

- GitHub Actions run `27571230419`, job `81508049745`, failed at `cargo fmt --check`
  after `111 passed; 0 failed` in the Tauri Rust test step.
- `desktop/src-tauri/src/first_run.rs` only changed rustfmt wrapping in a test
  helper assertion path.
- `desktop/src-tauri/src/main.rs` only changed rustfmt wrapping in a first-run
  setup bootstrap test.

## Verification

- `cargo fmt --check`: PASS.
- `git diff --check`: PASS.

## Residual Risk

The Windows Local MSI workflow must rerun on the pushed formatting fix before a
new cleanroom-equivalent tester directive can be issued.
