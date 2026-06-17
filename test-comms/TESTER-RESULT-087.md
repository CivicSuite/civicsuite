# TESTER-RESULT-087

Verdict: FAIL

Failure class: external elevation / host harness blocker before the product workflow could be run against the requested artifact.

## Branch / communication evidence

- Live remote checked with `git ls-remote origin refs/heads/stage-3a-baremetal-windows`: `bb61fa8ed34da5d4008d3610aaaa2355ec21b219`.
- `git fetch origin stage-3a-baremetal-windows --prune` completed and `.git/FETCH_HEAD` was copied to `directive087-evidence/FETCH_HEAD.txt`.
- Wide branch scan found one actionable directive, `test-comms/TESTER-DIRECTIVE-087.md`, and no directive-like files outside `test-comms`.

## Artifact verification

Target release: `windows-local-msi-ci-cce939f`

- MSI path: `directive087-evidence/CivicSuite_0.1.0_x64_en-US.msi`
- MSI bytes: `1645052736`
- MSI SHA-256: `49d438d95849ca7a1bd198113a2807b5ffb6d62ca7706a0392f2d487ac298484`
- Evidence asset path: `directive087-evidence/CivicSuite-msi-evidence.txt`
- Evidence asset bytes: `548`
- Evidence asset SHA-256: `b7467cb889119531d719a4ecfe7fb804322b1f64b01b4487aa9c8260f415e122`
- MSI metadata product code: `{5688976F-0AA7-40C4-99F5-9B28290A76C4}`
- MSI metadata upgrade code: `{A63FC1D3-5437-5F55-89A2-FEF93FB1F930}`

Artifact integrity matched the directive exactly.

## Installed product state

The machine still had the prior CivicSuite build installed before this test:

- Installed product code: `{E79A994B-48AE-46D4-B122-8E2061557318}`
- Installed product version: `0.1.0`
- Installed executable path: `C:\Program Files\CivicSuite\civicsuite-desktop.exe`
- Installed executable bytes: `12532736`
- Installed executable LastWriteTimeUtc: `2026-06-17T12:33:28.0000000Z`

The 087 target MSI was not installed. After the retry, the installed executable timestamp and size remained unchanged.

## Installer / elevation blocker

The first `msiexec /i` attempt failed with MSI exit code `1603` because C: was short on free space:

`Disk full: Out of disk space -- Volume: 'C:'; required space: 4,014,704 KB; available space: 1,095,804 KB. Free some disk space and retry.`

I removed only old untracked prior-directive evidence directories and an old untracked MSI cache, increasing free C: space to about `18.6 GB`. I did not remove tracked repo files.

After disk cleanup, the exact target MSI still failed to install:

- Command class: `msiexec.exe /i directive087-evidence/CivicSuite_0.1.0_x64_en-US.msi /qn /norestart /l*v directive087-evidence/msiexec-install-087-retry-after-cleanup.log`
- Exit code: `1603`
- Key log text:

```text
MSI_LUA: Elevation prompt disabled for silent installs
Product: CivicSuite -- Error 1730. You must be an Administrator to remove this application. To remove this application, you can log on as an Administrator, or contact your technical support group for assistance.
Action ended 4:20:43: InstallInitialize. Return value 3.
```

The failure occurs because the 087 MSI major-upgrade path requests removal of the existing per-machine CivicSuite product, but the Codex worker is not elevated.

Direct uninstall of the existing product also failed with the same elevation blocker:

- Existing product: `{E79A994B-48AE-46D4-B122-8E2061557318}`
- Command class: `msiexec.exe /x {E79A994B-48AE-46D4-B122-8E2061557318} /qn /norestart`
- Exit code: `1603`
- Key log text:

```text
MSI_LUA: Elevation prompt disabled for silent installs
Product: CivicSuite -- Error 1730. You must be an Administrator to remove this application.
```

Token evidence from `whoami /groups`:

```text
Mandatory Label\Medium Mandatory Level
NT AUTHORITY\Local account and member of Administrators group ... Group used for deny only
BUILTIN\Administrators ... Group used for deny only
```

This confirms the Codex worker is medium-integrity and cannot perform the required per-machine MSI remove/upgrade transaction silently.

## Product workflow checks

These checks were not run against PR #192 head `cce939f` because the requested artifact could not be installed.

- Installed Tauri desktop app window: not launched for 087 validation because the 087 artifact did not install. The existing executable path remained from the prior `{E79A994B-48AE-46D4-B122-8E2061557318}` build, so using it would not test the requested artifact.
- Runtime/model readiness: not verified against the 087 artifact. Process evidence showed a user-global Ollama process was present at `C:\Users\insty\AppData\Local\Programs\Ollama\ollama.exe`, plus an `ollama app.exe` process during initial inspection.
- Backup Now: not run against the 087 artifact.
- Backup manifest/root README/copied evidence/skipped_files: not available for 087.
- Clerk adopted-legislation persistence after close/reopen: not run against the 087 artifact.
- Records lifecycle typed unreadable reference durability: not run against the 087 artifact.
- Code source/handoff typed unreadable reference durability: not run against the 087 artifact.
- Support bundle manifest freshness: not run against the 087 artifact.
- Repair: not run against the 087 artifact.
- Uninstall/reinstall of same MSI: blocked before target install; uninstall of the prior product failed with MSI Error 1730.
- Restore Latest Backup / Confirm Restore Latest Backup: not run against the 087 artifact.
- Product Stop controls before retry: not applicable because restore was never reached.
- Restored Clerk/Records/Resident/Code evidence: not available for 087.
- Restore messages mentioning old-folder cleanup, staged folders, or retry behavior: not available because restore was never reached.

## Smallest reproducible sequence

1. Start with existing per-machine CivicSuite product `{E79A994B-48AE-46D4-B122-8E2061557318}` installed.
2. Verify the 087 MSI artifact hash and byte count match directive `TESTER-DIRECTIVE-087.md`.
3. From the medium-integrity Codex worker, run silent install:

```text
msiexec.exe /i CivicSuite_0.1.0_x64_en-US.msi /qn /norestart /l*v msiexec-install-087-retry-after-cleanup.log
```

4. The install fails before product launch with MSI exit code `1603` and log error `1730` because Windows Installer must remove the existing per-machine product and the worker is not elevated.

Evidence files are under `directive087-evidence/`, especially:

- `artifact-hashes.json`
- `msi-properties.json`
- `install-087-retry-after-cleanup.json`
- `install-retry-return-value-3-context.txt`
- `initial-uninstall-087.json`
- `initial-uninstall-return-value-3-context.txt`
- `whoami-groups.txt`
