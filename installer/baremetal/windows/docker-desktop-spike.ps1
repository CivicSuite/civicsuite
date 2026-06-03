param(
    [string]$LogRoot,
    [string]$DockerCliPath,
    [string]$DockerDesktopPath,
    [string]$DockerInstallerPath,
    [string]$DockerInstallerSha256,
    [string]$DockerSettingsPath,
    [string]$DockerInstallerUrl = "https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe",
    [int]$EngineTimeoutSeconds = 600,
    [int]$PollIntervalSeconds = 5,
    [switch]$NoDownload,
    [switch]$SkipDesktopStart,
    [switch]$UseOnlyExplicitPaths
)

$ErrorActionPreference = "Stop"

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $LogRoot) {
    $LogRoot = Join-Path $scriptRoot "logs"
}
New-Item -ItemType Directory -Force -Path $LogRoot | Out-Null

$startedAt = Get-Date
$transcriptPath = Join-Path $LogRoot "docker-desktop-spike.log"
$resultPath = Join-Path $LogRoot "docker-desktop-spike-result.json"

$result = [ordered]@{
    phase = "docker_desktop_spike"
    started_at = $startedAt.ToUniversalTime().ToString("o")
    completed_at = $null
    status = "running"
    docker_present = $false
    installed = $false
    wsl_integration = $false
    engine_ready = $false
    durations = [ordered]@{}
    failure = $null
    log_path = $transcriptPath
}

function Write-StepLog {
    param([string]$Step, [string]$Message)
    $timestamp = (Get-Date).ToUniversalTime().ToString("o")
    Add-Content -Path $transcriptPath -Encoding UTF8 -Value "$timestamp [$Step] $Message"
}

function Complete-Result {
    param([string]$Status)
    $completedAt = Get-Date
    $result.completed_at = $completedAt.ToUniversalTime().ToString("o")
    $result.status = $Status
    $result.durations.total_seconds = [math]::Round(($completedAt - $startedAt).TotalSeconds, 3)
    $json = $result | ConvertTo-Json -Depth 8
    [System.IO.File]::WriteAllText($resultPath, $json, [System.Text.UTF8Encoding]::new($false))
    Write-StepLog "result" "Wrote structured result to $resultPath"
}

function Find-DockerCli {
    if ($DockerCliPath -and (Test-Path -LiteralPath $DockerCliPath)) {
        return (Resolve-Path -LiteralPath $DockerCliPath).Path
    }
    if ($UseOnlyExplicitPaths) {
        return $null
    }
    $command = Get-Command docker -ErrorAction SilentlyContinue
    if ($command) {
        return $command.Source
    }
    $default = Join-Path $env:ProgramFiles "Docker\Docker\resources\bin\docker.exe"
    if (Test-Path -LiteralPath $default) {
        return $default
    }
    return $null
}

function Find-DockerDesktop {
    if ($DockerDesktopPath -and (Test-Path -LiteralPath $DockerDesktopPath)) {
        return (Resolve-Path -LiteralPath $DockerDesktopPath).Path
    }
    if ($UseOnlyExplicitPaths) {
        return $null
    }
    $default = Join-Path $env:ProgramFiles "Docker\Docker\Docker Desktop.exe"
    if (Test-Path -LiteralPath $default) {
        return $default
    }
    return $null
}

function Install-DockerDesktop {
    $installStarted = Get-Date
    $installer = $DockerInstallerPath
    if (-not $installer) {
        if ($NoDownload) {
            throw "Docker Desktop is not installed and downloads are disabled. Provide DockerInstallerPath or install Docker Desktop, then rerun."
        }
        $installer = Join-Path $LogRoot "DockerDesktopInstaller.exe"
        Write-StepLog "install" "Downloading Docker Desktop installer to $installer"
        Invoke-WebRequest -Uri $DockerInstallerUrl -OutFile $installer
    }
    if (-not (Test-Path -LiteralPath $installer)) {
        throw "Docker Desktop installer was not found at $installer. Provide a valid DockerInstallerPath."
    }
    if ($DockerInstallerSha256) {
        $actualHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $installer).Hash.ToLowerInvariant()
        if ($actualHash -ne $DockerInstallerSha256.ToLowerInvariant()) {
            throw "Docker Desktop installer checksum mismatch. Expected $DockerInstallerSha256 but found $actualHash."
        }
    }

    Write-StepLog "install" "Starting Docker Desktop silent install with documented install --quiet --accept-license flags"
    if ([System.IO.Path]::GetExtension($installer).ToLowerInvariant() -eq ".ps1") {
        $process = Start-Process -FilePath "powershell.exe" -ArgumentList @("-NoProfile", "-ExecutionPolicy", "Bypass", "-File", $installer, "install", "--quiet", "--accept-license") -Wait -PassThru
    } else {
        $process = Start-Process -FilePath $installer -ArgumentList @("install", "--quiet", "--accept-license") -Wait -PassThru
    }
    $result.durations.install_seconds = [math]::Round(((Get-Date) - $installStarted).TotalSeconds, 3)
    if ($process.ExitCode -ne 0) {
        throw "Docker Desktop installer exited with code $($process.ExitCode). Review $transcriptPath and the Docker Desktop installer logs."
    }
    $result.installed = $true
}

function Ensure-WslIntegration {
    $settingsStarted = Get-Date
    $settingsPath = $DockerSettingsPath
    if (-not $settingsPath) {
        $settingsDir = Join-Path $env:APPDATA "Docker"
        $settingsPath = Join-Path $settingsDir "settings-store.json"
    } else {
        $settingsDir = Split-Path -Parent $settingsPath
    }
    New-Item -ItemType Directory -Force -Path $settingsDir | Out-Null
    $settings = [ordered]@{}
    if (Test-Path -LiteralPath $settingsPath) {
        $raw = Get-Content -LiteralPath $settingsPath -Raw
        if ($raw.Trim()) {
            $parsed = $raw | ConvertFrom-Json
            foreach ($property in $parsed.PSObject.Properties) {
                $settings[$property.Name] = $property.Value
            }
        }
    }
    $settings["wslEngineEnabled"] = $true
    if (-not $settings.Contains("integratedWslDistros")) {
        $settings["integratedWslDistros"] = @()
    }
    $settings | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $settingsPath -Encoding UTF8
    $result.wsl_integration = $true
    $result.durations.wsl_integration_seconds = [math]::Round(((Get-Date) - $settingsStarted).TotalSeconds, 3)
    Write-StepLog "wsl" "Ensured Docker Desktop WSL engine setting at $settingsPath"
}

function Start-DockerDesktop {
    if ($SkipDesktopStart) {
        Write-StepLog "start" "Skipping Docker Desktop process start by explicit request"
        return
    }
    $desktop = Find-DockerDesktop
    if (-not $desktop) {
        Write-StepLog "start" "Docker Desktop executable not found after install; relying on docker CLI polling"
        return
    }
    Write-StepLog "start" "Starting Docker Desktop from $desktop"
    Start-Process -FilePath $desktop | Out-Null
}

function Poll-DockerEngine {
    $pollStarted = Get-Date
    $deadline = $pollStarted.AddSeconds($EngineTimeoutSeconds)
    $attempt = 0
    while ((Get-Date) -lt $deadline) {
        $attempt += 1
        $cli = Find-DockerCli
        if ($cli) {
            $result.docker_present = $true
            Write-StepLog "engine" "Poll $attempt using $cli"
            # docker info fails (with stderr) while the engine is still starting — the
            # whole point of this poll loop. Scope ErrorActionPreference to Continue so the
            # stderr from a failed `docker info` is NOT turned into a terminating
            # NativeCommandError under the script-wide Stop preference (which would abort the
            # poll instead of retrying). Capture exit code and merged output, then decide.
            $eapPrevious = $ErrorActionPreference
            $ErrorActionPreference = "Continue"
            try {
                $output = & $cli info 2>&1
                $exitCode = $LASTEXITCODE
            } finally {
                $ErrorActionPreference = $eapPrevious
            }
            if ($exitCode -eq 0) {
                $outputText = $output -join "`n"
                if ($outputText -notmatch "(?im)^Server:") {
                    Write-StepLog "engine" "Poll $attempt returned exit 0 but no Docker server section was present"
                    Start-Sleep -Seconds $PollIntervalSeconds
                    continue
                }
                $result.engine_ready = $true
                $result.durations.engine_ready_seconds = [math]::Round(((Get-Date) - $pollStarted).TotalSeconds, 3)
                Write-StepLog "engine" "Docker engine ready after $attempt poll(s)"
                return
            }
            Write-StepLog "engine" "Poll $attempt failed with exit $exitCode`: $($output -join ' ')"
        } else {
            Write-StepLog "engine" "Poll $attempt skipped because docker CLI is not present yet"
        }
        Start-Sleep -Seconds $PollIntervalSeconds
    }
    throw "Docker engine was not ready within $EngineTimeoutSeconds seconds. Open Docker Desktop, confirm WSL2 integration is enabled, then rerun this spike. Logs: $transcriptPath"
}

try {
    Write-StepLog "start" "Starting CivicSuite Docker Desktop spike"
    $initialCli = Find-DockerCli
    $initialDesktop = Find-DockerDesktop
    if ($initialCli -or $initialDesktop) {
        $result.docker_present = $true
        Write-StepLog "detect" "Docker Desktop appears present"
    } else {
        Write-StepLog "detect" "Docker Desktop not detected"
        Install-DockerDesktop
    }
    Ensure-WslIntegration
    Start-DockerDesktop
    Poll-DockerEngine
    Complete-Result "passed"
    exit 0
} catch {
    $result.failure = [ordered]@{
        message = $_.Exception.Message
        actionable_message = "Fix the named prerequisite phase, then rerun this idempotent spike. CivicSuite does not uninstall Docker Desktop, WSL, or Ollama on failure."
    }
    Write-StepLog "failure" $_.Exception.Message
    Complete-Result "failed"
    exit 1
}
