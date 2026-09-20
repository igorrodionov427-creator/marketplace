@echo off
REM ============================================================
REM  {{MARKETPLACE_NAME}} — local launcher
REM  Starts a static server (Python) and opens the browser.
REM ============================================================
cd /d "%~dp0"
set PORT=5173
echo Starting marketplace on http://localhost:%PORT%  (press Ctrl+C to stop)
start "" "http://localhost:%PORT%/index.html"
where py >nul 2>nul && ( py serve.py %PORT% ) || ( python serve.py %PORT% )
