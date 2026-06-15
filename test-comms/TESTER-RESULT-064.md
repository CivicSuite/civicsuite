# TESTER-RESULT-064 - Windows Local MSI clean-machine city-core beta gate

## Final verdict

BLOCKED - MSI artifact unavailable.

The required PR head and workflow run were visible and matched the directive, but
the GitHub Actions artifact ZIP download endpoint returned `401 Requires
authentication` from this tester environment. No GitHub CLI or GitHub token was
available on the tester machine, so the MSI could not be downloaded and the
clean-machine install gate could not begin.

## Branch and directive truth

- Repo test channel: `CivicSuite/civicsuite`
- Branch tested: `stage-3a-baremetal-windows`
- Branch head tested: `8217bbb954a097244cde7c31f3d5fb675b5f7fdb`
- Directive read: `test-comms/TESTER-DIRECTIVE-064.md`
- Prior result read for continuity: `test-comms/TESTER-RESULT-063.md`
- Expected result file written: `test-comms/TESTER-RESULT-064.md`
- No source, generated artifact, module manifest, release status, tags, or docs
  outside `test-comms` were edited.

## PR, workflow, and artifact evidence

- PR under test: `CivicSuite/civicsuite#192`
- Required PR head under test:
  `a8c6715d8434160c8ade722d9459f2247fb7369d`
- Observed PR head before install:
  `a8c6715d8434160c8ade722d9459f2247fb7369d`
- PR state: `open`
- Workflow run:
  `https://github.com/CivicSuite/civicsuite/actions/runs/27522471421`
- Workflow run id: `27522471421`
- Workflow status: `completed`
- Workflow conclusion: `success`
- Expected job name: `build Windows Local MSI`
- Expected artifact name: `civicsuite-windows-local-msi`
- Observed artifact name: `civicsuite-windows-local-msi`
- Expected artifact id: `7629398843`
- Observed artifact id: `7629398843`
- Expected artifact ZIP bytes: `1634959348`
- Observed artifact ZIP metadata bytes: `1634959348`
- Artifact expired: `false`
- Artifact download URL:
  `https://api.github.com/repos/CivicSuite/civicsuite/actions/artifacts/7629398843/zip`
- Artifact download result: HTTP `401 Requires authentication`
- GitHub CLI availability: `gh` was not installed.
- GitHub token environment availability: no `GITHUB*` or `GH_*` environment
  variables were present.

## MSI evidence

- Expected MSI filename: `CivicSuite_0.1.0_x64_en-US.msi`
- Expected MSI bytes: `1639690816`
- Expected MSI SHA-256:
  `85b51b6cfe8f4713491261ca8bef070db5a7341419ad2f367670e177cbb11ce5`
- Local MSI filename: not available.
- Local MSI bytes: not available.
- Local MSI SHA-256: not available.
- `CivicSuite-msi-evidence.txt`: not available because the artifact ZIP could
  not be downloaded.

Expected builder evidence from the directive:

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

Required confirmations from artifact evidence:

- `NoDockerPrerequisite=true`: not independently confirmed from the artifact.
- `NoWslPrerequisite=true`: not independently confirmed from the artifact.
- `InstallerBundle=msi`: not independently confirmed from the artifact.
- `UnsignedBetaNoticeSurface=msi-license-file`: not independently confirmed
  from the artifact.
- `RuntimePayload=desktop/runtime/payload`: not independently confirmed from
  the artifact.

## Clean-machine starting state

Captured before the artifact download attempt:

- Evidence path: `directive064-evidence/starting-state.json`
- Captured UTC: `2026-06-15T05:25:16.0223057Z`
- Windows edition: Microsoft Windows 11 Pro
- Windows version/build: `10.0.26200` / `26200`
- CPU: Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz
- Logical processors: `12`
- RAM bytes: `17028345856`
- C: free bytes: `78876995584`
- User: `insty`
- Current user admin: `false`
- WebView2 detected by checked EdgeUpdate registry keys: `false`

## Gate sections not run

The following sections were not run because the required MSI artifact could not
be downloaded:

- Installer and SmartScreen/unsigned-beta UX result: not run.
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

Artifact metadata was available via the public GitHub API, and it matched the
directive. The actual archive download request failed:

```text
Invoke-WebRequest : { "message": "Requires authentication", "documentation_url": "https://docs.github.com/rest", "status": "401" }
```

Because the artifact ZIP could not be downloaded, the MSI, its checksum, and
`CivicSuite-msi-evidence.txt` could not be inspected. Per directive, this result
is `BLOCKED - MSI artifact unavailable`.
