# TESTER-DIRECTIVE-100

Purpose: run the clean-machine installed-app AI readiness gate that was not proven by TESTER-RESULT-099.

Communication channel:

- Write all results only to this repository and branch: `CivicSuite/civicsuite`, branch `stage-3a-baremetal-windows`, under `test-comms/`.
- Result file must be exactly `test-comms/TESTER-RESULT-100.md`.
- Do not use any old bridge folder, cloud-sync folder, chat, or side channel as the result channel.
- Before starting and before writing the result, record the live remote branch state with `git ls-remote origin refs/heads/stage-3a-baremetal-windows`, fetch it, and record `FETCH_HEAD`.

Artifact under test:

- PR/head: CivicSuite PR #192 final head `9a9c9dddb39a55511a2b61c046063cfe6ca7f468`, merged to `main` as `9696b81a7f1b1a7810ee6ea43a020ffbc313bba7`.
- Public prerelease: https://github.com/CivicSuite/civicsuite/releases/tag/windows-local-msi-ci-9a9c9dd
- MSI asset: `CivicSuite_0.1.0_x64_en-US.msi`
- MSI bytes: `1645243708`
- MSI SHA-256: `ae9482bd9b0e3b239bec2a9386a73bddbee9e1e2119e506d21c9f5fe1921d94e`
- Evidence asset: `CivicSuite-msi-evidence.txt`
- Evidence bytes: `578`
- Evidence SHA-256: `0fea98e297a3ab551b5bc043171f8c9c1784d1edf811efb77a6f5ee5f71625fa`
- Workflow run: `27851472530`

Why this directive exists:

- TESTER-RESULT-099 passed the installed MSI lifecycle, service recovery, Backup Now, support bundle, Clerk/Records/Code durability, Restore Latest Backup, and post-restore visibility.
- However, TESTER-RESULT-099 also showed the local model file was not downloaded: `0.0 GB of 6.5 GB`, status `Needs download`, checksum `Needs verification`.
- TESTER-RESULT-099 showed bundled Ollama runtime health was OK, but `civicsuite-gemma4-12b-qat:q4_0` was not loaded and CivicCore model registry remained unregistered because the GGUF file was absent.
- Do not count TESTER-RESULT-099 as proving AI readiness. This directive must prove or fail the full installed AI setup path.

Clean-machine start:

- Preferred: restore a clean VM snapshot that has no CivicSuite products, no CivicSuite user profile data, no CivicSuite runtime, no CivicSuite model cache, no stale MSI registration, and no pre-existing Ollama/Gemma model files.
- Bare-metal fallback is allowed only if VM snapshot restore is unavailable. Do not reboot the unattended tester machine. Instead, remove only CivicSuite products, services/processes, Program Files payload, user runtime/profile/cache/config/data, stale MSI registrations/product codes, prior CivicSuite backup/test artifacts, prior model cache files under CivicSuite paths, and prior CivicSuite Ollama model store paths. Verify no CivicSuite processes/services/products remain before install.
- Do not delete unrelated installed software.
- Do not instruct or perform a machine reboot on the unattended tester machine.

Required installed-app test:

1. Download the MSI and evidence assets from the public prerelease above. Verify bytes and SHA-256 exactly.
2. Install the MSI from a clean-machine state. Use elevated/admin Windows Installer access as needed.
3. Launch only the installed desktop app from `C:\Program Files\CivicSuite\civicsuite-desktop.exe`. Do not use dev preview routes, module browser URLs, or localhost module pages as workflow proof.
4. In System Health, prove the bundled Ollama runtime is installed or installable from the MSI payload:
   - Run product Install/Start/Check/Repair/Check controls for `model-runtime`.
   - Verify `runtime/ollama/ollama.exe` exists in Program Files payload and in the user runtime after install/repair.
   - Verify Ollama health endpoint is reachable through the product-managed runtime.
5. Prove the model setup path from the installed app:
   - Use the installed app's model setup control to Download / Resume the pinned Gemma model.
   - Wait for the model file download to complete. The expected file is `gemma-4-12b-it-qat-q4_0.gguf`.
   - Verify expected model bytes are approximately the manifest size and record exact bytes.
   - Verify SHA-256 equals `faff1a63667fac17ac5e777f47114688fcefea96e220e211aaa8d62c2c4561f1`.
   - Verify partial `.part` files are absent or inactive after completion.
6. Prove the model is loaded into bundled Ollama:
   - Use the installed app model setup control to load/register the verified model into the local Ollama runtime.
   - Verify `civicsuite-gemma4-12b-qat:q4_0` appears in the Ollama model list.
   - Verify model data is stored under CivicSuite-managed local paths, not a random global developer path.
7. Prove CivicCore model registry readiness:
   - Verify CivicCore records the model as registered/active/ready, including model id, checksum, runtime model name, and context window metadata if surfaced.
   - If the registry does not become ready, capture exact UI/API/log evidence and call this a failure.
8. Prove AI wiring through installed module workflows:
   - CivicRecords AI: run an installed-app records workflow that uses AI drafting/search assistance and produces output tied to marker `D100-AI-MODEL-MARKER-20260620`.
   - CivicCode: run an installed-app code guidance/search workflow that uses local AI and produces output tied to marker `D100-AI-MODEL-MARKER-20260620`.
   - CivicClerk: if available after model readiness, run an installed-app minutes drafting assistance flow and capture whether it produces model-backed output tied to the marker. If CivicClerk AI remains optional/not exposed, record that explicitly without failing CivicRecords/CivicCode.
   - CivicNotice: confirm whether it declares or exposes any AI-backed flow. If none, record that it has no model need and do not invent a failure for CivicNotice.
9. Restart/reopen proof:
   - Close the installed app normally.
   - Reopen the installed app.
   - Verify Ollama runtime starts or is recoverable through product controls.
   - Verify the model file remains present, checksum-valid, loaded/listed, and registered.
10. Backup/restore proof for model cache:
   - Run Backup Now.
   - Run Restore Latest Backup.
   - Verify the restore path preserves or safely skips/redownloads the model cache as designed.
   - Verify post-restore product Start/Check/Repair can recover model-runtime, CivicCore registry readiness, and required AI workflow access.

Failure reporting:

- If any step fails, `TESTER-RESULT-100.md` must say `Verdict: FAIL`.
- Include whether the failure is:
  - MSI did not install the Ollama runtime,
  - product controls did not materialize/repair Ollama,
  - model download control missing or gated incorrectly,
  - model download failed,
  - checksum failed,
  - model did not load into Ollama,
  - CivicCore registry did not register the model,
  - module AI workflow did not use the local model,
  - external network/Hugging Face access issue,
  - admin/elevation/test-harness limitation.
- Include exact logs, screenshots, DOM/API captures, file paths, bytes, hashes, process/service state, and product-control transcripts.

Pass criteria:

- `TESTER-RESULT-100.md` may say `Verdict: PASS` only if the clean-machine installed app proves:
  - MSI installs and product controls recover bundled Ollama runtime,
  - Gemma model downloads completely through installed-app controls,
  - checksum matches the pinned SHA-256,
  - `civicsuite-gemma4-12b-qat:q4_0` is loaded in bundled Ollama,
  - CivicCore registry reports the model ready,
  - CivicRecords AI and CivicCode installed workflows produce local-AI-backed output tied to the marker,
  - reopen and restore do not lose model readiness or can recover it through product controls without developer intervention.
