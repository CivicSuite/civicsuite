# Tester Result 025 - proven-suite clean-machine retry blocked by missing module sources

**Tester machine:** Microsoft Windows 11 Pro 10.0.26200 build 26200; Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz.
**Branch head tested:** `fc6fcac90ce0765337b7f817cf4679fe51a010cb test(comms): retry proven-suite clean-machine gate`
**Minimum directive head satisfied:** `44e586a9e5708d688b624326d12fd4147cc63ef9 test(comms): add tester result 024`
**Date/time (UTC):** 2026-06-06T02:24:30Z

## Procedure

Fetched explicit GitHub branch ref `refs/heads/stage-3a-baremetal-windows`, reset the tester worktree to `origin/stage-3a-baremetal-windows`, read `test-comms/README.md` and `test-comms/TESTER-DIRECTIVE-025.md`, then ran the directive steps without source edits.

Ran the required clean-stack teardown:

```text
=== CivicSuite stack teardown ===
no civicsuite containers
no civicsuite volumes
no civicsuite networks
=== teardown complete - stack state cleared; prerequisites preserved ===
```

## Host Facts

```json
{
  "windows_edition": "Microsoft Windows 11 Pro",
  "windows_version": "10.0.26200",
  "hypervisor_present": true,
  "virtualization_firmware_enabled": false,
  "total_physical_memory_bytes": 17028345856,
  "docker_present": true,
  "ollama_present": true
}
```

## Proven-Suite Plan

Command:

```powershell
python scripts\plan-installer.py --profile proven-suite --menu-style guided --dry-run
```

Result: **passed** with `mutates_host=false`.

Selected modules from the dry-run plan:

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

The directive's service module set was:

```text
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
python scripts\run-clerk-core-installer.py readiness --run-id stage3a-proven-suite-clean-machine-r2 --install-root installer\runtime\proven-suite-clean-machine-r2 --compose-project-suffix stage3a-proven-suite-clean-machine-r2 --port-offset 4800 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama
```

Result: **passed**.

Readiness result:

```json
{
  "status": "passed",
  "mode": "readiness",
  "run_id": "stage3a-proven-suite-clean-machine-r2",
  "port_offset": 4800,
  "mutates_host": false,
  "install_root": "C:\\Users\\insty\\Documents\\Codex\\2026-06-02\\you-re-the-civicsuite-tester-on\\civicsuite\\installer\\runtime\\proven-suite-clean-machine-r2",
  "finished_at": "2026-06-06T02:21:18.180409+00:00"
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

## Install Gate

Command:

```powershell
python scripts\run-clerk-core-installer.py install --run-id stage3a-proven-suite-clean-machine-r2 --install-root installer\runtime\proven-suite-clean-machine-r2 --compose-project-suffix stage3a-proven-suite-clean-machine-r2 --port-offset 4800 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama
```

Result: **failed**.

Install lifecycle result path:

```text
C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\installer\reports\stage3a-proven-suite-clean-machine-r2\clerk-core-installer-lifecycle.json
```

Install lifecycle status:

```json
{
  "status": "failed",
  "mode": "install",
  "run_id": "stage3a-proven-suite-clean-machine-r2",
  "port_offset": 4800,
  "finished_at": "2026-06-06T02:21:31.879749+00:00",
  "error": "Missing source for civiczone. Expected bundled source at C:\\Users\\insty\\Documents\\Codex\\2026-06-02\\you-re-the-civicsuite-tester-on\\civicsuite\\modules\\civiczone or local checkout at C:\\Users\\insty\\Documents\\Codex\\2026-06-02\\you-re-the-civicsuite-tester-on\\civiczone."
}
```

Observed module source directories under `modules\`:

```text
civicclerk
civiccode
civicrecords-ai
```

The requested readiness modules `civiczone`, `civicplan`, `civicpermit`, `civicaccess`, `civicinspect`, `civicgrants`, and `civicprocure` were not present under `modules\`, and the installer stopped at the first missing source, `civiczone`.

## Verify And Launcher Evidence

The verify step was not run because install failed before a complete proven-suite runtime existed.

```text
verify_lifecycle_result_path=not_run
verify_status=not_run_due_to_missing_civiczone_source
launcher_config_module_urls=not_verified_install_failed
live_launcher_url=not_run
live_route_evidence=not_run
readiness_only_expected_blockers=not_observed_install_failed_first
```

## Gate Verdict

Directive 025 proven-suite clean-machine retry: **failed during install**.

The retry fixed the directive 024 `--port-offset` validation blocker: readiness passed with `--port-offset 4800`. The next blocker is missing selected module source material for the proven-suite readiness modules. Install failed before verify because `civiczone` was absent from both the bundled repo path and expected sibling checkout path. No source files, generated artifacts, `installer/modules.json`, docs, or tests were edited during the test run.
