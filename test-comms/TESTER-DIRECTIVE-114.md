# TESTER-DIRECTIVE-114 — Validate the FIXED 1.0.x MSI (first-run UX cue + honest model-registry label) on a clean machine, then finish C8

## Purpose

Validate the patched build that merged to `main` (`4d5a3f0b`, PR #194): the first-run wizard now
makes the current step the unmistakable action point (auto-scroll + focus the first empty field +
an "Action needed" affordance), and the model-registry readiness is honestly labeled "local model
registry" (no longer "registered with CivicCore"). Prove it on a clean machine, complete the full
lifecycle, and run the **C8 uninstall/reinstall** gate that was env-blocked last time (the box has
since been rebooted, so the pending-file-rename flag should be clear).

## STOP / LIMITS — read first

> - **This supersedes the standing `check repo` full-install procedure.** Do NOT run
>   `installer\dist\*.cmd`, `civicsuite-baremetal-bootstrap.ps1`, or install the branch artifact.
>   The artifact under test is the **fix-MSI prerelease** named in Stage 0 — nothing else.
> - **NEVER REBOOT.** No Restart/shutdown/logoff. Every msiexec uses
>   `/qn /norestart REBOOT=ReallySuppress MSIRESTARTMANAGERCONTROL=Disable`. MSI exit **3010** or a
>   reboot-pending flag → STOP, record `environment/blocker`, do NOT reboot, do NOT retry.
> - Push only to `stage-3a-baremetal-windows`. Result = `test-comms/TESTER-RESULT-114.md`. Record
>   `git ls-remote` + `FETCH_HEAD` before start and before result. Same `%LOCALAPPDATA%` throughout;
>   do not set `CIVICSUITE_DESKTOP_STATE_DIR` or a custom `--user-data-dir`.

## Stage 0 — GATE: wait for the fix-MSI prerelease (do nothing destructive until it exists)

The fix-MSI is still building. **Do not clean, install, or change anything until the prerelease
exists.** On each `check repo` / heartbeat:

1. Check whether the tag/prerelease **`windows-local-msi-firstrun-fix-rc1`** exists in
   `CivicSuite/civicsuite`:
   `git ls-remote --tags origin windows-local-msi-firstrun-fix-rc1` (non-empty = it exists), or the
   GitHub API `repos/CivicSuite/civicsuite/releases/tags/windows-local-msi-firstrun-fix-rc1`.
2. **If it does NOT exist yet:** STAND BY. Do nothing — no clean, no install, no reboot, no result
   file. Just wait for the next heartbeat and re-check. (This is the expected state right after this
   directive is posted.)
3. **Only when the prerelease exists AND has a `*.msi` asset:** proceed to Stage A.

## Stage A — Bare-metal clean (box is rebooted; pending-rename should be clear)

Remove all prior CivicSuite product/state from the earlier directives so the fix-MSI installs clean:
stop CivicSuite processes (desktop/runtime ollama/postgres/python) and any standalone Ollama;
uninstall the currently-installed CivicSuite product (find its ProductCode by DisplayName); delete
`C:\Program Files\CivicSuite\`, `%LOCALAPPDATA%\CivicSuite\` (config/Data/runtime/backups, incl. the
model cache — we re-test the fresh download), stale registrations, and prior `directive1NN-evidence/`
folders. Verify no CivicSuite product/process/registration/payload/model remains. Record free disk
and `HypervisorPresent`. If uninstall hits exit 3010 / reboot-pending → STOP, blocker, do not reboot.

## Stage B — Install the fix-MSI from the prerelease

Download the `*.msi` and `*evidence*.txt` assets from the `windows-local-msi-firstrun-fix-rc1`
prerelease (public release download URLs). **Verify the MSI's SHA-256 equals the `SHA256=` line in
the evidence file** (self-consistency) and record bytes + SHA-256 of both. Install the MSI elevated
(`/qn /norestart REBOOT=ReallySuppress`). Launch only the installed
`C:\Program Files\CivicSuite\civicsuite-desktop.exe`.

## Stage C — Validate the FIX, then the full lifecycle (marker `D114-AI-MODEL-MARKER-20260625`)

1. **First-run UX cue (the headline fix):** drive first-run via the WebView2 DevTools Protocol
   (`--remote-debugging-port=9222`; WM_ messages don't work). After completing **module selection**,
   capture and confirm — BEFORE doing anything else — that the wizard now makes the next step obvious:
   - the current step is `city-profile`, its `.first-run-step.current` is **scrolled into view**,
   - the **first empty field (`cityName`) has focus** (`document.activeElement`),
   - an **"Action needed"** affordance is visible on the current step.
   Save `directive114-evidence/C1-firstrun-cue.json` (+ screenshot). If the cue is absent, that's a
   FAIL of the fix.
2. **Complete first-run** through the forms: city-profile → first-admin → sign-in → backup → model
   (fresh HF Gemma download, SHA-256 `faff1a63667fac17ac5e777f47114688fcefea96e220e211aaa8d62c2c4561f1`,
   load into Ollama `civicsuite-gemma4-12b-qat:q4_0` on 15434) → health → finish.
3. **Honest model-registry label:** confirm the model-registry readiness now reads **"Local model
   registry"** and the verified state says **"registered in the local model registry"** (NOT
   "registered with CivicCore"). Save `directive114-evidence/C3-registry-label.json`.
4. **Reopen durability:** close + relaunch normally (same `%LOCALAPPDATA%`); confirm `first_run.finished`
   stays true and no wizard reappears (single-instance flow — should persist).
5. **Module AI/no-AI (marker `D114-AI-MODEL-MARKER-20260625`):** CivicRecords `suggest-records-response`;
   CivicCode `import-code-source` via the two-step guided-review confirm, then `suggest-code-guidance`;
   CivicClerk Generate Local AI Minutes if exposed; CivicNotice no-AI.
6. **Backup Now / Restore Latest Backup** (wait for `backup-manifest.json` before restore).
7. **C8 — MSI uninstall / reinstall** (the previously-blocked gate): uninstall the fix-MSI product,
   then reinstall the same fix-MSI; verify no stale same-version registration failure, no reboot.

## Verdict (top of result)

- `Verdict: PASS` — fix-MSI assets self-consistent; clean install; **first-run cue present** (scroll
  + focus + affordance); first-run completes; **label reads "local model registry"**; reopen durable;
  module AI/no-AI good; backup/restore recovers; C8 uninstall/reinstall clean — all with no reboot.
- `Verdict: FAIL` — classify: cue absent (fix regression); first-run can't complete; label still says
  "CivicCore"; reopen loses finish; any module/backup/restore failure; C8 stale-registration/3010;
  HF/network/admin/test-harness limitation. Capture exact evidence under `directive114-evidence/`.

## Hard limits

No reboot. No standing full-install. No install before the Stage 0 prerelease exists. Push only to
`stage-3a-baremetal-windows`. No merge to main. Never touch OneDrive.
