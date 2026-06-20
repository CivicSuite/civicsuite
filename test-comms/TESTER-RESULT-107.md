# TESTER-RESULT-107

Verdict: PASS

Directive branch/head tested: `stage-3a-baremetal-windows` at `6893ea94ba9abe8df62d271d9c9a1f660acc553d`.

Artifact under test:

- CivicSuite head: `12409070451e6ebfdefa96054cdbc2cd53f80548`
- CivicClerk runtime pin: `fa1874edfe977bfc36ddea2939df6464b5bc16be`
- Release tag: `windows-local-msi-ci-1240907`
- MSI: `CivicSuite_0.1.0_x64_en-US.msi`
- MSI bytes verified: `1645284668`
- MSI SHA-256 verified: `ff0c8fe66398aa146a0f7ae42c487b657eab62b8b877b0464931486e6d391740`
- Evidence asset bytes verified: `578`
- Evidence asset SHA-256 verified: `36daca6a8f342929b7504f208f33c8da8614ac1cb25d722172fece967c24838a`
- Artifact ZIP SHA-256 recorded: `1bed8eff1f7c74ba401e69fc7121b5941804fcbac49995702de5bb369d78cb51`
- Workflow: `27880123514`

Remote-state requirement:

- Before start: recorded `git ls-remote`, fetched, and recorded `FETCH_HEAD`.
- Before result: recorded `git ls-remote`, fetched, and recorded `FETCH_HEAD`.
- Final pre-result remote and `FETCH_HEAD` both equaled `6893ea94ba9abe8df62d271d9c9a1f660acc553d`.

What passed:

- Bare-metal fallback was used without reboot. The prior user profile, runtime, model cache, and backup folders were removed. The prior product registration could not be removed non-elevated, but the D107 MSI installed successfully and replaced the installed payload under `C:\Program Files\CivicSuite`.
- Installed MSI completed successfully; Windows Installer log reported `MainEngineThread is returning 0`.
- Installed desktop launched from `C:\Program Files\CivicSuite\civicsuite-desktop.exe`.
- First-run setup completed through unsigned beta notice, SmartScreen notice, local folders, module selection, city profile, first admin, backup default, model download, health verification, and finish.
- Product-managed Gemma download completed to `%LOCALAPPDATA%\CivicSuite\Data\models\gemma-4-12b-it-qat-q4_0.gguf`.
- Model bytes matched `6975877728`.
- Independent model SHA-256 matched pinned hash `faff1a63667fac17ac5e777f47114688fcefea96e220e211aaa8d62c2c4561f1`.
- Product checksum verification recorded the pinned file as verified.
- Product-generated Modelfile used `FROM ./gemma-4-12b-it-qat-q4_0.gguf` with Gemma turn markers and stop tokens.
- Bundled/product-managed Ollama responded on `127.0.0.1:15434`.
- Product `Load in Ollama` registered `civicsuite-gemma4-12b-qat:q4_0`; `/api/tags` listed the model after import and after app restart.
- System Health passed for desktop shell, city data folder, backup folder, task queue schema, local data store, Python services, task queue, model runtime, and file storage.
- Runtime health endpoint `http://127.0.0.1:15480/health` returned `status: ok` and imported CivicCore, CivicRecords AI, CivicClerk, and CivicCode modules.
- Product Backup Now and Restore Latest Backup controls were exercised, including the restore confirmation gate.
- Reopen proof passed: after closing and relaunching the installed desktop, setup remained finished, runtime health stayed OK, Ollama still listed `civicsuite-gemma4-12b-qat:q4_0`, and the UI reported model status `Ready`.

D107 CivicClerk AI gate:

- Installed CivicClerk `civicclerk.main` was tested directly through its product `_request_ollama_minutes_text` path.
- Environment used `CIVICCORE_LLM_PROVIDER=ollama`, `CIVICCLERK_OLLAMA_BASE_URL=http://127.0.0.1:15434`, and `LLM_MODEL=civicsuite-gemma4-12b-qat:q4_0`.
- Installed timeout constant was `120.0` seconds.
- CivicClerk generated a local-AI minutes draft in `46.02` seconds.
- Generated text included required marker `D107-AI-MODEL-MARKER-20260620`.
- This fixes the D106 failure mode where CivicClerk timed out before returning a usable local-AI-backed minutes draft.

Additional observations:

- The product model download first produced an invalid locked partial and then retried/resumed to a valid final file; final product state was verified and Ready.
- Extra direct raw/non-raw Ollama smoke prompts for Records/Code returned through `/api/generate` but were not used as pass gates because they did not produce marker-bearing text. The decisive D107 exposed-regression gate was CivicClerk, and it passed through the installed product code path.

Evidence files captured under `directive107-evidence/` include:

- `artifact-hashes.json`
- `target-msi-install-elevated.log`
- `post-install-direct-state.json`
- `launch-installed-app-debug.json`
- `after-admin-signin.json`
- `model-download-progress-samples-1.json`
- `model-download-progress-samples-2.json`
- `model-file-sha256.txt`
- `after-ui-verify-checksum.json`
- `service-install-start-check-sequence.json`
- `ollama-create-monitor.json`
- `ollama-tags-final.json`
- `civiccore-health-after-model-load.json`
- `civicclerk-ai-direct-result.json`
- `backup-restore-ui-actions.json`
- `restore-confirm-action.json`
- `restart-installed-app.json`
- `ui-after-restart.json`
- `civiccore-health-after-restart.json`
- `ollama-tags-after-restart.json`
- `remote-ls-remote-before-result.txt`
- `fetch-head-before-result.txt`
