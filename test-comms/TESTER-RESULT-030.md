# Tester Result 030 - qualifying host unavailable after memory-floor refresh

**Tester machine:** Microsoft Windows 11 Pro 10.0.26200 build 26200; Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz.
**Exact branch head tested:** `32e49ba0299fa2c3b137af3fc880d9e2024daa4a test(comms): refresh qualifying-host gate directive`
**Required minimum head satisfied:** `e24a18cf64d4b27af22c6110dcda7a4e659b176e docs(installer): document gemma memory floor`
**Date/time (UTC):** 2026-06-06T04:11:36Z

## Procedure

Fetched all remotes with prune, found `TESTER-DIRECTIVE-030.md` on `origin/stage-3a-baremetal-windows`, reset the tester worktree to the fetched branch head, read `test-comms/README.md`, `test-comms/TESTER-DIRECTIVE-030.md`, and `test-comms/TESTER-RESULT-029.md`.

`TESTER-RESULT-029.md` was read and confirmed as the prior qualifying-host-unavailable result.

Directive 030 says this current 16 GB host, even with dedicated VRAM, should be treated as non-qualifying unless branch readiness itself reports passed. Directive 030 also says to run the clean-stack teardown only if the host qualifies. This host does not qualify, so teardown, readiness, install, and verify were not run.

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
  "docker_mem_total_bytes": 8249237504,
  "gpus": [
    {
      "name": "Intel(R) UHD Graphics 630",
      "adapter_ram_bytes": 1073741824
    },
    {
      "name": "NVIDIA GeForce GTX 1660 Ti",
      "adapter_ram_bytes": 4293918720
    }
  ]
}
```

Docker Desktop reported approximately `7.683GiB` total memory.

Workspace path checked:

```text
C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite
```

The workspace path is not under OneDrive.

## Qualification Verdict

Directive 030 host requirements:

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
dedicated_vram_does_not_replace_host_ram=true
```

This host remains a 16 GB class machine with Docker Desktop reporting about 7.68 GiB, below the required 24 GB host RAM and 12 GB Docker/WSL memory floor. The detected NVIDIA adapter RAM does not satisfy the host RAM requirement because the prior blocker was a `CUDA_Host` pinned host-memory allocation failure.

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
ten_live_module_route_checks=not_run_due_to_qualifying_host_unavailable
```

## Final Verdict

Directive 030 result: **BLOCKED - qualifying host unavailable**.

The Stage 3A full clean-machine gate is not passed. A qualifying Windows 11 Pro or Enterprise host with at least 24 GB physical RAM and Docker Desktop / WSL2 reporting at least 12 GB total memory is required before rerunning readiness, install, verify, launcher, and live route checks.

No source files, generated artifacts, `installer/modules.json`, docs outside `test-comms`, tests, merges, tags, or status files were edited during this test run.
