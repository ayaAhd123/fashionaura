@echo off
title FashionAura - First-time setup
cd /d "%~dp0"

echo Installing backend...
cd backend
if not exist ".env" copy .env.example .env
call composer install
php artisan key:generate
if not exist "database\database.sqlite" echo. > database\database.sqlite
php artisan migrate:fresh --seed --force
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
