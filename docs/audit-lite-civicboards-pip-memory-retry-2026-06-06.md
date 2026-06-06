# Audit Lite - CivicBoards pip MemoryError retry fix

Date: 2026-06-06
Scope: Installer retry behavior for CivicBoards clean-machine failure in `TESTER-RESULT-059.md`.

## TL;DR

Ship this fix and re-run the CivicBoards clean-machine gate. The tester failure was a pip `MemoryError` while reading cached metadata during `python_service_install_editable`. The installer now treats `MemoryError` in pip output as retryable and retries subsequent pip install attempts with `--no-cache-dir`, avoiding the cache path that failed on the 16 GB test host.

## Severity rollup

- Blocker: 0
- Critical: 0
- Major: 0
- Minor: 0
- Nit: 0

## Findings

No findings.

## Mutation-proven behavior

- `test_python_service_install_retries_memoryerror_without_cache` proves pip `MemoryError` retries and the retry command includes `--no-cache-dir`.
- `test_python_service_install_retries_transient_504` now also proves transient network retries switch to `--no-cache-dir`.
- `test_python_service_install_does_not_retry_non_transient_failure` still proves ordinary resolver failures remain single-shot.

## Verification

- `python -m py_compile scripts/run-clerk-core-installer.py`: passed.
- `python -m pytest -q tests/test_stage2_live_install_blockers.py -k "python_service_install"`: passed.
