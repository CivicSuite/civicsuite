# VMHOST-DIRECTIVE-011 - clean-machine MSI validation via Windows Sandbox, LIVE-STREAMED
# Fixes DIRECTIVE-010's download bug (gh api zip > file corrupts binary in PowerShell).
# Uses gh run download. Streams a live narrative to VMHOST-LIVE-011.md at every step,
# including steps happening INSIDE the Sandbox, so the dev side can watch it work in
# real time by refreshing the channel. Pure ASCII, PS5.1 only.
$ErrorActionPreference = 'Continue'
$Repo    = 'C:\dev\Codex\civicsuite'
$Branch  = 'stage-3a-baremetal-windows'
$VDir    = Join-Path $Repo 'test-comms\vmhost-beelink'
$Result  = Join-Path $VDir 'VMHOST-RESULT-011.md'
$Live    = Join-Path $VDir 'VMHOST-LIVE-011.md'
$TestDir = 'C:\CivicSuiteCleanTest011'
$RunId   = '28253830442'
$RepoSlug = 'CivicSuite/civicsuite'

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  foreach ($p in @("$env:ProgramFiles\Git\cmd","$env:ProgramFiles\Git\bin","$env:LOCALAPPDATA\Programs\Git\cmd")) {
    if (Test-Path (Join-Path $p 'git.exe')) { $env:PATH = "$p;$env:PATH"; break }
  }
}

Set-Location $Repo
git fetch origin $Branch --force 2>&1 | Out-Null
git checkout -f -B $Branch FETCH_HEAD 2>&1 | Out-Null

# --- live log: accumulate lines, push the FULL narrative on every update ---
$script:logLines = New-Object System.Collections.ArrayList

function Stamp { (Get-Date).ToString('HH:mm:ss') }

function Push-Live {
  param([string]$line, [switch]$NoCommit)
  if ($line) { [void]$script:logLines.Add("[$(Stamp)] $line"); Write-Host "[$(Stamp)] $line" }
  if ($NoCommit) { return }
  $header = @(
    "# VMHOST-LIVE-011 - clean-machine validation (LIVE)",
    "",
    "Machine: $env:COMPUTERNAME   Updated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')",
    "Refresh this file to watch the tester work step by step.",
    "",
    '```'
  )
  $body = $header + $script:logLines + @('```')
  # re-sync to branch tip so our many small commits stay linear
  Set-Location $Repo
  git fetch origin $Branch --force 2>&1 | Out-Null
  git checkout -f -B $Branch FETCH_HEAD 2>&1 | Out-Null
  Set-Content -Path $Live -Value ($body -join "`r`n") -Encoding UTF8
  git add -- $Live 2>&1 | Out-Null
  git -c user.name='vmhost-runner' -c user.email='vmhost@localhost' commit -m "vmhost: live 011 $(Stamp)" 2>&1 | Out-Null
  git push origin "HEAD:$Branch" 2>&1 | Out-Null
}

function Push-Result {
  param([string]$body)
  Set-Location $Repo
  git fetch origin $Branch --force 2>&1 | Out-Null
  git checkout -f -B $Branch FETCH_HEAD 2>&1 | Out-Null
  Set-Content -Path $Result -Value $body -Encoding UTF8
  git add -- $Result 2>&1 | Out-Null
  git -c user.name='vmhost-runner' -c user.email='vmhost@localhost' commit -m "vmhost: result 011 clean-machine validation" 2>&1 | Out-Null
  git push origin "HEAD:$Branch" 2>&1 | Out-Null
}

# --- idempotent guard ---
if (Test-Path $Result) {
  $existing = Get-Content $Result -Raw -ErrorAction SilentlyContinue
  if ($existing -match 'VERDICT|PASS|FAIL') { Write-Host "RESULT-011 already final."; exit 0 }
}

Push-Live "Directive 011 started. Confirming Windows Sandbox is enabled..."
$feature = Get-WindowsOptionalFeature -Online -FeatureName 'Containers-DisposableClientVM' -ErrorAction SilentlyContinue
if (-not $feature -or $feature.State -ne 'Enabled') {
  Push-Live "Windows Sandbox NOT enabled. Cannot continue."
  Push-Result "# VMHOST-RESULT-011 - FAIL: Windows Sandbox not enabled."
  exit 1
}
Push-Live "Windows Sandbox enabled. Checking CI build $RunId..."

# --- confirm the MSI build succeeded ---
$runJson = gh api "repos/$RepoSlug/actions/runs/$RunId" 2>&1
if ($LASTEXITCODE -ne 0) { Push-Live "Could not query CI run $RunId. Will retry next tick."; exit 0 }
$run = $runJson | ConvertFrom-Json
if ($run.status -ne 'completed') { Push-Live "Build still running (status=$($run.status)). Exiting; runner retries in 2 min."; exit 0 }
if ($run.conclusion -ne 'success') {
  Push-Live "Build conclusion=$($run.conclusion). Cannot test."
  Push-Result "# VMHOST-RESULT-011 - FAIL: MSI build $RunId conclusion $($run.conclusion)."
  exit 0
}
Push-Live "Build $RunId is success. Preparing clean test dir..."

if (Test-Path $TestDir) { Remove-Item $TestDir -Recurse -Force -ErrorAction SilentlyContinue }
New-Item -ItemType Directory -Path $TestDir -Force | Out-Null

# --- download the MSI artifact the RIGHT way (gh run download handles binary) ---
Push-Live "Downloading MSI artifact via 'gh run download' (binary-safe)..."
$dlDir = Join-Path $TestDir 'artifact'
New-Item -ItemType Directory -Path $dlDir -Force | Out-Null
gh run download $RunId --repo $RepoSlug -n 'civicsuite-windows-local-msi' -D $dlDir 2>&1 | Out-Null
$msiFile = Get-ChildItem -Path $dlDir -Filter '*.msi' -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1

if (-not $msiFile) {
  # fallback: direct authenticated download of the artifact zip via Invoke-WebRequest
  Push-Live "gh run download yielded no MSI; trying authenticated zip download fallback..."
  $artsJson = gh api "repos/$RepoSlug/actions/runs/$RunId/artifacts" 2>&1
  if ($LASTEXITCODE -eq 0) {
    $arts = $artsJson | ConvertFrom-Json
    $art  = $arts.artifacts | Where-Object { $_.name -eq 'civicsuite-windows-local-msi' } | Select-Object -First 1
    if ($art) {
      $token = (gh auth token 2>&1).Trim()
      $zip = Join-Path $TestDir 'msi.zip'
      try {
        Invoke-WebRequest -Uri $art.archive_download_url -Headers @{ Authorization = "Bearer $token"; 'User-Agent' = 'vmhost-runner' } -OutFile $zip -ErrorAction Stop
        Expand-Archive -Path $zip -DestinationPath $dlDir -Force -ErrorAction SilentlyContinue
        $msiFile = Get-ChildItem -Path $dlDir -Filter '*.msi' -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
      } catch { Push-Live "Fallback download error: $($_.Exception.Message)" }
    }
  }
}

if (-not $msiFile) {
  Push-Live "Still no MSI after download. Listing what we got:"
  $got = Get-ChildItem -Path $dlDir -Recurse -ErrorAction SilentlyContinue | ForEach-Object { $_.Name }
  Push-Live ("artifact contents: " + (($got -join ', ')))
  Push-Result "# VMHOST-RESULT-011 - FAIL: MSI artifact downloaded but no .msi inside."
  exit 0
}

$msiMB = [math]::Round($msiFile.Length / 1MB)
Push-Live "MSI ready: $($msiFile.Name) ($msiMB MB). Copying into Sandbox-mapped folder..."
Copy-Item -LiteralPath $msiFile.FullName -Destination $TestDir -Force

# --- in-sandbox test script: writes a live progress file the host relays ---
$sandboxScript = Join-Path $TestDir 'sandbox-test.ps1'
Set-Content -Path $sandboxScript -Encoding ASCII -Value @'
$ErrorActionPreference = 'Continue'
$dir = 'C:\Users\WDAGUtilityAccount\Desktop\civictest'
$prog = Join-Path $dir 'sandbox-progress.txt'
$pass = $true
function P { param($s) $line = "[" + (Get-Date -Format 'HH:mm:ss') + "] " + $s; Add-Content -Path $prog -Value $line -Encoding ASCII; Write-Host $line }
Set-Content -Path $prog -Value "" -Encoding ASCII
P "Sandbox booted. Locating MSI..."
$msi = Get-ChildItem $dir -Filter '*.msi' -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $msi) { P "FAIL: no MSI in mapped folder"; $pass = $false }
else { P ("MSI: " + $msi.Name + " (" + [math]::Round($msi.Length/1MB) + " MB)") }
if ($msi) {
  P "INSTALL: launching msiexec /i /quiet ..."
  $log = 'C:\install.log'
  $p = Start-Process msiexec.exe -ArgumentList @('/i', ('"' + $msi.FullName + '"'), '/quiet', '/norestart', '/l*v', ('"' + $log + '"')) -Wait -PassThru
  P ("INSTALL exit code: " + $p.ExitCode)
  if ($p.ExitCode -ne 0) { $pass = $false; P "INSTALL FAILED" } else { P "INSTALL OK" }
}
P "VERIFY: looking for ARP/uninstall entry..."
$arp = @('HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*','HKLM:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*')
$entry = Get-ItemProperty -Path $arp -ErrorAction SilentlyContinue | Where-Object { $_.DisplayName -like '*CivicSuite*' } | Select-Object -First 1
if ($entry) { P ("ARP entry: " + $entry.DisplayName + " " + $entry.DisplayVersion) } else { P "FAIL: no ARP entry"; $pass = $false }
$installDir = $null
if ($entry) { $installDir = $entry.InstallLocation; if (-not $installDir -and $entry.DisplayIcon) { $installDir = Split-Path -Parent (($entry.DisplayIcon -split ',')[0].Trim('"')) } }
if (-not $installDir) { $installDir = "$env:ProgramFiles\CivicSuite" }
$exe = Get-ChildItem -LiteralPath $installDir -Filter '*.exe' -ErrorAction SilentlyContinue | Where-Object { $_.Name -notlike 'unins*' } | Select-Object -First 1
if ($exe) { P ("BINARY: " + $exe.FullName + " (" + [math]::Round($exe.Length/1KB) + " KB)") } else { P "FAIL: no exe under install dir"; $pass = $false }
if ($msi) {
  P "UNINSTALL: launching msiexec /x /quiet ..."
  $p2 = Start-Process msiexec.exe -ArgumentList @('/x', ('"' + $msi.FullName + '"'), '/quiet', '/norestart') -Wait -PassThru
  P ("UNINSTALL exit code: " + $p2.ExitCode)
  if ($p2.ExitCode -ne 0) { $pass = $false; P "UNINSTALL FAILED" }
  else {
    $gone = Get-ItemProperty -Path $arp -ErrorAction SilentlyContinue | Where-Object { $_.DisplayName -like '*CivicSuite*' } | Select-Object -First 1
    if ($gone) { P "WARN: ARP entry still present after uninstall" } else { P "UNINSTALL OK: ARP entry removed" }
  }
}
$verdict = if ($pass) { 'PASS' } else { 'FAIL' }
P ("VERDICT: " + $verdict)
Set-Content -Path (Join-Path $dir 'sandbox-result.txt') -Value $verdict -Encoding ASCII
Start-Sleep -Seconds 3
shutdown.exe /s /t 2
'@

# --- .wsb config ---
$wsb = Join-Path $TestDir 'civicsuite-test.wsb'
Set-Content -Path $wsb -Encoding ASCII -Value ("<Configuration><MappedFolders><MappedFolder><HostFolder>" + $TestDir + "</HostFolder><SandboxFolder>C:\Users\WDAGUtilityAccount\Desktop\civictest</SandboxFolder><ReadOnly>false</ReadOnly></MappedFolder></MappedFolders><LogonCommand><Command>powershell.exe -ExecutionPolicy Bypass -NonInteractive -WindowStyle Minimized -File C:\Users\WDAGUtilityAccount\Desktop\civictest\sandbox-test.ps1</Command></LogonCommand></Configuration>")

$progressPath = Join-Path $TestDir 'sandbox-progress.txt'
$resultPath   = Join-Path $TestDir 'sandbox-result.txt'
if (Test-Path $progressPath) { Remove-Item $progressPath -Force -ErrorAction SilentlyContinue }
if (Test-Path $resultPath)   { Remove-Item $resultPath -Force -ErrorAction SilentlyContinue }

Push-Live "Launching Windows Sandbox (fresh clean Windows). The Sandbox runs install/verify/uninstall automatically and reports each step below."
$proc = Start-Process -FilePath 'C:\Windows\System32\WindowsSandbox.exe' -ArgumentList $wsb -PassThru -ErrorAction SilentlyContinue
if (-not $proc) {
  Push-Live "FAIL: WindowsSandbox.exe did not launch."
  Push-Result "# VMHOST-RESULT-011 - FAIL: WindowsSandbox.exe did not launch."
  exit 1
}
Push-Live "Sandbox launched (PID $($proc.Id)). Streaming in-Sandbox progress every ~20s..."

# --- relay loop: mirror the sandbox progress file into the live log ---
$deadline = (Get-Date).AddMinutes(14)
$lastCount = 0
$lastBeat = Get-Date
$sandboxResult = $null
while ((Get-Date) -lt $deadline) {
  Start-Sleep -Seconds 18
  $newLines = @()
  if (Test-Path $progressPath) {
    $allLines = Get-Content $progressPath -ErrorAction SilentlyContinue | Where-Object { $_ -ne '' }
    if ($allLines.Count -gt $lastCount) {
      $newLines = $allLines[$lastCount..($allLines.Count-1)]
      $lastCount = $allLines.Count
    }
  }
  if ($newLines.Count -gt 0) {
    foreach ($nl in $newLines) { [void]$script:logLines.Add("    SANDBOX> $nl") }
    Push-Live $null
    $lastBeat = Get-Date
  } elseif (((Get-Date) - $lastBeat).TotalSeconds -ge 60) {
    Push-Live "...still running inside Sandbox (elapsed $([int]((Get-Date)-$proc.StartTime).TotalSeconds)s)"
    $lastBeat = Get-Date
  }
  if (Test-Path $resultPath) { Start-Sleep -Seconds 3; $sandboxResult = (Get-Content $resultPath -Raw -ErrorAction SilentlyContinue).Trim(); break }
  if ($proc.HasExited -and -not (Test-Path $resultPath)) { Start-Sleep -Seconds 5; if (Test-Path $resultPath) { $sandboxResult = (Get-Content $resultPath -Raw).Trim() }; break }
}

if (-not $sandboxResult) {
  Push-Live "No verdict file after timeout/exit. Treating as FAIL."
  $sandboxResult = 'FAIL (no verdict / timeout)'
}

$fullProgress = ''
if (Test-Path $progressPath) { $fullProgress = (Get-Content $progressPath -Raw -ErrorAction SilentlyContinue) }
$verdict = if ($sandboxResult -match '^PASS') { 'PASS' } else { 'FAIL' }

Push-Live "Sandbox finished. Verdict: $verdict. Writing final RESULT-011."

Push-Result @"
# VMHOST-RESULT-011 - QA-B1 Clean-Machine Sandbox Validation: $verdict

Machine: $env:COMPUTERNAME   Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
MSI from CI run: $RunId
MSI file: $($msiFile.Name)  ($msiMB MB)
Method: Windows Sandbox (fresh disposable Windows, no prior CivicSuite install)

## Step-by-step transcript (from inside the Sandbox)
``````
$fullProgress
``````

Live narrative is in VMHOST-LIVE-011.md.
"@

Push-Live "DONE. Verdict: $verdict"
