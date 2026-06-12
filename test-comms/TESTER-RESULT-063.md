# TESTER-RESULT-063 - CivicBoards rerun after Docker Linux engine readiness blocker

## Final verdict

FAIL.

Docker Desktop's Linux engine was reachable before clean-stack teardown, readiness passed, install passed, and independent CivicBoards live UI/API checks passed. The full gate still fails because the required verify phase failed in the starter-set runtime workflow:

- `civicclerk_bearer_workflow`: `staff_session` returned HTTP 401, `mode=null`, `roles=null`, `token_fingerprint_present=false`.
- `clerk_to_code_handoff`: `clerk_create_meeting` returned HTTP 401 and no meeting id.

Because verify status is `failed`, the CivicBoards gate is not marked passed.

## Branch and directive truth

- Branch tested: `stage-3a-baremetal-windows`
- Branch head tested: `7c3afdd3d4fa825cf22fa30c6da0f35b4a428765`
- Required minimum branch head `faf31d5053b7124a59acb86c83ca33961b40d86d`: ancestor confirmed.
- Required minimum code head `356a11a8fc0ad8ef3bae691f1c50b881a2dc26bf`: ancestor confirmed.
- Prior result read: `test-comms/TESTER-RESULT-062.md` (155 lines).
- Expected result file written: `test-comms/TESTER-RESULT-063.md`
- No source, generated artifact, module manifest, or docs outside `test-comms` were edited.

## Docker and host readiness

- Docker precheck evidence: `directive063-r40-docker-precheck.json`
- Docker version: `Docker version 29.5.2, build 79eb04c`
- Docker Linux engine: reachable before teardown; `docker info` exit code `0`.
- Docker daemon memory: `8249241600` bytes (`7.683GiB` reported by Docker Desktop).
- Docker recovery steps: none needed on r40; engine was already reachable.
- Clean-stack teardown evidence: `directive063-r40-teardown.out`
- Initial teardown result: exit `0`; removed prior containers, volumes, and networks.
- Host facts evidence: `directive063-r40-hostfacts-before-readiness.json`
- Host: Microsoft Windows 11 Pro `10.0.26200`, build `26200`.
- Machine: Micro Electronics Inc `MG-VCTR001-1660TI`
- CPU: Intel Core i7-9750H, 6 cores / 12 logical processors.
- `HypervisorPresent`: `true`
- `VirtualizationFirmwareEnabled`: `false`
- Total physical memory: `17028345856`
- Free physical memory before readiness: `6779892` KB
- `ollama ps` before readiness: empty model table.
- Ports before readiness: `11435` listening by host Ollama PID `6296`; `18082` and `23865` clear.

## Source and manifest evidence

- Static branch evidence: `directive063-r40-branch-evidence.json`
- `installer/modules.json` CivicBoards source commit: `cdc6bf1b2e8012151d3767e04cd0e378638798c9`
- Install provenance path: `installer/runtime/proven-suite-clean-machine-r40/civicsuite-install-provenance.json`
- Provenance copy: `directive063-r40-provenance.json`
- Provenance confirms module source commits including:
  - `civicboards`: `cdc6bf1b2e8012151d3767e04cd0e378638798c9`
  - `civicaccess`: `9576dd579575fe6555f92590912c7686e3521b9f`
  - `civicclerk`: `af8b989a8d64ba709d1b204ec231364484619f7b`
  - `civiccode`: `a960bba0a2249d118b593dd61bee3a65a69a9d77`
  - `civiccontracts`: `65b711571cdabd61974aa741f40d0e6e9f9c6567`
  - `civicgrants`: `fcfbe34c7b921dad44d5329397e058614c7d9ed4`
  - `civicinspect`: `7f578fdc7b32f26b67c732e2d802600369226e9d`
  - `civicpermit`: `877a13642d82afaca276f7b7107e7ec6ddbab7d1`
  - `civicplan`: `ceae24c4ab187d0c8f4f81088c5f741c1b59e0ab`
  - `civicprocure`: `1a6f44a09d85fdd7e8153455b16c5ec4baa63311`
  - `civicrecords-ai`: `cddc4d2be856badfbc7c6bdd26917a34ef535677`
  - `civiczone`: `8ffa001b22138a526684153448100fadd7de5fd7`
- Python service BLAS/thread default caps present in `scripts/run-clerk-core-installer.py` for `OPENBLAS_NUM_THREADS`, `OMP_NUM_THREADS`, `MKL_NUM_THREADS`, `NUMEXPR_NUM_THREADS`, and `VECLIB_MAXIMUM_THREADS`.
- Venv retry/recovery evidence present: `PYTHON_SERVICE_VENV_RETRIES`, `python_service_venv_is_transient_failure`, and `run_python_service_create_venv`.
- Editable pip transient retry evidence present: `MemoryError` marker and `--no-cache-dir` retry command handling.

## Plan, readiness, install, verify

- Proven-suite plan evidence: `directive063-r40-plan.out`
- Plan profile: `proven-suite`
- Plan selected module list: `civicrecords-ai`, `civicclerk`, `civiccode`, `civiczone`, `civicplan`, `civicpermit`, `civicaccess`, `civicinspect`, `civicgrants`, `civicprocure`, `civiccontracts`, `civicboards`
- Run isolation id: `stage3a-proven-suite-clean-machine-r40`
- Install root: `installer/runtime/proven-suite-clean-machine-r40`
- Port offset: `5000`
- Host Ollama port: `11435`

Phase statuses:

- Readiness lifecycle: `directive063-r40-readiness-lifecycle.json`
- Readiness status: `passed`
- Install lifecycle: `directive063-r40-install-lifecycle.json`
- Install status: `passed`
- Verify lifecycle: `directive063-r40-verify-lifecycle.json`
- Verify status: `failed`
- Combined lifecycle extract: `directive063-r40-combined-lifecycle-extract.json`

Verify failure details:

- `starter_set_runtime_workflows`: `failed`
- `civicrecords_workflow`: `passed`
- `civicclerk_bearer_workflow`: `failed`
  - `staff_session` status code `401`
  - `mode=null`
  - `roles=null`
  - `token_fingerprint_present=false`
- `civiccode_workflow`: `passed`
- `clerk_to_code_handoff`: `failed`
  - `clerk_create_meeting` status code `401`
  - `id_present=false`
- `civicrecords_portal_mode`: `passed`

## CivicBoards install lifecycle

Specific CivicBoards lifecycle extract: `directive063-r40-civicboards-lifecycle-specific.json`

- `python_service_create_venv`: passed, return code `0`
  - Attempts: 1
  - Transient failure: `false`
- `python_service_install_editable`: passed, return code `0`
  - Attempts: 1
  - Retry with `--no-cache-dir`: not used because first attempt passed
  - Transient failure: `false`
- `python_service_start`: passed
  - `pre_stop`: `skipped_no_pid`
  - `pre_port_stop`: `no_listener` on port `23865`
  - Spawned PID in lifecycle: `16040`
  - Service log path: `installer/runtime/proven-suite-clean-machine-r40/python-services/civicboards/service.log`
  - Startup health: first probe could not connect while service was starting; second probe returned HTTP 200 health JSON.
  - No startup exit was reported by the lifecycle.
  - Service log tail evidence: `directive063-r40-civicboards-service-log-tail.txt`
  - Service log tail contains no `OpenBLAS error: Memory allocation still failed`.

## CivicBoards launcher and route evidence

- CivicBoards API port: `23865`
- CivicBoards launcher URL: `http://127.0.0.1:23865/civicboards`
- Suite launcher URL: `http://127.0.0.1:18082/`
- Launcher config: `directive063-r40-launcher-config.json`
- CivicBoards launcher entry: `directive063-r40-launcher-civicboards-entry.json`
- CivicBoards launcher entry:
  - `id`: `boards`
  - `name`: `CivicBoards`
  - `href`: `http://127.0.0.1:23865/civicboards`
  - `port`: `23865`
  - `residentAction`: `Check board and commission support`
  - `staffAction`: `Review board rosters and attendance`
  - `adminAction`: `Check CivicBoards service health`

Install/verify lifecycle evidence includes live module route checks for all twelve selected modules and explicit CivicBoards checks:

- `civicboards_api`: passed at `http://127.0.0.1:23865/health`
- `civicboards_readiness`: passed
- `civicboards_integration_contracts`: passed

## Independent CivicBoards live checks

Independent live evidence: `directive063-r40-live-civicboards.json`

All independent CivicBoards checks below returned HTTP 200:

- `GET /civicboards`: HTTP 200; title/content marker present.
- `GET /civicboards/staff`: HTTP 200; title/content marker present.
- `GET /api/v1/civicboards/readiness`: HTTP 200 with:
  - `ready=true`
  - `schema_ready=true`
  - `using_default_local_database=true`
  - `schema_version=civicboards-local-first-v1`
- `GET /api/v1/civicboards/integration-contracts`: HTTP 200 with all four required contracts:
  - `civicboards.board_roster.v1`
  - `civicboards.staff_review_queue.v1`
  - `civicboards.notice_packet.v1`
  - `civicboards.records_export.v1`
- `POST /api/v1/civicboards/registry`: HTTP 200, created `board_id=tester-063-board`.
- `GET /api/v1/civicboards/registry/tester-063-board`: HTTP 200, retrieved the created board roster record.
- `POST /api/v1/civicboards/attendance`: HTTP 200, created `attendance_id=82128867-c122-4b1c-bc2e-c35c2dd8982a`.
- `GET /api/v1/civicboards/attendance/82128867-c122-4b1c-bc2e-c35c2dd8982a`: HTTP 200, retrieved the created attendance review.
- Staff-keyed `GET /api/v1/civicboards/staff/reviews`: HTTP 200, showed attendance-triggered review `32d45060-bac6-4150-9a1d-048e8ce64a20`.
- Staff-keyed `POST /api/v1/civicboards/staff/reviews`: HTTP 200, created explicit review `review_id=daccfae3-b32c-4a4a-9ea0-0c99d1d28e97`.
- Staff-keyed `GET /api/v1/civicboards/staff/reviews`: HTTP 200, showed the explicit review and the attendance-triggered review.
- `POST /api/v1/civicboards/vacancies`: HTTP 200, returned public notice checklist output with `public_notice_required=true`.
- `POST /api/v1/civicboards/export`: HTTP 200, returned records export checklist and retention note.

Staff-key headers used:

- `X-CivicBoards-Role: staff`
- `X-CivicBoards-Staff-Key: civicsuite-local-staff-key`

## Cleanup

- Post-failure teardown evidence: `directive063-r40-post-failure-teardown.out`
- Post-failure cleanup evidence: `directive063-r40-post-failure-cleanup.json`
- Cleanup result: stack containers, volumes, and networks removed; no remaining `proven-suite-clean-machine-r40` / `stage3a-proven-suite-clean-machine-r40` processes found.

## Honest conclusion

The Docker readiness blocker from `TESTER-RESULT-062.md` was cleared. CivicBoards itself installed, started, passed readiness/contracts, and passed the independent UI/API workflow checks required by this directive.

The full directive still fails because the required verify phase failed in protected CivicClerk runtime workflow checks with HTTP 401 responses. This is a suite verify failure outside the CivicBoards live API checks, so the CivicBoards gate cannot be marked passed.
