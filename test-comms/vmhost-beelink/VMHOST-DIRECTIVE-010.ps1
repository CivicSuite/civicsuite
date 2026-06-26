# VMHOST-DIRECTIVE-010 - poll for MSI build + run clean-machine Sandbox test
# Polls GitHub CI run 28253830442 every runner tick (every 2 min via Task Scheduler).
# When the build completes: downloads MSI, runs Windows Sandbox install/verify/uninstall,
# pushes result. If build not done: exits WITHOUT pushing RESULT-010.md so the runner
# retries on the next tick. Pure ASCII, PS5.1 only.
$ErrorActionPreference = 'Continue'
$Repo   = 'C:\dev\Codex\civicsuite'
$Branch = 'stage-3a-baremetal-windows'
$VDir   = Join-Path $Repo 'test-comms\vmhost-beelink'
$Result = Join-Path $VDir 'VMHOST-RESULT-010.md'
$TestDir = 'C:\CivicSuiteCleanTest010'
$MsiRunId = '28253830442'

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
      commit -m "vmhost: result 010 clean-machine Sandbox validation" 2>&1 | Out-Null
  git push origin "HEAD:$Branch" 2>&1 | Out-Null
}

# --- idempotent: already completed ---
if (Test-Path $Result) {
  $existing = Get-Content $Result -Raw -ErrorAction SilentlyContinue
  if ($existing -match 'PASS|FAIL') {
    Write-Host "RESULT-010 already has a verdict. Done."
    exit 0
  }
}

# --- check if CI run is complete ---
Write-Host "Checking CI run $MsiRunId..."
$runJson = gh api "repos/CivicSuite/civicsuite/actions/runs/$MsiRunId" 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Host "Could not query CI run. Will retry next tick."
  exit 0
}
$run = $runJson | ConvertFrom-Json
$runStatus     = $run.status
$runConclusion = $run.conclusion

Write-Host "Run $MsiRunId status=$runStatus conclusion=$runConclusion"

if ($runStatus -ne 'completed') {
  Write-Host "Build still running. Exiting without result so runner retries in 2 min."
  exit 0
}

if ($runConclusion -ne 'success') {
  Push-Result @"
# VMHOST-RESULT-010 - FAIL: MSI CI build failed

Run $MsiRunId completed with conclusion: $runConclusion
Cannot run clean-machine test without a valid MSI.
Dev side: investigate CI run and provide a working MSI build.
"@
  Write-Host "Build failed. Pushed failure result."
  exit 0
}

# --- build succeeded: find and download the MSI artifact ---
Write-Host "Build succeeded. Looking for civicsuite-windows-local-msi artifact..."
$artsJson = gh api "repos/CivicSuite/civicsuite/actions/runs/$MsiRunId/artifacts" 2>&1
if ($LASTEXITCODE -ne 0) {
  Push-Result "# VMHOST-RESULT-010 - FAIL: Could not list artifacts for run $MsiRunId"
  exit 0
}
$arts    = $artsJson | ConvertFrom-Json
$msiArt  = $arts.artifacts | Where-Object { $_.name -eq 'civicsuite-windows-local-msi' } | Select-Object -First 1
if (-not $msiArt) {
  Push-Result "# VMHOST-RESULT-010 - FAIL: civicsuite-windows-local-msi artifact not found on run $MsiRunId"
  exit 0
}

if (-not (Test-Path $TestDir)) {
  New-Item -ItemType Directory -Path $TestDir -Force | Out-Null
}

Write-Host "Downloading artifact $($msiArt.id)..."
$zipPath = Join-Path $TestDir 'civicsuite-msi.zip'
gh api "repos/CivicSuite/civicsuite/actions/artifacts/$($msiArt.id)/zip" > $zipPath 2>&1
if ($LASTEXITCODE -ne 0 -or -not (Test-Path $zipPath) -or (Get-Item $zipPath).Length -lt 10000) {
  Push-Result "# VMHOST-RESULT-010 - FAIL: Could not download MSI artifact (id=$($msiArt.id))"
  exit 0
}

$extractPath = Join-Path $TestDir 'msi-artifact'
Expand-Archive -Path $zipPath -DestinationPath $extractPath -Force -ErrorAction SilentlyContinue
$msiFile = Get-ChildItem -Path $extractPath -Filter '*.msi' -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $msiFile) {
  Push-Result "# VMHOST-RESULT-010 - FAIL: No .msi file found after extracting artifact"
  exit 0
}

$msiPath = $msiFile.FullName
Write-Host "MSI ready: $msiPath ($([math]::Round($msiFile.Length / 1MB)) MB)"

# --- write in-sandbox test script ---
$sandboxScript = Join-Path $TestDir 'sandbox-test.ps1'
Set-Content -Path $sandboxScript -Value @'
$ErrorActionPreference = 'Continue'
$out   = @()
$pass  = $true
function Log { param($s) $script:out += $s; Write-Host $s }
Log "=== CivicSuite Clean-Machine Sandbox Test ==="
Log "Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Log ""

$civicDir = 'C:\Users\WDAGUtilityAccount\Desktop\civictest'
$msi = Get-ChildItem $civicDir -Filter '*.msi' -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $msi) { Log "FAIL: MSI not in mapped folder"; $pass = $false } else {
  Log "MSI: $($msi.FullName) ($([math]::Round($msi.Length/1MB)) MB)"
}

Log ""
Log "--- INSTALL ---"
if ($msi) {
  $log = 'C:\install.log'
  $p   = Start-Process msiexec.exe -ArgumentList @('/i',"`"$($msi.FullName)`"",' /quiet','/norestart','/l*v',"`"$log`"") -Wait -PassThru
  Log "msiexec install exit: $($p.ExitCode)"
  if ($p.ExitCode -ne 0) {
    $pass = $false; Log "FAIL: install exit $($p.ExitCode)"
    if (Test-Path $log) { Get-Content $log -Tail 30 | ForEach-Object { Log $_ } }
  } else { Log "PASS: installed" }
}

Log ""
Log "--- VERIFY ARP ---"
$arp = @("HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*","HKLM:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*")
$entry = Get-ItemProperty -Path $arp -ErrorAction SilentlyContinue | Where-Object { $_.DisplayName -like '*CivicSuite*' } | Select-Object -First 1
if (-not $entry) { Log "FAIL: no ARP entry"; $pass = $false } else { Log "PASS: $($entry.DisplayName) $($entry.DisplayVersion)" }

Log ""
Log "--- VERIFY BINARY ---"
$dir = if ($entry -and $entry.InstallLocation) { $entry.InstallLocation } else { "" }
if ((-not $dir) -and $entry -and $entry.DisplayIcon) { $dir = Split-Path -Parent (($entry.DisplayIcon -split ',')[0].Trim('"')) }
if (-not $dir) { $dir = "$env:ProgramFiles\CivicSuite" }
$exe = Get-ChildItem -LiteralPath $dir -Filter '*.exe' -ErrorAction SilentlyContinue | Where-Object { $_.Name -notlike 'unins*' } | Select-Object -First 1
if (-not $exe) { Log "FAIL: no exe under $dir"; $pass = $false } else { Log "PASS: $($exe.FullName) ($([math]::Round($exe.Length/1KB)) KB)" }

Log ""
Log "--- UNINSTALL ---"
if ($msi) {
  $p2 = Start-Process msiexec.exe -ArgumentList @('/x',"`"$($msi.FullName)`"",' /quiet','/norestart') -Wait -PassThru
  Log "msiexec uninstall exit: $($p2.ExitCode)"
  if ($p2.ExitCode -ne 0) { $pass = $false; Log "FAIL: uninstall exit $($p2.ExitCode)" } else {
    Log "PASS: uninstalled"
    $gone = Get-ItemProperty -Path $arp -ErrorAction SilentlyContinue | Where-Object { $_.DisplayName -like '*CivicSuite*' } | Select-Object -First 1
    if ($gone) { Log "WARN: ARP entry still present" } else { Log "PASS: ARP entry removed" }
  }
}

Log ""
$verdict = if ($pass) { "PASS" } else { "FAIL" }
Log "=== VERDICT: $verdict ==="
$out | Set-Content "$civicDir\sandbox-result.txt" -Encoding UTF8
shutdown.exe /s /t 5
'@ -Encoding UTF8

# --- write .wsb file ---
$wsbPath = Join-Path $TestDir 'civicsuite-test.wsb'
Set-Content -Path $wsbPath -Value "<Configuration><MappedFolders><MappedFolder><HostFolder>$TestDir</HostFolder><SandboxFolder>C:\Users\WDAGUtilityAccount\Desktop\civictest</SandboxFolder><ReadOnly>false</ReadOnly></MappedFolder></MappedFolders><LogonCommand><Command>powershell.exe -ExecutionPolicy Bypass -NonInteractive -WindowStyle Minimized -File C:\Users\WDAGUtilityAccount\Desktop\civictest\sandbox-test.ps1</Command></LogonCommand></Configuration>" -Encoding UTF8

# Copy MSI into TestDir so sandbox can reach it via mapped folder
Copy-Item -LiteralPath $msiPath -Destination $TestDir -Force -ErrorAction SilentlyContinue

# --- remove stale result file from prior attempt ---
$sandboxResultPath = Join-Path $TestDir 'sandbox-result.txt'
if (Test-Path $sandboxResultPath) { Remove-Item $sandboxResultPath -Force -ErrorAction SilentlyContinue }

# --- launch sandbox ---
Write-Host "Launching Windows Sandbox..."
$wsbProc = Start-Process -FilePath 'C:\Windows\System32\WindowsSandbox.exe' -ArgumentList $wsbPath -PassThru -ErrorAction SilentlyContinue
if (-not $wsbProc) {
  Push-Result "# VMHOST-RESULT-010 - FAIL: WindowsSandbox.exe did not launch"
  exit 1
}

Write-Host "Sandbox PID $($wsbProc.Id). Waiting up to 12 minutes..."
$deadline = (Get-Date).AddMinutes(12)
$sandboxResult = $null

while ((Get-Date) -lt $deadline) {
  if (Test-Path $sandboxResultPath) {
    $sandboxResult = Get-Content $sandboxResultPath -Raw -ErrorAction SilentlyContinue
    break
  }
  if ($wsbProc.HasExited) {
    Start-Sleep -Seconds 5
    if (Test-Path $sandboxResultPath) {
      $sandboxResult = Get-Content $sandboxResultPath -Raw -ErrorAction SilentlyContinue
    }
    break
  }
  Start-Sleep -Seconds 15
}

if (-not $sandboxResult) {
  $sandboxResult = "Timed out waiting for sandbox result after 12 minutes."
}

$verdict = if ($sandboxResult -match 'VERDICT: PASS') { 'PASS' } else { 'FAIL' }

Push-Result @"
# VMHOST-RESULT-010 - QA-B1 Clean-Machine Sandbox Validation: $verdict

Machine: $env:COMPUTERNAME  Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
MSI from CI run: $MsiRunId
MSI file: $(Split-Path $msiPath -Leaf)  ($([math]::Round($msiFile.Length/1MB)) MB)

## Sandbox test output
$sandboxResult
"@

Write-Host "DIRECTIVE-010 complete. Verdict: $verdict"
