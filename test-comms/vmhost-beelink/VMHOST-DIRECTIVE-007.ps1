# VMHOST-DIRECTIVE-007 - Windows install media + VM readiness probe (PS5.1 clean)
# Replaces DIRECTIVE-005 which had PS7-only syntax. Pure ASCII. Always pushes a result.
$ErrorActionPreference = 'Continue'
$Repo   = 'C:\dev\Codex\civicsuite'
$Branch = 'stage-3a-baremetal-windows'
$VDir   = Join-Path $Repo 'test-comms\vmhost-beelink'
$Result = Join-Path $VDir 'VMHOST-RESULT-007.md'

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  foreach ($p in @("$env:ProgramFiles\Git\cmd","$env:ProgramFiles\Git\bin","$env:LOCALAPPDATA\Programs\Git\cmd")) {
    if (Test-Path (Join-Path $p 'git.exe')) { $env:PATH = "$p;$env:PATH"; break }
  }
}

Set-Location $Repo
git fetch origin $Branch --force 2>&1 | Out-Null
git checkout -f -B $Branch FETCH_HEAD 2>&1 | Out-Null

$out = New-Object System.Collections.ArrayList

function Add-Line { param([string]$s) $out.Add($s) | Out-Null }

Add-Line "# VMHOST-RESULT-007 - Windows install media + VM readiness probe"
Add-Line ""
Add-Line "Machine: $env:COMPUTERNAME  Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Add-Line ""

# --- disk space ---
Add-Line "## Disk space"
try {
  Get-PSDrive -PSProvider FileSystem | ForEach-Object {
    if ($_.Free -ne $null) {
      $freeGB  = [math]::Round($_.Free / 1GB, 1)
      $totalGB = [math]::Round(($_.Used + $_.Free) / 1GB, 1)
      Add-Line "  Drive $($_.Name): $freeGB GB free of $totalGB GB"
    }
  }
} catch {
  Add-Line "  ERROR: $($_.Exception.Message)"
}
Add-Line ""

# --- search for ISOs on common drives ---
Add-Line "## Windows ISO files found (>= 500 MB)"
try {
  $isoList = New-Object System.Collections.ArrayList
  foreach ($root in @('C:\','D:\','E:\','F:\')) {
    if (Test-Path $root) {
      Get-ChildItem -Path $root -Recurse -Filter '*.iso' -ErrorAction SilentlyContinue -Force |
        Where-Object { $_.Length -gt 524288000 } |
        ForEach-Object {
          $mb = [math]::Round($_.Length / 1MB)
          $isoList.Add("  $($_.FullName)  ($mb MB)") | Out-Null
        }
    }
  }
  if ($isoList.Count -eq 0) {
    Add-Line "  (none found)"
  } else {
    foreach ($line in $isoList) { Add-Line $line }
  }
} catch {
  Add-Line "  ERROR: $($_.Exception.Message)"
}
Add-Line ""

# --- search for WIM/ESD images ---
Add-Line "## WIM/ESD images found (>= 200 MB)"
try {
  $wimList = New-Object System.Collections.ArrayList
  foreach ($root in @('C:\','D:\','E:\')) {
    if (Test-Path $root) {
      Get-ChildItem -Path $root -Recurse -ErrorAction SilentlyContinue -Force |
        Where-Object { ($_.Extension -eq '.wim' -or $_.Extension -eq '.esd') -and $_.Length -gt 209715200 } |
        ForEach-Object {
          $mb = [math]::Round($_.Length / 1MB)
          $wimList.Add("  $($_.FullName)  ($mb MB)") | Out-Null
        }
    }
  }
  if ($wimList.Count -eq 0) {
    Add-Line "  (none found)"
  } else {
    foreach ($line in $wimList) { Add-Line $line }
  }
} catch {
  Add-Line "  ERROR: $($_.Exception.Message)"
}
Add-Line ""

# --- existing Hyper-V VMs ---
Add-Line "## Existing Hyper-V VMs"
try {
  $vms = Get-VM -ErrorAction SilentlyContinue
  if ($vms -and $vms.Count -gt 0) {
    foreach ($vm in $vms) {
      $memMB = [math]::Round($vm.MemoryAssigned / 1MB)
      Add-Line "  $($vm.Name)  State=$($vm.State)  Gen=$($vm.Generation)  MemMB=$memMB"
    }
  } else {
    Add-Line "  (none)"
  }
} catch {
  Add-Line "  ERROR: $($_.Exception.Message)"
}
Add-Line ""

# --- Hyper-V default storage paths ---
Add-Line "## Hyper-V default paths"
try {
  $hvs = Get-VMHost -ErrorAction SilentlyContinue
  if ($hvs) {
    Add-Line "  VirtualHardDiskPath: $($hvs.VirtualHardDiskPath)"
    Add-Line "  VirtualMachinePath:  $($hvs.VirtualMachinePath)"
  } else {
    Add-Line "  (Get-VMHost returned nothing)"
  }
} catch {
  Add-Line "  ERROR: $($_.Exception.Message)"
}
Add-Line ""

# --- useful build tools ---
Add-Line "## Build tools"
$toolPaths = @{
  'dism.exe'    = 'C:\Windows\System32\dism.exe'
  'oscdimg.exe' = "$env:ProgramFiles\Windows Kits\10\Assessment and Deployment Kit\Deployment Tools\amd64\Oscdimg\oscdimg.exe"
}
foreach ($name in $toolPaths.Keys) {
  $path = $toolPaths[$name]
  if (Test-Path $path) {
    Add-Line "  PRESENT: $name"
  } else {
    Add-Line "  ABSENT:  $name"
  }
}
Add-Line ""

Add-Line "## Note for dev side"
Add-Line "Goal: build a fresh Windows VM with no prior CivicSuite install, install the fixed MSI,"
Add-Line "validate lifecycle. If no ISO found above, provide a download URL in DIRECTIVE-008."
Add-Line "No further action needed on this directive -- result pushed below."

# --- write result and push ---
Set-Content -Path $Result -Value ($out -join "`r`n") -Encoding UTF8

git add -- $Result 2>&1 | Out-Null
git -c user.name='vmhost-runner' -c user.email='vmhost@localhost' `
    commit -m "vmhost: result 007 Windows install media + VM readiness probe" 2>&1 | Out-Null
git push origin "HEAD:$Branch" 2>&1 | Out-Null

Write-Host "DIRECTIVE-007 complete. RESULT-007 pushed."
