# TESTER-DIRECTIVE-110

Purpose: **Read-only post-manual-first-run state probe.** After TESTER-RESULT-109, a human
operator manually clicked the installed app's `Review and continue` first-run control plus 2–3
additional buttons to the bottom of the setup screen, with **no visible progress indicators**.
We need authoritative ground truth on whether those clicks actually **materialized the product
runtime/profile/model**, or only advanced the UI with no backend effect.

This is **NOT** a wipe, install, re-run, or reboot. Do not click or drive the app further, do not
re-run first-run, do not uninstall, do not download anything. **Observe and report only.**

## STOP — read-only

- Do NOT run any installer, bootstrapper, or `installer\dist\*.cmd`.
- Do NOT uninstall, clean, wipe, or delete anything. Do NOT reboot.
- Do NOT advance, reset, or re-trigger first-run setup. Leave the app exactly as the operator left it.
- This directive **supersedes the standing `check repo` install procedure** for this cycle.

## Communication channel

- Result only to `CivicSuite/civicsuite`, branch `stage-3a-baremetal-windows`,
  file exactly `test-comms/TESTER-RESULT-110.md`. Your only ack is the pushed result file.
- Before start and before writing the result, record `git ls-remote origin
  refs/heads/stage-3a-baremetal-windows`, fetch, and record `FETCH_HEAD`.

## Context (from RESULT-109)

- Published 1.0.0 MSI installed clean (ProductCode `{7BE25830-15EE-4797-A25F-DF614ACA9B8E}`,
  DisplayVersion `0.1.0`). At the end of 109, `%LOCALAPPDATA%\CivicSuite` was **absent** and no
  bundled Ollama/Postgres/runtime listener existed — because the harness could not advance the
  WebView first-run button. A human has since clicked through that screen.

## What to report (read-only)

1. **Channel:** ls-remote + FETCH_HEAD before/after; confirm you can push.
2. **Profile/state directory:** does `%LOCALAPPDATA%\CivicSuite\` exist **now**? Full recursive
   listing with sizes of `config`, `Data`, `runtime`, and any `backups`. Call out any
   `config`/profile JSON, first-admin record, or city-profile selection that now exists.
3. **Database:** is a product Postgres data directory initialized (path + presence)? Any
   CivicCore/city DB created?
4. **Runtime processes:** list running `civicsuite-desktop.exe`, bundled `ollama.exe`, bundled
   `postgres.exe`, runtime `python.exe`. For each, the executable path (Program Files payload vs
   user runtime).
5. **Listeners/health:** is anything listening on `127.0.0.1:15434` (product Ollama) and
   `127.0.0.1:15480` (runtime API)? Capture `GET http://127.0.0.1:15480/health` and the product
   Ollama `/api/tags` responses if reachable (do not start them if down — just report down).
6. **Model:** list the model dir (`%LOCALAPPDATA%\CivicSuite\Data\models` or equivalent) — any
   `gemma-4-12b-it-qat-q4_0.gguf` or `.part` present (did a download start)? Sizes.
7. **App screen:** capture a screenshot of the current installed-app window and describe what it
   shows now (setup-complete? a dashboard/home? still a checklist step? an error/blank?). Save as
   `directive110-evidence/current-app-screen.png`.
8. **Logs:** tail any first-run / setup / supervisor / runtime logs under
   `C:\Program Files\CivicSuite\` or `%LOCALAPPDATA%\CivicSuite\` that show what the manual clicks
   triggered, or any errors/exceptions during/after first-run.

## Verdict (top of result)

- `Verdict: RUNTIME-MATERIALIZED` — profile created AND product runtime (Ollama/Postgres/API) is
  up after the manual click-through.
- `Verdict: PARTIAL` — some state created but runtime not fully up (say exactly what exists vs missing).
- `Verdict: NOTHING-MATERIALIZED` — clicks advanced the UI but no profile/runtime/model state was
  created (first-run did not actually do its backend work).

## Result template — `test-comms/TESTER-RESULT-110.md`

```markdown
# TESTER-RESULT-110
Verdict: [RUNTIME-MATERIALIZED / PARTIAL / NOTHING-MATERIALIZED]
Directive head: stage-3a-baremetal-windows at [sha]

## Channel
- ls-remote / FETCH_HEAD before/after: [...]  | can push: [yes/no]
## %LOCALAPPDATA%\CivicSuite
- exists: [yes/no]; tree+sizes: [...]; profile/admin/city-profile: [...]
## Database
- product Postgres data dir: [...]; city DB: [...]
## Runtime processes
- desktop/ollama/postgres/python: [paths or absent]
## Listeners / health
- :15434 [up/down]; :15480 [up/down]; /health: [...]; /api/tags: [...]
## Model
- model dir contents: [.gguf/.part/sizes or none]
## App screen
- current state: [...]; screenshot path: directive110-evidence/current-app-screen.png
## Logs
- first-run/setup/supervisor log tails: [...]
## Honest notes
- [anything unexpected]
```

## Hard limits

Read-only. No install, no wipe, no reboot, no first-run re-trigger, no downloads. No merge to main,
no tags, no `modules.json`/status/source edits. Push only to `stage-3a-baremetal-windows`. Never
touch any OneDrive path.
