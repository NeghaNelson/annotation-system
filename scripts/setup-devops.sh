#!/bin/bash

# Setup script for local development and Kubernetes deployment
# This script sets up everything needed for DevOps deployment

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "=========================================="
echo "Annotation System DevOps Setup"
echo "=========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to check if command exists
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo "ERROR: $1 is not installed"
        return 1
    fi
    echo -e "${GREEN}✓ $1 is installed${NC}"
}

# Check prerequisites
echo "Checking prerequisites..."
check_command docker
check_command kubectl
check_command terraform
check_command ansible

echo ""
echo "Building Docker images..."

# Build backend image
echo "Building backend image..."
docker build -t annotation-system-backend:latest $PROJECT_ROOT/backend/
echo -e "${GREEN}✓ Backend image built${NC}"

# Build frontend image
echo "Building frontend image..."
docker build -t annotation-system-frontend:latest $PROJECT_ROOT/frontend/
echo -e "${GREEN}✓ Frontend image built${NC}"

echo ""
echo "Setting up Terraform..."
cd $PROJECT_ROOT/terraform
terraform init
echo -e "${GREEN}✓ Terraform initialized${NC}"

echo ""
echo "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start minikube: minikube start"
echo "2. Deploy using Terraform: cd terraform && terraform apply"
echo "3. Or deploy using Ansible: cd ansible && ansible-playbook -i inventory.ini deploy.yaml"
echo ""
