@echo off
title Emofelix - Service Launcher

echo.
echo ==========================================
echo 🚀 Starting Emofelix Services...
echo ==========================================
echo.

REM Get the directory where the script is located
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%"

echo 📁 Project root: %PROJECT_ROOT%
echo.

REM Check if directories exist
if not exist "%PROJECT_ROOT%Backend\core" (
    echo ❌ Django directory not found: %PROJECT_ROOT%Backend\core
    pause
    exit /b 1
)

if not exist "%PROJECT_ROOT%FastAPI_services" (
    echo ❌ FastAPI directory not found: %PROJECT_ROOT%FastAPI_services
    pause
    exit /b 1
)

if not exist "%PROJECT_ROOT%frontend" (
    echo ❌ React directory not found: %PROJECT_ROOT%frontend
    pause
    exit /b 1
)

echo 🔍 Checking for existing services...

REM Kill existing processes on our ports
taskkill /F /IM python.exe /FI "WINDOWTITLE eq Django*" >nul 2>&1
taskkill /F /IM uvicorn.exe >nul 2>&1
taskkill /F /IM node.exe /FI "WINDOWTITLE eq React*" >nul 2>&1

echo   ✓ Cleared existing services
echo.

REM Start Django server
echo 🐍 Starting Django server on port 8000...
start "Django Server - Emofelix" cmd /k "cd /d %PROJECT_ROOT%Backend\core && echo Django Server Starting... && python manage.py runserver 8000"

REM Wait a moment
timeout /t 3 /nobreak >nul

REM Start FastAPI server
echo ⚡ Starting FastAPI server on port 8001...
start "FastAPI Server - Emofelix" cmd /k "cd /d %PROJECT_ROOT%FastAPI_services && echo FastAPI Server Starting... && uvicorn main:app --reload --port 8001"

REM Wait a moment
timeout /t 3 /nobreak >nul

REM Start React development server
echo ⚛️ Starting React development server on port 3000...
start "React Dev Server - Emofelix" cmd /k "cd /d %PROJECT_ROOT%frontend && echo React Development Server Starting... && npm run dev"

echo.
echo ⏳ Waiting for services to initialize...
timeout /t 8 /nobreak >nul

echo.
echo ==========================================
echo 🎉 All services started successfully!
echo ==========================================
echo.
echo 🌐 Access your application:
echo   📱 Frontend:      http://localhost:3000
echo   🐍 Django Admin:  http://localhost:8000/admin
echo   ⚡ FastAPI Docs:  http://localhost:8001/docs
echo.
echo 💡 Tips:
echo   - Each service runs in its own command window
echo   - Close the command windows to stop the services
echo   - Check the individual windows for logs and errors
echo.

REM Open the frontend in default browser
echo 🌐 Opening frontend in your default browser...
start http://localhost:3000

echo.
echo Press any key to exit this launcher...
pause >nul
