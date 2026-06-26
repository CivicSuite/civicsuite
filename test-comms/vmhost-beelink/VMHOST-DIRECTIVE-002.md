# VMHOST-DIRECTIVE-002 — Beelink SER8: enable Hyper-V + prove the VM-management pipeline

Operator (Scott) has AUTHORIZED this setup pass, **including a reboot of this machine**. Goal: turn the
Beelink into a working Hyper-V host and PROVE the create→checkpoint→revert→remove pipeline (the pipeline
QA-B1 needs). Building the actual clean-Windows base image is the NEXT directive (003) — not this one.

## This directive REBOOTS the machine and is RESUMABLE
Enabling Hyper-V requires a reboot. Structure your work in two phases and make each run **idempotent** —
on every run, check current state and continue from where it left off:
- **Phase 1 (Hyper-V not yet enabled):** do the elevated enable + switch, then reboot.
- **Phase 2 (Hyper-V already enabled, after reboot):** confirm tools + run the pipeline proof + write the result.
After the reboot, you will be re-launched (operator re-fires you, or your next `check repo`). Detect that
Hyper-V is now enabled and proceed straight to Phase 2. Do NOT loop reboots: only reboot if Hyper-V was
just enabled this run AND a reboot is pending.

## Elevation
Use your confirmed silent elevation path (`Start-Process -Verb RunAs`) for every admin step, or stand up
an elevated scheduled task for repeatability. The medium-integrity worker cannot do these unelevated.

## Phase 1 — enable (elevated), then reboot
1. Enable the full Hyper-V feature set + management tools (this also installs `Get-VM`/`New-VM`/
   `Checkpoint-VM` and the Hyper-V PowerShell module):
   `Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V-All -All -NoRestart`
   (also ensure `Microsoft-Hyper-V-Management-PowerShell` is enabled).
2. Create a VM network switch that gives guest VMs **internet** (the future CivicSuite VM must reach
   Hugging Face for the ~7 GB model): prefer the built-in **Default Switch** (NAT) if present, else create
   an External switch bound to the active physical NIC, else a NAT switch. Record which you used.
3. Reboot the machine (authorized). On next launch, go to Phase 2.

## Phase 2 — confirm + PROVE the pipeline (after reboot)
4. Confirm: `Get-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V-All | Select State` = Enabled;
   `Get-Command Get-VM,New-VM,Checkpoint-VM,Restore-VMCheckpoint,Remove-VM` all resolve; `Get-VMHost` works.
5. Confirm **SLAT** now that you can read it elevated: `Get-VMHost | Select-Object *` (or `coreinfo -v` /
   `systeminfo` — but with Hyper-V on, the requirement block is hidden, so `Get-VMHost` succeeding is the
   real proof Hyper-V accepted the CPU). Report it.
6. **Pipeline proof — throwaway VM, NO OS install needed:**
   - `New-VM -Name vmhost-selftest -Generation 2 -MemoryStartupBytes 2GB -NewVHDPath <a temp path on C:>\vmhost-selftest.vhdx -NewVHDSizeBytes 8GB -SwitchName <your switch>`
   - `Checkpoint-VM -Name vmhost-selftest -SnapshotName clean-base`
   - `Get-VMSnapshot -VMName vmhost-selftest` (confirm the checkpoint exists)
   - `Restore-VMCheckpoint -VMName vmhost-selftest -Name clean-base -Confirm:$false`
   - `Remove-VM -Name vmhost-selftest -Force` and delete its VHDX.
   This proves create→checkpoint→revert→remove all work — the exact cycle QA-B1's pristine-revert needs.
7. Report free disk on C: after cleanup.

## Result
Write `test-comms/vmhost-beelink/VMHOST-RESULT-002.md` (push to `stage-3a-baremetal-windows`) with: the
Phase-1 actions + which switch; Phase-2 confirmations (feature Enabled, all cmdlets resolve, `Get-VMHost`
OK, SLAT note); the pipeline-proof transcript (create/checkpoint/restore/remove all succeeded); free disk;
and a verdict line:
- `Verdict: VM-HOST-READY` — Hyper-V enabled, all cmdlets work, switch with internet ready, pipeline proof passed.
- `Verdict: STILL-NEEDS-X` — list exactly what failed.

## Hard limits
Only the throwaway `vmhost-selftest` VM may be created (delete it before finishing). Do NOT install any OS,
download any ISO, or build the real base image yet — that's directive 003. Reboot ONLY for the Hyper-V
enable (no reboot loops). Push only to `stage-3a-baremetal-windows` under `test-comms/vmhost-beelink/`.
Never touch OneDrive paths.
