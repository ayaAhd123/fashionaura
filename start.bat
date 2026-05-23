@echo off
title FashionAura
cd /d "%~dp0"

echo.
echo ========================================
echo   FashionAura - Starting...
echo ========================================
echo.

if not exist "backend\artisan" (
    echo [ERROR] backend folder not found.
    pause
    exit /b 1
)

if not exist "frontend\package.json" (
    echo [ERROR] frontend folder not found.
    pause
    exit /b 1
)

if not exist "backend\.env" (
    echo [SETUP] Creating backend .env...
    copy "backend\.env.example" "backend\.env" >nul
    cd backend
    call composer install --no-interaction 2>nul
    php artisan key:generate
    if not exist "database\database.sqlite" (
        echo. > database\database.sqlite
    )
    php artisan migrate --seed --force
    cd ..
)

if not exist "frontend\node_modules" (
    echo [SETUP] Installing frontend packages...
    cd frontend
    call npm install
    cd ..
)

if not exist "frontend\.env.local" (
    copy "frontend\.env.example" "frontend\.env.local" >nul 2>nul
    if not exist "frontend\.env.local" (
        echo VITE_API_URL=http://localhost:8000/api> frontend\.env.local
    )
)

if not exist "backend\vendor" (
    echo [SETUP] Installing backend packages...
    cd backend
    call composer install --no-interaction
    cd ..
)

echo Starting backend on http://127.0.0.1:8000 ...
start "FashionAura - Backend" cmd /k "cd /d "%~dp0backend" && php artisan serve"

timeout /t 2 /nobreak >nul

echo Starting frontend on http://localhost:5173 ...
start "FashionAura - Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo Done! Open http://localhost:5173 in your browser.
echo Close the two terminal windows to stop the servers.
echo.
pause
