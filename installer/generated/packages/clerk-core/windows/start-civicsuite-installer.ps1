param(
    [switch]$Readiness,
    [switch]$Plan,
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

python $Planner --profile clerk-core --menu-style guided --show-readiness --detect-host --dry-run
exit $LASTEXITCODE
