# CivicSuite Stage 3A - stack teardown
#
# Removes the city-core Docker STACK state (containers, volumes, networks) so a re-install
# starts from a clean stack. Does NOT uninstall Docker Desktop, WSL2, Ollama, or Python, and
# does NOT remove the pulled Ollama models (those live in the host Ollama, not a Docker volume),
# so re-provisioning (incl. the 9.6 GB model) is not repeated.
#
# Why: Postgres sets its password only on the FIRST init of an empty data volume. A persisted
# volume from a prior run rejects freshly generated credentials ("password authentication
# failed for user civicclerk"). Clearing the stack volumes lets Postgres re-init with the
# current run's credentials. A genuinely fresh machine never hits this; this teardown makes an
# incremental box behave like a clean stack for the live gate.

$ErrorActionPreference = "Continue"
Write-Output "=== CivicSuite stack teardown ==="

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Output "docker not found on PATH; nothing to tear down."
    return
}

# Containers whose name contains 'civicsuite'
$containers = @(& docker ps -aq --filter "name=civicsuite" 2>$null | Where-Object { $_ })
if ($containers.Count -gt 0) {
    & docker rm -f @containers 2>&1 | Out-Null
    Write-Output "removed containers: $($containers.Count)"
} else {
    Write-Output "no civicsuite containers"
}

# Volumes whose name contains 'civicsuite' (postgres/redis/ollama data, etc.)
$volumes = @(& docker volume ls -q 2>$null | Where-Object { $_ -match "civicsuite" })
if ($volumes.Count -gt 0) {
    & docker volume rm @volumes 2>&1 | Out-Null
    Write-Output "removed volumes: $($volumes.Count)"
} else {
    Write-Output "no civicsuite volumes"
}

# Networks whose name contains 'civicsuite'
$networks = @(& docker network ls --format "{{.Name}}" 2>$null | Where-Object { $_ -match "civicsuite" })
foreach ($n in $networks) { & docker network rm $n 2>&1 | Out-Null }
if ($networks.Count -gt 0) { Write-Output "removed networks: $($networks.Count)" } else { Write-Output "no civicsuite networks" }

Write-Output "=== teardown complete - stack state cleared; prerequisites preserved ==="
