# TESTER-RESULT-094

Verdict: FAIL

## Remote/directive verification

- Branch: `stage-3a-baremetal-windows`
- Live `git ls-remote origin refs/heads/stage-3a-baremetal-windows`: `96ec9beae1ca437b925e5df52c3e699c9528928a`
- `FETCH_HEAD` after live fetch: `96ec9beae1ca437b925e5df52c3e699c9528928a`
- Directive executed: `test-comms/TESTER-DIRECTIVE-094.md`
- Required result file: `test-comms/TESTER-RESULT-094.md`

## Artifact integrity

- MSI `CivicSuite_0.1.0_x64_en-US.msi`: 1,645,126,464 bytes, SHA-256 `1069c45b1274d485fab9c731d9c9e3fa626a60b0b45093f689e60acab3c7dd9a`, matched directive.
- Evidence asset `CivicSuite-msi-evidence.txt`: 548 bytes, SHA-256 `73dc9da00b5bd672f8dee4042016dc38522e8274dac2266308ee13264fb6950a`, matched directive.

## Elevation/install/uninstall/reinstall

- Elevated Windows Installer install initially failed on disk validation:
  - First install: exit `112`, C: free about 648 MB.
  - Retry after uninstalling prior product: exit `1603`; MSI log said `Disk full: Out of disk space -- Volume: 'C:'; required space: 4,014,980 KB; available space: 3,011,192 KB`.
- Removed only explicit old untracked duplicate prior-directive MSI downloads from `directive092-evidence` and `directive093-evidence`, then retried.
- Elevated install after scoped disk cleanup: exit `0`; installed `C:\Program Files\CivicSuite\civicsuite-desktop.exe`, 12,618,240 bytes; product code `{4E2270C8-0860-46A8-9861-46FB9F54761C}`.
- Elevated uninstall/reinstall lifecycle later in the run:
  - Uninstall product `{4E2270C8-0860-46A8-9861-46FB9F54761C}`: exit `0`.
  - Reinstall same target MSI: exit `0`.
  - Reinstalled exe present at `C:\Program Files\CivicSuite\civicsuite-desktop.exe`, 12,618,240 bytes.

## Desktop identity/model readiness

- Launched only installed desktop app: `C:\Program Files\CivicSuite\civicsuite-desktop.exe`.
- WebView identity: title `CivicSuite`, URL `http://tauri.localhost/`.
- System Health model surface: `Gemma 4 12B QAT Q4_0` showed `Ready`, local file verified, checksum verified, runtime loaded in Ollama.

## Service health

- Product Start/Repair was used from System Health.
- Local data store remained `Needs start`: installed but not responding to TCP `127.0.0.1:15432`; product showed `pid none`.
- City workflow services remained `Needs start`: installed but not responding to `http://127.0.0.1:15480/health`; product showed `pid none`.
- Task queue schema remained `Needs services`: City workflow services not running, `http_status none`.
- Background work queue alternated during the run but final post-restore state was `Needs start`; task queue log ended with `ConnectionRefusedError: [WinError 1225] The remote computer refused the network connection`.
- Postgres log tail contained previous abnormal termination/recovery entries and no fresh successful start after restore.

## Backup Now

- Product `Backup Now` left `Working` and returned `Backup complete`.
- Fresh backup root: `C:\Users\insty\Documents\CivicSuite Backups\civicsuite-manual-backup-1781787549-22512`.
- `backup-manifest.json` existed, 289,681 bytes.
- Root `README.txt` existed, 320 bytes.

## Clerk adopted-legislation workflow

- Fresh marker: `DIR094-20260618070103`.
- Created fresh agenda/meeting evidence visible after close/reopen:
  - `Budget amendment DIR094-20260618070103 - submitted`
  - `Regular Meeting DIR094-20260618070103`
  - `Meeting workflow DIR094-20260618070103`
  - `Agenda: Budget item DIR094-20260618070103`
- Attempted the full fresh Clerk sequence through installed desktop controls: Save Minutes Draft, Add Minute Citation, Record Motion, Adopt Minutes, Sign Minutes, Record Adopted Ordinance/Resolution, Archive Public Record.
- Explicitly confirmed the review modals: `Confirm Adopt Minutes`, `Confirm Sign Minutes`, `Confirm Record Adoption`, and `Confirm Archive Public Record`.
- Failure: the fresh `DIR094` meeting still showed `0 minute citations`, `0 motions`, `0 outcomes`, `0 records-ready bundles`, and `0 exports`; archive review reported `Minutes are not marked adopted yet` and `Minutes are not signed yet`.
- Older meetings still showed valid citation/motion/adopt/archive evidence, so the failure is specific to applying the fresh action controls to the selected fresh meeting.

## Records durability

- Fresh Records marker survived close/reopen:
  - `Records request REQ-0011 created`
  - `Requester DIR094-20260618070103`
  - `Request for unreadable reference and archive records DIR094-20260618070103`
  - `Typed document DIR094-20260618070103 Typed unreadable citation DIR094-20260618070103 attached for response review`
- Export was blocked by product review because approval was still missing, but the typed unreadable reference durability requirement passed.

## Code durability

- Fresh Code guidance survived close/reopen:
  - `Staff guidance: Guidance draft DIR094-20260618070103`
- Attempted fresh source/import/handoff/guidance actions. The fresh guidance attached to the already-selected `Noise ordinance DIR091-20260617221623` source instead of creating a new fresh DIR094 source card, so fresh source/handoff evidence was incomplete.

## Support bundle

- Product `Create Support Bundle` left `Working` and returned `Support bundle ready`.
- Fresh support bundle: `C:\Users\insty\Documents\CivicSuite Backups\support-bundles\civicsuite-support-bundle-1781788003-22512`.
- `support-manifest.json` existed, 1,752 bytes.
- `README.txt`, `runtime-state.json`, `health-summary.json`, and selected service logs were present.

## Restore result and post-restore recovery

- After elevated reinstall, launched the reinstalled desktop app and ran `Restore Latest Backup` from System Health.
- Confirmed restore and waited about 5.5 minutes total.
- Failure: restore still remained visibly `Working` with text `Running Restore Latest Backup from the desktop app. Keep CivicSuite open while the local action completes.`
- It did not return a bounded product result such as `Restore needs service start` or `Restore complete`.
- Post-restore product health remained degraded:
  - Task queue schema: `Needs services`
  - Local data store: `Needs start`
  - City workflow services: `Needs start`
  - Background work queue: `Needs start`
  - Local AI model: `OK`
  - Local document storage: `OK`

## Smallest reproducible failure sequence

1. Install verified MSI elevated.
2. Launch `C:\Program Files\CivicSuite\civicsuite-desktop.exe`.
3. Open System Health and run product Start/Repair on Local data store and City workflow services.
4. Observe Local data store remains `Needs start`, City workflow services remains `Needs start`, and Task queue schema remains `Needs services`.
5. Create a fresh Clerk meeting `DIR094-20260618070103`; run and confirm Save Minutes Draft, Add Minute Citation, Record Motion, Adopt Minutes, Sign Minutes, Record Adopted Ordinance/Resolution, and Archive Public Record.
6. Observe fresh meeting remains at `0 minute citations`, `0 motions`, `0 outcomes`, `0 records-ready bundles`, `0 exports`, and archive review says minutes are not adopted/signed.
7. Create Backup Now; it completes.
8. Elevated uninstall/reinstall the same MSI.
9. Launch the reinstalled desktop app and run Restore Latest Backup.
10. After about 5.5 minutes, restore still shows `Working` instead of a bounded product result, with Local data store and City workflow services still degraded.
