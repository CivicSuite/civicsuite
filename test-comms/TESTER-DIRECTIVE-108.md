# TESTER-DIRECTIVE-108

Purpose: **Liveness + readiness check only.** Confirm the DEV machine can still direct the
TESTER box over this branch, and have the TESTER report its current machine state and its
readiness to run the next campaign — verifying the **published Windows Local 1.0.0 release MSI**
on a clean machine. This is a fresh post-1.0.0 session re-establishing the channel after a 5-day
idle gap (last exchange was TESTER-RESULT-107, PASS, 2026-06-20).

## STOP — this is NOT an install and NOT a wipe

This directive **supersedes the standing `check repo` full-install procedure for this one cycle.**
Do all of the following — and nothing more:

- **Do NOT** run `civicsuite-baremetal-bootstrap.ps1`, the `installer\dist\*.cmd` customer artifact,
  or any installer.
- **Do NOT** download the MSI or the Gemma model. **Do NOT** run the Docker stack teardown.
- **Do NOT** uninstall, delete, or "clean" anything. This pass is **read-only inventory.**
- **Do NOT** reboot the machine.

Everything below is observation and reporting only. A later directive will authorize a
bare-metal wipe (preserving the Codex app) and the real 1.0.0 cleanroom install; this one does not.

## Communication channel

- Write your result only to this repository and branch: `CivicSuite/civicsuite`, branch
  `stage-3a-baremetal-windows`, under `test-comms/`.
- Result file must be exactly `test-comms/TESTER-RESULT-108.md`.
- Do not use any old bridge folder, cloud-sync folder, chat, or side channel.
- Before you start and again before you write the result, record the live remote branch state with
  `git ls-remote origin refs/heads/stage-3a-baremetal-windows`, fetch it, and record `FETCH_HEAD`.
  Your only acknowledgment is the pushed result file — never a chat summary.

## What to report (read-only)

Run quick, non-destructive probes and record the actual values. Where a probe needs network,
use a lightweight reachability check (HTTP HEAD / API ping) — **do not** pull large payloads.

1. **Channel/liveness**
   - `git ls-remote` head + `FETCH_HEAD` before and after.
   - Confirm you pulled THIS directive (108) and can push a result to this branch.
   - Codex Composer mode in use: Full Access vs Default. Note if not Full Access.

2. **Machine identity**
   - Windows edition + build number, total RAM, CPU model/cores.
   - Free disk space on every volume that holds: the repo clone, runtime cache, VM disks, and
     `%LOCALAPPDATA%`. (We need room for a ~1.65 GB MSI + a ~9.6 GB model + a clean VM.)

3. **Virtualization / VM readiness** (live-probe; do not inject or correct host facts)
   - `(Get-CimInstance Win32_ComputerSystem).HypervisorPresent`
   - `(Get-CimInstance Win32_Processor).VirtualizationFirmwareEnabled`
   - Whether Hyper-V (or another VM stack) is installed/enabled, and whether you can **restore a
     clean Windows VM snapshot** that has no CivicSuite product/profile/runtime/model state. State
     plainly: can you do VM-snapshot cleanroom, or only bare-metal cleanup?

4. **Runtime inventory (presence only — do not install/remove)**
   - Docker Desktop: installed? running? WSL2 enabled?
   - Ollama: installed? version? listening anywhere (note port if so, e.g. 15434)?
   - Gemma model file present anywhere (path + bytes + filename, e.g.
     `gemma-4-12b-it-qat-q4_0.gguf`)? Do not re-download.
   - Python versions available.

5. **CivicSuite remnant inventory (DO NOT REMOVE — just list what exists)**
   - `C:\Program Files\CivicSuite\` (and `civicsuite-desktop.exe`) present?
   - `%LOCALAPPDATA%\CivicSuite\` (data/models/backups) present? approximate sizes?
   - Any CivicSuite Windows services or running processes?
   - Any installed MSI registration for UpgradeCode `a63fc1d3-5437-5f55-89a2-fef93fb1f930`
     (the 1.0.0 product) — list ProductCode/version if present.
   - Any leftover `directive1NN-evidence/` folders or prior backup/test artifacts in the clone.

6. **Reachability for the next campaign (HEAD/metadata only, no big downloads)**
   - Can you reach the published 1.0.0 release metadata?
     `https://github.com/CivicSuite/civicsuite/releases/tag/civicsuite-windows-local-v1.0.0`
     Expected assets: `CivicSuite_0.1.0_x64_en-US.msi` (1645426125 bytes, SHA-256
     `2e5b163c7737b3534d2e5eef4fe9fd87a6af9ed0509e54b072ae7caa22db27ac`) and
     `CivicSuite-msi-evidence.txt` (578 bytes). Confirm you can *see* both assets and their sizes
     via the GitHub API — **do not download the MSI** this pass.
   - Can you reach `huggingface.co` (HEAD only) for the eventual model pull?

## Done-when (don't stop before this)

`test-comms/TESTER-RESULT-108.md` committed AND pushed to `stage-3a-baremetal-windows`, filled with
the actual probed values and a one-line **Verdict** (see below). If a hard blocker prevents the
report (no network, can't push, Codex not at Full Access), write what you have plus the blocker into
the result and push THAT.

## Verdict line (put at the top of the result)

- `Verdict: READY` — channel works, box reachable, and you can run the 1.0.0 cleanroom campaign
  (state whether via VM snapshot or bare-metal cleanup).
- `Verdict: DEGRADED` — channel works but something blocks the campaign (low disk, no VM snapshot,
  not Full Access, network gap). List exactly what.
- `Verdict: BLOCKED` — you could not complete the report; say why.

## Result template — copy into `test-comms/TESTER-RESULT-108.md` and fill in

```markdown
# TESTER-RESULT-108

Verdict: [READY / DEGRADED / BLOCKED]
Directive branch/head tested: stage-3a-baremetal-windows at [sha]

## Channel / liveness
- git ls-remote before / after: [...]
- FETCH_HEAD before / after: [...]
- Pulled directive 108: [yes/no]  | Can push result: [yes/no]
- Codex Composer mode: [Full Access / Default]

## Machine identity
- Windows: [edition + build]  | RAM: [GB]  | CPU: [model / cores]
- Free disk by volume: [C: ... / others ...]

## Virtualization / VM readiness
- HypervisorPresent: [...]  | VirtualizationFirmwareEnabled: [...]
- Hyper-V / VM stack: [...]  | Clean VM snapshot restore available: [yes/no]
- Cleanroom capability: [VM-snapshot / bare-metal-cleanup-only]

## Runtime inventory
- Docker: [installed? running? WSL2?]
- Ollama: [installed? version? port?]
- Gemma model present: [path / bytes / name, or none]
- Python: [versions]

## CivicSuite remnant inventory (not removed)
- Program Files\CivicSuite: [present? exe?]
- %LOCALAPPDATA%\CivicSuite: [present? sizes?]
- Services/processes: [...]
- MSI UpgradeCode a63fc1d3...: [ProductCode/version or none]
- Leftover evidence/backup folders: [...]

## Reachability
- 1.0.0 release assets visible via API (sizes match?): [yes/no + sizes]
- huggingface.co reachable (HEAD): [yes/no]

## Honest notes
[anything unexpected: idle drift, stale state, permissions, disk pressure, anything that felt wrong]
```

## Hard limits

Read-only this cycle — no install, no wipe, no download of large payloads, no reboot. No merge to
main, no tags, no `modules.json`/status/source edits. Push only to `stage-3a-baremetal-windows`.
Never touch any OneDrive path.
