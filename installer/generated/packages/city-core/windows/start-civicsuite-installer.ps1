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

Write-Host "CivicSuite OSS public-use starter installer package"
Write-Host "Signing status: unsigned. Windows may show SmartScreen or unknown publisher warnings."
Write-Host "Trust path: verify the SHA256 checksum from installer\dist and the official CivicSuite release source before running lifecycle commands."
Write-Host "Project status: public-use starter release; the installer is intentionally unsigned."

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
    python $Lifecycle install @LifecycleModeArgs @LifecycleModuleArgs
    exit $LASTEXITCODE
}

if ($Verify) {
    python $Lifecycle verify @LifecycleModeArgs @LifecycleModuleArgs
    exit $LASTEXITCODE
}

if ($Repair) {
    python $Lifecycle repair @LifecycleModeArgs @LifecycleModuleArgs
    exit $LASTEXITCODE
}

if ($Backup) {
    python $Lifecycle backup @LifecycleModuleArgs
    exit $LASTEXITCODE
}

if ($Restore) {
    python $Lifecycle restore @LifecycleModuleArgs
    exit $LASTEXITCODE
}

if ($Uninstall) {
    python $Lifecycle uninstall @LifecycleModuleArgs
    exit $LASTEXITCODE
}

python $Planner @PlannerArgs --show-readiness --detect-host
exit $LASTEXITCODE
