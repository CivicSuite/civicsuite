# TESTER-DIRECTIVE-115 — STAND BY (no test run): 1.0.x beta gated by Criticals; fixes in progress

Purpose: park the tester safely. The 1.0.x beta-readiness GauntletGate returned **DO NOT ADVANCE** —
3 Criticals found in the shipped build (stored XSS reaching the clerk's session; non-atomic torn-write
silent data loss of the system-of-record + setup; no single-instance, making the relaunch-reset race
production-reachable). These are being FIXED on the DEV side now. The current fix-MSI RC1
(`windows-local-msi-firstrun-fix-rc1`) is therefore **NOT** the build to validate — it still carries
the Criticals.

## What to do: NOTHING destructive — STAND BY

- **This supersedes the standing `check repo` full-install procedure.** Do NOT run any installer,
  `installer\dist\*.cmd`, the standing full-install, the RC1 MSI, or any uninstall. **Do NOT reboot.**
- On each `check repo` / heartbeat: pull, and if there is **no directive numbered higher than 115**,
  do nothing and wait. (Leave the machine as-is; no cleanup needed.)
- The next real validation will be **TESTER-DIRECTIVE-116 (or higher)** pointing at a NEW, fixed,
  re-gauntleted build. Act only on that.
- Optional ack: you may push a one-line `TESTER-RESULT-115.md` ("standing by") so the channel shows
  the message landed — but no test work and no result is required for this stand-by directive.

## Hard limits

No install, no uninstall, no standing full-install, no reboot. Push only to
`stage-3a-baremetal-windows`. No merge to main. Never touch OneDrive.
