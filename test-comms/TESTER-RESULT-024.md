# Tester Result 024 - proven-suite clean-machine gate blocked by port-offset validation

**Tester machine:** Microsoft Windows 11 Pro 10.0.26200 build 26200; Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz.
**Branch head tested:** `e89e6b80f5168808912e42ca8a460efebe673448 test(comms): request proven-suite clean-machine gate`
**Minimum directive head satisfied:** `dae54864c3c3e17cbb65781ff65fdbf42fd0e20a feat(installer): prove local suite readiness modules`
**Date/time (UTC):** 2026-06-06T01:22:00Z

## Procedure

Fetched explicit GitHub branch ref `refs/heads/stage-3a-baremetal-windows`, reset the tester worktree to `origin/stage-3a-baremetal-windows`, read `test-comms/README.md` and `test-comms/TESTER-DIRECTIVE-024.md`, then ran the directive steps without source edits.

Ran the required clean-stack teardown:

```text
=== CivicSuite stack teardown ===
removed containers: 10
removed volumes: 8
removed networks: 4
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

The service module set for the directive's readiness/install/verify commands was exactly:

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

Command run exactly as directed:

```powershell
python scripts\run-clerk-core-installer.py readiness --run-id stage3a-proven-suite-clean-machine-r1 --install-root installer\runtime\proven-suite-clean-machine-r1 --compose-project-suffix stage3a-proven-suite-clean-machine-r1 --port-offset 5200 --module civicrecords-ai --module civicclerk --module civiccode --module civiczone --module civicplan --module civicpermit --module civicaccess --module civicinspect --module civicgrants --module civicprocure --host-ollama
```

Result: **failed before readiness execution** during CLI argument validation.

Raw failure:

```text
Traceback (most recent call last):
  File "C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\scripts\run-clerk-core-installer.py", line 3584, in <module>
    raise SystemExit(main())
  File "C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\scripts\run-clerk-core-installer.py", line 3476, in main
    isolation = resolve_isolation(
  File "C:\Users\insty\Documents\Codex\2026-06-02\you-re-the-civicsuite-tester-on\civicsuite\scripts\run-clerk-core-installer.py", line 150, in resolve_isolation
    raise InstallerError("--port-offset must be between 0 and 5000.")
InstallerError: --port-offset must be between 0 and 5000.
```

Readiness result path/status:

```text
readiness_result_path=not_created
readiness_status=not_run_cli_validation_failed
```

## Install And Verify

The directive requires the same `--port-offset 5200` for readiness, install, and verify. Because readiness failed at argument validation before any lifecycle result was created, I did not proceed to install or verify with a modified command.

```text
install_lifecycle_result_path=not_run
install_status=not_run_due_to_directive_command_validation_failure
verify_lifecycle_result_path=not_run
verify_status=not_run_due_to_directive_command_validation_failure
```

Launcher config and live route evidence:

```text
launcher_config=not_created
live_launcher_url=not_run
module_route_evidence=not_run
readiness_only_expected_blockers=not_observed
```

## Gate Verdict

Directive 024 proven-suite clean-machine gate: **failed before readiness execution**.

The blocker is an internal mismatch between `TESTER-DIRECTIVE-024.md` and the current installer CLI. The directive mandates `--port-offset 5200`, but `scripts\run-clerk-core-installer.py` rejects `--port-offset` values above `5000`. No source files, generated artifacts, `installer/modules.json`, docs, or tests were edited during the test run.
