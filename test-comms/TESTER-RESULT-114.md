Verdict: FAIL

# TESTER-RESULT-114 - Fixed MSI validation blocked at Stage A clean

Branch tested: `stage-3a-baremetal-windows`
HEAD tested: `93999cfefa451c329f469f9826bb4c5cbcbcf535`
Directive: `test-comms/TESTER-DIRECTIVE-114.md`
Result file: `test-comms/TESTER-RESULT-114.md`
Evidence directory: `directive114-evidence/`

## Summary

The fix-MSI prerelease gate opened: tag/release `windows-local-msi-firstrun-fix-rc1` existed and exposed both required assets:

- `CivicSuite-msi-evidence.txt`
- `CivicSuite_0.1.0_x64_en-US.msi`

Stage A then blocked during the required clean-machine preparation. Silent uninstall of the currently installed CivicSuite MSI returned exit code `1603` with Windows Installer error `1730`: the current Codex worker was not allowed to remove the assigned machine product in silent mode without administrator credentials/elevation. No reboot-pending flag was set.

Because Stage A clean could not complete, I did not proceed to Stage B install, Stage C first-run validation, module AI/no-AI, backup/restore, or C8 uninstall/reinstall. No reboot was attempted.

## Stage 0 - Prerelease gate

PASS: prerelease/assets present.

Evidence captured:

- `directive114-evidence/stage0-release.json`
- `directive114-evidence/stage0-preflight.json`

Preflight reboot-pending flags before cleanup:

- `ComponentBasedServicing`: false
- `WindowsUpdate`: false
- `SessionManagerPendingFileRename`: false
- `ComputerRename`: false

Other preflight:

- `HypervisorPresent`: true
- `VirtualizationFirmwareEnabled`: false
- Free space on C: `88768028672` bytes

## Stage A - Bare-metal clean

FAIL: admin/elevation/test-harness limitation.

Cleanup actions attempted:

- Stopped CivicSuite desktop/runtime processes where present.
- Stopped standalone Ollama processes.
- Removed `%LOCALAPPDATA%\CivicSuite`.
- Removed prior untracked `directive1NN-evidence/` folders except `directive114-evidence`.
- Attempted uninstall of registered product `{7BE25830-15EE-4797-A25F-DF614ACA9B8E}` with:

```text
msiexec /x {7BE25830-15EE-4797-A25F-DF614ACA9B8E} /qn /norestart REBOOT=ReallySuppress MSIRESTARTMANAGERCONTROL=Disable
```

Uninstall result:

- Exit code: `1603`
- Reboot pending after uninstall attempt: false
- MSI log: `directive114-evidence/A-uninstall-registered-product.log`

Key MSI log lines:

```text
MSI_LUA: Elevation prompt disabled for silent installs
Product: CivicSuite -- Error 1730. You must be an Administrator to remove this application.
Action ended 18:23:04: InstallInitialize. Return value 3.
Windows Installer removed the product. ... Removal success or error status: 1603.
```

Post-clean verification still showed:

- CivicSuite product registration remained under `{7BE25830-15EE-4797-A25F-DF614ACA9B8E}`.
- `C:\Program Files\CivicSuite` still existed.
- `%LOCALAPPDATA%\CivicSuite` was removed.
- No CivicSuite/Ollama/Postgres/runtime Python processes were left running by the later check.
- Reboot-pending flags remained false.

Evidence captured:

- `directive114-evidence/A-clean.json`
- `directive114-evidence/A-uninstall-registered-product.json`
- `directive114-evidence/A-uninstall-registered-product.log`

## Stages B/C/C8

Not run. The directive required a clean machine before installing the fix-MSI, and Stage A could not complete without an administrator-capable uninstall path. Continuing would have tested the fix-MSI over a stale machine product registration and stale Program Files payload, which would violate the directive.

## Channel

Recorded before/after:

- `directive114-evidence/channel-before-ls-remote.txt`
- `directive114-evidence/channel-before-fetch-head.txt`
- `directive114-evidence/channel-after-ls-remote.txt`
- `directive114-evidence/channel-after-fetch-head.txt`
- `directive114-evidence/channel-after-summary.json`

No reboot, standing full-install, branch artifact install, source edit, merge, or tag operation was performed.
