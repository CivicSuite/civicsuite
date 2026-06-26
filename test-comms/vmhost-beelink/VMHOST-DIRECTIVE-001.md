# VMHOST-DIRECTIVE-001 — Beelink SER8 readiness probe for pristine-VM CivicSuite release testing

Purpose: assess whether THIS machine (Beelink SER8, expected name `DESKTOP-2BR3SJR`) can become the
**pristine-VM lifecycle host** for CivicSuite Windows Local **release** validation — GauntletGate
**QA-B1**: install the release MSI into a *clean Windows VM*, run the full install→first-run→AI→backup/
restore→uninstall lifecycle, and **revert to a clean checkpoint between runs** so every run is truly
pristine. You are a NEW tester node, separate from the existing bare-metal TESTER box.

## READ-ONLY this pass
Do **NOT** enable Hyper-V, create/run VMs, install anything, or **reboot**. Just measure and report.
The actual setup (enable Hyper-V + build the clean-Windows checkpoint — which needs a reboot) is a
SEPARATE operator-authorized directive after this readiness report.

## Channel (distinct node namespace)
Write your result ONLY to repo `CivicSuite/civicsuite`, branch `stage-3a-baremetal-windows`, file
**exactly** `test-comms/vmhost-beelink/VMHOST-RESULT-001.md`. Do NOT touch the `TESTER-DIRECTIVE/RESULT-NNN`
files (those belong to the other box). Before start and before writing the result, record
`git ls-remote origin refs/heads/stage-3a-baremetal-windows`, fetch, and record `FETCH_HEAD`. Your only
acknowledgment is the pushed result file.

## Measure + report (read-only PowerShell)
1. **Channel/liveness:** ls-remote + FETCH_HEAD; confirm you can push; Codex Composer mode (Full Access?).
2. **Machine identity:** `Get-CimInstance Win32_ComputerSystem | Select Name,Manufacturer,Model,TotalPhysicalMemory`;
   OS `Get-CimInstance Win32_OperatingSystem | Select Caption,Version,BuildNumber`; CPU
   `Get-CimInstance Win32_Processor | Select Name,NumberOfCores,NumberOfLogicalProcessors`. Confirm it's the SER8.
3. **CPU virtualization (decisive):**
   - `(Get-CimInstance Win32_Processor).VirtualizationFirmwareEnabled`  (want **True** = AMD-V/SVM on in UEFI)
   - `(Get-CimInstance Win32_ComputerSystem).HypervisorPresent`
   - `systeminfo` → capture the **Hyper-V Requirements** block (VM Monitor Mode Extensions; Virtualization
     Enabled In Firmware; Second Level Address Translation / **SLAT**; Data Execution Prevention). If a
     hypervisor is already running, systeminfo says so instead — record that.
4. **Hyper-V feature state:** `Get-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V-All | Select FeatureName,State`.
   Note any other VM stack present (VirtualBox/VMware).
5. **Disk:** `Get-Volume | Select DriveLetter,FileSystemLabel,@{n='FreeGB';e={[math]::Round($_.SizeRemaining/1GB)}},@{n='SizeGB';e={[math]::Round($_.Size/1GB)}}`.
   Need **≥ ~120 GB free** for a clean Windows VM base + checkpoints + the 1.65 GB MSI + the ~7 GB model.
6. **Admin / self-elevation path (decisive — Hyper-V + VM create/checkpoint/revert need admin):** test whether
   this Codex worker can self-elevate **silently**: `Start-Process -Verb RunAs -Wait powershell -ArgumentList '-Command','exit 0'`
   — report whether it elevated silently, showed a UAC prompt, or failed; and the current process integrity
   (admin or not). State plainly: is there a silent admin-elevation path, or will VM management need a
   configured elevated helper / scheduled task?
7. **Network (HEAD only, no big downloads):** reachability to `https://github.com` and `https://huggingface.co`
   (the VM will pull the ~7 GB Gemma model during first-run). Report HTTP status.
8. **Toolchain:** `git --version`; `gh --version` + `gh auth status` (can it push to the org?); `$PSVersionTable.PSVersion`.
9. **Clean state:** confirm NO prior CivicSuite product/state exists (should be a fresh machine).

## Verdict (top of result)
- `Verdict: VM-HOST-READY` — VirtualizationFirmwareEnabled True + SLAT yes + Hyper-V available/enableable +
  ≥120 GB free + a working admin/elevation path + GitHub & Hugging Face reachable.
- `Verdict: NEEDS-SETUP` — capable but something must change first; list EXACTLY what (e.g. "enable SVM in
  UEFI", "free disk", "no silent-elevation path — need an elevated helper", "gh not authenticated").
- `Verdict: NOT-SUITABLE` — a hard blocker (no SLAT, virtualization can't be enabled); say why.

## Hard limits
Read-only. No Hyper-V enable, no VM create/run, no install, **no reboot**. Push only to
`stage-3a-baremetal-windows` under `test-comms/vmhost-beelink/`. Never touch OneDrive paths.
