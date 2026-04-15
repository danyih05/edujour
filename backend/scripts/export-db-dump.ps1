param(
    [string]$Host = $env:DB_HOST,
    [int]$Port = $(if ($env:DB_PORT) { [int]$env:DB_PORT } else { 3306 }),
    [string]$Database = $(if ($env:DB_NAME) { $env:DB_NAME } else { "gradquest" }),
    [string]$Username = $(if ($env:DB_USERNAME) { $env:DB_USERNAME } else { "gradquest" }),
    [string]$Password = $(if ($env:DB_PASSWORD) { $env:DB_PASSWORD } else { "GradQuest123!" }),
    [string]$OutputPath = (Join-Path $PSScriptRoot "..\sql\gradquest_mysql_dump.sql")
)

if (-not $Host) {
    $Host = "localhost"
}

$mysqldumpCommand = Get-Command mysqldump -ErrorAction SilentlyContinue
if (-not $mysqldumpCommand) {
    throw "mysqldump is not installed or not available on PATH."
}

$outputDirectory = Split-Path -Parent $OutputPath

if (-not (Test-Path -LiteralPath $outputDirectory)) {
    New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null
}

$resolvedOutputPath = [System.IO.Path]::GetFullPath($OutputPath)
$arguments = @(
    "--host=$Host",
    "--port=$Port",
    "--user=$Username",
    "--password=$Password",
    "--default-character-set=utf8mb4",
    "--single-transaction",
    "--skip-lock-tables",
    "--no-tablespaces",
    "--result-file=$resolvedOutputPath",
    $Database
)

& $mysqldumpCommand.Source @arguments

if ($LASTEXITCODE -ne 0) {
    throw "Failed to export MySQL dump from $Host:$Port/$Database"
}

Write-Host "MySQL dump exported to: $resolvedOutputPath"
