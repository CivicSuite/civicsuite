# TESTER-RESULT-098

## Verdict

FAIL

Directive 098 could not reach the desktop workflow/restore test surface because the required cleanroom start and target MSI install lifecycle failed. Bare-metal cleanroom uninstall of the existing CivicSuite registration returned `1603`, left the product registered, and left `C:\Program Files\CivicSuite` present. Installing the directive 098 target MSI also returned `1603`.

## Remote/directive verification

- Live remote branch checked with `git ls-remote origin refs/heads/stage-3a-baremetal-windows`.
- `ls-remote` result: `cc229b97f14cbb6f74ea948f91ec18fc206973d0 refs/heads/stage-3a-baremetal-windows`.
- Fetched live branch into `FETCH_HEAD`.
- `FETCH_HEAD`: `cc229b97f14cbb6f74ea948f91ec18fc206973d0`.
- Directive read from `test-comms/TESTER-DIRECTIVE-098.md` at that branch head.
- Evidence:
  - `directive098-evidence/remote-ls-remote.txt`
  - `directive098-evidence/fetch-head.txt`
  - `directive098-evidence/fetch-head-log.txt`

## Cleanroom start path and evidence

Cleanroom path used: bare-metal fallback. No VM snapshot revert was available through this Codex session.

Pre-cleanroom evidence:

- Existing CivicSuite process: `civicsuite-desktop`, path `C:\Program Files\CivicSuite\civicsuite-desktop.exe`.
- Existing MSI registration:
  - Product: `CivicSuite`
  - ProductCode: `{291F4AE6-5B07-4A8C-8F82-FCE71A20A6F6}`
  - Version: `0.1.0`
  - InstallLocation: `C:\Program Files\CivicSuite\`
- Existing paths:
  - `C:\Program Files\CivicSuite`
  - `C:\Users\insty\AppData\Local\CivicSuite`

Actions attempted:

- Stopped CivicSuite-owned processes.
- Checked for CivicSuite services; none were present.
- Ran elevated Windows Installer uninstall:
  - Command target: `{291F4AE6-5B07-4A8C-8F82-FCE71A20A6F6}`
  - Exit code: `1603`
  - Log: `directive098-evidence/cleanroom-uninstall-291F4AE6-5B07-4A8C-8F82-FCE71A20A6F6.log`

Post-cleanroom verification:

- No CivicSuite process remained running.
- No CivicSuite service was found.
- `C:\Users\insty\AppData\Local\CivicSuite` was removed.
- CivicSuite MSI registration still remained.
- `C:\Program Files\CivicSuite` still remained.

Evidence:

- `directive098-evidence/cleanroom-before.json`
- `directive098-evidence/cleanroom-stopped-processes.json`
- `directive098-evidence/cleanroom-stopped-services.json`
- `directive098-evidence/cleanroom-uninstall-results.json`
- `directive098-evidence/cleanroom-uninstall-1603-tail.txt`
- `directive098-evidence/cleanroom-uninstall-failure-lines.txt`
- `directive098-evidence/cleanroom-after.json`

## Artifact integrity hashes and bytes

Release assets downloaded from the public prerelease.

MSI:

- File: `CivicSuite_0.1.0_x64_en-US.msi`
- Expected bytes: `1645167424`
- Actual bytes: `1645167424`
- Expected SHA-256: `1377413f9dbad5d44cdf3a6079cd6af9822e753ae0218f28befa35a433aff4da`
- Actual SHA-256: `1377413f9dbad5d44cdf3a6079cd6af9822e753ae0218f28befa35a433aff4da`
- Result: PASS

Evidence asset:

- File: `CivicSuite-msi-evidence.txt`
- Expected bytes: `548`
- Actual bytes: `548`
- Expected SHA-256: `ec790ac5a259cb7603c529a6559a5b7bb39f6b9e71db0d4a3d1b083f33332cb8`
- Actual SHA-256: `ec790ac5a259cb7603c529a6559a5b7bb39f6b9e71db0d4a3d1b083f33332cb8`
- Result: PASS

GitHub Actions ZIP:

- Artifact listing for workflow run `27807590449` was accessible and reported `civicsuite-windows-local-msi`, bytes `1640356333`, expired `False`.
- Downloading the Actions artifact ZIP through the unauthenticated API returned `401 Unauthorized`.
- ZIP hash could not be verified from this session.

Evidence:

- `directive098-evidence/release-api.json`
- `directive098-evidence/release-assets.txt`
- `directive098-evidence/artifact-api-https_api_github_com_repos_CivicSuite_civicsuite_actions_runs_27807590449_artifacts.json`
- `directive098-evidence/downloads/artifact-zip-download-error.txt`
- `directive098-evidence/artifact-hashes.json`

## Elevation/install/uninstall/reinstall evidence

Cleanroom uninstall:

- `msiexec /x {291F4AE6-5B07-4A8C-8F82-FCE71A20A6F6} /qn /norestart`
- Exit code: `1603`
- MSI log properties included:
  - `MsiRunningElevated = 1`
  - `Privileged = 1`
  - `AdminUser = 1`
  - `MsiSystemRebootPending = 1`
- MSI log summary included: `Windows Installer removed the product... Removal success or error status: 1603.`
- Product registration still remained afterward.

Target MSI install:

- `msiexec /i directive098-evidence\downloads\CivicSuite_0.1.0_x64_en-US.msi /qn /norestart`
- Exit code: `1603`
- MSI log properties included:
  - `MsiSystemRebootPending = 1`
- MSI log summary included:
  - `Product: CivicSuite -- Installation failed.`
  - `Windows Installer installed the product... Installation success or error status: 1603.`
- Product registration remained afterward.

Evidence:

- `directive098-evidence/cleanroom-uninstall-results.json`
- `directive098-evidence/cleanroom-uninstall-291F4AE6-5B07-4A8C-8F82-FCE71A20A6F6.log`
- `directive098-evidence/target-msi-install-result.json`
- `directive098-evidence/target-msi-install.log`
- `directive098-evidence/target-msi-install-failure-lines.txt`
- `directive098-evidence/target-msi-install-tail.txt`
- `directive098-evidence/target-msi-install-after.json`

## Installed desktop app identity evidence

The directive-required cleanroom install did not complete. The existing/stale Program Files desktop binary remained present after the failed uninstall/install lifecycle:

- `C:\Program Files\CivicSuite\civicsuite-desktop.exe`
- Size: `12787200`
- SHA-256: `6c20162659a2030bce4f3318fcc37d067cbfc67f987020900072ac29cbf9d73a`

This was not accepted as a clean directive-098 install because the target MSI install returned `1603`.

Evidence:

- `directive098-evidence/target-msi-install-after.json`

## Model readiness evidence

Not reached. The test stopped at cleanroom/install lifecycle failure before launching the installed desktop app.

## Product Start/Check/Repair service-health evidence before restore

Not reached. The test stopped at cleanroom/install lifecycle failure before launching the installed desktop app.

## Installed user runtime evidence for zlib1.dll

The stale Program Files payload contained:

- `C:\Program Files\CivicSuite\_up_\runtime\payload\postgres\bin\zlib1.dll`
- Size: `91648`
- SHA-256: `890afa7a17fb66308e0026631070409138b157ef2773c0a41d22a76943f7aedf`

The installed user runtime check under `%LOCALAPPDATA%\CivicSuite\runtime\postgres\bin\zlib1.dll` was not reached because the directive-required clean install did not complete.

Evidence:

- `directive098-evidence/target-msi-install-after.json`

## Backup Now result and manifest/README evidence

Not reached.

## Clerk adopted-legislation evidence

Not reached.

## Records durability evidence

Not reached.

## Code durability evidence

Not reached.

## Support bundle evidence

Not reached.

## Stale pre-restore safety backup evidence before final Restore Latest Backup

Not reached.

## Normal app close and MSI uninstall/reinstall result

Not reached for the post-workflow reinstall phase. The initial cleanroom uninstall already failed with `1603`, which is a directive blocker.

## Restore result text and Working/Access denied status

Not reached.

## Evidence that Restore Latest Backup selected the fresh manual backup

Not reached.

## Post-restore service health and Product Start/Check/Repair results

Not reached.

## Restored Clerk/Records/Code visibility evidence

Not reached.

## Old-folder cleanup pending, model-cache preservation, pre-restore model-cache skip, or Postgres/runtime log details

Not reached.

Relevant installer/lifecycle detail:

- `MsiSystemRebootPending = 1` appeared in both the cleanroom uninstall log and the target MSI install log.
- The directive explicitly said not to reboot the tester machine.

## Smallest reproducible failure sequence

1. Start from the tester state with CivicSuite registered as `{291F4AE6-5B07-4A8C-8F82-FCE71A20A6F6}` and `C:\Program Files\CivicSuite` present.
2. Stop `civicsuite-desktop.exe`.
3. Run:
   - `msiexec /x {291F4AE6-5B07-4A8C-8F82-FCE71A20A6F6} /qn /norestart /L*v cleanroom-uninstall.log`
4. Observe exit code `1603`.
5. Verify CivicSuite remains registered in Windows Installer uninstall registry and `C:\Program Files\CivicSuite` remains present.
6. Run:
   - `msiexec /i CivicSuite_0.1.0_x64_en-US.msi /qn /norestart /L*v target-msi-install.log`
7. Observe exit code `1603` and log line `Product: CivicSuite -- Installation failed.`

Because the cleanroom requirement and target MSI install failed, the restore-selection fix could not be validly tested in this run.
