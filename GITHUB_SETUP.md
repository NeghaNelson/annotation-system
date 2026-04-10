# GitHub Setup and CI/CD Instructions

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Fill in the form:
   - Repository name: `annotation-system`
   - Description: `DevOps Project - Human-in-the-Loop Annotation System`
   - Visibility: **Public** (required for evaluation)
   - Initialize with README: NO (we already have one)
   - .gitignore: Python
   - License: MIT

3. Click "Create repository"

## Step 2: Push Your Code to GitHub

```bash
# Navigate to your project
cd annotation-system

# Add GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/annotation-system.git

# Verify remote
git remote -v

# Push to main branch
git branch -M main
git push -u origin main

# Verify push
git log --oneline -n 5
```

## Step 3: Configure GitHub Secrets for CI/CD

### 3.1 Find Your Docker Hub Credentials

**Option A: Create Docker Hub Personal Access Token**
1. Go to https://hub.docker.com/settings/security
2. Click "New Access Token"
3. Give it a name: `github-actions`
4. Copy the token (you won't see it again!)

**Option B: Use Docker Hub Password (not recommended)**
- Just use your Docker Hub password

### 3.2 Add Secrets to GitHub

1. Go to your GitHub repository
2. Click Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add these secrets:

| Secret Name | Value |
|-------------|-------|
| DOCKERHUB_USERNAME | Your Docker Hub username |
| DOCKERHUB_TOKEN | Your Docker Hub token or password |

**Do NOT add KUBE_CONFIG initially** (it's optional for local minikube deployment)

### 3.3 Verify Secrets

```bash
# On GitHub UI, you should see:
# - DOCKERHUB_USERNAME ●●●●●●
# - DOCKERHUB_TOKEN ●●●●●●
```

## Step 4: Create Branches for Development

```bash
# Create develop branch
git checkout -b develop
git push -u origin develop

# Create feature branch
git checkout -b feature/devops-setup
```

## Step 5: Test CI/CD Pipeline

1. Make a small change to test the pipeline:
```bash
# Edit a file
echo "# DevOps Pipeline Test" >> DEVOPS_GUIDE.md

# Commit and push
git add DEVOPS_GUIDE.md
git commit -m "test: trigger CI/CD pipeline"
git push origin feature/devops-setup
```

2. Create a Pull Request on GitHub:
   - Go to your repository
   - Click "Compare & pull request"
   - Add description
   - Click "Create pull request"

3. Watch the CI/CD pipeline run:
   - Go to "Actions" tab
   - You should see a workflow running
   - It will build Docker images and run tests

4. Merge PR after checks pass:
   - Click "Merge pull request"
   - Confirm merge

## Step 6: Trigger Deployment Pipeline

```bash
# Make a change and push to main
git checkout main
git merge feature/devops-setup
git push origin main

# This triggers:
# 1. Docker image build
# 2. Tests
# 3. Push to Docker Hub
# 4. Kubernetes deployment (if configured)
```

## Step 7: View GitHub Actions

To see workflow runs:
1. Go to your repository
2. Click "Actions" tab
3. You'll see a list of workflow runs
4. Click on a run to see details
5. Click on a job to see logs

## Workflow Breakdown

### cicd.yaml - Main CI/CD Pipeline

**Triggers on:**
- Push to `main` or `develop`
- Pull requests to `main` or `develop`

**Jobs:**
1. **build-backend** - Builds backend Docker image
2. **build-frontend** - Builds frontend Docker image
3. **test-backend** - Runs backend tests
4. **deploy** - Deploys to Kubernetes (main branch only)
5. **notify** - Sends Slack notification (optional)

### quality-checks.yaml - Code Quality Pipeline

**Triggers on:**
- Push to `main` or `develop`
- Pull requests to `main` or `develop`

**Jobs:**
1. **security-scan** - Scans vulnerabilities with Trivy
2. **code-quality** - Runs linters (flake8, pylint, ESLint)
3. **dependency-check** - Checks for vulnerable dependencies

## Viewing Test Results

### Backend Tests
```bash
# In GitHub Actions logs, look for:
# "test-backend" job → "Run tests" step
```

### Docker Image Builds
```bash
# In GitHub Actions logs, look for:
# "build-backend" → "Build and push backend Docker image"
# Take note of the image digest
```

### Security Scans
```bash
# In GitHub Actions logs, look for:
# "security-scan" job output
# Or check GitHub Security tab for SARIF results
```

## Troubleshooting

### Docker Build Fails
- Check backend/Dockerfile and frontend/Dockerfile
- Ensure all dependencies are in requirements.txt
- Verify Dockerfiles are syntactically correct

### Tests Fail
- Check backend/tests.py
- Ensure database migration runs successfully
- Check logs in "test-backend" job

### Deployment Fails
- Verify kubeconfig is correctly encoded in secrets
- Check Terraform configuration in terraform/ directory
- Ensure kubectl context is set correctly

## Next Steps

1. ✅ Create GitHub repository
2. ✅ Configure Docker Hub credentials
3. ✅ Add GitHub secrets
4. ✅ Push code to GitHub
5. ✅ Monitor first workflow run
6. Make code changes and test CI/CD
7. Prepare for deployment to Kubernetes

## References

- GitHub Actions Documentation: https://docs.github.com/en/actions
- Docker Hub: https://hub.docker.com
- GitHub Secrets: https://docs.github.com/en/actions/security-guides/encrypted-secrets
