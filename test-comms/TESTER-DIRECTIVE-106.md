# TESTER-DIRECTIVE-106

Purpose: rerun the clean-machine installed-app AI readiness gate after the CivicRecords response-letter local AI runtime pin fix for TESTER-RESULT-105.

Communication channel:

- Write all results only to this repository and branch: `CivicSuite/civicsuite`, branch `stage-3a-baremetal-windows`, under `test-comms/`.
- Result file must be exactly `test-comms/TESTER-RESULT-106.md`.
- Do not use any old bridge folder, cloud-sync folder, chat, or side channel as the result channel.
- Before starting and before writing the result, record the live remote branch state with `git ls-remote origin refs/heads/stage-3a-baremetal-windows`, fetch it, and record `FETCH_HEAD`.

Artifact under test:

- CivicSuite head: `d578828304a869b57116c0a33870429dd78671ad`.
- CivicRecords AI runtime head pinned by the MSI workflows: `e2208827b660faa7d3fc1eab2271a8eae18526ee`.
- Fix summary: CivicRecords response-letter generation now uses the product `LLM_MODEL` pin, Gemma raw turn markers, bounded `num_predict`/`num_ctx`, stop tokens, and robust Ollama response parsing instead of falling back to a template when the installed product-managed model is ready.
- Public prerelease: https://github.com/CivicSuite/civicsuite/releases/tag/windows-local-msi-ci-d578828
- MSI asset: `CivicSuite_0.1.0_x64_en-US.msi`
- MSI bytes: `1645276476`
- MSI SHA-256: `43cb0ebfd14d0396d8df87e5a6561fb7f3aa026d4e5a36736eb973bcc67cf772`
- Evidence asset: `CivicSuite-msi-evidence.txt`
- Evidence bytes: `578`
- Evidence SHA-256: `5e51811ca8dca41aeb3285953743f4aa4d704f607fafea540c02ee8b8c2f0c28`
- Artifact ZIP SHA-256: `d7f35ecca728a785a6b2f8759c72cc064b61c4557b64aaf489a308fd115bfc27`
- Workflow run: `27875557336`

Why this directive exists:

- TESTER-RESULT-105 proved bundled Ollama/Gemma install, checksum, load, and CivicCode local AI output.
- TESTER-RESULT-105 failed because CivicRecords response-letter generation logged `LLM generation failed, falling back to template`, did not prove the fixed `D105-AI-MODEL-MARKER-20260620` marker through Records, and did not complete backup/restore proof.
- This directive must prove the installed MSI with CivicRecords runtime `e2208827` produces real local-AI-backed CivicRecords response-letter output and then preserves or recovers model readiness through reopen and restore.

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
   - Verify the old invalid partial cleanup error does not appear: `Could not remove invalid partial model download ... os error 2`.
   - Use product controls to load/register the verified model into bundled Ollama.
   - Verify `civicsuite-gemma4-12b-qat:q4_0` appears in the product-managed Ollama model list.
   - Verify model data is stored under CivicSuite-managed local paths, not a random global developer path.
   - Capture the generated Modelfile if available and verify it includes Gemma turn markers and stop tokens.
7. Prove CivicCore model registry readiness:
   - Verify CivicCore records the model as registered/active/ready, including model id, checksum, runtime model name, and context window metadata if surfaced.
   - If the registry does not become ready, capture exact UI/API/log evidence and call this a failure.
8. Prove installed module AI workflows with marker `D106-AI-MODEL-MARKER-20260620`:
   - CivicRecords AI: create a fresh records workflow with search/citation evidence and run `suggest-records-response`. It must return a usable local-AI-backed staff-review response-letter draft within the product timeout, include or clearly respond to the marker, persist the draft in product state, and show no `LLM generation failed` or fallback-template log for this action.
   - CivicCode: create/import a fresh code source tied to the marker and run `suggest-code-guidance`. It must return a usable local-AI-backed staff-review guidance draft within the product timeout and persist the draft.
   - CivicClerk: create a fresh meeting workflow with agenda/notice/motion/vote/comment evidence and run `suggest-minutes-draft` if the action is exposed after model readiness. If exposed, it must return a usable local-AI-backed minutes draft within the product timeout and persist it. If CivicClerk AI remains optional/not exposed, record that explicitly without failing CivicRecords/CivicCode.
   - CivicNotice: confirm whether it declares or exposes any AI-backed flow. If none, record that it has no model need and do not invent a failure for CivicNotice.
9. Capture product-managed Ollama evidence after each AI action:
   - action duration,
   - HTTP status or product result,
   - relevant Ollama log tail,
   - Python/service log tail if available,
   - whether the generated text is bounded/usable rather than empty, template fallback, chunk-parse failed, or timed out.
10. Restart/reopen proof:
   - Close the installed app normally.
   - Reopen the installed app.
   - Verify Ollama runtime starts or is recoverable through product controls.
   - Verify the model file remains present, checksum-valid, loaded/listed, and registered.
11. Backup/restore proof for model cache:
   - Run Backup Now.
   - Run Restore Latest Backup.
   - Verify the restore path preserves or safely skips/redownloads the model cache as designed.
   - Verify post-restore product Start/Check/Repair can recover model-runtime, CivicCore registry readiness, CivicRecords response-letter AI access, and CivicCode AI access.

Failure reporting:

- If any step fails, `TESTER-RESULT-106.md` must say `Verdict: FAIL`.
- Include whether the failure is:
  - MSI did not install the Ollama runtime,
  - product controls did not materialize/repair Ollama,
  - model download control missing or gated incorrectly,
  - model download failed,
  - checksum failed,
  - model retry/resume lost the partial file or surfaced the old missing-file cleanup error,
  - model did not load into Ollama,
  - CivicCore registry did not register the model,
  - CivicRecords response-letter workflow logged `LLM generation failed`,
  - CivicRecords response-letter workflow fell back to a template,
  - module AI workflow timed out,
  - module AI workflow returned unusable, empty, template fallback, or chunk-parse-failed output,
  - module AI workflow did not persist output,
  - backup/restore lost unrecoverable model readiness,
  - external network/Hugging Face access issue,
  - admin/elevation/test-harness limitation.
- Include exact logs, screenshots, DOM/API captures, file paths, bytes, hashes, process/service state, and product-control transcripts.

Pass criteria:

- `TESTER-RESULT-106.md` may say `Verdict: PASS` only if the clean-machine installed app proves:
  - MSI installs and product controls recover bundled Ollama runtime,
  - Gemma model downloads completely through installed-app controls,
  - checksum matches the pinned SHA-256,
  - no old invalid partial cleanup error appears,
  - `civicsuite-gemma4-12b-qat:q4_0` is loaded in bundled Ollama,
  - CivicCore registry reports the model ready,
  - CivicRecords response-letter AI produces local-AI-backed output tied to the marker within the product timeout with no fallback-template log,
  - CivicCode installed workflow produces local-AI-backed output tied to the marker within the product timeout,
  - CivicClerk AI produces local-AI-backed output if exposed,
  - reopen and restore do not lose model readiness or can recover it through product controls without developer intervention.
