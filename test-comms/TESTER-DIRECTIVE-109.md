# TESTER-DIRECTIVE-109

Purpose: **First clean-machine verification of the PUBLISHED Windows Local 1.0.0 release.**
Bare-metal wipe the tester box (it is expendable), then install the **published GitHub release
MSI** (not a branch bootstrapper, not the D107 `0.1.0` prerelease currently installed) from a
genuinely clean state, and prove the full installed-app lifecycle including a **fresh
Hugging-Face model re-download**. This is the gate that lets us honestly announce 1.0.0 beta.

This directive **supersedes the standing `check repo` full-install procedure for this cycle.**
Do NOT run `installer\dist\*.cmd` or `civicsuite-baremetal-bootstrap.ps1`; the artifact under
test is the **published release asset**, downloaded from GitHub.

## Communication channel

- Write your result only to `CivicSuite/civicsuite`, branch `stage-3a-baremetal-windows`, under
  `test-comms/`. Result file must be exactly `test-comms/TESTER-RESULT-109.md`.
- No old bridge folder, cloud-sync folder, chat, or side channel. Your only acknowledgment is the
  pushed result file — never a chat summary.
- Before you start and again before you write the result, record `git ls-remote origin
  refs/heads/stage-3a-baremetal-windows`, fetch it, and record `FETCH_HEAD`.

## DO NOT REBOOT (hard rule)

The operator is in and out of the lab; an unattended reboot can cost hours of dev time. **Do not
reboot this machine.** If any step appears to require a reboot to proceed, STOP, write
`TESTER-RESULT-109.md` documenting exactly where and why a reboot was needed, and push that as a
blocker. Do not reboot to "fix" it.

## Stage A — Bare-metal clean (box is expendable)

Goal: a machine with **no CivicSuite remnants** and ample free disk, **without** removing the OS,
the Codex app, or this repo clone (the channel).

1. **Stop CivicSuite processes/state first:** terminate `civicsuite-desktop.exe`, the CivicSuite
   runtime `ollama.exe` (port 15434), CivicSuite runtime `postgres.exe`, and CivicSuite runtime
   `python.exe`. Also **stop** any standalone user Ollama (port 11434) for the duration of this
   test so it cannot contaminate which runtime/model serves the product — you may stop it without
   uninstalling it.
2. **Uninstall the current CivicSuite product:** MSI ProductCode `{5C23B582-9CF3-4A7A-AD0C-E2B9C9F679EA}`
   (DisplayVersion `0.1.0`, the D107 prerelease). Use elevated Windows Installer as needed (the
   installer self-elevates a separate `powershell.exe`; Codex itself stays non-admin — that's fine).
3. **Delete all CivicSuite state:** `C:\Program Files\CivicSuite\` (payload + `civicsuite-desktop.exe`),
   `%LOCALAPPDATA%\CivicSuite\` in full (`config`, `Data` — **including the cached
   `gemma-4-12b-it-qat-q4_0.gguf` and its `.sha256.verified`/`.Modelfile` sidecars** — `runtime`,
   and any backups), and any stale CivicSuite MSI registrations/product codes / leftover
   `directive1NN-evidence/` folders from prior runs. We WANT the model gone — this is the
   re-download test.
4. **Free disk (expendable box):** remove unrelated bulk content that is **not** OS, **not** the
   Codex app, and **not** this repo clone — e.g. downloads, torrent/qBittorrent data, other large
   user files, temp caches. Target **≥ 60 GB free on C:** so the 1.65 GB MSI + ~7 GB fresh model +
   headroom fit comfortably. (Current state was ~42.9 GB free with ~15.6 GB of CivicSuite state, so
   the CivicSuite removal alone gets most of the way.)
5. **Verify clean before install:** no CivicSuite processes, services, installed product,
   registrations, Program Files payload, `%LOCALAPPDATA%\CivicSuite`, or model cache remain.
   Record `(Get-CimInstance Win32_ComputerSystem).HypervisorPresent` and free disk. Do not inject
   or correct host facts.

## Stage B — Install the PUBLISHED 1.0.0 release MSI

1. Download both assets from the published release:
   `https://github.com/CivicSuite/civicsuite/releases/tag/civicsuite-windows-local-v1.0.0`
   - MSI: `CivicSuite_0.1.0_x64_en-US.msi` — bytes `1645426125`,
     SHA-256 `2e5b163c7737b3534d2e5eef4fe9fd87a6af9ed0509e54b072ae7caa22db27ac`
   - Evidence: `CivicSuite-msi-evidence.txt` — bytes `578`,
     SHA-256 `50066579da06b5ad378b957ca181752f030e7c71c1738732d40cac376548d16e`
   - **Verify bytes and SHA-256 of BOTH exactly before installing.** (Naming caveat: product is
     1.0.0, MSI filename/version is internal `0.1.0`; UpgradeCode `a63fc1d3-5437-5f55-89a2-fef93fb1f930`.)
2. Install the MSI from the clean state (elevated). Launch only the installed desktop from
   `C:\Program Files\CivicSuite\civicsuite-desktop.exe` — not dev preview routes or localhost module
   pages.
3. Complete first-run setup through product controls: unsigned-beta acknowledgement, SmartScreen
   explanation if surfaced, local folders, **City Core** module selection, city profile, first
   local admin, backup default, model setup, System Health, finish/open.

## Stage C — Installed-app lifecycle proof (marker `D109-AI-MODEL-MARKER-20260625`)

1. **Bundled Ollama:** product Install/Start/Check/Repair for `model-runtime`; verify
   `runtime/ollama/ollama.exe` present in Program Files payload and user runtime; product-managed
   Ollama health reachable on port `15434`.
2. **Fresh Gemma download from Hugging Face (the core of this directive):** through installed-app
   controls, download `gemma-4-12b-it-qat-q4_0.gguf` **from scratch** (cache was wiped). Confirm the
   pull resolves against the pinned Google HF repo (`hf.co/google/gemma-4-12B-it-qat-q4_0-gguf:Q4_0`
   / resolve URL on huggingface.co). Capture: at least one resume/retry behaves correctly, final
   bytes `6975877728`, independent SHA-256 == `faff1a63667fac17ac5e777f47114688fcefea96e220e211aaa8d62c2c4561f1`,
   no `.part` left active, and the old `Could not remove invalid partial model download … os error 2`
   does NOT appear. Then Load/register into bundled Ollama; verify `civicsuite-gemma4-12b-qat:q4_0`
   in `/api/tags`; capture the generated Modelfile (Gemma turn markers + stop tokens).
3. **CivicCore model registry readiness:** model registered/active/ready (id, checksum, runtime
   model name, context window if surfaced). If it never becomes ready, capture evidence and FAIL.
4. **Module AI/no-AI workflows tied to `D109-AI-MODEL-MARKER-20260625`:**
   - CivicRecords AI: fresh records workflow with search/citation evidence → `suggest-records-response`
     returns a usable local-AI staff-review response-letter draft within the product timeout,
     responds to the marker, persists, with no `LLM generation failed` / fallback-template log.
   - CivicCode: fresh code source tied to the marker → `suggest-code-guidance` returns a usable
     local-AI guidance draft within timeout and persists.
   - CivicClerk: fresh meeting workflow (agenda/notice/motion/vote/comment) → Generate Local AI
     Minutes / `suggest-minutes-draft` if exposed → usable local-AI minutes draft tied to the marker
     within the product timeout, persisted. If not exposed, record explicitly with why.
   - CivicNotice: confirm whether it exposes any AI flow. If none, record no-AI-needed; do not
     invent a failure.
5. **After each AI action capture:** action duration, HTTP/product status, Ollama log tail,
   Python/service log tail if available, and whether the text is bounded/usable (not empty,
   template fallback, chunk-parse-failed, or timed out).
6. **Reopen proof:** close the app normally; reopen; verify Ollama starts/recoverable via product
   controls, model file present + checksum-valid + loaded/listed + registered.
7. **Backup/Restore proof:** Backup Now → Restore Latest Backup (exercise the restore confirm
   gate); verify post-restore product Start/Check/Repair recovers model-runtime, CivicCore registry,
   and Records/Code/Clerk AI access (if exposed).
8. **MSI uninstall/reinstall proof:** uninstall the 1.0.0 MSI, then reinstall the same published
   MSI; verify no stale same-version registration failure and the app returns to a working state.

## Failure reporting

If any step fails, `TESTER-RESULT-109.md` must say `Verdict: FAIL` and classify it (asset
hash/bytes mismatch; clean-state not achieved; MSI did not install; product did not materialize/
repair Ollama; model download control missing/gated; HF download failed; checksum failed; resume
lost the partial or surfaced the old cleanup error; model did not load into Ollama; CivicCore
registry did not register; CivicRecords logged `LLM generation failed` or fell back to template;
CivicClerk minutes timed out; any module AI output unusable/empty/template/chunk-parse-failed or
not persisted; backup/restore lost unrecoverable readiness; uninstall/reinstall stale-registration
failure; network/HF access issue; admin/elevation/test-harness limitation; **reboot required —
stopped per hard rule**). Include exact logs, screenshots, DOM/API captures, paths, bytes, hashes,
process/service state, and product-control transcripts under `directive109-evidence/`.

## Pass criteria

`Verdict: PASS` only if the **clean-machine install of the PUBLISHED 1.0.0 MSI** proves: assets
match pinned bytes/SHA-256; MSI installs from a verified-clean state and product controls recover
bundled Ollama; the Gemma model **downloads fresh from Hugging Face** through installed-app
controls; checksum matches the pinned SHA-256 with no stale-partial error; `civicsuite-gemma4-12b-qat:q4_0`
loads in bundled Ollama; CivicCore registry reports the model ready; CivicRecords and CivicCode
produce marker-tied local-AI output within the product timeout (no fallback-template log);
CivicClerk Generate Local AI Minutes produces marker-tied output within the product timeout if
exposed; CivicNotice remains no-AI-needed unless it exposes an AI control; reopen, backup/restore,
and uninstall/reinstall all preserve or cleanly recover readiness without developer intervention —
**and no reboot was performed.**

## Hard limits

No reboot (see hard rule). No merge to main, no tags, no `modules.json`/status/source edits. Push
only to `stage-3a-baremetal-windows`. Never touch any OneDrive path.
