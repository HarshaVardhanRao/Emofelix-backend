@echo off
:: Emofelix Quick Launcher
:: Double-click this file to start all services!

title Emofelix - Starting Services...
color 0A

echo.
echo  ███████╗███╗   ███╗ ██████╗ ███████╗███████╗██╗     ██╗██╗  ██╗
echo  ██╔════╝████╗ ████║██╔═══██╗██╔════╝██╔════╝██║     ██║╚██╗██╔╝
echo  █████╗  ██╔████╔██║██║   ██║█████╗  █████╗  ██║     ██║ ╚███╔╝ 
echo  ██╔══╝  ██║╚██╔╝██║██║   ██║██╔══╝  ██╔══╝  ██║     ██║ ██╔██╗ 
echo  ███████╗██║ ╚═╝ ██║╚██████╔╝██║     ███████╗███████╗██║██╔╝ ██╗
echo  ╚══════╝╚═╝     ╚═╝ ╚═════╝ ╚═╝     ╚══════╝╚══════╝╚═╝╚═╝  ╚═╝
echo.
echo  🚀 Quick Service Launcher
echo  ════════════════════════════════════════════════════════════════
echo.

REM Get the directory where this script is located
set "PROJECT_ROOT=%~dp0"

echo  📁 Project: %PROJECT_ROOT%
echo.

REM Check if we're in the right directory
if not exist "%PROJECT_ROOT%Backend\core\manage.py" (
    echo  ❌ Error: Django project not found!
    echo     Make sure this script is in the Emofelix-backend root folder
    echo.
    pause
    exit /b 1
)

if not exist "%PROJECT_ROOT%FastAPI_services\main.py" (
    echo  ❌ Error: FastAPI service not found!
    echo     Make sure this script is in the Emofelix-backend root folder
    echo.
    pause
    exit /b 1
)

if not exist "%PROJECT_ROOT%frontend\package.json" (
    echo  ❌ Error: React frontend not found!
    echo     Make sure this script is in the Emofelix-backend root folder
    echo.
    pause
    exit /b 1
)

echo  ✅ All project components found!
echo.

REM Kill any existing services
echo  🛑 Stopping any existing services...
taskkill /F /IM python.exe /FI "WINDOWTITLE eq *Django*" >nul 2>&1
taskkill /F /IM python.exe /FI "WINDOWTITLE eq *FastAPI*" >nul 2>&1
taskkill /F /IM node.exe /FI "WINDOWTITLE eq *React*" >nul 2>&1
echo     ✓ Cleared existing services
echo.

echo  🚀 Starting services...
echo.

REM Start Django
echo  🐍 Starting Django server...
start "Django Server - Emofelix" /MIN cmd /k "title Django Server - Emofelix && cd /d %PROJECT_ROOT%Backend\core && echo 🐍 Django Server Starting on http://localhost:8000 && echo ═══════════════════════════════════════════════ && python manage.py runserver 8000"

REM Wait
timeout /t 3 /nobreak >nul

REM Start FastAPI
echo  ⚡ Starting FastAPI server...
start "FastAPI Server - Emofelix" /MIN cmd /k "title FastAPI Server - Emofelix && cd /d %PROJECT_ROOT%FastAPI_services && echo ⚡ FastAPI Server Starting on http://localhost:8001 && echo ══════════════════════════════════════════════ && uvicorn main:app --reload --port 8001"

REM Wait
timeout /t 3 /nobreak >nul

REM Start React
echo  ⚛️ Starting React development server...
start "React Dev Server - Emofelix" /MIN cmd /k "title React Dev Server - Emofelix && cd /d %PROJECT_ROOT%frontend && echo ⚛️ React Dev Server Starting on http://localhost:3000 && echo ═══════════════════════════════════════════════ && npm run dev"

echo.
echo  ⏳ Waiting for services to start...
echo.

REM Show a nice progress bar
for /L %%i in (1,1,15) do (
    echo | set /p="█"
    timeout /t 1 /nobreak >nul
)
echo.
echo.

echo  ✅ Services should now be running!
echo.
echo  ══════════════════════════════════════════════════════════════
echo  🌐 ACCESS YOUR APPLICATION:
echo  ══════════════════════════════════════════════════════════════
echo.
echo     📱 Frontend (Main App):  http://localhost:3000
echo     🐍 Django Admin Panel:   http://localhost:8000/admin  
echo     ⚡ FastAPI Documentation: http://localhost:8001/docs
echo.
echo  ══════════════════════════════════════════════════════════════
echo  💡 USEFUL INFORMATION:
echo  ══════════════════════════════════════════════════════════════
echo.
echo     • Each service runs in its own window (minimized)
echo     • Click on taskbar items to see service logs
echo     • Close service windows to stop individual services
echo     • Check the service windows if something isn't working
echo.
echo  ══════════════════════════════════════════════════════════════

REM Open the frontend automatically
echo  🌐 Opening frontend in your default browser...
timeout /t 2 /nobreak >nul
start http://localhost:3000

echo.
echo  🎉 All done! Your Emofelix application should now be running.
echo.
echo  📊 Service Status:
echo     • Look for "Django Server", "FastAPI Server", and "React Dev Server" 
echo       in your taskbar to monitor each service
echo.
echo  🛑 To stop all services:
echo     • Close all three service windows, OR
echo     • Run: taskkill /F /IM python.exe /IM node.exe
echo.

echo  Press any key to close this launcher...
pause >nul

REM Final cleanup option
echo.
echo  Would you like to stop all services now? (y/N)
set /p "choice=Enter choice: "
if /i "%choice%"=="y" (
    echo.
    echo  🛑 Stopping all services...
    taskkill /F /IM python.exe >nul 2>&1
    taskkill /F /IM node.exe >nul 2>&1
    echo     ✓ All services stopped
    echo.
)
