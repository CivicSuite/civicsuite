# TESTER-RESULT-106

Verdict: FAIL

Directive branch/head tested: `stage-3a-baremetal-windows` at `171e5cc949d13c8d8a7c4132f00f6c182f123e60`.

Artifact under test:

- CivicSuite head: `d578828304a869b57116c0a33870429dd78671ad`
- CivicRecords AI runtime pin: `e2208827b660faa7d3fc1eab2271a8eae18526ee`
- Release tag: `windows-local-msi-ci-d578828`
- MSI: `CivicSuite_0.1.0_x64_en-US.msi`
- MSI bytes verified: `1645276476`
- MSI SHA-256 verified: `43cb0ebfd14d0396d8df87e5a6561fb7f3aa026d4e5a36736eb973bcc67cf772`
- Evidence asset bytes verified: `578`
- Evidence asset SHA-256 verified: `5e51811ca8dca41aeb3285953743f4aa4d704f607fafea540c02ee8b8c2f0c28`
- Artifact ZIP SHA-256 recorded: `d7f35ecca728a785a6b2f8759c72cc064b61c4557b64aaf489a308fd115bfc27`

Remote-state requirement:

- Before start: recorded `git ls-remote`, fetched, and recorded `FETCH_HEAD`.
- Before result: recorded `git ls-remote`, fetched, and recorded `FETCH_HEAD`.
- Final pre-result `HEAD` and `FETCH_HEAD` both equaled `171e5cc949d13c8d8a7c4132f00f6c182f123e60`.

What passed:

- Bare-metal fallback cleanup removed prior CivicSuite product/profile/runtime state without rebooting.
- MSI installed successfully from a clean CivicSuite state after elevation.
- Installed desktop launched from `C:\Program Files\CivicSuite\civicsuite-desktop.exe`.
- First-run setup completed through installed product controls through finish.
- Product model download completed under `%LOCALAPPDATA%\CivicSuite\Data\models\gemma-4-12b-it-qat-q4_0.gguf`.
- Model bytes matched `6975877728`.
- Independent model SHA-256 matched required pinned hash `faff1a63667fac17ac5e777f47114688fcefea96e220e211aaa8d62c2c4561f1`.
- `.part` bytes were `0` after completion.
- The old invalid partial cleanup error `Could not remove invalid partial model download ... os error 2` was not observed.
- Bundled/product-managed Ollama existed in the Program Files payload and user runtime, and responded on `127.0.0.1:15434`.
- Product `Load in Ollama` registered `civicsuite-gemma4-12b-qat:q4_0`.
- Generated Modelfile used `FROM ./gemma-4-12b-it-qat-q4_0.gguf` with Gemma turn markers and stop tokens.
- System Health passed for desktop shell, city data folder, backup folder, task queue schema, local data store, Python services, task queue, model runtime, and file storage.
- Runtime health endpoint `http://127.0.0.1:15480/health` returned `status: ok`.
- CivicRecords response-letter workflow used `LLM_MODEL=civicsuite-gemma4-12b-qat:q4_0`, produced a non-template draft, persisted a response letter, and included `D106-AI-MODEL-MARKER-20260620`.
- Logs captured after the Records action did not show `LLM generation failed` or fallback-template logging for that action.
- CivicCode local AI workflow returned `llm_provider: ollama`, `llm_model: civicsuite-gemma4-12b-qat:q4_0`, and a citation-grounded answer containing `D106-AI-MODEL-MARKER-20260620`.
- Public Notices UI did not expose a live AI-backed flow; no model need was identified for CivicNotice.
- Product Backup Now and Restore Latest Backup controls were exercised.
- Reopen proof passed: after closing and relaunching the installed desktop, runtime health stayed OK, Ollama still listed `civicsuite-gemma4-12b-qat:q4_0`, and the model SHA-256 still matched the pinned hash.

Failure:

- CivicClerk exposes `Generate Local AI Minutes`, so the directive requires it to return a usable local-AI-backed minutes draft within the product timeout.
- The installed CivicClerk minutes-AI path timed out through its own product Ollama timeout and returned `MinutesAssistUnavailableError: Ollama request timed out.`
- Therefore the exposed CivicClerk AI pass gate was not met.

Additional observations:

- A generic Ollama warm-up request returned an empty response, while the Records raw Gemma path produced a usable marker-bearing draft with a control-token prefix.
- CivicRecords passed the specific regression gate that failed in `TESTER-RESULT-105`: it did not fall back to the template and did include the required D106 marker.
- CivicClerk appears to need a longer bounded local-model read timeout or a prompt/runtime path aligned with the installed Gemma model latency.

Evidence files captured under `directive106-evidence/` include:

- `artifact-hashes.json`
- `target-msi-install-elevated-result.json`
- `model-download-monitor.json`
- `model-hash-independent.json`
- `ollama-import-wait.json`
- `gemma-modelfile-after-load.txt`
- `service-install-start-health-actions.json`
- `python-health-after-start.json`
- `records-ai-workflow-output.json`
- `civiccode-ai-workflow-output.json`
- `civicclerk-ai-workflow-output.json`
- `module-ui-snapshots-after-finish.json`
- `lifecycle-backup-restore-actions.json`
- `backup-files-after-lifecycle.json`
- `reopen-persistence-check.json`
- `remote-ls-remote-before-result.txt`
- `fetch-head-before-result.txt`
