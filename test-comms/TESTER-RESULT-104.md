# TESTER-RESULT-104

Verdict: FAIL

Directive: `test-comms/TESTER-DIRECTIVE-104.md`

Branch tested: `stage-3a-baremetal-windows`

Directive head tested: `0b971332cea8732763a716acd76f13e654f56a36`

Artifact under test:

- Release tag: `windows-local-msi-ci-e5bb4c2`
- CivicSuite head: `e5bb4c2925927f8c087a945c976074c60fd1552b`
- MSI: `CivicSuite_0.1.0_x64_en-US.msi`
- MSI bytes: `1645243708`
- MSI SHA-256: `6535e5cb4ed8554f96998e44023f054bb416a7f40222925ce5eed79667d8c85d`
- Evidence asset SHA-256: `dd2867c1b81ac5d2fe8b9e540fc7276f46199f20cd0122fd9f21d4dc8bb9199e`

Failure classification:

- model download failed
- checksum failed or product rejected downloaded model content
- model did not load into Ollama
- CivicCore registry did not register the model
- required module AI workflows were not reached because model readiness failed first

Summary:

The clean installed MSI completed first-run setup through unsigned beta notice, SmartScreen explanation, local folders, City Core module selection, city profile, first local admin, local admin sign-in, and backup default. The installed product then reached the Local AI Model setup screen with the correct pinned Gemma metadata and SHA-256. Product-controlled `Download / Resume` started a real download under the CivicSuite data model path, but the model setup gate ended at `Download failed`. The final product status says the Gemma model download did not complete and records this exact error:

`Could not remove invalid partial model download after its checksum did not match the pinned Gemma model: The system cannot find the file specified. (os error 2)`

After the failure, the model directory was empty, no verified `.gguf` file existed, no `.part` file remained, the user runtime Ollama path had not been materialized, and the installed app still reported the model as needing download/checksum verification. Because the pinned model could not be downloaded and verified through installed-app controls, the directive pass criteria cannot be met and AI workflow/reopen/restore proof was not reached.

Clean-machine/install evidence:

- Bare-metal clean fallback was used with scoped CivicSuite cleanup only.
- Cleanup evidence: `directive104-evidence/clean-pre-state.json`, `directive104-evidence/clean-after-state.json`, `directive104-evidence/elevated-cleanup-process.json`
- Previous product `{58B6D082-4252-4AAD-A5FA-700075F108BB}` uninstalled with exit code 0.
- After cleanup, no CivicSuite processes, products, Program Files payload, local profile data, app data, or backup folder remained.
- MSI/evidence hashes matched the directive exactly: `directive104-evidence/artifact-hashes.json`
- MSI install exited 0 and installed `C:\Program Files\CivicSuite\civicsuite-desktop.exe`.
- Installed product code: `{288D267F-6523-408B-90F0-7698B32E5378}`
- Install evidence: `directive104-evidence/target-msi-install-result.json`, `directive104-evidence/target-msi-install.log`
- Installed app launch evidence: `directive104-evidence/launch-installed-app.json`, `directive104-evidence/webview-debug-targets-initial.json`

First-run/setup evidence:

- First-run was completed through installed-app UI/product controls up to the model download gate.
- Evidence transcripts:
  - `directive104-evidence/dom-controls-initial.json`
  - `directive104-evidence/first-run-ui-sequence-a.json`
  - `directive104-evidence/click-beta-dom-result.json`
  - `directive104-evidence/current-ui-step3.json`
  - `directive104-evidence/first-run-ui-sequence-b.json`
  - `directive104-evidence/click-use-city-core.json`
  - `directive104-evidence/save-city-profile-dom.json`
  - `directive104-evidence/save-first-admin.json`
  - `directive104-evidence/signin-and-backup.json`
- City profile used: `Directive104 Test City`, `CO`, `America/Denver`, `records-d104@example.test`, `clerk-d104@example.test`.
- First local admin used: `Directive104 Admin`, `admin-d104@example.test`; sign-in succeeded and the UI reported `local-admin`.
- Backup folder step completed with `C:\Users\insty\Documents\CivicSuite Backups`.

Bundled runtime evidence:

- Program Files bundled Ollama payload existed at `C:\Program Files\CivicSuite\_up_\runtime\payload\ollama\ollama.exe`.
- Program Files Ollama bytes: `35691912`
- Program Files Ollama SHA-256: `e44b55b3f10310663ac058d82d0ee18eb2bee6b20ccd0e8d992b48095961d225`
- User runtime Ollama did not exist after the model-download failure at `C:\Users\insty\AppData\Local\CivicSuite\runtime\ollama\ollama.exe`.
- Runtime path evidence: `directive104-evidence/ollama-runtime-paths-after-model-failure.json`

Model download evidence:

- Product-controlled model download was started from the installed app using `Download / Resume`.
- During download, the partial file was observed under `C:\Users\insty\AppData\Local\CivicSuite\Data\models\gemma-4-12b-it-qat-q4_0.gguf.part` and reached at least `3649925120` bytes before the terminal failure.
- Final status file: `C:\Users\insty\AppData\Local\CivicSuite\config\model-download-status.json`
- Final status:
  - `status`: `Download failed`
  - `expected_size_bytes`: `6975877728`
  - `local_bytes`: `0`
  - `partial_bytes`: `0`
  - `progress_percent`: `0.0`
  - `last_error`: `Could not remove invalid partial model download after its checksum did not match the pinned Gemma model: The system cannot find the file specified. (os error 2)`
- Final model directory evidence: `directive104-evidence/model-dir-after-failure.json`
- Final model directory was empty: no verified `.gguf` file and no resumable `.part` file remained.
- Download evidence:
  - `directive104-evidence/model-download-click.json`
  - `directive104-evidence/model-download-click-lower.json`
  - `directive104-evidence/model-download-ok-retry.json`
  - `directive104-evidence/model-download-file-progress.json`
  - `directive104-evidence/model-download-status-after-failure.json`
  - `directive104-evidence/ui-after-model-download-failure.json`

AI workflow marker:

`D104-AI-MODEL-MARKER-20260620`

AI workflow results:

Not reached. The directive permits FAIL when any required step fails. The installed app did not complete the pinned Gemma download/checksum gate, did not load `civicsuite-gemma4-12b-qat:q4_0` into bundled Ollama, and did not reach CivicCore model registry readiness. Running CivicRecords, CivicCode, or CivicClerk AI workflows without model readiness would not satisfy the directive.

Restart/reopen and backup/restore:

Not reached. Reopen and backup/restore proof depends on a checksum-valid, loaded, and registered model. The model download/checksum gate failed first.

Remote branch checks:

- Before starting, `git ls-remote origin refs/heads/stage-3a-baremetal-windows` reported `0b971332cea8732763a716acd76f13e654f56a36`.
- Before writing this result, `git ls-remote origin refs/heads/stage-3a-baremetal-windows` still reported `0b971332cea8732763a716acd76f13e654f56a36`.
- Fetch before result left local HEAD and `origin/stage-3a-baremetal-windows` both at `0b971332cea8732763a716acd76f13e654f56a36`.
- Remote evidence:
  - `directive104-evidence/remote-ls-remote-before-start.txt`
  - `directive104-evidence/fetch-head-before-start.txt`
  - `directive104-evidence/remote-ls-remote-before-result.txt`
  - `directive104-evidence/fetch-head-before-result.txt`
