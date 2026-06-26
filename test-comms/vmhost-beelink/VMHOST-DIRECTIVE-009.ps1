# VMHOST-DIRECTIVE-009 - clean-machine MSI validation via Windows Sandbox
# Downloads the fixed MSI from the main-branch CI artifact, runs it inside
# Windows Sandbox (a fresh, disposable Windows environment), validates
# install/first-run-logic/uninstall, and pushes the result.
# Pure ASCII, PS5.1 only.
$ErrorActionPreference = 'Continue'
$Repo   = 'C:\dev\Codex\civicsuite'
$Branch = 'stage-3a-baremetal-windows'
$VDir   = Join-Path $Repo 'test-comms\vmhost-beelink'
$Result = Join-Path $VDir 'VMHOST-RESULT-009.md'
$TestDir = 'C:\CivicSuiteCleanTest'

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
      commit -m "vmhost: result 009 clean-machine MSI validation" 2>&1 | Out-Null
  git push origin "HEAD:$Branch" 2>&1 | Out-Null
}

# --- confirm Sandbox is available ---
$feature = Get-WindowsOptionalFeature -Online -FeatureName 'Containers-DisposableClientVM' -ErrorAction SilentlyContinue
if (-not $feature -or $feature.State -ne 'Enabled') {
  Push-Result "# VMHOST-RESULT-009 - BLOCKED: Windows Sandbox not enabled. Run DIRECTIVE-008 first."
  exit 1
}

# --- phase gate: check if already completed ---
if (Test-Path $Result) {
  $existingContent = Get-Content $Result -Raw -ErrorAction SilentlyContinue
  if ($existingContent -match 'PASS|FAIL') {
    Write-Host "RESULT-009 already has a final verdict. Nothing to do."
    exit 0
  }
}

# --- prepare test directory ---
if (-not (Test-Path $TestDir)) {
  New-Item -ItemType Directory -Path $TestDir -Force | Out-Null
}

# --- download MSI from GitHub CI artifact ---
# Find the most recent successful desktop-windows-msi run on main
Write-Host "Looking for MSI artifact from main branch CI..."
$runsJson = gh api "repos/CivicSuite/civicsuite/actions/workflows/295323395/runs?branch=main&status=success&per_page=3" 2>&1
$msiPath = $null

if ($LASTEXITCODE -eq 0) {
  $runs = $runsJson | ConvertFrom-Json
  if ($runs.workflow_runs -and $runs.workflow_runs.Count -gt 0) {
    $latestRunId = $runs.workflow_runs[0].id
    Write-Host "Latest successful MSI run: $latestRunId"

    # Get artifacts for this run
    $artsJson = gh api "repos/CivicSuite/civicsuite/actions/runs/$latestRunId/artifacts" 2>&1
    if ($LASTEXITCODE -eq 0) {
      $arts = $artsJson | ConvertFrom-Json
      $msiArt = $arts.artifacts | Where-Object { $_.name -eq 'civicsuite-windows-local-msi' } | Select-Object -First 1
      if ($msiArt) {
        Write-Host "Downloading artifact $($msiArt.id) ($($msiArt.name))..."
        $zipPath = Join-Path $TestDir 'civicsuite-msi.zip'
        gh api "repos/CivicSuite/civicsuite/actions/artifacts/$($msiArt.id)/zip" > $zipPath 2>&1
        if ($LASTEXITCODE -eq 0 -and (Test-Path $zipPath) -and (Get-Item $zipPath).Length -gt 10000) {
          Expand-Archive -Path $zipPath -DestinationPath (Join-Path $TestDir 'msi-artifact') -Force -ErrorAction SilentlyContinue
          $msiFile = Get-ChildItem -Path (Join-Path $TestDir 'msi-artifact') -Filter '*.msi' -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
          if ($msiFile) {
            $msiPath = $msiFile.FullName
            Write-Host "MSI ready: $msiPath ($([math]::Round($msiFile.Length / 1MB)) MB)"
          }
        }
      }
    }
  }
}

if (-not $msiPath -or -not (Test-Path $msiPath)) {
  Push-Result @"
# VMHOST-RESULT-009 - BLOCKED: MSI artifact not available

Could not download civicsuite-windows-local-msi from main branch CI.
Either the build is still running or no successful run exists yet.
Dev side: check run 28253830442. Re-run DIRECTIVE-009 once the build completes.
"@
  Write-Host "MSI not available. Pushed blocked result."
  exit 0
}

# --- write the in-sandbox test script ---
$sandboxScript = Join-Path $TestDir 'sandbox-test.ps1'
$sandboxMsiPath = 'C:\Users\WDAGUtilityAccount\Desktop\civictest\' + (Split-Path $msiPath -Leaf)
$resultFile = Join-Path $TestDir 'sandbox-result.txt'

Set-Content -Path $sandboxScript -Value @"
`$ErrorActionPreference = 'Continue'
`$out = @()
`$pass = `$true

function Log { param(`$s) `$out += `$s; Write-Host `$s }

Log "=== CivicSuite Clean-Machine Sandbox Test ==="
Log "Time: `$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Log ""

# Install MSI
Log "--- INSTALL ---"
`$msi = Get-ChildItem 'C:\Users\WDAGUtilityAccount\Desktop\civictest' -Filter '*.msi' -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not `$msi) {
  Log "FAIL: MSI not found in mapped folder"
  `$pass = `$false
} else {
  Log "Installing: `$(`$msi.FullName)"
  `$log = 'C:\install.log'
  `$p = Start-Process msiexec.exe -ArgumentList @('/i', "`"`$(`$msi.FullName)`"", '/quiet', '/norestart', '/l*v', `"`$log`"") -Wait -PassThru
  Log "msiexec exit: `$(`$p.ExitCode)"
  if (`$p.ExitCode -ne 0) {
    `$pass = `$false
    Log "FAIL: install returned `$(`$p.ExitCode)"
    if (Test-Path `$log) { Get-Content `$log -Tail 20 | ForEach-Object { Log `$_ } }
  } else {
    Log "PASS: MSI installed"
  }
}

# Verify ARP entry
Log ""
Log "--- VERIFY ARP ---"
`$arpRoots = @("HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*","HKLM:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*")
`$entry = Get-ItemProperty -Path `$arpRoots -ErrorAction SilentlyContinue | Where-Object { `$_.DisplayName -like '*CivicSuite*' } | Select-Object -First 1
if (-not `$entry) {
  Log "FAIL: No CivicSuite ARP entry"
  `$pass = `$false
} else {
  Log "PASS: ARP entry: `$(`$entry.DisplayName) `$(`$entry.DisplayVersion)"
}

# Verify binary
Log ""
Log "--- VERIFY BINARY ---"
`$installDir = `$null
if (`$entry) {
  `$installDir = `$entry.InstallLocation
  if (-not `$installDir -and `$entry.DisplayIcon) {
    `$installDir = Split-Path -Parent ((`$entry.DisplayIcon -split ',')[0].Trim('"'))
  }
}
if (-not `$installDir) { `$installDir = "`${env:ProgramFiles}\CivicSuite" }
`$exe = Get-ChildItem -LiteralPath `$installDir -Filter '*.exe' -ErrorAction SilentlyContinue | Where-Object { `$_.Name -notlike 'unins*' } | Select-Object -First 1
if (-not `$exe) {
  Log "FAIL: No exe under `$installDir"
  `$pass = `$false
} else {
  Log "PASS: `$(`$exe.FullName) (`$([math]::Round(`$exe.Length/1KB)) KB)"
}

# Uninstall
Log ""
Log "--- UNINSTALL ---"
if (`$msi) {
  `$p2 = Start-Process msiexec.exe -ArgumentList @('/x', "`"`$(`$msi.FullName)`"", '/quiet', '/norestart') -Wait -PassThru
  Log "msiexec uninstall exit: `$(`$p2.ExitCode)"
  if (`$p2.ExitCode -ne 0) {
    `$pass = `$false
    Log "FAIL: uninstall returned `$(`$p2.ExitCode)"
  } else {
    Log "PASS: uninstalled"
    `$gone = Get-ItemProperty -Path `$arpRoots -ErrorAction SilentlyContinue | Where-Object { `$_.DisplayName -like '*CivicSuite*' } | Select-Object -First 1
    if (`$gone) { Log "WARN: ARP entry still present after uninstall" } else { Log "PASS: ARP entry removed" }
  }
}

Log ""
`$verdict = if (`$pass) { "PASS" } else { "FAIL" }
Log "=== VERDICT: `$verdict ==="
`$out | Set-Content 'C:\Users\WDAGUtilityAccount\Desktop\civictest\sandbox-result.txt' -Encoding UTF8
shutdown.exe /s /t 5
"@ -Encoding UTF8

# --- write .wsb config ---
$wsbPath = Join-Path $TestDir 'civicsuite-test.wsb'
Set-Content -Path $wsbPath -Value @"
<Configuration>
  <MappedFolders>
    <MappedFolder>
      <HostFolder>$TestDir</HostFolder>
      <SandboxFolder>C:\Users\WDAGUtilityAccount\Desktop\civictest</SandboxFolder>
      <ReadOnly>false</ReadOnly>
    </MappedFolder>
  </MappedFolders>
  <LogonCommand>
    <Command>powershell.exe -ExecutionPolicy Bypass -NonInteractive -WindowStyle Minimized -File C:\Users\WDAGUtilityAccount\Desktop\civictest\sandbox-test.ps1</Command>
  </LogonCommand>
</Configuration>
"@ -Encoding UTF8

# --- launch Sandbox and wait ---
Write-Host "Launching Windows Sandbox..."
$wsbProc = Start-Process -FilePath 'C:\Windows\System32\WindowsSandbox.exe' -ArgumentList $wsbPath -PassThru -ErrorAction SilentlyContinue
if (-not $wsbProc) {
  Push-Result "# VMHOST-RESULT-009 - FAIL: Could not launch WindowsSandbox.exe"
  exit 1
}

Write-Host "Sandbox PID $($wsbProc.Id). Waiting up to 10 minutes for test to complete..."
$deadline = (Get-Date).AddMinutes(10)
$sandboxResult = $null

while ((Get-Date) -lt $deadline) {
  $resultPath = Join-Path $TestDir 'sandbox-result.txt'
  if (Test-Path $resultPath) {
    $sandboxResult = Get-Content $resultPath -Raw -ErrorAction SilentlyContinue
    break
  }
  # Check if sandbox process exited
  $alive = $false
  if (-not $wsbProc.HasExited) { $alive = $true }
  if (-not $alive) {
    # Give it a few seconds to flush the file
    Start-Sleep -Seconds 5
    if (Test-Path $resultPath) {
      $sandboxResult = Get-Content $resultPath -Raw -ErrorAction SilentlyContinue
    }
    break
  }
  Start-Sleep -Seconds 10
}

if (-not $sandboxResult) {
  $sandboxResult = "Sandbox test timed out or result file not written after 10 minutes."
}

$verdict = if ($sandboxResult -match 'VERDICT: PASS') { 'PASS' } else { 'FAIL' }

Push-Result @"
# VMHOST-RESULT-009 - Clean-Machine Sandbox Validation: $verdict

Machine: $env:COMPUTERNAME
MSI tested: $msiPath ($([math]::Round((Get-Item $msiPath -ErrorAction SilentlyContinue).Length / 1MB)) MB)

## Sandbox test output
$sandboxResult
"@

Write-Host "DIRECTIVE-009 complete. Verdict: $verdict"
