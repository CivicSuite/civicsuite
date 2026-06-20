# TESTER-RESULT-102

Verdict: FAIL

Directive: `test-comms/TESTER-DIRECTIVE-102.md`

Branch tested: `stage-3a-baremetal-windows`

Directive head tested: `5a7e62fb1bd9a58495524b2d6c2a2a2a28404683`

Artifact under test:

- Release tag: `windows-local-msi-ci-133874a`
- CivicSuite head: `133874adcbbd89e4b2210faea85d62091acd7461`
- MSI: `CivicSuite_0.1.0_x64_en-US.msi`
- MSI bytes: `1645280572`
- MSI SHA-256: `005dfd5ed94d0dfcbe22c1251b21752e13484cbdd255ead74f50af2f7abb1c13`
- Evidence asset SHA-256: `c59f1d3a4ba37cf6a849a321477450d80095e1379e90a1d95eb636ac290b3b69`

Failure classification:

- module AI workflow returned unusable output
- module AI workflow did not persist required AI draft output

Summary:

The clean installed MSI reached a much better baseline than prior runs: cleanup succeeded, the MSI installed, first-run setup completed through installed-app product controls, the pinned model downloaded and verified, the model loaded/listed in the product-managed Ollama runtime, and System Health reported Ready. The failure is still in the installed module AI workflows. CivicRecords, CivicCode, and CivicClerk each reached local Ollama generation and Ollama returned HTTP 200, but the desktop app failed while parsing the local AI response, so no usable persisted AI drafts were produced.

Clean-machine/install evidence:

- Bare-metal clean fallback was used with scoped CivicSuite cleanup only.
- Cleanup evidence: `directive102-evidence/clean-pre-state.json`, `directive102-evidence/clean-after-state.json`, `directive102-evidence/elevated-cleanup-process.json`
- MSI/evidence hashes matched the directive exactly: `directive102-evidence/artifact-hashes.json`
- MSI install exited 0 and installed `C:\Program Files\CivicSuite\civicsuite-desktop.exe`.
- Install evidence: `directive102-evidence/target-msi-install-result.json`, `directive102-evidence/target-msi-install.log`
- Installed app launch evidence: `directive102-evidence/launch-installed-app.json`, `directive102-evidence/webview-debug-targets.json`

First-run/model/runtime evidence:

- Product first-run controls completed unsigned beta acknowledgement, folder setup, City Core selection, city profile, first admin, backup default, model setup, System Health, and finish/open app.
- First-run transcript: `directive102-evidence/first-run-model-health-sequence.json`
- Program Files bundled Ollama payload existed at `C:\Program Files\CivicSuite\_up_\runtime\payload\ollama\ollama.exe`.
- Program Files Ollama SHA-256: `e44b55b3f10310663ac058d82d0ee18eb2bee6b20ccd0e8d992b48095961d225`
- User runtime Ollama existed at `C:\Users\insty\AppData\Local\CivicSuite\runtime\ollama\ollama.exe`.
- User runtime Ollama SHA-256: `e44b55b3f10310663ac058d82d0ee18eb2bee6b20ccd0e8d992b48095961d225`
- Model file existed at `C:\Users\insty\AppData\Local\CivicSuite\Data\models\gemma-4-12b-it-qat-q4_0.gguf`.
- Model bytes: `6975877728`
- Model SHA-256: `faff1a63667fac17ac5e777f47114688fcefea96e220e211aaa8d62c2c4561f1`
- Partial `.part` file present: `false`
- Product-managed Ollama model list included `civicsuite-gemma4-12b-qat:q4_0`.
- Runtime/model evidence: `directive102-evidence/programfiles-ollama-runtime.json`, `directive102-evidence/model-file-verification.json`, `directive102-evidence/runtime-state-after-setup.json`

AI workflow marker:

`D102-AI-MODEL-MARKER-20260620`

AI workflow results:

- CivicRecords setup actions succeeded:
  - `create-records-request`: Saved, `REQ-0001`
  - `record-records-search-session`: Saved
- CivicRecords AI action failed:
  - Action: `suggest-records-response`
  - Duration: `70276 ms`
  - Result: failed
  - Error: `Could not parse local AI response: expected value at line 1 column 1`
- CivicCode setup action succeeded:
  - `import-code-source`: Saved
  - Source evidence path created by product: `C:\Users\insty\AppData\Local\CivicSuite\Data\files\code\d102-test-code-sec-1\directive-102-parsed-ai-readiness-ordinance-1781940568-reference.txt`
- CivicCode AI action failed:
  - Action: `suggest-code-guidance`
  - Duration: `42744 ms`
  - Result: failed
  - Error: Could not parse local AI response: invalid type: integer `94`, expected struct OllamaGenerateResponse at line 1 column 2
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
  - Duration: `49729 ms`
  - Result: failed
  - Error: Could not parse local AI response: invalid type: integer `11`, expected struct OllamaGenerateResponse at line 1 column 2
- CivicNotice did not require a model-backed AI flow for this directive path; non-AI notice actions succeeded:
  - `civicnotice-calculate-deadline`: Saved
  - `civicnotice-complete-checklist`: Saved

Ollama evidence:

- Product-managed Ollama returned HTTP 200 for `/api/generate` during the AI attempts.
- Relevant durations from `model-runtime.log` tail:
  - `/api/generate` returned `200` after `42.7256111s`
  - `/api/generate` returned `200` after `49.7104811s`
  - `/api/tags` returned `200`
- Log tail: `directive102-evidence/model-runtime-log-tail-after-ai.txt`
- Python/service log tail: `directive102-evidence/python-services-log-tail-after-ai.txt`

Persistence/state evidence:

- Product workflow state was copied after the AI attempts: `directive102-evidence/city-work-after-ai.json`
- Post-AI app state was captured:
  - `directive102-evidence/post-ai-health-array.json`
  - `directive102-evidence/post-ai-model-state.json`
  - `directive102-evidence/post-ai-city-work-state.json`
- Marker occurrences were present in evidence and workflow state, but required AI draft persistence did not occur because the AI actions failed before saving usable generated output.
- `D102-AI-MODEL-MARKER-20260620` matches:
  - `directive102-evidence/ai-workflows-sequence.json`: `184`
  - `C:\Users\insty\AppData\Local\CivicSuite\Data\workflows\city-work.json`: `21`

Remote branch checks:

- Before starting, `git ls-remote origin refs/heads/stage-3a-baremetal-windows` reported `5a7e62fb1bd9a58495524b2d6c2a2a2a28404683`.
- Before writing this result, `git ls-remote origin refs/heads/stage-3a-baremetal-windows` still reported `5a7e62fb1bd9a58495524b2d6c2a2a2a28404683`.
- Fetch before result left local HEAD and `origin/stage-3a-baremetal-windows` both at `5a7e62fb1bd9a58495524b2d6c2a2a2a28404683`.
- Remote evidence:
  - `directive102-evidence/remote-ls-remote-before-start.txt`
  - `directive102-evidence/fetch-head-before-start.txt`
  - `directive102-evidence/remote-ls-remote-before-result.txt`
  - `directive102-evidence/fetch-head-before-result.txt`

Restart/reopen and backup/restore:

Not reached. The directive permits FAIL when any required step fails. Because CivicRecords, CivicCode, and exposed CivicClerk AI workflows failed before producing usable persisted local-AI drafts, the pass criteria cannot be met and restart/restore proof would not change the verdict.
