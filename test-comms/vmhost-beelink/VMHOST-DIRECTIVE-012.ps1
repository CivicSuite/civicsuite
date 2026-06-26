# VMHOST-DIRECTIVE-012 - clean-machine MSI validation via Windows Sandbox, LIVE-STREAMED
# Fixes DIRECTIVE-011's FALSE FAIL: WindowsSandbox.exe is a thin launcher that exits within
# seconds, so relying on $proc.HasExited broke the wait loop mid-install. This version waits
# ONLY for the in-sandbox result file (or a 20-min deadline), gives the Sandbox 8 GB RAM for
# the 1.5 GB runtime install, and keeps streaming every step. Pure ASCII, PS5.1 only.
$ErrorActionPreference = 'Continue'
$Repo    = 'C:\dev\Codex\civicsuite'
$Branch  = 'stage-3a-baremetal-windows'
$VDir    = Join-Path $Repo 'test-comms\vmhost-beelink'
$Result  = Join-Path $VDir 'VMHOST-RESULT-012.md'
$Live    = Join-Path $VDir 'VMHOST-LIVE-012.md'
$TestDir = 'C:\CivicSuiteCleanTest012'
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

$script:logLines = New-Object System.Collections.ArrayList
function Stamp { (Get-Date).ToString('HH:mm:ss') }

function Push-Live {
  param([string]$line)
  if ($line) { [void]$script:logLines.Add("[$(Stamp)] $line"); Write-Host "[$(Stamp)] $line" }
  $header = @(
    "# VMHOST-LIVE-012 - clean-machine validation (LIVE)",
    "",
    "Machine: $env:COMPUTERNAME   Updated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')",
    "Refresh this file to watch the tester work step by step.",
    "",
    '```'
  )
  $body = $header + $script:logLines + @('```')
  Set-Location $Repo
  git fetch origin $Branch --force 2>&1 | Out-Null
  git checkout -f -B $Branch FETCH_HEAD 2>&1 | Out-Null
  Set-Content -Path $Live -Value ($body -join "`r`n") -Encoding UTF8
  git add -- $Live 2>&1 | Out-Null
  git -c user.name='vmhost-runner' -c user.email='vmhost@localhost' commit -m "vmhost: live 012 $(Stamp)" 2>&1 | Out-Null
  git push origin "HEAD:$Branch" 2>&1 | Out-Null
}

function Push-Result {
  param([string]$body)
  Set-Location $Repo
  git fetch origin $Branch --force 2>&1 | Out-Null
  git checkout -f -B $Branch FETCH_HEAD 2>&1 | Out-Null
  Set-Content -Path $Result -Value $body -Encoding UTF8
  git add -- $Result 2>&1 | Out-Null
  git -c user.name='vmhost-runner' -c user.email='vmhost@localhost' commit -m "vmhost: result 012 clean-machine validation" 2>&1 | Out-Null
  git push origin "HEAD:$Branch" 2>&1 | Out-Null
}

if (Test-Path $Result) {
  $existing = Get-Content $Result -Raw -ErrorAction SilentlyContinue
  if ($existing -match 'VERDICT|PASS|FAIL') { Write-Host "RESULT-012 already final."; exit 0 }
}

Push-Live "Directive 012 started (fixes the false FAIL from 011). Confirming Sandbox..."
$feature = Get-WindowsOptionalFeature -Online -FeatureName 'Containers-DisposableClientVM' -ErrorAction SilentlyContinue
if (-not $feature -or $feature.State -ne 'Enabled') {
  Push-Live "Windows Sandbox NOT enabled."
  Push-Result "# VMHOST-RESULT-012 - FAIL: Windows Sandbox not enabled."
  exit 1
}
Push-Live "Sandbox enabled. Checking CI build $RunId..."
$runJson = gh api "repos/$RepoSlug/actions/runs/$RunId" 2>&1
if ($LASTEXITCODE -ne 0) { Push-Live "Could not query CI run. Retry next tick."; exit 0 }
$run = $runJson | ConvertFrom-Json
if ($run.status -ne 'completed') { Push-Live "Build still running. Retry next tick."; exit 0 }
if ($run.conclusion -ne 'success') {
  Push-Result "# VMHOST-RESULT-012 - FAIL: MSI build $RunId conclusion $($run.conclusion)."
  exit 0
}
Push-Live "Build success. Preparing clean test dir..."
if (Test-Path $TestDir) { Remove-Item $TestDir -Recurse -Force -ErrorAction SilentlyContinue }
New-Item -ItemType Directory -Path $TestDir -Force | Out-Null

Push-Live "Downloading MSI via 'gh run download' (binary-safe)..."
$dlDir = Join-Path $TestDir 'artifact'
New-Item -ItemType Directory -Path $dlDir -Force | Out-Null
gh run download $RunId --repo $RepoSlug -n 'civicsuite-windows-local-msi' -D $dlDir 2>&1 | Out-Null
$msiFile = Get-ChildItem -Path $dlDir -Filter '*.msi' -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $msiFile) {
  Push-Live "gh run download yielded no MSI; trying authenticated zip fallback..."
  $artsJson = gh api "repos/$RepoSlug/actions/runs/$RunId/artifacts" 2>&1
  if ($LASTEXITCODE -eq 0) {
    $art = ($artsJson | ConvertFrom-Json).artifacts | Where-Object { $_.name -eq 'civicsuite-windows-local-msi' } | Select-Object -First 1
    if ($art) {
      $token = (gh auth token 2>&1).Trim()
      $zip = Join-Path $TestDir 'msi.zip'
      try {
        Invoke-WebRequest -Uri $art.archive_download_url -Headers @{ Authorization = "Bearer $token"; 'User-Agent' = 'vmhost-runner' } -OutFile $zip -ErrorAction Stop
        Expand-Archive -Path $zip -DestinationPath $dlDir -Force -ErrorAction SilentlyContinue
        $msiFile = Get-ChildItem -Path $dlDir -Filter '*.msi' -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
      } catch { Push-Live "Fallback error: $($_.Exception.Message)" }
    }
  }
}
if (-not $msiFile) {
  Push-Result "# VMHOST-RESULT-012 - FAIL: MSI artifact downloaded but no .msi inside."
  exit 0
}
$msiMB = [math]::Round($msiFile.Length / 1MB)
Push-Live "MSI ready: $($msiFile.Name) ($msiMB MB). Copying into Sandbox-mapped folder..."
Copy-Item -LiteralPath $msiFile.FullName -Destination $TestDir -Force

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
  P "INSTALL: msiexec /i /quiet starting (1.5 GB runtime - this takes a few minutes)..."
  $log = 'C:\install.log'
  $p = Start-Process msiexec.exe -ArgumentList @('/i', ('"' + $msi.FullName + '"'), '/quiet', '/norestart', '/l*v', ('"' + $log + '"')) -Wait -PassThru
  P ("INSTALL exit code: " + $p.ExitCode)
  if ($p.ExitCode -ne 0) {
    $pass = $false; P "INSTALL FAILED - last log lines:"
    if (Test-Path $log) { Get-Content $log -Tail 12 | ForEach-Object { P ("  LOG: " + $_) } }
  } else { P "INSTALL OK" }
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
  P "UNINSTALL: msiexec /x /quiet starting..."
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
Start-Sleep -Seconds 5
shutdown.exe /s /t 2
'@

$wsb = Join-Path $TestDir 'civicsuite-test.wsb'
Set-Content -Path $wsb -Encoding ASCII -Value ("<Configuration><MemoryInMB>8192</MemoryInMB><MappedFolders><MappedFolder><HostFolder>" + $TestDir + "</HostFolder><SandboxFolder>C:\Users\WDAGUtilityAccount\Desktop\civictest</SandboxFolder><ReadOnly>false</ReadOnly></MappedFolder></MappedFolders><LogonCommand><Command>powershell.exe -ExecutionPolicy Bypass -NonInteractive -WindowStyle Minimized -File C:\Users\WDAGUtilityAccount\Desktop\civictest\sandbox-test.ps1</Command></LogonCommand></Configuration>")

$progressPath = Join-Path $TestDir 'sandbox-progress.txt'
$resultPath   = Join-Path $TestDir 'sandbox-result.txt'
if (Test-Path $progressPath) { Remove-Item $progressPath -Force -ErrorAction SilentlyContinue }
if (Test-Path $resultPath)   { Remove-Item $resultPath -Force -ErrorAction SilentlyContinue }

Push-Live "Launching Windows Sandbox (8 GB RAM, fresh clean Windows). Install/verify/uninstall run automatically; each step streams below."
Start-Process -FilePath 'C:\Windows\System32\WindowsSandbox.exe' -ArgumentList $wsb -ErrorAction SilentlyContinue | Out-Null
Push-Live "Sandbox launched. Waiting for the in-Sandbox script to report (the launcher process exits immediately - that is normal; we wait for the result file)..."

# --- relay loop: ONLY break on result file or deadline. Never trust launcher exit. ---
$start = Get-Date
$deadline = $start.AddMinutes(20)
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
    $elapsed = [int]((Get-Date) - $start).TotalSeconds
    Push-Live "...still working inside Sandbox (elapsed ${elapsed}s; installing 1.5 GB runtime)"
    $lastBeat = Get-Date
  }
  if (Test-Path $resultPath) { Start-Sleep -Seconds 3; $sandboxResult = (Get-Content $resultPath -Raw -ErrorAction SilentlyContinue).Trim(); break }
}

if (-not $sandboxResult) {
  Push-Live "No verdict within 20 min. Reporting FAIL with the transcript so far for diagnosis."
  $sandboxResult = 'FAIL (no verdict within 20 min)'
}

$fullProgress = ''
if (Test-Path $progressPath) { $fullProgress = (Get-Content $progressPath -Raw -ErrorAction SilentlyContinue) }
$verdict = if ($sandboxResult -match '^PASS') { 'PASS' } else { 'FAIL' }
Push-Live "Sandbox finished. Verdict: $verdict. Writing final RESULT-012."

Push-Result @"
# VMHOST-RESULT-012 - QA-B1 Clean-Machine Sandbox Validation: $verdict

Machine: $env:COMPUTERNAME   Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
MSI from CI run: $RunId
MSI file: $($msiFile.Name)  ($msiMB MB)
Method: Windows Sandbox (8 GB RAM, fresh disposable Windows, no prior CivicSuite install)

## Step-by-step transcript (from inside the Sandbox)
``````
$fullProgress
``````

Live narrative: VMHOST-LIVE-012.md
"@

Push-Live "DONE. Verdict: $verdict"
