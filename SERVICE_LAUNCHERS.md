# 🚀 Emofelix Service Launchers

This directory contains multiple ways to start all Emofelix services (Django, FastAPI, and React) with a single command.

## 📁 Available Launchers

### 1. **PowerShell Script** - `start_services.ps1`
**Best for: Windows users with PowerShell**

```powershell
.\start_services.ps1
```

**Features:**
- ✅ Colored output and status indicators
- ✅ Port conflict detection and resolution
- ✅ Service health checks
- ✅ Opens each service in separate windows
- ✅ Automatic browser opening

### 2. **Batch Script** - `start_services.bat`
**Best for: Windows users preferring traditional batch files**

```cmd
start_services.bat
```

**Features:**
- ✅ Simple and reliable
- ✅ Works on all Windows versions
- ✅ Opens each service in separate command windows
- ✅ Automatic browser opening
- ✅ No dependencies required

### 3. **Python Script** - `start_services.py`
**Best for: Cross-platform use (Windows, macOS, Linux)**

```bash
python start_services.py
```

**Features:**
- ✅ Cross-platform compatibility
- ✅ Advanced error handling
- ✅ Dependency checking
- ✅ Graceful shutdown with Ctrl+C
- ✅ Colored terminal output (Unix systems)

### 4. **VS Code Tasks**
**Best for: VS Code users**

Open VS Code Command Palette (`Ctrl+Shift+P`) and run:
- `Tasks: Run Task` → `Start All Services`
- Or individual services: `Start Django Server`, `Start FastAPI Server`, `Start Frontend Dev Server`

## 🎯 Quick Start

### Choose your preferred method:

1. **Double-click** `start_services.bat` (Windows - easiest)
2. **Right-click** `start_services.ps1` → "Run with PowerShell" (Windows - advanced)
3. **Terminal:** `python start_services.py` (Any OS)
4. **VS Code:** Command Palette → Run Task → Start All Services

## 🔧 What Each Launcher Does

1. **Checks dependencies** (Python, Node.js, directories)
2. **Stops existing services** on ports 8000, 8001, 3000
3. **Starts Django** server on port 8000
4. **Starts FastAPI** server on port 8001  
5. **Starts React** development server on port 3000
6. **Verifies** all services are running
7. **Shows access URLs** and helpful tips

## 🌐 Service URLs

After starting, access your application at:

- **Frontend:** http://localhost:3000
- **Django Admin:** http://localhost:8000/admin
- **FastAPI Docs:** http://localhost:8001/docs

## ⚠️ Troubleshooting

### Services won't start?
1. **Check ports:** Make sure ports 8000, 8001, 3000 aren't in use
2. **Check dependencies:** Ensure Python and Node.js are installed
3. **Check paths:** Run from the project root directory
4. **Check logs:** Look at individual service windows for error messages

### PowerShell execution policy error?
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Python script issues?
- Make sure Python 3.6+ is installed
- Run from the project root directory
- Check that all project directories exist

### VS Code tasks not working?
- Open the project in VS Code (not just individual files)
- Make sure you're in the project root
- Check the terminal output for specific errors

## 🛑 Stopping Services

### Method 1: Close Windows
- Close each service's terminal/command window

### Method 2: Ctrl+C (Python launcher)
- Press `Ctrl+C` in the Python launcher terminal

### Method 3: Task Manager (Windows)
- End processes: `python.exe`, `node.exe`, `uvicorn.exe`

### Method 4: Command Line
```bash
# Kill by port (Linux/macOS)
lsof -ti:8000 | xargs kill
lsof -ti:8001 | xargs kill  
lsof -ti:3000 | xargs kill

# Kill by port (Windows)
netstat -ano | findstr :8000
taskkill /F /PID <PID>
```

## 💡 Tips

- **First time?** Use the batch script for simplicity
- **Developing?** Use VS Code tasks for integration
- **Cross-platform?** Use the Python script
- **Advanced user?** Use PowerShell for best experience

## 🔧 Customization

You can modify any launcher script to:
- Change port numbers
- Add environment variables
- Include additional setup steps
- Customize terminal colors/messages

---

**Happy coding! 🎉**
