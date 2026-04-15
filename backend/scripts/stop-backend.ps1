param(
    [int]$Port = 18080,
    [int]$WaitSeconds = 10
)

$connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue

if (-not $connections) {
    Write-Host "No listening process found on port $Port."
    exit 0
}

$processIds = $connections | Select-Object -ExpandProperty OwningProcess -Unique

foreach ($processId in $processIds) {
    $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
    if (-not $process) {
        continue
    }

    Write-Host "Stopping PID $processId ($($process.ProcessName)) on port $Port ..."
    Stop-Process -Id $processId -Force
}

$deadline = (Get-Date).AddSeconds($WaitSeconds)

while ((Get-Date) -lt $deadline) {
    $stillListening = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    if (-not $stillListening) {
        Write-Host "Port $Port is now free."
        exit 0
    }
    Start-Sleep -Milliseconds 300
}

throw "Timed out waiting for port $Port to become free."
