# VMHOST-RESULT-018 - DECOMMISSION / SELF-WIPE

Tester decommission per operator request: removed the every-2-min runner task and wiped CivicSuite testing artifacts.

## Actions

- Decommission started 2026-06-28T11:36:22.7764642-06:00 on DESKTOP-2BR3SJR. Free C: before = 808.17 GB.
- No CivicSuite MSI uninstall entry found (already removed, or only installed inside disposable Sandbox).
- No Hyper-V VMs present.
- Reverted auto-login (AutoAdminLogon=0, cleared Default* + AutoLogonCount, restored PasswordLess default).
- Removed runner lock + directive logs from ProgramData (any in-use log is cleared by the detached cleaner).
- Requested disable of Windows Sandbox + Hyper-V features (-NoRestart); a REBOOT finalizes their removal. WSL/VirtualMachinePlatform left untouched.
- Free C: after = 808.11 GB (reclaimed ~-0.06 GB).

## Teardown (after this push)

- Unregister scheduled task 'CivicSuiteVMHostRunner' (stops the every-2-min check).
- Detached cleaner removes the runner dir + repo clone once this process tree exits.
- A reboot finalizes the Windows Sandbox / Hyper-V feature removal.
