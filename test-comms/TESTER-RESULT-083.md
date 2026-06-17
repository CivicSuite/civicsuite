# TESTER-RESULT-083

Verdict: FAIL

## Artifact and branch verification

- Live remote inspected before testing: `git ls-remote origin refs/heads/stage-3a-baremetal-windows` returned `5863f7e640c9a9459b76e3223c92e3b261e01fe9`.
- `FETCH_HEAD` after fetch also resolved `stage-3a-baremetal-windows` to `5863f7e640c9a9459b76e3223c92e3b261e01fe9`.
- MSI downloaded from `windows-local-msi-ci-47d7738`.
- MSI path: `C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\directive083-evidence\CivicSuite_0.1.0_x64_en-US.msi`
- MSI bytes: `1639816439` (matches directive).
- MSI SHA-256: `9ac582acc57b69213d5f3466165f25df951eb6b19bab5c0af9a2e01e46b7aabc` (matches directive).
- Evidence asset bytes: `548` (matches directive).
- Evidence asset SHA-256: `adb2f915e13a18eac59d2025433ad2c0d2ed35fb49e02f111ac144151218caa5` (matches directive).

## Install and runtime

- Install command: hidden elevated `msiexec.exe /i ... /qn /norestart /L*v ...`.
- Install exit code: `0`.
- Installed product code: `{8F35B739-BFAD-4DB9-BF48-3E948B2D2645}`.
- Installed executable: `C:\Program Files\CivicSuite\civicsuite-desktop.exe`.
- Runtime health endpoint `http://127.0.0.1:15480/health` returned `status: ok`; database status was `ready`; imports for `civiccore`, `civicrecords-ai`, `civicclerk`, and `civiccode` were OK.
- Launcher UI at `http://127.0.0.1:18082/` displayed `City-core ready` and module cards marked `Ready`.
- CivicSuite-managed runtime files were present, including `C:\Users\insty\AppData\Local\CivicSuite\Data\models\gemma-4-12b-it-qat-q4_0.gguf` and the Ollama manifest `civicsuite-gemma4-12b-qat/q4_0`.
- A user-global Ollama was also present and listening on `127.0.0.1:11434`; `ollama app.exe` and global `ollama.exe serve` were running alongside `C:\Users\insty\AppData\Local\CivicSuite\runtime\ollama\ollama.exe serve`.

## Blocking product behavior

The installed customer UI did not expose the product controls required to execute directive 083.

Smallest reproducible sequence:

1. Install verified MSI `windows-local-msi-ci-47d7738`.
2. Launch `C:\Program Files\CivicSuite\civicsuite-desktop.exe`.
3. Open the launcher surface at `http://127.0.0.1:18082/`.
4. Click `IT-Admin`.
5. Observe UI text showing module cards as `Ready`, with links such as:
   - `CivicRecords AI` -> `http://127.0.0.1:23080/`
   - `CivicClerk` -> `http://127.0.0.1:23081/`
   - `CivicCode` -> `http://127.0.0.1:23820/civiccode`
6. Attempt to open those advertised module URLs.

Observed result:

- `127.0.0.1:23080` refused connections.
- `127.0.0.1:23081` refused connections.
- `127.0.0.1:23820` refused connections.
- All advertised module ports `23080`, `23081`, and `23820` through `23865` were not listening.
- The visible IT/Admin surface only showed endpoint cards and a service checklist. It did not show Settings, staff creation, staff sign-in, Backup Now, Create Support Bundle, Repair, Restore Latest Backup, Prepare Uninstall, or any guided workflow controls.

Evidence:

- `directive083-evidence\083-it-admin-full.txt`
- `directive083-evidence\083-it-admin-full.png`
- `directive083-evidence\083-module-records.txt`
- `directive083-evidence\083-module-clerk.txt`
- `directive083-evidence\083-module-code.txt`
- `directive083-evidence\blocker-state.json`
- `directive083-evidence\runtime-health.json`
- `directive083-evidence\runtime-processes.json`

## Required targeted checks

- Staff sign-in/RBAC proof: blocked. No staff creation/sign-in controls were exposed in the installed customer surface.
- Guided panel visibility and confirm-button proof: blocked. Records, Clerk, and Code module UIs were unreachable; advertised module ports refused connections.
- Clerk adopted legislation count after confirmed action and after close/reopen: blocked. No `Confirm Record Adoption` control could be reached in this build. Existing durable store still shows `adopted_legislation: 0`.
- Clerk publication/archive counts after close/reopen: blocked for new 083 data. Existing store currently shows `publication_events: 2`, but no fresh 083 publication/archive workflow could be exercised.
- Records lifecycle evidence and typed unreadable references: blocked for new 083 data. Existing store currently shows `records_requests: 4`, but no fresh Records UI could be reached.
- Code source/handoff evidence and typed unreadable references: blocked for new 083 data. Existing store currently shows `code_sources: 1` and `code_handoffs: 1`, but no fresh Code UI could be reached.
- Backup Now: blocked. The installed customer surface exposed no Backup Now product control. No fresh backup was created during directive 083. Latest observed backup folder remained `C:\Users\insty\Documents\CivicSuite Backups\civicsuite-manual-backup-1781650214-23172`; it has a README but no `backup-manifest.json`.
- Support bundle: blocked. The installed customer surface exposed no Create Support Bundle product control. No fresh support bundle was created during directive 083. Latest observed support bundle remained `C:\Users\insty\Documents\CivicSuite Backups\support-bundles\civicsuite-support-bundle-1781626914-20632`; it has `support-manifest.json` but no `collection-notes.txt`.
- Repair: blocked. No Repair product control was exposed.
- Uninstall/reinstall/restore: blocked. No Restore Latest Backup or product uninstall/restore control was exposed, and no fresh product-created manifest backup was available from this run.

## Current durable store snapshot

From `C:\Users\insty\AppData\Local\CivicSuite\Data\workflows\city-work.json` after installing and launching this build:

- `meeting_bodies`: 2
- `meeting_members`: 2
- `agenda_intakes`: 5
- `meetings`: 2
- `records_requests`: 4
- `code_sources`: 1
- `code_handoffs`: 1
- `adopted_legislation`: 0
- `audit_entries`: 65
- `publication_events`: 2
- `notification_events`: 8

These counts are prior persisted data, not successful directive 083 workflow evidence.

## Notes

This failure is product behavior, not an external elevation or host harness limit. The MSI installed successfully, the runtime health service reported OK, and the launcher rendered, but the customer-facing product surface could not open the advertised module UIs and did not expose the controls required by directive 083.
