# TESTER-RESULT-066 - Windows Local MSI clean-machine rerun with interactive elevation

## Final verdict

BLOCKED - interactive elevation unavailable.

Directive 066 requires the MSI to be installed through a real visible
interactive/elevated Windows path, and explicitly says not to repeat the silent
non-admin `msiexec` command that blocked result 065. The public assets were
available locally and re-verified successfully, but this heartbeat automation
cannot safely launch or drive a visible UAC/elevated MSI installer flow. No
elevated/interactive install was attempted, so this is not marked as a product
failure.

## Branch and continuity

- Repo test channel: `CivicSuite/civicsuite`
- Branch tested: `stage-3a-baremetal-windows`
- Branch head tested: `037ce390dedf042a3f261d9b5348306e2770230b`
- Directive read: `test-comms/TESTER-DIRECTIVE-066.md`
- Prior directive read: `test-comms/TESTER-DIRECTIVE-065.md`
- Prior result read: `test-comms/TESTER-RESULT-065.md`
- Confirmation: result 065 blocked only because the MSI was launched silently
  from a non-admin Codex worker token and the all-users MSI requires elevation.
- Confirmation: result 065's silent non-admin install blocker remains
  externally blocked for this heartbeat automation because the required visible
  elevation path cannot be exercised unattended.
- Expected result file written: `test-comms/TESTER-RESULT-066.md`
- No source, generated artifact, module manifest, release status, tags, or docs
  outside `test-comms` were edited.

## PR, release, and asset evidence

- PR under test: `CivicSuite/civicsuite#192`
- Required PR head under test:
  `a8c6715d8434160c8ade722d9459f2247fb7369d`
- Observed PR head:
  `a8c6715d8434160c8ade722d9459f2247fb7369d`
- PR state: `open`
- Source workflow run: `27522471421`
- Source workflow job: `build Windows Local MSI`
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
- MSI local path:
  `directive065-evidence/CivicSuite_0.1.0_x64_en-US.msi`
- MSI bytes: `1639690816`
- MSI SHA-256:
  `85b51b6cfe8f4713491261ca8bef070db5a7341419ad2f367670e177cbb11ce5`
- Evidence filename: `CivicSuite-msi-evidence.txt`
- Evidence local path: `directive065-evidence/CivicSuite-msi-evidence.txt`
- Evidence bytes: `548`
- Evidence SHA-256:
  `5bb4eeecd08532d0c4434c6ab712dcfa08e0a9646aa7b2f891db55f8d9636164`
- GitHub release asset digest for MSI:
  `sha256:85b51b6cfe8f4713491261ca8bef070db5a7341419ad2f367670e177cbb11ce5`
- GitHub release asset digest for evidence:
  `sha256:5bb4eeecd08532d0c4434c6ab712dcfa08e0a9646aa7b2f891db55f8d9636164`
- Artifact re-verification evidence:
  `directive066-evidence/artifact-reverification.json`

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

Captured before any directive 066 install attempt:

- Evidence path: `directive066-evidence/starting-state-and-token.json`
- Captured UTC: `2026-06-15T06:30:41.3708792Z`
- Windows edition: Microsoft Windows 11 Pro
- Windows version/build: `10.0.26200` / `26200`
- CPU: Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz
- Logical processors: `12`
- RAM bytes: `17028345856`
- C: free bytes: `76930617344`
- User: `insty`
- Identity: `DESKTOP-LOOTB7M\insty`
- Current process: `powershell.exe`, PID `25240`, session `1`
- Administrator token: `false`
- Integrity: `Mandatory Label\Medium Mandatory Level`
- Interactive desktop session: present; `quser` reports `insty` on `console`,
  session `1`, state `Active`
- Explorer process: present in session `1`
- WebView2 detected by checked EdgeUpdate registry keys before install:
  `false`
- Prior CivicSuite desktop install found in checked uninstall registry roots:
  none
- `C:\Program Files\CivicSuite`: absent
- Docker/WSL/repo-local bootstrap scripts: not used for this MSI path.

## Interactive/elevated install path

- Required path: visible interactive/elevated MSI install using UAC or an
  already elevated administrator process.
- Path actually used: none.
- Silent non-admin retry: not attempted, per directive.
- Visible UAC/elevation prompt launch: not attempted from the heartbeat
  automation.
- Reason: the current worker is a medium-integrity, non-admin background
  PowerShell process. The heartbeat instructions prohibit launching visible
  PowerShell/terminal windows, and the directive itself says to write a blocked
  result if the tester automation cannot launch a visible/elevated installer
  from the heartbeat context. Launching `msiexec -Verb RunAs` here would create
  an uncontrolled visible UAC/MSI flow requiring interactive desktop approval
  and follow-through outside the automation's control.

## Installer and unsigned-beta UX result

Not run for directive 066.

Result 065 already proved the silent non-admin path fails with MSI Error 1925.
Directive 066 prohibited repeating that command. Because no visible elevated
installer path was available to the heartbeat automation, the installer UI,
SmartScreen flow, unsigned beta notice, Windows uninstall entry, and install
target could not be verified.

## Gate sections not run

The following sections were not run because interactive elevation was
unavailable:

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

The public MSI and evidence file are present and verified. The remaining blocker
is external to product verification in this automated heartbeat run: installing
the all-users MSI requires a visible administrator elevation path, and this
background Codex heartbeat context cannot safely launch or complete that
interactive UAC/MSI workflow. No elevated MSI install was attempted, so the
product workflows remain untested in directive 066.
