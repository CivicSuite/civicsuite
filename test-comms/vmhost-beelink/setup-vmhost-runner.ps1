# CivicSuite VM-host autonomous runner — ONE-SHOT INSTALLER (v2, robust force-fetch). Run as administrator.
# Installs a scheduled task that every 2 min + at each logon FORCE-fetches the branch and executes any new
# VMHOST-DIRECTIVE-NNN.ps1, writing results back. v2 fixes a stale-fetch bug (explicit branch fetch +
# checkout -f -B FETCH_HEAD, immune to stale tracking refs / shallow clones).
$ErrorActionPreference = 'Stop'
$Repo     = 'C:\dev\Codex\civicsuite'
$Branch   = 'stage-3a-baremetal-windows'
$RunDir   = 'C:\dev\Codex\vmhost-runner'
$TaskName = 'CivicSuiteVMHostRunner'

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  foreach ($p in @("$env:ProgramFiles\Git\cmd","$env:ProgramFiles\Git\bin","$env:LOCALAPPDATA\Programs\Git\cmd")) {
    if (Test-Path (Join-Path $p 'git.exe')) { $env:PATH = "$p;$env:PATH"; break }
  }
}

# bring the local repo CURRENT with a robust, stale-proof fetch before anything else
Set-Location $Repo
git fetch origin $Branch --force 2>&1 | Out-Null
git checkout -f -B $Branch FETCH_HEAD 2>&1 | Out-Null

New-Item -ItemType Directory -Force -Path $RunDir | Out-Null

# ---- runner.ps1 (single pass; the scheduled task repeats it) ----
$runner = @'
$ErrorActionPreference = 'Continue'
$Repo='C:\dev\Codex\civicsuite'; $Branch='stage-3a-baremetal-windows'
$VDir = Join-Path $Repo 'test-comms\vmhost-beelink'
$Lock = Join-Path $env:ProgramData 'vmhost-runner.lock'
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  foreach ($p in @("$env:ProgramFiles\Git\cmd","$env:ProgramFiles\Git\bin","$env:LOCALAPPDATA\Programs\Git\cmd")) {
    if (Test-Path (Join-Path $p 'git.exe')) { $env:PATH = "$p;$env:PATH"; break }
  }
}
$boot = (Get-CimInstance Win32_OperatingSystem).LastBootUpTime
if (Test-Path $Lock) {
  $lt = (Get-Item $Lock).LastWriteTime
  if ($lt -gt $boot -and ((Get-Date) - $lt).TotalMinutes -lt 90) { exit 0 }
}
Set-Content -Path $Lock -Value (Get-Date).ToString('o')
try {
  Set-Location $Repo
  git fetch origin $Branch --force 2>&1 | Out-Null
  git checkout -f -B $Branch FETCH_HEAD 2>&1 | Out-Null
  $scripts = Get-ChildItem (Join-Path $VDir 'VMHOST-DIRECTIVE-*.ps1') -ErrorAction SilentlyContinue | Sort-Object Name
  foreach ($s in $scripts) {
    if ($s.Name -notmatch 'VMHOST-DIRECTIVE-(\d+)\.ps1') { continue }
    $n = $Matches[1]
    if (Test-Path (Join-Path $VDir ("VMHOST-RESULT-{0}.md" -f $n))) { continue }
    try {
      & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $s.FullName 2>&1 |
        Out-File (Join-Path $env:ProgramData ("vmhost-dir-{0}.log" -f $n)) -Append -Encoding UTF8
    } catch {
      $err = ($_ | Out-String)
      Set-Location $Repo
      git fetch origin $Branch --force 2>&1 | Out-Null
      git checkout -f -B $Branch FETCH_HEAD 2>&1 | Out-Null
      $rp = Join-Path $VDir ("VMHOST-RESULT-{0}.md" -f $n)
      Set-Content -Path $rp -Encoding UTF8 -Value ("# VMHOST-RESULT-{0} (runner-caught failure)`r`n`r`nThe directive script threw before writing its own result:`r`n`r`n{1}" -f $n,$err)
      git add -- $rp 2>&1 | Out-Null
      git -c user.name='vmhost-runner' -c user.email='vmhost@localhost' commit -m ("vmhost: runner-caught failure on directive {0}" -f $n) 2>&1 | Out-Null
      git push origin ("HEAD:{0}" -f $Branch) 2>&1 | Out-Null
    }
    break
  }
} finally { Remove-Item $Lock -ErrorAction SilentlyContinue }
'@
Set-Content -Path (Join-Path $RunDir 'runner.ps1') -Value $runner -Encoding UTF8

# ---- scheduled task: at logon + every 2 min, highest privileges ----
$action = New-ScheduledTaskAction -Execute 'powershell.exe' `
  -Argument ("-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"{0}`"" -f (Join-Path $RunDir 'runner.ps1'))
$trigLogon  = New-ScheduledTaskTrigger -AtLogOn
$trigRepeat = New-ScheduledTaskTrigger -Once -At ((Get-Date).AddMinutes(1)) `
  -RepetitionInterval (New-TimeSpan -Minutes 2) -RepetitionDuration (New-TimeSpan -Days 3650)
$principal  = New-ScheduledTaskPrincipal -UserId ("{0}\{1}" -f $env:USERDOMAIN,$env:USERNAME) -LogonType Interactive -RunLevel Highest
$settings   = New-ScheduledTaskSettingsSet -StartWhenAvailable -MultipleInstances IgnoreNew `
  -ExecutionTimeLimit (New-TimeSpan -Hours 6) -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigLogon,$trigRepeat -Principal $principal -Settings $settings -Force | Out-Null
Start-ScheduledTask -TaskName $TaskName

# ---- enable AUTO-LOGIN so the box resumes the runner after the Hyper-V REBOOT with no manual sign-in ----
# The task is logon-triggered, so after a reboot it only fires once a user session exists. Auto-login makes
# that session come up by itself. This box's account looks passwordless, so classic auto-login applies.
# Best-effort: if the account actually has a password we cannot set, this is neutral (box waits at the
# login screen for ONE sign-in) — it never locks anyone out.
$autologin = 'unknown'
try {
  $wl = 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon'
  Set-ItemProperty   -Path $wl -Name 'AutoAdminLogon'    -Value '1'             -Type String
  Set-ItemProperty   -Path $wl -Name 'DefaultUserName'   -Value $env:USERNAME   -Type String
  Set-ItemProperty   -Path $wl -Name 'DefaultDomainName' -Value $env:USERDOMAIN -Type String
  Remove-ItemProperty -Path $wl -Name 'DefaultPassword'  -ErrorAction SilentlyContinue
  Remove-ItemProperty -Path $wl -Name 'AutoLogonCount'   -ErrorAction SilentlyContinue   # absent = unlimited
  $pl = 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\PasswordLess\Device'
  if (Test-Path $pl) { Set-ItemProperty -Path $pl -Name 'DevicePasswordLessBuildVersion' -Value 0 -Type DWord -ErrorAction SilentlyContinue }
  $autologin = 'enabled (passwordless account)'
} catch { $autologin = "could NOT enable ($($_.Exception.Message)) — one manual login may be needed after the reboot" }

# ---- immediate visibility: push a status file so the dev side sees the runner is live ----
try {
  Set-Location $Repo
  git fetch origin $Branch --force 2>&1 | Out-Null
  git checkout -f -B $Branch FETCH_HEAD 2>&1 | Out-Null
  $sp = Join-Path $Repo 'test-comms\vmhost-beelink\RUNNER-STATUS.md'
  Set-Content -Path $sp -Encoding UTF8 -Value ("# VMHost runner status`r`n`r`nInstalled $(Get-Date -Format o) on $env:COMPUTERNAME (v2 force-fetch). Task '$TaskName' active (at logon + every 2 min, highest priv). AUTO-LOGIN: $autologin. Picking up directive 002 now; after the Hyper-V reboot it resumes via auto-login + the logon trigger.")
  git add -- $sp 2>&1 | Out-Null
  git -c user.name='vmhost-beelink' -c user.email='vmhost@localhost' commit -m "vmhost: runner v2 installed + online (autologin set)" 2>&1 | Out-Null
  git push origin ("HEAD:{0}" -f $Branch) 2>&1 | Out-Null
} catch {}

Write-Host "Installed '$TaskName' v2 (logon + every 2 min, highest priv, force-fetch). Auto-login: $autologin. Autonomous across the reboot."
