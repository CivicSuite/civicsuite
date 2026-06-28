# VMHOST-DIRECTIVE-014 - clean-machine FULL first-run + model + real completion (Criticals #2 & #3), LIVE-STREAMED.
# Drives the real first-run IPC over CDP (window.__TAURI_INTERNALS__.invoke), triggers the real ~6.97GB HF
# download+checksum, loads into bundled Ollama, then calls Ollama directly for ONE real completion.
# 20GB sandbox (12B model won't load in 8GB). Per-step error reporting. Pure ASCII, PS5.1 only.
$ErrorActionPreference='Continue'
$Repo='C:\dev\Codex\civicsuite'; $Branch='stage-3a-baremetal-windows'
$VDir=Join-Path $Repo 'test-comms\vmhost-beelink'
$Result=Join-Path $VDir 'VMHOST-RESULT-014.md'; $Live=Join-Path $VDir 'VMHOST-LIVE-014.md'
$TestDir='C:\CivicSuiteCleanTest014'; $RunId='28253830442'; $RepoSlug='CivicSuite/civicsuite'

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  foreach ($p in @("$env:ProgramFiles\Git\cmd","$env:ProgramFiles\Git\bin","$env:LOCALAPPDATA\Programs\Git\cmd")) {
    if (Test-Path (Join-Path $p 'git.exe')) { $env:PATH="$p;$env:PATH"; break } } }
Set-Location $Repo
git fetch origin $Branch --force 2>&1 | Out-Null
git checkout -f -B $Branch FETCH_HEAD 2>&1 | Out-Null

$script:logLines=New-Object System.Collections.ArrayList
function Stamp { (Get-Date).ToString('HH:mm:ss') }
function Push-Live { param([string]$line)
  if ($line) { [void]$script:logLines.Add("[$(Stamp)] $line"); Write-Host "[$(Stamp)] $line" }
  $hdr=@("# VMHOST-LIVE-014 - full first-run + model + completion (LIVE)","","Machine: $env:COMPUTERNAME   Updated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')","Refresh to watch. Model download is the long step.","",'```')
  $body=$hdr+$script:logLines+@('```')
  Set-Location $Repo
  git fetch origin $Branch --force 2>&1 | Out-Null
  git checkout -f -B $Branch FETCH_HEAD 2>&1 | Out-Null
  Set-Content -Path $Live -Value ($body -join "`r`n") -Encoding UTF8
  git add -- $Live 2>&1 | Out-Null
  git -c user.name='vmhost-runner' -c user.email='vmhost@localhost' commit -m "vmhost: live 014 $(Stamp)" 2>&1 | Out-Null
  git push origin "HEAD:$Branch" 2>&1 | Out-Null }
function Push-Result { param([string]$body)
  Set-Location $Repo
  git fetch origin $Branch --force 2>&1 | Out-Null
  git checkout -f -B $Branch FETCH_HEAD 2>&1 | Out-Null
  Set-Content -Path $Result -Value $body -Encoding UTF8
  git add -- $Result 2>&1 | Out-Null
  git -c user.name='vmhost-runner' -c user.email='vmhost@localhost' commit -m "vmhost: result 014 first-run+model+completion" 2>&1 | Out-Null
  git push origin "HEAD:$Branch" 2>&1 | Out-Null }

if (Test-Path $Result) { $e=Get-Content $Result -Raw -ErrorAction SilentlyContinue; if ($e -match 'VERDICT|PASS|FAIL') { Write-Host 'done'; exit 0 } }

Push-Live "Directive 014 started (full first-run + 7GB model + real completion). Checking Sandbox + build..."
$feat=Get-WindowsOptionalFeature -Online -FeatureName 'Containers-DisposableClientVM' -ErrorAction SilentlyContinue
if (-not $feat -or $feat.State -ne 'Enabled') { Push-Result "# VMHOST-RESULT-014 - FAIL: Sandbox not enabled."; exit 1 }
$run=(gh api "repos/$RepoSlug/actions/runs/$RunId" 2>&1 | ConvertFrom-Json)
if ($run.status -ne 'completed' -or $run.conclusion -ne 'success') { Push-Live "Build not green. Retry next tick."; exit 0 }

if (Test-Path $TestDir) { Remove-Item $TestDir -Recurse -Force -ErrorAction SilentlyContinue }
New-Item -ItemType Directory -Path $TestDir -Force | Out-Null
Push-Live "Downloading MSI (gh run download)..."
$dl=Join-Path $TestDir 'artifact'; New-Item -ItemType Directory -Path $dl -Force | Out-Null
gh run download $RunId --repo $RepoSlug -n 'civicsuite-windows-local-msi' -D $dl 2>&1 | Out-Null
$msi=Get-ChildItem $dl -Filter '*.msi' -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $msi) { Push-Result "# VMHOST-RESULT-014 - FAIL: no MSI in artifact."; exit 0 }
Push-Live "MSI ready: $($msi.Name) ($([math]::Round($msi.Length/1MB)) MB). Copying into Sandbox folder..."
Copy-Item -LiteralPath $msi.FullName -Destination $TestDir -Force

$sbx=Join-Path $TestDir 'sandbox-test.ps1'
Set-Content -Path $sbx -Encoding ASCII -Value @'
$ErrorActionPreference='Continue'
$dir='C:\Users\WDAGUtilityAccount\Desktop\civictest'
$prog=Join-Path $dir 'sandbox-progress.txt'
$pass=$true
function P($s){ $l='['+(Get-Date -Format 'HH:mm:ss')+'] '+$s; Add-Content -Path $prog -Value $l -Encoding ASCII; Write-Host $l }
Set-Content -Path $prog -Value '' -Encoding ASCII

# ---- install ----
P 'Installing MSI (1.5GB runtime)...'
$msi=Get-ChildItem $dir -Filter '*.msi' | Select-Object -First 1
$ip=Start-Process msiexec.exe -ArgumentList @('/i',('"'+$msi.FullName+'"'),'/quiet','/norestart') -Wait -PassThru
P ('INSTALL exit: '+$ip.ExitCode); if ($ip.ExitCode -ne 0){ P 'FAIL install'; Set-Content (Join-Path $dir 'sandbox-result.txt') 'FAIL' -Encoding ASCII; shutdown.exe /s /t 2; return }
$exe=Get-ChildItem "$env:ProgramFiles\CivicSuite" -Filter '*.exe' -ErrorAction SilentlyContinue | Where-Object { $_.Name -notlike 'unins*' } | Select-Object -First 1
if (-not $exe){ P 'FAIL: no exe'; Set-Content (Join-Path $dir 'sandbox-result.txt') 'FAIL' -Encoding ASCII; shutdown.exe /s /t 2; return }

# ---- launch with CDP ----
$env:WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS='--remote-debugging-port=9222'
P 'Launching app with WebView2 CDP...'
$app=Start-Process $exe.FullName -PassThru
$wsUrl=$null
for($i=1;$i -le 24;$i++){ try { $t=Invoke-RestMethod 'http://127.0.0.1:9222/json/list' -TimeoutSec 5 } catch { $t=$null }
  if ($t){ $pg=$t | Where-Object { $_.type -eq 'page' -and $_.webSocketDebuggerUrl } | Select-Object -First 1; if ($pg){ $wsUrl=$pg.webSocketDebuggerUrl; break } }
  Start-Sleep -Seconds 5 }
if (-not $wsUrl){ P 'FAIL: no CDP page target'; Set-Content (Join-Path $dir 'sandbox-result.txt') 'FAIL' -Encoding ASCII; shutdown.exe /s /t 2; return }
P ('CDP page connected: '+$wsUrl)

# ---- CDP eval helper ----
function Cdp($expr,$timeoutSec){
  $ws=New-Object System.Net.WebSockets.ClientWebSocket
  try { $ws.ConnectAsync([Uri]$wsUrl,[Threading.CancellationToken]::None).Wait(20000) | Out-Null } catch { return @{ok=$false;e='ws connect failed: '+$_.Exception.Message} }
  $id=Get-Random -Minimum 1 -Maximum 999999
  $req=@{ id=$id; method='Runtime.evaluate'; params=@{ expression=$expr; awaitPromise=$true; returnByValue=$true } } | ConvertTo-Json -Depth 8 -Compress
  $b=[Text.Encoding]::UTF8.GetBytes($req)
  $ws.SendAsync((New-Object System.ArraySegment[byte] (,$b)),'Text',$true,[Threading.CancellationToken]::None).Wait(20000) | Out-Null
  $deadline=(Get-Date).AddSeconds($timeoutSec); $sb=New-Object Text.StringBuilder; $buf=New-Object byte[] 131072; $out=$null
  while((Get-Date) -lt $deadline){
    $seg=New-Object System.ArraySegment[byte] (,$buf)
    $rt=$ws.ReceiveAsync($seg,[Threading.CancellationToken]::None)
    $ms=[int][math]::Max(1000,[math]::Min(60000,($deadline-(Get-Date)).TotalMilliseconds))
    if (-not $rt.Wait($ms)){ continue }
    $r=$rt.Result; [void]$sb.Append([Text.Encoding]::UTF8.GetString($buf,0,$r.Count))
    if ($r.EndOfMessage){ $j=$sb.ToString(); $sb.Clear()|Out-Null; try{$o=$j|ConvertFrom-Json}catch{$o=$null}; if ($o -and $o.id -eq $id){ $out=$o; break } } }
  try{ $ws.Dispose() }catch{}
  if (-not $out){ return @{ok=$false;e='cdp timeout'} }
  if ($out.result.exceptionDetails){ return @{ok=$false;e=('js exception: '+($out.result.exceptionDetails|ConvertTo-Json -Compress))} }
  return @{ok=$true;value=$out.result.result.value}
}
function InvokeIpc($cmd,$argsJson,$timeoutSec){
  $expr="(async()=>{try{const r=await window.__TAURI_INTERNALS__.invoke('"+$cmd+"',"+$argsJson+");return JSON.stringify({ok:true,r:r});}catch(e){return JSON.stringify({ok:false,e:String(e)});}})()"
  $res=Cdp $expr $timeoutSec
  if (-not $res.ok){ return @{ok=$false;e=$res.e} }
  try { $v=$res.value | ConvertFrom-Json } catch { return @{ok=$false;e=('bad json: '+$res.value)} }
  return $v
}
function Step($cmd,$argsJson,$label,$timeoutSec){
  P ($label+' ...')
  $r=InvokeIpc $cmd $argsJson $timeoutSec
  if (-not $r.ok){ P ('  FAIL '+$label+': '+$r.e); $script:pass=$false; return $false }
  $acc=$true; if ($r.r -and ($r.r.PSObject.Properties.Name -contains 'accepted')){ $acc=$r.r.accepted }
  $st=''; if ($r.r -and ($r.r.PSObject.Properties.Name -contains 'status')){ $st=$r.r.status }
  if (-not $acc){ P ('  REJECTED '+$label+': status='+$st+' msg='+$r.r.message); $script:pass=$false; return $false }
  P ('  OK '+$label+' (status='+$st+')'); return $true
}

$ir='C:\Users\WDAGUtilityAccount\AppData\Local\CivicSuite'
$loc='{"installRoot":"'+($ir -replace '\\','\\')+'","dataRoot":"'+(($ir+'\Data') -replace '\\','\\')+'","backupRoot":"C:\\Users\\WDAGUtilityAccount\\Documents\\CivicSuite Backups"}'
$adminEmail='admin@testville.gov'; $adminPass='CivicAdmin2026!'

if ($pass){ Step 'first_run_action' '{"action":"review","stepId":"unsigned-beta","payload":{}}' 'Step: unsigned-beta notice' 60 | Out-Null }
if ($pass){ Step 'first_run_action' '{"action":"review","stepId":"smartscreen","payload":{}}' 'Step: smartscreen' 60 | Out-Null }
if ($pass){ Step 'first_run_action' ('{"action":"choose-location","stepId":"locations","payload":'+$loc+'}') 'Step: locations' 120 | Out-Null }
if ($pass){ Step 'first_run_action' '{"action":"select-modules","stepId":"modules","payload":{"profileId":"city-core"}}' 'Step: select city-core modules' 120 | Out-Null }
if ($pass){ Step 'first_run_action' '{"action":"create-city-profile","stepId":"city-profile","payload":{"cityName":"Testville","state":"OR","timeZone":"America/Los_Angeles","recordsContact":"records@testville.gov","clerkContact":"clerk@testville.gov"}}' 'Step: city profile' 120 | Out-Null }
if ($pass){ Step 'first_run_action' ('{"action":"create-admin","stepId":"first-admin","payload":{"adminName":"Test Admin","adminEmail":"'+$adminEmail+'","adminPasscode":"'+$adminPass+'"}}') 'Step: create first admin' 120 | Out-Null }
if ($pass){ Step 'auth_action' ('{"action":"sign-in","payload":{"email":"'+$adminEmail+'","passcode":"'+$adminPass+'"}}') 'Sign in as admin' 120 | Out-Null }
if ($pass){ Step 'first_run_action' ('{"action":"choose-backup","stepId":"backup","payload":'+$loc+'}') 'Step: backup default' 120 | Out-Null }
if ($pass){ P 'Step: DOWNLOAD MODEL (~6.97GB from Hugging Face + checksum - the long step; host heartbeats while this runs)'; Step 'first_run_action' '{"action":"download-model","stepId":"model","payload":{}}' 'download-model' 3600 | Out-Null }
if ($pass){ Step 'model_action' '{"action":"load-runtime-model"}' 'Load model into Ollama runtime' 1200 | Out-Null }
if ($pass){ Step 'first_run_action' '{"action":"verify-health","stepId":"health","payload":{}}' 'Step: health verification' 600 | Out-Null }
if ($pass){ Step 'first_run_action' '{"action":"open-app","stepId":"finish","payload":{}}' 'Step: finish / open-app' 120 | Out-Null }

# ---- confirm finished ----
$finished=$false
$gs=InvokeIpc 'get_app_state' '{}' 60
if ($gs.ok -and $gs.r){ try { $finished=[bool]$gs.r.first_run.finished } catch {}; if (-not $finished){ try { $finished=[bool]$gs.r.finished } catch {} } }
P ('First-run finished flag: '+$finished); if (-not $finished){ $pass=$false }

# ---- real completion via bundled Ollama (direct, proves real inference) ----
$completion=''
try {
  $tags=Invoke-RestMethod 'http://127.0.0.1:15434/api/tags' -TimeoutSec 30
  $mdl=$null; if ($tags -and $tags.models){ $mdl=$tags.models[0].name }
  if ($mdl){
    P ('Ollama model loaded: '+$mdl+' -> requesting one real completion (CPU inference, can take minutes)...')
    $body=@{ model=$mdl; prompt='Reply with one short sentence confirming you are running.'; stream=$false } | ConvertTo-Json -Compress
    $gen=Invoke-RestMethod 'http://127.0.0.1:15434/api/generate' -Method Post -Body $body -ContentType 'application/json' -TimeoutSec 900
    if ($gen -and $gen.response){ $completion=($gen.response -replace '\s+',' ').Trim() }
    if ($completion){ P ('REAL COMPLETION: '+$completion) } else { P 'FAIL: empty completion'; $pass=$false }
  } else { P 'FAIL: no model in Ollama /api/tags'; $pass=$false }
} catch { P ('FAIL: Ollama completion error: '+$_.Exception.Message); $pass=$false }

$v= if ($pass){'PASS'} else {'FAIL'}
P ('VERDICT: '+$v)
Set-Content -Path (Join-Path $dir 'sandbox-result.txt') -Value $v -Encoding ASCII
Set-Content -Path (Join-Path $dir 'completion.txt') -Value $completion -Encoding ASCII
Start-Sleep -Seconds 5
shutdown.exe /s /t 2
'@

$wsb=Join-Path $TestDir 'civicsuite-test.wsb'
Set-Content -Path $wsb -Encoding ASCII -Value ("<Configuration><MemoryInMB>20480</MemoryInMB><MappedFolders><MappedFolder><HostFolder>"+$TestDir+"</HostFolder><SandboxFolder>C:\Users\WDAGUtilityAccount\Desktop\civictest</SandboxFolder><ReadOnly>false</ReadOnly></MappedFolder></MappedFolders><LogonCommand><Command>powershell.exe -ExecutionPolicy Bypass -NonInteractive -WindowStyle Minimized -File C:\Users\WDAGUtilityAccount\Desktop\civictest\sandbox-test.ps1</Command></LogonCommand></Configuration>")

$progP=Join-Path $TestDir 'sandbox-progress.txt'; $resP=Join-Path $TestDir 'sandbox-result.txt'; $cmpP=Join-Path $TestDir 'completion.txt'
foreach ($f in @($progP,$resP,$cmpP)){ if (Test-Path $f){ Remove-Item $f -Force -ErrorAction SilentlyContinue } }

Push-Live "Launching Windows Sandbox (20 GB). Full first-run + 7GB model download + real completion run automatically; steps stream below."
Start-Process -FilePath 'C:\Windows\System32\WindowsSandbox.exe' -ArgumentList $wsb -ErrorAction SilentlyContinue | Out-Null
Push-Live "Sandbox launched. Streaming in-Sandbox steps (download is the long blocking step; heartbeat continues)..."
$start=Get-Date; $deadline=$start.AddMinutes(80); $last=0; $beat=Get-Date; $sr=$null
while ((Get-Date) -lt $deadline) {
  Start-Sleep -Seconds 18
  $new=@()
  if (Test-Path $progP){ $all=Get-Content $progP -ErrorAction SilentlyContinue | Where-Object { $_ -ne '' }; if ($all.Count -gt $last){ $new=$all[$last..($all.Count-1)]; $last=$all.Count } }
  if ($new.Count -gt 0){ foreach ($n in $new){ [void]$script:logLines.Add('    SANDBOX> '+$n) }; Push-Live $null; $beat=Get-Date }
  elseif (((Get-Date)-$beat).TotalSeconds -ge 60){ Push-Live ("...working (elapsed "+[int]((Get-Date)-$start).TotalSeconds+"s; model download/inference is slow on CPU)"); $beat=Get-Date }
  if (Test-Path $resP){ Start-Sleep -Seconds 3; $sr=(Get-Content $resP -Raw -ErrorAction SilentlyContinue).Trim(); break }
}
if (-not $sr){ Push-Live 'No verdict within 80 min -> FAIL.'; $sr='FAIL (timeout)' }
$fp=''; if (Test-Path $progP){ $fp=Get-Content $progP -Raw -ErrorAction SilentlyContinue }
$cmp=''; if (Test-Path $cmpP){ $cmp=(Get-Content $cmpP -Raw -ErrorAction SilentlyContinue) }
$v= if ($sr -match '^PASS'){'PASS'} else {'FAIL'}
Push-Live "Sandbox finished. Verdict: $v. Writing RESULT-014."
Push-Result @"
# VMHOST-RESULT-014 - Full first-run + 6.97GB model + real completion (Criticals #2 & #3): $v

Machine: $env:COMPUTERNAME   Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
MSI: $($msi.Name)  from CI run $RunId   Method: Windows Sandbox 20 GB, fresh Windows
Drove the REAL first-run IPC over CDP (unsigned-beta -> smartscreen -> locations -> modules -> city-profile -> create-admin -> sign-in -> backup -> download-model -> load-runtime-model -> verify-health -> finish), then called the bundled Ollama directly for one real completion.
Real model completion captured: $cmp

## Step-by-step transcript (inside the Sandbox)
``````
$fp
``````
Live: VMHOST-LIVE-014.md
"@
Push-Live "DONE. Verdict: $v"
