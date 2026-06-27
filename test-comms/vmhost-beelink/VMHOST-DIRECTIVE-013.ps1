# VMHOST-DIRECTIVE-013 - clean-machine BOOT proof (Critical #1 + C3 single-instance), LIVE-STREAMED.
# Phase A only: install -> launch the real exe with WebView2 CDP -> prove the window RENDERS
# (CDP page target) -> stays alive >60s -> single-instance holds on 2nd launch -> screenshot.
# Wizard + 6.97GB model + real completion (Criticals #2/#3) are the heavier #014, after this proves boot.
# Pure ASCII, PS5.1 only. Reuses the 012 harness (gh run download; wait on result file, not launcher exit).
$ErrorActionPreference = 'Continue'
$Repo='C:\dev\Codex\civicsuite'; $Branch='stage-3a-baremetal-windows'
$VDir=Join-Path $Repo 'test-comms\vmhost-beelink'
$Result=Join-Path $VDir 'VMHOST-RESULT-013.md'; $Live=Join-Path $VDir 'VMHOST-LIVE-013.md'
$Shot=Join-Path $VDir 'VMHOST-RESULT-013-screenshot.png'
$TestDir='C:\CivicSuiteCleanTest013'; $RunId='28253830442'; $RepoSlug='CivicSuite/civicsuite'

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  foreach ($p in @("$env:ProgramFiles\Git\cmd","$env:ProgramFiles\Git\bin","$env:LOCALAPPDATA\Programs\Git\cmd")) {
    if (Test-Path (Join-Path $p 'git.exe')) { $env:PATH="$p;$env:PATH"; break } } }

Set-Location $Repo
git fetch origin $Branch --force 2>&1 | Out-Null
git checkout -f -B $Branch FETCH_HEAD 2>&1 | Out-Null

$script:logLines = New-Object System.Collections.ArrayList
function Stamp { (Get-Date).ToString('HH:mm:ss') }
function Push-Live { param([string]$line)
  if ($line) { [void]$script:logLines.Add("[$(Stamp)] $line"); Write-Host "[$(Stamp)] $line" }
  $hdr=@("# VMHOST-LIVE-013 - clean-machine BOOT proof (LIVE)","","Machine: $env:COMPUTERNAME   Updated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')","Refresh to watch.","",'```')
  $body=$hdr + $script:logLines + @('```')
  Set-Location $Repo
  git fetch origin $Branch --force 2>&1 | Out-Null
  git checkout -f -B $Branch FETCH_HEAD 2>&1 | Out-Null
  Set-Content -Path $Live -Value ($body -join "`r`n") -Encoding UTF8
  git add -- $Live 2>&1 | Out-Null
  git -c user.name='vmhost-runner' -c user.email='vmhost@localhost' commit -m "vmhost: live 013 $(Stamp)" 2>&1 | Out-Null
  git push origin "HEAD:$Branch" 2>&1 | Out-Null }
function Push-Result { param([string]$body,[string]$shotSrc)
  Set-Location $Repo
  git fetch origin $Branch --force 2>&1 | Out-Null
  git checkout -f -B $Branch FETCH_HEAD 2>&1 | Out-Null
  Set-Content -Path $Result -Value $body -Encoding UTF8
  git add -- $Result 2>&1 | Out-Null
  if ($shotSrc -and (Test-Path $shotSrc)) { Copy-Item $shotSrc $Shot -Force; git add -- $Shot 2>&1 | Out-Null }
  git -c user.name='vmhost-runner' -c user.email='vmhost@localhost' commit -m "vmhost: result 013 boot proof" 2>&1 | Out-Null
  git push origin "HEAD:$Branch" 2>&1 | Out-Null }

if (Test-Path $Result) { $e=Get-Content $Result -Raw -ErrorAction SilentlyContinue; if ($e -match 'VERDICT|PASS|FAIL') { Write-Host 'done'; exit 0 } }

Push-Live "Directive 013 started (BOOT proof: launch + render + single-instance). Checking Sandbox + build..."
$feat=Get-WindowsOptionalFeature -Online -FeatureName 'Containers-DisposableClientVM' -ErrorAction SilentlyContinue
if (-not $feat -or $feat.State -ne 'Enabled') { Push-Result "# VMHOST-RESULT-013 - FAIL: Sandbox not enabled."; exit 1 }
$run=(gh api "repos/$RepoSlug/actions/runs/$RunId" 2>&1 | ConvertFrom-Json)
if ($run.status -ne 'completed' -or $run.conclusion -ne 'success') { Push-Live "Build not green (status=$($run.status)). Retry next tick."; exit 0 }

if (Test-Path $TestDir) { Remove-Item $TestDir -Recurse -Force -ErrorAction SilentlyContinue }
New-Item -ItemType Directory -Path $TestDir -Force | Out-Null
Push-Live "Downloading MSI (gh run download, binary-safe)..."
$dl=Join-Path $TestDir 'artifact'; New-Item -ItemType Directory -Path $dl -Force | Out-Null
gh run download $RunId --repo $RepoSlug -n 'civicsuite-windows-local-msi' -D $dl 2>&1 | Out-Null
$msi=Get-ChildItem $dl -Filter '*.msi' -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $msi) { Push-Result "# VMHOST-RESULT-013 - FAIL: no MSI in artifact."; exit 0 }
Push-Live "MSI ready: $($msi.Name) ($([math]::Round($msi.Length/1MB)) MB). Copying to Sandbox folder..."
Copy-Item -LiteralPath $msi.FullName -Destination $TestDir -Force

$sbx=Join-Path $TestDir 'sandbox-test.ps1'
Set-Content -Path $sbx -Encoding ASCII -Value @'
$ErrorActionPreference='Continue'
$dir='C:\Users\WDAGUtilityAccount\Desktop\civictest'
$prog=Join-Path $dir 'sandbox-progress.txt'
$pass=$true
function P($s){ $l='['+(Get-Date -Format 'HH:mm:ss')+'] '+$s; Add-Content -Path $prog -Value $l -Encoding ASCII; Write-Host $l }
Set-Content -Path $prog -Value '' -Encoding ASCII
P 'Sandbox booted. Installing MSI...'
$msi=Get-ChildItem $dir -Filter '*.msi' | Select-Object -First 1
$ip=Start-Process msiexec.exe -ArgumentList @('/i',('"'+$msi.FullName+'"'),'/quiet','/norestart') -Wait -PassThru
P ('INSTALL exit: '+$ip.ExitCode); if ($ip.ExitCode -ne 0){ $pass=$false; P 'INSTALL FAILED' }
$exe=Get-ChildItem "$env:ProgramFiles\CivicSuite" -Filter '*.exe' -ErrorAction SilentlyContinue | Where-Object { $_.Name -notlike 'unins*' } | Select-Object -First 1
if (-not $exe){ P 'FAIL: no exe'; $pass=$false } else { P ('BINARY: '+$exe.FullName) }
if ($exe){
  $env:WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS='--remote-debugging-port=9222'
  P 'Launching app with WebView2 CDP on :9222 ...'
  $app=Start-Process $exe.FullName -PassThru
  Start-Sleep -Seconds 25
  $page=$null
  for($i=1;$i -le 18;$i++){
    try { $t=Invoke-RestMethod -Uri 'http://127.0.0.1:9222/json/list' -TimeoutSec 5 } catch { $t=$null }
    if ($t){ $page=$t | Where-Object { $_.type -eq 'page' } | Select-Object -First 1; if ($page){ break } }
    Start-Sleep -Seconds 5
  }
  if ($page){ P ('WINDOW RENDERED -> CDP page target title="'+$page.title+'" url='+$page.url) }
  else { P 'FAIL: no CDP page target in 90s (renderer never came up / blank window)'; $pass=$false }
  Start-Sleep -Seconds 40
  $alive=$null; try { $alive=Get-Process -Id $app.Id -ErrorAction SilentlyContinue } catch {}
  if ($alive -and -not $app.HasExited){ P 'PROCESS ALIVE >60s (no boot crash)' } else { P 'FAIL: process exited within 60s (boot crash)'; $pass=$false }
  try {
    Add-Type -AssemblyName System.Windows.Forms; Add-Type -AssemblyName System.Drawing
    $b=[System.Windows.Forms.SystemInformation]::VirtualScreen
    $bmp=New-Object System.Drawing.Bitmap $b.Width,$b.Height
    $g=[System.Drawing.Graphics]::FromImage($bmp); $g.CopyFromScreen($b.X,$b.Y,0,0,$bmp.Size)
    $bmp.Save((Join-Path $dir 'screenshot.png'),[System.Drawing.Imaging.ImageFormat]::Png); $g.Dispose(); $bmp.Dispose()
    P 'Screenshot captured.'
  } catch { P ('screenshot skipped: '+$_.Exception.Message) }
  $base=[System.IO.Path]::GetFileNameWithoutExtension($exe.Name)
  P 'Launching 2nd instance (single-instance / C3 check)...'
  Start-Process $exe.FullName | Out-Null; Start-Sleep -Seconds 12
  $cnt=@(Get-Process -Name $base -ErrorAction SilentlyContinue).Count
  if ($cnt -eq 1){ P 'SINGLE-INSTANCE OK: still 1 main process after 2nd launch (C3 holds)' }
  else { P ('FAIL single-instance: '+$cnt+' main processes after 2nd launch'); $pass=$false }
}
$v= if ($pass){'PASS'} else {'FAIL'}
P ('VERDICT: '+$v)
Set-Content -Path (Join-Path $dir 'sandbox-result.txt') -Value $v -Encoding ASCII
Start-Sleep -Seconds 5
shutdown.exe /s /t 2
'@

$wsb=Join-Path $TestDir 'civicsuite-test.wsb'
Set-Content -Path $wsb -Encoding ASCII -Value ("<Configuration><MemoryInMB>8192</MemoryInMB><MappedFolders><MappedFolder><HostFolder>"+$TestDir+"</HostFolder><SandboxFolder>C:\Users\WDAGUtilityAccount\Desktop\civictest</SandboxFolder><ReadOnly>false</ReadOnly></MappedFolder></MappedFolders><LogonCommand><Command>powershell.exe -ExecutionPolicy Bypass -NonInteractive -WindowStyle Minimized -File C:\Users\WDAGUtilityAccount\Desktop\civictest\sandbox-test.ps1</Command></LogonCommand></Configuration>")

$progP=Join-Path $TestDir 'sandbox-progress.txt'; $resP=Join-Path $TestDir 'sandbox-result.txt'; $shotP=Join-Path $TestDir 'screenshot.png'
foreach ($f in @($progP,$resP,$shotP)){ if (Test-Path $f){ Remove-Item $f -Force -ErrorAction SilentlyContinue } }

Push-Live "Launching Windows Sandbox (8 GB). Install + boot-render + single-instance run automatically; steps stream below."
Start-Process -FilePath 'C:\Windows\System32\WindowsSandbox.exe' -ArgumentList $wsb -ErrorAction SilentlyContinue | Out-Null
Push-Live "Sandbox launched. Waiting on in-Sandbox result (launcher exit is normal/ignored)..."
$start=Get-Date; $deadline=$start.AddMinutes(25); $last=0; $beat=Get-Date; $sr=$null
while ((Get-Date) -lt $deadline) {
  Start-Sleep -Seconds 18
  $new=@()
  if (Test-Path $progP){ $all=Get-Content $progP -ErrorAction SilentlyContinue | Where-Object { $_ -ne '' }; if ($all.Count -gt $last){ $new=$all[$last..($all.Count-1)]; $last=$all.Count } }
  if ($new.Count -gt 0){ foreach ($n in $new){ [void]$script:logLines.Add('    SANDBOX> '+$n) }; Push-Live $null; $beat=Get-Date }
  elseif (((Get-Date)-$beat).TotalSeconds -ge 60){ Push-Live ("...still working (elapsed "+[int]((Get-Date)-$start).TotalSeconds+"s)"); $beat=Get-Date }
  if (Test-Path $resP){ Start-Sleep -Seconds 3; $sr=(Get-Content $resP -Raw -ErrorAction SilentlyContinue).Trim(); break }
}
if (-not $sr){ Push-Live 'No verdict within 25 min -> FAIL.'; $sr='FAIL (timeout)' }
$fp=''; if (Test-Path $progP){ $fp=Get-Content $progP -Raw -ErrorAction SilentlyContinue }
$v= if ($sr -match '^PASS'){'PASS'} else {'FAIL'}
Push-Live "Sandbox finished. Verdict: $v. Writing RESULT-013 (+ screenshot if captured)."
Push-Result @"
# VMHOST-RESULT-013 - Clean-Machine BOOT proof (Critical #1 + C3): $v

Machine: $env:COMPUTERNAME   Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
MSI: $($msi.Name)  from CI run $RunId   Method: Windows Sandbox 8 GB, fresh Windows
Proves: app launches, WebView2 window RENDERS (CDP page target), survives >60s (no boot crash), single-instance (C3) holds on 2nd launch.
Does NOT cover (-> directive 014): first-run wizard click-through, 6.97 GB model download+load, real AI completion, real workflow, GUI backup/restore.
Screenshot: VMHOST-RESULT-013-screenshot.png (if captured)

## Transcript (inside the Sandbox)
``````
$fp
``````
Live: VMHOST-LIVE-013.md
"@ $shotP
Push-Live "DONE. Verdict: $v"
