# PostgreSQL Runtime Dependency Test Report

## Summary

The installed CivicSuite desktop app fails to start the bundled PostgreSQL runtime because `postgres.exe` cannot load `zlib1.dll`.

Observed error:

> `postgres.exe - System Error`
>
> `The code execution cannot proceed because zlib1.dll was not found. Reinstalling the program may fix this problem.`

This explains the `Local data store` / PostgreSQL health failure reported in `test-comms/TESTER-RESULT-096.md`.

## Environment

- Installed app: `C:\Program Files\CivicSuite\civicsuite-desktop.exe`
- User runtime PostgreSQL path: `C:\Users\insty\AppData\Local\CivicSuite\runtime\postgres\bin`
- Program Files payload PostgreSQL path: `C:\Program Files\CivicSuite\_up_\runtime\payload\postgres\bin`
- Screenshot evidence: `C:\Users\insty\AppData\Local\Temp\codex-clipboard-a207d555-7e9b-455a-a83e-d11dc6c08ffd.png`

## Verification

Runtime inspection showed:

- `C:\Users\insty\AppData\Local\CivicSuite\runtime\postgres\bin\postgres.exe` exists.
- `C:\Users\insty\AppData\Local\CivicSuite\runtime\postgres\bin\zlib1.dll` is missing.
- No `zlib1.dll` was found anywhere under `C:\Users\insty\AppData\Local\CivicSuite\runtime`.
- `zlib1.dll` does exist in the installed MSI payload at:
  `C:\Program Files\CivicSuite\_up_\runtime\payload\postgres\bin\zlib1.dll`

## Impact

The product cannot start PostgreSQL from the installed desktop System Health surface. This blocks:

- Local data store health
- City workflow services
- Task queue schema
- Background work queue
- Clerk / Records / Code database-backed workflows
- Restore recovery after reinstall

## Reproduction Steps

1. Install the CivicSuite MSI from `windows-local-msi-ci-ae0cfb2`.
2. Launch `C:\Program Files\CivicSuite\civicsuite-desktop.exe`.
3. Open System Health.
4. Use product controls for `Local data store`: `Install`, `Start`, `Check`, `Repair`, `Start`, `Check`.
5. Observe `Local data store` remains `Needs start`.
6. When PostgreSQL is launched, Windows displays the `postgres.exe` system error for missing `zlib1.dll`.

## Likely Root Cause

The MSI payload contains `zlib1.dll`, but the user-profile runtime copy does not. The likely fault is in the runtime install/repair materialization step that copies PostgreSQL from:

`C:\Program Files\CivicSuite\_up_\runtime\payload\postgres`

to:

`C:\Users\insty\AppData\Local\CivicSuite\runtime\postgres`

That copy appears to omit at least `bin\zlib1.dll`.

## Expected Result

The installed runtime should include all PostgreSQL DLL dependencies in the same directory as `postgres.exe`, including:

`C:\Users\insty\AppData\Local\CivicSuite\runtime\postgres\bin\zlib1.dll`

Then product Start/Repair should be able to start PostgreSQL without a Windows loader error.

## Actual Result

`postgres.exe` is present in the user runtime, but `zlib1.dll` is missing there. PostgreSQL cannot start, and the desktop app reports Local data store / service health failures.

## Recommended Fix

Update the product runtime install/repair copy logic to preserve the complete PostgreSQL `bin` directory and verify required DLLs after copy. At minimum, fail the product repair with a clear bundled-runtime-copy error if required dependencies such as `zlib1.dll` are absent.
