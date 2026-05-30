# Sprint Punch List - Stage 0 Recovery Baseline

No open Stage 0 findings remain.

## Closed During Stage 0

- Missing active pre-push hook in recovered clone: fixed with tracked hook source and installer.
- Hook installer dependency on unavailable `pwsh`: fixed by generating a `powershell.exe` hook.
- Generated hook UTF-8 BOM: fixed by writing the hook as ASCII.
- CivicCode post-PR-#76 source-pin drift: fixed across lockstep truth files.
- Installer-cleanroom stale CivicCode checkout ref: fixed in `C:\Users\scott\OneDrive\Desktop\Claude\CivicSuite-live-install-fix-2026-05-29\.github\workflows\installer-cleanroom.yml`.
- Lockstep verifier artifact missing from truth set: fixed in `C:\Users\scott\OneDrive\Desktop\Claude\CivicSuite-live-install-fix-2026-05-29\scripts\verify-suite-state.py`.
- Stale user-manual topology block: fixed in `C:\Users\scott\OneDrive\Desktop\Claude\CivicSuite-live-install-fix-2026-05-29\USER-MANUAL.md`.
