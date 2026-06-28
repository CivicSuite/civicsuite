# VMHOST-DIRECTIVE-017 - model LOAD via fire+poll (fixes 015) + real completion + backup/restore. LIVE.
# 015 proved download (fire+poll). load-runtime-model/backup still used blocking awaitPromise -> websocket
# idle-drop -> "cdp timeout". Here every long op is fire-and-forget + external poll:
#   download -> verify-checksum poll ; verify-health -> Ollama-reachable poll ; load -> Ollama /api/tags poll ;
#   completion via Ollama HTTP ; backup -> backup-folder poll ; restore -> get_app_state poll.
# Pure ASCII, PS5.1.
$ErrorActionPreference='Continue'
$Repo='C:\dev\Codex\civicsuite'; $Branch='stage-3a-baremetal-windows'
$VDir=Join-Path $Repo 'test-comms\vmhost-beelink'
$Result=Join-Path $VDir 'VMHOST-RESULT-017.md'; $Live=Join-Path $VDir 'VMHOST-LIVE-017.md'
$TestDir='C:\CivicSuiteCleanTest017'; $RunId='28318711830'; $RepoSlug='CivicSuite/civicsuite'
if (-not (Get-Command git -ErrorAction SilentlyContinue)) { foreach ($p in @("$env:ProgramFiles\Git\cmd","$env:ProgramFiles\Git\bin","$env:LOCALAPPDATA\Programs\Git\cmd")) { if (Test-Path (Join-Path $p 'git.exe')) { $env:PATH="$p;$env:PATH"; break } } }
Set-Location $Repo; git fetch origin $Branch --force 2>&1 | Out-Null; git checkout -f -B $Branch FETCH_HEAD 2>&1 | Out-Null
$script:logLines=New-Object System.Collections.ArrayList
function Stamp { (Get-Date).ToString('HH:mm:ss') }
function Push-Live { param([string]$line)
  if ($line) { [void]$script:logLines.Add("[$(Stamp)] $line"); Write-Host "[$(Stamp)] $line" }
  $hdr=@("# VMHOST-LIVE-017 - model load + completion + backup/restore (LIVE)","","Machine: $env:COMPUTERNAME   Updated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')","",'```')
  $body=$hdr+$script:logLines+@('```')
  Set-Location $Repo; git fetch origin $Branch --force 2>&1 | Out-Null; git checkout -f -B $Branch FETCH_HEAD 2>&1 | Out-Null
  Set-Content -Path $Live -Value ($body -join "`r`n") -Encoding UTF8
  git add -- $Live 2>&1 | Out-Null
  git -c user.name='vmhost-runner' -c user.email='vmhost@localhost' commit -m "vmhost: live 017 $(Stamp)" 2>&1 | Out-Null
  git push origin "HEAD:$Branch" 2>&1 | Out-Null }
function Push-Result { param([string]$body)
  Set-Location $Repo; git fetch origin $Branch --force 2>&1 | Out-Null; git checkout -f -B $Branch FETCH_HEAD 2>&1 | Out-Null
  Set-Content -Path $Result -Value $body -Encoding UTF8
  git add -- $Result 2>&1 | Out-Null
  git -c user.name='vmhost-runner' -c user.email='vmhost@localhost' commit -m "vmhost: result 017 model load+completion+backup" 2>&1 | Out-Null
  git push origin "HEAD:$Branch" 2>&1 | Out-Null }
if (Test-Path $Result) { $e=Get-Content $Result -Raw -ErrorAction SilentlyContinue; if ($e -match 'VERDICT') { Write-Host 'done'; exit 0 } }
Push-Live "Directive 017 started (model load fire+poll + completion + backup/restore)."
$feat=Get-WindowsOptionalFeature -Online -FeatureName 'Containers-DisposableClientVM' -ErrorAction SilentlyContinue
if (-not $feat -or $feat.State -ne 'Enabled') { Push-Result "# VMHOST-RESULT-017 - FAIL: Sandbox not enabled."; exit 1 }
$run=(gh api "repos/$RepoSlug/actions/runs/$RunId" 2>&1 | ConvertFrom-Json)
if ($run.status -ne 'completed' -or $run.conclusion -ne 'success') { Push-Live "Build not green. Retry next tick."; exit 0 }
if (Test-Path $TestDir) { Remove-Item $TestDir -Recurse -Force -ErrorAction SilentlyContinue }
New-Item -ItemType Directory -Path $TestDir -Force | Out-Null
Push-Live "Downloading MSI..."
$dl=Join-Path $TestDir 'artifact'; New-Item -ItemType Directory -Path $dl -Force | Out-Null
gh run download $RunId --repo $RepoSlug -n 'civicsuite-windows-local-msi' -D $dl 2>&1 | Out-Null
$msi=Get-ChildItem $dl -Filter '*.msi' -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $msi) { Push-Result "# VMHOST-RESULT-017 - FAIL: no MSI."; exit 0 }
Push-Live "MSI ready: $($msi.Name). Copying..."
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
  if ($t){ $pg=$t | Where-Object { $_.type -eq 'page' -and $_.webSocketDebuggerUrl } | Select-Object -First 1; if ($pg){ $wsUrl=$pg.webSocketDebuggerUrl; break } }; Start-Sleep -Seconds 5 }
if (-not $wsUrl){ P 'FAIL: no CDP page'; Set-Content (Join-Path $dir 'sandbox-result.txt') 'FAIL' -Encoding ASCII; shutdown.exe /s /t 2; return }
P 'CDP connected'
function Cdp($expr,$timeoutSec){
  $ws=New-Object System.Net.WebSockets.ClientWebSocket
  try { $ws.ConnectAsync([Uri]$wsUrl,[Threading.CancellationToken]::None).Wait(20000) | Out-Null } catch { return @{ok=$false;e='ws: '+$_.Exception.Message} }
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
function Ipc($cmd,$argsJson,$t){ $expr="(async()=>{try{const r=await window.__TAURI_INTERNALS__.invoke('"+$cmd+"',"+$argsJson+");return JSON.stringify({ok:true,r:r});}catch(e){return JSON.stringify({ok:false,e:String(e)});}})()"
  $res=Cdp $expr $t; if (-not $res.ok){ return @{ok=$false;e=$res.e} }
  try { return ($res.value | ConvertFrom-Json) } catch { return @{ok=$false;e='bad json'} } }
function FireIpc($cmd,$argsJson){ Cdp ("window.__TAURI_INTERNALS__.invoke('"+$cmd+"',"+$argsJson+"); 'fired'") 30 | Out-Null }
function Step($cmd,$argsJson,$label,$t){ $r=Ipc $cmd $argsJson $t; if (-not $r.ok){ P ('  FAIL '+$label+': '+$r.e); return $false }
  $acc=$true; if ($r.r -and ($r.r.PSObject.Properties.Name -contains 'accepted')){ $acc=$r.r.accepted }
  if (-not $acc){ P ('  REJECTED '+$label+': '+$r.r.message); return $false }; P ('  OK '+$label); return $true }
function OllamaTags(){ try { return (Invoke-RestMethod 'http://127.0.0.1:15434/api/tags' -TimeoutSec 15) } catch { return $null } }

$loc='{"installRoot":"C:\\Users\\WDAGUtilityAccount\\AppData\\Local\\CivicSuite","dataRoot":"C:\\Users\\WDAGUtilityAccount\\AppData\\Local\\CivicSuite\\Data","backupRoot":"C:\\Users\\WDAGUtilityAccount\\Documents\\CivicSuite Backups"}'
$ae='admin@testville.gov'; $ap='CivicAdmin2026!'
$wiz=$true
$seq=@(
 @('first_run_action','{"action":"review","stepId":"unsigned-beta","payload":{}}','unsigned-beta'),
 @('first_run_action','{"action":"review","stepId":"smartscreen","payload":{}}','smartscreen'),
 @('first_run_action',('{"action":"choose-location","stepId":"locations","payload":'+$loc+'}'),'locations'),
 @('first_run_action','{"action":"select-modules","stepId":"modules","payload":{"profileId":"city-core"}}','modules'),
 @('first_run_action','{"action":"create-city-profile","stepId":"city-profile","payload":{"cityName":"Testville","state":"OR","timeZone":"America/Los_Angeles","recordsContact":"records@testville.gov","clerkContact":"clerk@testville.gov"}}','city-profile'),
 @('first_run_action',('{"action":"create-admin","stepId":"first-admin","payload":{"adminName":"Test Admin","adminEmail":"'+$ae+'","adminPasscode":"'+$ap+'"}}'),'create-admin'),
 @('auth_action',('{"action":"sign-in","payload":{"email":"'+$ae+'","passcode":"'+$ap+'"}}'),'sign-in'),
 @('first_run_action',('{"action":"choose-backup","stepId":"backup","payload":'+$loc+'}'),'backup-default'))
foreach($s in $seq){ if ($wiz){ P ($s[2]+' ...'); $wiz=(Step $s[0] $s[1] $s[2] 120) } }
$results['first_run_wizard']= if ($wiz){'PASS'} else {'FAIL'}
P ('=== wizard: '+$results['first_run_wizard']+' ===')

# download (fire+poll verify-checksum) - proven in 015
$modelOk=$false
if ($wiz){ P 'MODEL: fire resume-download, poll verify-checksum (up to 60m)...'; FireIpc 'model_action' '{"action":"resume-download"}'
  $d=(Get-Date).AddMinutes(60)
  while((Get-Date) -lt $d){ Start-Sleep -Seconds 30
    $vc=Ipc 'model_action' '{"action":"verify-checksum"}' 120
    if ($vc.ok -and $vc.r -and $vc.r.accepted){ P '  CHECKSUM VERIFIED'; $modelOk=$true; break } else { P '  ...downloading' } } }
$results['model_download']= if ($modelOk){'PASS'} else {'FAIL'}

# verify-health (fire, poll Ollama reachable) then load (fire, poll Ollama tags)
$loaded=$false
if ($modelOk){
  P 'HEALTH: fire verify-health (bootstraps runtime incl Ollama), poll Ollama reachable (up to 20m)...'
  FireIpc 'first_run_action' '{"action":"verify-health","stepId":"health","payload":{}}'
  $d=(Get-Date).AddMinutes(20); $rt=$false
  while((Get-Date) -lt $d){ Start-Sleep -Seconds 20; if (OllamaTags){ P '  Ollama runtime reachable'; $rt=$true; break } else { P '  ...waiting for Ollama' } }
  P 'LOAD: fire load-runtime-model, poll Ollama /api/tags for the model (up to 30m)...'
  FireIpc 'model_action' '{"action":"load-runtime-model"}'
  $d=(Get-Date).AddMinutes(30)
  while((Get-Date) -lt $d){ Start-Sleep -Seconds 20; $tg=OllamaTags
    if ($tg -and $tg.models -and $tg.models.Count -gt 0){ P ('  Ollama models: '+(($tg.models|ForEach-Object{$_.name}) -join ',')); $loaded=$true; break } else { P '  ...loading model' } } }
$results['model_load']= if ($loaded){'PASS'} else {'FAIL'}

# real completion
$completion=''
if ($loaded){ try { $tg=OllamaTags; $mdl=$tg.models[0].name
  P ('COMPLETION: '+$mdl+' (CPU, slow)...')
  $body=@{ model=$mdl; prompt='Reply with one short sentence confirming you are running.'; stream=$false } | ConvertTo-Json -Compress
  $gen=Invoke-RestMethod 'http://127.0.0.1:15434/api/generate' -Method Post -Body $body -ContentType 'application/json' -TimeoutSec 900
  if ($gen.response){ $completion=($gen.response -replace '\s+',' ').Trim() } } catch { P ('completion error: '+$_.Exception.Message) } }
$results['real_completion']= if ($completion){'PASS'} else {'FAIL'}
if ($completion){ P ('REAL COMPLETION: '+$completion) }

# finish wizard (best-effort)
if ($loaded){ Step 'first_run_action' '{"action":"download-model","stepId":"model","payload":{}}' 'wizard model step' 120 | Out-Null
  Step 'first_run_action' '{"action":"open-app","stepId":"finish","payload":{}}' 'finish' 120 | Out-Null }

# clerk workflow (#5): submit a public records request, then look it up (round-trip through Postgres)
$clerk=$false
P 'CLERK WORKFLOW: submit-public-records-request...'
$sub=Ipc 'city_work_action' '{"action":"submit-public-records-request","payload":{"requester":"Jane Public","requesterContact":"jane@example.com","summary":"All city council minutes for 2026"}}' 300
if ($sub.ok -and $sub.r -and ($sub.r.accepted -ne $false)){
  $req=''; if ($sub.r.message){ $mm=[regex]::Match([string]$sub.r.message,'REQ-\d+'); if ($mm.Success){ $req=$mm.Value } }
  P ('  submitted records request; tracking='+$req)
  if ($req){
    $lk=Ipc 'city_work_action' ('{"action":"lookup-public-records-request","payload":{"trackingNumber":"'+$req+'","requesterContact":"jane@example.com"}}') 120
    if ($lk.ok -and $lk.r -and ($lk.r.accepted -ne $false)){ P '  lookup OK -> records request round-trips (intake persisted + retrievable)'; $clerk=$true } else { P ('  lookup FAIL: '+$lk.e+' '+([string]$lk.r.message)) }
  } else { P '  no tracking number returned' }
} else { P ('  submit FAIL: '+$sub.e+' '+([string]$sub.r.message)) }
$results['clerk_workflow']= if ($clerk){'PASS'} else {'FAIL'}

# backup (fire, poll backup folder) + restore (fire, poll app state)
$br=$false
$bkRoot='C:\Users\WDAGUtilityAccount\Documents\CivicSuite Backups'
P 'BACKUP: fire supervisor backup, poll backup folder (up to 10m)...'
$before=@(); if (Test-Path $bkRoot){ $before=@(Get-ChildItem $bkRoot -Recurse -ErrorAction SilentlyContinue | Select-Object -Expand FullName) }
FireIpc 'supervisor_action' '{"action":"backup","serviceId":null}'
$d=(Get-Date).AddMinutes(10); $backedUp=$false
while((Get-Date) -lt $d){ Start-Sleep -Seconds 20
  $now=@(); if (Test-Path $bkRoot){ $now=@(Get-ChildItem $bkRoot -Recurse -ErrorAction SilentlyContinue | Select-Object -Expand FullName) }
  if ($now.Count -gt $before.Count){ P ('  backup artifact appeared ('+$now.Count+' items under backup root)'); $backedUp=$true; break } else { P '  ...waiting for backup' } }
if ($backedUp){ P 'RESTORE: fire supervisor restore, poll app state (up to 10m)...'
  FireIpc 'supervisor_action' '{"action":"restore","serviceId":null}'
  $d=(Get-Date).AddMinutes(10)
  while((Get-Date) -lt $d){ Start-Sleep -Seconds 20; $gs=Ipc 'get_app_state' '{}' 60
    if ($gs.ok -and $gs.r){ P '  app state reloaded after restore'; $br=$true; break } else { P '  ...waiting for restore' } } }
$results['backup_restore']= if ($br){'PASS'} else {'FAIL'}

$overall='PASS'; foreach ($k in @('first_run_wizard','model_download','model_load','real_completion','clerk_workflow','backup_restore')){ if ($results[$k] -ne 'PASS'){ $overall='FAIL' } }
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
Push-Live "Launching Windows Sandbox (20 GB). All long ops are fire+poll; streaming below."
Start-Process -FilePath 'C:\Windows\System32\WindowsSandbox.exe' -ArgumentList $wsb -ErrorAction SilentlyContinue | Out-Null
Push-Live "Sandbox launched. Streaming..."
$start=Get-Date; $deadline=$start.AddMinutes(150); $last=0; $beat=Get-Date; $sr=$null
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
# VMHOST-RESULT-017 - FINAL QA-B1 on the 1.0.1 MSI (first-run + model + completion + clerk workflow + backup/restore): $v

Machine: $env:COMPUTERNAME   Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
MSI: $($msi.Name)  run $RunId   Sandbox 20 GB.
Per-check:
``````
$det
``````
## Transcript
``````
$fp
``````
Live: VMHOST-LIVE-017.md
"@
Push-Live "DONE. Verdict: $v"
