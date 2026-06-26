# VMHOST-DIRECTIVE-005 - inventory Windows install media + VM readiness for clean-machine MSI validation
# Pure ASCII. Resumable. Writes VMHOST-RESULT-005.md and pushes to stage-3a-baremetal-windows.
# Purpose: before building a base Windows VM, probe what install media and tools are available.
$ErrorActionPreference = 'Continue'
$Repo   = 'C:\dev\Codex\civicsuite'
$Branch = 'stage-3a-baremetal-windows'
$VDir   = Join-Path $Repo 'test-comms\vmhost-beelink'
$Result = Join-Path $VDir 'VMHOST-RESULT-005.md'

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  foreach ($p in @("$env:ProgramFiles\Git\cmd","$env:ProgramFiles\Git\bin","$env:LOCALAPPDATA\Programs\Git\cmd")) {
    if (Test-Path (Join-Path $p 'git.exe')) { $env:PATH = "$p;$env:PATH"; break }
  }
}

Set-Location $Repo
git fetch origin $Branch --force 2>&1 | Out-Null
git checkout -f -B $Branch FETCH_HEAD 2>&1 | Out-Null

$lines = [System.Collections.ArrayList]@()
$lines.Add("# VMHOST-RESULT-005 - Windows install media + VM readiness probe") | Out-Null
$lines.Add("") | Out-Null
$lines.Add("Machine: $env:COMPUTERNAME  Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')") | Out-Null
$lines.Add("") | Out-Null

# --- disk space ---
$lines.Add("## Disk space") | Out-Null
try {
  Get-PSDrive -PSProvider FileSystem | Where-Object { $_.Free -ne $null } | ForEach-Object {
    $lines.Add("  Drive $($_.Name): $([math]::Round($_.Free/1GB,1)) GB free of $([math]::Round(($_.Used+$_.Free)/1GB,1)) GB") | Out-Null
  }
} catch { $lines.Add("  ERROR: $($_.Exception.Message)") | Out-Null }
$lines.Add("") | Out-Null

# --- search for Windows ISOs ---
$lines.Add("## Windows ISO files found") | Out-Null
try {
  $isos = @()
  foreach ($root in @('C:\','D:\','E:\','F:\')) {
    if (Test-Path $root) {
      $found = Get-ChildItem -Path $root -Recurse -Filter '*.iso' -ErrorAction SilentlyContinue -Force |
               Where-Object { $_.Length -gt 500MB } |
               Select-Object FullName, @{N='SizeMB';E={[math]::Round($_.Length/1MB)}}
      $isos += $found
    }
  }
  if ($isos.Count -eq 0) { $lines.Add("  (none found >= 500 MB)") | Out-Null }
  else { $isos | ForEach-Object { $lines.Add("  $($_.FullName)  ($($_.SizeMB) MB)") | Out-Null } }
} catch { $lines.Add("  ERROR: $($_.Exception.Message)") | Out-Null }
$lines.Add("") | Out-Null

# --- search for WIM/ESD images ---
$lines.Add("## WIM/ESD images found") | Out-Null
try {
  $wims = @()
  foreach ($root in @('C:\','D:\','E:\')) {
    if (Test-Path $root) {
      $found = Get-ChildItem -Path $root -Recurse -Include '*.wim','*.esd' -ErrorAction SilentlyContinue -Force |
               Where-Object { $_.Length -gt 200MB } |
               Select-Object FullName, @{N='SizeMB';E={[math]::Round($_.Length/1MB)}}
      $wims += $found
    }
  }
  if ($wims.Count -eq 0) { $lines.Add("  (none found >= 200 MB)") | Out-Null }
  else { $wims | ForEach-Object { $lines.Add("  $($_.FullName)  ($($_.SizeMB) MB)") | Out-Null } }
} catch { $lines.Add("  ERROR: $($_.Exception.Message)") | Out-Null }
$lines.Add("") | Out-Null

# --- existing Hyper-V VMs ---
$lines.Add("## Existing Hyper-V VMs") | Out-Null
try {
  $vms = Get-VM -ErrorAction SilentlyContinue
  if ($vms -and $vms.Count -gt 0) {
    $vms | ForEach-Object { $lines.Add("  $($_.Name)  State=$($_.State)  Gen=$($_.Generation)  MemMB=$([math]::Round($_.MemoryAssigned/1MB))") | Out-Null }
  } else { $lines.Add("  (none)") | Out-Null }
} catch { $lines.Add("  ERROR: $($_.Exception.Message)") | Out-Null }
$lines.Add("") | Out-Null

# --- Hyper-V default paths ---
$lines.Add("## Hyper-V default paths") | Out-Null
try {
  $hvs = Get-VMHost -ErrorAction SilentlyContinue
  if ($hvs) {
    $lines.Add("  VirtualHardDiskPath: $($hvs.VirtualHardDiskPath)") | Out-Null
    $lines.Add("  VirtualMachinePath:  $($hvs.VirtualMachinePath)") | Out-Null
  }
} catch { $lines.Add("  ERROR: $($_.Exception.Message)") | Out-Null }
$lines.Add("") | Out-Null

# --- Windows ADK / DISM / Oscdimg available? ---
$lines.Add("## Build tools") | Out-Null
$tools = @{
  'dism.exe'    = 'C:\Windows\System32\dism.exe'
  'oscdimg.exe' = "$env:ProgramFiles\Windows Kits\10\Assessment and Deployment Kit\Deployment Tools\amd64\Oscdimg\oscdimg.exe"
  'makewinpemedia.cmd' = "$env:ProgramFiles\Windows Kits\10\Assessment and Deployment Kit\Windows Preinstallation Environment\MakeWinPEMedia.cmd"
}
foreach ($t in $tools.GetEnumerator()) {
  if (Test-Path $t.Value) { $lines.Add("  PRESENT: $($t.Key) at $($t.Value)") | Out-Null }
  else { $lines.Add("  ABSENT:  $($t.Key)") | Out-Null }
}
# also check PATH for common tools
@('dism','bcdboot','bcdedit') | ForEach-Object {
  $c = Get-Command $_ -ErrorAction SilentlyContinue
  if ($c) { $lines.Add("  PATH:    $_ at $($c.Source)") | Out-Null }
}
$lines.Add("") | Out-Null

# --- CivicSuite MSI artifacts visible via GitHub release? ---
$lines.Add("## Latest CivicSuite CI releases (GitHub API)") | Out-Null
try {
  $rel = Invoke-RestMethod -Uri "https://api.github.com/repos/CivicSuite/civicsuite/releases?per_page=5" `
         -Headers @{Authorization="token $(git -C $Repo config credential.helper 2>$null | Out-Null; (git -C $Repo credential fill 2>$null) -match 'password=(.*)' | Out-Null; $null)";"User-Agent"="vmhost-runner"} `
         -ErrorAction SilentlyContinue 2>&1
  if ($rel -and $rel.Count -gt 0) {
    $rel | Select-Object -First 5 | ForEach-Object {
      $assets = ($_.assets | ForEach-Object { $_.name }) -join ', '
      $kind = if ($_.prerelease) { 'pre' } else { 'release' }
      $lines.Add("  $($_.tag_name) ($kind): $assets") | Out-Null
    }
  } else { $lines.Add("  (could not fetch or no releases)") | Out-Null }
} catch { $lines.Add("  ERROR fetching releases: $($_.Exception.Message)") | Out-Null }
$lines.Add("") | Out-Null

# --- what the dev side needs ---
$lines.Add("## Context for dev side") | Out-Null
$lines.Add("The goal is: create a fresh Windows VM (no prior CivicSuite install), install the fixed MSI,") | Out-Null
$lines.Add("validate the lifecycle (first-run wizard, backup/restore, uninstall). A Windows eval ISO is") | Out-Null
$lines.Add("needed. If none is found above, the dev side will provide a download URL in DIRECTIVE-006.") | Out-Null
$lines.Add("No action needed from you on this directive -- just report and push this result.") | Out-Null

# --- write and push ---
Set-Content -Path $Result -Value ($lines -join "`r`n") -Encoding UTF8
git add -- $Result 2>&1 | Out-Null
git -c user.name='vmhost-runner' -c user.email='vmhost@localhost' commit `
    -m "vmhost: result 005 Windows install media + VM readiness probe" `
    --signoff 2>&1 | Out-Null
git push origin "HEAD:$Branch" 2>&1 | Out-Null
Write-Host "DIRECTIVE-005 complete. RESULT-005 pushed."
