@echo off
setlocal

rem Run the server from the folder containing this batch file and juego.html. It's better to use index.html but this works too.
cd /d "%~dp0"
set "PORT=8050"

rem Check that the Windows Python launcher is available.
where py >nul 2>&1
if errorlevel 1 (
    echo Python was not found. Install Python 3 with the Python Launcher (py.exe).
    pause
    exit /b 1
)

rem Start a local-only HTTP server in its own command window.
start "Papu-no-Filosophy server" cmd /k "py -3 -m http.server %PORT% --bind 127.0.0.1"

rem Give the server a moment to start, then open the game in a new Chrome window.
timeout /t 2 /nobreak >nul
start "" chrome --new-window "http://127.0.0.1:%PORT%/juego.html"

endlocal
