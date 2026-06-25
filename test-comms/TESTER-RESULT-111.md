# TESTER-RESULT-111

Verdict: FAIL

Failure classification: `lifecycle/regression`

Directive head: stage-3a-baremetal-windows at `9143e197c29ccf4001e313b18920d27a56fa5be5`

Final pushed-from head before this result: `95676097270d255602976dcd753b397358462138`

## Summary

Stage A settled the A/B question as **B - product works, form needs typed input**. The city-profile form was current, visible, fully populated with the required inputs, and Save was enabled before any driving (`directive111-evidence/A4-ab-decisive.json`).

Stage B drove first-run through city profile, first admin, admin sign-in, backup, model download, checksum verification, model load, health verification, and finish. The pinned Gemma file hash matched `faff1a63667fac17ac5e777f47114688fcefea96e220e211aaa8d62c2c4561f1` (`B5-sha256.txt`), health advanced to finish (`B6-after-verify-health-final.json`), and `open-app` initially produced `firstRun.finished=true` (`B7-after-open-app.json`).

Stage C failed on lifecycle gates:

- `C2`: CivicRecords generated a local AI records draft with `civicsuite-gemma4-12b-qat:q4_0`, but the persisted draft did **not** echo or use `D111-AI-MODEL-MARKER-20260625` even though the selected request summary and search note contained it. Evidence: `C2-city-work-after-records.json`, `C2-civicrecords-suggest-final.json`.
- `C3`: CivicCode source import did not persist after two UI attempts, including a complete retry with title, citation, source reference, imported-by, and marker-bearing source body. `city_work.code_sources` remained empty and the UI stayed at "No local code sources have been imported yet." Evidence: `C3-civiccode-suggest-retry.json`, `C3-city-work-after-code-retry.json`.
- `C6`: Reopen proof failed. After graceful close/relaunch, the first-run wizard reappeared with `firstRun.finished=false`, `current_step_id="finish"`, and `wizardPresent=true`, even though `B7-after-open-app.json` had shown `firstRun.finished=true`. Evidence: `C6-reopen.json`, `C6-reopen.png`.

Because these are hard Stage C gates, I stopped before destructive MSI uninstall/reinstall. No reboot was performed.

## Channel

Before Stage A:

- Remote URL: `https://github.com/CivicSuite/civicsuite.git`
- `git ls-remote`: `9143e197c29ccf4001e313b18920d27a56fa5be5`
- `FETCH_HEAD`: `9143e197c29ccf4001e313b18920d27a56fa5be5`
- Note: the heartbeat wrapper reset the checkout to `origin/stage-3a-baremetal-windows` before I had read directive 111's non-destructive sync section. After reading the directive, I proceeded non-destructively.

After Stage C stop:

- `FETCH_HEAD` recorded in `directive111-evidence/channel-after-fetch-head.txt`
- `ls-remote` recorded in `directive111-evidence/channel-after-ls-remote.txt`

## Stage A

Determination: **B - product works, form needs typed input.**

Evidence:

- `A4-ab-decisive.json`: backend `currentId="city-profile"`, `cityProfileCurrent=true`.
- Scoped wizard DOM had `.first-run-list`, current-step H3 `City profile`, all five fields, and enabled Save button.
- `cityName` was visible: `display=block`, `visibility=visible`, `opacity=1`, nonzero rect, `offsetParentNull=false`.
- Error sink was empty.

Stage A was committed and pushed before driving as commit `95676097270d255602976dcd753b397358462138`.

## Stage B

Passed through the non-destructive CDP/UI path:

- `B1-after-city-profile.json`: advanced to `first-admin`.
- `B2-after-first-admin.json`: first admin saved.
- `B3-signin-state-retry.json`: `signed_in=true`, `role=local-admin`.
- `B4-after-backup-retry.json`: advanced to model with local non-OneDrive backup root.
- `B5-after-load-runtime-model-after-runtime.json`: model `ready=true`, runtime model loaded.
- `B6-after-verify-health-final.json`: health completed and current step became `finish`.
- `B7-after-open-app.json`: `firstRun.finished=true`; staff surface opened.

Independent artifacts:

- `B5-model-path.txt`
- `B5-sha256.txt`
- `B5-ollama-api-tags-15434.json`
- `B6-ports.txt`
- `B6-processes.txt`
- `B7-first-run-progress-final.json`

## Stage C

`C1-civiccore-registry.json` confirms the model registry and bundled Ollama API evidence. `C5-civicnotice-no-ai.json` confirms CivicNotice exposed only non-AI notice actions and none of `suggest-records-response`, `suggest-code-guidance`, or `suggest-minutes-draft`.

Failed gates are listed in the summary. C7 backup/restore and C8 uninstall/reinstall were not run after the hard Stage C failure, to avoid destructive churn after a definitive FAIL.
