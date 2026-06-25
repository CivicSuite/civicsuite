# TESTER-RESULT-108

Verdict: READY
Directive branch/head tested: stage-3a-baremetal-windows at 2de16e90f0950fc7ccc808b020bbf73ac5acbc8e

## Channel / liveness
- git ls-remote before / after:
  - before: `2de16e90f0950fc7ccc808b020bbf73ac5acbc8e refs/heads/stage-3a-baremetal-windows`
  - after: `2de16e90f0950fc7ccc808b020bbf73ac5acbc8e refs/heads/stage-3a-baremetal-windows`
- FETCH_HEAD before / after:
  - before: `2de16e90f0950fc7ccc808b020bbf73ac5acbc8e branch 'stage-3a-baremetal-windows' of https://github.com/CivicSuite/civicsuite`
  - after: `2de16e90f0950fc7ccc808b020bbf73ac5acbc8e branch 'stage-3a-baremetal-windows' of https://github.com/CivicSuite/civicsuite`
- Pulled directive 108: yes  | Can push result: yes
- Codex Composer mode: Full Access

## Machine identity
- Windows: Microsoft Windows 11 Pro, version 10.0.26200, build 26200  | RAM: 15.86 GB  | CPU: Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz / 6 cores / 12 logical processors
- Free disk by volume: C: Windows, 42.91 GB free of 475.22 GB

## Virtualization / VM readiness
- HypervisorPresent: True  | VirtualizationFirmwareEnabled: False
- Hyper-V / VM stack: Docker Desktop WSL2 stack is present/running; `Get-VM` is available but cannot enumerate VMs from this non-admin Codex worker (`You do not have the required permission to complete this task`).
- Clean VM snapshot restore available: no verified clean VM snapshot from this session.
- Cleanroom capability: bare-metal-cleanup-only

## Runtime inventory
- Docker: installed, Docker version 29.5.2 build 79eb04c; Docker Desktop running; Docker reports Linux backend; WSL default distribution is `docker-desktop`, default version 2.
- Ollama: installed, `ollama version is 0.30.7`; running at `::`:11434 from user install and `127.0.0.1`:15434 from CivicSuite runtime.
- Gemma model present: `C:\Users\insty\AppData\Local\CivicSuite\Data\models\gemma-4-12b-it-qat-q4_0.gguf`, 6975877728 bytes; sidecars present: `.sha256.verified` 65 bytes and `.Modelfile` 299 bytes.
- Python: `python` 3.12.7; `py` 3.12.7; `python3` alias not installed (Microsoft Store alias message).

## CivicSuite remnant inventory (not removed)
- Program Files\CivicSuite: present; `civicsuite-desktop.exe` present.
- `%LOCALAPPDATA%\CivicSuite`: present.
  - `config`: 0 MB
  - `Data`: 13372.17 MB
  - `runtime`: 2300.61 MB
- Services/processes: no CivicSuite Windows services found. Running processes include `civicsuite-desktop.exe`, CivicSuite runtime `ollama.exe`, multiple CivicSuite runtime `postgres.exe` processes, and CivicSuite runtime `python.exe` processes.
- MSI UpgradeCode a63fc1d3...: CivicSuite MSI registration found by DisplayName: ProductCode `{5C23B582-9CF3-4A7A-AD0C-E2B9C9F679EA}`, DisplayVersion `0.1.0`, Publisher `CivicSuite`, InstallLocation `C:\Program Files\CivicSuite\`. No `UpgradeCode` value was exposed in the uninstall registry entry.
- Leftover evidence/backup folders: prior clone artifacts remain, including `directive100-evidence` through `directive107-evidence`, plus directive106/107 helper and fetch evidence files. These were not removed.

## Reachability
- 1.0.0 release assets visible via API (sizes match?): yes.
  - `CivicSuite_0.1.0_x64_en-US.msi`: 1645426125 bytes
  - `CivicSuite-msi-evidence.txt`: 578 bytes
- huggingface.co reachable (HEAD): yes, `HTTP/1.1 200 OK` via `curl.exe -I -L --max-time 30 https://huggingface.co/`.

## Honest notes
This was read-only inventory only. No installer, Docker teardown, wipe, large download, uninstall, cleanup, or reboot was performed. The machine is not currently clean: CivicSuite program/runtime/data/model state and prior directive evidence remain. No clean VM snapshot could be verified from this non-admin Codex worker, so the next cleanroom campaign is ready only by authorized bare-metal cleanup/wipe. DISM optional-feature probing timed out in this shell, and `Get-VM` enumeration failed due permissions; live host facts still show HypervisorPresent True and Docker/WSL2 running.
