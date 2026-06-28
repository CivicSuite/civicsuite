# VMHOST-DIRECTIVE-015 - model download (FIRE+POLL) + completion + backup/restore. LIVE-STREAMED.
# Fixes 014: a single 60-min blocking CDP awaitPromise gets dropped. Instead fire the download
# (fire-and-forget) then POLL get_model_state in short fresh CDP evals every 45s (no long-idle
# websocket), 3-hour budget, streamed progress. Then load -> health -> finish -> real completion,
# then backup/restore (#4). First-run wizard already proven by 014. Pure ASCII, PS5.1.
$ErrorActionPreference='Continue'
$Repo='C:\dev\Codex\civicsuite'; $Branch='stage-3a-baremetal-windows'
$VDir=Join-Path $Repo 'test-comms\vmhost-beelink'
$Result=Join-Path $VDir 'VMHOST-RESULT-015.md'; $Live=Join-Path $VDir 'VMHOST-LIVE-015.md'
$TestDir='C:\CivicSuiteCleanTest015'; $RunId='28253830442'; $RepoSlug='CivicSuite/civicsuite'
if (-not (Get-Command git -ErrorAction SilentlyContinue)) { foreach ($p in @("$env:ProgramFiles\Git\cmd","$env:ProgramFiles\Git\bin","$env:LOCALAPPDATA\Programs\Git\cmd")) { if (Test-Path (Join-Path $p 'git.exe')) { $env:PATH="$p;$env:PATH"; break } } }
Set-Location $Repo
git fetch origin $Branch --force 2>&1 | Out-Null
git checkout -f -B $Branch FETCH_HEAD 2>&1 | Out-Null
$script:logLines=New-Object System.Collections.ArrayList
function Stamp { (Get-Date).ToString('HH:mm:ss') }
function Push-Live { param([string]$line)
  if ($line) { [void]$script:logLines.Add("[$(Stamp)] $line"); Write-Host "[$(Stamp)] $line" }
  $hdr=@("# VMHOST-LIVE-015 - model + completion + backup/restore (LIVE)","","Machine: $env:COMPUTERNAME   Updated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')","",'```')
  $body=$hdr+$script:logLines+@('```')
  Set-Location $Repo; git fetch origin $Branch --force 2>&1 | Out-Null; git checkout -f -B $Branch FETCH_HEAD 2>&1 | Out-Null
  Set-Content -Path $Live -Value ($body -join "`r`n") -Encoding UTF8
  git add -- $Live 2>&1 | Out-Null
  git -c user.name='vmhost-runner' -c user.email='vmhost@localhost' commit -m "vmhost: live 015 $(Stamp)" 2>&1 | Out-Null
  git push origin "HEAD:$Branch" 2>&1 | Out-Null }
function Push-Result { param([string]$body)
  Set-Location $Repo; git fetch origin $Branch --force 2>&1 | Out-Null; git checkout -f -B $Branch FETCH_HEAD 2>&1 | Out-Null
  Set-Content -Path $Result -Value $body -Encoding UTF8
  git add -- $Result 2>&1 | Out-Null
  git -c user.name='vmhost-runner' -c user.email='vmhost@localhost' commit -m "vmhost: result 015 model+completion+backup" 2>&1 | Out-Null
  git push origin "HEAD:$Branch" 2>&1 | Out-Null }
if (Test-Path $Result) { $e=Get-Content $Result -Raw -ErrorAction SilentlyContinue; if ($e -match 'VERDICT') { Write-Host 'done'; exit 0 } }
Push-Live "Directive 015 started (model fire+poll + completion + backup/restore). Checking Sandbox + build..."
$feat=Get-WindowsOptionalFeature -Online -FeatureName 'Containers-DisposableClientVM' -ErrorAction SilentlyContinue
if (-not $feat -or $feat.State -ne 'Enabled') { Push-Result "# VMHOST-RESULT-015 - FAIL: Sandbox not enabled."; exit 1 }
$run=(gh api "repos/$RepoSlug/actions/runs/$RunId" 2>&1 | ConvertFrom-Json)
if ($run.status -ne 'completed' -or $run.conclusion -ne 'success') { Push-Live "Build not green. Retry next tick."; exit 0 }
if (Test-Path $TestDir) { Remove-Item $TestDir -Recurse -Force -ErrorAction SilentlyContinue }
New-Item -ItemType Directory -Path $TestDir -Force | Out-Null
Push-Live "Downloading MSI (gh run download)..."
$dl=Join-Path $TestDir 'artifact'; New-Item -ItemType Directory -Path $dl -Force | Out-Null
gh run download $RunId --repo $RepoSlug -n 'civicsuite-windows-local-msi' -D $dl 2>&1 | Out-Null
$msi=Get-ChildItem $dl -Filter '*.msi' -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $msi) { Push-Result "# VMHOST-RESULT-015 - FAIL: no MSI in artifact."; exit 0 }
Push-Live "MSI ready: $($msi.Name) ($([math]::Round($msi.Length/1MB)) MB). Copying to Sandbox folder..."
Copy-Item -LiteralPath $msi.FullName -Destination $TestDir -Force
$sbx=Join-Path $TestDir 'sandbox-test.ps1'
Set-Content -Path $sbx -Encoding ASCII -Value @'
$ErrorActionPreference='Continue'
$dir='C:\Users\WDAGUtilityAccount\Desktop\civictest'
$prog=Join-Path $dir 'sandbox-progress.txt'
$results=@{}
function P($s){ $l='['+(Get-Date -Format 'HH:mm:ss')+'] '+$s; Add-Content -Path $prog -Value $l -Encoding ASCII; Write-Host $l }
Set-Content -Path $prog -Value '' -Encoding ASCII
P 'Installing MSI...'
$msi=Get-ChildItem $dir -Filter '*.msi' | Select-Object -First 1
$ip=Start-Process msiexec.exe -ArgumentList @('/i',('"'+$msi.FullName+'"'),'/quiet','/norestart') -Wait -PassThru
P ('INSTALL exit: '+$ip.ExitCode); if ($ip.ExitCode -ne 0){ Set-Content (Join-Path $dir 'sandbox-result.txt') 'FAIL' -Encoding ASCII; shutdown.exe /s /t 2; return }
$exe=Get-ChildItem "$env:ProgramFiles\CivicSuite" -Filter '*.exe' -ErrorAction SilentlyContinue | Where-Object { $_.Name -notlike 'unins*' } | Select-Object -First 1
$env:WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS='--remote-debugging-port=9222'
P 'Launching app with CDP...'
$app=Start-Process $exe.FullName -PassThru
$wsUrl=$null
for($i=1;$i -le 24;$i++){ try { $t=Invoke-RestMethod 'http://127.0.0.1:9222/json/list' -TimeoutSec 5 } catch { $t=$null }
  if ($t){ $pg=$t | Where-Object { $_.type -eq 'page' -and $_.webSocketDebuggerUrl } | Select-Object -First 1; if ($pg){ $wsUrl=$pg.webSocketDebuggerUrl; break } }
  Start-Sleep -Seconds 5 }
if (-not $wsUrl){ P 'FAIL: no CDP page'; Set-Content (Join-Path $dir 'sandbox-result.txt') 'FAIL' -Encoding ASCII; shutdown.exe /s /t 2; return }
P ('CDP connected')
function Cdp($expr,$timeoutSec){
  $ws=New-Object System.Net.WebSockets.ClientWebSocket
  try { $ws.ConnectAsync([Uri]$wsUrl,[Threading.CancellationToken]::None).Wait(20000) | Out-Null } catch { return @{ok=$false;e='ws connect: '+$_.Exception.Message} }
  $id=Get-Random -Minimum 1 -Maximum 999999
  $req=@{ id=$id; method='Runtime.evaluate'; params=@{ expression=$expr; awaitPromise=$true; returnByValue=$true } } | ConvertTo-Json -Depth 8 -Compress
  $b=[Text.Encoding]::UTF8.GetBytes($req)
  $ws.SendAsync((New-Object System.ArraySegment[byte] (,$b)),'Text',$true,[Threading.CancellationToken]::None).Wait(20000) | Out-Null
  $deadline=(Get-Date).AddSeconds($timeoutSec); $sb=New-Object Text.StringBuilder; $buf=New-Object byte[] 131072; $out=$null
  while((Get-Date) -lt $deadline){ $seg=New-Object System.ArraySegment[byte] (,$buf); $rt=$ws.ReceiveAsync($seg,[Threading.CancellationToken]::None)
    $ms=[int][math]::Max(1000,[math]::Min(30000,($deadline-(Get-Date)).TotalMilliseconds)); if (-not $rt.Wait($ms)){ continue }
    $r=$rt.Result; [void]$sb.Append([Text.Encoding]::UTF8.GetString($buf,0,$r.Count))
    if ($r.EndOfMessage){ $j=$sb.ToString(); $sb.Clear()|Out-Null; try{$o=$j|ConvertFrom-Json}catch{$o=$null}; if ($o -and $o.id -eq $id){ $out=$o; break } } }
  try{ $ws.Dispose() }catch{}
  if (-not $out){ return @{ok=$false;e='cdp timeout'} }
  if ($out.result.exceptionDetails){ return @{ok=$false;e='js: '+($out.result.exceptionDetails|ConvertTo-Json -Compress)} }
  return @{ok=$true;value=$out.result.result.value} }
function Ipc($cmd,$argsJson,$timeoutSec){ $expr="(async()=>{try{const r=await window.__TAURI_INTERNALS__.invoke('"+$cmd+"',"+$argsJson+");return JSON.stringify({ok:true,r:r});}catch(e){return JSON.stringify({ok:false,e:String(e)});}})()"
  $res=Cdp $expr $timeoutSec; if (-not $res.ok){ return @{ok=$false;e=$res.e} }
  try { return ($res.value | ConvertFrom-Json) } catch { return @{ok=$false;e='bad json: '+$res.value} } }
function FireIpc($cmd,$argsJson){ $expr="window.__TAURI_INTERNALS__.invoke('"+$cmd+"',"+$argsJson+"); 'fired'"; Cdp $expr 30 | Out-Null }
function Step($cmd,$argsJson,$label,$t){ P ($label+' ...'); $r=Ipc $cmd $argsJson $t
  if (-not $r.ok){ P ('  FAIL '+$label+': '+$r.e); return $false }
  $acc=$true; if ($r.r -and ($r.r.PSObject.Properties.Name -contains 'accepted')){ $acc=$r.r.accepted }
  if (-not $acc){ P ('  REJECTED '+$label+': '+$r.r.status+' '+$r.r.message); return $false }
  P ('  OK '+$label); return $true }

$loc='{"installRoot":"C:\\Users\\WDAGUtilityAccount\\AppData\\Local\\CivicSuite","dataRoot":"C:\\Users\\WDAGUtilityAccount\\AppData\\Local\\CivicSuite\\Data","backupRoot":"C:\\Users\\WDAGUtilityAccount\\Documents\\CivicSuite Backups"}'
$ae='admin@testville.gov'; $ap='CivicAdmin2026!'
$wiz=$true
if ($wiz){ $wiz=(Step 'first_run_action' '{"action":"review","stepId":"unsigned-beta","payload":{}}' 'unsigned-beta' 60) }
if ($wiz){ $wiz=(Step 'first_run_action' '{"action":"review","stepId":"smartscreen","payload":{}}' 'smartscreen' 60) }
if ($wiz){ $wiz=(Step 'first_run_action' ('{"action":"choose-location","stepId":"locations","payload":'+$loc+'}') 'locations' 120) }
if ($wiz){ $wiz=(Step 'first_run_action' '{"action":"select-modules","stepId":"modules","payload":{"profileId":"city-core"}}' 'modules' 120) }
if ($wiz){ $wiz=(Step 'first_run_action' '{"action":"create-city-profile","stepId":"city-profile","payload":{"cityName":"Testville","state":"OR","timeZone":"America/Los_Angeles","recordsContact":"records@testville.gov","clerkContact":"clerk@testville.gov"}}' 'city-profile' 120) }
if ($wiz){ $wiz=(Step 'first_run_action' ('{"action":"create-admin","stepId":"first-admin","payload":{"adminName":"Test Admin","adminEmail":"'+$ae+'","adminPasscode":"'+$ap+'"}}') 'create-admin' 120) }
if ($wiz){ $wiz=(Step 'auth_action' ('{"action":"sign-in","payload":{"email":"'+$ae+'","passcode":"'+$ap+'"}}') 'sign-in' 120) }
if ($wiz){ $wiz=(Step 'first_run_action' ('{"action":"choose-backup","stepId":"backup","payload":'+$loc+'}') 'backup-default' 120) }
$results['first_run_wizard']= if ($wiz){'PASS'} else {'FAIL'}
P ('=== first-run wizard: '+$results['first_run_wizard']+' ===')

# ---- MODEL: fire-and-forget download, then POLL ----
$modelOk=$false
if ($wiz){
  P 'MODEL: firing resume-download (fire-and-forget), then polling every 45s (up to 3h)...'
  FireIpc 'model_action' '{"action":"resume-download"}'
  $deadline=(Get-Date).AddHours(3)
  while((Get-Date) -lt $deadline){
    Start-Sleep -Seconds 45
    $ms=Ipc 'get_model_state' '{}' 60
    if ($ms.ok -and $ms.r){
      $st=''; try { $st=$ms.r.download.status } catch {}; if (-not $st){ try { $st=$ms.r.status } catch {} }
      $by=''; try { $by=$ms.r.download.downloaded_bytes } catch {}
      P ('  model: status='+$st+' bytes='+$by)
    } else { P ('  model poll error: '+$ms.e) }
    $vc=Ipc 'model_action' '{"action":"verify-checksum"}' 120
    if ($vc.ok -and $vc.r -and $vc.r.accepted){ P '  CHECKSUM VERIFIED -> download complete'; $modelOk=$true; break }
  }
}
$results['model_download']= if ($modelOk){'PASS'} else {'FAIL'}
P ('=== model download+checksum: '+$results['model_download']+' ===')

$loaded=$false
if ($modelOk){ $loaded=(Step 'model_action' '{"action":"load-runtime-model"}' 'load-runtime-model' 1200) }
$results['model_load']= if ($loaded){'PASS'} else {'FAIL'}

if ($loaded){ Step 'first_run_action' '{"action":"download-model","stepId":"model","payload":{}}' 'wizard model step' 120 | Out-Null
  Step 'first_run_action' '{"action":"verify-health","stepId":"health","payload":{}}' 'verify-health' 600 | Out-Null
  Step 'first_run_action' '{"action":"open-app","stepId":"finish","payload":{}}' 'finish' 120 | Out-Null }

# ---- real completion via Ollama ----
$completion=''
if ($loaded){
  try { $tags=Invoke-RestMethod 'http://127.0.0.1:15434/api/tags' -TimeoutSec 30; $mdl=$tags.models[0].name
    if ($mdl){ P ('Ollama model: '+$mdl+' -> one real completion (CPU, slow)...')
      $body=@{ model=$mdl; prompt='Reply with one short sentence confirming you are running.'; stream=$false } | ConvertTo-Json -Compress
      $gen=Invoke-RestMethod 'http://127.0.0.1:15434/api/generate' -Method Post -Body $body -ContentType 'application/json' -TimeoutSec 900
      if ($gen.response){ $completion=($gen.response -replace '\s+',' ').Trim() } } } catch { P ('completion error: '+$_.Exception.Message) }
}
$results['real_completion']= if ($completion){'PASS'} else {'FAIL'}
if ($completion){ P ('REAL COMPLETION: '+$completion) }

# ---- backup / restore (#4) ----
$br=$false
$bk=Ipc 'supervisor_action' '{"action":"backup","serviceId":null}' 600
if ($bk.ok -and $bk.r -and ($bk.r.accepted -ne $false)){ P '  backup OK'
  $rs=Ipc 'supervisor_action' '{"action":"restore","serviceId":null}' 600
  if ($rs.ok -and $rs.r -and ($rs.r.accepted -ne $false)){ P '  restore OK'; $br=$true } else { P ('  restore FAIL: '+$rs.e+' '+$rs.r.message) }
} else { P ('  backup FAIL: '+$bk.e+' '+$bk.r.message) }
$results['backup_restore']= if ($br){'PASS'} else {'FAIL'}

$overall='PASS'; foreach ($k in @('first_run_wizard','model_download','model_load','real_completion','backup_restore')){ if ($results[$k] -ne 'PASS'){ $overall='FAIL' } }
P ('VERDICT: '+$overall)
$lines=@(); foreach ($k in $results.Keys){ $lines += ($k+'='+$results[$k]) }
Set-Content -Path (Join-Path $dir 'sandbox-result.txt') -Value $overall -Encoding ASCII
Set-Content -Path (Join-Path $dir 'sandbox-detail.txt') -Value (($lines -join "`r`n")+"`r`ncompletion="+$completion) -Encoding ASCII
Start-Sleep -Seconds 5
shutdown.exe /s /t 2
'@
$wsb=Join-Path $TestDir 'civicsuite-test.wsb'
Set-Content -Path $wsb -Encoding ASCII -Value ("<Configuration><MemoryInMB>20480</MemoryInMB><MappedFolders><MappedFolder><HostFolder>"+$TestDir+"</HostFolder><SandboxFolder>C:\Users\WDAGUtilityAccount\Desktop\civictest</SandboxFolder><ReadOnly>false</ReadOnly></MappedFolder></MappedFolders><LogonCommand><Command>powershell.exe -ExecutionPolicy Bypass -NonInteractive -WindowStyle Minimized -File C:\Users\WDAGUtilityAccount\Desktop\civictest\sandbox-test.ps1</Command></LogonCommand></Configuration>")
$progP=Join-Path $TestDir 'sandbox-progress.txt'; $resP=Join-Path $TestDir 'sandbox-result.txt'; $detP=Join-Path $TestDir 'sandbox-detail.txt'
foreach ($f in @($progP,$resP,$detP)){ if (Test-Path $f){ Remove-Item $f -Force -ErrorAction SilentlyContinue } }
Push-Live "Launching Windows Sandbox (20 GB). Model download uses fire+poll; progress streams below. Budget up to ~3.5h."
Start-Process -FilePath 'C:\Windows\System32\WindowsSandbox.exe' -ArgumentList $wsb -ErrorAction SilentlyContinue | Out-Null
Push-Live "Sandbox launched. Streaming..."
$start=Get-Date; $deadline=$start.AddMinutes(220); $last=0; $beat=Get-Date; $sr=$null
while ((Get-Date) -lt $deadline) {
  Start-Sleep -Seconds 20
  $new=@(); if (Test-Path $progP){ $all=Get-Content $progP -ErrorAction SilentlyContinue | Where-Object { $_ -ne '' }; if ($all.Count -gt $last){ $new=$all[$last..($all.Count-1)]; $last=$all.Count } }
  if ($new.Count -gt 0){ foreach ($n in $new){ [void]$script:logLines.Add('    SANDBOX> '+$n) }; Push-Live $null; $beat=Get-Date }
  elseif (((Get-Date)-$beat).TotalSeconds -ge 90){ Push-Live ("...working (elapsed "+[int]((Get-Date)-$start).TotalSeconds+"s)"); $beat=Get-Date }
  if (Test-Path $resP){ Start-Sleep -Seconds 3; $sr=(Get-Content $resP -Raw -ErrorAction SilentlyContinue).Trim(); break } }
if (-not $sr){ Push-Live 'No verdict within budget -> FAIL.'; $sr='FAIL (timeout)' }
$fp=''; if (Test-Path $progP){ $fp=Get-Content $progP -Raw -ErrorAction SilentlyContinue }
$det=''; if (Test-Path $detP){ $det=Get-Content $detP -Raw -ErrorAction SilentlyContinue }
$v= if ($sr -match '^PASS'){'PASS'} else {'FAIL'}
Push-Live "Sandbox finished. Verdict: $v."
Push-Result @"
# VMHOST-RESULT-015 - model + completion + backup/restore: $v

Machine: $env:COMPUTERNAME   Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
MSI: $($msi.Name)  run $RunId   Sandbox 20 GB.
Per-check detail:
``````
$det
``````
## Transcript
``````
$fp
``````
Live: VMHOST-LIVE-015.md
"@
Push-Live "DONE. Verdict: $v"
