# Tester Directive 067 - Windows Local clerk cleanroom-equivalent install without reboot

## Goal

Run the Windows Local city-core beta gate on the existing Windows tester
machine, using a cleanroom-equivalent wipe instead of a full machine reboot or
fresh OS reset.

Read `TESTER-RESULT-065.md` and `TESTER-RESULT-066.md` first. Result 065 proved
the public prerelease artifact can be downloaded and hash-verified, then blocked
because the MSI was launched silently from a non-admin token. Result 066 proved
the heartbeat context could not drive a visible UAC/elevated installer flow.

This directive does not ask for a code change, a new artifact, a new test
channel, a machine reboot, or a new clean VM. Use the existing tester machine,
wipe prior CivicSuite install/data state, then run the current Windows Local
clerk installer artifact from that cleaned state.

## Required Branch And Continuity

- Repo test channel: `CivicSuite/civicsuite`
- Test channel branch: `stage-3a-baremetal-windows`
- Prior directive to read: `test-comms/TESTER-DIRECTIVE-066.md`
- Prior result to read: `test-comms/TESTER-RESULT-066.md`
- Additional prior result to read: `test-comms/TESTER-RESULT-065.md`
- Expected result file: `test-comms/TESTER-RESULT-067.md`
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

Do not use Docker, WSL, repo-local bootstrap scripts, old bridge folders, or a
different generated package for this gate.

## Artifact Verification

Before install, download or reuse the public release assets and verify:

- Installer byte size equals `1639690816`.
- Installer SHA-256 equals
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

## Cleanroom-Equivalent Wipe

Use the existing tester machine. Do not reboot or restart Windows for this
directive.

Before install, create a cleanroom-equivalent state:

- Preserve useful prior evidence under a non-OneDrive local evidence folder.
- Uninstall any existing CivicSuite Windows app through normal Windows uninstall
  surfaces if present.
- Remove incomplete CivicSuite install remnants from prior failed attempts.
- Remove prior CivicSuite program folders, local app data, app config, local
  model files, local runtime folders, backup folders created for previous test
  runs, shortcuts, downloaded installer copies, and stale test evidence that
  would affect this run.
- Confirm no CivicSuite uninstall entry remains before the new install.
- Confirm no CivicSuite process is running before the new install.
- Record Windows edition/build, CPU, RAM, free disk space, current user,
  administrator membership, process integrity/admin token, WebView2 status, and
  the exact wipe actions performed.

Terminal use is allowed for tester evidence capture, cleanup, artifact
download, hash verification, log collection, and result writing. Normal clerk
workflows after install must use the installed CivicSuite desktop app.

## Install And First Run

Install the verified Windows Local clerk installer artifact from the cleaned
state. Record the exact install path used.

Record:

- whether the installer required administrator elevation,
- whether the installer could be run in the available tester context,
- whether SmartScreen appeared,
- whether the unsigned beta notice was visible,
- whether the installer explains unsigned beta status,
- whether the installer or documented visible flow tells staff to use
  "More info" and "Run anyway" when SmartScreen appears,
- whether installation creates a Windows uninstall entry,
- installation target path,
- install logs if available.

If installation cannot proceed because the current tester context cannot run the
installer, write `TESTER-RESULT-067.md` with verdict `BLOCKED` and include the
exact privilege, UAC, installer, or harness limitation. Do not retry Docker,
WSL, or a legacy package to bypass the product installer.

If install succeeds, launch CivicSuite and complete first-run setup using only
the app UI:

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
  registered during the run, mark this gate failed or blocked with exact cause.
  Do not mark a skipped model as pass.

## Required System Health And Admin Gating Checks

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

## Required Module Workflow Evidence

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

### Cross-Module Search And Handoffs

Prove shared CivicCore wiring:

- search across meeting, records, and code data from Search City Knowledge,
- verify results include module labels and citations,
- verify Clerk adopted ordinance/resolution evidence appears in CivicCode
  handoff state,
- verify Records can cite Clerk packet/minutes or Code source evidence when
  appropriate,
- verify audit trail entries exist for risky civic actions.

## Persistence, Backup, Restore, Repair, Uninstall

Do not reboot or restart Windows for this directive.

After module workflows:

- close CivicSuite,
- reopen CivicSuite,
- verify city profile, users, module data, model readiness, and health state
  persist.

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

Finally test uninstall/reinstall without reboot:

- run Prepare Uninstall from System Health,
- verify final uninstall backup is created,
- verify local services are stopped,
- open the Windows uninstall entry from CivicSuite or Windows Settings,
- uninstall CivicSuite,
- verify program files are removed,
- reinstall the same verified installer artifact,
- verify the app can restore from the final backup when the backup folder is
  available,
- verify restored city data, users, and module workflow records are present
  after reinstall.

If restore-from-final-backup is not exposed or fails, report exact blocker.

## Required Result File Format

Write `test-comms/TESTER-RESULT-067.md` with:

- final verdict: PASS, FAIL, or BLOCKED,
- tested branch and commit for the repo channel,
- confirmation `TESTER-DIRECTIVE-066.md`, `TESTER-RESULT-066.md`, and
  `TESTER-RESULT-065.md` were read,
- PR #192 head SHA tested,
- release tag/URL/asset evidence,
- installer filename, bytes, and SHA-256,
- full `CivicSuite-msi-evidence.txt` contents,
- cleanroom-equivalent wipe evidence,
- clean starting state after wipe,
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
- backup/restore result,
- support bundle result,
- repair result,
- uninstall/reinstall/restore result,
- confirmation Windows was not rebooted or restarted,
- evidence paths for screenshots, logs, manifests, support bundle summaries,
  and exported packages,
- exact blocker or failure details for any failed requirement.

## Pass Criteria

Pass only if the installer runs and CivicSuite operates as a Windows desktop app
from a cleanroom-equivalent wiped tester state, without Docker, without WSL,
without rebooting Windows, and without terminal use for normal clerk workflows;
first-run setup can complete; the pinned Gemma 4 12B QAT local model is
downloaded or resumed, checksum-verified, loaded, registered, and accurately
reported; System Health, module manager, local users, backup, restore, repair,
support bundle, and uninstall are real and admin-gated; CivicCore plus
CivicRecords AI, CivicClerk, and CivicCode workflows are durable across
close/reopen; cross-module search/handoffs work with citations/audit evidence;
backup/restore works; uninstall/reinstall/restore works; and no hidden
Docker/WSL/manual-config path is required for the city clerk user journey.

Any missing, mock-only, in-memory-only, Docker-only, WSL-only, terminal-only, or
non-durable requirement is a FAIL unless it is clearly an external host,
privilege, or tester-harness blocker, in which case use BLOCKED with evidence.

## Constraints

Push only `test-comms/TESTER-RESULT-067.md` to
`stage-3a-baremetal-windows`. Do not edit source code, generated artifacts,
module manifests, release status, tags, or docs outside `test-comms`. Do not
merge. Do not promote release status. Never touch OneDrive or any Microsoft
cloud-sync path. Do not reboot or restart Windows for this directive.
