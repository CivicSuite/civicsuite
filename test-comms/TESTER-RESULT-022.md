# Tester Result 022 - regenerated artifact Stage 3A re-gate

**Tester machine:** Microsoft Windows 11 Pro 10.0.26200 build 26200; Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz.
**Branch head tested:** `28c81b292e1e29c1cf9e5e432a3ae0f0946f0feb docs(audit): add stage3a full audit and walkthrough`
**Minimum directive head satisfied:** `a53bad3452cda2b75e284e8dea3250d6365fa151 build(installer): refresh stage3a customer artifact after guidance fix`
**Date/time (UTC):** 2026-06-05T19:30:13Z

## Procedure

Fetched explicit GitHub branch ref `refs/heads/stage-3a-baremetal-windows`, reset the tester worktree to `origin/stage-3a-baremetal-windows`, read `test-comms/README.md` and `test-comms/TESTER-DIRECTIVE-022.md`, verified the regenerated customer artifact hashes, ran the clean-stack teardown, then ran the customer one-click artifact:

```powershell
installer\dist\CivicSuite-city-core-windows-0.1.2.cmd
```

The `.cmd` extracted to:

```text
C:\Users\insty\AppData\Local\Temp\CivicSuite-31487-19239\bundle\CivicSuite-city-core-windows
```

It launched the bare-metal bootstrap path under:

```text
C:\Users\insty\AppData\Local\Temp\CivicSuite-31487-19239\bundle\CivicSuite-city-core-windows\installer\baremetal\windows\
```

## Artifact Hashes

Observed Windows zip SHA256:

```text
108e3429344f75638ec707b391316598a4fdf784577014515226f919dbdd92fc  CivicSuite-city-core-windows-0.1.2.zip
```

Observed Windows one-click SHA256:

```text
7d6ea3d9ac8f32c7c484fd352addcd08acc614d15336a4ba84f9e3c81c222d2f  CivicSuite-city-core-windows-0.1.2.cmd
```

Both observed hashes match the expected values in `installer/dist/CivicSuite-city-core-0.1.2-SHA256SUMS.txt` and `TESTER-DIRECTIVE-022.md`.

## Bootstrap Result JSON

Bootstrap result path:

```text
C:\Users\insty\AppData\Local\Temp\CivicSuite-31487-19239\bundle\CivicSuite-city-core-windows\installer\baremetal\windows\logs\bootstrap\civicsuite-baremetal-bootstrap-result.json
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
  "completed_at": "2026-06-05T19:30:12.8931562Z",
  "duration_seconds": 568.794
}
```

Stage0 live host facts from the JSON:

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

Stage1 status:

```text
stage1_status=passed
restart_needed=False
```

Bootstrap log tail:

```text
2026-06-05T19:20:44.1065376Z [start] Starting CivicSuite bare-metal bootstrap stage Stage0To4
2026-06-05T19:20:52.3699314Z [stage0] Stage0 target inspection finished with status passed
2026-06-05T19:21:19.4533031Z [stage1] Stage1 WSL2 feature enablement finished; restart_needed=False
2026-06-05T19:22:27.2807493Z [stage2] Host Ollama rebind to 0.0.0.0: restarted=True firewall=True ready=True
2026-06-05T19:22:27.6324877Z [stage2] Using existing Python at C:\Program Files\Python312\python.exe
2026-06-05T19:22:27.6324877Z [stage2] Stage2 prerequisite orchestration finished
2026-06-05T19:29:21.7297685Z [stage3] Stage3 warm-first installer handoff status passed
2026-06-05T19:30:12.8643461Z [stage4] Stage4 verification shell status passed
2026-06-05T19:30:13.0347690Z [result] Wrote structured result to C:\Users\insty\AppData\Local\Temp\CivicSuite-31487-19239\bundle\CivicSuite-city-core-windows\installer\baremetal\windows\logs\bootstrap\civicsuite-baremetal-bootstrap-result.json
```

## Docker Desktop and Ollama Evidence

Docker Desktop spike result path:

```text
C:\Users\insty\AppData\Local\Temp\CivicSuite-31487-19239\bundle\CivicSuite-city-core-windows\installer\baremetal\windows\logs\bootstrap\docker-desktop\docker-desktop-spike-result.json
```

Docker Desktop spike summary:

```json
{
  "status": "passed",
  "docker_present": true,
  "installed": false,
  "wsl_integration": true,
  "engine_ready": true,
  "engine_ready_seconds": 19.452,
  "total_seconds": 19.713
}
```

Ollama bind evidence from Stage2:

```json
{
  "present": true,
  "path": "C:\\Users\\insty\\AppData\\Local\\Programs\\Ollama\\ollama.exe",
  "ollama_host": "0.0.0.0",
  "firewall": true,
  "restarted": true,
  "ready": true
}
```

## Stage3 and Stage4 Evidence

Stage3 warm-first installer handoff:

```text
stage3_status=passed
exit_code=0
run_id=stage3a-baremetal
```

Lifecycle evidence path:

```text
C:\Users\insty\AppData\Local\Temp\CivicSuite-31487-19239\bundle\CivicSuite-city-core-windows\installer\reports\stage3a-baremetal\clerk-core-installer-lifecycle.json
```

Stage4 evidence assertion:

```json
{
  "status": "passed",
  "evidence_path": "C:\\Users\\insty\\AppData\\Local\\Temp\\CivicSuite-31487-19239\\bundle\\CivicSuite-city-core-windows\\installer\\reports\\stage3a-baremetal\\clerk-core-installer-lifecycle.json",
  "generation_source": "ollama",
  "generation_model": "gemma4:e4b",
  "expected_generation_source": "ollama",
  "expected_generation_model": "gemma4:e4b"
}
```

Launcher URL evidence:

```text
http://127.0.0.1:18082/
```

Critical values:

```text
generation_source=ollama
generation_model=gemma4:e4b
```

## Gate Verdict

Directive 022 regenerated customer-artifact Stage 3A re-gate: **passed**.

The run came from the regenerated customer one-click artifact on branch head `28c81b292e1e29c1cf9e5e432a3ae0f0946f0feb`, which is after required minimum head `a53bad3452cda2b75e284e8dea3250d6365fa151`. Stage0 through Stage4 all passed. Docker Desktop engine readiness passed. Stage4 verified the local AI-letter proof with `generation_source=ollama` and `generation_model=gemma4:e4b`, and the launcher URL was reported as `http://127.0.0.1:18082/`.
