# TESTER-RESULT-103

Verdict: FAIL

Directive: `test-comms/TESTER-DIRECTIVE-103.md`

Branch tested: `stage-3a-baremetal-windows`

Directive head tested: `8eeeaa4f7d824a45e87bffc9bd9bed022f2ba531`

Artifact under test:

- Release tag: `windows-local-msi-ci-4e5626d`
- CivicSuite head: `4e5626d89778e2d49968b2433c72c7117f5d5746`
- MSI: `CivicSuite_0.1.0_x64_en-US.msi`
- MSI bytes: `1645276476`
- MSI SHA-256: `f59da3b2eafb869417ea1fbf1e749f332a46c2c3eb8308f0b40b6472fd2fe3a1`
- Evidence asset SHA-256: `7e63b0c086e237c9ef2e43a43c70463f40ca6430caece7eddc071474712f184d`

Failure classification:

- module AI workflow returned unusable or empty output
- module AI workflow did not persist required AI draft output

Summary:

The clean installed MSI reached first-run, model, runtime, and health readiness through the installed app. The prior TESTER-RESULT-102 chunk-size parse failure did not reproduce: Records, Code, and Clerk no longer failed on chunk-size values like `94` or `11`. However, all three AI workflows still failed after product-managed local Ollama generation with `Local AI returned an empty draft.`, so no usable local-AI-backed staff drafts were persisted.

Clean-machine/install evidence:

- Bare-metal clean fallback was used with scoped CivicSuite cleanup only.
- Cleanup evidence: `directive103-evidence/clean-pre-state.json`, `directive103-evidence/clean-after-state.json`, `directive103-evidence/elevated-cleanup-process.json`
- Previous product `{92B63122-47C5-4524-B1FF-8CE87D2F1BDE}` uninstalled with exit code 0.
- MSI/evidence hashes matched the directive exactly: `directive103-evidence/artifact-hashes.json`
- MSI install exited 0 and installed `C:\Program Files\CivicSuite\civicsuite-desktop.exe`.
- Installed product code: `{58B6D082-4252-4AAD-A5FA-700075F108BB}`
- Install evidence: `directive103-evidence/target-msi-install-result.json`, `directive103-evidence/target-msi-install.log`
- Installed app launch evidence: `directive103-evidence/launch-installed-app.json`, `directive103-evidence/webview-debug-targets.json`

First-run/model/runtime evidence:

- First-run was completed through installed-app UI/product controls. Evidence transcripts:
  - `directive103-evidence/first-run-ui-attempt.json`
  - `directive103-evidence/first-run-ui-continue.json`
  - `directive103-evidence/first-run-ui-continue2.json`
  - `directive103-evidence/first-run-ui-continue3.json`
  - `directive103-evidence/backup-signin-ui-fix.json`
  - `directive103-evidence/model-verify-load-ui.json`
  - `directive103-evidence/setup-services-model-ui.json`
  - `directive103-evidence/finish-first-run-ui.json`
- Note: the build removed prior direct commands `complete_first_run_step` and `model_setup_action`; the installed UI controls were used instead. An early test-harness fill attempt crossed visible form boundaries, and the UI later displayed the signed-in local-admin label as `C:\Users\insty\Documents\CivicSuite Backups`. The product nevertheless accepted local-admin-gated setup actions and reported health Ready before AI workflow testing.
- Program Files bundled Ollama payload existed at `C:\Program Files\CivicSuite\_up_\runtime\payload\ollama\ollama.exe`.
- Program Files Ollama SHA-256: `e44b55b3f10310663ac058d82d0ee18eb2bee6b20ccd0e8d992b48095961d225`
- User runtime Ollama existed at `C:\Users\insty\AppData\Local\CivicSuite\runtime\ollama\ollama.exe`.
- User runtime Ollama SHA-256: `e44b55b3f10310663ac058d82d0ee18eb2bee6b20ccd0e8d992b48095961d225`
- Model file existed at `C:\Users\insty\AppData\Local\CivicSuite\Data\models\gemma-4-12b-it-qat-q4_0.gguf`.
- Model bytes: `6975877728`
- Model SHA-256: `faff1a63667fac17ac5e777f47114688fcefea96e220e211aaa8d62c2c4561f1`
- Partial `.part` file present: `false`
- Product-managed Ollama model list included `civicsuite-gemma4-12b-qat:q4_0`.
- Runtime health endpoint `http://127.0.0.1:15480/health` returned `status: ok`; CivicCore, CivicRecords AI, CivicClerk, and CivicCode imports were OK.
- Runtime/model evidence:
  - `directive103-evidence/programfiles-ollama-runtime.json`
  - `directive103-evidence/model-download-file-progress.json`
  - `directive103-evidence/model-file-verification.json`
  - `directive103-evidence/runtime-state-after-setup.json`

AI workflow marker:

`D103-AI-MODEL-MARKER-20260620`

AI workflow results:

- Pre-AI health:
  - `supervisor_action health`: Ready, `Selected local runtime services passed health checks.`
- CivicRecords setup actions succeeded:
  - `create-records-request`: Saved, `REQ-0001`
  - `record-records-search-session`: Saved
- CivicRecords AI action failed:
  - Action: `suggest-records-response`
  - Duration: `68511 ms`
  - Result: failed
  - Error: `Local AI returned an empty draft.`
- CivicCode setup action succeeded:
  - `import-code-source`: Saved
  - Source evidence path created by product: `C:\Users\insty\AppData\Local\CivicSuite\Data\files\code\d103-test-code-sec-1\directive-103-chunked-ai-readiness-ordinance-1781949868-reference.txt`
- CivicCode AI action failed:
  - Action: `suggest-code-guidance`
  - Duration: `42601 ms`
  - Result: failed
  - Error: `Local AI returned an empty draft.`
- CivicClerk setup actions succeeded:
  - `create-meeting-body`: Saved
  - `add-meeting-member`: Saved
  - `create-meeting`: Saved
  - `add-agenda-item`: Saved
  - `record-motion`: Saved
  - `record-vote`: Saved
  - `record-resident-comment`: Saved
  - `record-minutes`: Saved
- CivicClerk AI action was exposed but failed:
  - Action: `suggest-minutes-draft`
  - Duration: `49704 ms`
  - Result: failed
  - Error: `Local AI returned an empty draft.`
- CivicNotice did not require a model-backed AI flow for this directive path; non-AI notice actions succeeded:
  - `civicnotice-calculate-deadline`: Saved
  - `civicnotice-complete-checklist`: Saved
- Post-AI health:
  - `supervisor_action health`: Ready, `Selected local runtime services passed health checks.`

Ollama evidence:

- Product-managed Ollama returned HTTP 200 for `/api/generate` during the AI attempts.
- Relevant durations from `model-runtime.log` tail:
  - `/api/generate` returned `200` after `1m8s`
  - `/api/generate` returned `200` after `42.5829274s`
  - `/api/generate` returned `200` after `49.689405s`
  - `/api/tags` returned `200`
- This confirms generation reached local Ollama and was bounded, but the product still surfaced empty generated draft output to the workflow layer.
- Log tail: `directive103-evidence/model-runtime-log-tail-after-ai.txt`
- Python/service log tail: `directive103-evidence/python-services-log-tail-after-ai.txt`

Persistence/state evidence:

- Product workflow state was copied after the AI attempts: `directive103-evidence/city-work-after-ai.json`
- AI workflow transcript: `directive103-evidence/ai-workflows-sequence.json`
- Marker occurrences were present in evidence and workflow state, but required AI draft persistence did not occur because the AI actions failed before saving usable generated output.
- `D103-AI-MODEL-MARKER-20260620` matches:
  - `directive103-evidence/ai-workflows-sequence.json`: `163`
  - `C:\Users\insty\AppData\Local\CivicSuite\Data\workflows\city-work.json`: `21`

Remote branch checks:

- Before starting, `git ls-remote origin refs/heads/stage-3a-baremetal-windows` reported `8eeeaa4f7d824a45e87bffc9bd9bed022f2ba531`.
- Before writing this result, `git ls-remote origin refs/heads/stage-3a-baremetal-windows` still reported `8eeeaa4f7d824a45e87bffc9bd9bed022f2ba531`.
- Fetch before result left local HEAD and `origin/stage-3a-baremetal-windows` both at `8eeeaa4f7d824a45e87bffc9bd9bed022f2ba531`.
- Remote evidence:
  - `directive103-evidence/remote-ls-remote-before-start.txt`
  - `directive103-evidence/fetch-head-before-start.txt`
  - `directive103-evidence/remote-ls-remote-before-result.txt`
  - `directive103-evidence/fetch-head-before-result.txt`

Restart/reopen and backup/restore:

Not reached. The directive permits FAIL when any required step fails. Because CivicRecords, CivicCode, and exposed CivicClerk AI workflows failed before producing usable persisted local-AI drafts, the pass criteria cannot be met and restart/restore proof would not change the verdict.

