param(
    [switch]$Readiness,
    [switch]$Plan,
    [switch]$Install,
    [switch]$Verify,
    [switch]$Repair,
    [switch]$Backup,
    [switch]$Restore,
    [switch]$Uninstall,
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
