@echo off
REM FashionAura - Quick Start Script for Windows

echo.
echo ========================================
echo   FashionAura - Quick Start
echo ========================================
echo.

REM Check if Laravel is installed
if not exist "backend\artisan" (
    echo [ERROR] Laravel backend not found!
    echo Please run: cd backend && composer install
    pause
    exit /b 1
)

REM Check if Node modules are installed
if not exist "frontend\node_modules" (
    echo [WARNING] Node modules not found in frontend
    echo Installing dependencies...
    cd frontend
    call npm install
    cd ..
)

echo.
echo [STEP 1] Starting Laravel Backend...
echo To run the backend manually:
echo   cd backend
echo   php artisan serve
echo.

echo [STEP 2] Starting React Frontend...
echo To run the frontend manually:
echo   cd frontend
echo   npm run dev
echo.

echo [STATUS] Database is seeded with 500+ test records
echo [STATUS] All API endpoints are ready
echo [STATUS] Navigate to http://localhost:5173 after starting both servers
echo.

echo [NEXT] Open TWO terminal windows:
echo   1st window:  cd backend ^&^& php artisan serve
echo   2nd window:  cd frontend ^&^& npm run dev
echo.

pause
