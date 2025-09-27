@echo off
echo Starting LinkUIU Backend Server...
echo.
echo Server will run on: http://localhost:8000
echo Frontend: http://localhost/LinkUIU/frontend/pages/login.html
echo.
echo Press Ctrl+C to stop the server
echo.
set ALLOWED_ORIGINS=http://localhost
start "" "http://localhost/LinkUIU/frontend/pages/login.html"
C:\xampp\php\php.exe -S localhost:8000 -t backend backend/index.php
