param(
    [switch]$Readiness,
    [switch]$Plan,
    [switch]$Install,
    [switch]$Verify,
    [switch]$Repair,
    [switch]$Uninstall
)

$ErrorActionPreference = "Stop"
$PackageDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Resolve-Path (Join-Path $PackageDir "..\..\..\..\..")
$Planner = Join-Path $RepoRoot "scripts\plan-installer.py"
$Lifecycle = Join-Path $RepoRoot "scripts\run-clerk-core-installer.py"

Write-Host "CivicSuite OSS beta installer package"
Write-Host "Signing status: unsigned. Windows may show SmartScreen or unknown publisher warnings."
Write-Host "Trust path: verify the SHA256 checksum from installer\dist and the official CivicSuite release source before running lifecycle commands."
Write-Host "Project status: small free open-source beta; the public installer is intentionally unsigned."

if ($Plan) {
    python $Planner --profile clerk-core --menu-style guided --dry-run
    exit $LASTEXITCODE
}

if ($Install) {
    python $Lifecycle install
    exit $LASTEXITCODE
}

if ($Verify) {
    python $Lifecycle verify
    exit $LASTEXITCODE
}

if ($Repair) {
    python $Lifecycle repair
    exit $LASTEXITCODE
}

if ($Uninstall) {
    python $Lifecycle uninstall
    exit $LASTEXITCODE
}

python $Planner --profile clerk-core --menu-style guided --show-readiness --detect-host --dry-run
exit $LASTEXITCODE
