# Tester Result 023 - standing Stage 3A re-run after gate-green docs commit

**Tester machine:** Microsoft Windows 11 Pro 10.0.26200 build 26200; Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz.
**Branch head tested:** `0bfe34ab8ac9e4ccd0fdd06a34aa046facc7e164 docs(installer): record stage3a artifact refresh gate green`
**Date/time (UTC):** 2026-06-05T20:36:23Z

## Procedure

The watchdog fetched `refs/heads/stage-3a-baremetal-windows`, reset to the branch head, detected an untested non-result head after `TESTER-RESULT-022.md`, ran the clean-stack teardown, and launched the customer one-click artifact:

```powershell
installer\dist\CivicSuite-city-core-windows-0.1.2.cmd
```

The `.cmd` extracted to:

```text
C:\Users\insty\AppData\Local\Temp\CivicSuite-12006-9224\bundle\CivicSuite-city-core-windows
```

## Bootstrap Result JSON

Bootstrap result path:

```text
C:\Users\insty\AppData\Local\Temp\CivicSuite-12006-9224\bundle\CivicSuite-city-core-windows\installer\baremetal\windows\logs\bootstrap\civicsuite-baremetal-bootstrap-result.json
```

Summary:

```json
{
  "status": "passed",
  "stage0_status": "passed",
  "stage1_status": "passed",
  "stage2_status": "passed",
  "stage3_status": "passed",
  "stage4_status": "passed",
  "completed_at": "2026-06-05T20:36:23.0708084Z",
  "duration_seconds": 471.483
}
```

Stage0 live host facts:

```json
{
  "os_caption": "Microsoft Windows 11 Pro",
  "os_version": "10.0.26200",
  "edition": "Microsoft Windows 11 Pro",
  "is_admin": true,
  "virtualization_firmware_enabled": false,
  "hypervisor_present": true,
  "internet_available": true,
  "total_memory_bytes": 17028345856
}
```

Bootstrap log tail:

```text
2026-06-05T20:28:31.6036422Z [start] Starting CivicSuite bare-metal bootstrap stage Stage0To4
2026-06-05T20:28:33.4293810Z [stage0] Stage0 target inspection finished with status passed
2026-06-05T20:28:59.4925423Z [stage1] Stage1 WSL2 feature enablement finished; restart_needed=False
2026-06-05T20:29:32.1474580Z [stage2] Host Ollama rebind to 0.0.0.0: restarted=True firewall=True ready=True
2026-06-05T20:29:32.3934239Z [stage2] Using existing Python at C:\Program Files\Python312\python.exe
2026-06-05T20:29:32.3934239Z [stage2] Stage2 prerequisite orchestration finished
2026-06-05T20:35:33.8089721Z [stage3] Stage3 warm-first installer handoff status passed
2026-06-05T20:36:23.0493113Z [stage4] Stage4 verification shell status passed
2026-06-05T20:36:23.1972056Z [result] Wrote structured result to C:\Users\insty\AppData\Local\Temp\CivicSuite-12006-9224\bundle\CivicSuite-city-core-windows\installer\baremetal\windows\logs\bootstrap\civicsuite-baremetal-bootstrap-result.json
```

## Docker/Ollama Evidence

Docker Desktop spike result:

```json
{
  "status": "passed",
  "docker_present": true,
  "installed": false,
  "wsl_integration": true,
  "engine_ready": true,
  "engine_ready_seconds": 11.577,
  "total_seconds": 11.731
}
```

Ollama bind evidence:

```text
present=True
path=C:\Users\insty\AppData\Local\Programs\Ollama\ollama.exe
ollama_host=0.0.0.0
firewall=True
restarted=True
ready=True
```

## Stage4 Evidence

Lifecycle evidence path:

```text
C:\Users\insty\AppData\Local\Temp\CivicSuite-12006-9224\bundle\CivicSuite-city-core-windows\installer\reports\stage3a-baremetal\clerk-core-installer-lifecycle.json
```

Stage4 evidence assertion:

```json
{
  "status": "passed",
  "generation_source": "ollama",
  "generation_model": "gemma4:e4b",
  "expected_generation_source": "ollama",
  "expected_generation_model": "gemma4:e4b"
}
```

Launcher URL:

```text
http://127.0.0.1:18082/
```

Critical values:

```text
generation_source=ollama
generation_model=gemma4:e4b
```

## Gate Verdict

Standing Stage 3A customer-artifact re-run: **passed**.

The run tested branch head `0bfe34ab8ac9e4ccd0fdd06a34aa046facc7e164`, after the latest non-result docs commit. Stage0 through Stage4 all passed, Docker Desktop engine readiness passed, and Stage4 verified the AI-letter proof with `generation_source=ollama` and `generation_model=gemma4:e4b`.
