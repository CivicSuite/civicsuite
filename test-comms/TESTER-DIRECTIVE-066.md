# Tester Directive 066 - Windows Local MSI clean-machine rerun with interactive elevation

## Goal

Rerun the Windows Local MSI clean-machine city-core beta gate from
`TESTER-DIRECTIVE-065.md`, using the same public prerelease MSI asset, but run
the installer through the real interactive/elevated Windows installer path.

`TESTER-RESULT-065.md` cleared the artifact-download blocker from result 064,
then blocked because the tester launched an all-users MSI silently from a
non-admin Codex worker token:

- `msiexec.exe /i ... /qn /norestart ...`
- MSI exit code `1603`
- MSI log Error `1925`: insufficient privileges to complete installation for
  all users of the machine.

That was a test-harness/install-token blocker, not a product-code failure. The
package is intentionally an all-users MSI under `C:\Program Files\CivicSuite`,
so this rerun must use an interactive administrator/elevation path like a city
IT helper or authorized installer would use.

## Required branch and continuity

- Repo test channel: `CivicSuite/civicsuite`
- Test channel branch: `stage-3a-baremetal-windows`
- Prior directive to read: `test-comms/TESTER-DIRECTIVE-065.md`
- Prior result to read: `test-comms/TESTER-RESULT-065.md`
- Expected result file: `test-comms/TESTER-RESULT-066.md`
- Do not edit source, generated artifacts, module manifests, release status,
  tags, or docs outside `test-comms`.

## Product artifact truth

Use the same product artifact as directive 065:

- PR under test: `CivicSuite/civicsuite#192`
- Required PR head under test: `a8c6715d8434160c8ade722d9459f2247fb7369d`
- Source workflow run: `27522471421`
- Source workflow job: `build Windows Local MSI`
- Public prerelease tag: `windows-local-msi-ci-a8c6715`
- Public prerelease URL:
  `https://github.com/CivicSuite/civicsuite/releases/tag/windows-local-msi-ci-a8c6715`
- MSI URL:
  `https://github.com/CivicSuite/civicsuite/releases/download/windows-local-msi-ci-a8c6715/CivicSuite_0.1.0_x64_en-US.msi`
- Evidence URL:
  `https://github.com/CivicSuite/civicsuite/releases/download/windows-local-msi-ci-a8c6715/CivicSuite-msi-evidence.txt`
- MSI filename: `CivicSuite_0.1.0_x64_en-US.msi`
- MSI bytes: `1639690816`
- MSI SHA-256:
  `85b51b6cfe8f4713491261ca8bef070db5a7341419ad2f367670e177cbb11ce5`
- Evidence bytes: `548`
- Evidence SHA-256:
  `5bb4eeecd08532d0c4434c6ab712dcfa08e0a9646aa7b2f891db55f8d9636164`

Do not retest GitHub Actions artifact download. Directive 065 proved the public
release asset path works and the hashes match.

## Required install-token handling

This directive must not repeat the silent non-admin install that blocked result
065.

Use one of these real Windows install paths:

- Double-click/open the MSI from the interactive Windows desktop session and
  allow the UAC/elevation prompt; or
- Launch the MSI or `msiexec` with visible elevation from the interactive user
  session; or
- Use an already elevated administrator process on the tester machine to run the
  MSI visibly or with full administrator token.

Record exactly which path was used.

If the tester automation cannot launch a visible/elevated installer from the
heartbeat context, do not retry the same silent non-admin command. Instead, write
`TESTER-RESULT-066.md` with verdict `BLOCKED - interactive elevation unavailable`
and include:

- confirmation result 065 was read,
- confirmation the artifact was already verified,
- current user/admin/integrity facts,
- whether an interactive desktop session exists,
- whether a visible UAC/elevation prompt can be launched,
- the exact reason the tester cannot exercise the real installer path.

Do not mark this as a product failure unless an elevated/interactive install was
actually attempted and failed.

## Artifact verification

Re-verify local/public asset integrity before install:

- MSI byte size equals `1639690816`.
- MSI SHA-256 equals
  `85b51b6cfe8f4713491261ca8bef070db5a7341419ad2f367670e177cbb11ce5`.
- Evidence byte size equals `548`.
- Evidence SHA-256 equals
  `5bb4eeecd08532d0c4434c6ab712dcfa08e0a9646aa7b2f891db55f8d9636164`.
- Evidence file contains:

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

## Clean-machine starting state

Use the Windows tester machine as a clean clerk workstation for this gate.

Before install:

- Read `test-comms/TESTER-DIRECTIVE-065.md`.
- Read `test-comms/TESTER-RESULT-065.md`.
- Confirm result 065 blocked only because the install was silent/non-admin and
  the all-users MSI requires elevation.
- Preserve useful prior evidence outside OneDrive paths.
- Remove any incomplete CivicSuite install state from the failed result 065
  attempt if present.
- Do not install Docker Desktop.
- Do not enable or require WSL.
- Do not use Docker, WSL, or repo-local bootstrap scripts as part of the clerk
  install path.
- Record Windows edition/build, CPU, RAM, disk free space, current user,
  administrator membership, process integrity/admin token, and WebView2 status.

## Install and first-run workflow

Install the downloaded MSI through the real interactive/elevated Windows path.

Record:

- whether UAC/elevation was required,
- whether SmartScreen appeared,
- whether the unsigned beta notice was visible in the installer flow,
- whether the installer explains the unsigned beta status,
- whether the installer or visible flow tells staff to use "More info" and
  "Run anyway" when SmartScreen appears,
- whether installation creates a Windows uninstall entry,
- installation target path,
- install logs if available.

After install, launch CivicSuite and complete first-run setup using only the app
UI:

- review unsigned beta status,
- choose or confirm local install/data/model/backup folders,
- keep City Core selected,
- confirm CivicCore is required and cannot be deselected,
- confirm CivicRecords AI, CivicClerk, and CivicCode are enabled,
- confirm future modules are not falsely shown as installed,
- create the city profile,
- create the first local administrator,
- add at least one clerk staff user,
- add at least one records staff user,
- add at least one code staff user,
- add at least one city-staff user,
- run local health verification.

For the pinned local model path, test real production behavior:

- Gemma 4 12B QAT metadata is visible.
- Download/resume is available.
- Checksum verification is required before AI workflows are enabled.
- Missing model, partial download, failed download, needs verification, needs
  runtime, needs load, and ready states are plain-English and distinct.
- If the model cannot be fully downloaded, checksum-verified, loaded, and
  registered during the clean-machine run, mark this gate failed or blocked with
  exact cause. Do not mark a skipped model as pass.

## Required System Health and admin gating checks

As the first local administrator, verify System Health exposes and gates:

- local data store status,
- task queue or workflow schema status,
- local model file/checksum/runtime/registry status,
- backup folder status,
- module manager status,
- local users management,
- logs,
- support bundle,
- repair,
- backup,
- restore,
- prepare uninstall,
- Windows uninstall entry point.

Then sign in as non-admin staff roles and verify they cannot access admin-only
setup, service lifecycle, backup/restore, module manager, user management,
support bundle, or uninstall actions. Staff should still be able to use their
authorized module workflows.

## Required module workflow evidence

Use app screens and desktop file pickers where source files are required. Do not
hand-edit local data files to make workflows pass.

### CivicClerk - Meetings & Notices

Create and prove a durable clerk workflow:

- create a meeting body with statutory basis, cadence, notice, quorum, and
  member roster,
- create agenda intake with department/source evidence,
- review intake as ready for agenda,
- create a meeting,
- promote intake onto the agenda,
- add a manual agenda item,
- record a structured staff report,
- attach public packet evidence and closed-session addendum evidence,
- finalize/export packet with checksum evidence,
- calculate notice deadline with lead days, day type, time zone, and holiday
  review warning,
- complete notice checklist,
- record notice posting date/location/method/confirmation,
- mark notice ready,
- generate or type minutes,
- add minute citation evidence,
- record attendance from the roster,
- save quorum check,
- record a motion,
- record individual roll-call votes,
- record vote outcome summary,
- record action items,
- adopt minutes,
- sign adopted minutes with attestation evidence,
- record adopted ordinance/resolution handoff for CivicCode,
- archive the public record,
- confirm public archive excludes closed-session files, staff-only notes,
  staff-only citations, intake queue internals, and local workstation paths.

### CivicRecords AI - Records Requests

Create and prove a durable records workflow:

- create a staff records request,
- calculate response deadline,
- override deadline with basis,
- review Request Timeline,
- add public-safe status update,
- add request message,
- save search session with query/location/result evidence,
- attach local source document with hash/citation evidence,
- attach release-ready or redacted copy with hash/reviewer/note evidence,
- record release/redact/exempt decision with source and basis,
- build checksummed release package manifest,
- add fee line items with fee schedule or policy basis,
- record fee waiver reason,
- generate or type response draft,
- approve response,
- export response/release package,
- mark fulfilled and close.

Also prove resident/public request behavior:

- submit a public request,
- keep the returned request number,
- check status with the same submitted contact,
- confirm public status excludes staff notes, search details, exemption
  reasoning, local paths, and internal audit details.

### CivicCode - Code & Ordinances

Create and prove a durable code workflow:

- import a code source with title/citation/searchable text,
- preserve source file as local evidence when available,
- verify filename/hash evidence is retained without publishing workstation
  paths,
- record codifier/sync state,
- generate or type staff guidance,
- approve guidance,
- publish source,
- answer a code question with citations,
- create a Clerk-to-Code or Code-to-Clerk handoff tied to the
  meeting/adoption workflow.

### Cross-module search and handoffs

Prove shared CivicCore wiring:

- search across meeting, records, and code data from Search City Knowledge,
- verify results include module labels and citations,
- verify Clerk adopted ordinance/resolution evidence appears in CivicCode
  handoff state,
- verify Records can cite Clerk packet/minutes or Code source evidence when
  appropriate,
- verify audit trail entries exist for risky civic actions.

## Persistence, reboot, backup, restore, repair, uninstall

After module workflows:

- close CivicSuite,
- reopen CivicSuite,
- verify city profile, users, module data, model readiness, and health state
  persist,
- reboot Windows,
- reopen CivicSuite,
- verify the same persistence after reboot.

Then test local operations:

- run Backup Now,
- record backup manifest and location,
- make a visible additional data change,
- run Restore Latest Backup,
- verify the pre-restore safety backup is created,
- verify restored state matches the selected backup,
- create a support bundle,
- verify the support bundle includes manifest/health/runtime/log summaries,
- verify the support bundle does not copy city records, uploaded documents,
  backup contents, or local secrets,
- run Repair for any unhealthy or selected local service,
- verify repair uses a review/confirmation panel and preserves city data.

Finally test uninstall/reinstall:

- run Prepare Uninstall from System Health,
- verify final uninstall backup is created,
- verify local services are stopped,
- open the Windows uninstall entry from CivicSuite or Windows Settings,
- uninstall CivicSuite,
- verify program files are removed,
- reinstall the same MSI,
- verify the app can restore from the final backup when the backup folder is
  available,
- verify restored city data, users, and module workflow records are present
  after reinstall.

If restore-from-final-backup is not exposed or fails, report exact blocker.

## Required result file format

Write `test-comms/TESTER-RESULT-066.md` with:

- final verdict: PASS, FAIL, or BLOCKED,
- tested branch and commit for the repo channel,
- confirmation `TESTER-DIRECTIVE-065.md` and `TESTER-RESULT-065.md` were read,
- confirmation result 065's silent non-admin install blocker was cleared or
  remains externally blocked,
- PR #192 head SHA tested,
- release tag/URL/asset evidence,
- MSI filename, bytes, and SHA-256,
- full `CivicSuite-msi-evidence.txt` contents,
- clean-machine starting state,
- interactive/elevated install path used,
- installer and SmartScreen/unsigned-beta UX result,
- first-run result,
- model download/checksum/load/register result,
- System Health/admin-gating result,
- module manager result,
- Local Users/RBAC result,
- CivicClerk workflow result,
- CivicRecords AI workflow result,
- resident/public records request result,
- CivicCode workflow result,
- cross-module search/handoff result,
- close/reopen persistence result,
- reboot persistence result,
- backup/restore result,
- support bundle result,
- repair result,
- uninstall/reinstall/restore result,
- evidence paths for screenshots, logs, manifests, support bundle summaries,
  and exported packages,
- exact blocker or failure details for any failed requirement.

## Pass criteria

Pass only if the MSI installs and runs as a Windows desktop app, without Docker,
without WSL, and without terminal use for normal clerk workflows; first-run setup
can complete; the pinned Gemma 4 12B QAT local model is downloaded or resumed,
checksum-verified, loaded, registered, and accurately reported; System Health,
module manager, local users, backup, restore, repair, support bundle, and
uninstall are real and admin-gated; CivicCore plus CivicRecords AI, CivicClerk,
and CivicCode workflows are durable across close/reopen and reboot; cross-module
search/handoffs work with citations/audit evidence; backup/restore works;
uninstall/reinstall/restore works; and no hidden Docker/WSL/manual-config path is
required for the city clerk user journey.

Any missing, mock-only, in-memory-only, Docker-only, WSL-only, terminal-only, or
non-durable requirement is a FAIL unless it is clearly an external host/elevation
blocker, in which case use BLOCKED with evidence.

## Constraints

Push only `test-comms/TESTER-RESULT-066.md` to `stage-3a-baremetal-windows`.
Do not edit source code, generated artifacts, module manifests, release status,
tags, or docs outside `test-comms`. Do not merge. Do not promote release status.
Never touch OneDrive or any Microsoft cloud-sync path.
