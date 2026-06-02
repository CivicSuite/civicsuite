param(
    [ValidateSet("Stage0", "Stage1", "Stage2", "Stage3", "Stage4", "Stage0Stage1", "Stage0To4")]
    [string]$Stage = "Stage0Stage1",
    [string]$LogRoot,
    [string]$HostFactsJson,
    [switch]$PlanOnly,
    [switch]$SkipElevation,
    [string]$ResumeTaskName = "CivicSuiteBaremetalResume",
    [string]$ResumeCommand,
    [string]$DockerSpikePath,
    [string]$OllamaExePath,
    [string]$OllamaInstallerPath,
    [string]$OllamaInstallerSha256,
    [string]$OllamaInstallerUrl = "https://ollama.com/download/OllamaSetup.exe",
    [string]$PythonPath = "python",
    [string]$InstallRoot,
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
    $caption = [string]$facts.os_caption
    $edition = [string]$facts.edition
    $isWindows11 = $caption -match "Windows 11"
    $supportedEdition = $edition -match "Pro|Enterprise"
    $isAdmin = [bool]$facts.is_admin
    $virtualization = [bool]$facts.virtualization_firmware_enabled
    $internet = [bool]$facts.internet_available

    Add-Check $checks "windows-version" $isWindows11 "Stage 3A target is Windows 11 Pro/Enterprise." "Use a Windows 11 Pro or Enterprise machine for Stage 3A."
    Add-Check $checks "windows-edition" $supportedEdition "Stage 3A supports Pro/Enterprise editions." "Use Windows 11 Pro or Enterprise; Home/managed-machine discovery is Stage 3B+ scope."
    Add-Check $checks "local-admin" $isAdmin "Local administrator rights are required for Windows features and Docker Desktop installation." "Sign in as a local admin or rerun from an elevated shell."
    Add-Check $checks "hardware-virtualization" $virtualization "Hardware virtualization must already be enabled for WSL2/Docker Desktop." "Enable virtualization in firmware/BIOS before rerunning."
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
    if ($PlanOnly) {
        Write-BootstrapLog "stage1" "PlanOnly: would enable Windows feature $FeatureName"
        return [ordered]@{ feature = $FeatureName; status = "planned"; restart_needed = $true }
    }
    $feature = Enable-WindowsOptionalFeature -Online -FeatureName $FeatureName -All -NoRestart
    return [ordered]@{
        feature = $FeatureName
        status = $feature.RestartNeeded -or $feature.Online
        restart_needed = [bool]$feature.RestartNeeded
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
    $features = @()
    $features += Invoke-FeatureCommand "Microsoft-Windows-Subsystem-Linux"
    $features += Invoke-FeatureCommand "VirtualMachinePlatform"
    $wslDefault = [ordered]@{ status = "not_run"; restart_needed_first = $false }
    if ($PlanOnly) {
        $wslDefault = [ordered]@{ status = "planned"; command = "wsl --set-default-version 2" }
    } else {
        $wslOutput = & wsl --set-default-version 2 2>&1
        $wslDefault = [ordered]@{ status = $(if ($LASTEXITCODE -eq 0) { "passed" } else { "failed" }); output = ($wslOutput -join "`n") }
    }
    $restartNeeded = [bool](@($features | Where-Object { $_.restart_needed }).Count -gt 0)
    $resume = $null
    if ($restartNeeded) {
        $resume = Register-Resume
    }
    $stage1 = [ordered]@{
        status = "passed"
        features = $features
        wsl_default_version = $wslDefault
        restart_needed = $restartNeeded
        resume = $resume
    }
    Write-BootstrapLog "stage1" "Stage1 WSL2 feature enablement finished; restart_needed=$restartNeeded"
    return $stage1
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
    $process = Start-Process -FilePath $installer -ArgumentList @("/S") -Wait -PassThru
    if ($process.ExitCode -ne 0) {
        throw "Ollama installer exited with code $($process.ExitCode)."
    }
    return [ordered]@{ status = "passed"; source = $installer; installed = $true }
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
    $stage2 = [ordered]@{
        status = "passed"
        docker_desktop = $dockerResult
        ollama = $ollamaResult
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
    $stage4 = [ordered]@{
        status = $verify.status
        verify = $verify
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
    }
    if ($Stage -eq "Stage2" -or $Stage -eq "Stage0To4") {
        $result.stage2 = Invoke-Stage2
    }
    if ($Stage -eq "Stage3" -or $Stage -eq "Stage0To4") {
        $result.stage3 = Invoke-Stage3
    }
    if ($Stage -eq "Stage4" -or $Stage -eq "Stage0To4") {
        $result.stage4 = Invoke-Stage4
    }
    Complete-Bootstrap "passed"
    exit 0
} catch {
    $result.failure = [ordered]@{
        message = $_.Exception.Message
        actionable_message = "Fix the named Stage0/Stage1 prerequisite issue, then rerun the idempotent bootstrapper. CivicSuite only owns its logs and resume task."
    }
    Write-BootstrapLog "failure" $_.Exception.Message
    Complete-Bootstrap "failed"
    exit 1
}
