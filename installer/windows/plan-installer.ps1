param(
    [string]$Profile = "clerk-core",
    [string]$MenuStyle = "guided",
    [switch]$ShowMenu,
    [switch]$ShowReadiness,
    [switch]$DetectHost,
    [string]$ReadinessScenario = "nominal",
    [switch]$Execute,
    [switch]$ShowExecutorDesign,
    [switch]$ShowEvidenceSchema,
    [string]$ApprovalToken = "",
    [string[]]$Module = @()
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Resolve-Path (Join-Path $ScriptDir "..\..")
$Planner = Join-Path $RepoRoot "scripts\plan-installer.py"

$ArgsList = @($Planner, "--profile", $Profile, "--menu-style", $MenuStyle, "--dry-run")
if ($ShowMenu) {
    $ArgsList += "--show-menu"
}
if ($ShowReadiness) {
    $ArgsList += @("--show-readiness", "--readiness-scenario", $ReadinessScenario)
    if ($DetectHost) {
        $ArgsList += "--detect-host"
    }
}
if ($Execute) {
    $ArgsList += "--execute"
    if ($ApprovalToken) {
        $ArgsList += @("--approval-token", $ApprovalToken)
    }
}
if ($ShowExecutorDesign) {
    $ArgsList += "--show-executor-design"
}
if ($ShowEvidenceSchema) {
    $ArgsList += "--show-evidence-schema"
}
foreach ($ModuleId in $Module) {
    $ArgsList += @("--module", $ModuleId)
}

Write-Host "CivicSuite installer launcher: Windows dry-run only"
Write-Host "Profile: $Profile"
Write-Host "Menu style: $MenuStyle"
if ($ShowReadiness) {
    Write-Host "Readiness scenario: $ReadinessScenario"
    if ($DetectHost) {
        Write-Host "Detection mode: host read-only"
    }
}
if ($Execute) {
    Write-Host "Execution gate requested: blocked by default"
}
if ($ShowExecutorDesign) {
    Write-Host "Executor design requested: dry-run only"
}
if ($ShowEvidenceSchema) {
    Write-Host "Evidence schema requested: dry-run only"
}
python @ArgsList
