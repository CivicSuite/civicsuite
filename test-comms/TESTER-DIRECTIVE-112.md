# TESTER-DIRECTIVE-112 — Confirm or refute the RESULT-111 Stage C findings (C6 / C3 / C2) with corrected automation, then finish C7 + C8

## Purpose

RESULT-111 settled first-run as working (Stage B passed end-to-end on the published 1.0.0). Source
root-cause indicates the three Stage C "failures" are most likely **test-automation artifacts**, not
product bugs. This directive **empirically confirms or refutes** each with corrected automation, then
runs the two lifecycle gates that were skipped (C7 backup/restore, C8 uninstall/reinstall). The box is
already in the post-Stage-B state: published 1.0.0 installed, first-run completed (admin created,
model loaded). **Continue from that state — do NOT wipe or reinstall** (except the explicit C8
uninstall/reinstall as the LAST step).

## STOP / LIMITS

> - **NEVER REBOOT.** No `Restart-Computer`/`shutdown`/logoff. Every msiexec uses
>   `/qn /norestart REBOOT=ReallySuppress MSIRESTARTMANAGERCONTROL=Disable`. MSI exit **3010** or a
>   reboot-pending flag → **STOP, record `environment/blocker`, do NOT reboot, do NOT retry.**
> - **Do NOT wipe / reinstall** except the explicit C8 step. **No first-run reset.** Continue from
>   the current installed state.
> - Push only to `stage-3a-baremetal-windows`. Result file = `test-comms/TESTER-RESULT-112.md`. No
>   merge to main, no OneDrive. Record `git ls-remote` + `FETCH_HEAD` before start and before result.
> - Run the gates in order; the non-destructive C6/C3/C2/C7 BEFORE the destructive C8, so a C8
>   problem cannot erase the C6/C3 answer.

## State-dir consistency (critical for C6)

The app's state lives ONLY at `%LOCALAPPDATA%\CivicSuite\` (the product resolves it from
`%LOCALAPPDATA%`, with no working-dir/exe-relative fallback; the env override
`CIVICSUITE_DESKTOP_STATE_DIR` is test-only and must NOT be set). Before anything:
- Record `echo $env:CIVICSUITE_DESKTOP_STATE_DIR` (must be empty) and `echo $env:LOCALAPPDATA`.
- Every launch in this directive must be the **installed exe with the SAME `%LOCALAPPDATA%`** and no
  custom `--user-data-dir`/state override. If you enable WebView2 remote-debugging for reading state,
  set ONLY `WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS=--remote-debugging-port=9222 --remote-allow-origins=*`
  — do NOT add `--user-data-dir` and do NOT change `%LOCALAPPDATA%`/state env between launches.

## C6 — Reopen persistence (the only possible real blocker)

1. **On-disk truth:** read `%LOCALAPPDATA%\CivicSuite\config\first-run-progress.json` verbatim into
   the result. Does `completed_step_ids` include the final step (`finish` / the `open-app` step id)?
   Is it valid JSON (not truncated)? Capture `first-admin.json` presence too. Save raw file +
   byte size + a directory listing under `directive112-evidence/C6-progress-on-disk.json`.
2. **Backend finished from disk:** with the app NOT running, then launched normally, read
   `get_app_state` → `first_run.finished` and `first_run.current_step_id`. (This is a disk-backed read.)
3. **Normal relaunch test:** fully close the installed app; relaunch the installed exe
   `C:\Program Files\CivicSuite\civicsuite-desktop.exe` NORMALLY (same `%LOCALAPPDATA%`, no state
   override); read `first_run.finished` and whether the first-run wizard is shown. Repeat once more
   (two clean close→relaunch cycles).
4. **Verdict for C6:**
   - **PASS (artifact confirmed):** on-disk progress contains `finish`, and `finished` stays `true`
     with the wizard NOT shown across both normal relaunches. (Expected — shipped code is correct.)
   - **FAIL (REAL blocker):** on-disk progress is missing `finish` after a clean finish, OR `finished`
     flips to false / the wizard reappears across a normal same-state-dir relaunch. Capture the exact
     on-disk file contents before and after, the launch commands, and `%LOCALAPPDATA%` used each time.

## C3 — CivicCode import persistence (complete the two-step guided-review handshake)

1. Confirm `civiccode` is enabled in the installed profile (it is in city-core). 
2. Drive the import as the product intends — **two steps**: fill the import form (title, citation,
   source reference, imported-by, body — all required), click the primary
   `[data-work-action="import-code-source"]` button → a guided **review panel** appears (no backend
   call yet, no error). THEN click the confirm control `[data-review-confirm="import-code-source"]`.
3. Assert `city_work.code_sources.length > 0` (via `get_app_state`/the city-work state), and that it
   SURVIVES a fresh state read (reload). Capture before/after JSON under
   `directive112-evidence/C3-code-sources.json`.
4. **Verdict:** PASS if the source persists after the confirm step. If it still does NOT persist
   after a correct two-click handshake with all required fields, capture any error toast/log and the
   exact payload → REAL bug (record it).

## C2 — CivicRecords marker provenance (not an echo test)

The LLM is not required to echo an opaque marker. Verify **provenance** instead: in the persisted
records request used for the AI draft, confirm `records_requests[*].summary` and/or `search_notes`
still contain `D111-AI-MODEL-MARKER-20260625` (proves the marker reached the prompt context and was
persisted), and that a non-empty local-AI `response_draft` exists generated by
`civicsuite-gemma4-12b-qat:q4_0`. Capture under `directive112-evidence/C2-provenance.json`.
**Verdict:** PASS if the marker is present in the persisted request inputs and a real AI draft exists.

## C7 — Backup / restore (was skipped)

Run **Backup Now**, then **Restore Latest Backup** (exercise the restore confirm gate). After restore,
confirm via product controls that runtime/model/registry recover and the app is usable. Capture under
`directive112-evidence/C7-backup-restore.json`.

## C8 — MSI uninstall / reinstall (LAST; destructive but no reboot)

Stop CivicSuite processes first. Uninstall the published product (ProductCode
`{7BE25830-15EE-4797-A25F-DF614ACA9B8E}`) with
`msiexec /x {7BE25830-15EE-4797-A25F-DF614ACA9B8E} /qn /norestart REBOOT=ReallySuppress MSIRESTARTMANAGERCONTROL=Disable /l*v directive112-evidence\C8-uninstall.log`.
Exit 0 = clean; **exit 3010 = STOP/blocker, do not reboot, do not retry.** Then reinstall the SAME
published MSI (`CivicSuite_0.1.0_x64_en-US.msi`, bytes 1645426125, SHA-256
`2e5b163c7737b3534d2e5eef4fe9fd87a6af9ed0509e54b072ae7caa22db27ac`) the same way and verify install
exit 0, no stale same-version registration failure, and the app launches. Capture logs + product
registration before/after.

## Verdict (top of result)

- `Verdict: PASS` — C6 durable (artifact confirmed), C3 persists via the correct handshake, C2
  provenance present, C7 backup/restore recovers, C8 uninstall/reinstall clean. → 1.0.0 lifecycle is
  beta-clear (UX-cue fix tracked separately in PR #194).
- `Verdict: FAIL` — any of: C6 real durability loss (REAL blocker), C3 still won't persist after a
  correct handshake, C7 unrecoverable, or C8 stale-registration/3010. Classify and capture evidence.

## Hard limits

No reboot. No first-run reset. No wipe/reinstall except C8. Push only to
`stage-3a-baremetal-windows`. No merge to main. Never touch OneDrive.
