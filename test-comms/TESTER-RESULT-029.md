# Tester Result 029 - qualifying host unavailable

**Tester machine:** Microsoft Windows 11 Pro 10.0.26200 build 26200; Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz.
**Exact branch head tested:** `a8bed476feaea562c1b7c0bbcf5626d187821eb3 test(comms): request qualifying-host proven-suite gate`
**Required minimum head satisfied:** `2dd4aff37779dd0d1a0c6060e361b85f3430a68f test(comms): add tester result 028`
**Date/time (UTC):** 2026-06-06T03:48:20Z

## Procedure

Fetched all remotes with prune, found `TESTER-DIRECTIVE-029.md` on `origin/stage-3a-baremetal-windows`, reset the tester worktree to the fetched branch head, read `test-comms/README.md`, `test-comms/TESTER-DIRECTIVE-029.md`, and `test-comms/TESTER-RESULT-028.md`.

`TESTER-RESULT-028.md` was read and confirmed as the prior low-memory fail-clean result.

Directive 029 requires a qualifying Windows host before running the full proven-suite gate. This current tester host does not meet the qualification floor, so install was not run.

## Host Facts

```json
{
  "windows_edition": "Microsoft Windows 11 Pro",
  "windows_version": "10.0.26200",
  "windows_build": "26200",
  "cpu": "Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz",
  "hypervisor_present": true,
  "virtualization_firmware_enabled": false,
  "total_physical_memory_bytes": 17028345856,
  "docker_present": true,
  "ollama_present": true,
  "docker_mem_total_bytes": 8249237504
}
```

Docker Desktop reported approximately `7.683GiB` total memory.

Workspace path checked:

```text
C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite
```

The workspace path is not under OneDrive.

## Qualification Verdict

Directive 029 host requirements:

```text
required_host_physical_memory_bytes=25769803776
required_host_physical_memory_gb=24
detected_host_physical_memory_bytes=17028345856
host_memory_qualification=failed

required_docker_wsl_memory_bytes=12884901888
required_docker_wsl_memory_gb=12
detected_docker_wsl_memory_bytes=8249237504
docker_wsl_memory_qualification=failed

docker_desktop_running=true
ollama_present=true
windows_edition_qualification=passed
onedrive_workspace_path=false
```

This host is a 16 GB class machine with Docker Desktop reporting about 7.68 GiB, below the required 24 GB host RAM and 12 GB Docker/WSL memory floor.

## Gate Steps

Because no qualifying host is available, the following steps were not run:

```text
clean-stack teardown=not_run_due_to_qualifying_host_unavailable
proven-suite plan=not_run_due_to_qualifying_host_unavailable
readiness_lifecycle_path=not_run_due_to_qualifying_host_unavailable
readiness_status=not_run_due_to_qualifying_host_unavailable
ollama_model_memory_readiness_check=not_run_due_to_qualifying_host_unavailable
source-cache evidence=not_run_due_to_qualifying_host_unavailable
install_lifecycle_path=not_run_due_to_qualifying_host_unavailable
install_status=not_run_due_to_qualifying_host_unavailable
verify_lifecycle_path=not_run_due_to_qualifying_host_unavailable
verify_status=not_run_due_to_qualifying_host_unavailable
install_provenance=not_run_due_to_qualifying_host_unavailable
launcher_config_module_urls=not_run_due_to_qualifying_host_unavailable
live_launcher_url_evidence=not_run_due_to_qualifying_host_unavailable
live_module_route_evidence=not_run_due_to_qualifying_host_unavailable
readiness_only_module_blocker_responses=not_run_due_to_qualifying_host_unavailable
```

## Final Verdict

Directive 029 result: **BLOCKED - qualifying host unavailable**.

The Stage 3A full clean-machine gate is not passed. A qualifying Windows 11 Pro or Enterprise host with at least 24 GB physical RAM and Docker Desktop / WSL2 reporting at least 12 GB total memory is required before rerunning readiness, install, verify, launcher, and live route checks.

No source files, generated artifacts, `installer/modules.json`, docs outside `test-comms`, tests, merges, tags, or status files were edited during this test run.
