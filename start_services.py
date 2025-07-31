#!/usr/bin/env python3
"""
Emofelix Service Launcher
Cross-platform script to start Django, FastAPI, and React services
"""

import os
import sys
import time
import subprocess
import platform
import socket
import signal
from pathlib import Path

class ServiceLauncher:
    def __init__(self):
        self.script_dir = Path(__file__).parent.absolute()
        self.services = []
        
    def check_port(self, port):
        """Check if a port is in use"""
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(('127.0.0.1', port))
                return False
            except OSError:
                return True
    
    def kill_port(self, port):
        """Kill process running on a specific port"""
        system = platform.system().lower()
        try:
            if system == "windows":
                # Find and kill process on Windows
                result = subprocess.run(
                    f'netstat -ano | findstr :{port}',
                    shell=True, capture_output=True, text=True
                )
                if result.stdout:
                    lines = result.stdout.strip().split('\n')
                    for line in lines:
                        parts = line.split()
                        if len(parts) >= 5:
                            pid = parts[-1]
                            subprocess.run(f'taskkill /F /PID {pid}', shell=True, capture_output=True)
            else:
                # Unix-like systems
                subprocess.run(f'lsof -ti:{port} | xargs kill -9', shell=True, capture_output=True)
            return True
        except Exception:
            return False
    
    def print_colored(self, message, color='white'):
        """Print colored message (basic implementation)"""
        colors = {
            'red': '\033[31m',
            'green': '\033[32m',
            'yellow': '\033[33m',
            'blue': '\033[34m',
            'cyan': '\033[36m',
            'white': '\033[37m',
            'reset': '\033[0m'
        }
        
        if platform.system().lower() == 'windows':
            # Windows doesn't support ANSI colors in older versions
            print(message)
        else:
            print(f"{colors.get(color, colors['white'])}{message}{colors['reset']}")
    
    def check_dependencies(self):
        """Check if required directories and dependencies exist"""
        self.print_colored("🔍 Checking dependencies...", 'yellow')
        
        # Check directories
        dirs = {
            'Django': self.script_dir / 'Backend' / 'core',
            'FastAPI': self.script_dir / 'FastAPI_services',
            'React': self.script_dir / 'frontend'
        }
        
        for name, path in dirs.items():
            if not path.exists():
                self.print_colored(f"❌ {name} directory not found: {path}", 'red')
                return False
            self.print_colored(f"  ✓ {name} directory found", 'green')
        
        # Check Python
        try:
            subprocess.run(['python', '--version'], check=True, capture_output=True)
            self.print_colored("  ✓ Python found", 'green')
        except (subprocess.CalledProcessError, FileNotFoundError):
            self.print_colored("❌ Python not found", 'red')
            return False
        
        # Check Node.js
        try:
            subprocess.run(['node', '--version'], check=True, capture_output=True)
            self.print_colored("  ✓ Node.js found", 'green')
        except (subprocess.CalledProcessError, FileNotFoundError):
            self.print_colored("❌ Node.js not found", 'red')
            return False
        
        return True
    
    def stop_existing_services(self):
        """Stop any existing services on our ports"""
        self.print_colored("🛑 Stopping existing services...", 'yellow')
        
        ports = [8000, 8001, 3000]
        for port in ports:
            if self.check_port(port):
                self.print_colored(f"  Stopping service on port {port}...", 'yellow')
                self.kill_port(port)
                time.sleep(1)
        
        self.print_colored("  ✓ Existing services stopped", 'green')
    
    def start_service(self, name, command, cwd, port):
        """Start a service in a new process"""
        self.print_colored(f"🚀 Starting {name} on port {port}...", 'green')
        
        try:
            if platform.system().lower() == 'windows':
                # Windows
                process = subprocess.Popen(
                    command,
                    cwd=cwd,
                    shell=True,
                    creationflags=subprocess.CREATE_NEW_CONSOLE
                )
            else:
                # Unix-like systems
                process = subprocess.Popen(
                    command,
                    cwd=cwd,
                    shell=True,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE
                )
            
            self.services.append({
                'name': name,
                'process': process,
                'port': port
            })
            
            return True
        except Exception as e:
            self.print_colored(f"❌ Failed to start {name}: {e}", 'red')
            return False
    
    def wait_for_services(self):
        """Wait for all services to start"""
        self.print_colored("⏳ Waiting for services to initialize...", 'yellow')
        
        max_wait = 30  # seconds
        wait_time = 0
        
        while wait_time < max_wait:
            all_running = True
            for service in self.services:
                if not self.check_port(service['port']):
                    all_running = False
                    break
            
            if all_running:
                break
            
            time.sleep(1)
            wait_time += 1
            print(".", end="", flush=True)
        
        print()  # New line
        
        # Check final status
        self.print_colored("🔍 Service status:", 'cyan')
        for service in self.services:
            status = "✅ Running" if self.check_port(service['port']) else "❌ Not Running"
            color = 'green' if self.check_port(service['port']) else 'red'
            self.print_colored(f"  {service['name']} ({service['port']}): {status}", color)
    
    def show_urls(self):
        """Show access URLs"""
        self.print_colored("\n🌐 Access your application:", 'green')
        self.print_colored("  📱 Frontend:      http://localhost:3000", 'cyan')
        self.print_colored("  🐍 Django Admin:  http://localhost:8000/admin", 'cyan')
        self.print_colored("  ⚡ FastAPI Docs:  http://localhost:8001/docs", 'cyan')
        
        self.print_colored("\n💡 Tips:", 'yellow')
        self.print_colored("  - Each service runs in its own window/process", 'white')
        self.print_colored("  - Press Ctrl+C to stop this launcher", 'white')
        self.print_colored("  - Check individual service windows for logs", 'white')
    
    def cleanup(self):
        """Cleanup on exit"""
        self.print_colored("\n🛑 Shutting down services...", 'yellow')
        for service in self.services:
            try:
                service['process'].terminate()
            except:
                pass
    
    def run(self):
        """Main launcher logic"""
        try:
            self.print_colored("🚀 Emofelix Service Launcher", 'green')
            self.print_colored("=" * 40, 'cyan')
            
            # Check dependencies
            if not self.check_dependencies():
                return 1
            
            # Stop existing services
            self.stop_existing_services()
            
            # Start Django
            django_success = self.start_service(
                name="Django",
                command="python manage.py runserver 8000",
                cwd=self.script_dir / 'Backend' / 'core',
                port=8000
            )
            
            time.sleep(2)
            
            # Start FastAPI
            fastapi_success = self.start_service(
                name="FastAPI",
                command="uvicorn main:app --reload --port 8001",
                cwd=self.script_dir / 'FastAPI_services',
                port=8001
            )
            
            time.sleep(2)
            
            # Start React
            react_success = self.start_service(
                name="React",
                command="npm run dev",
                cwd=self.script_dir / 'frontend',
                port=3000
            )
            
            if not all([django_success, fastapi_success, react_success]):
                self.print_colored("❌ Some services failed to start", 'red')
                return 1
            
            # Wait for services
            self.wait_for_services()
            
            # Show URLs
            self.show_urls()
            
            self.print_colored("\n🎉 All services started successfully!", 'green')
            
            # Keep running
            self.print_colored("\nPress Ctrl+C to stop all services...", 'white')
            try:
                while True:
                    time.sleep(1)
            except KeyboardInterrupt:
                pass
            
            return 0
            
        except KeyboardInterrupt:
            self.print_colored("\n👋 Stopping services...", 'yellow')
            return 0
        except Exception as e:
            self.print_colored(f"❌ Error: {e}", 'red')
            return 1
        finally:
            self.cleanup()

if __name__ == "__main__":
    launcher = ServiceLauncher()
    sys.exit(launcher.run())
