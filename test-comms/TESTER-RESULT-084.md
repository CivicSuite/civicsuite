# TESTER-RESULT-084

Branch: `stage-3a-baremetal-windows`
Directive: `TESTER-DIRECTIVE-084.md`
Tester: Codex tester
Result timestamp: 2026-06-17T02:55:00Z

## Verdict

FAIL

The installed MSI launches the real Tauri desktop app and the City Core workflows largely work and persist after close/reopen. The blocking product failure is in the desktop lifecycle controls: `Backup Now` and `Create Support Bundle` show the required review/confirmation panels, but clicking `Confirm Backup Now` and `Confirm Create Support Bundle` leaves the review panel open and does not create a fresh `backup-manifest.json` or `support-manifest.json`.

## Remote and artifact integrity

- `git ls-remote origin refs/heads/stage-3a-baremetal-windows`: `d9b6cf34ec1d427938df3765cbe6657533e79914`
- `.git/FETCH_HEAD`: `d9b6cf34ec1d427938df3765cbe6657533e79914 branch 'stage-3a-baremetal-windows'`
- MSI: `CivicSuite_0.1.0_x64_en-US.msi`
- MSI bytes: `1639816439`
- MSI SHA-256: `9ac582acc57b69213d5f3466165f25df951eb6b19bab5c0af9a2e01e46b7aabc`
- Evidence asset bytes: `548`
- Evidence asset SHA-256: `adb2f915e13a18eac59d2025433ad2c0d2ed35fb49e02f111ac144151218caa5`
- Installed product: CivicSuite `0.1.0`, product code `{8F35B739-BFAD-4DB9-BF48-3E948B2D2645}`
- Installed executable: `C:\Program Files\CivicSuite\civicsuite-desktop.exe`

## Desktop/Tauri proof

- Launched only `C:\Program Files\CivicSuite\civicsuite-desktop.exe`.
- WebView2 target URL was `http://tauri.localhost/`.
- Desktop surface showed `WINDOWS LOCAL 1.0`, `CivicSuite`, `Home`, `Meetings & Notices`, `Records Requests`, `Code & Ordinances`, `Search City Knowledge`, `System Health`, and `Settings`.
- A stale prior suite launcher process on `http://127.0.0.1:18082/` was not used for this retest.

## Runtime/model readiness

- System Health showed local model status `Ready`.
- Runtime name: `civicsuite-gemma4-12b-qat:q4_0`.
- Managed model runtime endpoint: `http://127.0.0.1:15434/api/tags`.
- Managed model file path shown by admin: `C:\Users\insty\AppData\Local\CivicSuite\Data\models\gemma-4-12b-it-qat-q4_0.gguf`.
- User-global Ollama was also present separately, but the desktop health panel reported the managed CivicSuite runtime and port.

## Access control

- Created staff user `Clerk Staff DIR084-20260617021112` with passcode `Staff084Pass!` (13 characters).
- Staff sign-in with email plus passcode succeeded.
- Staff was blocked from local-admin-only setup text and instructed to sign out and use a local administrator before changing setup, users, modules, backups, restore, repair, or runtime services.
- Staff System Health showed model status but hid the model path and displayed `Use a local administrator account before changing local model setup.`

## Clerk workflow

- Created `Council DIR084C-20260617022557`, member, agenda intake, meeting, agenda item, notice calculations/checklist, packet finalization, minutes, motion, attendance, action item, resident comment, adopted minutes/signature, adopted ordinance/resolution action, archive action, and code handoff.
- Confirmation panels appeared for guided actions and were clicked.
- Reopened desktop evidence still showed `Regular Meeting DIR084C-20260617022557`, `Budget amendment DIR084C-20260617022557`, `Move to adopt ordinance DIR084C-20260617022557`, `Packet DIR084C-20260617022557`, and source `Z:\CivicSuite\Missing\records-DIR084C-20260617022557.pdf`.
- Store counts after the run: meeting bodies `3`, members `3`, agenda intakes `6`, meetings `3`, audit entries `104`.
- Note: the store `adopted_legislation` array remained `0` even after the UI action `record-adopted-legislation`; the meeting outcome/action persisted, but the dedicated adopted-legislation count did not advance.

## Records workflow

- Created `Requester DIR084C-20260617022557`, calculated deadline, assigned owner, recorded search source, recorded search session, exemption review/decision, fee estimate, fee line, fee waiver, message, document, release copy, draft/approval, package/export, fulfillment, close, and notification action.
- Reopened desktop showed `Requester DIR084C-20260617022557`, fulfilled response/export path, message `Records response message DIR084C-20260617022557`, release copy `readable-record-DIR084C-20260617022557.txt`, and unreadable typed reference `Z:\CivicSuite\Missing\records-DIR084C-20260617022557.pdf`.
- Store counts after the run: records requests `5`, notification events `13`.

## Code workflow

- Imported and published `Noise ordinance DIR084C-20260617022557`, recorded codifier sync, drafted/approved guidance, created clerk handoff, and answered a code question.
- Reopened desktop showed `Noise ordinance DIR084C-20260617022557`, `Ord. DIR084C-20260617022557 - published - synced - 1 public exports`, `Clerk handoff DIR084C-20260617022557`, and source evidence for typed reference `code-source-DIR084C-20260617022557.pdf`.
- Store counts after the run: code sources `2`, code handoffs `3`, publication events `4`.

## Lifecycle controls

- `Backup Now`, `Create Support Bundle`, `Restore Latest Backup`, `Repair`, and `Prepare Uninstall` were reachable from the installed desktop System Health controls.
- `Repair` opened the expected `Review Before Repairing Local data store` panel.
- `Prepare Uninstall` opened the expected `Review Before Preparing Uninstall` panel; I did not confirm the destructive uninstall preparation.
- Product failure: `Backup Now` opened `Review Before Backing Up Local Profile` with `Confirm Backup Now`; clicking the exact visible confirm button via Playwright role selection and DOM button selection left the review panel open. No fresh `backup-manifest.json` appeared under `C:\Users\insty\Documents\CivicSuite Backups`.
- Product failure: `Create Support Bundle` opened `Review Before Creating Support Bundle` with `Confirm Create Support Bundle`; clicking the exact visible confirm button via Playwright role selection and DOM button selection left the review panel open. No fresh `support-manifest.json` appeared; the only discovered support manifest was the older `C:\Users\insty\Documents\CivicSuite Backups\support-bundles\civicsuite-support-bundle-1781626914-20632\support-manifest.json` from 2026-06-16 10:21:54.
- Because a fresh backup manifest could not be produced from the desktop control, uninstall/reinstall/restore from a fresh backup could not be completed.

## Persistence

After killing and relaunching `civicsuite-desktop.exe`, the reopened Tauri desktop still showed the `DIR084C-20260617022557` Clerk, Records, and Code evidence. The workflow store at `C:\Users\insty\AppData\Local\CivicSuite\Data\workflows\city-work.json` contains the run stamp and the Records unreadable path entries.
