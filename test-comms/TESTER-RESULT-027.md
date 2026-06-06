# Tester Result 027 - proven-suite source-cache fixed, install blocked by model memory

**Tester machine:** Microsoft Windows 11 Pro 10.0.26200 build 26200; Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz.
**Exact branch head tested:** `24502bc28b54a084ff309dfbf8c75587c291704e test(comms): rerun proven-suite source-cache gate`
**Required minimum head satisfied:** `f19a12591c961803648ed4e1a642ff4338e912ce fix(installer): fetch missing proven-suite source pins`
**Date/time (UTC):** 2026-06-06T03:16:24Z

## Procedure

Fetched explicit GitHub branch ref `refs/heads/stage-3a-baremetal-windows`, reset the tester worktree to `origin/stage-3a-baremetal-windows`, read `test-comms/README.md` and `test-comms/TESTER-DIRECTIVE-027.md`, then ran the directive steps without source edits.

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
  "ollama_present": true
}
```

Docker Desktop reported `Total Memory: 7.683GiB` in the readiness report.

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
python scripts\run-clerk-core-installer.py readiness --run-id stage3a-proven-suite-clean-machine-r3 --install-root installer\runtime\proven-suite-clean-machine-r3 --compose-project-suffix stage3a-proven-suite-clean-machine-r3 --port-offset 4800 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama
```

Result: **passed**.

Readiness lifecycle status:

```text
status=passed
mode=readiness
run_id=stage3a-proven-suite-clean-machine-r3
install_root=installer\runtime\proven-suite-clean-machine-r3
port_offset=4800
```

Resolved ports:

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

## Install Gate

Command:

```powershell
python scripts\run-clerk-core-installer.py install --run-id stage3a-proven-suite-clean-machine-r3 --install-root installer\runtime\proven-suite-clean-machine-r3 --compose-project-suffix stage3a-proven-suite-clean-machine-r3 --port-offset 4800 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama
```

Result: **failed**.

Install lifecycle result path:

```text
C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\installer\reports\stage3a-proven-suite-clean-machine-r3\clerk-core-installer-lifecycle.json
```

Install lifecycle status:

```text
status=failed
mode=install
failed_step=ollama_prewarm_model
module=civicrecords-ai
model=gemma4:e4b
```

Raw blocker:

```text
Error: 500 Internal Server Error: llama-server process has terminated: exit status 1: ggml_backend_cpu_buffer_type_alloc_buffer: failed to allocate buffer of size 5831117920
alloc_tensor_range: failed to allocate CUDA_Host buffer of size 5831117920
error loading model: unable to allocate CUDA_Host buffer
```

Installer-provided fix guidance:

```text
The selected response-letter model gemma4:e4b did not load successfully.
Increase Docker Desktop / WSL2 memory above the model requirement and rerun repair/verify, or select a supported smaller model.
Review the Ollama container logs for the exact model-load error.
```

## Verify Gate

Verify was not run because install failed before a complete runtime was available.

```text
verify_lifecycle_result_path=not_run
verify_status=not_run_due_to_install_failure
```

## Source-Cache Evidence

The seven previously missing clean-machine modules were fetched/staged under:

```text
installer\runtime\proven-suite-clean-machine-r3\source-cache\
```

Every staged `SOURCE_COMMIT.txt` matched the source commit declared in `installer/modules.json`:

```text
civiczone    declared=8ffa001b22138a526684153448100fadd7de5fd7 actual=8ffa001b22138a526684153448100fadd7de5fd7 match=true
civicplan    declared=ceae24c4ab187d0c8f4f81088c5f741c1b59e0ab actual=ceae24c4ab187d0c8f4f81088c5f741c1b59e0ab match=true
civicpermit  declared=877a13642d82afaca276f7b7107e7ec6ddbab7d1 actual=877a13642d82afaca276f7b7107e7ec6ddbab7d1 match=true
civicaccess  declared=d9c1a7cf55a905d8c46cffd43d831d874e198ede actual=d9c1a7cf55a905d8c46cffd43d831d874e198ede match=true
civicinspect declared=d8af9fb3972592637e1622318afbc474eb3aa491 actual=d8af9fb3972592637e1622318afbc474eb3aa491 match=true
civicgrants  declared=05804d589bf7c58b4d5b8d88745772a8e910f34b actual=05804d589bf7c58b4d5b8d88745772a8e910f34b match=true
civicprocure declared=0aa998feab3736db071920e3869462598758c23d actual=0aa998feab3736db071920e3869462598758c23d match=true
```

Source-cache conclusion: **builder fix `f19a12591c961803648ed4e1a642ff4338e912ce` fixed the missing-source blocker from results 025/026.**

## Install Provenance

Current `installer/modules.json` SHA256:

```text
1B9B1AE4EF8EBCA81C399CAB2F68E97937B30173092055753DF72473B884C4ED
```

Relevant source commits declared in `installer/modules.json`:

```text
civiccore       9f7e3a5a0156fca779b48076d49c13181d15151c
civicrecords-ai cddc4d2be856badfbc7c6bdd26917a34ef535677
civicclerk      af8b989a8d64ba709d1b204ec231364484619f7b
civiccode       a960bba0a2249d118b593dd61bee3a65a69a9d77
civiczone       8ffa001b22138a526684153448100fadd7de5fd7
civicplan       ceae24c4ab187d0c8f4f81088c5f741c1b59e0ab
civicpermit     877a13642d82afaca276f7b7107e7ec6ddbab7d1
civicaccess     d9c1a7cf55a905d8c46cffd43d831d874e198ede
civicinspect    d8af9fb3972592637e1622318afbc474eb3aa491
civicgrants     05804d589bf7c58b4d5b8d88745772a8e910f34b
civicprocure    0aa998feab3736db071920e3869462598758c23d
```

Install provenance report was not created because install failed before completion:

```text
installer\reports\stage3a-proven-suite-clean-machine-r3\install-provenance.json=missing
```

## Launcher Config

Launcher config existed at:

```text
installer\runtime\proven-suite-clean-machine-r3\suite-launcher\civicsuite-launcher-config.json
```

Configured launcher URL:

```text
http://127.0.0.1:18082/
```

Configured module URLs:

```text
CivicRecords AI http://127.0.0.1:22880/
CivicClerk      http://127.0.0.1:22881/
CivicCode       http://127.0.0.1:23620/civiccode
CivicZone       http://127.0.0.1:23630/civiczone
CivicPlan       http://127.0.0.1:23640/civicplan
CivicPermit     http://127.0.0.1:23650/civicpermit
CivicAccess     http://127.0.0.1:23660/civicaccess
CivicInspect    http://127.0.0.1:23661/civicinspect
CivicGrants     http://127.0.0.1:23662/civicgrants
CivicProcure    http://127.0.0.1:23663/civicprocure
```

CivicCode is configured to open `/civiccode`, not the API JSON root.

Live launcher and live route evidence were not gathered because install failed before verify and no CivicSuite containers were running afterward:

```text
docker_ps_after_failure=no running containers
live_launcher_url=not_run_due_to_install_failure
live_route_evidence_CivicRecords_AI=not_run_due_to_install_failure
live_route_evidence_CivicClerk=not_run_due_to_install_failure
live_route_evidence_CivicCode_civiccode=not_run_due_to_install_failure
live_route_evidence_CivicZone=not_run_due_to_install_failure
live_route_evidence_CivicPlan=not_run_due_to_install_failure
live_route_evidence_CivicPermit=not_run_due_to_install_failure
live_route_evidence_CivicAccess=not_run_due_to_install_failure
live_route_evidence_CivicInspect=not_run_due_to_install_failure
live_route_evidence_CivicGrants=not_run_due_to_install_failure
live_route_evidence_CivicProcure=not_run_due_to_install_failure
```

Expected not-ready blocker responses for readiness-only modules were not observed because install failed before services were available.

## Gate Verdict

Directive 027 proven-suite clean-machine rerun: **BLOCKED / FAILED**.

The source-cache fix worked: all seven previously missing modules were staged under `source-cache\`, and every `SOURCE_COMMIT.txt` matched `installer/modules.json`. The next blocker is install-time `gemma4:e4b` model prewarm failure on this tester machine: Ollama/llama-server could not allocate a 5,831,117,920 byte CUDA_Host buffer. Readiness passed, but install failed before verify, live launcher proof, live module route proof, install provenance proof, and readiness-only blocker response proof.

No source files, generated artifacts, `installer/modules.json`, docs outside `test-comms`, tests, merges, tags, or status files were edited during this test run.
