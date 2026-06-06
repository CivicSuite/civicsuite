# Tester Directive 044 - CPU mmap host-Ollama full gate rerun

## Goal

Rerun the Stage 3A proven-suite clean-machine gate after builder commit `625e2c619e9e3d6a01be8f4e8d5dbcc9ee191721` added a `cpu_mmap_default` host-Ollama fallback.

`TESTER-RESULT-043.md` proved `native_default` now runs first, but it still failed with CUDA_Host allocation. This directive must prove whether forcing CPU with mmap, while avoiding forced tiny context and batch settings, can load `gemma4:e4b` on the available 16 GB/VRAM Windows host.

## Required branch truth

- Repo: `CivicSuite/civicsuite`
- Branch: `stage-3a-baremetal-windows`
- Required minimum head: `625e2c619e9e3d6a01be8f4e8d5dbcc9ee191721`
- Builder fix under test: `625e2c619e9e3d6a01be8f4e8d5dbcc9ee191721`
- Prior result to read: `test-comms/TESTER-RESULT-043.md`
- Expected result file: `test-comms/TESTER-RESULT-044.md`

## Required procedure

1. Fetch the explicit GitHub branch ref `refs/heads/stage-3a-baremetal-windows`.
2. Reset the TESTER worktree to the fetched branch head.
3. Confirm the checked-out commit is at or after `625e2c619e9e3d6a01be8f4e8d5dbcc9ee191721`.
4. Read `test-comms/TESTER-RESULT-043.md`.
5. Do not edit source, generated artifacts, `installer/modules.json`, docs outside `test-comms`, or tests.
6. Record default-port stale `llama-server` state before readiness, but do not require cleanup of port `11434`.
7. Confirm port `11435` is not already listening before readiness, or record the process if it is.
8. Run the standard clean-stack teardown from `test-comms/README.md`.
9. Verify the non-mutating proven-suite plan:

```powershell
python scripts\plan-installer.py --profile proven-suite --menu-style guided --dry-run
```

10. Run repo-local readiness with isolated host-Ollama port `11435`:

```powershell
python scripts\run-clerk-core-installer.py readiness --run-id stage3a-proven-suite-clean-machine-r20 --install-root installer\runtime\proven-suite-clean-machine-r20 --compose-project-suffix stage3a-proven-suite-clean-machine-r20 --port-offset 5000 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama --host-ollama-port 11435
```

11. Inspect the readiness lifecycle report. It must include:
   - `host_ollama_model_load.base_url=http://127.0.0.1:11435`
   - `host_ollama_model_load.container_base_url=http://host.docker.internal:11435`
   - `host_ollama_model_load.server`
   - `host_ollama_model_load.initial_cleanup`
   - `host_ollama_model_load.attempts`
   - first attempt has `profile=native_default` and `options=null`
   - second attempt, if reached, has `profile=cpu_mmap_default` and options `{num_gpu: 0, use_mmap: true, use_mlock: false}`
   - if readiness passes through the new fallback, `host_ollama_model_load.selected_profile=cpu_mmap_default`
12. If readiness fails, stop and report exact stdout/stderr/fix steps plus server and attempt evidence. Do not install.
13. If readiness passes, run install:

```powershell
python scripts\run-clerk-core-installer.py install --run-id stage3a-proven-suite-clean-machine-r20 --install-root installer\runtime\proven-suite-clean-machine-r20 --compose-project-suffix stage3a-proven-suite-clean-machine-r20 --port-offset 5000 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama --host-ollama-port 11435
```

14. If install passes, confirm the runtime host-Ollama compose overrides point service containers at `http://host.docker.internal:11435`.
15. If install passes, run verify:

```powershell
python scripts\run-clerk-core-installer.py verify --run-id stage3a-proven-suite-clean-machine-r20-verify --install-root installer\runtime\proven-suite-clean-machine-r20 --compose-project-suffix stage3a-proven-suite-clean-machine-r20 --port-offset 5000 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama --host-ollama-port 11435
```

16. If install and verify pass, inspect launcher config and live routes as in the prior proven-suite directives.
17. Write `test-comms/TESTER-RESULT-044.md` and push it to `stage-3a-baremetal-windows`.

## Required result evidence

`TESTER-RESULT-044.md` must include:

- exact branch head tested,
- confirmation `TESTER-RESULT-043.md` was read,
- host facts, including Windows edition, HypervisorPresent, VirtualizationFirmwareEnabled, total physical memory, dedicated VRAM if known, Docker/Ollama presence, Docker Desktop reported total memory, and free physical memory before readiness,
- default-port stale `llama-server` process state before readiness,
- port `11435` listener state before readiness,
- proven-suite plan result and selected module list,
- readiness lifecycle path and status,
- full `ollama_model_resources` check,
- full `host_ollama_model_load` check, including base URL, container base URL, server evidence, initial cleanup, stdout/stderr, return code, attempts, and selected profile,
- explicit first-attempt evidence for `native_default`,
- explicit second-attempt evidence for `cpu_mmap_default`, including options, return code, stdout/stderr, and whether it was selected,
- explicit confirmation that default-port cleanup access denial, if present, was recorded but did not prevent isolated-port model attempts,
- if install is reached, runtime `docker-compose.host-ollama.yml` evidence showing `http://host.docker.internal:11435`,
- source-cache evidence for all seven readiness modules if install is reached,
- install lifecycle path and status if readiness passed,
- install prewarm evidence, including selected host-Ollama profile, server, cleanup, and attempts,
- verify lifecycle path and status if install passed,
- install provenance path, `installer/modules.json` hash, and source commits if install passed,
- launcher config module URLs if install passed,
- live launcher URL evidence if verify passed,
- ten live route checks if verify passed,
- final gate verdict.

## Required diagnostics if readiness fails

If readiness fails, include:

- `ollama --version` output,
- `ollama list` output for `gemma4:e4b`,
- `ollama ps` output before and after readiness,
- isolated port `11435` `/api/tags` probe result after failure,
- direct host Ollama `/api/generate` probe on port `11435` using `gemma4:e4b`, prompt `Respond with OK.`, and options `{num_gpu: 0, use_mmap: true, use_mlock: false}`,
- available physical memory before readiness and after failure,
- top memory-consuming processes after failure,
- Docker Desktop reported memory after failure,
- whether any `ollama_llama_server` or `llama-server` process remains after failure.

## Pass criteria

Pass only if readiness passes through a real host-Ollama HTTP generation with `gemma4:e4b`, then install, verify, launcher, and all ten live route checks pass.

If readiness passes but install/verify/live routes fail, report the exact failing phase and evidence. Do not mark the gate passed until the full sequence is green.

## Constraints

Push only `test-comms/TESTER-RESULT-044.md`. No source edits during the test run. No merge, tag, status promotion, or `modules.json` changes. Never touch any OneDrive path.
