# TESTER RESULT 101

Directive: `test-comms/TESTER-DIRECTIVE-101.md`
Branch tested: `stage-3a-baremetal-windows`
Test head: `8e1521e9dea67efe10d9d040d1f6e31407be2f68`
Artifact tag: `windows-local-msi-ci-4e33927`
Verdict: FAIL

## Failure classification

- Module AI workflow returned unusable or empty output.
- The prior timeout failure changed, but the required AI workflow proof still does not pass.

CivicRecords AI, CivicCode, and CivicClerk AI actions no longer timed out at the installed app level. Product-managed Ollama returned HTTP 200 within the product timeout. However, each installed-app AI workflow failed with:

```text
Local AI returned an empty draft.
```

That is not a usable staff-review draft and it did not persist a generated AI draft, so this fails directive 101 pass criteria.

## Artifact verification

Downloaded from public prerelease `windows-local-msi-ci-4e33927`.

- MSI: `CivicSuite_0.1.0_x64_en-US.msi`
- Expected MSI bytes: `1645247804`
- Observed MSI bytes: `1645247804`
- Expected MSI SHA-256: `fa5644fec3ff2df02e411d798e7bbe1d7d2dbfcae3f5042a02f66b55884a1455`
- Observed MSI SHA-256: `fa5644fec3ff2df02e411d798e7bbe1d7d2dbfcae3f5042a02f66b55884a1455`
- Evidence asset bytes/SHA-256 matched: `578`, `3dce2c76f964e7fe98debd729ead33c3e05d0fba672f48fe93493ad5b8696766`

Evidence:

- `directive101-evidence/release-api.json`
- `directive101-evidence/release-assets.json`
- `directive101-evidence/artifact-hashes.json`
- `directive101-evidence/CivicSuite-msi-evidence.txt`

## Clean install and setup

Bare-metal clean fallback was used, with no reboot. Only CivicSuite-owned process/product/path state was targeted.

The first non-elevated cleanup removed user/runtime/profile/backup state but old MSI uninstall returned exit `1603`. Elevated cleanup removed CivicSuite filesystem state. A stale old MSI registration remained briefly, but installing directive 101's MSI succeeded and replaced the registration with product code `{79A87078-E4D1-4594-884A-BE224A476AB1}`.

MSI install result:

- Exit code: `0`
- Installed executable: `C:\Program Files\CivicSuite\civicsuite-desktop.exe`
- Launched only the installed desktop executable.

Evidence:

- `directive101-evidence/clean-pre-state.json`
- `directive101-evidence/clean-after-state.json`
- `directive101-evidence/post-elevated-clean-state.json`
- `directive101-evidence/target-msi-install-result.json`
- `directive101-evidence/target-msi-install.log`
- `directive101-evidence/launch-installed-app.json`
- `directive101-evidence/webview-debug-targets.json`

## First-run, model, and health

Completed through installed-app product controls/API:

- unsigned beta acknowledgement
- SmartScreen explanation
- local folders
- City Core module selection
- city profile
- first local admin and sign-in
- backup default
- model-runtime Install/Start/Check/Repair/Check
- model download/resume
- checksum verification
- model load/register
- postgres/python/task-queue Install/Start/Check/Repair/Check
- full System Health
- finish/open app

Pinned model verification:

- Model path: `%LOCALAPPDATA%\CivicSuite\Data\models\gemma-4-12b-it-qat-q4_0.gguf`
- Expected bytes: `6975877728`
- Observed bytes: `6975877728`
- Expected SHA-256: `faff1a63667fac17ac5e777f47114688fcefea96e220e211aaa8d62c2c4561f1`
- Observed SHA-256: `faff1a63667fac17ac5e777f47114688fcefea96e220e211aaa8d62c2c4561f1`
- `.part` file: absent
- Program Files Ollama payload exists: `C:\Program Files\CivicSuite\_up_\runtime\payload\ollama\ollama.exe`
- User runtime Ollama exists: `%LOCALAPPDATA%\CivicSuite\runtime\ollama\ollama.exe`
- Product-managed runtime endpoint: `http://127.0.0.1:15434/api/tags`
- Loaded model listed: `civicsuite-gemma4-12b-qat:q4_0`

Evidence:

- `directive101-evidence/programfiles-ollama-runtime.json`
- `directive101-evidence/first-run-model-health-sequence.json`
- `directive101-evidence/model-file-verification.json`
- `directive101-evidence/runtime-state-after-setup.json`
- `directive101-evidence/post-ai-health-array.json`
- `directive101-evidence/post-ai-model-state.json`

## AI workflow proof

Marker: `D101-AI-MODEL-MARKER-20260620`

The marker was persisted in local product workflow state. `city-work.json` contains 19 occurrences after the test.

Installed workflow setup actions succeeded:

- CivicRecords request `REQ-0001` saved locally.
- CivicRecords search session with citation/source evidence saved locally.
- CivicCode source imported with local source evidence.
- CivicClerk body, member, meeting, agenda item, vote, resident comment, and minutes saved locally.
- CivicNotice non-AI deadline/checklist actions succeeded after using product-required `YYYY-MM-DD` date format.

Required AI actions failed:

- `records-suggest-ai-response`: `75598 ms`, failed with `Local AI returned an empty draft.`
- `code-suggest-guidance`: `46913 ms`, failed with `Local AI returned an empty draft.`
- `clerk-suggest-minutes-draft`: `53779 ms`, failed with `Local AI returned an empty draft.`

The product-managed Ollama log shows `/api/generate` returning HTTP `200`, not `500`, for the bounded requests:

- one generate request completed in about `46.9 s`
- another completed in about `53.8 s`
- decoded output bounded at about `192` tokens for those captured log entries

So the product fix appears to bound generation and avoid the prior 180-second timeout, but the app still treats the AI response as empty and does not produce/persist usable staff-review draft output.

Evidence:

- `directive101-evidence/ai-workflows-sequence.json`
- `directive101-evidence/model-runtime-log-tail-after-ai.txt`
- `directive101-evidence/python-services-log-tail-after-ai.txt`
- `directive101-evidence/runtime-state-after-ai.json`
- `directive101-evidence/post-ai-city-work-state.json`
- `directive101-evidence/city-work-after-ai.json`

## CivicNotice

CivicNotice did not expose a required AI-backed model flow in this City Core profile. Non-AI CivicNotice actions succeeded:

- `civicnotice-calculate-deadline`: saved, calculated deadline `2026-06-18`
- `civicnotice-complete-checklist`: saved

No failure is assigned to CivicNotice.

## Restart and backup/restore

Not reached. Directive 101 says any step failure is a FAIL. Because CivicRecords AI, CivicCode, and CivicClerk AI did not return usable/persisted staff-review drafts, restart/reopen and Backup Now/Restore Latest Backup were not used to mask the AI workflow failure.

## Remote state before result

Before starting and before writing this result, the tester recorded live remote state:

- Start `ls-remote`: `8e1521e9dea67efe10d9d040d1f6e31407be2f68`
- Start `FETCH_HEAD`: `8e1521e9dea67efe10d9d040d1f6e31407be2f68`
- Before-result `ls-remote`: `8e1521e9dea67efe10d9d040d1f6e31407be2f68`
- Before-result `FETCH_HEAD`: `8e1521e9dea67efe10d9d040d1f6e31407be2f68`

Evidence:

- `directive101-evidence/remote-ls-remote-before-start.txt`
- `directive101-evidence/fetch-head-before-start.txt`
- `directive101-evidence/remote-ls-remote-before-result.txt`
- `directive101-evidence/fetch-head-before-result.txt`

