# Audit Lite - Windows first-run model pre-admin gate

Date: 2026-06-15

Scope: PR #192 Windows Local desktop first-run setup, local model setup UI, model
Tauri command authorization, first-run step sequencing, and regression coverage
for `TESTER-RESULT-072.md`.

## Findings

None. The slice closes the cleanroom failure where the installed desktop app
allowed local model setup to become reachable before first CivicSuite local
administrator creation/sign-in.

## Evidence Reviewed

- `desktop/src/main.js:951` renders Home without the standalone model readiness
  panel until first-run is finished or a local administrator is signed in.
- `desktop/src/main.js:1015` and `desktop/src/main.js:1027` lock model setup
  controls for every non-local-admin state, including the pre-admin setup state.
- `desktop/src-tauri/src/main.rs:395` rejects native model mutations unless a
  local administrator session is active; before admin creation it now tells the
  user to create and sign in as the first local administrator.
- `desktop/src-tauri/src/first_run.rs:702` blocks direct setup-step jumps when
  required prior setup steps are incomplete, so `download-model` cannot skip
  city profile, first-admin, or backup setup.
- `desktop/tests/browser/model-readiness.spec.mjs:3` verifies Home does not
  expose Gemma model setup in a clean pre-admin browser state.
- `desktop/tests/browser/model-readiness.spec.mjs:19` verifies System Health can
  show model readiness while keeping model actions disabled before admin setup.
- `desktop/tests/static-smoke.mjs:180` guards the model-specific UI lock helper
  and `desktop/tests/static-smoke.mjs:432` guards the first-run no-skip message.

## Verification

- `npm --prefix desktop test`: PASS.
- `npm --prefix desktop run test:browser -- desktop/tests/browser/model-readiness.spec.mjs`: PASS, 5 passed.
- `npm --prefix desktop run build`: PASS.
- `cargo test -- --test-threads=1`: PASS, 111 passed.
- `bash scripts/verify-docs.sh`: PASS.
- `python scripts/verify-deployment-profile.py --static-only`: PASS.
- `python scripts/policy/check_stage_evidence.py`: PASS.
- `git diff --check`: PASS.

## Residual Risk

The cleanroom MSI test still needs to rerun on a newly built artifact because
`TESTER-RESULT-072.md` exercised the older MSI. The next tester directive must
use the repo `test-comms` channel on `stage-3a-baremetal-windows`, name the exact
expected result file, and require the tester to report there only.
