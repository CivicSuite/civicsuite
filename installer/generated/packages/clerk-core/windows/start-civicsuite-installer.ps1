param(
    [switch]$Readiness,
    [switch]$Plan,
    [switch]$Install,
    [switch]$Verify,
    [switch]$Repair,
    [switch]$Uninstall,
    [switch]$Gate
)

$ErrorActionPreference = "Stop"
$PackageDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Resolve-Path (Join-Path $PackageDir "..\..\..\..\..")
$Planner = Join-Path $RepoRoot "scripts\plan-installer.py"

if ($Gate) {
    python $Planner --profile clerk-core --menu-style guided --run-cleanroom-gate
    exit $LASTEXITCODE
}

if ($Plan) {
    python $Planner --profile clerk-core --menu-style guided --dry-run
    exit $LASTEXITCODE
}

if ($Install) {
    python $Planner --profile clerk-core --menu-style guided --execute --dry-run
    exit $LASTEXITCODE
}

if ($Verify) {
    python $Planner --profile clerk-core --menu-style guided --show-health-checks --dry-run
    exit $LASTEXITCODE
}

if ($Repair) {
    python $Planner --profile clerk-core --menu-style guided --show-preflight --dry-run
    exit $LASTEXITCODE
}

if ($Uninstall) {
    python $Planner --profile clerk-core --menu-style guided --show-executor-design --dry-run
    exit $LASTEXITCODE
}

python $Planner --profile clerk-core --menu-style guided --show-readiness --detect-host --dry-run
exit $LASTEXITCODE
