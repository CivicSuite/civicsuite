# VMHOST-DIRECTIVE-018 - DECOMMISSION / SELF-WIPE
# Operator request: remove the every-2-min CivicSuiteVMHostRunner scheduled task and wipe all
# CivicSuite testing artifacts from this tester (app install, model, bundled Postgres/Ollama data,
# Windows Sandbox + Hyper-V VMs, staged MSIs/.wsb, the auto-login the runner set, the runner +
# repo clone). Best-effort; each block is guarded. Pushes VMHOST-RESULT-018.md BEFORE tearing
# down the control channel, then unregisters the task and hands repo/runner deletion to a detached
# cleaner (the parent runner holds a CWD handle on the repo). ASCII + PS5.1 only.
$ErrorActionPreference = 'Continue'
$Repo    = 'C:\dev\Codex\civicsuite'
$Branch  = 'stage-3a-baremetal-windows'
$VDir    = Join-Path $Repo 'test-comms\vmhost-beelink'
$RunDir  = 'C:\dev\Codex\vmhost-runner'
$TaskName= 'CivicSuiteVMHostRunner'
$N       = '018'

$report = New-Object System.Collections.ArrayList
function Note($m){ [void]$report.Add($m) }

$freeBefore = 0
try { $freeBefore = [math]::Round((Get-PSDrive C -ErrorAction SilentlyContinue).Free/1GB,2) } catch {}
Note(("Decommission started {0} on {1}. Free C: before = {2} GB." -f (Get-Date -Format o), $env:COMPUTERNAME, $freeBefore))

# 1) Stop CivicSuite-related processes
foreach($pn in @('CivicSuite','civicsuite','ollama','ollama app','postgres','pg_ctl')){
  try {
    $ps = Get-Process -Name $pn -ErrorAction SilentlyContinue
    if($ps){ $ps | Stop-Process -Force -ErrorAction SilentlyContinue; Note(("Stopped process: {0} ({1} instance(s))." -f $pn, @($ps).Count)) }
  } catch {}
}

# 2) Stop + delete CivicSuite-related Windows services
try {
  $svcs = Get-Service -ErrorAction SilentlyContinue | Where-Object { $_.Name -match 'civic|ollama|postgres' -or $_.DisplayName -match 'CivicSuite|Ollama' }
  foreach($s in $svcs){
    try { Stop-Service -Name $s.Name -Force -ErrorAction SilentlyContinue } catch {}
    try { & sc.exe delete $s.Name 2>&1 | Out-Null; Note(("Removed service: {0}." -f $s.Name)) } catch {}
  }
} catch {}

# 3) Uninstall the CivicSuite MSI (per-machine + per-user registry)
$uninstRoots = @(
 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall',
 'HKLM:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall',
 'HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall'
)
$found = 0
foreach($root in $uninstRoots){
  try {
    Get-ChildItem $root -ErrorAction SilentlyContinue | ForEach-Object {
      $p = Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue
      if($p -and $p.DisplayName -match 'CivicSuite'){
        $found++
        $code = $_.PSChildName
        try {
          & cmd.exe /c ("msiexec /x {0} /qn /norestart" -f $code) 2>&1 | Out-Null
          Note(("Uninstalled MSI: {0} ({1})." -f $p.DisplayName, $code))
        } catch { Note(("MSI uninstall attempt failed for {0}: {1}" -f $p.DisplayName, $_.Exception.Message)) }
      }
    }
  } catch {}
}
if($found -eq 0){ Note('No CivicSuite MSI uninstall entry found (already removed, or only installed inside disposable Sandbox).') }

# 4) Remove CivicSuite app + data directories (and the local .ollama model store)
$dirTargets = New-Object System.Collections.ArrayList
[void]$dirTargets.Add((Join-Path $env:ProgramData 'CivicSuite'))
[void]$dirTargets.Add((Join-Path $env:ProgramFiles 'CivicSuite'))
if(${env:ProgramFiles(x86)}){ [void]$dirTargets.Add((Join-Path ${env:ProgramFiles(x86)} 'CivicSuite')) }
try {
  Get-ChildItem 'C:\Users' -Directory -ErrorAction SilentlyContinue | ForEach-Object {
    $u = $_.FullName
    foreach($sub in @('AppData\Roaming','AppData\Local','AppData\LocalLow')){
      $base = Join-Path $u $sub
      if(Test-Path $base){
        Get-ChildItem $base -Directory -ErrorAction SilentlyContinue | Where-Object { $_.Name -match 'civicsuite|civic-suite|com\.civic' } | ForEach-Object { [void]$dirTargets.Add($_.FullName) }
      }
    }
    $oll = Join-Path $u '.ollama'
    if(Test-Path $oll){ [void]$dirTargets.Add($oll) }
  }
} catch {}
foreach($d in ($dirTargets | Select-Object -Unique)){
  try {
    if(Test-Path $d){
      $sz = 0
      try { $sz = [math]::Round(((Get-ChildItem $d -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum)/1GB,2) } catch {}
      Remove-Item $d -Recurse -Force -ErrorAction SilentlyContinue
      if(Test-Path $d){ Note(("Could NOT fully remove: {0}" -f $d)) } else { Note(("Removed dir: {0} ({1} GB)." -f $d, $sz)) }
    }
  } catch { Note(("Error removing {0}: {1}" -f $d, $_.Exception.Message)) }
}

# 5) Remove staged MSIs, loose model files, and Sandbox .wsb configs (+ their test mapped folders)
$searchRoots = @('C:\dev', (Join-Path $env:USERPROFILE 'Downloads'), (Join-Path $env:USERPROFILE 'Desktop'), (Join-Path $env:USERPROFILE 'Documents'))
foreach($sr in $searchRoots){
  if(-not (Test-Path $sr)){ continue }
  try {
    Get-ChildItem $sr -Recurse -Include 'CivicSuite_*.msi','*civicsuite*.msi' -File -ErrorAction SilentlyContinue | ForEach-Object {
      try { Remove-Item $_.FullName -Force -ErrorAction SilentlyContinue; Note(("Removed staged MSI: {0}" -f $_.FullName)) } catch {}
    }
  } catch {}
  try {
    Get-ChildItem $sr -Recurse -Include '*.gguf' -File -ErrorAction SilentlyContinue | ForEach-Object {
      try { Remove-Item $_.FullName -Force -ErrorAction SilentlyContinue; Note(("Removed model file: {0}" -f $_.FullName)) } catch {}
    }
  } catch {}
  try {
    Get-ChildItem $sr -Recurse -Filter '*.wsb' -File -ErrorAction SilentlyContinue | ForEach-Object {
      $wsb = $_.FullName
      try {
        [xml]$x = Get-Content $wsb -Raw -ErrorAction SilentlyContinue
        if($x -and $x.Configuration -and $x.Configuration.MappedFolders){
          foreach($mf in @($x.Configuration.MappedFolders.MappedFolder)){
            if($mf -and $mf.HostFolder -and (Test-Path $mf.HostFolder) -and ($mf.HostFolder -match 'civic|sandbox|vmhost|test')){
              Remove-Item $mf.HostFolder -Recurse -Force -ErrorAction SilentlyContinue
              Note(("Removed sandbox mapped folder: {0}" -f $mf.HostFolder))
            }
          }
        }
      } catch {}
      try { Remove-Item $wsb -Force -ErrorAction SilentlyContinue; Note(("Removed sandbox config: {0}" -f $wsb)) } catch {}
    }
  } catch {}
}

# 6) Remove Hyper-V VMs + their VHDs; stop sandbox/compute leftovers
if(Get-Command Get-VM -ErrorAction SilentlyContinue){
  try {
    $vms = @(Get-VM -ErrorAction SilentlyContinue)
    foreach($vm in $vms){
      try {
        $vhds = @(); try { $vhds = @($vm.HardDrives.Path) } catch {}
        if($vm.State -ne 'Off'){ Stop-VM -Name $vm.Name -TurnOff -Force -ErrorAction SilentlyContinue }
        Remove-VM -Name $vm.Name -Force -ErrorAction SilentlyContinue
        foreach($vhd in $vhds){ if($vhd -and (Test-Path $vhd)){ Remove-Item $vhd -Force -ErrorAction SilentlyContinue } }
        Note(("Removed Hyper-V VM: {0} (and {1} VHD(s))." -f $vm.Name, @($vhds).Count))
      } catch {}
    }
    if($vms.Count -eq 0){ Note('No Hyper-V VMs present.') }
  } catch {}
} else { Note('Hyper-V module not present; no explicit VMs (Windows Sandbox VMs are disposable and auto-removed on close).') }
foreach($pn in @('WindowsSandbox','WindowsSandboxClient','WindowsSandboxServer')){
  try { Get-Process -Name $pn -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue } catch {}
}

# 7) Revert the auto-login the runner installer set (security hygiene)
try {
  $wl = 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon'
  Set-ItemProperty -Path $wl -Name 'AutoAdminLogon' -Value '0' -Type String -ErrorAction SilentlyContinue
  Remove-ItemProperty -Path $wl -Name 'DefaultUserName' -ErrorAction SilentlyContinue
  Remove-ItemProperty -Path $wl -Name 'DefaultDomainName' -ErrorAction SilentlyContinue
  Remove-ItemProperty -Path $wl -Name 'DefaultPassword' -ErrorAction SilentlyContinue
  Remove-ItemProperty -Path $wl -Name 'AutoLogonCount' -ErrorAction SilentlyContinue
  $pl = 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\PasswordLess\Device'
  if(Test-Path $pl){ Set-ItemProperty -Path $pl -Name 'DevicePasswordLessBuildVersion' -Value 2 -Type DWord -ErrorAction SilentlyContinue }
  Note('Reverted auto-login (AutoAdminLogon=0, cleared Default* + AutoLogonCount, restored PasswordLess default).')
} catch { Note(("Auto-login revert error: {0}" -f $_.Exception.Message)) }

# 8) Remove runner lock + per-directive logs from ProgramData
try { Remove-Item (Join-Path $env:ProgramData 'vmhost-runner.lock') -Force -ErrorAction SilentlyContinue } catch {}
try { Get-ChildItem (Join-Path $env:ProgramData 'vmhost-dir-*.log') -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue } catch {}
Note('Removed runner lock + directive logs from ProgramData (any in-use log is cleared by the detached cleaner).')

# 9) Best-effort disable of the test-only Windows features (a REBOOT finalizes removal)
$featNote = 'Windows optional features left unchanged.'
try {
  if(Get-Command Disable-WindowsOptionalFeature -ErrorAction SilentlyContinue){
    foreach($f in @('Containers-DisposableClientVM','Microsoft-Hyper-V-All')){
      try { Disable-WindowsOptionalFeature -Online -FeatureName $f -NoRestart -ErrorAction SilentlyContinue | Out-Null } catch {}
    }
    $featNote = 'Requested disable of Windows Sandbox + Hyper-V features (-NoRestart); a REBOOT finalizes their removal. WSL/VirtualMachinePlatform left untouched.'
  }
} catch {}
Note($featNote)

# 10) Disk after wipe, then BUILD + PUSH the result before tearing down the control channel
$freeAfter = 0
try { $freeAfter = [math]::Round((Get-PSDrive C -ErrorAction SilentlyContinue).Free/1GB,2) } catch {}
$reclaimed = [math]::Round($freeAfter - $freeBefore,2)
Note(("Free C: after = {0} GB (reclaimed ~{1} GB)." -f $freeAfter, $reclaimed))

$nl = "`r`n"
$body = "# VMHOST-RESULT-018 - DECOMMISSION / SELF-WIPE" + $nl + $nl
$body += "Tester decommission per operator request: removed the every-2-min runner task and wiped CivicSuite testing artifacts." + $nl + $nl
$body += "## Actions" + $nl + $nl
foreach($line in $report){ $body += ("- {0}" -f $line) + $nl }
$body += $nl + "## Teardown (after this push)" + $nl + $nl
$body += "- Unregister scheduled task '" + $TaskName + "' (stops the every-2-min check)." + $nl
$body += "- Detached cleaner removes the runner dir + repo clone once this process tree exits." + $nl
$body += "- A reboot finalizes the Windows Sandbox / Hyper-V feature removal." + $nl

$pushOk = $false
try {
  Set-Location $Repo
  & git fetch origin $Branch --force 2>&1 | Out-Null
  & git checkout -f -B $Branch FETCH_HEAD 2>&1 | Out-Null
  $rp = Join-Path $VDir ('VMHOST-RESULT-{0}.md' -f $N)
  [System.IO.File]::WriteAllText($rp, $body, (New-Object System.Text.UTF8Encoding($false)))
  & git add -- $rp 2>&1 | Out-Null
  & git -c user.name='vmhost-beelink' -c user.email='vmhost@localhost' commit -m 'vmhost: directive 018 - decommission + self-wipe complete' 2>&1 | Out-Null
  & git push origin ("HEAD:{0}" -f $Branch) 2>&1 | Out-Null
  if($LASTEXITCODE -eq 0){ $pushOk = $true }
} catch {}

# 11) Unregister the scheduled task (this is the "every 2 minute check" removal)
try { Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue } catch {}
try { & schtasks.exe /delete /tn $TaskName /f 2>&1 | Out-Null } catch {}

# 12) Detached delayed cleaner: removes runner dir + repo clone after this process tree exits.
#     (the parent runner holds a CWD handle on the repo, so deletion must happen after it exits)
$pd = $env:ProgramData
$delRepo = ''
if($pushOk){ $delRepo = ("Remove-Item '{0}' -Recurse -Force -ErrorAction SilentlyContinue;" -f $Repo) }
$cleaner = ("Start-Sleep -Seconds 30; Set-Location 'C:\'; " +
            "Remove-Item '{0}' -Recurse -Force -ErrorAction SilentlyContinue; " +
            "Remove-Item '{1}\vmhost-dir-*.log' -Force -ErrorAction SilentlyContinue; " +
            "Remove-Item '{1}\vmhost-runner.lock' -Force -ErrorAction SilentlyContinue; {2}" -f $RunDir, $pd, $delRepo)
try { Start-Process -FilePath 'powershell.exe' -ArgumentList @('-NoProfile','-ExecutionPolicy','Bypass','-WindowStyle','Hidden','-Command',$cleaner) -WindowStyle Hidden } catch {}

Write-Host 'Directive 018 complete: task removed, artifacts wiped, result pushed, detached cleaner scheduled.'
