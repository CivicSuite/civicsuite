# TESTER-RESULT-105

Verdict: FAIL

Directive branch/head tested: `stage-3a-baremetal-windows` at `c59741b2b63df2075b85a51ec5dfe2956f185ec0`.

Artifact under test:

- CivicSuite head: `1048f2a621058c69bf3185a11ef3007afdd049b5`
- Release tag: `windows-local-msi-ci-1048f2a`
- MSI: `CivicSuite_0.1.0_x64_en-US.msi`
- MSI SHA-256 verified: `1ceb650065d53f2a0ea702659b7ffb24d4be756ca13fde3300ceebc1ebafe4a7`
- Evidence asset SHA-256 verified: `82bc211b5a4bde0b82b905a8d3fe2aca5492de46b5f39905bde60d113a3f4d3c`

Remote-state requirement:

- Before start: recorded `git ls-remote`, fetched, and recorded `FETCH_HEAD`.
- Before result: recorded `git ls-remote`, fetched, and recorded `FETCH_HEAD`.
- Final pre-result `HEAD` and `FETCH_HEAD` both equaled `c59741b2b63df2075b85a51ec5dfe2956f185ec0`.

What passed:

- Clean bare-metal fallback cleanup removed prior CivicSuite product/profile/runtime state without rebooting.
- MSI installed successfully from a clean CivicSuite state.
- Installed desktop launched from `C:\Program Files\CivicSuite\civicsuite-desktop.exe`.
- First-run setup completed through product controls.
- Product-controlled Gemma download completed to `%LOCALAPPDATA%\CivicSuite\Data\models\gemma-4-12b-it-qat-q4_0.gguf`.
- Model bytes matched `6975877728`.
- Independent model SHA-256 matched required pinned hash `faff1a63667fac17ac5e777f47114688fcefea96e220e211aaa8d62c2c4561f1`.
- No old `Could not remove invalid partial model download ... os error 2` failure appeared.
- `.part` bytes were `0` after completion.
- Product-managed Ollama materialized under `%LOCALAPPDATA%\CivicSuite\runtime\ollama\ollama.exe` and responded on `127.0.0.1:15434`.
- `civicsuite-gemma4-12b-qat:q4_0` appeared in the product-managed Ollama model list.
- Generated Modelfile used the verified GGUF and included Gemma turn markers plus stop tokens.
- CivicCore model registry persisted model id, runtime model name, artifact path, and checksum.
- System Health became OK after product controls started/checked local database, task queue, Python services, file storage, and model runtime.
- Reopen proof passed: after closing/relaunching the installed desktop, runtime health was OK, model status remained `Verified`, model registry persisted, and Ollama still listed `civicsuite-gemma4-12b-qat:q4_0`.
- CivicCode packaged workflow proof produced a local Ollama-backed, citation-grounded answer with `llm_provider: ollama`, `llm_model: civicsuite-gemma4-12b-qat:q4_0`, and persisted a marker-bearing staff summary in the packaged store.

Failure:

- CivicRecords AI did not satisfy the directive pass gate. The response-letter workflow persisted a draft, but the product LLM path logged `LLM generation failed, falling back to template`; the persisted draft was the fallback template rather than a confirmed local-AI-backed draft within the product timeout.
- The required fixed marker `D105-AI-MODEL-MARKER-20260620` was not proven end-to-end through both Records and Code installed workflows; the successful Code proof used a generated `D105-CODE-AI-*` marker.
- CivicClerk AI was not proven.
- CivicNotice AI/no-model-need was not fully proven.
- Backup Now / Restore Latest Backup proof was not completed, so restore-time model readiness cannot be called passing.

Evidence files captured under `directive105-evidence/` include:

- `artifact-hashes.json`
- `clean-pre-state.json`
- `clean-after-state.json`
- `target-msi-install-result.json`
- `model-download-start.json`
- `model-download-file-progress.json`
- `model-hash-independent.json`
- `model-runtime-after-load.log`
- `gemma-modelfile-after-load.txt`
- `model-registry-after-load.json`
- `runtime-health-after-service-start.json`
- `ollama-tags-after-service-start.json`
- `ollama-generate-content-check.json`
- `records-ai-workflow.json`
- `civiccode-direct-ai-workflow.json`
- `reopen-persistence-check.json`
- `remote-ls-remote-before-result.txt`
- `fetch-head-before-result.txt`

Classification:

- Module AI workflow returned fallback/non-confirmed local-AI output for CivicRecords.
- Backup/restore gate incomplete.
- Overall directive pass criteria were not met.
