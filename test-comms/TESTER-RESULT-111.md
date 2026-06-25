# TESTER-RESULT-111

Verdict: PENDING - Stage A capture-first evidence pushed before driving.

Directive head: stage-3a-baremetal-windows at `9143e197c29ccf4001e313b18920d27a56fa5be5`

## Channel - before Stage A

- Remote URL: `https://github.com/CivicSuite/civicsuite.git`
- `git ls-remote https://github.com/CivicSuite/civicsuite.git stage-3a-baremetal-windows`: `9143e197c29ccf4001e313b18920d27a56fa5be5`
- `FETCH_HEAD` before Stage A: `9143e197c29ccf4001e313b18920d27a56fa5be5`
- Note: the heartbeat wrapper reset the local checkout to `origin/stage-3a-baremetal-windows` before I had read directive 111's non-destructive sync section. After reading the directive, I proceeded non-destructively.

## Stage A - decisive A/B evidence

Determination: **B - product works, form needs typed input.**

Primary evidence: `directive111-evidence/A4-ab-decisive.json`.

Captured facts:

- CDP target was reachable on `127.0.0.1:9222`.
- Tauri bridge was reachable via `window.__TAURI_INTERNALS__.invoke("get_app_state")`.
- Backend first-run state:
  - `currentId`: `city-profile`
  - `finished`: `false`
  - `status`: `Needs setup`
  - `cityProfileCurrent`: `true`
  - completed prior steps: `unsigned-beta`, `smartscreen`, `locations`, `modules`
- Scoped wizard DOM:
  - `.first-run-list` present
  - global `cityName` input count: `1`
  - current-step H3: `City profile`
  - current step has all five fields: `cityName`, `state`, `timeZone`, `recordsContact`, `clerkContact`
  - `button[data-first-run-action="create-city-profile"][data-step-id="city-profile"]` present
  - Save button disabled: `false`
  - `cityName` style: `display=block`, `visibility=visible`, `opacity=1`, width `272.1253356933594`, height `37.99257278442383`, `offsetParentNull=false`
  - persistent error sink: `[]`

Additional Stage A artifacts:

- `directive111-evidence/A0-config-backup/`
- `directive111-evidence/A0-config-listing.txt`
- `directive111-evidence/A1-exe-path.txt`
- `directive111-evidence/A2-cdp-version.json`
- `directive111-evidence/A2-cdp-targets.json`
- `directive111-evidence/A2-ws-url.txt`
- `directive111-evidence/A4-first-run-list.html`
- `directive111-evidence/A4-first-run-list.txt`
- `directive111-evidence/A4-action-result.txt`
- `directive111-evidence/A4-screenshot.png`

## Next

Per directive 111, this Stage A capture-first commit is pushed before any field fill or first-run action driving. Stage B driving starts after this durable capture.
