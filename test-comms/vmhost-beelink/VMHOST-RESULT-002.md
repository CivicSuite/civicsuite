# VMHOST-RESULT-002 - Beelink Hyper-V setup + pipeline proof

## Hyper-V feature
Microsoft-Hyper-V-All State: Enabled

## Cmdlets
all present: Get-VM, New-VM, Checkpoint-VM, Restore-VMCheckpoint, Remove-VM, Get-VMHost, Get-VMSwitch, New-VMSwitch

## Get-VMHost (proves Hyper-V accepted the CPU / SLAT)
Name                  : DESKTOP-2BR3SJR
LogicalProcessorCount : 16
MemoryCapacity        : 29808803840
VirtualMachinePath    : C:\ProgramData\Microsoft\Windows\Hyper-V

## VM switch
using: Default Switch (Internal)

## Pipeline proof (create -> checkpoint -> revert -> remove)
New-VM ok
Checkpoint-VM ok
Get-VMSnapshot: clean-base
Restore-VMCheckpoint ok
Remove-VM + vhdx cleanup ok

## Disk C:
FreeGB: 849  SizeGB: 930

Verdict: VM-HOST-READY
