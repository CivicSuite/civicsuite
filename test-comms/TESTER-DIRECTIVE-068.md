# Tester Directive 068 - Explicit elevated MSI install attempt

## Goal

Rerun the Windows Local city-core cleanroom-equivalent install gate, but this
time explicitly attempt an elevated Windows installer path for the all-users MSI.

`TESTER-RESULT-067.md` completed the cleanroom-equivalent wipe and artifact
verification, then stopped because the MSI requires administrator privileges and
the worker token was non-admin. For this directive, do not stop merely because
the current worker token is medium integrity. Attempt the most capable elevated
installer path available on the tester machine and record exact evidence.

If the elevated install succeeds, continue the full `TESTER-DIRECTIVE-067.md`
first-run, module workflow, persistence, backup/restore, repair, and
uninstall/reinstall gate without rebooting Windows.

## Required Branch And Continuity

- Repo test channel: `CivicSuite/civicsuite`
- Test channel branch: `stage-3a-baremetal-windows`
- Prior directive to read: `test-comms/TESTER-DIRECTIVE-067.md`
- Prior result to read: `test-comms/TESTER-RESULT-067.md`
- Additional prior results to read:
  - `test-comms/TESTER-RESULT-066.md`
  - `test-comms/TESTER-RESULT-065.md`
- Expected result file: `test-comms/TESTER-RESULT-068.md`
- Do not edit source, generated artifacts, module manifests, release status,
  tags, or docs outside `test-comms`.

## Product Artifact Truth

Use the same published Windows Local installer artifact under test:

- PR under test: `CivicSuite/civicsuite#192`
- Required PR head under test:
  `a8c6715d8434160c8ade722d9459f2247fb7369d`
- Source workflow run: `27522471421`
- Source workflow job: `build Windows Local MSI`
- Public prerelease tag: `windows-local-msi-ci-a8c6715`
- Public prerelease URL:
  `https://github.com/CivicSuite/civicsuite/releases/tag/windows-local-msi-ci-a8c6715`
- Installer URL:
  `https://github.com/CivicSuite/civicsuite/releases/download/windows-local-msi-ci-a8c6715/CivicSuite_0.1.0_x64_en-US.msi`
- Evidence URL:
  `https://github.com/CivicSuite/civicsuite/releases/download/windows-local-msi-ci-a8c6715/CivicSuite-msi-evidence.txt`
- Installer filename: `CivicSuite_0.1.0_x64_en-US.msi`
- Installer bytes: `1639690816`
- Installer SHA-256:
  `85b51b6cfe8f4713491261ca8bef070db5a7341419ad2f367670e177cbb11ce5`
- Evidence bytes: `548`
- Evidence SHA-256:
  `5bb4eeecd08532d0c4434c6ab712dcfa08e0a9646aa7b2f891db55f8d9636164`

## Cleanroom-Equivalent Start

Use the existing tester machine. Do not reboot or restart Windows for this
directive.

Before the elevated install attempt:

- Preserve useful prior evidence under a non-OneDrive local evidence folder.
- Repeat or confirm the cleanroom-equivalent wipe from directive 067:
  - no CivicSuite uninstall entry remains,
  - no CivicSuite process is running,
  - common CivicSuite program, local app data, app config, local model, runtime,
    backup, shortcut, download, and stale evidence paths from previous test runs
    are absent or cleaned.
- Re-verify the MSI and evidence file byte counts and SHA-256 hashes from
  directive 067.
- Record Windows edition/build, CPU, RAM, free disk space, current user,
  administrator membership, process integrity/admin token, WebView2 status, and
  the exact cleanup actions performed.

Terminal use is allowed for tester evidence capture, cleanup, artifact download,
hash verification, elevated installer launch, log collection, and result
writing. Normal clerk workflows after install must use the installed CivicSuite
desktop app.

## Required Elevated Installer Attempt

This directive requires an actual elevated installer attempt unless the tester
proves no elevation path is available on the machine.

Do not repeat the silent non-admin MSI command from result 065 as the only
attempt.

Attempt elevation using the most capable approved local path available, in this
order:

1. If the active console session can display and approve UAC, launch the MSI
   through the normal Windows elevated installer flow from the interactive
   desktop session and approve the prompt.
2. If the tester has an already elevated PowerShell, terminal, service, scheduled
   task, or automation broker available, run the MSI from that elevated context.
3. If the automation can relaunch a process with Windows `runas` / ShellExecute
   elevation and the active desktop can complete the UAC prompt, use that path.
4. If a local admin test account or credential broker is available to this test
   harness, use it to run the MSI with administrator privileges.

Record:

- which elevation path was attempted,
- whether a UAC prompt appeared,
- whether the prompt was approved,
- whether the installer ran with an administrator token,
- install exit code,
- install log path,
- final uninstall-entry state,
- final install target path.

If every elevation path is unavailable, write `TESTER-RESULT-068.md` with
verdict `BLOCKED - no elevated installer path available` and include evidence
for each unavailable path. Do not mark this as a product code failure unless an
elevated install actually ran and failed.

## Continue Gate After Successful Install

If the MSI installs successfully, continue all applicable sections from
`TESTER-DIRECTIVE-067.md`, except do not reboot or restart Windows:

- unsigned beta notice / SmartScreen installer UX,
- first launch and first-run setup,
- Gemma 4 12B QAT model download/resume/checksum/load/register behavior,
- System Health,
- module manager,
- Local Users/RBAC,
- CivicClerk workflow,
- CivicRecords AI workflow,
- resident/public records request workflow,
- CivicCode workflow,
- cross-module search and handoffs,
- close/reopen persistence,
- backup/restore,
- support bundle,
- repair,
- prepare uninstall,
- Windows uninstall,
- reinstall,
- restore from final backup.

Use app screens and desktop file pickers for city workflows. Do not hand-edit
local data files to make workflows pass. Do not use Docker, WSL, repo-local
bootstrap scripts, old bridge folders, alternate packages, reboot, or Windows
restart.

## Required Result File Format

Write `test-comms/TESTER-RESULT-068.md` with:

- final verdict: PASS, FAIL, or BLOCKED,
- tested branch and commit for the repo channel,
- confirmation `TESTER-DIRECTIVE-067.md`, `TESTER-RESULT-067.md`,
  `TESTER-RESULT-066.md`, and `TESTER-RESULT-065.md` were read,
- PR #192 head SHA tested,
- release tag/URL/asset evidence,
- installer filename, bytes, and SHA-256,
- cleanroom-equivalent wipe evidence,
- clean starting state after wipe,
- exact elevated installer path attempted,
- UAC/admin-token/install-log evidence,
- installer and SmartScreen/unsigned-beta UX result if reached,
- first-run result if reached,
- model download/checksum/load/register result if reached,
- System Health/admin-gating result if reached,
- module manager result if reached,
- Local Users/RBAC result if reached,
- CivicClerk workflow result if reached,
- CivicRecords AI workflow result if reached,
- resident/public records request result if reached,
- CivicCode workflow result if reached,
- cross-module search/handoff result if reached,
- close/reopen persistence result if reached,
- backup/restore result if reached,
- support bundle result if reached,
- repair result if reached,
- uninstall/reinstall/restore result if reached,
- confirmation Windows was not rebooted or restarted,
- exact blocker or failure details for any failed requirement.

## Pass Criteria

Pass only if the elevated MSI install succeeds and the installed CivicSuite app
passes the directive 067 cleanroom-equivalent city-core gate without Docker,
without WSL, without rebooting Windows, and without terminal use for normal clerk
workflows.

Any missing, mock-only, in-memory-only, Docker-only, WSL-only, terminal-only, or
non-durable requirement is a FAIL unless it is clearly an external host,
privilege, or tester-harness blocker, in which case use BLOCKED with evidence.

## Constraints

Push only `test-comms/TESTER-RESULT-068.md` to
`stage-3a-baremetal-windows`. Do not edit source code, generated artifacts,
module manifests, release status, tags, or docs outside `test-comms`. Do not
merge. Do not promote release status. Never touch OneDrive or any Microsoft
cloud-sync path. Do not reboot or restart Windows for this directive.
