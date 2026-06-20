# TESTER-DIRECTIVE-104

Purpose: rerun the clean-machine installed-app AI readiness gate after the product fix for TESTER-RESULT-103's empty local AI draft failure.

Communication channel:

- Write all results only to this repository and branch: `CivicSuite/civicsuite`, branch `stage-3a-baremetal-windows`, under `test-comms/`.
- Result file must be exactly `test-comms/TESTER-RESULT-104.md`.
- Do not use any old bridge folder, cloud-sync folder, chat, or side channel as the result channel.
- Before starting and before writing the result, record the live remote branch state with `git ls-remote origin refs/heads/stage-3a-baremetal-windows`, fetch it, and record `FETCH_HEAD`.

Artifact under test:

- CivicSuite head: `e5bb4c2925927f8c087a945c976074c60fd1552b`.
- Fix summary: writes a Gemma instruction template and stop tokens into the Ollama Modelfile and sends explicit Gemma turn markers with `raw=true`, bounded `num_predict`/`num_ctx`, and stop tokens for local `/api/generate` requests.
- Public prerelease: https://github.com/CivicSuite/civicsuite/releases/tag/windows-local-msi-ci-e5bb4c2
- MSI asset: `CivicSuite_0.1.0_x64_en-US.msi`
- MSI bytes: `1645243708`
- MSI SHA-256: `6535e5cb4ed8554f96998e44023f054bb416a7f40222925ce5eed79667d8c85d`
- Evidence asset: `CivicSuite-msi-evidence.txt`
- Evidence bytes: `578`
- Evidence SHA-256: `dd2867c1b81ac5d2fe8b9e540fc7276f46199f20cd0122fd9f21d4dc8bb9199e`
- Workflow run: `27868169219`

Why this directive exists:

- TESTER-RESULT-100 proved the clean installed MSI could install/setup the model path, but AI workflows timed out while Ollama was still decoding.
- Commit `4e3392761f195fd8ed88ca945478329d7b55d5ee` bounded local Ollama generation; TESTER-RESULT-101 then showed the timeout was fixed and product-managed Ollama returned `HTTP 200`.
- Commit `133874adcbbd89e4b2210faea85d62091acd7461` parsed Ollama-compatible generate response variants; TESTER-RESULT-102 then showed product-managed Ollama still returned `HTTP 200`, but the installed product tried to parse chunk-size lines such as `94` and `11` before persisting AI drafts.
- Commit `4e5626d89778e2d49968b2433c72c7117f5d5746` decoded chunked HTTP response bodies; TESTER-RESULT-103 showed the chunk-size parse failure no longer reproduced, but CivicRecords, CivicCode, and exposed CivicClerk still failed with `Local AI returned an empty draft.` after product-managed Ollama returned `HTTP 200`.
- This directive must prove whether `e5bb4c2` makes the real bundled Ollama/Gemma path produce and persist usable staff-review drafts by using an explicit Gemma instruction template and raw prompt contract.

Clean-machine start:

- Preferred: restore a clean VM snapshot that has no CivicSuite products, no CivicSuite user profile data, no CivicSuite runtime, no CivicSuite model cache, no stale MSI registration, and no pre-existing Ollama/Gemma model files.
- Bare-metal fallback is allowed only if VM snapshot restore is unavailable. Do not reboot the unattended tester machine. Instead, remove only CivicSuite products, services/processes, Program Files payload, user runtime/profile/cache/config/data, stale MSI registrations/product codes, prior CivicSuite backup/test artifacts, prior model cache files under CivicSuite paths, and prior CivicSuite Ollama model store paths. Verify no CivicSuite processes/services/products remain before install.
- Do not delete unrelated installed software.
- Do not instruct or perform a machine reboot on the unattended tester machine.

Required installed-app test:

1. Download the MSI and evidence assets from the public prerelease above. Verify bytes and SHA-256 exactly.
2. Install the MSI from a clean-machine state. Use elevated/admin Windows Installer access as needed.
3. Launch only the installed desktop app from `C:\Program Files\CivicSuite\civicsuite-desktop.exe`. Do not use dev preview routes, module browser URLs, or localhost module pages as workflow proof.
4. Complete first-run setup through product controls:
   - unsigned beta acknowledgement,
   - Windows SmartScreen explanation if surfaced,
   - local folders,
   - City Core module selection,
   - city profile,
   - first local admin,
   - backup default,
   - model download/checksum/load,
   - System Health,
   - finish/open app.
5. Prove the bundled Ollama runtime is installed or installable from the MSI payload:
   - Run product Install/Start/Check/Repair/Check controls for `model-runtime`.
   - Verify `runtime/ollama/ollama.exe` exists in Program Files payload and in the user runtime after install/repair.
   - Verify Ollama health endpoint is reachable through the product-managed runtime on port `15434`.
6. Prove the pinned Gemma model setup path from the installed app:
   - Use the installed app's model setup control to Download / Resume the pinned Gemma model.
   - Verify model file `gemma-4-12b-it-qat-q4_0.gguf` completes with exact bytes and SHA-256.
   - Required SHA-256: `faff1a63667fac17ac5e777f47114688fcefea96e220e211aaa8d62c2c4561f1`.
   - Verify partial `.part` files are absent or inactive after completion.
   - Use product controls to load/register the verified model into bundled Ollama.
   - Verify `civicsuite-gemma4-12b-qat:q4_0` appears in the product-managed Ollama model list.
   - Verify model data is stored under CivicSuite-managed local paths, not a random global developer path.
   - Capture the generated Modelfile if available and verify it includes Gemma turn markers and stop tokens.
7. Prove CivicCore model registry readiness:
   - Verify CivicCore records the model as registered/active/ready, including model id, checksum, runtime model name, and context window metadata if surfaced.
   - If the registry does not become ready, capture exact UI/API/log evidence and call this a failure.
8. Prove AI wiring through installed module workflows with marker `D104-AI-MODEL-MARKER-20260620`:
   - CivicRecords AI: create a fresh records workflow with search/citation evidence and run `suggest-records-response`. It must return a usable local-AI-backed staff-review draft within the product timeout, and the product state must persist the draft.
   - CivicCode: create/import a fresh code source tied to the marker and run `suggest-code-guidance`. It must return a usable local-AI-backed staff-review guidance draft within the product timeout, and the product state must persist the draft.
   - CivicClerk: create a fresh meeting workflow with agenda/notice/motion/vote/comment evidence and run `suggest-minutes-draft` if the action is exposed after model readiness. If exposed, it must return a usable local-AI-backed minutes draft within the product timeout and persist it. If CivicClerk AI remains optional/not exposed, record that explicitly without failing CivicRecords/CivicCode.
   - CivicNotice: confirm whether it declares or exposes any AI-backed flow. If none, record that it has no model need and do not invent a failure for CivicNotice.
9. Capture product-managed Ollama evidence after each AI action:
   - action duration,
   - HTTP status or product result,
   - relevant Ollama log tail,
   - Python/service log tail if available,
   - whether the generated text is bounded/usable rather than empty, chunk-parse failed, or timed out.
10. Restart/reopen proof:
   - Close the installed app normally.
   - Reopen the installed app.
   - Verify Ollama runtime starts or is recoverable through product controls.
   - Verify the model file remains present, checksum-valid, loaded/listed, and registered.
11. Backup/restore proof for model cache:
   - Run Backup Now.
   - Run Restore Latest Backup.
   - Verify the restore path preserves or safely skips/redownloads the model cache as designed.
   - Verify post-restore product Start/Check/Repair can recover model-runtime, CivicCore registry readiness, and required AI workflow access.

Failure reporting:

- If any step fails, `TESTER-RESULT-104.md` must say `Verdict: FAIL`.
- Include whether the failure is:
  - MSI did not install the Ollama runtime,
  - product controls did not materialize/repair Ollama,
  - model download control missing or gated incorrectly,
  - model download failed,
  - checksum failed,
  - model did not load into Ollama,
  - CivicCore registry did not register the model,
  - module AI workflow timed out,
  - module AI workflow returned unusable, empty, or chunk-parse-failed output,
  - module AI workflow did not persist output,
  - backup/restore lost unrecoverable model readiness,
  - external network/Hugging Face access issue,
  - admin/elevation/test-harness limitation.
- Include exact logs, screenshots, DOM/API captures, file paths, bytes, hashes, process/service state, and product-control transcripts.

Pass criteria:

- `TESTER-RESULT-104.md` may say `Verdict: PASS` only if the clean-machine installed app proves:
  - MSI installs and product controls recover bundled Ollama runtime,
  - Gemma model downloads completely through installed-app controls,
  - checksum matches the pinned SHA-256,
  - `civicsuite-gemma4-12b-qat:q4_0` is loaded in bundled Ollama,
  - CivicCore registry reports the model ready,
  - CivicRecords AI and CivicCode installed workflows produce local-AI-backed output tied to the marker within the product timeout,
  - CivicClerk AI produces local-AI-backed output if exposed,
  - reopen and restore do not lose model readiness or can recover it through product controls without developer intervention.
