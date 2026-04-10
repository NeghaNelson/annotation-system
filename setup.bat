@echo off
REM Annotation System Setup Script for Windows

echo ====================================
echo Annotation System - Setup Script
echo ====================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not installed or not in PATH
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo [✓] Docker found: %docker --version%
echo.

REM Create .env file if it doesn't exist
if not exist .env (
    echo [*] Creating .env file from .env.example...
    copy .env.example .env
    echo [✓] .env file created
) else (
    echo [✓] .env file already exists
)

echo.
echo [*] Building Docker images...
docker-compose build

echo.
echo [*] Starting services...
docker-compose up -d

echo.
echo [*] Waiting for database to be ready...
timeout /t 10 /nobreak

echo.
echo [*] Running database migrations...
docker-compose exec -T backend python manage.py migrate

echo.
echo [*] Collecting static files...
docker-compose exec -T backend python manage.py collectstatic --noinput

echo.
echo ====================================
echo Setup Complete!
echo ====================================
echo.
echo Access the application at:
echo   Frontend: http://localhost:5173
echo   Backend API: http://localhost:8000/api
echo   API Health: http://localhost:8000/api/health/
echo.
echo Next steps:
echo   1. Open http://localhost:5173 in your browser
echo   2. Register a new account
echo   3. Upload images and start annotating!
echo.
echo View logs with:
echo   docker-compose logs -f
echo.
echo Stop services with:
echo   docker-compose down
echo.
pause
