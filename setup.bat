@echo off
title FashionAura - First-time setup
cd /d "%~dp0"

echo ========================================
echo   FashionAura - Setup (MySQL)
echo ========================================
echo.
echo Assurez-vous que MySQL tourne et que la base existe :
echo   CREATE DATABASE fashionaura_db;
echo.
echo Verifiez backend\.env (DB_HOST, DB_DATABASE, DB_USERNAME, DB_PASSWORD)
echo.
pause

echo Installing backend...
cd backend
if not exist ".env" copy .env.example .env
call composer install
php artisan key:generate
php artisan fashionaura:ensure-data
cd ..

echo.
echo Installing frontend...
cd frontend
if not exist ".env.local" (
    if exist ".env.example" (copy .env.example .env.local) else (echo VITE_API_URL=http://localhost:8000/api> .env.local)
)
call npm install
cd ..

echo.
echo Setup complete! Run start.bat to launch the website.
pause
