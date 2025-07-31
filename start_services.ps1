#!/usr/bin/env powershell

# Emofelix - Start All Services Script
# This script starts Django (8000), FastAPI (8001), and React (3000) services

Write-Host "🚀 Starting Emofelix Services..." -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Cyan

# Function to check if a port is in use
function Test-Port {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("127.0.0.1", $Port)
        $connection.Close()
        return $true
    }
    catch {
        return $false
    }
}

# Function to kill process on a specific port
function Stop-ProcessOnPort {
    param([int]$Port)
    try {
        $processes = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        if ($processes) {
            $processIds = $processes | ForEach-Object { (Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue).Id }
            foreach ($processId in $processIds) {
                Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                Write-Host "  ✓ Stopped process on port $Port" -ForegroundColor Yellow
            }
        }
    }
    catch {
        # Port not in use, continue
    }
}

# Check and stop existing services
Write-Host "🔍 Checking for existing services..." -ForegroundColor Yellow

if (Test-Port 8000) {
    Write-Host "  Port 8000 is in use, stopping existing Django service..." -ForegroundColor Yellow
    Stop-ProcessOnPort 8000
}

if (Test-Port 8001) {
    Write-Host "  Port 8001 is in use, stopping existing FastAPI service..." -ForegroundColor Yellow
    Stop-ProcessOnPort 8001
}

if (Test-Port 3000) {
    Write-Host "  Port 3000 is in use, stopping existing React service..." -ForegroundColor Yellow
    Stop-ProcessOnPort 3000
}

# Get script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = $scriptDir

Write-Host "📁 Project root: $projectRoot" -ForegroundColor Cyan

# Check if directories exist
$djangoDir = Join-Path $projectRoot "Backend\core"
$fastapiDir = Join-Path $projectRoot "FastAPI_services"
$reactDir = Join-Path $projectRoot "frontend"

if (-not (Test-Path $djangoDir)) {
    Write-Host "❌ Django directory not found: $djangoDir" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $fastapiDir)) {
    Write-Host "❌ FastAPI directory not found: $fastapiDir" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $reactDir)) {
    Write-Host "❌ React directory not found: $reactDir" -ForegroundColor Red
    exit 1
}

# Start Django server
Write-Host "🐍 Starting Django server on port 8000..." -ForegroundColor Green
Start-Process -WindowStyle Normal -FilePath "powershell" -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$djangoDir'; Write-Host 'Django Server Starting...' -ForegroundColor Green; python manage.py runserver 8000"
)

# Wait a moment
Start-Sleep -Seconds 2

# Start FastAPI server
Write-Host "⚡ Starting FastAPI server on port 8001..." -ForegroundColor Green
Start-Process -WindowStyle Normal -FilePath "powershell" -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$fastapiDir'; Write-Host 'FastAPI Server Starting...' -ForegroundColor Green; uvicorn main:app --reload --port 8001"
)

# Wait a moment
Start-Sleep -Seconds 2

# Start React development server
Write-Host "⚛️ Starting React development server on port 3000..." -ForegroundColor Green
Start-Process -WindowStyle Normal -FilePath "powershell" -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$reactDir'; Write-Host 'React Development Server Starting...' -ForegroundColor Green; npm run dev"
)

# Wait for services to start
Write-Host "⏳ Waiting for services to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check if services are running
Write-Host "🔍 Checking service status..." -ForegroundColor Cyan

$djangoRunning = Test-Port 8000
$fastapiRunning = Test-Port 8001
$reactRunning = Test-Port 3000

Write-Host "Service Status:" -ForegroundColor Cyan
Write-Host "  Django (8000):  $(if($djangoRunning){'✅ Running'}else{'❌ Not Running'})" -ForegroundColor $(if($djangoRunning){'Green'}else{'Red'})
Write-Host "  FastAPI (8001): $(if($fastapiRunning){'✅ Running'}else{'❌ Not Running'})" -ForegroundColor $(if($fastapiRunning){'Green'}else{'Red'})
Write-Host "  React (3000):   $(if($reactRunning){'✅ Running'}else{'❌ Not Running'})" -ForegroundColor $(if($reactRunning){'Green'}else{'Red'})

Write-Host ""
Write-Host "🌐 Access your application:" -ForegroundColor Green
Write-Host "  📱 Frontend:      http://localhost:3000" -ForegroundColor Cyan
Write-Host "  🐍 Django Admin:  http://localhost:8000/admin" -ForegroundColor Cyan
Write-Host "  ⚡ FastAPI Docs:  http://localhost:8001/docs" -ForegroundColor Cyan

Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor Yellow
Write-Host "  - Each service runs in its own terminal window" -ForegroundColor White
Write-Host "  - Close the terminal windows to stop the services" -ForegroundColor White
Write-Host "  - Check the individual terminal windows for logs" -ForegroundColor White

Write-Host ""
Write-Host "🎉 All services started successfully!" -ForegroundColor Green
Write-Host "Press any key to exit this script..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
