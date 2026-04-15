param(
    [string]$DbHost = "localhost",
    [string]$DbPort = "3306",
    [string]$DbName = "gradquest",
    [string]$DbUsername = "gradquest",
    [string]$DbPassword = "GradQuest123!"
)

$env:DB_HOST = $DbHost
$env:DB_PORT = $DbPort
$env:DB_NAME = $DbName
$env:DB_USERNAME = $DbUsername
$env:DB_PASSWORD = $DbPassword
$env:SPRING_PROFILES_ACTIVE = "mysql"

$backendRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$pomPath = Join-Path $backendRoot "pom.xml"
$stopScriptPath = Join-Path $PSScriptRoot "stop-backend.ps1"

Write-Host "Preparing backend on port 18080 ..."
& $stopScriptPath -Port 18080 -WaitSeconds 10

Write-Host "Starting backend with MySQL database $DbName on $DbHost`:$DbPort ..."
mvn -f $pomPath spring-boot:run
