# Tester Directive 039 - isolated host-Ollama port rerun

## Goal

Rerun the Stage 3A `proven-suite` clean-machine gate after builder commit `d5ca7081dba1c87aac67c97cca58030fd7c847bf` added a configurable host-Ollama endpoint and runtime compose patching.

`TESTER-RESULT-038.md` proved the default host-Ollama service on port `11434` is poisoned by stale inaccessible `llama-server.exe` workers in the current tester session. This directive tests the product path using an isolated host-Ollama server on port `11435`, while keeping `gemma4:e4b` and the real `generation_source=ollama` gate unchanged.

## Required branch truth

- Repo: `CivicSuite/civicsuite`
- Branch: `stage-3a-baremetal-windows`
- Required minimum head: `d5ca7081dba1c87aac67c97cca58030fd7c847bf`
- Builder fix under test: `d5ca7081dba1c87aac67c97cca58030fd7c847bf`
- Prior result to read: `test-comms/TESTER-RESULT-038.md`
- Expected result file: `test-comms/TESTER-RESULT-039.md`

## Required procedure

1. Fetch the explicit GitHub branch ref `refs/heads/stage-3a-baremetal-windows`.
2. Reset the TESTER worktree to the fetched branch head.
3. Confirm the checked-out commit is at or after `d5ca7081dba1c87aac67c97cca58030fd7c847bf`.
4. Read `test-comms/TESTER-RESULT-038.md`.
5. Do not edit source, generated artifacts, `installer/modules.json`, docs outside `test-comms`, or tests.
6. Record default-port stale `llama-server` state before readiness, but do not require cleanup of port `11434`.
7. Run the standard clean-stack teardown from `test-comms/README.md`.
8. Verify the non-mutating proven-suite plan:

```powershell
python scripts\plan-installer.py --profile proven-suite --menu-style guided --dry-run
```

9. Run repo-local readiness with isolated host-Ollama port `11435`:

```powershell
python scripts\run-clerk-core-installer.py readiness --run-id stage3a-proven-suite-clean-machine-r15 --install-root installer\runtime\proven-suite-clean-machine-r15 --compose-project-suffix stage3a-proven-suite-clean-machine-r15 --port-offset 5000 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama --host-ollama-port 11435
```

10. Inspect the readiness lifecycle report. It must include:
   - `host_ollama_model_load.base_url=http://127.0.0.1:11435`
   - `host_ollama_model_load.container_base_url=http://host.docker.internal:11435`
   - `host_ollama_model_load.server`
   - `host_ollama_model_load.attempts`
   - `host_ollama_model_load.selected_profile`
11. If readiness fails, stop and report exact stdout/stderr/fix steps plus server evidence. Do not install.
12. If readiness passes, run install:

```powershell
python scripts\run-clerk-core-installer.py install --run-id stage3a-proven-suite-clean-machine-r15 --install-root installer\runtime\proven-suite-clean-machine-r15 --compose-project-suffix stage3a-proven-suite-clean-machine-r15 --port-offset 5000 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama --host-ollama-port 11435
```

13. If install passes, confirm the runtime host-Ollama compose overrides point service containers at `http://host.docker.internal:11435`.
14. If install passes, run verify:

```powershell
python scripts\run-clerk-core-installer.py verify --run-id stage3a-proven-suite-clean-machine-r15-verify --install-root installer\runtime\proven-suite-clean-machine-r15 --compose-project-suffix stage3a-proven-suite-clean-machine-r15 --port-offset 5000 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama --host-ollama-port 11435
```

15. If install and verify pass, inspect launcher config and live routes as in the prior proven-suite directives.
16. Write `test-comms/TESTER-RESULT-039.md` and push it to `stage-3a-baremetal-windows`.

## Required result evidence

`TESTER-RESULT-039.md` must include:

- exact branch head tested,
- confirmation `TESTER-RESULT-038.md` was read,
- host facts, including Windows edition, HypervisorPresent, VirtualizationFirmwareEnabled, total physical memory, dedicated VRAM if known, Docker/Ollama presence, Docker Desktop reported total memory, and free physical memory before readiness,
- default-port stale `llama-server` process state before readiness,
- proven-suite plan result and selected module list,
- readiness lifecycle path and status,
- full `ollama_model_resources` check,
- full `host_ollama_model_load` check, including base URL, container base URL, server evidence, stdout/stderr, return code, attempts, and selected profile,
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
- isolated port `11435` `/api/tags` probe result,
- available physical memory before readiness and after failure,
- top memory-consuming processes after failure,
- Docker Desktop reported memory after failure,
- whether any `ollama_llama_server` or `llama-server` process remains after failure.

## Pass criteria

Pass only if readiness passes through a real host-Ollama HTTP generation with `gemma4:e4b`, then install, verify, launcher, and all ten live route checks pass.

If readiness passes but install/verify/live routes fail, report the exact failing phase and evidence. Do not mark the gate passed until the full sequence is green.

## Constraints

Push only `test-comms/TESTER-RESULT-039.md`. No source edits during the test run. No merge, tag, status promotion, or `modules.json` changes. Never touch any OneDrive path.
