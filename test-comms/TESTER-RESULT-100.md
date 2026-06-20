# TESTER RESULT 100

Directive: `test-comms/TESTER-DIRECTIVE-100.md`
Branch tested: `stage-3a-baremetal-windows`
Test head: `21a66b811fb1ade47b7c2421b6a15aa082a0f8ca`
Artifact tag: `windows-local-msi-ci-9a9c9dd`
Result: FAIL

## Failure classification

Product workflow failure after successful install/setup/model load.

The MSI installed and the first-run product controls successfully completed local folder setup, City Core module selection, city profile, first admin, backup default, pinned Gemma download, SHA-256 verification, local Ollama model load, and full System Health. However, the required AI workflow proof failed: CivicRecords AI, CivicCode, and CivicClerk AI actions each timed out waiting for the product-managed local Ollama generate response after about 180 seconds.

The failure is not an artifact provenance failure, MSI install failure, checksum failure, or System Health failure. The app reached setup complete and the model was listed by the bundled Ollama runtime, but the shipped AI workflow calls did not return usable product results within the app's timeout window.

## Artifact verification

- MSI: `CivicSuite_0.1.0_x64_en-US.msi`
- Expected MSI bytes: `1645243708`
- Observed MSI bytes: `1645243708`
- Expected MSI SHA-256: `ae9482bd9b0e3b239bec2a9386a73bddbee9e1e2119e506d21c9f5fe1921d94e`
- Observed MSI SHA-256: `ae9482bd9b0e3b239bec2a9386a73bddbee9e1e2119e506d21c9f5fe1921d94e`
- Evidence file bytes/SHA-256 also matched directive metadata: `578`, `0fea98e297a3ab551b5bc043171f8c9c1784d1edf811efb77a6f5ee5f71625fa`

Evidence files on tester machine:

- `directive100-evidence/artifact-hashes.json`
- `directive100-evidence/CivicSuite-msi-evidence.txt`
- `directive100-evidence/release-api.json`
- `directive100-evidence/release-assets.json`

## Install and first-run result

Clean-machine state was created by removing only CivicSuite product paths and stopping only CivicSuite-path processes/services. MSI install completed with exit code 0 and installed `C:\Program Files\CivicSuite\civicsuite-desktop.exe`.

First-run product controls completed:

- unsigned beta acknowledgement
- Windows SmartScreen explanation
- local folders
- City Core module selection
- city profile
- first local admin
- backup default
- model download/checksum/load
- System Health
- finish/open app

Evidence files:

- `directive100-evidence/clean-pre-state.json`
- `directive100-evidence/clean-helper-result.json`
- `directive100-evidence/target-msi-install-result.json`
- `directive100-evidence/webview-debug-targets.json`
- `directive100-evidence/native-auth-and-backup-result.json`
- `directive100-evidence/remaining-services-health-sequence.json`
- `directive100-evidence/ai-workflows-sequence.json`

## Model verification

Pinned Gemma model download passed:

- Model file: `%LOCALAPPDATA%\CivicSuite\Data\models\gemma-4-12b-it-qat-q4_0.gguf`
- Expected bytes: `6975877728`
- Observed bytes: `6975877728`
- Expected SHA-256: `faff1a63667fac17ac5e777f47114688fcefea96e220e211aaa8d62c2c4561f1`
- Observed SHA-256: `faff1a63667fac17ac5e777f47114688fcefea96e220e211aaa8d62c2c4561f1`
- Partial file: absent
- Bundled runtime endpoint: `http://127.0.0.1:15434/api/tags`
- Loaded model listed: `civicsuite-gemma4-12b-qat:q4_0`
- Product-managed Ollama path: `%LOCALAPPDATA%\CivicSuite\runtime\ollama\ollama.exe`

Evidence files:

- `directive100-evidence/native-model-resume-download-result.json`
- `directive100-evidence/model-file-verification.json`
- `directive100-evidence/model-runtime-health-sequence.json`
- `directive100-evidence/native-model-load-and-first-run-result.json`
- `directive100-evidence/runtime-state-after-ai-timeouts.json`

Note: an unrelated user-level Ollama installation was present at `%LOCALAPPDATA%\Programs\Ollama`, but the tested product-managed runtime used port `15434` and the CivicSuite runtime path above.

## AI workflow failure

Marker used: `D100-AI-MODEL-MARKER-20260620`

The product accepted and persisted setup records for Records Requests, Code & Ordinances, and Meetings. The required AI actions then failed:

- CivicRecords AI action `suggest-records-response`: failed after `180031 ms`
- CivicCode action `suggest-code-guidance`: failed after `180037 ms`
- CivicClerk action `suggest-minutes-draft`: failed after `180033 ms`

Observed error for all three:

```text
Could not read local AI response: A connection attempt failed because the connected party did not properly respond after a period of time, or established connection failed because connected host has failed to respond. (os error 10060)
```

The product-managed Ollama log shows `/api/generate` returning HTTP 500 after `3m0s` while generation was still decoding around 4.6-5.2 tokens/sec, then cancelling the task. This means the required local AI workflows are not usable through the shipped app within the current timeout behavior.

Evidence files:

- `directive100-evidence/ai-workflows-sequence.json`
- `directive100-evidence/model-runtime-log-tail-after-ai-timeouts.txt`
- `directive100-evidence/python-services-log-tail-after-ai-timeouts.txt`
- `directive100-evidence/post-ai-timeout-health-state.json`

## CivicNotice

CivicNotice has no model requirement in this installed City Core profile. The test did not claim an AI result for CivicNotice. Non-AI CivicNotice direct calls attempted after the AI failures were rejected because the payload date fields were not in the app-required `YYYY-MM-DD` format, and the required test was already failed by the AI workflow timeouts.

## Restart, backup, and restore

Not reached. Per directive, any required step failure is a FAIL. Because CivicRecords AI, CivicCode, and CivicClerk AI workflow proof failed through the installed product, the restart/reopen proof and Backup Now/Restore Latest Backup proof were not used to override or mask the AI workflow failure.

## Remote state before result

Before writing this result, the tester recorded:

- `git ls-remote origin refs/heads/stage-3a-baremetal-windows` -> `21a66b811fb1ade47b7c2421b6a15aa082a0f8ca`
- `FETCH_HEAD` -> `21a66b811fb1ade47b7c2421b6a15aa082a0f8ca`

Evidence files:

- `directive100-evidence/remote-ls-remote-before-result.txt`
- `directive100-evidence/fetch-before-result.log`
- `directive100-evidence/fetch-head-before-result.txt`

