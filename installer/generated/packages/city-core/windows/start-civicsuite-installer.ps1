param(
    [switch]$Readiness,
    [switch]$Plan,
    [switch]$Install,
    [switch]$Verify,
    [switch]$Repair,
    [switch]$Backup,
    [switch]$Restore,
    [switch]$Uninstall,
    [switch]$FirstRun,
    [switch]$GuidedSetup,
    [switch]$ManualPrerequisite,
    [ValidateSet("protected", "bearer", "open")]
    [string]$StaffMode = "protected",
    [switch]$WorkflowProof,
    [string[]]$Module
)

$ErrorActionPreference = "Stop"
$PackageDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Resolve-Path (Join-Path $PackageDir "..\..\..\..\..")
$Planner = Join-Path $RepoRoot "scripts\plan-installer.py"
$Lifecycle = Join-Path $RepoRoot "scripts\run-clerk-core-installer.py"

function ConvertTo-WslArg([string]$Value) {
    $SingleQuote = [char]39
    $Replacement = $SingleQuote + '"' + $SingleQuote + '"' + $SingleQuote
    return $SingleQuote + $Value.Replace([string]$SingleQuote, $Replacement) + $SingleQuote
}

function ConvertTo-WslPath([string]$Value) {
    $Resolved = [System.IO.Path]::GetFullPath($Value)
    if ($Resolved -match '^([A-Za-z]):\\(.*)$') {
        $Drive = $Matches[1].ToLowerInvariant()
        $Tail = $Matches[2] -replace [regex]::Escape([string][char]92), '/'
        return "/mnt/$Drive/$Tail"
    }
    $Converted = & wsl wslpath -a $Resolved 2>$null
    if ($LASTEXITCODE -ne 0 -or -not $Converted) {
        throw "Could not translate Windows path for WSL: $Resolved"
    }
    return ($Converted | Select-Object -First 1).Trim()
}

function Test-WslDocker {
    $null = & wsl bash -lc 'docker info --format "{{.ServerVersion}}" >/dev/null 2>&1'
    return $LASTEXITCODE -eq 0
}

function Test-CivicSuiteAdmin {
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($identity)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Get-CivicSuiteBootstrapReportDir {
    $ReportDir = Join-Path $RepoRoot "installer\reports\docker-wsl-bootstrap"
    New-Item -ItemType Directory -Force -Path $ReportDir | Out-Null
    return $ReportDir
}

function Write-CivicSuiteBootstrapLog([string]$Name, [string]$Content) {
    $ReportDir = Get-CivicSuiteBootstrapReportDir
    $Path = Join-Path $ReportDir $Name
    $Content | Out-File -FilePath $Path -Encoding utf8
    Write-Host "Bootstrap evidence: $Path"
}

function Register-CivicSuiteRunOnce {
    $Command = "powershell.exe -NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`" -FirstRun"
    New-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\RunOnce" -Name "CivicSuiteInstallerResume" -Value $Command -PropertyType String -Force | Out-Null
    Write-Host "CivicSuite will resume after reboot using Windows RunOnce."
}

function Invoke-CivicSuiteGuidedSetup {
    if (-not (Test-CivicSuiteAdmin)) {
        Write-Host "CivicSuite needs Windows administrator consent to install WSL/Docker prerequisites."
        Start-Process powershell.exe -Verb RunAs -ArgumentList @("-NoProfile", "-ExecutionPolicy", "Bypass", "-File", $PSCommandPath, "-GuidedSetup")
        exit 0
    }

    $Build = [Environment]::OSVersion.Version.Build
    $Arch = $env:PROCESSOR_ARCHITECTURE
    if ($Build -lt 19041) {
        Write-Error "Windows 10 build 19041+ or Windows 11 is required. Ask IT to upgrade Windows, then rerun CivicSuite."
        exit 2
    }
    if ($Arch -notin @("AMD64", "IA64")) {
        Write-Error "This CivicSuite installer supports AMD64 Windows only in this run. ARM Windows is out of scope."
        exit 2
    }

    $ReportDir = Get-CivicSuiteBootstrapReportDir
    $WslStatus = (& wsl --status 2>&1 | Out-String)
    Write-CivicSuiteBootstrapLog "windows-wsl-status-before.txt" $WslStatus
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Installing WSL2 and Virtual Machine Platform with Microsoft's official wsl --install path."
        $WslInstall = (& wsl --install 2>&1 | Out-String)
        Write-CivicSuiteBootstrapLog "windows-wsl-install.txt" $WslInstall
        Register-CivicSuiteRunOnce
        Write-Host "If Windows asks to reboot, reboot now. CivicSuite will resume automatically."
        exit $LASTEXITCODE
    }

    $DockerDesktop = Join-Path $env:ProgramFiles "Docker\Docker\Docker Desktop.exe"
    if (-not (Test-Path $DockerDesktop)) {
        $InstallerUrl = "https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe"
        $InstallerPath = Join-Path $ReportDir "Docker Desktop Installer.exe"
        Write-Host "Downloading Docker Desktop from the official Docker Desktop URL."
        Invoke-WebRequest -Uri $InstallerUrl -OutFile $InstallerPath
        $Hash = Get-FileHash -Algorithm SHA256 -Path $InstallerPath
        Write-CivicSuiteBootstrapLog "docker-desktop-download.json" (@{ url = $InstallerUrl; path = $InstallerPath; sha256 = $Hash.Hash; downloaded_at = (Get-Date).ToUniversalTime().ToString("o") } | ConvertTo-Json)
        $InstallLog = Join-Path $ReportDir "docker-desktop-install.txt"
        $Proc = Start-Process -FilePath $InstallerPath -ArgumentList @("install", "--quiet") -Wait -PassThru -RedirectStandardOutput $InstallLog -RedirectStandardError "$InstallLog.err"
        Register-CivicSuiteRunOnce
        if ($Proc.ExitCode -ne 0) {
            Write-Error "Docker Desktop installer exited with $($Proc.ExitCode). Review $InstallLog and $InstallLog.err, then ask IT for help."
            exit $Proc.ExitCode
        }
        Write-Host "Docker Desktop installed. Start Docker Desktop, accept Docker's license at first start, then rerun CivicSuite if it does not resume automatically."
        exit 0
    }

    Write-Host "Guided setup prerequisites are present. Continuing with CivicSuite readiness."
}

function Invoke-CivicSuiteLifecycle([string]$Mode, [string[]]$LifecycleArgs) {
    if (Test-WslDocker) {
        $RepoRootWsl = ConvertTo-WslPath $RepoRoot
        $EnvParts = @()
        if ($env:CIVICSUITE_INSTALLER_RUN_ID) {
            $EnvParts += "export CIVICSUITE_INSTALLER_RUN_ID=$(ConvertTo-WslArg $env:CIVICSUITE_INSTALLER_RUN_ID);"
        }
        if ($env:CIVICSUITE_INSTALLER_INSTALL_ROOT) {
            $InstallRootWsl = ConvertTo-WslPath $env:CIVICSUITE_INSTALLER_INSTALL_ROOT
            $EnvParts += "export CIVICSUITE_INSTALLER_INSTALL_ROOT=$(ConvertTo-WslArg $InstallRootWsl);"
        }
        $AllArgs = @($Mode) + @($LifecycleArgs)
        $QuotedArgs = $AllArgs | ForEach-Object { ConvertTo-WslArg $_ }
        $Command = ($EnvParts -join " ") + " cd $(ConvertTo-WslArg $RepoRootWsl) && python3 scripts/run-clerk-core-installer.py " + ($QuotedArgs -join " ")
        & wsl bash -lc $Command
        exit $LASTEXITCODE
    }

    python $Lifecycle $Mode @LifecycleArgs
    exit $LASTEXITCODE
}

Write-Host "CivicSuite city-core unsigned beta installer package"
Write-Host "Signing status: unsigned. Windows may show SmartScreen or unknown publisher warnings."
Write-Host "Trust path: verify the SHA256 checksum from installer\dist and the official CivicSuite release source before running lifecycle commands."
Write-Host "Project status: city-core beta; Linux and Windows matching-host lifecycle proof is required before promotion."

$PlannerArgs = @("--menu-style", "guided", "--dry-run")
$LifecycleModuleArgs = @()
$LifecycleModeArgs = @("--staff-mode", $StaffMode)
$DefaultProfileModules = @("civicrecords-ai", "civicclerk", "civiccode")
foreach ($DefaultModule in $DefaultProfileModules) {
    $LifecycleModuleArgs += @("--module", $DefaultModule)
}

if ($WorkflowProof) {
    $LifecycleModeArgs += "--workflow-proof"
}
if ($Module -and $Module.Count -gt 0) {
    $PlannerArgs = @("--profile", "custom") + $PlannerArgs
    $LifecycleModuleArgs = @()
    foreach ($SelectedModule in $Module) {
        $PlannerArgs += @("--module", $SelectedModule)
        $LifecycleModuleArgs += @("--module", $SelectedModule)
    }
} else {
    $PlannerArgs = @("--profile", "city-core") + $PlannerArgs
}

if ($Plan) {
    python $Planner @PlannerArgs
    exit $LASTEXITCODE
}

if ($GuidedSetup) {
    Invoke-CivicSuiteGuidedSetup
    python $Planner @PlannerArgs --show-readiness --detect-host
    exit $LASTEXITCODE
}

if ($FirstRun) {
    Write-Host ""
    Write-Host "Choose setup path:"
    Write-Host "1. Guided Setup - install missing WSL/Docker components with admin consent."
    Write-Host "2. Manual Prerequisite - Docker Desktop + WSL2 are already installed."
    $Choice = Read-Host "Enter 1 for Guided Setup or 2 for Manual Prerequisite"
    if ($Choice -eq "1") {
        Invoke-CivicSuiteGuidedSetup
    } elseif ($Choice -ne "2") {
        Write-Error "Choose 1 or 2. No installation was started."
        exit 2
    }
    python $Planner @PlannerArgs --show-readiness --detect-host
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    Invoke-CivicSuiteLifecycle "install" (@($LifecycleModeArgs) + @($LifecycleModuleArgs))
}

if ($ManualPrerequisite) {
    python $Planner @PlannerArgs --show-readiness --detect-host
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    Invoke-CivicSuiteLifecycle "install" (@($LifecycleModeArgs) + @($LifecycleModuleArgs))
}

if ($Install) {
    Invoke-CivicSuiteLifecycle "install" (@($LifecycleModeArgs) + @($LifecycleModuleArgs))
}

if ($Verify) {
    Invoke-CivicSuiteLifecycle "verify" (@($LifecycleModeArgs) + @($LifecycleModuleArgs))
}

if ($Repair) {
    Invoke-CivicSuiteLifecycle "repair" (@($LifecycleModeArgs) + @($LifecycleModuleArgs))
}

if ($Backup) {
    Invoke-CivicSuiteLifecycle "backup" (@($LifecycleModuleArgs))
}

if ($Restore) {
    Invoke-CivicSuiteLifecycle "restore" (@($LifecycleModuleArgs))
}

if ($Uninstall) {
    Invoke-CivicSuiteLifecycle "uninstall" (@($LifecycleModuleArgs))
}

python $Planner @PlannerArgs --show-readiness --detect-host
exit $LASTEXITCODE
