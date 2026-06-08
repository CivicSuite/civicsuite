# TESTER RESULT 061 - CivicBoards retry after Python venv bootstrap recovery fix

## Verdict

FAILED.

## Failure summary

The CivicBoards gate progressed past the two fixes under test but failed during CivicBoards service startup.

- Failing phase: install
- Failing step: `python_service_start`
- Failing module: `civicboards`
- Failure: `process_exited_after_start`
- CivicBoards service PID: `2472`
- CivicBoards API port: `23865`
- Process return code: `1`
- Service log path: `installer\runtime\proven-suite-clean-machine-r37\python-services\civicboards\service.log`
- Service log tail: `OpenBLAS error: Memory allocation still failed after 10 retries, giving up.`
- Machine-readable lifecycle report: `installer\reports\stage3a-proven-suite-clean-machine-r37\clerk-core-installer-lifecycle.json`
- Extracted failure evidence: `directive061-install-failure-extract.json`

The new venv recovery fix was exercised and recovered: CivicBoards venv creation failed on attempt 1 with an `ensurepip` error marked transient, then succeeded on attempt 2. The prior pip editable install fix did not need to retry: CivicBoards editable install succeeded on attempt 1, with no `MemoryError` recurrence and no `--no-cache-dir` retry needed.

## Branch and source evidence

- Branch tested: `stage-3a-baremetal-windows`
- Head tested: `71ba9d176ec3143c18278eee2ff2183d4ea4acdf`
- Required minimum head: `de4dcec9365e8909455b797eba1b407e35745f3d`
- Required minimum is ancestor of tested head: yes
- Prior result read: `test-comms/TESTER-RESULT-060.md` (171 lines)
- `installer/modules.json` SHA-256: `ca4670701d88893e0fc49c5111e50fda8acdb4f5c61936888d23e1d91581195e`
- CivicBoards manifest source commit: `cdc6bf1b2e8012151d3767e04cd0e378638798c9`
- Source check: `PYTHON_SERVICE_VENV_RETRIES` present.
- Source check: `python_service_venv_is_transient_failure` present.
- Source check: `run_python_service_create_venv` present.
- Source check: installer source still includes `memoryerror` in the transient pip marker list.
- Source check: installer source still includes `pip_retry_command` and injects `--no-cache-dir`.
- Source/generated/module manifest edits during test: none intentionally edited; only this result file is pushed.

## Host and clean-stack evidence

- Clean-stack teardown before readiness: exit 0 (`directive061-teardown.out`)
- Teardown output: no CivicSuite containers, no CivicSuite volumes, no CivicSuite networks.
- Host facts captured: `directive061-hostfacts-before-readiness.json`
- OS: Microsoft Windows 11 Pro `10.0.26200`, build `26200`
- CPU: Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz
- Hypervisor present: true
- Virtualization firmware enabled: false
- Total physical memory: `17028345856` bytes
- Free physical memory before readiness: `6764684` KB
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
- Plan output: `directive061-plan.out`
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
  - run id: `stage3a-proven-suite-clean-machine-r37`
  - install root: `installer\runtime\proven-suite-clean-machine-r37`
  - compose suffix: `stage3a-proven-suite-clean-machine-r37`
  - port offset: `5000`
  - host Ollama port: `11435`
- Readiness lifecycle path: `directive061-readiness-lifecycle.json`
- Readiness output path: `directive061-readiness.out`
- Readiness status: passed
- Readiness started: `2026-06-08T03:26:48.210353+00:00`
- Readiness finished: `2026-06-08T03:27:51.018525+00:00`
- Host Ollama selected profile: `cpu_mmap_default`
- Host Ollama model load attempts: first native/default attempt failed with CUDA host buffer allocation error; second `cpu_mmap_default` attempt passed.
- Host Ollama server PID after readiness restart: `14604`
- Host Ollama release after probe returned `done_reason=unload`.

## Install evidence

- Install lifecycle path: `installer\reports\stage3a-proven-suite-clean-machine-r37\clerk-core-installer-lifecycle.json`
- Install output path: `directive061-install.out`
- Install status: failed
- Install started: `2026-06-08T03:28:06.221935+00:00`
- Install finished: `2026-06-08T03:49:18.124977+00:00`
- Install provenance path: `installer\runtime\proven-suite-clean-machine-r37\civicsuite-install-provenance.json`
- Copied provenance evidence: `directive061-provenance.json`
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

### CivicBoards venv entry

`python_service_create_venv` for `civicboards` returned 0 after two attempts:

- Attempt 1 command: `C:\Program Files\Python312\python.exe -m venv installer\runtime\proven-suite-clean-machine-r37\python-services\civicboards\.venv`
- Attempt 1 return code: 1
- Attempt 1 stderr: embedded `.venv\Scripts\python.exe -m ensurepip --upgrade --default-pip` returned non-zero exit status 1.
- Attempt 1 transient: true
- Partial venv cleanup and retry occurred: yes, inferred from retry succeeding after transient failure.
- `ensurepip_recovery_attempts`: none recorded as a separate lifecycle field.
- Attempt 2 command: same `python -m venv ...\.venv`
- Attempt 2 return code: 0
- Attempt 2 transient: false
- Final venv step status: passed

### CivicBoards editable install entry

`python_service_install_editable` for `civicboards` returned 0.

- Attempt count: 1
- Attempt 1 command: `.venv\Scripts\python.exe -m pip install -e installer\runtime\proven-suite-clean-machine-r37\sources\civicboards`
- Attempt 1 return code: 0
- Retry using `--no-cache-dir`: no, not needed because attempt 1 succeeded.
- `MemoryError` recurred: no.
- Result: `civicboards-0.1.1` installed successfully.

### CivicBoards service start entry

`python_service_start` for `civicboards` failed.

- `pre_stop`: `skipped_no_pid`
- `pre_port_stop`: `no_listener` on port `23865`
- Spawned PID: `2472`
- Service log path: `installer\runtime\proven-suite-clean-machine-r37\python-services\civicboards\service.log`
- Confirmation spawned process did not exit during startup: failed; `failure=process_exited_after_start`
- Process return code: 1
- Health attempts: ten failed `curl` attempts to `127.0.0.1:23865`
- Log tail: `OpenBLAS error: Memory allocation still failed after 10 retries, giving up.`

## Verify and live checks

- Verify lifecycle path: not produced because install failed.
- Verify status: not run.
- CivicBoards API port: planned `23865`; service process exited before health passed.
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

- Post-failure teardown output: `directive061-post-failure-teardown.out`
- Post-failure cleanup evidence: `directive061-post-failure-cleanup.json`
- Post-failure teardown exit: 0
- Removed containers: 10
- Removed volumes: 8
- Removed networks: 4
- Stopped target listener PIDs: `2104`, `3444`, `6004`, `10456`, `10696`, `14604`, `16596`, `19660`, `21364`
- Remaining target listeners after cleanup: none
- Docker containers after cleanup: none
- Docker volumes after cleanup: none

## Final verdict

The CivicBoards gate failed in install. The venv retry fix worked for CivicBoards, and the editable pip install passed without `MemoryError`, but CivicBoards then exited during service startup because OpenBLAS could not allocate memory. Per directive pass criteria, this is a failure and verify/live CivicBoards checks were not attempted.
