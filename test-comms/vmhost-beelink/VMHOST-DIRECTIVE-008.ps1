# VMHOST-DIRECTIVE-008 - enable Windows Sandbox for clean-MSI validation
# Phase-aware: detects current state and resumes. Pure ASCII, PS5.1 only.
# Phase 1: check/enable Sandbox. Phase 2 (after reboot): confirm and report ready.
$ErrorActionPreference = 'Continue'
$Repo   = 'C:\dev\Codex\civicsuite'
$Branch = 'stage-3a-baremetal-windows'
$VDir   = Join-Path $Repo 'test-comms\vmhost-beelink'
$Result = Join-Path $VDir 'VMHOST-RESULT-008.md'

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  foreach ($p in @("$env:ProgramFiles\Git\cmd","$env:ProgramFiles\Git\bin","$env:LOCALAPPDATA\Programs\Git\cmd")) {
    if (Test-Path (Join-Path $p 'git.exe')) { $env:PATH = "$p;$env:PATH"; break }
  }
}

Set-Location $Repo
git fetch origin $Branch --force 2>&1 | Out-Null
git checkout -f -B $Branch FETCH_HEAD 2>&1 | Out-Null

function Push-Result {
  param([string]$body)
  Set-Content -Path $Result -Value $body -Encoding UTF8
  git add -- $Result 2>&1 | Out-Null
  git -c user.name='vmhost-runner' -c user.email='vmhost@localhost' `
      commit -m "vmhost: result 008 Windows Sandbox probe" 2>&1 | Out-Null
  git push origin "HEAD:$Branch" 2>&1 | Out-Null
}

# --- detect Windows edition ---
$edition = (Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion' -Name 'EditionID' -ErrorAction SilentlyContinue).EditionID
$build   = (Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion' -Name 'CurrentBuildNumber' -ErrorAction SilentlyContinue).CurrentBuildNumber

# Windows Sandbox requires Pro/Enterprise/Education and Win10 build 18362+
$sandboxSupported = $false
if ($edition -match 'Pro|Enterprise|Education|Server') {
  if ([int]$build -ge 18362) {
    $sandboxSupported = $true
  }
}

if (-not $sandboxSupported) {
  Push-Result @"
# VMHOST-RESULT-008 - Windows Sandbox not available

Machine: $env:COMPUTERNAME  Edition: $edition  Build: $build

Windows Sandbox requires Windows 10/11 Pro, Enterprise, or Education (build 18362+).
This machine is running $edition. Cannot use Sandbox approach.

Dev side: use the Hyper-V + ISO download approach for clean-machine validation.
Waiting for DIRECTIVE-009 with further instructions.
"@
  Write-Host "Sandbox not supported on $edition. Result pushed."
  exit 0
}

# --- check if Sandbox feature already enabled ---
$feature = Get-WindowsOptionalFeature -Online -FeatureName 'Containers-DisposableClientVM' -ErrorAction SilentlyContinue
$featureState = if ($feature) { $feature.State } else { 'Unknown' }

# Phase 2: if we just rebooted and Sandbox is now enabled, confirm and report ready
if ($featureState -eq 'Enabled') {
  # Verify wsb.exe is present (confirms Sandbox is fully installed)
  $wsbExe = Get-Command 'WindowsSandbox.exe' -ErrorAction SilentlyContinue
  if (-not $wsbExe) {
    $wsbExe = Get-ChildItem 'C:\Windows\System32\WindowsSandbox.exe' -ErrorAction SilentlyContinue
  }
  Push-Result @"
# VMHOST-RESULT-008 - Windows Sandbox READY

Machine: $env:COMPUTERNAME  Edition: $edition  Build: $build
Feature state: $featureState
WindowsSandbox.exe: $(if ($wsbExe) { $wsbExe.FullName } else { 'not found in expected path - may still work' })

Windows Sandbox is enabled. Ready for clean-machine MSI validation via Sandbox.

Dev side: post DIRECTIVE-009 with the fixed MSI release tag to download and test.
The Sandbox approach gives a fresh Windows environment in minutes with no ISO needed.
"@
  Write-Host "Sandbox is READY. Result pushed."
  exit 0
}

# Phase 1: enable the Sandbox feature and reboot
Write-Host "Enabling Windows Sandbox (Containers-DisposableClientVM)..."
$result008 = Enable-WindowsOptionalFeature -Online -FeatureName 'Containers-DisposableClientVM' -NoRestart -ErrorAction SilentlyContinue

if ($result008 -and $result008.RestartNeeded) {
  Write-Host "Reboot required. Scheduling reboot in 10 seconds..."
  # Push an in-progress note before rebooting so the channel is not silent
  $now = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
  $tmpNote = Join-Path $VDir 'VMHOST-RESULT-008-REBOOTING.md'
  Set-Content -Path $tmpNote -Value "# VMHOST Directive 008 - rebooting to complete Sandbox install ($now)" -Encoding UTF8
  git add -- $tmpNote 2>&1 | Out-Null
  git -c user.name='vmhost-runner' -c user.email='vmhost@localhost' `
      commit -m "vmhost: directive 008 sandbox install initiated, rebooting" 2>&1 | Out-Null
  git push origin "HEAD:$Branch" 2>&1 | Out-Null
  Start-Sleep -Seconds 10
  shutdown.exe /r /t 0 /c "Directive 008: enabling Windows Sandbox"
  exit 0
}

if ($result008 -and -not $result008.RestartNeeded) {
  # Enabled without reboot needed
  Push-Result @"
# VMHOST-RESULT-008 - Windows Sandbox READY (no reboot needed)

Machine: $env:COMPUTERNAME  Edition: $edition  Build: $build
Feature enabled successfully with no reboot required.

Dev side: post DIRECTIVE-009 with the fixed MSI release tag.
"@
  Write-Host "Sandbox enabled without reboot. Result pushed."
  exit 0
}

# If we get here, enable failed
Push-Result @"
# VMHOST-RESULT-008 - Windows Sandbox enable FAILED

Machine: $env:COMPUTERNAME  Edition: $edition  Build: $build
Feature state before attempt: $featureState
Enable result: $(if ($result008) { $result008 | Out-String } else { 'null - enable call returned nothing' })

Dev side: investigate. May need elevation or may be blocked by policy.
"@
Write-Host "Sandbox enable failed. Result pushed."
