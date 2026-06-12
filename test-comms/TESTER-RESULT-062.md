# TESTER RESULT 062 - CivicBoards retry after Python service BLAS thread cap

## Verdict

FAILED.

## Failure summary

The CivicBoards BLAS/thread-cap retry gate did not reach install. Readiness failed immediately at `docker_info` because Docker Desktop's Linux engine pipe was not present.

- Failing phase: readiness
- Failing check: `docker_info`
- Return code: 1
- Readiness lifecycle path: `installer\reports\stage3a-proven-suite-clean-machine-r38\clerk-core-installer-lifecycle.json`
- Readiness output path: `directive062-readiness.out`
- Extracted readiness failure: `directive062-readiness-failure-extract.json`
- Docker error:

```text
failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine; check if the path is correct and if the daemon is running: open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified.
```

The readiness fix steps reported by the installer were:

```text
Start Docker Desktop or Docker Engine and wait for it to report ready.
Rerun readiness before install.
```

Per directive, the run stopped at readiness and did not attempt install, verify, launcher checks, or CivicBoards live API/UI workflows.

## Branch and source evidence

- Branch tested: `stage-3a-baremetal-windows`
- Head tested: `e88039b108d1062a8f41a65bbc8358bd79da680d`
- Required minimum head: `356a11a8fc0ad8ef3bae691f1c50b881a2dc26bf`
- Required minimum is ancestor of tested head: yes
- Prior result read: `test-comms/TESTER-RESULT-061.md` (192 lines)
- `installer/modules.json` SHA-256: `ca4670701d88893e0fc49c5111e50fda8acdb4f5c61936888d23e1d91581195e`
- CivicBoards manifest source commit: `cdc6bf1b2e8012151d3767e04cd0e378638798c9`
- Source/generated/module manifest edits during test: none intentionally edited; only this result file is pushed.

## Source fix evidence

In `scripts\run-clerk-core-installer.py`, `python_service_environment()` loops over these keys and calls `env.setdefault(key, "1")`:

- `OPENBLAS_NUM_THREADS`
- `OMP_NUM_THREADS`
- `MKL_NUM_THREADS`
- `NUMEXPR_NUM_THREADS`
- `VECLIB_MAXIMUM_THREADS`

Prior fixes are still present:

- `PYTHON_SERVICE_VENV_RETRIES=3`
- `python_service_venv_is_transient_failure` present
- `run_python_service_create_venv` present
- `memoryerror` transient pip marker present
- `pip_retry_command` present and injects `--no-cache-dir`
- `PYTHON_SERVICE_INSTALL_RETRIES=3`

## Host and clean-stack evidence

- Clean-stack teardown before readiness: exit 0 (`directive062-teardown.out`)
- Teardown output: no CivicSuite containers, no CivicSuite volumes, no CivicSuite networks.
- Host facts captured: `directive062-hostfacts-before-readiness.json`
- OS: Microsoft Windows 11 Pro `10.0.26200`, build `26200`
- CPU: Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz
- Hypervisor present: true
- Virtualization firmware enabled: false
- Total physical memory: `17028345856` bytes
- Free physical memory before readiness: `6607144` KB
- Docker: `Docker version 29.5.2, build 79eb04c`
- Docker MemTotal from host facts: `0`
- Docker containers before readiness: none returned because Docker engine was unreachable.
- Docker volumes before readiness: none returned because Docker engine was unreachable.
- Docker networks before readiness: none returned because Docker engine was unreachable.
- Docker daemon errors during host-fact capture: same missing `dockerDesktopLinuxEngine` pipe.
- Ollama: `ollama version is 0.30.7`
- `ollama ps` before readiness: empty
- Ports checked before readiness: no listeners on `11435`, `18082`, or `23865`
- Stale process state before readiness: one `python` process PID `21764`; no `uvicorn`, `llama-server`, or `ollama_llama_server`; one `ollama` process PID `4076`.

## Plan evidence

- Plan command: `python scripts\plan-installer.py --profile proven-suite --menu-style guided --dry-run`
- Plan output: `directive062-plan.out`
- Plan exit: 0
- Plan was non-mutating: yes
- Selected twelve-module suite:
  - `civicrecords-ai`
  - `civicclerk`
  - `civiccode`
  - `civiczone`
  - `civicplan`
  - `civicpermit`
  - `civicaccess`
  - `civicinspect`
  - `civicgrants`
  - `civicprocure`
  - `civiccontracts`
  - `civicboards`

## Readiness evidence

- Readiness command used run isolation:
  - run id: `stage3a-proven-suite-clean-machine-r38`
  - install root: `installer\runtime\proven-suite-clean-machine-r38`
  - compose suffix: `stage3a-proven-suite-clean-machine-r38`
  - port offset: `5000`
  - host Ollama port: `11435`
- Readiness lifecycle path: `installer\reports\stage3a-proven-suite-clean-machine-r38\clerk-core-installer-lifecycle.json`
- Readiness output path: `directive062-readiness.out`
- Readiness status: failed
- Readiness started: `2026-06-12T18:57:02.332692+00:00`
- Readiness finished: `2026-06-12T18:57:03.220752+00:00`
- Failed check: `docker_info`
- Full `host_ollama_model_load` attempts array: not produced because readiness stopped before the Ollama model-load check.

## Install, verify, and live checks

- Install lifecycle path: not produced because readiness failed.
- Install status: not run.
- Install provenance path: not produced because readiness failed.
- Source commit list from install provenance: not produced because readiness failed; manifest source commit was confirmed before readiness.
- Verify lifecycle path: not produced because readiness failed.
- Verify status: not run.
- CivicBoards API port: planned `23865`; service was not installed or started.
- Launcher URL: planned `http://127.0.0.1:18082/`; launcher was not installed or validated.
- Launcher config entry for CivicBoards: not produced/validated because readiness failed before install.
- `python_service_create_venv` lifecycle entry for CivicBoards: not produced because install did not run.
- `python_service_install_editable` lifecycle entry for CivicBoards: not produced because install did not run.
- `python_service_start` lifecycle entry for CivicBoards: not produced because install did not run.
- CivicBoards service log tail: not produced because service did not start.
- Independent `GET /civicboards`: not run because readiness failed.
- Independent `GET /civicboards/staff`: not run because readiness failed.
- Independent `GET /api/v1/civicboards/readiness`: not run because readiness failed.
- Independent `GET /api/v1/civicboards/integration-contracts`: not run because readiness failed.
- Independent CivicBoards registry, attendance, staff review, vacancy, and export workflows: not run because readiness failed.
- Verify evidence for `civicboards_integration_contracts`: not produced because verify did not run.
- Live module route checks for the twelve selected modules: not run because readiness failed.

## Cleanup evidence

- Post-readiness-failure teardown output: `directive062-post-readiness-failure-teardown.out`
- Post-readiness-failure cleanup evidence: `directive062-post-readiness-failure-cleanup.json`
- Post-readiness-failure teardown exit: 0
- Post-readiness-failure teardown output: no CivicSuite containers, no CivicSuite volumes, no CivicSuite networks.
- Remaining target listeners after cleanup: none
- Docker containers after cleanup: none returned because Docker engine was unreachable.
- Docker volumes after cleanup: none returned because Docker engine was unreachable.

## Final verdict

The CivicBoards gate failed in readiness before install. The branch contains the BLAS/thread cap source fix and the prior venv/pip retry fixes, but Docker Desktop's Linux engine was not reachable, so the proven-suite install and CivicBoards live checks could not be attempted.
