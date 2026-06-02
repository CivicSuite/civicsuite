param(
    [string]$LogRoot,
    [string]$BootstrapPath,
    [string]$BootstrapResultPath,
    [switch]$PlanOnly
)

$ErrorActionPreference = "Stop"

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $LogRoot) {
    $LogRoot = Join-Path $scriptRoot "logs"
}
if (-not $BootstrapPath) {
    $BootstrapPath = Join-Path $scriptRoot "civicsuite-baremetal-bootstrap.ps1"
}
New-Item -ItemType Directory -Force -Path $LogRoot | Out-Null

$summaryPath = Join-Path $LogRoot "civicsuite-baremetal-progress.txt"
$resultPath = Join-Path $LogRoot "civicsuite-baremetal-progress-result.json"

function Write-JsonNoBom {
    param([string]$Path, [object]$Value)
    $json = $Value | ConvertTo-Json -Depth 10
    [System.IO.File]::WriteAllText($Path, $json, [System.Text.UTF8Encoding]::new($false))
}

function Get-PhaseStatus {
    param([object]$Result, [string]$Name)
    $node = $Result.PSObject.Properties[$Name]
    if ($null -eq $node -or $null -eq $node.Value) {
        return "not_run"
    }
    return [string]$node.Value.status
}

function Render-ProgressSummary {
    param([object]$BootstrapResult)
    $lines = New-Object System.Collections.Generic.List[string]
    $lines.Add("CivicSuite Windows installer progress")
    $lines.Add("")
    $lines.Add("Stage0 target check: $(Get-PhaseStatus $BootstrapResult 'stage0')")
    $lines.Add("Stage1 WSL2/reboot resume: $(Get-PhaseStatus $BootstrapResult 'stage1')")
    $lines.Add("Stage2 Docker/Ollama prerequisites: $(Get-PhaseStatus $BootstrapResult 'stage2')")
    $lines.Add("Stage3 CivicSuite install: $(Get-PhaseStatus $BootstrapResult 'stage3')")
    $lines.Add("Stage4 verification: $(Get-PhaseStatus $BootstrapResult 'stage4')")
    $lines.Add("")
    $lines.Add("Logs: $($BootstrapResult.log_path)")
    if ([string]$BootstrapResult.status -eq "failed") {
        $message = ""
        if ($BootstrapResult.failure) {
            $message = [string]$BootstrapResult.failure.actionable_message
            if (-not $message) {
                $message = [string]$BootstrapResult.failure.message
            }
        }
        $lines.Add("Status: failed")
        $lines.Add("What to do next: $message")
    } else {
        $lines.Add("Status: $($BootstrapResult.status)")
        $lines.Add("CivicSuite is ready when Stage4 is passed. Open it here:")
        $lines.Add("- Suite launcher: http://127.0.0.1:18082/")
        $lines.Add("- CivicRecords AI: http://127.0.0.1:18080/")
        $lines.Add("- CivicClerk: http://127.0.0.1:18081/")
        $lines.Add("- CivicCode: http://127.0.0.1:18820/")
    }
    return $lines
}

try {
    if (-not $BootstrapResultPath) {
        $bootstrapLogRoot = Join-Path $LogRoot "bootstrap"
        $args = @("-NoProfile", "-ExecutionPolicy", "Bypass", "-File", $BootstrapPath, "-Stage", "Stage0To4", "-LogRoot", $bootstrapLogRoot)
        if ($PlanOnly) {
            $args += @("-PlanOnly", "-SkipElevation")
        }
        $process = Start-Process -FilePath "powershell.exe" -ArgumentList $args -Wait -PassThru
        $BootstrapResultPath = Join-Path $bootstrapLogRoot "civicsuite-baremetal-bootstrap-result.json"
        if ($process.ExitCode -ne 0 -and -not (Test-Path -LiteralPath $BootstrapResultPath)) {
            throw "Bootstrapper exited with code $($process.ExitCode) and did not write a result JSON."
        }
    }
    if (-not (Test-Path -LiteralPath $BootstrapResultPath)) {
        throw "Bootstrap result JSON was not found at $BootstrapResultPath."
    }
    $bootstrapResult = Get-Content -LiteralPath $BootstrapResultPath -Raw | ConvertFrom-Json
    $summary = Render-ProgressSummary -BootstrapResult $bootstrapResult
    $summary | Set-Content -LiteralPath $summaryPath -Encoding UTF8
    $wrapperResult = [ordered]@{
        status = $bootstrapResult.status
        bootstrap_result_path = $BootstrapResultPath
        summary_path = $summaryPath
        phases = [ordered]@{
            stage0 = Get-PhaseStatus $bootstrapResult "stage0"
            stage1 = Get-PhaseStatus $bootstrapResult "stage1"
            stage2 = Get-PhaseStatus $bootstrapResult "stage2"
            stage3 = Get-PhaseStatus $bootstrapResult "stage3"
            stage4 = Get-PhaseStatus $bootstrapResult "stage4"
        }
    }
    Write-JsonNoBom -Path $resultPath -Value $wrapperResult
    $summary | ForEach-Object { Write-Host $_ }
    exit $(if ([string]$bootstrapResult.status -eq "failed") { 1 } else { 0 })
} catch {
    $failure = [ordered]@{
        status = "failed"
        failure = [ordered]@{
            message = $_.Exception.Message
            actionable_message = "Open the progress summary and bootstrap logs, fix the named phase, then rerun the Windows installer."
        }
        summary_path = $summaryPath
    }
    Write-JsonNoBom -Path $resultPath -Value $failure
    @(
        "CivicSuite Windows installer progress",
        "",
        "Status: failed",
        "What to do next: $($failure.failure.actionable_message)",
        "Detail: $($failure.failure.message)"
    ) | Set-Content -LiteralPath $summaryPath -Encoding UTF8
    exit 1
}
