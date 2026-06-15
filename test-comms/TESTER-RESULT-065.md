# TESTER-RESULT-065 - Windows Local MSI clean-machine rerun from public prerelease asset

## Final verdict

BLOCKED - MSI requires administrator privileges in this tester session.

The result 064 artifact-auth blocker is cleared: the public prerelease evidence
asset and MSI downloaded without GitHub CLI or token, and both matched the
required byte sizes and SHA-256 values. The gate then blocked at installation.
Windows Installer returned exit code `1603`; the MSI log shows `Error 1925`
because the package installs for all users under `C:\Program Files\CivicSuite`
and the current Codex tester process is not running as administrator.

## Branch and continuity

- Repo test channel: `CivicSuite/civicsuite`
- Branch tested: `stage-3a-baremetal-windows`
- Branch head tested: `bf8fd44eeb899b7792dcd6c4f8deb7c14ef35e58`
- Directive read: `test-comms/TESTER-DIRECTIVE-065.md`
- Prior directive read: `test-comms/TESTER-DIRECTIVE-064.md`
- Prior result read: `test-comms/TESTER-RESULT-064.md`
- Confirmation: result 064 blocked only because the Actions artifact endpoint
  returned `401 Requires authentication`; that blocker was cleared by the
  public prerelease asset path.
- Expected result file written: `test-comms/TESTER-RESULT-065.md`
- No source, generated artifact, module manifest, release status, tags, or docs
  outside `test-comms` were edited.

## PR, release, and asset evidence

- PR under test: `CivicSuite/civicsuite#192`
- Required PR head under test:
  `a8c6715d8434160c8ade722d9459f2247fb7369d`
- Observed PR head before install:
  `a8c6715d8434160c8ade722d9459f2247fb7369d`
- PR state: `open`
- Source workflow run: `27522471421`
- Source workflow job: `build Windows Local MSI`
- Source Actions artifact: `civicsuite-windows-local-msi`
- Public prerelease tag: `windows-local-msi-ci-a8c6715`
- Public prerelease URL:
  `https://github.com/CivicSuite/civicsuite/releases/tag/windows-local-msi-ci-a8c6715`
- Prerelease title:
  `CivicSuite Windows Local MSI CI Test Artifact a8c6715`
- Prerelease state: `prerelease=true`, `draft=false`

Public assets:

- MSI URL:
  `https://github.com/CivicSuite/civicsuite/releases/download/windows-local-msi-ci-a8c6715/CivicSuite_0.1.0_x64_en-US.msi`
- Evidence URL:
  `https://github.com/CivicSuite/civicsuite/releases/download/windows-local-msi-ci-a8c6715/CivicSuite-msi-evidence.txt`
- MSI filename: `CivicSuite_0.1.0_x64_en-US.msi`
- MSI bytes: `1639690816`
- MSI SHA-256:
  `85b51b6cfe8f4713491261ca8bef070db5a7341419ad2f367670e177cbb11ce5`
- Evidence filename: `CivicSuite-msi-evidence.txt`
- Evidence bytes: `548`
- Evidence SHA-256:
  `5bb4eeecd08532d0c4434c6ab712dcfa08e0a9646aa7b2f891db55f8d9636164`
- GitHub release asset digest for MSI:
  `sha256:85b51b6cfe8f4713491261ca8bef070db5a7341419ad2f367670e177cbb11ce5`
- GitHub release asset digest for evidence:
  `sha256:5bb4eeecd08532d0c4434c6ab712dcfa08e0a9646aa7b2f891db55f8d9636164`
- Artifact verification evidence:
  `directive065-evidence/artifact-verification.json`

## CivicSuite-msi-evidence.txt

```text
CivicSuite Windows Local MSI build evidence
GeneratedAtUtc=2026-06-15T04:55:48.5852962Z
File=CivicSuite_0.1.0_x64_en-US.msi
Bytes=1639690816
SHA256=85b51b6cfe8f4713491261ca8bef070db5a7341419ad2f367670e177cbb11ce5
UpgradeCode=a63fc1d3-5437-5f55-89a2-fef93fb1f930
InstallerBundle=msi
UnsignedBetaNotice=desktop/installer/windows/unsigned-beta-install-notice.txt
UnsignedBetaNoticeSurface=msi-license-file
SmartScreenGuidance=More info -> Run anyway
NoDockerPrerequisite=true
NoWslPrerequisite=true
RuntimePayload=desktop/runtime/payload
```

Confirmed from the evidence file:

- `NoDockerPrerequisite=true`
- `NoWslPrerequisite=true`
- `InstallerBundle=msi`
- `UnsignedBetaNoticeSurface=msi-license-file`
- `RuntimePayload=desktop/runtime/payload`

## Clean-machine starting state

Captured before install:

- Evidence path: `directive065-evidence/starting-state.json`
- Captured UTC: `2026-06-15T06:13:32.5270241Z`
- Windows edition: Microsoft Windows 11 Pro
- Windows version/build: `10.0.26200` / `26200`
- CPU: Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz
- Logical processors: `12`
- RAM bytes: `17028345856`
- C: free bytes before install attempt: `77253591040`
- User: `insty`
- Identity: `DESKTOP-LOOTB7M\insty`
- Current user admin: `false`
- Integrity/admin status: non-admin Codex worker token
- WebView2 detected by checked EdgeUpdate registry keys before install:
  `false`
- Prior CivicSuite desktop install found in checked uninstall registry roots:
  none
- Docker/WSL/repo-local bootstrap scripts: not used for this MSI path.

## Installer and unsigned-beta UX result

Installer result: blocked before UI/first-run.

- MSI command used for evidence capture:
  `msiexec.exe /i directive065-evidence\CivicSuite_0.1.0_x64_en-US.msi /qn /norestart /l*v directive065-evidence\msiexec-install.log`
- MSI exit code: `1603`
- Installed CivicSuite entry after attempt: none
- Installer log evidence: `directive065-evidence/msiexec-install.log`
- Install result summary: `directive065-evidence/install-result.json`

Critical MSI log lines:

```text
MSI (s) ... Product: CivicSuite -- Error 1925. You do not have sufficient privileges to complete this installation for all users of the machine.  Log on as administrator and then retry this installation.
Error 1925. You do not have sufficient privileges to complete this installation for all users of the machine.  Log on as administrator and then retry this installation.
Action ended ... InstallFinalize. Return value 3.
MSI ... Product: CivicSuite -- Installation failed.
Windows Installer installed the product. Product Name: CivicSuite. Product Version: 0.1.0. Product Language: 1033. Manufacturer: CivicSuite. Installation success or error status: 1603.
```

Additional MSI log facts:

- `AlwaysInstallElevated` machine policy: `0`
- `AlwaysInstallElevated` user policy: `0`
- `INSTALLDIR = C:\Program Files\CivicSuite\`
- `ProductDeploymentFlags=3`
- `Assignment=1`
- `INSTALLED_WEBVIEW2_VERSION = 149.0.4022.69` appeared during MSI evaluation,
  but the install did not complete.

Unsigned beta notice and SmartScreen UX were not observed because the hidden
non-interactive MSI install reached the all-users admin-privilege failure before
a usable desktop install was available. No visible installer or UAC window was
launched from the heartbeat task.

## Gate sections not run

The following sections were not run because the MSI did not install:

- First-run result: not run.
- Model download/checksum/load/register result: not run.
- System Health/admin-gating result: not run.
- Module manager result: not run.
- Local Users/RBAC result: not run.
- CivicClerk workflow result: not run.
- CivicRecords AI workflow result: not run.
- Resident/public records request result: not run.
- CivicCode workflow result: not run.
- Cross-module search/handoff result: not run.
- Close/reopen persistence result: not run.
- Reboot persistence result: not run.
- Backup/restore result: not run.
- Support bundle result: not run.
- Repair result: not run.
- Uninstall/reinstall/restore result: not run.

## Blocker details

The public prerelease asset path works and artifact verification passed. The
remaining blocker is the tester session's lack of an administrator token for an
all-users MSI install. The Codex worker is non-admin, and this heartbeat task is
not allowed to launch visible elevation or installer windows. Windows Installer
therefore rejected the package at `InstallFinalize` with Error 1925 before the
desktop app could be launched or first-run workflows could be tested.
