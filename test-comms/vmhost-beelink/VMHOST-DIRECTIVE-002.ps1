# VMHOST-DIRECTIVE-002 (executable, resumable across reboot) — enable Hyper-V + prove the VM pipeline.
# Run by the autonomous runner. Phase 1 enables Hyper-V then reboots; after reboot the runner re-invokes
# this, Hyper-V is now enabled, so it does Phase 2 (confirm + create->checkpoint->revert->remove) and
# writes+pushes VMHOST-RESULT-002.md. See VMHOST-DIRECTIVE-002.md for the human-readable version.
$ErrorActionPreference = 'Stop'
$Repo='C:\dev\Codex\civicsuite'; $Branch='stage-3a-baremetal-windows'
$VDir = Join-Path $Repo 'test-comms\vmhost-beelink'; $N='002'
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  foreach ($p in @("$env:ProgramFiles\Git\cmd","$env:ProgramFiles\Git\bin","$env:LOCALAPPDATA\Programs\Git\cmd")) {
    if (Test-Path (Join-Path $p 'git.exe')) { $env:PATH = "$p;$env:PATH"; break }
  }
}
function Push-Result([string]$body){
  Set-Location $Repo
  $rp = Join-Path $VDir ("VMHOST-RESULT-{0}.md" -f $N)
  Set-Content -Path $rp -Value $body -Encoding UTF8
  git add -- $rp 2>&1 | Out-Null
  git -c user.name='vmhost-beelink' -c user.email='vmhost@localhost' commit -m ("vmhost: result {0} (Hyper-V setup + pipeline proof)" -f $N) 2>&1 | Out-Null
  git push origin ("HEAD:{0}" -f $Branch) 2>&1 | Out-Null
}

$hv = Get-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V-All
if ($hv.State -ne 'Enabled') {
  # PHASE 1 — enable Hyper-V incl. management tools, then reboot. Runner re-runs this after reboot.
  Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V-All -All -NoRestart | Out-Null
  Start-Sleep -Seconds 3
  Restart-Computer -Force
  exit 0
}

# PHASE 2 — confirm + prove create -> checkpoint -> revert -> remove
$r = New-Object System.Collections.Generic.List[string]
$ok = $true
$r.Add("# VMHOST-RESULT-002 — Beelink Hyper-V setup + pipeline proof"); $r.Add("")
$r.Add("## Hyper-V feature"); $r.Add("Microsoft-Hyper-V-All State: $($hv.State)"); $r.Add("")

$cmds = 'Get-VM','New-VM','Checkpoint-VM','Restore-VMCheckpoint','Remove-VM','Get-VMHost','Get-VMSwitch','New-VMSwitch'
$missing = @($cmds | Where-Object { -not (Get-Command $_ -ErrorAction SilentlyContinue) })
$r.Add("## Cmdlets")
if ($missing.Count -eq 0) { $r.Add("all present: $($cmds -join ', ')") } else { $r.Add("MISSING: $($missing -join ', ')"); $ok=$false }
$r.Add("")

try { $vmh = Get-VMHost; $r.Add("## Get-VMHost (proves Hyper-V accepted the CPU / SLAT)"); $r.Add(($vmh | Format-List Name,LogicalProcessorCount,MemoryCapacity,VirtualMachinePath | Out-String).Trim()); $r.Add("") }
catch { $ok=$false; $r.Add("## Get-VMHost FAILED"); $r.Add(($_ | Out-String).Trim()); $r.Add("") }

$switch = $null
try {
  $switch = Get-VMSwitch -ErrorAction SilentlyContinue | Where-Object { $_.Name -eq 'Default Switch' } | Select-Object -First 1
  if (-not $switch) { $switch = Get-VMSwitch -ErrorAction SilentlyContinue | Select-Object -First 1 }
  if (-not $switch) { $switch = New-VMSwitch -Name 'vmhost-internal' -SwitchType Internal }
  $r.Add("## VM switch"); $r.Add("using: $($switch.Name) ($($switch.SwitchType))"); $r.Add("")
} catch { $ok=$false; $r.Add("## switch setup FAILED"); $r.Add(($_ | Out-String).Trim()); $r.Add("") }

$vmName='vmhost-selftest'; $vhd = Join-Path $env:TEMP 'vmhost-selftest.vhdx'
$proof = New-Object System.Collections.Generic.List[string]
try {
  Get-VM -Name $vmName -ErrorAction SilentlyContinue | ForEach-Object { Remove-VM -Name $vmName -Force }
  if (Test-Path $vhd) { Remove-Item $vhd -Force }
  New-VM -Name $vmName -Generation 2 -MemoryStartupBytes 2GB -NewVHDPath $vhd -NewVHDSizeBytes 8GB -SwitchName $switch.Name | Out-Null
  $proof.Add("New-VM ok")
  Checkpoint-VM -Name $vmName -SnapshotName 'clean-base'; $proof.Add("Checkpoint-VM ok")
  $snap = Get-VMSnapshot -VMName $vmName; $proof.Add("Get-VMSnapshot: $($snap.Name)")
  Restore-VMCheckpoint -VMName $vmName -Name 'clean-base' -Confirm:$false; $proof.Add("Restore-VMCheckpoint ok")
  Remove-VM -Name $vmName -Force; if (Test-Path $vhd) { Remove-Item $vhd -Force }; $proof.Add("Remove-VM + vhdx cleanup ok")
  $r.Add("## Pipeline proof (create -> checkpoint -> revert -> remove)"); $proof | ForEach-Object { $r.Add($_) }; $r.Add("")
} catch {
  $ok=$false
  $r.Add("## Pipeline proof FAILED"); $proof | ForEach-Object { $r.Add($_) }; $r.Add(($_ | Out-String).Trim()); $r.Add("")
  Get-VM -Name $vmName -ErrorAction SilentlyContinue | ForEach-Object { Remove-VM -Name $vmName -Force -ErrorAction SilentlyContinue }
  if (Test-Path $vhd) { Remove-Item $vhd -Force -ErrorAction SilentlyContinue }
}

try { $c = Get-Volume -DriveLetter C; $r.Add("## Disk C:"); $r.Add("FreeGB: $([math]::Round($c.SizeRemaining/1GB))  SizeGB: $([math]::Round($c.Size/1GB))"); $r.Add("") } catch {}

if ($ok) { $r.Add("Verdict: VM-HOST-READY") } else { $r.Add("Verdict: STILL-NEEDS-ATTENTION (see failed sections above)") }
Push-Result ($r -join "`r`n")
