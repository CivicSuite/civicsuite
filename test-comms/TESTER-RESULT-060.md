# TESTER RESULT 060 - CivicBoards retry after pip MemoryError cache-bypass fix

## Verdict

FAILED.

## Failure summary

The CivicBoards retry gate did not reach the fixed `python_service_install_editable` retry path. The install failed earlier while creating the CivicBoards Python virtual environment.

- Failing phase: install
- Failing step: `python_service_create_venv`
- Failing module: `civicboards`
- Return code: 1
- Failing command reported by lifecycle: `python.exe -m ensurepip --upgrade --default-pip`
- Underlying exit status: `3221225773`
- Machine-readable lifecycle report: `installer\reports\stage3a-proven-suite-clean-machine-r36\clerk-core-installer-lifecycle.json`
- Extracted failure evidence: `directive060-install-failure-extract.json`

The lifecycle entry for CivicBoards is:

```json
{
  "module": "civicboards",
  "returncode": 1,
  "stderr": "Error: Command '['...\\python-services\\civicboards\\.venv\\Scripts\\python.exe', '-m', 'ensurepip', '--upgrade', '--default-pip']' returned non-zero exit status 3221225773.\n",
  "stdout": "",
  "step": "python_service_create_venv"
}
```

Because the failure occurred during venv creation, no CivicBoards `python_service_install_editable` entry was produced, no retry attempt could run, and no `--no-cache-dir` retry command was exercised during this install.

## Branch and source evidence

- Branch tested: `stage-3a-baremetal-windows`
- Head tested: `ee3f20dcbf3b51fb4ad26fec448c4a53663ffbb7`
- Required minimum head: `751827f75a23680be8d99848c3925e8cc9abe347`
- Required minimum is ancestor of tested head: yes
- Prior result read: `test-comms/TESTER-RESULT-059.md` (158 lines)
- `installer/modules.json` SHA-256: `ca4670701d88893e0fc49c5111e50fda8acdb4f5c61936888d23e1d91581195e`
- CivicBoards manifest source commit: `cdc6bf1b2e8012151d3767e04cd0e378638798c9`
- Source check: installer source includes `memoryerror` in the transient pip marker list.
- Source check: installer source includes `pip_retry_command` and injects `--no-cache-dir`.
- Source check: `PYTHON_SERVICE_INSTALL_RETRIES=3`.
- Source/generated/module manifest edits during test: none intentionally edited; only this result file is pushed.

## Host and clean-stack evidence

- Clean-stack teardown before readiness: exit 0 (`directive060-teardown.out`)
- Teardown output: no CivicSuite containers, no CivicSuite volumes, no CivicSuite networks.
- Host facts captured: `directive060-hostfacts-before-readiness.json`
- OS: Microsoft Windows 11 Pro `10.0.26200`, build `26200`
- CPU: Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz
- Hypervisor present: true
- Virtualization firmware enabled: false
- Total physical memory: `17028345856` bytes
- Free physical memory before readiness: `7538824` KB
- Docker: `Docker version 29.5.2, build 79eb04c`
- Docker MemTotal: `8249237504`
- Docker containers before readiness: none
- Docker volumes before readiness: none
- Docker networks before readiness: `bridge`, `host`, `none`
- Ollama: `ollama version is 0.30.5`
- `ollama ps` before readiness: empty
- Ports checked before readiness: no listeners on `11435`, `18082`, or `23865`
- Stale process state before readiness: no `python`, `uvicorn`, or `ollama_llama_server`; stale `llama-server` PIDs `7304`, `9592`, `13896`, `24320`; one `ollama` process PID `6600`.

## Plan evidence

- Plan command: `python scripts\plan-installer.py --profile proven-suite --menu-style guided --dry-run`
- Plan output: `directive060-plan.out`
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
  - run id: `stage3a-proven-suite-clean-machine-r36`
  - install root: `installer\runtime\proven-suite-clean-machine-r36`
  - compose suffix: `stage3a-proven-suite-clean-machine-r36`
  - port offset: `5000`
  - host Ollama port: `11435`
- Readiness lifecycle path: `directive060-readiness-lifecycle.json`
- Readiness output path: `directive060-readiness.out`
- Readiness status: passed
- Readiness started: `2026-06-06T23:09:20.830974+00:00`
- Readiness finished: `2026-06-06T23:10:21.246052+00:00`
- Host Ollama selected profile: `cpu_mmap_default`
- Host Ollama model load attempts: first native/default attempt failed with CUDA host buffer allocation error; second `cpu_mmap_default` attempt passed.
- Host Ollama server PID after readiness restart: `24364`
- Host Ollama release after probe returned `done_reason=unload`.

## Install evidence

- Install lifecycle path: `installer\reports\stage3a-proven-suite-clean-machine-r36\clerk-core-installer-lifecycle.json`
- Install output path: `directive060-install.out`
- Install status: failed
- Install started: `2026-06-06T23:10:36.720959+00:00`
- Install finished: `2026-06-06T23:27:08.201251+00:00`
- Install provenance path: `installer\runtime\proven-suite-clean-machine-r36\civicsuite-install-provenance.json`
- Copied provenance evidence: `directive060-provenance.json`
- Provenance module source commits:
  - `civicaccess=9576dd579575fe6555f92590912c7686e3521b9f`
  - `civicboards=cdc6bf1b2e8012151d3767e04cd0e378638798c9`
  - `civicclerk=af8b989a8d64ba709d1b204ec231364484619f7b`
  - `civiccode=a960bba0a2249d118b593dd61bee3a65a69a9d77`
  - `civiccontracts=65b711571cdabd61974aa741f40d0e6e9f9c6567`
  - `civicgrants=fcfbe34c7b921dad44d5329397e058614c7d9ed4`
  - `civicinspect=7f578fdc7b32f26b67c732e2d802600369226e9d`
  - `civicpermit=877a13642d82afaca276f7b7107e7ec6ddbab7d1`
  - `civicplan=ceae24c4ab187d0c8f4f81088c5f741c1b59e0ab`
  - `civicprocure=1a6f44a09d85fdd7e8153455b16c5ec4baa63311`
  - `civicrecords-ai=cddc4d2be856badfbc7c6bdd26917a34ef535677`
  - `civiczone=8ffa001b22138a526684153448100fadd7de5fd7`

The install successfully reached and started CivicContracts before CivicBoards. CivicBoards failed at `python_service_create_venv`; therefore:

- CivicBoards `python_service_install_editable`: not produced.
- CivicBoards install attempts: none.
- Retry command including `--no-cache-dir`: not exercised because editable install was never reached.
- `MemoryError` recurrence in CivicBoards editable install: not observed because editable install was never reached.
- CivicBoards `python_service_start`: not produced.
- CivicBoards service log path: not produced.
- CivicBoards spawned PID: not produced.
- CivicBoards startup exit confirmation: not available because service start was not reached.

## Verify and live checks

- Verify lifecycle path: not produced because install failed.
- Verify status: not run.
- CivicBoards API port: planned `23865`; service was not started.
- Launcher URL: planned `http://127.0.0.1:18082/`; launcher was not validated because install failed.
- Launcher config entry for CivicBoards: not produced/validated because install failed before launcher/live verification.
- Independent `GET /civicboards`: not run because install failed.
- Independent `GET /civicboards/staff`: not run because install failed.
- Independent `GET /api/v1/civicboards/readiness`: not run because install failed.
- Independent `GET /api/v1/civicboards/integration-contracts`: not run because install failed.
- Independent CivicBoards registry, attendance, staff review, vacancy, and export workflows: not run because install failed.
- Verify evidence for `civicboards_integration_contracts`: not produced because verify did not run.
- Live module route checks for the twelve selected modules: not run because install failed.

## Cleanup evidence

- Post-failure teardown output: `directive060-post-failure-teardown.out`
- Post-failure cleanup evidence: `directive060-post-failure-cleanup.json`
- Post-failure teardown exit: 0
- Removed containers: 10
- Removed volumes: 8
- Removed networks: 4
- Stopped target listener PIDs: `8228`, `11360`, `11392`, `19032`, `19660`, `22708`, `23256`, `24240`
- Remaining target listeners after cleanup: none
- Docker containers after cleanup: none
- Docker volumes after cleanup: none

## Final verdict

The CivicBoards gate failed in install. Readiness passed and the branch contains the requested `MemoryError` transient classifier plus `--no-cache-dir` retry implementation, but this run failed before the CivicBoards editable pip install step. The fixed retry path was therefore not exercised. Per directive pass criteria, this is a failure and verify/live CivicBoards checks were not attempted.
