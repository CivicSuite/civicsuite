# SPDX-License-Identifier: Apache-2.0
# Copyright (c) The CivicSuite Authors

#Requires -Version 5.1
[CmdletBinding()]
param(
    [string]$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path,
    [string]$ManifestPath = "",
    [string]$PayloadRoot = "",
    [switch]$SkipDownloads,
    [switch]$SkipPgvectorBuild
)

$ErrorActionPreference = "Stop"

function Read-JsonFile {
    param([string]$Path)
    return Get-Content -LiteralPath $Path -Raw | ConvertFrom-Json
}

function Write-JsonFile {
    param(
        [string]$Path,
        [object]$Value
    )
    $Parent = Split-Path -Parent $Path
    if ($Parent) {
        New-Item -ItemType Directory -Force -Path $Parent | Out-Null
    }
    $Value | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath $Path -Encoding UTF8
}

function Get-Sha256 {
    param([string]$Path)
    return (Get-FileHash -Algorithm SHA256 -LiteralPath $Path).Hash.ToLowerInvariant()
}

function Invoke-CivicDownload {
    param(
        [string]$Url,
        [string]$Destination
    )
    if ($SkipDownloads) {
        throw "Download required but -SkipDownloads was supplied: $Url"
    }
    $Parent = Split-Path -Parent $Destination
    New-Item -ItemType Directory -Force -Path $Parent | Out-Null
    Invoke-WebRequest -Uri $Url -OutFile $Destination -UseBasicParsing
    return Get-Sha256 -Path $Destination
}

function Expand-CivicZip {
    param(
        [string]$Archive,
        [string]$Destination
    )
    if (Test-Path -LiteralPath $Destination) {
        Remove-Item -LiteralPath $Destination -Recurse -Force
    }
    New-Item -ItemType Directory -Force -Path $Destination | Out-Null
    Expand-Archive -LiteralPath $Archive -DestinationPath $Destination -Force
}

function Copy-DirectoryContents {
    param(
        [string]$Source,
        [string]$Destination
    )
    if (Test-Path -LiteralPath $Destination) {
        Remove-Item -LiteralPath $Destination -Recurse -Force
    }
    New-Item -ItemType Directory -Force -Path $Destination | Out-Null
    Copy-Item -LiteralPath (Join-Path $Source "*") -Destination $Destination -Recurse -Force
}

function Get-PostgresBinaryUrl {
    param(
        [string]$DownloadPage,
        [int]$MajorVersion
    )
    if ($SkipDownloads) {
        throw "PostgreSQL download discovery requires network access."
    }
    $Html = (Invoke-WebRequest -Uri $DownloadPage -UseBasicParsing).Content
    $Normalized = $Html -replace "><", ">`n<"
    $Lines = $Normalized -replace "`r", "" -split "`n"
    for ($Index = 0; $Index -lt $Lines.Count; $Index++) {
        if ($Lines[$Index] -match "Binaries from installer Version $MajorVersion\.") {
            $Window = $Lines[$Index..([Math]::Min($Index + 30, $Lines.Count - 1))] -join "`n"
            if ($Window -match "https://sbp\.enterprisedb\.com/getfile\.jsp\?fileid=\d+") {
                return $Matches[0]
            }
        }
    }
    throw "Could not discover PostgreSQL $MajorVersion Windows binary URL from $DownloadPage"
}

function Install-PostgresPayload {
    param(
        [object]$Source,
        [string]$CacheRoot,
        [string]$PayloadRoot
    )
    $Destination = Join-Path $PayloadRoot "postgres"
    if (Test-Path -LiteralPath (Join-Path $Destination "bin\pg_ctl.exe")) {
        return @{ status = "present"; path = $Destination }
    }
    $Url = Get-PostgresBinaryUrl -DownloadPage $Source.download_page -MajorVersion $Source.major_version
    $Archive = Join-Path $CacheRoot "postgres-windows-binaries.zip"
    $Sha = Invoke-CivicDownload -Url $Url -Destination $Archive
    $Extracted = Join-Path $CacheRoot "postgres-extracted"
    Expand-CivicZip -Archive $Archive -Destination $Extracted
    $PgRoot = Get-ChildItem -LiteralPath $Extracted -Directory -Recurse |
        Where-Object { Test-Path -LiteralPath (Join-Path $_.FullName "bin\pg_ctl.exe") } |
        Select-Object -First 1
    if (-not $PgRoot) {
        throw "PostgreSQL archive did not contain bin\pg_ctl.exe"
    }
    Copy-DirectoryContents -Source $PgRoot.FullName -Destination $Destination
    return @{ status = "installed"; url = $Url; sha256 = $Sha; path = $Destination }
}

function Install-PythonPayload {
    param(
        [object]$Source,
        [string]$CacheRoot,
        [string]$PayloadRoot
    )
    $Destination = Join-Path $PayloadRoot "python"
    if (Test-Path -LiteralPath (Join-Path $Destination "python.exe")) {
        return @{ status = "present"; path = $Destination }
    }
    $Archive = Join-Path $CacheRoot ("python-{0}-embed-amd64.zip" -f $Source.version)
    $Sha = Invoke-CivicDownload -Url $Source.download_url -Destination $Archive
    Expand-CivicZip -Archive $Archive -Destination $Destination
    $Pth = Join-Path $Destination $Source.pth_file
    if (Test-Path -LiteralPath $Pth) {
        $Content = Get-Content -LiteralPath $Pth
        $Content = $Content | ForEach-Object {
            if ($_ -eq "#import site") { "import site" } else { $_ }
        }
        $Content | Set-Content -LiteralPath $Pth -Encoding ASCII
    }
    New-Item -ItemType Directory -Force -Path (Join-Path $Destination "Lib\site-packages") | Out-Null
    return @{ status = "installed"; url = $Source.download_url; sha256 = $Sha; path = $Destination }
}

function Install-OllamaPayload {
    param(
        [object]$Source,
        [string]$CacheRoot,
        [string]$PayloadRoot
    )
    $Destination = Join-Path $PayloadRoot "ollama"
    if (Test-Path -LiteralPath (Join-Path $Destination "ollama.exe")) {
        return @{ status = "present"; path = $Destination }
    }
    if ($SkipDownloads) {
        throw "Ollama release lookup requires network access."
    }
    $Release = Invoke-RestMethod -Uri $Source.release_api -Headers @{ "User-Agent" = "CivicSuite-runtime-payload" }
    $Asset = $Release.assets | Where-Object { $_.name -eq $Source.asset_name_pattern } | Select-Object -First 1
    if (-not $Asset) {
        throw "Could not find Ollama asset $($Source.asset_name_pattern) in latest release."
    }
    $Archive = Join-Path $CacheRoot $Asset.name
    $Sha = Invoke-CivicDownload -Url $Asset.browser_download_url -Destination $Archive
    Expand-CivicZip -Archive $Archive -Destination $Destination
    if (-not (Test-Path -LiteralPath (Join-Path $Destination "ollama.exe"))) {
        $Ollama = Get-ChildItem -LiteralPath $Destination -Recurse -Filter "ollama.exe" | Select-Object -First 1
        if ($Ollama) {
            Copy-Item -LiteralPath $Ollama.FullName -Destination (Join-Path $Destination "ollama.exe") -Force
        }
    }
    return @{ status = "installed"; url = $Asset.browser_download_url; sha256 = $Sha; version = $Release.tag_name; path = $Destination }
}

function Install-PgvectorPayload {
    param(
        [object]$Source,
        [string]$CacheRoot,
        [string]$PayloadRoot
    )
    $PostgresRoot = Join-Path $PayloadRoot "postgres"
    if ((Test-Path -LiteralPath (Join-Path $PostgresRoot "share\extension\vector.control")) -and
        (Test-Path -LiteralPath (Join-Path $PostgresRoot "lib\vector.dll"))) {
        return @{ status = "present"; path = $PostgresRoot }
    }
    if ($SkipPgvectorBuild) {
        return @{ status = "skipped"; reason = "SkipPgvectorBuild"; path = $PostgresRoot }
    }
    if (-not (Get-Command cl.exe -ErrorAction SilentlyContinue) -or -not (Get-Command nmake.exe -ErrorAction SilentlyContinue)) {
        throw "MSVC cl.exe and nmake.exe are required to build pgvector for the Windows payload."
    }
    if (-not (Get-Command git.exe -ErrorAction SilentlyContinue)) {
        throw "git.exe is required to fetch pgvector."
    }
    $SourceDir = Join-Path $CacheRoot "pgvector"
    if (-not (Test-Path -LiteralPath $SourceDir)) {
        git clone --branch $Source.tag --depth 1 $Source.git_url $SourceDir
    }
    Push-Location $SourceDir
    try {
        $env:PGROOT = $PostgresRoot
        nmake /F Makefile.win
        nmake /F Makefile.win install
    } finally {
        Pop-Location
    }
    return @{ status = "installed"; tag = $Source.tag; path = $PostgresRoot }
}

if (-not $ManifestPath) {
    $ManifestPath = Join-Path $RepoRoot "desktop\runtime\windows-runtime-sources.json"
}
if (-not $PayloadRoot) {
    $PayloadRoot = Join-Path $RepoRoot "desktop\runtime\payload"
}

$Manifest = Read-JsonFile -Path $ManifestPath
if ($Manifest.schema_version -ne 1 -or $Manifest.profile -ne "windows-local-1.0") {
    throw "Unsupported runtime source manifest."
}

$CacheRoot = Join-Path $RepoRoot ".runtime-cache\windows-local-1.0"
New-Item -ItemType Directory -Force -Path $CacheRoot | Out-Null
New-Item -ItemType Directory -Force -Path $PayloadRoot | Out-Null

$Report = [ordered]@{
    generated_at = (Get-Date).ToUniversalTime().ToString("o")
    payload_root = $PayloadRoot
    postgres = Install-PostgresPayload -Source $Manifest.sources.postgres -CacheRoot $CacheRoot -PayloadRoot $PayloadRoot
    python = Install-PythonPayload -Source $Manifest.sources.python -CacheRoot $CacheRoot -PayloadRoot $PayloadRoot
    ollama = Install-OllamaPayload -Source $Manifest.sources.ollama -CacheRoot $CacheRoot -PayloadRoot $PayloadRoot
}
$Report.pgvector = Install-PgvectorPayload -Source $Manifest.sources.pgvector -CacheRoot $CacheRoot -PayloadRoot $PayloadRoot

Write-JsonFile -Path (Join-Path $PayloadRoot "runtime-payload-lock.json") -Value $Report
Write-Output ("Prepared CivicSuite Windows runtime payload at {0}" -f $PayloadRoot)
