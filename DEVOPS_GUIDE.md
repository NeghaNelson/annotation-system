# Annotation System - DevOps Project Documentation

## Project Overview
This document provides complete instructions for setting up and deploying the Annotation System using modern DevOps practices and tools.

**Subject Code:** 24CS2018 – DevOps  
**Faculty:** Dr. E. Bijolin Edwin  
**Semester:** SEM VI – CSE (2025–2026 Even Semester)

## Table of Contents
1. [Phase 1: Source Code and Version Control](#phase-1-source-code-and-version-control)
2. [Phase 2: Containerization](#phase-2-containerization)
3. [Phase 3: Infrastructure Provisioning (IaC)](#phase-3-infrastructure-provisioning-iac)
4. [Phase 4: Configuration Management](#phase-4-configuration-management)
5. [Phase 5: CI/CD Pipeline Setup](#phase-5-cicd-pipeline-setup)
6. [Phase 6: Deployment and Validation](#phase-6-deployment-and-validation)
7. [Phase 7: Documentation & Submission](#phase-7-documentation--submission)

---

## Phase 1: Source Code and Version Control

### 1.1 GitHub Repository Setup

**Step 1:** Create a new GitHub repository
```bash
# Go to https://github.com/new
# Repository name: annotation-system
# Description: DevOps project for image annotation system
# Make it Public (for course submission)
```

**Step 2:** Initialize local Git repository
```bash
cd annotation-system
git init
git add .
git commit -m "Initial commit: Annotation System with Docker and DevOps setup"
```

**Step 3:** Connect to GitHub and push
```bash
git remote add origin https://github.com/YOUR_USERNAME/annotation-system.git
git branch -M main
git push -u origin main
```

### 1.2 Git Workflow and Collaboration

**Creating feature branches:**
```bash
# Create feature branch for new development
git checkout -b feature/kubernetes-setup

# Make changes and commit
git add .
git commit -m "feat: add Kubernetes manifests for production deployment"

# Create pull request on GitHub (recommended for code review)
git push origin feature/kubernetes-setup
# Then create PR on GitHub UI
```

**Best practices:**
- Use meaningful commit messages following Conventional Commits
- Create PRs for code review before merging to main
- Keep commit history clean using interactive rebase

**Current branch structure:**
- `main` - Production-ready code (triggers CD pipeline)
- `develop` - Development branch (triggers CI pipeline)

---

## Phase 2: Containerization

### 2.1 Docker Images

**Backend Dockerfile:**
```dockerfile
# Located at: backend/Dockerfile
# Already configured with Python 3.11
# Builds Django REST API with gunicorn
```

**Frontend Dockerfile:**
```dockerfile
# Located at: frontend/Dockerfile
# Configured with Node.js 18 and Vite
# Production-optimized build
```

### 2.2 Building Docker Images

**Build locally:**
```bash
# Build backend
docker build -t annotation-system-backend:latest ./backend

# Build frontend
docker build -t annotation-system-frontend:latest ./frontend

# Verify images
docker images | grep annotation-system
```

**Running containers locally:**
```bash
# Using docker-compose (current setup)
docker-compose up -d

# Verify services
docker-compose ps

# Check logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 2.3 Push to Container Registry

**Option 1: Docker Hub (Recommended for learning)**
```bash
# Login to Docker Hub
docker login

# Tag images
docker tag annotation-system-backend:latest USERNAME/annotation-system-backend:latest
docker tag annotation-system-frontend:latest USERNAME/annotation-system-frontend:latest

# Push to Docker Hub
docker push USERNAME/annotation-system-backend:latest
docker push USERNAME/annotation-system-frontend:latest
```

**Option 2: Azure Container Registry (Production)**
```bash
# Login to ACR
az acr login --name mycontainerregistry

# Tag images
docker tag annotation-system-backend:latest mycontainerregistry.azurecr.io/annotation-system-backend:latest

# Push to ACR
docker push mycontainerregistry.azurecr.io/annotation-system-backend:latest
```

---

## Phase 3: Infrastructure Provisioning (IaC)

### 3.1 Prerequisites

**Install required tools:**
```bash
# macOS
brew install terraform kubernetes-cli minikube ansible

# Ubuntu/Debian
sudo apt-get install terraform kubectl minikube ansible

# Windows (using WSL2 or PowerShell)
# Install from official websites or use Chocolatey
```

### 3.2 Local Kubernetes Setup (Minikube)

**Start Minikube:**
```bash
# Start Minikube cluster
minikube start --cpus=4 --memory=8192 --driver=docker

# Verify cluster
kubectl cluster-info
kubectl get nodes

# Enable ingress addon
minikube addons enable ingress
```

### 3.3 Terraform Configuration

**Project Structure:**
```
terraform/
├── providers.tf          # Provider configuration
├── variables.tf          # Variable definitions
├── locals.tf            # Local values
├── main.tf              # Main resources
├── outputs.tf           # Output values
└── terraform.tfvars     # Variable assignments
```

**Initialize Terraform:**
```bash
cd terraform/

# Initialize Terraform
terraform init

# Validate configuration
terraform validate

# Show execution plan
terraform plan

# Apply configuration
terraform apply

# Confirm with: yes
```

**What Terraform deploys:**
- Kubernetes namespace
- ConfigMap for application configuration
- Secrets for sensitive data
- PersistentVolumeClaims for storage
- PostgreSQL deployment with service
- Backend deployment with service
- Frontend deployment with service

### 3.4 Verify Infrastructure

```bash
# Check namespace
kubectl get namespace annotation-system

# Check deployments
kubectl get deployments -n annotation-system

# Check services
kubectl get services -n annotation-system

# Check PVCs
kubectl get pvc -n annotation-system

# View all resources
kubectl get all -n annotation-system
```

---

## Phase 4: Configuration Management (Ansible)

### 4.1 Ansible Structure

**Project Structure:**
```
ansible/
├── ansible.cfg          # Ansible configuration
├── inventory.ini        # Inventory file
├── deploy.yaml          # Deployment playbook
├── destroy.yaml         # Destruction playbook
└── status.yaml          # Status check playbook
```

### 4.2 Running Ansible Playbooks

**Deploy application:**
```bash
cd ansible/

# Deploy using Kustomize
ansible-playbook -i inventory.ini deploy.yaml

# Monitor deployment
kubectl get pods -n annotation-system -w
```

**Check status:**
```bash
# Get deployment status
ansible-playbook -i inventory.ini status.yaml

# Or use kubectl directly
kubectl get all -n annotation-system
kubectl describe deployment annotation-backend -n annotation-system
```

**Destroy application:**
```bash
# Delete all resources
ansible-playbook -i inventory.ini destroy.yaml

# Verify cleanup
kubectl get namespace annotation-system
# Should return: Error from server (NotFound)
```

---

## Phase 5: CI/CD Pipeline Setup

### 5.1 GitHub Actions Configuration

**Workflow files location:**
```
.github/workflows/
├── cicd.yaml              # Main CI/CD pipeline
└── quality-checks.yaml    # Code quality & security
```

### 5.2 GitHub Secrets Setup

**Configure required secrets:**
1. Go to GitHub repository → Settings → Secrets and variables → Actions
2. Add the following secrets:

```
DOCKERHUB_USERNAME    = your_dockerhub_username
DOCKERHUB_TOKEN       = your_dockerhub_token (Personal Access Token)
KUBE_CONFIG           = base64 encoded kubeconfig (optional, for K8s deployment)
SLACK_WEBHOOK         = slack webhook URL (optional, for notifications)
```

**Getting Docker Hub credentials:**
```bash
# Create Personal Access Token on Docker Hub
# https://hub.docker.com/settings/security

# Encode kubeconfig (if needed)
cat ~/.kube/config | base64
```

### 5.3 Pipeline Stages

**CI/CD Pipeline (cicd.yaml):**

1. **Build Backend**
   - Checkout code
   - Build Docker image
   - Push to Docker Hub

2. **Build Frontend**
   - Checkout code
   - Install Node dependencies
   - Run linter
   - Build application
   - Build Docker image
   - Push to Docker Hub

3. **Test Backend**
   - Setup PostgreSQL service
   - Install Python dependencies
   - Run migrations
   - Execute tests

4. **Deploy to Kubernetes** (main branch only)
   - Configure kubectl
   - Run Terraform
   - Deploy with Ansible
   - Verify deployment

5. **Notifications**
   - Send Slack notification with status

**Quality Checks (quality-checks.yaml):**
- Security scanning with Trivy
- Python code analysis (flake8, pylint, bandit)
- JavaScript/Node analysis (ESLint)
- Dependency vulnerability checks

### 5.4 Viewing Workflow Runs

```bash
# Visit GitHub Actions tab in your repository
# https://github.com/YOUR_USERNAME/annotation-system/actions

# Check logs for any job
# Click on workflow run → click on job → view logs
```

---

## Phase 6: Deployment and Validation

### 6.1 Manual Deployment (using Terraform only)

```bash
# Navigate to terraform directory
cd terraform/

# Initialize
terraform init

# Plan deployment
terraform plan -out=tfplan

# Apply configuration
terraform apply tfplan

# Get outputs
terraform output
```

### 6.2 Manual Deployment (using Ansible only)

```bash
# Navigate to ansible directory
cd ansible/

# Deploy
ansible-playbook -i inventory.ini deploy.yaml

# Monitor
kubectl get pods -n annotation-system -w
```

### 6.3 Automated Deployment (CI/CD)

```bash
# Push code to main branch
git push origin main

# GitHub Actions automatically:
# 1. Builds Docker images
# 2. Runs tests
# 3. Deploys to Kubernetes
# 4. Sends notifications

# Monitor in GitHub Actions tab
```

### 6.4 Verification Commands

```bash
# Check all resources
kubectl get all -n annotation-system

# Check specific deployments
kubectl get deployments -n annotation-system
kubectl describe deployment annotation-backend -n annotation-system

# Check service endpoints
kubectl get svc -n annotation-system

# Check pod logs
kubectl logs -n annotation-system -l app=annotation-backend
kubectl logs -n annotation-system -l app=annotation-frontend

# Port forward to access locally
kubectl port-forward -n annotation-system service/frontend-service 5173:80
kubectl port-forward -n annotation-system service/backend-service 8000:8000

# Application URLs
# Frontend: http://localhost:5173
# Backend:  http://localhost:8000/api
# Health:   http://localhost:8000/api/health/
```

### 6.5 Troubleshooting

**Check pod status:**
```bash
kubectl get pods -n annotation-…
