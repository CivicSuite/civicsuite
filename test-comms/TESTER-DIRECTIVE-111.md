# TESTER-DIRECTIVE-111 — Settle the city-profile A/B question, then drive Windows Local 1.0.0 first-run to completion via reliable WebView2 (CDP) automation

## Purpose

The published Windows Local **1.0.0** MSI installs clean, but the interactive first-run wizard
*appears* to dead-end after the **modules** step. A human clicked through review → smartscreen →
locations → modules, then stopped "once all the buttons had been clicked" with no visible
indicators, and left before confirming whether the **city-profile** form
(City name / State / Time zone / Records contact / Clerk contact) renders.

Verified against `main` this session (`main.js` 6078 lines, `first_run.rs` 1403 lines,
`model.rs` 2493 lines, `supervisor.rs` 4732 lines, runtime JSON):

- The Rust backend derives `current_step_id` as **the first manifest step not in `completed`**
  (`first_run.rs:336-341`). The box's `completed=[unsigned-beta, smartscreen, locations, modules]`,
  so `current_step_id` **must equal `city-profile`** and `steps[city-profile].current === true`.
  This is pure config/JSON — **no Postgres/Ollama/ports** are involved until the `health` step.
- The city-profile form renders **iff** `step.current === true` (`main.js` `renderSetupFields`
  ~L1158 `if (!step.current) return ''`; inputs L1175-1179; Save button L1227-1233, label
  "Save city profile" per `setupActionLabel` L1035).
- There is **no admin gate** on city-profile pre-admin: `adminOnlyControlLocked()` =
  `access.configured && role !== "local-admin"` (`main.js:1044-1047`); on the box no admin exists
  (`access.configured === false`, no `first-admin.json` per RESULT-110), so the Save button is
  **enabled** with no precondition.
- **The backend `first_run_action` has NO sign-in/role check.** `action_blocks_until_runtime`
  always returns `None` (`first_run.rs:629-633`); the only backend gates are step-ordering
  (`missing_prior_required_steps`) and, for `verify-health`, the verified-model + runtime checks.
  The "sign in as administrator" gate is **purely a frontend `disabled` attribute** via
  `adminOnlyControlLocked()`. **There is no Err string `"Sign in as the local administrator…"` in
  the backend** — do not hunt for one. Consequence: a `.click()` on a *disabled* button is a no-op,
  so sign-in (Stage B3) is genuinely required to **enable** the backup/model/health buttons before
  they can be clicked through the real UI.
- The code (`main.js`, `first_run.rs`, `windows-first-run.json`) is **byte-identical** between the
  D107 build that "passed" full first-run and released 1.0.0 — **not a code regression**. Leading
  hypothesis: D107's harness drove the Tauri backend commands **directly** and never exercised real
  WebView UI navigation; the human is the first to drive the true UI.
- RESULT-109 proved `WM_LBUTTONDOWN`/`WM_CHAR` to the WebView2 child window are **ignored** by
  Edge-Chromium. We must drive via **CDP `Runtime.evaluate` + `Input.dispatchMouseEvent`**
  (primary), **UIA `InvokePattern`/`ValuePattern`** (no-relaunch fallback), **SendInput** (last
  resort).

**This directive:** **(Stage A)** relaunch the installed app with WebView2 remote-debugging
enabled and **FIRST capture the DECISIVE A/B evidence** (backend `steps[].current` flags **and**
the live `.first-run-list` DOM **and** console), write it verbatim into TESTER-RESULT-111, and
**commit+push it to the branch BEFORE driving anything**. **(Stage B)** drive first-run to
completion via reliable CDP automation. **(Stage C)** prove the full post-first-run lifecycle with
marker `D111-AI-MODEL-MARKER-20260625`. If first-run still cannot be advanced even with CDP + UIA +
SendInput, that confirms a **REAL product bug** → **Verdict: FAIL** (classification:
`first-run UI dead-end`) with the exact failing element + console.

---

## STOP / LIMITS BANNER

> **STOP — READ BEFORE ANYTHING ELSE.**
> - **NEVER REBOOT THE BOX.** Operator is unattended; a reboot loses hours. No `Restart-Computer`,
>   no `shutdown`, no logoff, no driver/Windows-Update action that forces a restart. `/norestart`
>   **and** `REBOOT=ReallySuppress MSIRESTARTMANAGERCONTROL=Disable` on every msiexec. If anything
>   wants a reboot — including an MSI exit **3010** or a set reboot-pending flag — **STOP and record
>   it as an `environment/blocker`. Do NOT reboot. Do NOT retry.**
> - **Continue from the box's CURRENT state** (1.0.0 installed; first-run done through `modules`;
>   app closed). **Do NOT wipe or reinstall** unless an unrecoverable state truly requires it (see
>   the wipe decision rule in Hard Limits) — and even then, **no reboot**.
> - **Push only to `stage-3a-baremetal-windows`.** **No merge to `main`. No force-push. No other
>   branch.**
> - **No OneDrive** (policy-killed on this box; do not reinstall, re-enable, or write backups into a
>   OneDrive-synced path).
> - **Capture FIRST, drive SECOND, and make capture DURABLE.** The Stage A A/B evidence block must
>   be written to the result file **and committed+pushed** before any field is filled or any button
>   is clicked.
> - Bind CDP to **`127.0.0.1` only**. Prefer the **env-var launch only**; do **not** set any Edge
>   policy registry key. If you must set any registry override, wrap it in PowerShell
>   `try { … } finally { Remove-Item … }` so cleanup runs even on abort.
> - The box's "Codex" composer is **non-admin** (medium integrity, MSIX); the MSI self-elevates its
>   own PowerShell. Stay within user scope except for the MSI itself.

---

## Communication channel

Channel = repo `CivicSuite/civicsuite`, branch **`stage-3a-baremetal-windows`**, directory
**`test-comms/`**. Result file = **`test-comms/TESTER-RESULT-111.md`**. All evidence artifacts go
under **`directive111-evidence/`** (reference by relative path from the result file).

**Before doing anything** (record raw output into the result file). **Do NOT `git reset --hard`** —
it would silently destroy any local-only RESULT-110/111 work on the box. Use a safe, non-destructive
sync:

```powershell
# Confirm clean, tokenless remote (Git limit)
git remote get-url origin    # must be https://github.com/CivicSuite/civicsuite.git, no embedded token

git ls-remote https://github.com/CivicSuite/civicsuite.git stage-3a-baremetal-windows
git fetch origin stage-3a-baremetal-windows
Get-Content .git\FETCH_HEAD   # record FETCH_HEAD BEFORE

# Preserve any local-only work first, then fast-forward ONLY.
git branch "backup/pre-111-$(Get-Date -Format yyyyMMdd-HHmmss)"   # snapshot current HEAD
git stash push -u -m "pre-111 local artifacts" 2>$null
git checkout stage-3a-baremetal-windows
git merge --ff-only origin/stage-3a-baremetal-windows
# If ff-only FAILS (local divergence), STOP and report divergence in the result file.
# Do NOT hard-reset. Inspect the backup branch / stash before any further action.
```

Read the latest directive/results in `test-comms/` for full context, then proceed.

**After completing the run** (before final push), re-record the channel head:

```powershell
git fetch origin stage-3a-baremetal-windows
Get-Content .git\FETCH_HEAD   # record FETCH_HEAD AFTER
```

**Push discipline (assert before every push; non-force only):**

```powershell
$b = git rev-parse --abbrev-ref HEAD
if ($b -ne 'stage-3a-baremetal-windows') { throw "WRONG BRANCH $b — refuse to push" }
git add test-comms/TESTER-RESULT-111.md directive111-evidence
git commit -m "TESTER-RESULT-111: <stage> (stage-3a-baremetal-windows)"
git push origin stage-3a-baremetal-windows     # NEVER -f / --force
```

---

## STAGE A — Relaunch with CDP and capture the DECISIVE A/B evidence (capture FIRST, do not drive)

### A0. Pre-state snapshot (read-only) + full config backup

Back up the **entire** config dir before any process kill (a forced kill during a JSON write can
corrupt the only A/B evidence source):

```powershell
$cfg = "$env:LOCALAPPDATA\CivicSuite\config"
New-Item -ItemType Directory -Force "directive111-evidence\A0-config-backup" | Out-Null
Copy-Item "$cfg\*" "directive111-evidence\A0-config-backup\" -Recurse -Force -EA SilentlyContinue
Get-ChildItem $cfg | Out-File "directive111-evidence\A0-config-listing.txt"
# expect: first-run-progress.json completed=[unsigned-beta,smartscreen,locations,modules];
#         last_action=select-modules; locations.json; module-selection.json; NO first-admin.json
```

### A1. Relaunch the installed app with WebView2 remote-debugging enabled

Set the env var in the **same** PowerShell process, **before** launch, and include
**`--remote-allow-origins=http://127.0.0.1:9222`** (an **explicit** origin matching the `Origin`
header the helper sends — current Edge may reject `*`). Relaunch preserves first-run state (the
`EBWebView` user-data folder and `…\CivicSuite\config` are untouched), so this **continues from
"modules done"** — no wipe.

```powershell
# Locate the installed exe (do NOT assume one path)
$exe = Get-ChildItem `
  "$env:LOCALAPPDATA\Programs\CivicSuite\civicsuite-desktop.exe",
  "$env:LOCALAPPDATA\CivicSuite\civicsuite-desktop.exe",
  "$env:ProgramFiles\CivicSuite\civicsuite-desktop.exe",
  "${env:ProgramFiles(x86)}\CivicSuite\civicsuite-desktop.exe" -EA SilentlyContinue |
  Select-Object -First 1 -Expand FullName
if (-not $exe) {
  $exe = (Get-ChildItem "$env:LOCALAPPDATA" -Recurse -Filter civicsuite-desktop.exe -EA SilentlyContinue |
          Select-Object -First 1).FullName
}
$exe | Out-File "directive111-evidence\A1-exe-path.txt"

# Close any stale instance GRACEFULLY first so it doesn't hold the user-data lock; -Force only on timeout.
$p = Get-Process civicsuite-desktop -EA SilentlyContinue
if ($p) {
  $p.CloseMainWindow() | Out-Null
  if (-not $p.WaitForExit(8000)) { $p | Stop-Process -Force }   # graceful, NEVER reboot
}
Start-Sleep -Milliseconds 800

$port = 9222
$env:WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS = "--remote-debugging-port=$port --remote-allow-origins=http://127.0.0.1:$port --force-renderer-accessibility"
Start-Process -FilePath $exe
Start-Sleep -Seconds 6   # let WebView2 + Tauri backend + first-run state load
```

`--force-renderer-accessibility` pre-builds the Chromium a11y tree so the UIA fallback (A5) works if
needed. **Do not set any Edge policy registry key** (policy keys are a system-policy surface and may
not be cleaned up on abort). If the env var truly does not take effect, the only acceptable registry
fallback is the non-policy per-app loader key wrapped in `try/finally` cleanup — but try env-var
twice first.

### A2. Discover the CDP page target

```powershell
$port = 9222
try { Invoke-RestMethod "http://127.0.0.1:$port/json/version" | Out-File "directive111-evidence\A2-cdp-version.json" }
catch { "CDP /json/version unreachable: $_" | Out-File "directive111-evidence\A2-cdp-version.json" }
$targets = Invoke-RestMethod "http://127.0.0.1:$port/json"
$targets | ConvertTo-Json -Depth 6 | Out-File "directive111-evidence\A2-cdp-targets.json"
$page = $targets | Where-Object { $_.type -eq 'page' -and $_.url -notmatch 'devtools://' } | Select-Object -First 1
if (-not $page) { $page = $targets | Where-Object { $_.type -eq 'page' } | Select-Object -First 1 }  # fallback (tauri://localhost etc.)
$wsUrl = $page.webSocketDebuggerUrl
$wsUrl | Out-File "directive111-evidence\A2-ws-url.txt"
```

If `/json` returns nothing usable (released build stripped CDP), **skip to A5 (UIA fallback
capture)** and note it; do not stall.

### A3. CDP helper (robust WebSocket workhorse)

PowerShell 5.1 has `System.Net.WebSockets.ClientWebSocket` built in. The helper **matches replies by
`id`, skips async notification frames, and wraps `.Wait()` so a stall throws instead of hanging.**

```powershell
$script:cdpId = 0
function Invoke-Cdp {
  param([string]$WsUrl, [string]$Expression, [int]$TimeoutSec = 120)
  $ws  = [System.Net.WebSockets.ClientWebSocket]::new()
  $ws.Options.SetRequestHeader("Origin","http://127.0.0.1:9222")  # must match --remote-allow-origins
  $cts = [System.Threading.CancellationTokenSource]::new([TimeSpan]::FromSeconds($TimeoutSec))
  try { $ws.ConnectAsync([Uri]$WsUrl, $cts.Token).Wait() }
  catch { return "CDP-CONNECT-FAILED: $($_.Exception.InnerException.Message)" }   # surfaces the 403/101 status
  $id = ++$script:cdpId
  $msg = @{ id=$id; method="Runtime.evaluate"; params=@{
            expression=$Expression; returnByValue=$true; awaitPromise=$true } } |
         ConvertTo-Json -Depth 12 -Compress
  $buf = [System.Text.Encoding]::UTF8.GetBytes($msg)
  $ws.SendAsync([ArraySegment[byte]]::new($buf),
      [System.Net.WebSockets.WebSocketMessageType]::Text, $true, $cts.Token).Wait()
  $rcv = [byte[]]::new(131072); $result = $null
  while ($true) {
    $sb = [System.Text.StringBuilder]::new()
    do {
      $r = $ws.ReceiveAsync([ArraySegment[byte]]::new($rcv), $cts.Token)
      try { $r.Wait() } catch { return "CDP-RECV-FAILED: $($_.Exception.InnerException.Message)" }
      [void]$sb.Append([System.Text.Encoding]::UTF8.GetString($rcv,0,$r.Result.Count))
    } until ($r.Result.EndOfMessage)
    $obj = $sb.ToString() | ConvertFrom-Json
    if ($obj.id -eq $id) { $result = $obj; break }   # ignore notification frames (no .id / other id)
  }
  $ws.CloseAsync([System.Net.WebSockets.WebSocketCloseStatus]::NormalClosure,"",$cts.Token).Wait()
  if ($result.error) { return "CDP-EVAL-ERROR: $($result.error | ConvertTo-Json -Compress)" }
  return $result.result.result.value
}
```

Verify the very first `Invoke-Cdp` returns a real value (not a `CDP-*-FAILED` string). If it fails,
the WS upgrade 403'd — fix the origin/launch, do **not** silently route to UIA.

### A4. THE DECISIVE A/B PROBE — backend truth + scoped DOM truth + error sink (BEFORE driving)

**Critical scoping fix:** the identical selectors `input[data-setup-field="cityName"]` and
`button[data-first-run-action="create-city-profile"][data-step-id="city-profile"]` exist **twice** —
in the wizard (`main.js` L1175 / L1227) **and** in the Settings page `renderModules` (L4711 / L4716,
where the action is admin-locked). A global `querySelector` returns whichever is first in DOM order
(the Settings copy if `activeArea==="settings"`). So **every** city-profile selector is scoped to
`.first-run-list .first-run-step.current …`, the probe records `state.activeArea` via the DOM, and
it asserts how many `cityName` inputs exist. The probe also reads the **backend** via a 3-way invoke
fallback (the app imports `invoke` as an ES module and only exposes `__TAURI_INTERNALS__`; treat the
**DOM** as the primary A/B signal and the backend invoke as corroboration). An in-page error
collector is installed on this first probe and read back on later probes (a one-shot socket cannot
see async console events).

```powershell
$probe = @'
(async () => {
  // install persistent error sink once (read back on later probes)
  if (!window.__d111errors) {
    window.__d111errors = [];
    window.addEventListener('error', e => window.__d111errors.push('error: '+(e.message||e.type)));
    window.addEventListener('unhandledrejection', e => window.__d111errors.push('rejection: '+String(e.reason)));
  }
  // backend via 3-way fallback; record which path worked
  let app=null, err=null, via=null;
  const tries = [
    ['internals', () => window.__TAURI_INTERNALS__ && window.__TAURI_INTERNALS__.invoke && window.__TAURI_INTERNALS__.invoke('get_app_state')],
    ['core',      () => window.__TAURI__ && window.__TAURI__.core && window.__TAURI__.core.invoke && window.__TAURI__.core.invoke('get_app_state')],
    ['global',    () => window.__TAURI__ && window.__TAURI__.invoke && window.__TAURI__.invoke('get_app_state')]
  ];
  for (const [name, fn] of tries) {
    try { const r = fn(); if (r) { app = await r; via = name; break; } } catch(e){ err = (err? err+' | ':'')+name+': '+String(e); }
  }
  const fr = app && app.first_run ? app.first_run : null;
  const steps = (fr && fr.steps ? fr.steps : []).map(s => ({ id:s.id, current:s.current, completed:s.completed, status:s.status }));

  // DOM truth — SCOPED to the wizard's current step
  const scope = document.querySelector('.first-run-list .first-run-step.current') || document.querySelector('.first-run-list');
  const cityInput = scope ? scope.querySelector('input[data-setup-field="cityName"]') : null;
  const cs = cityInput ? getComputedStyle(cityInput) : null;
  const rect = cityInput ? cityInput.getBoundingClientRect() : null;
  const arts = [...document.querySelectorAll('.first-run-list .first-run-step')].map(a => ({
    h3: a.querySelector('h3') && a.querySelector('h3').textContent.trim(),
    isCurrent: a.classList.contains('current'),
    setupFields: [...a.querySelectorAll('[data-setup-field]')].map(i => i.getAttribute('data-setup-field'))
  }));
  return JSON.stringify({
    bridge: { internalsPresent: '__TAURI_INTERNALS__' in window, via, getAppStateError: err },
    activeArea: app ? app.active_area : null,            // backend-reported area if present
    backend: fr ? {
      currentId: fr.current_step_id, finished: fr.finished, status: fr.status,
      cityProfileCurrent: !!(steps.find(s=>s.id==='city-profile')||{}).current, steps
    } : null,
    dom: {
      listPresent: !!document.querySelector('.first-run-list'),
      cityNameInputCount_GLOBAL: document.querySelectorAll('input[data-setup-field="cityName"]').length, // >1 => settings copy in DOM
      currentStepH3: (document.querySelector('.first-run-list .first-run-step.current h3')||{}).textContent || null, // expect "City profile"
      articles: arts,
      cityProfileInputsScoped: ['cityName','state','timeZone','recordsContact','clerkContact']
        .map(f => ({ field:f, present: !!(scope && scope.querySelector('input[data-setup-field="'+f+'"]')) })),
      saveButtonScoped: !!(scope && scope.querySelector('button[data-first-run-action="create-city-profile"][data-step-id="city-profile"]')),
      saveButtonDisabled: scope && scope.querySelector('button[data-first-run-action="create-city-profile"]')
        ? scope.querySelector('button[data-first-run-action="create-city-profile"]').disabled : null,
      cityNameStyle: cityInput ? {
        display: cs.display, visibility: cs.visibility, opacity: cs.opacity,
        width: rect.width, height: rect.height, x: rect.x, y: rect.y,
        offsetParentNull: cityInput.offsetParent === null } : null
    },
    errors: window.__d111errors.slice(-50)
  }, null, 2);
})()
'@
$ab = Invoke-Cdp $wsUrl $probe
$ab | Out-File "directive111-evidence\A4-ab-decisive.json"

# Forensic raw markup + the text the human actually saw + any action banner:
Invoke-Cdp $wsUrl "document.querySelector('.first-run-list')?.outerHTML ?? '(none)'"   | Out-File "directive111-evidence\A4-first-run-list.html"
Invoke-Cdp $wsUrl "document.querySelector('.first-run-list')?.innerText ?? '(.first-run-list NOT FOUND)'" | Out-File "directive111-evidence\A4-first-run-list.txt"
Invoke-Cdp $wsUrl "document.querySelector('.action-result')?.innerText ?? '(no .action-result)'" | Out-File "directive111-evidence\A4-action-result.txt"
```

**Screenshot (CDP `Page.captureScreenshot`, base64 → file):**

```powershell
function Save-CdpScreenshot { param([string]$WsUrl, [string]$OutPath, [int]$TimeoutSec=60)
  $ws=[System.Net.WebSockets.ClientWebSocket]::new(); $ws.Options.SetRequestHeader("Origin","http://127.0.0.1:9222")
  $cts=[System.Threading.CancellationTokenSource]::new([TimeSpan]::FromSeconds($TimeoutSec))
  try { $ws.ConnectAsync([Uri]$WsUrl,$cts.Token).Wait() } catch { "screenshot connect failed: $_" | Out-File $OutPath; return }
  $send={param($m) $b=[Text.Encoding]::UTF8.GetBytes($m); $ws.SendAsync([ArraySegment[byte]]::new($b),'Text',$true,$cts.Token).Wait()}
  & $send (@{id=1;method="Page.enable"} | ConvertTo-Json -Compress)
  & $send (@{id=2;method="Page.captureScreenshot";params=@{format="png"}} | ConvertTo-Json -Compress)
  $rcv=[byte[]]::new(262144)
  while($true){ $sb=[Text.StringBuilder]::new()
    do { $r=$ws.ReceiveAsync([ArraySegment[byte]]::new($rcv),$cts.Token); $r.Wait()
         [void]$sb.Append([Text.Encoding]::UTF8.GetString($rcv,0,$r.Result.Count)) } until($r.Result.EndOfMessage)
    $o=$sb.ToString()|ConvertFrom-Json; if($o.id -eq 2){ [IO.File]::WriteAllBytes($OutPath,[Convert]::FromBase64String($o.result.data)); break } }
  $ws.CloseAsync('NormalClosure','',$cts.Token).Wait()
}
Save-CdpScreenshot $wsUrl "directive111-evidence\A4-screenshot.png"
```

If CDP is unavailable, the **UIA fallback capture (A5)** is required before driving.

### A5. UIA fallback capture (only if CDP unavailable)

Using `System.Windows.Automation`, **scope to the WebView2 child window**, walk with
`RawViewWalker` under a **depth cap (e.g. 25) and a wall-clock timeout (e.g. 30s)** — **never**
`FindAll(TreeScope.Descendants, TrueCondition)` on the whole window (it can deadlock mid-render).
Dump each element's `Name`/`ControlType`/`BoundingRectangle` to
`directive111-evidence\A5-uia-tree.txt`. An `Edit` named for "City name" (plus the four siblings)
and a `Button` "Save city profile" is the UIA analogue of the CDP probe. Take an OS screenshot
regardless.

### A6. WRITE THE A/B VERDICT INTO THE RESULT FILE, THEN COMMIT+PUSH (durable capture-first)

Map the captured evidence to the decision table and record the A/B determination **verbatim**.
**Drive the table off the step LABEL `City profile`** (`document.querySelector('.first-run-list
.first-run-step.current h3').textContent === "City profile"`), **not** the input label "City name".

| Backend (`currentId` / `cityProfileCurrent`) | Scoped DOM | Determination |
|---|---|---|
| `city-profile` / `true` | current-step H3 = "City profile"; 5 inputs present; `cityName` width>0, display≠none, `offsetParentNull===false`; Save present & **not disabled** | **B — product works, form needs typed input.** Proceed to Stage B. |
| `city-profile` / `true` | current-step H3 = "City profile", 5 inputs present & visible & Save enabled, **but after a real `.click()` AND a real `Input.dispatchMouseEvent` on Save the backend `currentId` stays `city-profile` and no `.action-result` appears** | **A — click never reaches `handleFirstRunAction` (event-binding/re-render bug).** **Verdict: FAIL**, classification `first-run UI dead-end`. Capture element + console errors. |
| `city-profile` / `true` | inputs **null / zero-size / hidden / off-screen** despite step `.current` | **A — real rendering bug.** Record `cityNameStyle` + screenshot; still attempt to drive to characterize, but **Verdict: FAIL** (`first-run UI dead-end`). |
| still `modules` / `false` (or no `.current`) | modules `.current`, no city-profile form | **A — backend did not advance / UI never re-rendered.** Re-issue `select-modules` via the **real `.first-run-list` DOM button** and re-probe `currentId`. Still stuck → **Verdict: FAIL** (`first-run UI dead-end`). |
| `first-admin` or later | city-profile shows completed | **B (stronger) — already advanced.** Resume Stage B from `currentId`. |
| `cityNameInputCount_GLOBAL > 1` and the wizard on screen is the **System Health / Settings** instance | access panel occludes the wizard after admin exists | **NOT a product dead-end** — this is the sign-in gate; classify `admin-gate stall`, navigate to **home**, sign in, and continue. Do not call FAIL. |
| `get_app_state` unreachable on all 3 paths / `backend` null | n/a | **DOM-primary** — make the A/B call from the scoped DOM + on-disk `first-run-progress.json` (A0 backup); dump `bridge.getAppStateError`; do **not** wipe; report before driving. |

> **Highest-value datapoint:** within `.first-run-list .first-run-step.current`, does
> `input[data-setup-field="cityName"]` exist, is it visible (width>0, display≠none,
> `offsetParentNull===false`), and is the current-step H3 `"City profile"`? **Yes → B (drive it).
> No → A (real bug, FAIL).**

**Now commit + push Stage A evidence and the A/B verdict block BEFORE Stage B** (get the decisive
evidence off the box durably, in case Stage B / the long Gemma download / bootstrap crashes):

```powershell
git add test-comms/TESTER-RESULT-111.md directive111-evidence
git commit -m "TESTER-RESULT-111: Stage A decisive A/B evidence (capture-first) (stage-3a-baremetal-windows)"
git push origin stage-3a-baremetal-windows
```

---

## STAGE B — Drive first-run to COMPLETION via reliable WebView2 automation

**Pin to the home-area wizard for ALL of B1-B7.** Before each action assert
`document.querySelector('.nav-item.active')?.textContent` (or the backend area) and that exactly one
`cityName` input is in scope; if navigation drifted to Settings/health, return to **home** first.
Never bypass a disabled button by calling `invoke("first_run_action", …)` directly — that would not
reproduce the human UI path (and on backup/model/health the *only* gate is the frontend `disabled`
attribute, so sign-in is what enables them).

**Channel order:** CDP page-context **`.click()`** on the real `[data-first-run-action]` button is
preferred (it runs `setupPayloadForStep(stepId)` → `invoke("first_run_action")` → `loadAppState()` →
`render()` exactly as a human click would, retiring the D107 "drove backend directly" gap). For the
city-profile Save click, **also** dispatch a real CDP `Input.dispatchMouseEvent` on the element rect
to conclusively retire the WM_ failure. If a button won't take a synthetic `.click()`, fall back to
**UIA `InvokePattern.Invoke()`**, then **SendInput** at the element rect.

**Inputs:** set via the native value setter **plus** a dispatched **`input`** event. The
`[data-setup-field]` and `[data-access-field]` listeners bind **only `input`** (`main.js` L4958,
L5012) — `change` is ignored, so **`input` alone is necessary and sufficient**; `.value` alone is
NOT captured. (A `change` event is harmless but not required — do not "optimize" to `change`-only.)
**JSON-encode values** before injecting into the JS string so an apostrophe/quote (e.g. a city name
"O'Brien") can never break the expression.

```powershell
function Set-Field { param($id,$val)
  $jsVal = ($val | ConvertTo-Json)   # safely quoted JS string literal
  $js = @"
(() => { const scope = document.querySelector('.first-run-list .first-run-step.current') || document;
  const el = scope.querySelector('input[data-setup-field="$id"]'); if(!el) return 'no-$id';
  const set = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
  set.call(el, $jsVal);
  el.dispatchEvent(new Event('input',{bubbles:true}));
  return 'set-$id'; })()
"@
  Invoke-Cdp $wsUrl $js
}
function Click-Action { param($action,$stepId)
  $js = @"
(() => { const scope = document.querySelector('.first-run-list .first-run-step.current') || document;
  const b = scope.querySelector('button[data-first-run-action="$action"][data-step-id="$stepId"]');
  if(!b) return 'no-button'; if(b.disabled) return 'DISABLED'; b.click(); return 'clicked-$action'; })()
"@
  Invoke-Cdp $wsUrl $js
}
function Current-Step { Invoke-Cdp $wsUrl "document.querySelector('.first-run-list .first-run-step.current h3')?.textContent?.trim() ?? '(none)'" }
function Action-Result { Invoke-Cdp $wsUrl "document.querySelector('.action-result')?.innerText ?? '(none)'" }
function Action-Blocked { Invoke-Cdp $wsUrl "!!document.querySelector('.action-result.blocked')" }   # failure = CLASS .blocked, not text
function Backend-Current { Invoke-Cdp $wsUrl "(async()=>{try{const a=await window.__TAURI_INTERNALS__.invoke('get_app_state');return a.first_run.current_step_id;}catch(e){return 'ERR:'+e;}})()" }
```

**After EVERY action:** re-read `Current-Step`, `Action-Result`, `Action-Blocked`, and
`Backend-Current`; save each round-trip to `directive111-evidence\B-step-<n>-*.txt`. **Failure is
the `.action-result.blocked` CSS class** (status text is "Needs attention"/"Setup incomplete"; there
is no literal "Blocked" status string for these steps) — read its `<strong>` (status) + `<span>`
(message) and fix the cause before retrying.

### B1. city-profile (current now) — TEST VALUES

```powershell
Set-Field cityName       "Cleanroom Test City"
Set-Field state          "WA"
Set-Field timeZone       "America/Los_Angeles"
Set-Field recordsContact "records@example.gov"
Set-Field clerkContact   "clerk@example.gov"
Click-Action create-city-profile city-profile   # label "Save city profile"
```

All five fields are hard-required (empty → backend `Err "Missing required setup field: <x>"`).
Confirm advance: `Current-Step` → "First admin"; `Backend-Current` → `first-admin`. **Also do the
real `Input.dispatchMouseEvent` cross-check** on this Save button (dispatch `mousePressed` +
`mouseReleased` at the element's bounding-rect center) and record that the backend advanced —
conclusively retiring the WM_ failure.

### B2. first-admin — TEST VALUES

```powershell
Set-Field adminName     "Cleanroom Admin"
Set-Field adminEmail    "admin@example.gov"
Set-Field adminPasscode "Cleanroom-Passcode-111!"   # local passcode
Click-Action create-admin first-admin               # label "Save first admin"
```

This persists `first-admin.json` and flips `access.configured = true`. Confirm `first-admin.json`
now exists under `…\CivicSuite\config` (it was **absent** in RESULT-110). **The instant this is
saved, `adminOnlyControlLocked()` becomes true → backup/model/health buttons render `disabled`. Do
B3 immediately, before any navigation.**

### B3. SIGN IN as the new admin — MANDATORY GATE (the second place the wizard appears to "dead-end")

Once `access.configured === true` and you are not signed in, `adminOnlyControlLocked()` returns true
so the backup/model/health primary buttons render with the **`disabled` attribute** and show the
lock text *"Use a local administrator account before changing setup, model, backup, restore, repair,
module, user, or runtime settings."* **This is a frontend button-disable, NOT a backend `Err`** —
sign-in is required to **enable** the buttons. Stay on **home** (`renderActiveArea` only bypasses the
sign-in gate for `activeArea === "home"`, L4844; on any other area the access panel replaces the
content). Assert `section.access-panel input[data-access-field="email"]` exists; if absent, navigate
home first.

```powershell
function Set-AuthField { param($field,$val)
  $jsVal = ($val | ConvertTo-Json)
  $js = @"
(() => { const el = document.querySelector('input[data-access-field="$field"]'); if(!el) return 'no-$field';
  const set = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
  set.call(el, $jsVal); el.dispatchEvent(new Event('input',{bubbles:true}));
  return 'set-$field'; })()
"@
  Invoke-Cdp $wsUrl $js
}
Set-AuthField email    "admin@example.gov"
Set-AuthField passcode "Cleanroom-Passcode-111!"
Invoke-Cdp $wsUrl "document.querySelector('button[data-auth-action=\"sign-in\"]')?.click(); 'sign-in'"
Start-Sleep -Seconds 2
Invoke-Cdp $wsUrl @'
(async()=>{const a=await window.__TAURI_INTERNALS__.invoke("get_app_state");
return JSON.stringify({signed_in:a.access?.signed_in,role:a.access?.role,configured:a.access?.configured});})()
'@ | Out-File "directive111-evidence\B3-signin.json"
```

Do not proceed until `signed_in===true` and `role==="local-admin"`.

### B4. backup — default

`backup` is now current and (after sign-in) unlocked. Leave `data-setup-field="backupRoot"` at its
pre-filled default (verify it is **not** a OneDrive-synced `Documents` path — OneDrive is policy-
killed here so `{documents}` should be local; record the resolved path). Click:

```powershell
Click-Action choose-backup backup     # label "Create backup folder"
```

Confirm advance to `model`; confirm the backup root folder exists.

### B5. model — download Gemma, verify SHA-256, load into Ollama

The wizard `download-model` action runs the resumable HF download + checksum path; the step
completes only when the artifact verifies. Expect **long runtime**. A network stall to Hugging Face
is an `environment/blocker`, **not** an "unrecoverable" condition — do **not** wipe/reinstall on a
download stall.

```powershell
Click-Action download-model model     # wizard button label "Download / Resume Model"
```

Granular control via the admin-gated `.model-panel` buttons (drive by `data-*`, never by visible
label): `data-model-action="resume-download"` (label "Download / Resume"), then
`data-model-action="verify-checksum"` ("Verify Checksum"), then
`data-model-action="load-runtime-model"` ("Load in Ollama").

**Verify the checksum on the EXACT pinned artifact — REQUIRED PASS GATE.** The pinned file is
`gemma-4-12b-it-qat-q4_0.gguf`; a partial download is `gemma-4-12b-it-qat-q4_0.gguf.part`; a sibling
`*.sha256.verified` marker holds the verified hash. Resolve the model dir from
`get_app_state().model` (it exposes the artifact path); prefer the literal filename and **exclude
`*.part`**.

```powershell
$expected = "faff1a63667fac17ac5e777f47114688fcefea96e220e211aaa8d62c2c4561f1"
$model = Get-ChildItem "$env:LOCALAPPDATA\CivicSuite" -Recurse -Filter "gemma-4-12b-it-qat-q4_0.gguf" -EA SilentlyContinue |
         Where-Object { $_.Name -notlike "*.part" } | Select-Object -First 1 -Expand FullName
$model | Out-File "directive111-evidence\B5-model-path.txt"
$h = (Get-FileHash $model -Algorithm SHA256).Hash.ToLower()
$h | Out-File "directive111-evidence\B5-sha256.txt"
if ($h -ne $expected) { "CHECKSUM MISMATCH: got $h expected $expected" | Out-File "directive111-evidence\B5-CHECKSUM-FAIL.txt" }
# corroborate via the .sha256.verified marker (its contents should equal $expected)
Get-ChildItem "$env:LOCALAPPDATA\CivicSuite" -Recurse -Filter "*.sha256.verified" -EA SilentlyContinue |
  ForEach-Object { "$($_.FullName): $(Get-Content $_.FullName -Raw)" } | Out-File "directive111-evidence\B5-verified-marker.txt"
```

`SHA-256` MUST equal `faff1a63667fac17ac5e777f47114688fcefea96e220e211aaa8d62c2c4561f1`. Confirm the
loaded tag (resolve `ollama.exe` from the runtime dir; expect `civicsuite-gemma4-12b-qat:q4_0`):

```powershell
$ollama = Get-ChildItem "$env:LOCALAPPDATA\CivicSuite" -Recurse -Filter ollama.exe -EA SilentlyContinue | Select-Object -First 1 -Expand FullName
& $ollama list 2>$null | Out-File "directive111-evidence\B5-ollama-list.txt"
```

### B6. health — set up services and model

```powershell
Click-Action verify-health health     # label "Set Up Services and Model"
```

Backend `verify-health` requires the verified model, then runs
`supervisor::bootstrap_required_runtime()` (install → start → health-verify) — **this is the single
point that provisions and starts the runtime.** Postgres on **15432**, bundled Ollama on **15434**,
runtime API on **15480**. Do **not** pre-start services before this step (the city-profile/admin/
backup steps are file-only; pre-starting buys nothing). Capture the bootstrap/supervisor output
verbatim. **After B6, check reboot-pending flags — if set, STOP and record `environment/blocker`;
never reboot:**

```powershell
foreach ($p in 15432,15434,15480) {
  $c=New-Object Net.Sockets.TcpClient; $ok=$false
  try { $c.Connect('127.0.0.1',$p); $ok=$c.Connected } catch {} finally { $c.Close() }
  "PORT $p: $ok" | Out-File "directive111-evidence\B6-ports.txt" -Append
}
Get-Process postgres,ollama,python -EA SilentlyContinue | Select-Object Name,Id | Out-File "directive111-evidence\B6-processes.txt"
# reboot-pending detection (report, NEVER act):
$pending = (Test-Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Component Based Servicing\RebootPending") -or
           ((Get-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager" -Name PendingFileRenameOperations -EA SilentlyContinue) -ne $null)
"RebootPending after B6: $pending" | Out-File "directive111-evidence\B6-reboot-pending.txt"
if ($pending) { "BLOCKER: reboot pending after bootstrap — STOP, do not reboot" | Out-File "directive111-evidence\B6-BLOCKER.txt" }
```

### B7. finish

```powershell
Click-Action open-app finish          # label "Finish setup"
```

Backend `open-app` marks `finish` complete; `first_run.finished` becomes `true` and the wizard
returns `""` (disappears). **PASS gate — all must hold (capture each):**

1. `get_app_state().city_profile` populated; `steps[city-profile].completed===true`.
2. `steps[first-admin].completed===true`; `access.signed_in===true`, `role==="local-admin"`;
   `first-admin.json` exists under `…\CivicSuite\config`.
3. `steps[backup].completed===true`; backup root exists (non-OneDrive path).
4. Runtime dir + Postgres data dir exist; ports **15432 + 15434 + 15480 LISTENING**;
   Postgres + Ollama + python runtime processes present (all absent in RESULT-110).
5. Gemma weights on disk; **SHA-256 === `faff1a63…`**; `ollama list` shows
   `civicsuite-gemma4-12b-qat:q4_0`; `steps[model].completed===true`.
6. `verify-health` all checks pass; `steps[health].completed===true`.
7. `first_run.finished===true`; `first-run-progress.json` `completed` contains all step ids through
   `finish`. Save the final `first-run-progress.json` to
   `directive111-evidence\B7-first-run-progress-final.json`.

Only when 1-7 hold is first-run **actually completed**; proceed to Stage C.

---

## STAGE C — Prove the lifecycle (marker `D111-AI-MODEL-MARKER-20260625`)

Admin is signed in; navigate areas via `[data-area]` nav clicks (each gated by `areaIsEnabled`).
The AI work-actions consume a **selected record's text** — they do **not** take a free-text prompt
field — and they are confirm-gated ("Review Before Generating…" → confirm). So the marker is
injected into the **source record** the model reads, then echoed/used in the draft. Capture every
artifact under `directive111-evidence\C-*`.

1. **CivicCore — model registry ready.** Confirm `get_app_state()` reports the Gemma model **ready**
   in the registry (registry status + the loaded `civicsuite-gemma4-12b-qat:q4_0` tag).
   → `C1-civiccore-registry.json`.
2. **CivicRecords — AI.** Navigate `[data-area="records"]`. Fill the request-intake form
   (`data-work-field="requester"` and the **`data-work-field="recordsSummary"` textarea containing
   `D111-AI-MODEL-MARKER-20260625`**), click `data-work-action="create-records-request"`, select the
   request, then run `data-work-action="suggest-records-response"` and confirm the guided-review
   ("Generate Draft"). Capture the generated draft showing the model ran (and that it reflects the
   marker-bearing summary). → `C2-civicrecords-suggest.txt`.
3. **CivicCode — AI.** Navigate `[data-area="code"]`. Fill `data-work-field="codeTitle"`,
   `data-work-field="codeCitation"`, and the **`data-work-field="codeBody"` textarea containing the
   marker**, click `data-work-action="import-code-source"`, select the source, then run
   `data-work-action="suggest-code-guidance"` and confirm ("Generate Guidance"). Capture output.
   → `C3-civiccode-suggest.txt`.
4. **CivicClerk — AI (CivicClerk/meetings).** Navigate `[data-area="meetings"]`; if
   `data-work-action="suggest-minutes-draft"` ("Generate Local AI Minutes", `main.js` L2991) is
   present for a created meeting, run it (seed an upstream meeting field with the marker) and capture
   output; else note "not exposed in 1.0.0 for this state". → `C4-civicclerk.txt`.
5. **CivicNotice — NO AI (falsifiable).** Navigate `[data-area="notice"]` and assert the area's
   `[data-work-action]` set contains **none** of {`suggest-records-response`, `suggest-code-guidance`,
   `suggest-minutes-draft`}; dump the full button list as evidence (expected non-AI actions:
   `civicnotice-calculate-deadline`, `civicnotice-complete-checklist`, `civicnotice-post-notice`,
   `civicnotice-export-archive-packet`). → `C5-civicnotice-no-ai.txt`.
6. **Reopen proof.** Close the app **gracefully** (CloseMainWindow; `-Force` only on timeout; **never
   reboot**), relaunch, confirm the wizard does **not** reappear, admin/profile persist, and sign-in
   works. → `C6-reopen.json` + screenshot.
7. **Backup Now / Restore Latest Backup.** Run **Backup Now**, confirm a backup artifact; run
   **Restore Latest Backup**, confirm success. → `C7-backup-restore.txt` + listing.
8. **MSI uninstall / reinstall — runtime stopped first, reboot fully suppressed.** Uninstall ≠ wipe;
   **back up `…\CivicSuite\config` first** (already in A0). **Stop the full runtime** (app, ollama,
   postgres, python) gracefully and confirm ports 15432/15434/15480 DOWN so no MSI component is in
   use. Then:

   ```powershell
   $code = "{7BE25830-15EE-4797-A25F-DF614ACA9B8E}"   # uninstall strictly by ProductCode
   # NOTE: DisplayVersion 0.1.0 on a 1.0.0 build is KNOWN/EXPECTED — do NOT treat the version string as a defect.
   Start-Process msiexec -ArgumentList "/x $code /qn /norestart REBOOT=ReallySuppress MSIRESTARTMANAGERCONTROL=Disable /l*v directive111-evidence\C8-uninstall.log" -Wait -PassThru |
     ForEach-Object { "uninstall exit: $($_.ExitCode)" | Out-File "directive111-evidence\C8-uninstall-exit.txt" }
   # Treat exit 0 = clean; exit 3010 = REBOOT PENDING -> STOP, record environment/blocker, do NOT reboot, do NOT retry.
   ```

   Reinstall the **same published MSI** verbosely with the same reboot suppression; parse the exit
   code identically (0 clean; 3010 blocker → STOP). Confirm the app launches. → `C8-uninstall.log`,
   `C8-reinstall.log`, `C8-product-after.txt`, and a reboot-pending check before and after.

---

## VERDICT

Write exactly one line near the top of `TESTER-RESULT-111.md`:

- **`Verdict: PASS`** — Stage A settled **B** (city-profile form renders, is `.current`, Save
  enabled), Stage B drove first-run to completion (B7 gates 1-7 hold, SHA-256 = `faff1a63…`), and
  Stage C lifecycle proofs all succeeded.
- **`Verdict: FAIL`** — first-run could **not** be advanced past `modules`/`city-profile` even with
  CDP `.click()` + `Input.dispatchMouseEvent` **and** UIA `Invoke` **and** SendInput (city-profile
  not `.current`; inputs absent/hidden despite backend `current`; or Save click never reaches
  `handleFirstRunAction` — backend `currentId` unchanged and no `.action-result`), OR a hard
  B7/Stage-C gate failed (checksum mismatch, runtime won't start, lifecycle marker not produced).

State the A-vs-B determination explicitly in the verdict's supporting paragraph, citing
`A4-ab-decisive.json`.

---

## Failure classification (pick the matching one)

- **`first-run UI dead-end`** — backend reports `city-profile` (or later) `current`, but the WebView
  never renders/advances the form (inputs absent/hidden/off-screen) **or** a real Save `.click()` +
  `Input.dispatchMouseEvent` does not change backend `currentId` and produces no `.action-result`
  (click never reaches `handleFirstRunAction`; event-binding/re-render bug). **This is the REAL
  product bug.** Capture failing selector + `cityNameStyle` + bounding rect, console errors,
  `get_app_state().first_run`, and `first-run-progress.json`.
- **`admin-gate stall`** — first-run advanced through admin but backup/model/health buttons are
  `disabled` with the lock text because sign-in (B3) was skipped/failed, OR the access panel occluded
  a non-home wizard instance. Capture the `disabled` button + lock `<small>` + `access` state. **Not
  a product bug — fix by signing in on home.**
- **`model/checksum failure`** — download incomplete or SHA-256 ≠ `faff1a63…`, or Ollama load
  failed. Capture `B5-sha256.txt` + `ollama list` + download log.
- **`runtime bootstrap failure`** — `verify-health` ran but Postgres/Ollama/runtime-API did not come
  up on 15432/15434/15480. Capture ports/processes + supervisor health output + logs + reboot-pending
  flag.
- **`lifecycle/regression`** — first-run completed but a Stage C proof failed (AI marker not
  produced, CivicNotice unexpectedly exposes a model action, reopen lost state, backup/restore
  failed, or uninstall/reinstall non-zero/3010). Capture the failing `C-*` artifact.
- **`automation-channel`** — no reliable driver could be established (CDP WS upgrade 403'd AND UIA
  tree never activated AND SendInput blocked). Capture each channel's return. **Do NOT conclude a
  product bug from this — it is a harness limitation.**
- **`environment/blocker`** — an external boundary stopped progress without a reboot option (MSI exit
  3010 / reboot pending, disk full, HF network blocked or stalled download). Record the exact
  blocker; **do not reboot, do not wipe.**

---

## Pass criteria (summary)

1. **Stage A A/B evidence captured FIRST and committed+pushed** before any driving — backend
   `steps[].current` flags **and** the **scoped** `.first-run-list .first-run-step.current` DOM
   (city-profile inputs present/visible? current-step H3 = "City profile"? Save enabled?) **and**
   console/error sink.
2. A clear, evidence-backed **A vs B determination** is stated, driven off the step **label**
   `City profile` and scoped selectors.
3. If **B**: first-run driven to completion via reliable CDP automation — B7 gates **1-7** all hold,
   including **SHA-256 = `faff1a63667fac17ac5e777f47114688fcefea96e220e211aaa8d62c2c4561f1`**, tag
   `civicsuite-gemma4-12b-qat:q4_0`, ports **15432/15434/15480 UP**.
4. Stage C lifecycle proven with marker **`D111-AI-MODEL-MARKER-20260625`** (CivicCore registry
   ready; CivicRecords + CivicCode AI round-trips via the record-text injection; CivicClerk if
   exposed; CivicNotice no-AI proven falsifiably; reopen persists; Backup/Restore; uninstall/reinstall
   exit 0, not 3010).
5. If first-run **cannot** be advanced even with CDP + UIA + SendInput → **`Verdict: FAIL`**,
   classification `first-run UI dead-end`, with the exact failing element + console errors.
6. All evidence under `directive111-evidence/`; result in `test-comms/TESTER-RESULT-111.md`;
   FETCH_HEAD recorded before AND after; pushed **only** to `stage-3a-baremetal-windows` (branch
   asserted, non-force).

---

## Hard limits (restate)

- **NO REBOOT**, ever. `/norestart` + `REBOOT=ReallySuppress MSIRESTARTMANAGERCONTROL=Disable` on
  every msiexec; **exit 3010 = reboot pending → STOP/blocker, never reboot, never retry**; check
  reboot-pending flags after B6 and C8; graceful `CloseMainWindow` first, `-Force` only on timeout.
- **Continue from current box state.** **Wipe/reinstall is permitted ONLY if** `first-run-progress.json`
  is unreadable/corrupt **AND** a graceful relaunch fails twice **AND** the A0 config backup is
  already committed to the branch — and still **no reboot**. **Network/download failures to Hugging
  Face are `environment/blocker`, never "unrecoverable."** Uninstall (C8) is **not** a wipe and must
  not delete `…\CivicSuite\config` evidence (back it up first).
- **Push only to `stage-3a-baremetal-windows`.** **No merge to `main`. No `--force`.** Assert branch
  before each push; confirm `git remote get-url origin` is the clean tokenless
  `https://github.com/CivicSuite/civicsuite.git`. Use **`git merge --ff-only`** for sync, never
  `git reset --hard`.
- **No OneDrive.** Verify the backup root is a local (non-OneDrive) path.
- CDP bound to **`127.0.0.1`** only with explicit `--remote-allow-origins=http://127.0.0.1:9222`
  matching the `Origin` header. **Prefer env-var launch only; set no Edge policy registry key.** Any
  registry override must be wrapped in `try { … } finally { Remove-Item … }`.
- All evidence and the result file committed to `test-comms/` / `directive111-evidence/` on
  `stage-3a-baremetal-windows`, with `git ls-remote` + FETCH_HEAD recorded **before and after**.