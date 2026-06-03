# Tester Result 001 - CivicSuite Stage 3A bare-machine live gate
**Tester machine:** Microsoft Windows 11 Pro 10.0.26200 build 26200; 16,629,244 KB visible RAM; Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz, 6 cores / 12 logical processors. `wsl.exe` was present; `docker` and `ollama` were not found on PATH before install.
**Date/time (UTC):** 2026-06-03T04:43:10.1005610Z
**Bootstrapper result status:** elevation_requested-then-failed - the first medium-integrity invocation requested elevation and exited 0; the elevated child ran Stage0 and failed because hardware virtualization is disabled in firmware.

## Phase results (from the elevated run)
- Stage0 (inspect): failed - Windows-version check passed on build 26200; Windows edition, local-admin, and internet checks passed; hardware-virtualization check failed with `virtualization_firmware_enabled: false`.
- Stage1 (WSL2 enable + reboot): skipped - Stage0 failed before WSL2 enable; no reboot occurred.
- Stage2 (Docker + Ollama install): skipped - Stage0 failed before install.
- Stage3 (city-core stack): skipped - Stage0 failed before stack startup.
- Stage4 (verify): skipped - Stage0 failed before verification.

## THE CRITICAL CHECK
- generation_source: null
- generation_model: null
- VERDICT: FAIL - no response-letter proof was generated because the installer stopped at Stage0 before Ollama/model/stack setup.

## Suite launcher
- http://localhost:18082 serving: no
- Module URLs: none printed; installer stopped at Stage0.

## Evidence path
Bootstrap result JSON:
`C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\installer\baremetal\windows\logs\civicsuite-baremetal-bootstrap-result.json`

Lifecycle evidence JSON:
`C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\installer\reports\stage3a-baremetal\clerk-core-installer-lifecycle.json` was missing.

Key log excerpts:
- `2026-06-03T04:42:14.1969349Z [stage0] Requesting UAC elevation for CivicSuite bare-metal bootstrap`
- `2026-06-03T04:42:14.9175031Z [start] Starting CivicSuite bare-metal bootstrap stage Stage0Stage1`
- `2026-06-03T04:42:19.2492382Z [stage0] Stage0 target inspection finished with status failed`
- Result JSON Stage0 failed check: `hardware-virtualization`, message `Hardware virtualization must already be enabled for WSL2/Docker Desktop.`, action `Enable virtualization in firmware/BIOS before rerunning.`

## Honest notes
The revised directive was correct: the non-elevated Codex worker successfully launched an elevated child via `Start-Process -Verb RunAs`. The elevated child detected local admin rights and Windows 11 Pro build 26200, then stopped honestly because firmware virtualization is disabled. No reboot happened, no Docker/Ollama install started, and no CivicSuite containers were launched.
