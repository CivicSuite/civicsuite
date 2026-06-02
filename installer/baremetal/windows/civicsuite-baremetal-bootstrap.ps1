param(
    [ValidateSet("Stage0", "Stage1", "Stage0Stage1")]
    [string]$Stage = "Stage0Stage1",
    [string]$LogRoot,
    [string]$HostFactsJson,
    [switch]$PlanOnly,
    [switch]$SkipElevation,
    [string]$ResumeTaskName = "CivicSuiteBaremetalResume",
    [string]$ResumeCommand
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

try {
    Write-BootstrapLog "start" "Starting CivicSuite bare-metal bootstrap stage $Stage"
    if (Ensure-Elevated) {
        $result.status = "elevation_requested"
        Complete-Bootstrap "elevation_requested"
        exit 0
    }

    if ($Stage -eq "Stage0" -or $Stage -eq "Stage0Stage1") {
        $result.stage0 = Invoke-Stage0
        if ($result.stage0.status -ne "passed") {
            Complete-Bootstrap "failed"
            exit 1
        }
    }
    if ($Stage -eq "Stage1" -or $Stage -eq "Stage0Stage1") {
        $result.stage1 = Invoke-Stage1
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
