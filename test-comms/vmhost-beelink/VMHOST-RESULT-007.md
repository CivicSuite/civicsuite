# VMHOST-RESULT-007 - Windows install media + VM readiness probe

Machine: DESKTOP-2BR3SJR  Time: 2026-06-26 09:54:56

## Disk space
  Drive C: 847.9 GB free of 930.4 GB

## Windows ISO files found (>= 500 MB)
  (none found)

## WIM/ESD images found (>= 200 MB)
  (none found)

## Existing Hyper-V VMs
  (none)

## Hyper-V default paths
  VirtualHardDiskPath: C:\ProgramData\Microsoft\Windows\Virtual Hard Disks
  VirtualMachinePath:  C:\ProgramData\Microsoft\Windows\Hyper-V

## Build tools
  PRESENT: dism.exe
  ABSENT:  oscdimg.exe

## Note for dev side
Goal: build a fresh Windows VM with no prior CivicSuite install, install the fixed MSI,
validate lifecycle. If no ISO found above, provide a download URL in DIRECTIVE-008.
No further action needed on this directive -- result pushed below.
