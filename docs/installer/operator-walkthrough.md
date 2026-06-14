# City-Core Windows Local Operator Walkthrough

This walkthrough is for a city clerk, city employee, or local IT helper installing the Windows Local city-core package on one Windows workstation.

The clerk path does not require Docker, WSL, a terminal, or a developer account. Legacy archive runners and Docker-based lifecycle scripts remain CI/developer proof tools, not the end-user installation path.

## What This Installs

The Windows Local city-core package installs:

- CivicCore `1.2.0`
- CivicRecords AI `1.7.3`
- CivicClerk `1.0.4`
- CivicCode `1.0.8`
- CivicSuite desktop shell using Tauri/WebView2
- Portable local runtime payload for storage, services, file exports, backup/restore, and the local AI model runtime

CivicCore is always installed. CivicRecords AI, CivicClerk, and CivicCode are selected as the City Core profile. Future modules remain visible only through the module manager contract until their package and proof gates pass.

## Before You Start

Have these ready:

- A Windows workstation with enough free disk space for the app, local data, backups, and model file.
- Permission to install normal Windows desktop software.
- A stable internet connection for first install/model download unless the model file has already been staged by IT.
- A city name, records contact, clerk contact, first local administrator name/email, and a backup folder location.

Do not install Docker Desktop or WSL for this product path. If the app asks for Docker, WSL, a terminal, or manual environment edits, that is a release-blocking bug for the Windows Local clerk installer.

## Install

1. Open the CivicSuite Windows installer file.

2. If Windows Defender SmartScreen appears, use the installer notice:
   - The installer is unsigned beta software.
   - Choose **More info**.
   - Choose **Run anyway**.
   - Continue only if the file came from the expected CivicSuite release/test source.

3. Follow the installer screens. The installer places the app and portable runtime on the local machine and adds normal Windows uninstall support.

4. Open CivicSuite after install.

5. Complete first-run setup:
   - Review unsigned beta and SmartScreen status.
   - Confirm local install/data/backup folders.
   - Keep the City Core module profile selected.
   - Download or resume the pinned Gemma 4 12B QAT Q4_0 model.
   - Verify the model checksum before enabling AI workflows.
   - Create the city profile.
   - Create the first local administrator.
   - Run local health verification.

The app should explain failures in plain English and keep repair, backup, restore, logs, and uninstall reachable from System Health.

## Verify The Install

After first-run setup, open System Health. Verify:

- Desktop shell is running locally.
- Local data store is installed and healthy.
- Local AI model file is present, checksum-verified, loaded, and registered.
- Backup folder is configured.
- Repair, backup, restore, logs, and uninstall controls are visible behind local-admin access.

Use the module manager in Settings to confirm:

- City Core profile is selected.
- CivicCore, CivicRecords AI, CivicClerk, and CivicCode are installed.
- Each installed module shows install, update, disable, remove, backup coverage, and export access state.
- Future modules are not presented as installed.

## Clerk Smoke Test

Use the app screens, not a terminal:

- Meetings & Notices: create a meeting, add an agenda item, complete the notice checklist with meeting type/statutory basis/deadline/time zone/clerk approval, record notice posting date/location/method/confirmation, mark notice ready, generate or type minutes, record a vote/action item, adopt minutes, and archive the public record.
- Records Requests: create or submit a request, review the response deadline and basis, review the Notification Outbox, log generated notifications as sent after staff sends them, record search/citation notes, generate or type a response draft, approve, export, mark fulfilled, and close.
- Resident/Public Records Requests: submit a public request, keep the returned request number, and check status with the same submitted contact.
- Code & Ordinances: import a code source, record sync state, generate or type guidance, approve guidance, publish source, answer a code question with citations, and create a clerk handoff.
- Search City Knowledge: search across local meeting, records, and code data with citations and module labels.

Risky civic actions should open a review panel before saving. Backup, restore, repair, service stop, and uninstall should also open a review panel before running.

## Backup And Restore

Use System Health before major changes:

- **Backup Now** writes local data/config copies and a backup manifest.
- **Restore Latest Backup** creates a pre-restore safety backup before replacing local data/config from the latest backup.
- Restore should stop safely if no backup manifest exists.

Backups are local files. Keep backup folders somewhere the city can retain and protect according to its records and IT policy.

## Uninstall

Use **Prepare Uninstall** in System Health before removing CivicSuite:

- The app creates a final uninstall backup.
- The app stops local services.
- The app removes local data and setup/config state.
- The Windows uninstall entry removes program files.

Reinstall should be able to restore from the final backup when the backup folder is available.

## Troubleshooting

If SmartScreen appears, follow the unsigned beta installer notice and confirm the file source.

If model download is interrupted, use **Download / Resume** in first-run setup.

If checksum verification fails, do not continue AI setup; download the pinned model again or ask IT for the correct file.

If a local service is unhealthy, use System Health **Check**, then **Repair** after reviewing the repair panel.

If disk space is low, free space and run health verification again.

If the app cannot write backups, choose a folder the local user can write and run backup again.

If the app asks for Docker, WSL, terminal commands, or manual config-file edits, stop and record it as a Windows Local release blocker.
