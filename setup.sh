#!/bin/bash

# Annotation System Setup Script for Linux/macOS

echo "===================================="
echo "Annotation System - Setup Script"
echo "===================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker is not installed or not in PATH"
    echo "Please install Docker from https://docs.docker.com/get-docker/"
    exit 1
fi

echo "[✓] Docker found: $(docker --version)"
echo ""

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "ERROR: Docker Compose is not installed or not in PATH"
    echo "Please install Docker Compose from https://docs.docker.com/compose/install/"
    exit 1
fi

echo "[✓] Docker Compose found: $(docker-compose --version)"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "[*] Creating .env file from .env.example..."
    cp .env.example .env
    echo "[✓] .env file created"
else
    echo "[✓] .env file already exists"
fi

echo ""
echo "[*] Building Docker images..."
docker-compose build

echo ""
echo "[*] Starting services..."
docker-compose up -d

echo ""
echo "[*] Waiting for database to be ready..."
sleep 10

echo ""
echo "[*] Running database migrations..."
docker-compose exec -T backend python manage.py migrate

echo ""
echo "[*] Collecting static files..."
docker-compose exec -T backend python manage.py collectstatic --noinput

echo ""
echo "===================================="
echo "Setup Complete!"
echo "===================================="
echo ""
echo "Access the application at:"
echo "  Frontend: http://localhost:5173"
echo "  Backend API: http://localhost:8000/api"
echo "  API Health: http://localhost:8000/api/health/"
echo ""
echo "Next steps:"
echo "  1. Open http://localhost:5173 in your browser"
echo "  2. Register a new account"
echo "  3. Upload images and start annotating!"
echo ""
echo "View logs with:"
echo "  docker-compose logs -f"
echo ""
echo "Stop services with:"
echo "  docker-compose down"
echo ""
