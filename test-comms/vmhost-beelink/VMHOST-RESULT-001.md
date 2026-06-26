# VMHOST-RESULT-001 - Beelink SER8 readiness probe

Verdict: NEEDS-SETUP

This host appears capable for pristine-VM CivicSuite release testing, but it is not ready without setup/confirmation:

- Hyper-V/VM management tooling is not currently available to this Codex worker (`Get-VM`, `New-VM`, `Checkpoint-VM` not found).
- Non-elevated `Get-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V-All` requires elevation, so the exact Hyper-V feature state was not confirmed from the medium-integrity worker.
- SLAT was not positively confirmed because `systeminfo` suppresses the Hyper-V requirements block when a hypervisor is already present, and `Win32_Processor.SecondLevelAddressTranslationExtensions` returned `False` under the current hypervisor-present state. The CPU model should be rechecked from an elevated/setup context before declaring VM-HOST-READY.
- Initial `gh auth status` reported not logged in; operator provided a PAT afterward, which was saved to the Windows keyring with `gh auth login --with-token`. GitHub CLI org-write readiness is now confirmed by a successful dry-run push reaching the remote.
- WSL is present enough to respond but currently errors with `Wsl/CallMsi/Install/REGDB_E_CLASSNOTREG`; later VM-host setup should repair/confirm WSL only if CivicSuite VM orchestration needs it.

Read-only limits observed: no Hyper-V enable, no VM create/run, no install, no reboot.

## Channel / Liveness

Repository: `https://github.com/CivicSuite/civicsuite.git`

Branch: `stage-3a-baremetal-windows`

Local path: `C:\dev\Codex\civicsuite`

Composer/access mode: Full-access behavior verified by cloning/fetching under `C:\dev\Codex` outside the original workspace and reaching the network. Codex worker is not admin.

Initial branch stamp:

```text
41199bd8752b43649f2dd397708840cc6f2ab594	refs/heads/stage-3a-baremetal-windows
```

Initial `FETCH_HEAD`:

```text
41199bd8752b43649f2dd397708840cc6f2ab594		branch 'stage-3a-baremetal-windows' of https://github.com/CivicSuite/civicsuite
```

Pre-write branch stamp:

```text
41199bd8752b43649f2dd397708840cc6f2ab594	refs/heads/stage-3a-baremetal-windows
```

Pre-write `FETCH_HEAD`:

```text
41199bd8752b43649f2dd397708840cc6f2ab594		branch 'stage-3a-baremetal-windows' of https://github.com/CivicSuite/civicsuite
```

Push confirmation: `git push --dry-run origin HEAD:stage-3a-baremetal-windows` reached the remote after PAT keyring setup. Actual push follows this commit.

## Machine Identity

`Get-CimInstance Win32_ComputerSystem | Select Name,Manufacturer,Model,TotalPhysicalMemory`

```json
{"Name":"DESKTOP-2BR3SJR","Manufacturer":"AZW","Model":"SER8","TotalPhysicalMemory":29808803840}
```

SER8 confirmation: yes, expected machine name and SER8 model.

`Get-CimInstance Win32_OperatingSystem | Select Caption,Version,BuildNumber`

```json
{"Caption":"Microsoft Windows 11 Pro","Version":"10.0.26200","BuildNumber":"26200"}
```

`Get-CimInstance Win32_Processor | Select Name,NumberOfCores,NumberOfLogicalProcessors`

```json
{"Name":"AMD Ryzen 7 8745HS w/ Radeon 780M Graphics     ","NumberOfCores":8,"NumberOfLogicalProcessors":16}
```

## CPU Virtualization

`(Get-CimInstance Win32_Processor).VirtualizationFirmwareEnabled`

```text
True
```

`(Get-CimInstance Win32_ComputerSystem).HypervisorPresent`

```text
True
```

Additional CPU fields:

```json
{"Name":"AMD Ryzen 7 8745HS w/ Radeon 780M Graphics     ","VirtualizationFirmwareEnabled":true,"SecondLevelAddressTranslationExtensions":false,"VMMonitorModeExtensions":false,"DataExecutionPrevention_Available":null}
```

`systeminfo` Hyper-V block:

```text
Hyper-V Requirements:          A hypervisor has been detected. Features required for Hyper-V will not be displayed.
```

`Get-ComputerInfo -Property HyperV*`:

```text
HyperVisorPresent                                 : True
HyperVRequirementDataExecutionPreventionAvailable :
HyperVRequirementSecondLevelAddressTranslation    :
HyperVRequirementVirtualizationFirmwareEnabled    :
HyperVRequirementVMMonitorModeExtensions          :
```

Interpretation: AMD-V/SVM is enabled in firmware and a hypervisor is already present. Windows did not expose the normal Hyper-V requirements block because the hypervisor is already running. SLAT was not positively confirmed in this read-only pass.

## Hyper-V / VM Stack State

`Get-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V-All | Select FeatureName,State`

```text
Get-WindowsOptionalFeature : The requested operation requires elevation.
```

Hyper-V PowerShell commands:

```text
Get-VM / New-VM / Checkpoint-VM: not found
```

Hyper-V related services:

```json
[{"Name":"HvHost","DisplayName":"HV Host Service","Status":4,"StartType":3},{"Name":"vmicguestinterface","DisplayName":"Hyper-V Guest Service Interface","Status":1,"StartType":3},{"Name":"vmicheartbeat","DisplayName":"Hyper-V Heartbeat Service","Status":1,"StartType":3},{"Name":"vmickvpexchange","DisplayName":"Hyper-V Data Exchange Service","Status":1,"StartType":3},{"Name":"vmicrdv","DisplayName":"Hyper-V Remote Desktop Virtualization Service","Status":1,"StartType":3},{"Name":"vmicshutdown","DisplayName":"Hyper-V Guest Shutdown Service","Status":1,"StartType":3},{"Name":"vmictimesync","DisplayName":"Hyper-V Time Synchronization Service","Status":1,"StartType":3},{"Name":"vmicvmsession","DisplayName":"Hyper-V PowerShell Direct Service","Status":1,"StartType":3},{"Name":"vmicvss","DisplayName":"Hyper-V Volume Shadow Copy Requestor","Status":1,"StartType":3}]
```

Other VM stacks:

```text
VirtualBox: not found
VMware vmrun: not found
Docker CLI: not found
```

WSL:

```text
Class not registered

Error code: Wsl/CallMsi/Install/REGDB_E_CLASSNOTREG
```

## Disk

`Get-Volume | Select DriveLetter,FileSystemLabel,FreeGB,SizeGB`

```json
[{"DriveLetter":null,"FileSystemLabel":"Recovery","FreeGB":0,"SizeGB":1},{"DriveLetter":"C","FileSystemLabel":"Windows","FreeGB":847,"SizeGB":930}]
```

Disk verdict: passes the requested >=120 GB free requirement on `C:` with about 847 GB free.

## Admin / Self-Elevation Path

Current identity:

```text
DESKTOP-2BR3SJR\blank
```

Current process admin:

```text
False
```

Current integrity:

```text
Mandatory Label\Medium Mandatory Level                        Label            S-1-16-8192
```

Self-elevation probe:

```text
Start-Process -Verb RunAs -Wait powershell -ArgumentList '-Command','exit 0'
Result: finished exit=0 elapsedSec=0.4
```

Interpretation: this medium-integrity Codex worker is not admin, but `Start-Process -Verb RunAs` elevated silently for the read-only exit probe. VM management should still use an explicitly configured elevated helper/scheduled task or operator-authorized elevated setup directive for repeatability and auditability.

## Network

HEAD-only reachability:

```text
https://github.com      HTTP/1.1 200 OK
https://huggingface.co  HTTP/1.1 200 OK
```

## Toolchain

`git --version`

```text
git version 2.54.0.windows.1
```

`gh --version`

```text
gh version 2.93.0 (2026-05-27)
https://github.com/cli/cli/releases/tag/v2.93.0
```

Initial `gh auth status`

```text
You are not logged into any GitHub hosts. To log in, run: gh auth login
```

Post-PAT keyring setup `gh auth status`:

```text
Logged in to github.com account scottconverse (keyring)
Git operations protocol: https
Token scopes include repo
```

PowerShell:

```text
5.1.26100.8655
```

## Clean State

Checked paths:

```json
[{"Path":"C:\\Program Files\\CivicSuite","Exists":false},{"Path":"C:\\Program Files (x86)\\CivicSuite","Exists":false},{"Path":"C:\\ProgramData\\CivicSuite","Exists":false},{"Path":"C:\\Users\\a7207\\AppData\\Local\\CivicSuite","Exists":false},{"Path":"C:\\Users\\a7207\\AppData\\Roaming\\CivicSuite","Exists":false}]
```

Installed-package / uninstall-registry checks:

```text
No CivicSuite / Civic Suite package entries found.
```

Clean-state verdict: no prior CivicSuite product/state found by the requested read-only checks.

## Exact Setup Items Needed Before VM-HOST-READY

1. Confirm/enable the full Hyper-V feature set and management tools in an operator-authorized elevated setup pass.
2. Confirm SLAT/VM monitor mode requirements from an elevated/setup context, since the current hypervisor-present state hides the normal `systeminfo` requirement block and WMI reported SLAT false.
3. Ensure the VM lifecycle runner has a repeatable admin path, preferably an elevated helper/scheduled task, even though the one-shot `RunAs` probe elevated silently.
4. Repair/confirm WSL only if the later CivicSuite VM-host workflow requires it.
