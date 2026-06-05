param(
    [ValidateSet("Stage0", "Stage1", "Stage2", "Stage3", "Stage4", "Stage0Stage1", "Stage0To4")]
    [string]$Stage = "Stage0Stage1",
    [string]$LogRoot,
    [string]$HostFactsJson,
    [switch]$PlanOnly,
    [switch]$SkipElevation,
    [switch]$ResumeRun,
    [switch]$MockWindowsFeatures,
    [string]$ResumeTaskName = "CivicSuiteBaremetalResume",
    [string]$ResumeCommand,
    [string]$TaskRegistryPath,
    [string]$WslExePath = "wsl",
    [string]$DockerSpikePath,
    [string]$OllamaExePath,
    [string]$OllamaInstallerPath,
    [string]$OllamaInstallerSha256,
    [string]$OllamaInstallerUrl = "https://ollama.com/download/OllamaSetup.exe",
    [string]$PythonPath = "python",
    [string]$PythonInstallerUrl = "https://www.python.org/ftp/python/3.12.7/python-3.12.7-amd64.exe",
    [string]$InstallRoot,
    [string]$LifecycleEvidencePath,
    [string]$RunId = "stage3a-baremetal"
)

$ErrorActionPreference = "Stop"

$scriptPath = $PSCommandPath
$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $LogRoot) {
    $LogRoot = Join-Path $scriptRoot "logs"
}
New-Item -ItemType Directory -Force -Path $LogRoot | Out-Null

$startedAt = Get-Date
$logPath = Join-Path $LogRoot "civicsuite-baremetal-bootstrap.log"
$resultPath = Join-Path $LogRoot "civicsuite-baremetal-bootstrap-result.json"

$result = [ordered]@{
    phase = "windows_baremetal_bootstrap"
    stage = $Stage
    started_at = $startedAt.ToUniversalTime().ToString("o")
    completed_at = $null
    status = "running"
    plan_only = [bool]$PlanOnly
    stage0 = $null
    stage1 = $null
    stage2 = $null
    stage3 = $null
    stage4 = $null
    failure = $null
    log_path = $logPath
}

function Write-BootstrapLog {
    param([string]$Step, [string]$Message)
    $timestamp = (Get-Date).ToUniversalTime().ToString("o")
    Add-Content -Path $logPath -Encoding UTF8 -Value "$timestamp [$Step] $Message"
}

function Write-JsonNoBom {
    param([string]$Path, [object]$Value)
    $json = $Value | ConvertTo-Json -Depth 10
    [System.IO.File]::WriteAllText($Path, $json, [System.Text.UTF8Encoding]::new($false))
}

function Complete-Bootstrap {
    param([string]$Status)
    $completedAt = Get-Date
    $result.completed_at = $completedAt.ToUniversalTime().ToString("o")
    $result.status = $Status
    $result.duration_seconds = [math]::Round(($completedAt - $startedAt).TotalSeconds, 3)
    Write-JsonNoBom -Path $resultPath -Value $result
    Write-BootstrapLog "result" "Wrote structured result to $resultPath"
}

function Get-FailureActionableMessage {
    if ($result.stage4 -and $result.stage4.status -ne "passed" -and $result.stage4.status -ne "planned") {
        return "Fix the named Stage4 verification issue, then rerun the idempotent bootstrapper. CivicSuite only owns its logs and resume task."
    }
    if ($result.stage3 -and $result.stage3.status -ne "passed" -and $result.stage3.status -ne "planned") {
        return "Fix the named Stage3 CivicSuite install issue, then rerun the idempotent bootstrapper. CivicSuite only owns its logs and resume task."
    }
    if (($Stage -eq "Stage2" -or $Stage -eq "Stage0To4") -and -not $result.stage2) {
        return "Fix the named Stage2 Docker/Ollama prerequisite issue, then rerun the idempotent bootstrapper. CivicSuite only owns its logs and resume task."
    }
    if ($result.stage2 -and $result.stage2.status -ne "passed" -and $result.stage2.status -ne "planned") {
        return "Fix the named Stage2 Docker/Ollama prerequisite issue, then rerun the idempotent bootstrapper. CivicSuite only owns its logs and resume task."
    }
    if (($Stage -eq "Stage1" -or $Stage -eq "Stage0Stage1" -or $Stage -eq "Stage0To4") -and -not $result.stage1) {
        return "Fix the named Stage1 WSL2/reboot-resume issue, then rerun the idempotent bootstrapper. CivicSuite only owns its logs and resume task."
    }
    if ($result.stage1 -and $result.stage1.status -ne "passed") {
        return "Fix the named Stage1 WSL2/reboot-resume issue, then rerun the idempotent bootstrapper. CivicSuite only owns its logs and resume task."
    }
    return "Fix the named Stage0 target-check issue, then rerun the idempotent bootstrapper. CivicSuite only owns its logs and resume task."
}

function Test-IsAdmin {
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = [Security.Principal.WindowsPrincipal]::new($identity)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Ensure-Elevated {
    if ($SkipElevation -or (Test-IsAdmin)) {
        return $false
    }
    $argList = @(
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        $scriptPath,
        "-Stage",
        $Stage,
        "-LogRoot",
        $LogRoot
    )
    if ($PlanOnly) {
        $argList += "-PlanOnly"
    }
    if ($HostFactsJson) {
        $argList += @("-HostFactsJson", $HostFactsJson)
    }
    Write-BootstrapLog "stage0" "Requesting UAC elevation for CivicSuite bare-metal bootstrap"
    Start-Process -FilePath "powershell.exe" -ArgumentList $argList -Verb RunAs | Out-Null
    return $true
}

function Get-HostFacts {
    if ($HostFactsJson) {
        Write-BootstrapLog "stage0" "Loading injected host facts from $HostFactsJson"
        return Get-Content -LiteralPath $HostFactsJson -Raw | ConvertFrom-Json
    }

    $os = Get-CimInstance Win32_OperatingSystem
    $processor = Get-CimInstance Win32_Processor | Select-Object -First 1
    $computerSystem = Get-CimInstance Win32_ComputerSystem
    $edition = $os.Caption
    $internetAvailable = $false
    try {
        $connection = Test-NetConnection -ComputerName "desktop.docker.com" -Port 443 -InformationLevel Quiet -WarningAction SilentlyContinue
        $internetAvailable = [bool]$connection
    } catch {
        $internetAvailable = $false
    }
    return [pscustomobject]@{
        os_caption = $os.Caption
        os_version = $os.Version
        edition = $edition
        is_admin = Test-IsAdmin
        virtualization_firmware_enabled = [bool]$processor.VirtualizationFirmwareEnabled
        hypervisor_present = [bool]$computerSystem.HypervisorPresent
        internet_available = $internetAvailable
        total_memory_bytes = [int64]$os.TotalVisibleMemorySize * 1024
    }
}

function Add-Check {
    param(
        [System.Collections.IList]$Checks,
        [string]$Id,
        [bool]$Passed,
        [string]$Message,
        [string]$Action
    )
    $Checks.Add([ordered]@{
        id = $Id
        status = $(if ($Passed) { "passed" } else { "failed" })
        message = $Message
        action = $Action
    }) | Out-Null
}

function Invoke-Stage0 {
    $facts = Get-HostFacts
    $checks = New-Object System.Collections.ArrayList
    $versionText = [string]$facts.os_version
    $edition = [string]$facts.edition
    $build = -1
    try {
        if (-not [string]::IsNullOrWhiteSpace($versionText)) {
            $build = [int]([version]$versionText).Build
        }
    } catch {
        $build = -1
    }
    $isWindows11 = $build -ge 22000
    $supportedEdition = $edition -match "Pro|Enterprise"
    $isAdmin = [bool]$facts.is_admin
    # VirtualizationFirmwareEnabled is a known false-negative once a hypervisor (Hyper-V /
    # WSL2 VM Platform) is already running, which falsely rejects capable machines. Accept a
    # running hypervisor (HypervisorPresent) as satisfying the requirement too.
    $virtualization = ([bool]$facts.virtualization_firmware_enabled) -or ([bool]$facts.hypervisor_present)
    $internet = [bool]$facts.internet_available

    Add-Check $checks "windows-version" $isWindows11 "Stage 3A target is Windows 11 build >= 22000; the marketing name string is unreliable." "Use a Windows 11 Pro or Enterprise machine for Stage 3A; Windows 11 is build >= 22000."
    Add-Check $checks "windows-edition" $supportedEdition "Stage 3A supports Pro/Enterprise editions." "Use Windows 11 Pro or Enterprise; Home/managed-machine discovery is Stage 3B+ scope."
    Add-Check $checks "local-admin" $isAdmin "Local administrator rights are required for Windows features and Docker Desktop installation." "Sign in as a local admin or rerun from an elevated shell."
    Add-Check $checks "hardware-virtualization" $virtualization "Hardware virtualization must be available for WSL2/Docker Desktop (firmware flag enabled, or a hypervisor already running)." "Enable virtualization in firmware/BIOS before rerunning (a running hypervisor such as Hyper-V/WSL2 also satisfies this)."
    Add-Check $checks "internet" $internet "Stage 3A online installer requires internet access." "Connect to the internet or wait for Stage 3B air-gap bundle mode."

    $failed = @($checks | Where-Object { $_.status -ne "passed" })
    $stage0 = [ordered]@{
        status = $(if ($failed.Count -eq 0) { "passed" } else { "failed" })
        target = "Windows 11 Pro/Enterprise, local admin, virtualization enabled, internet available"
        checks = $checks
        facts = $facts
    }
    Write-BootstrapLog "stage0" "Stage0 target inspection finished with status $($stage0.status)"
    return $stage0
}

function Invoke-FeatureCommand {
    param([string]$FeatureName)
    if ($PlanOnly -or $MockWindowsFeatures) {
        $status = $(if ($PlanOnly) { "planned" } else { "passed" })
        Write-BootstrapLog "stage1" "$status`: would enable Windows feature $FeatureName"
        return [ordered]@{ feature = $FeatureName; status = $status; restart_needed = $true }
    }
    $feature = Enable-WindowsOptionalFeature -Online -FeatureName $FeatureName -All -NoRestart
    return [ordered]@{
        feature = $FeatureName
        status = $(if ($feature.RestartNeeded -or $feature.Online) { "passed" } else { "failed" })
        restart_needed = [bool]$feature.RestartNeeded
    }
}

function Invoke-NativeCommand {
    param(
        [string]$FilePath,
        [string[]]$Arguments
    )
    $previousPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        $nativeArguments = ($Arguments | ForEach-Object {
            if ($_ -match '[\s"]') {
                '"' + ($_ -replace '"', '\"') + '"'
            } else {
                $_
            }
        }) -join " "
        $psi = [System.Diagnostics.ProcessStartInfo]::new()
        if ($FilePath -match '\.(cmd|bat)$') {
            $commandPath = '"' + $FilePath + '"'
            $psi.FileName = $(if ($env:ComSpec) { $env:ComSpec } else { "cmd.exe" })
            $psi.Arguments = "/d /c $commandPath $nativeArguments"
        } else {
            $psi.FileName = $FilePath
            $psi.Arguments = $nativeArguments
        }
        $psi.UseShellExecute = $false
        $psi.RedirectStandardOutput = $true
        $psi.RedirectStandardError = $true
        $psi.CreateNoWindow = $true

        $process = [System.Diagnostics.Process]::Start($psi)
        $stdout = $process.StandardOutput.ReadToEnd()
        $stderr = $process.StandardError.ReadToEnd()
        $process.WaitForExit()
        return [ordered]@{
            command = "$FilePath $($Arguments -join ' ')"
            exit_code = [int]$process.ExitCode
            stdout = $stdout.Trim()
            stderr = $stderr.Trim()
        }
    } catch {
        return [ordered]@{
            command = "$FilePath $($Arguments -join ' ')"
            exit_code = 127
            stdout = ""
            stderr = $_.Exception.Message
        }
    } finally {
        $ErrorActionPreference = $previousPreference
    }
}

function Unregister-ResumeTask {
    if ($TaskRegistryPath) {
        if (Test-Path -LiteralPath $TaskRegistryPath) {
            Remove-Item -LiteralPath $TaskRegistryPath -Force
            Write-BootstrapLog "stage1" "Removed simulated resume task registry $TaskRegistryPath"
        }
        return [ordered]@{
            unregistered = $true
            mechanism = "simulated_registry"
            task_name = $ResumeTaskName
            path = $TaskRegistryPath
        }
    }
    if ($PlanOnly) {
        Write-BootstrapLog "stage1" "PlanOnly: would unregister resume task $ResumeTaskName"
        return [ordered]@{
            unregistered = $true
            mechanism = "scheduled_task"
            task_name = $ResumeTaskName
            plan_only = $true
        }
    }
    Unregister-ScheduledTask -TaskName $ResumeTaskName -Confirm:$false -ErrorAction SilentlyContinue
    Write-BootstrapLog "stage1" "Unregistered resume task $ResumeTaskName"
    return [ordered]@{
        unregistered = $true
        mechanism = "scheduled_task"
        task_name = $ResumeTaskName
        plan_only = $false
    }
}

function Register-Resume {
    $command = $ResumeCommand
    if (-not $command) {
        $command = "powershell.exe -NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`" -Stage Stage1 -LogRoot `"$LogRoot`""
    }
    if ($PlanOnly) {
        Write-BootstrapLog "stage1" "PlanOnly: would register resume task $ResumeTaskName"
        return [ordered]@{
            registered = $true
            mechanism = "scheduled_task"
            task_name = $ResumeTaskName
            command = $command
            plan_only = $true
        }
    }
    if ($TaskRegistryPath) {
        Set-Content -LiteralPath $TaskRegistryPath -Value $command -Encoding UTF8
        Write-BootstrapLog "stage1" "Wrote simulated resume task registry $TaskRegistryPath"
        return [ordered]@{
            registered = $true
            mechanism = "simulated_registry"
            task_name = $ResumeTaskName
            command = $command
            path = $TaskRegistryPath
        }
    }
    $action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`" -Stage Stage1 -LogRoot `"$LogRoot`""
    $trigger = New-ScheduledTaskTrigger -AtLogOn
    Register-ScheduledTask -TaskName $ResumeTaskName -Action $action -Trigger $trigger -Description "Resume CivicSuite bare-metal bootstrap after WSL2 reboot." -Force | Out-Null
    return [ordered]@{
        registered = $true
        mechanism = "scheduled_task"
        task_name = $ResumeTaskName
        command = $command
        plan_only = $false
    }
}

function Invoke-Stage1 {
    $resumeCleanup = $null
    if ($ResumeRun) {
        $resumeCleanup = Unregister-ResumeTask
    }
    $features = @()
    $features += Invoke-FeatureCommand "Microsoft-Windows-Subsystem-Linux"
    $features += Invoke-FeatureCommand "VirtualMachinePlatform"
    $wslStatus = [ordered]@{ status = "not_run" }
    $wslInstall = [ordered]@{ status = "not_run" }
    $wslDefault = [ordered]@{ status = "not_run"; restart_needed_first = $false }
    if ($PlanOnly) {
        $wslStatus = [ordered]@{ status = "planned"; command = "$WslExePath --status" }
        $wslInstall = [ordered]@{ status = "planned"; command = "$WslExePath --install --no-distribution" }
        $wslDefault = [ordered]@{ status = "planned"; command = "$WslExePath --set-default-version 2" }
    } else {
        $wslStatus = Invoke-NativeCommand -FilePath $WslExePath -Arguments @("--status")
        $wslStatus["status"] = $(if ($wslStatus.exit_code -eq 0) { "passed" } else { "failed" })
        if ($wslStatus.exit_code -ne 0) {
            $wslInstall = Invoke-NativeCommand -FilePath $WslExePath -Arguments @("--install", "--no-distribution")
            $wslInstall["status"] = $(if ($wslInstall.exit_code -eq 0) { "passed" } else { "failed" })
        }
        $wslDefault = Invoke-NativeCommand -FilePath $WslExePath -Arguments @("--set-default-version", "2")
        $wslDefault["status"] = $(if ($wslDefault.exit_code -eq 0) { "passed" } else { "failed" })
    }
    $restartNeeded = [bool](@($features | Where-Object { $_.restart_needed }).Count -gt 0)
    $resume = $null
    if ($restartNeeded -and -not $ResumeRun) {
        $resume = Register-Resume
    }
    $stage1Status = "passed"
    if ($wslInstall["status"] -eq "failed") {
        $stage1Status = "failed"
    }
    if ($ResumeRun -and -not $PlanOnly -and ($wslStatus["status"] -ne "passed" -or $wslDefault["status"] -ne "passed")) {
        $stage1Status = "failed"
    }
    $stage1 = [ordered]@{
        status = $stage1Status
        features = $features
        wsl_status = $wslStatus
        wsl_install = $wslInstall
        wsl_default_version = $wslDefault
        restart_needed = $restartNeeded
        resume = $resume
        resume_cleanup = $resumeCleanup
    }
    Write-BootstrapLog "stage1" "Stage1 WSL2 feature enablement finished; restart_needed=$restartNeeded"
    return $stage1
}

function Find-FirstNamedObject {
    param([object]$Node, [string]$Name)
    if ($null -eq $Node) {
        return $null
    }
    if ($Node -is [System.Array]) {
        foreach ($item in $Node) {
            $found = Find-FirstNamedObject -Node $item -Name $Name
            if ($null -ne $found) {
                return $found
            }
        }
        return $null
    }
    if ($Node.PSObject -and $Node.PSObject.Properties["name"] -and [string]$Node.name -eq $Name) {
        return $Node
    }
    if ($Node.PSObject) {
        foreach ($property in $Node.PSObject.Properties) {
            $value = $property.Value
            if ($value -is [System.Array] -or ($value -and $value.PSObject -and -not ($value -is [string]))) {
                $found = Find-FirstNamedObject -Node $value -Name $Name
                if ($null -ne $found) {
                    return $found
                }
            }
        }
    }
    return $null
}

function Assert-Stage4Evidence {
    param([string]$EvidencePath)
    if (-not (Test-Path -LiteralPath $EvidencePath)) {
        throw "Stage4 lifecycle evidence was not found at $EvidencePath. Run verify with --workflow-proof or provide LifecycleEvidencePath."
    }
    $payload = Get-Content -LiteralPath $EvidencePath -Raw | ConvertFrom-Json
    $draftCheck = Find-FirstNamedObject -Node $payload -Name "draft_response_letter"
    if ($null -eq $draftCheck) {
        throw "Stage4 lifecycle evidence does not contain the CivicRecords draft_response_letter proof."
    }
    $source = [string]$draftCheck.generation_source
    $model = [string]$draftCheck.generation_model
    $passed = $source -eq "ollama" -and $model -eq "gemma4:e4b"
    return [ordered]@{
        status = $(if ($passed) { "passed" } else { "failed" })
        evidence_path = $EvidencePath
        generation_source = $source
        generation_model = $model
        expected_generation_source = "ollama"
        expected_generation_model = "gemma4:e4b"
    }
}

function Find-Ollama {
    if ($OllamaExePath -and (Test-Path -LiteralPath $OllamaExePath)) {
        return (Resolve-Path -LiteralPath $OllamaExePath).Path
    }
    $command = Get-Command ollama -ErrorAction SilentlyContinue
    if ($command) {
        return $command.Source
    }
    $default = Join-Path $env:LOCALAPPDATA "Programs\Ollama\ollama.exe"
    if (Test-Path -LiteralPath $default) {
        return $default
    }
    return $null
}

function Install-Ollama {
    $installer = $OllamaInstallerPath
    if (-not $installer) {
        if ($PlanOnly) {
            return [ordered]@{ status = "planned"; source = $OllamaInstallerUrl; installed = $false }
        }
        $installer = Join-Path $LogRoot "OllamaSetup.exe"
        Write-BootstrapLog "stage2" "Downloading Ollama installer to $installer"
        Invoke-WebRequest -Uri $OllamaInstallerUrl -OutFile $installer
    }
    if (-not (Test-Path -LiteralPath $installer)) {
        throw "Ollama installer was not found at $installer. Provide a valid OllamaInstallerPath."
    }
    if ($OllamaInstallerSha256) {
        $actualHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $installer).Hash.ToLowerInvariant()
        if ($actualHash -ne $OllamaInstallerSha256.ToLowerInvariant()) {
            throw "Ollama installer checksum mismatch. Expected $OllamaInstallerSha256 but found $actualHash."
        }
    }
    if ($PlanOnly) {
        return [ordered]@{ status = "planned"; source = $installer; installed = $false }
    }
    Write-BootstrapLog "stage2" "Starting Ollama installer silently"
    # OllamaSetup.exe is an Inno Setup installer; silent switches are
    # /VERYSILENT /SUPPRESSMSGBOXES /NORESTART. Do NOT -Wait on it: after installing, the
    # Inno Setup [Run] step launches the Ollama app/service and the installer process tree
    # does not exit, so -Wait hangs forever (observed on the bare-metal test box: bootstrap
    # stuck at Stage2 with ollama.exe already present). Start it detached and poll for
    # ollama.exe (the real success signal) with a bound. The launched Ollama server is left
    # running on purpose — Stage3/Stage4 need it.
    $ollamaInstallTimeoutSeconds = 300
    Start-Process -FilePath $installer -ArgumentList @("/VERYSILENT", "/SUPPRESSMSGBOXES", "/NORESTART") | Out-Null
    $ollamaDeadline = (Get-Date).AddSeconds($ollamaInstallTimeoutSeconds)
    $ollamaPath = $null
    while ((Get-Date) -lt $ollamaDeadline) {
        $ollamaPath = Find-Ollama
        if ($ollamaPath) { break }
        Start-Sleep -Seconds 3
    }
    if (-not $ollamaPath) {
        throw "Ollama installer did not produce ollama.exe under `$env:LOCALAPPDATA\Programs\Ollama within $ollamaInstallTimeoutSeconds seconds."
    }
    Write-BootstrapLog "stage2" "Ollama installed; ollama.exe at $ollamaPath"
    return [ordered]@{ status = "passed"; source = $installer; installed = $true; ollama_path = $ollamaPath }
}

function Test-RealPython {
    param([string]$Exe)
    # Returns the genuine interpreter path if $Exe is a real Python, else $null. A fresh
    # Windows 11 box exposes only the Microsoft Store app-execution alias at
    # ...\WindowsApps\python.exe, which is a non-functional stub: it prints "Python was not
    # found" and exits non-zero. Probe sys.executable and reject the WindowsApps stub.
    if ([string]::IsNullOrWhiteSpace($Exe)) { return $null }
    $probe = Invoke-NativeCommand -FilePath $Exe -Arguments @("-c", "import sys; print(sys.executable)")
    if ($probe.exit_code -ne 0) { return $null }
    $resolved = ($probe.stdout -split "`n" | ForEach-Object { $_.Trim() } | Where-Object { $_ } | Select-Object -Last 1)
    if ([string]::IsNullOrWhiteSpace($resolved)) { return $null }
    if ($resolved -match '\\WindowsApps\\') { return $null }
    if (-not (Test-Path -LiteralPath $resolved)) { return $null }
    return $resolved
}

function Ensure-Python {
    if ($PlanOnly) {
        return [ordered]@{ status = "planned"; would_install_from = $PythonInstallerUrl }
    }
    # 1. Use an existing real Python if present (the configured path, then python/py).
    foreach ($candidate in @($PythonPath, "python", "py")) {
        $real = Test-RealPython -Exe $candidate
        if ($real) {
            Write-BootstrapLog "stage2" "Using existing Python at $real"
            return [ordered]@{ status = "present"; path = $real }
        }
    }
    # 2. None usable (fresh Windows has only the Store alias). Install Python 3.12 silently.
    $pyInstaller = Join-Path $LogRoot "python-installer.exe"
    Write-BootstrapLog "stage2" "Downloading Python installer to $pyInstaller"
    Invoke-WebRequest -Uri $PythonInstallerUrl -OutFile $pyInstaller
    Write-BootstrapLog "stage2" "Installing Python silently (all users)"
    $proc = Start-Process -FilePath $pyInstaller -ArgumentList @("/quiet", "InstallAllUsers=1", "PrependPath=1", "Include_launcher=1", "Include_pip=1", "Include_test=0") -Wait -PassThru
    if ($proc.ExitCode -ne 0) {
        throw "Python installer exited with code $($proc.ExitCode)."
    }
    # 3. Resolve the installed interpreter by FULL PATH (the Store alias may still shadow
    #    'python' in this process's PATH; a new process is needed to pick up PrependPath).
    $candidates = @((Join-Path $env:ProgramFiles "Python312\python.exe"),
                    (Join-Path $env:LOCALAPPDATA "Programs\Python\Python312\python.exe"))
    if (${env:ProgramFiles(x86)}) {
        $candidates += (Join-Path ${env:ProgramFiles(x86)} "Python312\python.exe")
    }
    foreach ($candidate in $candidates) {
        $real = Test-RealPython -Exe $candidate
        if ($real) {
            Write-BootstrapLog "stage2" "Python installed at $real"
            return [ordered]@{ status = "installed"; path = $real; source = $PythonInstallerUrl }
        }
    }
    # 4. Fallback: search common install roots for a real python.exe.
    foreach ($root in @($env:ProgramFiles, (Join-Path $env:LOCALAPPDATA "Programs\Python"))) {
        if ($root -and (Test-Path -LiteralPath $root)) {
            $found = Get-ChildItem -LiteralPath $root -Filter "python.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
            if ($found) {
                $real = Test-RealPython -Exe $found.FullName
                if ($real) {
                    Write-BootstrapLog "stage2" "Python installed at $real"
                    return [ordered]@{ status = "installed"; path = $real; source = $PythonInstallerUrl }
                }
            }
        }
    }
    throw "Python installer ran but no usable python.exe was found under Program Files or LocalAppData."
}

function Set-HostOllamaBindAddress {
    param([string]$OllamaExe)
    # The city-core containers reach the host Ollama via host.docker.internal, but Ollama on
    # Windows binds 127.0.0.1 by default -> container traffic is refused and the response-letter
    # generation never runs. Bind 0.0.0.0, open the port, and restart the server so it rebinds.
    $result = [ordered]@{ ollama_host = "0.0.0.0"; firewall = $false; restarted = $false; ready = $false }
    [Environment]::SetEnvironmentVariable("OLLAMA_HOST", "0.0.0.0", "Machine")
    $env:OLLAMA_HOST = "0.0.0.0"
    try {
        if (-not (Get-NetFirewallRule -DisplayName "CivicSuite Ollama 11434" -ErrorAction SilentlyContinue)) {
            New-NetFirewallRule -DisplayName "CivicSuite Ollama 11434" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 11434 -Profile Any -ErrorAction Stop | Out-Null
        }
        $result.firewall = $true
    } catch {
        Write-BootstrapLog "stage2" "Ollama firewall rule could not be added: $($_.Exception.Message)"
    }
    # Restart the Ollama server so it picks up OLLAMA_HOST=0.0.0.0.
    Get-Process -Name "ollama app", "ollama", "ollama_llama_server" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    $ollamaApp = Join-Path (Split-Path -Parent $OllamaExe) "ollama app.exe"
    if (Test-Path -LiteralPath $ollamaApp) {
        Start-Process -FilePath $ollamaApp | Out-Null
    } else {
        Start-Process -FilePath $OllamaExe -ArgumentList @("serve") | Out-Null
    }
    $result.restarted = $true
    $deadline = (Get-Date).AddSeconds(60)
    while ((Get-Date) -lt $deadline) {
        try {
            $probe = Invoke-WebRequest -Uri "http://127.0.0.1:11434/api/tags" -UseBasicParsing -TimeoutSec 3
            if ($probe.StatusCode -eq 200) { $result.ready = $true; break }
        } catch { }
        Start-Sleep -Seconds 2
    }
    Write-BootstrapLog "stage2" "Host Ollama rebind to 0.0.0.0: restarted=$($result.restarted) firewall=$($result.firewall) ready=$($result.ready)"
    return $result
}

function Invoke-Stage2 {
    $spike = $DockerSpikePath
    if (-not $spike) {
        $spike = Join-Path $scriptRoot "docker-desktop-spike.ps1"
    }
    $dockerResult = [ordered]@{ status = "not_run"; result_path = $null }
    if ($PlanOnly) {
        $dockerResult = [ordered]@{
            status = "planned"
            script = $spike
            expected_result = "docker_present/installed/wsl_integration/engine_ready JSON"
        }
        Write-BootstrapLog "stage2" "PlanOnly: would run Docker Desktop spike at $spike"
    } else {
        $dockerLogRoot = Join-Path $LogRoot "docker-desktop"
        $process = Start-Process -FilePath "powershell.exe" -ArgumentList @("-NoProfile", "-ExecutionPolicy", "Bypass", "-File", $spike, "-LogRoot", $dockerLogRoot) -Wait -PassThru
        $dockerResultPath = Join-Path $dockerLogRoot "docker-desktop-spike-result.json"
        $dockerResult = [ordered]@{
            status = $(if ($process.ExitCode -eq 0) { "passed" } else { "failed" })
            exit_code = $process.ExitCode
            result_path = $dockerResultPath
        }
        if ($process.ExitCode -ne 0) {
            throw "Docker Desktop spike failed. Review $dockerResultPath."
        }
    }

    $ollama = Find-Ollama
    $ollamaResult = [ordered]@{ present = [bool]$ollama; path = $ollama; install = $null }
    if (-not $ollama) {
        $ollamaResult.install = Install-Ollama
    }
    # Pin the resolved host Ollama path so Stage3/4 route the stack to the host's native (GPU)
    # Ollama via the host-ollama compose variant (Invoke-InstallerLifecycle passes it through).
    $script:ResolvedOllamaExe = Find-Ollama
    $ollamaResult.resolved_exe = $script:ResolvedOllamaExe
    if ($script:ResolvedOllamaExe -and -not $PlanOnly) {
        $ollamaResult.bind = Set-HostOllamaBindAddress -OllamaExe $script:ResolvedOllamaExe
    }
    # Stage3/Stage4 run the city-core lifecycle runner with $PythonPath. A fresh Windows box
    # has no real Python (only the Store alias), so provision one and pin the resolved full
    # path for the later stages (don't rely on 'python' in PATH).
    $pythonResult = Ensure-Python
    if ($pythonResult.path) {
        $script:PythonPath = $pythonResult.path
    }
    $stage2 = [ordered]@{
        status = "passed"
        docker_desktop = $dockerResult
        ollama = $ollamaResult
        python = $pythonResult
    }
    Write-BootstrapLog "stage2" "Stage2 prerequisite orchestration finished"
    return $stage2
}

function Invoke-InstallerLifecycle {
    param([string]$Mode, [switch]$WorkflowProof)
    $runner = Resolve-Path (Join-Path $scriptRoot "..\..\..\scripts\run-clerk-core-installer.py")
    $root = $InstallRoot
    if (-not $root) {
        $root = Join-Path $scriptRoot "..\..\runtime\city-core-baremetal"
    }
    $args = @($runner.Path, $Mode, "--install-root", $root, "--run-id", $RunId, "--module", "civicrecords-ai", "--module", "civicclerk", "--module", "civiccode")
    if ($WorkflowProof) {
        $args += "--workflow-proof"
    }
    # Route the stack to the host's native (GPU) Ollama: the bootstrapper installs Ollama on
    # the Windows host (GPU-accelerated), so use it + the host-ollama compose variant rather
    # than a CPU-only in-container Ollama on a RAM-tight box.
    if ($script:ResolvedOllamaExe) {
        $args += @("--host-ollama", "--ollama-exe", $script:ResolvedOllamaExe)
    }
    if ($PlanOnly) {
        return [ordered]@{
            status = "planned"
            command = "$PythonPath $($args -join ' ')"
            install_root = $root
            run_id = $RunId
        }
    }
    $process = Start-Process -FilePath $PythonPath -ArgumentList $args -Wait -PassThru -NoNewWindow
    return [ordered]@{
        status = $(if ($process.ExitCode -eq 0) { "passed" } else { "failed" })
        exit_code = $process.ExitCode
        install_root = $root
        run_id = $RunId
    }
}

function Invoke-Stage3 {
    $stage3 = Invoke-InstallerLifecycle -Mode "install" -WorkflowProof
    Write-BootstrapLog "stage3" "Stage3 warm-first installer handoff status $($stage3.status)"
    return $stage3
}

function Invoke-Stage4 {
    $verify = Invoke-InstallerLifecycle -Mode "verify" -WorkflowProof
    $evidencePath = $LifecycleEvidencePath
    if (-not $evidencePath) {
        $repoRoot = Resolve-Path (Join-Path $scriptRoot "..\..\..")
        $evidencePath = Join-Path $repoRoot.Path "installer\reports\$RunId\clerk-core-installer-lifecycle.json"
    }
    $evidenceAssertion = $null
    if ($PlanOnly -and -not (Test-Path -LiteralPath $evidencePath)) {
        $evidenceAssertion = [ordered]@{
            status = "planned"
            evidence_path = $evidencePath
            expected_generation_source = "ollama"
            expected_generation_model = "gemma4:e4b"
        }
    } else {
        $evidenceAssertion = Assert-Stage4Evidence -EvidencePath $evidencePath
    }
    $stage4 = [ordered]@{
        status = $(if ($verify.status -eq "failed" -or $evidenceAssertion.status -eq "failed") { "failed" } else { $verify.status })
        verify = $verify
        evidence_assertion = $evidenceAssertion
        required_generation_source = "ollama"
        required_model = "gemma4:e4b"
        launcher_url = "http://127.0.0.1:18082/"
    }
    Write-BootstrapLog "stage4" "Stage4 verification shell status $($stage4.status)"
    return $stage4
}

try {
    Write-BootstrapLog "start" "Starting CivicSuite bare-metal bootstrap stage $Stage"
    if (Ensure-Elevated) {
        $result.status = "elevation_requested"
        Complete-Bootstrap "elevation_requested"
        exit 0
    }

    if ($Stage -eq "Stage0" -or $Stage -eq "Stage0Stage1" -or $Stage -eq "Stage0To4") {
        $result.stage0 = Invoke-Stage0
        if ($result.stage0.status -ne "passed") {
            Complete-Bootstrap "failed"
            exit 1
        }
    }
    if ($Stage -eq "Stage1" -or $Stage -eq "Stage0Stage1" -or $Stage -eq "Stage0To4") {
        $result.stage1 = Invoke-Stage1
        if ($result.stage1.status -ne "passed") {
            Complete-Bootstrap "failed"
            exit 1
        }
        if ($result.stage1.restart_needed -and -not $ResumeRun -and -not $PlanOnly) {
            Complete-Bootstrap "restart_required"
            exit 0
        }
    }
    if ($Stage -eq "Stage2" -or $Stage -eq "Stage0To4") {
        $result.stage2 = Invoke-Stage2
    }
    if ($Stage -eq "Stage3" -or $Stage -eq "Stage0To4") {
        $result.stage3 = Invoke-Stage3
        if ($result.stage3.status -ne "passed" -and $result.stage3.status -ne "planned") {
            Complete-Bootstrap "failed"
            exit 1
        }
    }
    if ($Stage -eq "Stage4" -or $Stage -eq "Stage0To4") {
        $result.stage4 = Invoke-Stage4
        if ($result.stage4.status -ne "passed" -and $result.stage4.status -ne "planned") {
            Complete-Bootstrap "failed"
            exit 1
        }
    }
    Complete-Bootstrap "passed"
    exit 0
} catch {
    $result.failure = [ordered]@{
        message = $_.Exception.Message
        actionable_message = Get-FailureActionableMessage
    }
    Write-BootstrapLog "failure" $_.Exception.Message
    Complete-Bootstrap "failed"
    exit 1
}
