# VMHOST-DIRECTIVE-003 (read-only autonomy probe, ASCII-only). Reports whether the scheduled-task
# runner is installed and live. If the runner picks this up on its own, that PROVES autonomy.
$ErrorActionPreference='Stop'
$Repo='C:\dev\Codex\civicsuite'; $Branch='stage-3a-baremetal-windows'
$VDir=Join-Path $Repo 'test-comms\vmhost-beelink'; $N='003'
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  foreach ($p in @("$env:ProgramFiles\Git\cmd","$env:ProgramFiles\Git\bin","$env:LOCALAPPDATA\Programs\Git\cmd")) {
    if (Test-Path (Join-Path $p 'git.exe')) { $env:PATH="$p;$env:PATH"; break } } }
function Push-Result([string]$body){
  Set-Location $Repo
  git fetch origin $Branch --force 2>&1 | Out-Null
  git checkout -f -B $Branch FETCH_HEAD 2>&1 | Out-Null
  $rp=Join-Path $VDir ("VMHOST-RESULT-{0}.md" -f $N)
  Set-Content -Path $rp -Value $body -Encoding UTF8
  git add -- $rp 2>&1 | Out-Null
  git -c user.name='vmhost-beelink' -c user.email='vmhost@localhost' commit -m ("vmhost: result {0} autonomy probe" -f $N) 2>&1 | Out-Null
  git push origin ("HEAD:{0}" -f $Branch) 2>&1 | Out-Null
}
$r=New-Object System.Collections.Generic.List[string]
$r.Add("# VMHOST-RESULT-003 - autonomy probe"); $r.Add("")
$t = Get-ScheduledTask -TaskName 'CivicSuiteVMHostRunner' -ErrorAction SilentlyContinue
if ($t) {
  $r.Add("scheduled task CivicSuiteVMHostRunner: PRESENT (state $($t.State))")
  try { $i = Get-ScheduledTaskInfo -TaskName 'CivicSuiteVMHostRunner'
        $r.Add("last run: $($i.LastRunTime)  lastResult: $($i.LastTaskResult)  next run: $($i.NextRunTime)") } catch {}
  $r.Add("=> AUTONOMOUS: the runner picked up this directive on its own.")
} else {
  $r.Add("scheduled task CivicSuiteVMHostRunner: NOT INSTALLED")
  $r.Add("=> produced by the AI agent on a check-the-repo, not the runner.")
}
try { $wl='HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon'
      $a=(Get-ItemProperty $wl -Name AutoAdminLogon -ErrorAction SilentlyContinue).AutoAdminLogon
      $r.Add("AutoAdminLogon: $a") } catch {}
Push-Result ($r -join "`r`n")
