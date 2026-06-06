# Tester Result 028 - gemma memory readiness gate fails cleanly on low-memory host

**Tester machine:** Microsoft Windows 11 Pro 10.0.26200 build 26200; Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz.
**Exact branch head tested:** `eba0220496fd00f55955662f6d4f54bb2d38ccb3 test(comms): rerun gemma memory readiness gate`
**Required minimum head satisfied:** `ee5ad2d526a1bb7d39b8dc6c687416f7d7a00469 fix(installer): block low-memory gemma readiness`
**Date/time (UTC):** 2026-06-06T03:42:10Z

## Procedure

Fetched all remotes with prune, found `TESTER-DIRECTIVE-028.md` on `origin/stage-3a-baremetal-windows`, reset the tester worktree to the fetched branch head, read `test-comms/README.md` and `test-comms/TESTER-DIRECTIVE-028.md`, then ran the directive steps without source edits.

Ran the required clean-stack teardown:

```text
=== CivicSuite stack teardown ===
no civicsuite containers
no civicsuite volumes
removed networks: 1
=== teardown complete - stack state cleared; prerequisites preserved ===
```

## Host Facts

```json
{
  "windows_edition": "Microsoft Windows 11 Pro",
  "windows_version": "10.0.26200",
  "windows_build": "26200",
  "hypervisor_present": true,
  "virtualization_firmware_enabled": false,
  "total_physical_memory_bytes": 17028345856,
  "docker_present": true,
  "ollama_present": true,
  "docker_desktop_reported_total_memory": "7.683GiB",
  "docker_mem_total_bytes": 8249558433
}
```

This host is below the directive's qualifying memory floor:

```text
required_host_memory_bytes=25769803776
required_host_memory_gb=24
detected_host_memory_bytes=17028345856
required_docker_memory_bytes=12884901888
required_docker_memory_gb=12
detected_docker_memory_bytes=8249558433
```

## Proven-Suite Plan

Command:

```powershell
python scripts\plan-installer.py --profile proven-suite --menu-style guided --dry-run
```

Result: **passed** with `mutates_host=false`.

Selected modules:

```text
civiccore
civicrecords-ai
civicclerk
civiccode
civiczone
civicplan
civicpermit
civicaccess
civicinspect
civicgrants
civicprocure
```

## Readiness Gate

Command:

```powershell
python scripts\run-clerk-core-installer.py readiness --run-id stage3a-proven-suite-clean-machine-r4 --install-root installer\runtime\proven-suite-clean-machine-r4 --compose-project-suffix stage3a-proven-suite-clean-machine-r4 --port-offset 4800 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama
```

Result: **failed cleanly before install**, as expected for this low-memory host.

Readiness lifecycle path:

```text
C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\installer\reports\stage3a-proven-suite-clean-machine-r4\clerk-core-installer-lifecycle.json
```

Readiness lifecycle status:

```text
status=failed
mode=readiness
run_id=stage3a-proven-suite-clean-machine-r4
mutates_host=false
failed_check=ollama_model_memory
model=gemma4:e4b
```

Full `ollama_model_memory` readiness check:

```json
{
  "detected_docker_memory_bytes": 8249558433,
  "detected_host_memory_bytes": 17028345856,
  "fix_steps": [
    "Use a machine with at least 24 GB RAM for gemma4:e4b; 16 GB class hosts have failed the live model prewarm gate.",
    "Increase Docker Desktop / WSL2 memory to at least 12 GB, then rerun readiness before install."
  ],
  "host_ollama": true,
  "model": "gemma4:e4b",
  "name": "ollama_model_memory",
  "required_docker_memory_bytes": 12884901888,
  "required_docker_memory_gb": 12,
  "required_host_memory_bytes": 25769803776,
  "required_host_memory_gb": 24,
  "status": "failed"
}
```

Resolved ports from readiness:

```text
civicrecords-ai api=22800 web=22880
civicclerk api=23576 web=22881
civiccode api=23620
civiczone api=23630
civicplan api=23640
civicpermit api=23650
civicaccess api=23660
civicinspect api=23661
civicgrants api=23662
civicprocure api=23663
suite-launcher web=18082
```

## Install And Verify

Install was correctly skipped because readiness failed with `ollama_model_memory` on a host below the memory floor.

```text
install_lifecycle_result_path=not_run
install_status=skipped_due_to_ollama_model_memory_readiness_failure
verify_lifecycle_result_path=not_run
verify_status=skipped_due_to_readiness_failure
```

No CivicSuite containers were running after the readiness failure:

```text
docker_ps_after_readiness_failure=no running containers
```

Launcher URL evidence and ten live module route checks were not run because this low-memory host correctly stopped at readiness before install.

## Gate Verdict

Directive 028 result: **PASSED for low-memory fail-clean criterion**.

On this tester host, readiness failed before install with `ollama_model_memory`, reported detected host/Docker memory below the required 24 GB host and 12 GB Docker/WSL floor, and returned clear fix steps. Install and verify were not run, as directed.

No source files, generated artifacts, `installer/modules.json`, docs outside `test-comms`, tests, merges, tags, or status files were edited during this test run.
