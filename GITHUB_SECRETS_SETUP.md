# GitHub Secrets Setup Guide

## ✅ Code Pushed to GitHub

Repository: https://github.com/NeghaNelson/annotation-system  
Branch: `main`  
Status: **All 80+ files pushed successfully**

---

## Step 1: Create Docker Hub Personal Access Token

### 1.1 Go to Docker Hub
- Visit: https://hub.docker.com/settings/security
- Or: Docker Hub → Your Account → Settings → Security

### 1.2 Create New Access Token
1. Click **"New Access Token"** button
2. Enter token name: `annotation-system-github`
3. Set permissions: **Read & Write** (for pushing images)
4. Click **"Create"**
5. **Copy the token** (you won't see it again!)

### 1.3 Note Your Docker Hub Username
- Go to: https://hub.docker.com/settings/general
- Your username: `[YOUR_DOCKERHUB_USERNAME]`

---

## Step 2: Add GitHub Secrets

### 2.1 Navigate to Repository Secrets
1. Go to: https://github.com/NeghaNelson/annotation-system
2. Click **Settings** tab
3. Left sidebar → **Secrets and variables** → **Actions**

### 2.2 Create First Secret: `DOCKERHUB_USERNAME`
1. Click **"New repository secret"**
2. Name: `DOCKERHUB_USERNAME`
3. Value: Your Docker Hub username (e.g., `neghaNelson`)
4. Click **"Add secret"** ✓

### 2.3 Create Second Secret: `DOCKERHUB_TOKEN`
1. Click **"New repository secret"**
2. Name: `DOCKERHUB_TOKEN`
3. Value: The personal access token you created in Step 1
4. Click **"Add secret"** ✓

### 2.4 Verify Secrets Added
```
✓ DOCKERHUB_USERNAME
✓ DOCKERHUB_TOKEN
```

Both should appear in the "Actions secrets" section (values hidden).

---

## Step 3: Verify GitHub Actions Are Enabled

### 3.1 Check Actions Tab
1. Go to: https://github.com/NeghaNelson/annotation-system/actions
2. You should see CI/CD workflows ready to run:
   - **cicd.yaml** - Main pipeline (build, test, deploy)
   - **quality-checks.yaml** - Code quality scanning

### 3.2 Enable Workflows (if needed)
1. Go to **Actions** tab
2. If workflows are disabled, click **"I understand my workflows, go ahead and enable them"**

---

## Step 4: Trigger First CI/CD Pipeline Run

### 4.1 Option A: Make a Small Code Change
```bash
cd c:\Users\91961\OneDrive\Desktop\annotation-system

# Make a small change (e.g., update README)
echo "" >> README.md

# Commit and push
git add README.md
git commit -m "Trigger CI/CD pipeline"
git push origin main
```

### 4.2 Option B: Manually Trigger Workflow
1. Go to: https://github.com/NeghaNelson/annotation-system/actions
2. Select workflow: **cicd.yaml**
3. Click **"Run workflow"** → **"Run workflow"** button

### 4.3 Monitor Pipeline Execution
1. Go to **Actions** tab
2. Click the latest workflow run
3. Watch stages execute:
   - **build-backend** - Build Django Docker image
   - **build-frontend** - Build React Docker image
   - **test-backend** - Run pytest tests
   - **deploy** - (if secrets configured) Deploy to K8s
   - **notify** - Send Slack notification

---

## Step 5: Verify Pipeline Success

### 5.1 Check Pipeline Status
```
Workflow Status: ✅ All jobs passed
```

Stages completed:
- [x] Build backend Docker image → Pushed to Docker Hub
- [x] Build frontend Docker image → Pushed to Docker Hub
- [x] Run backend tests → Tests passed
- [x] Deploy to Kubernetes → (if enabled)
- [x] Send notification → Slack/Email

### 5.2 Verify Docker Images on Docker Hub
1. Go to: https://hub.docker.com/r/[YOUR_USERNAME]
2. You should see:
   - `annotation-backend` image
   - `annotation-frontend` image
   - Both with tags (commit SHA and `latest`)

### 5.3 Check GitHub Actions Logs
1. Click the completed workflow run
2. Click each job to view logs
3. Look for success messages:
   ```
   ✓ Docker images built successfully
   ✓ Images pushed to Docker Hub
   ✓ Tests passed
   ```

---

## Step 6: Deploy to Kubernetes (Optional - Local Testing)

### 6.1 If You Have Minikube Running Locally
```bash
# Start minikube
minikube start

# Navigate to project
cd terraform

# Initialize Terraform
terraform init

# Apply configuration (pulls images from Docker Hub)
terraform apply -auto-approve

# Verify deployment
kubectl get pods -n annotation-system
kubectl get services -n annotation-system
```

### 6.2 Access Application
```bash
# Get frontend service IP
kubectl get service frontend -n annotation-system

# Or use port-forward
kubectl port-forward service/frontend 3000:80 -n annotation-system
# Access at http://localhost:3000
```

---

## Troubleshooting

### Problem: "Authentication failed" in workflow
**Solution:** 
- Verify DOCKERHUB_USERNAME and DOCKERHUB_TOKEN are correct
- Recreate the token if needed
- Ensure Token has Read & Write permissions

### Problem: "Workflow not triggered on push"
**Solution:**
- Verify workflows are enabled (Actions → Enable workflows)
- Check branch protection rules aren't blocking
- Try pushing to `main` branch

### Problem: "Docker images not on Docker Hub"
**Solution:**
- Check GitHub Actions logs for build failures
- Verify Docker Hub username in secrets matches actual username
- Try rebuilding: `docker build -t [username]/annotation-backend:latest -f backend/Dockerfile .`

### Problem: "Kubernetes deployment fails"
**Solution:**
- Verify kubectl is configured: `kubectl config current-context`
- Verify minikube is running: `minikube status`
- Check deploy job logs in GitHub Actions
- Manually run: `cd terraform && terraform apply`

---

## Complete Setup Checklist

### GitHub Configuration
- [x] Code pushed to GitHub main branch
- [ ] DOCKERHUB_USERNAME secret added
- [ ] DOCKERHUB_TOKEN secret added
- [ ] GitHub Actions enabled
- [ ] Workflows visible in Actions tab

### Docker Hub Setup
- [ ] Personal access token created
- [ ] Token has Read & Write permissions
- [ ] Token copied to GitHub secrets

### First Pipeline Run
- [ ] Pipeline triggered (manual or via push)
- [ ] All jobs completed successfully
- [ ] Docker images visible on Docker Hub
- [ ] Tests passed

### Post-Deployment (Optional)
- [ ] Kubernetes deployment successful
- [ ] Pods running in annotation-system namespace
- [ ] Services accessible
- [ ] Application functional

---

## Quick Reference Commands

### Check workflow status locally
```bash
git log --oneline -n 5
# Should show: "DevOps implementation: K8s, Terraform, Ansible..."
```

### View GitHub Actions from CLI (if gh installed)
```bash
gh workflow list --all
gh run list --repo NeghaNelson/annotation-system
```

### Monitor Docker Hub uploads
```bash
curl -s "https://hub.docker.com/v2/repositories/[username]/annotation-backend/tags" | jq '.results[0:3]'
```

### Redeploy latest images
```bash
kubectl rollout restart deployment/annotation-backend -n annotation-system
kubectl rollout restart deployment/annotation-frontend -n annotation-system
```

---

## Next Steps

1. **Complete Steps 1-3** (Create token, add secrets)
2. **Run Step 4** (Trigger first pipeline)
3. **Monitor Steps 5** (Verify success)
4. **Optional Step 6** (Deploy locally to K8s)

**Expected time:** 5-10 minutes for setup + 2-5 minutes for first pipeline run

---

## Support

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Token expired | Recreate new token in Docker Hub Settings |
| Wrong username | Check Docker Hub profile, use exact username |
| Workflow stuck | Check Actions tab, view logs for error messages |
| Images not pushed | Verify secrets are correct, check Docker Hub account |
| Deploy fails | Ensure minikube running, kubectl configured |

---

## Expected Workflow Output

When pipeline runs successfully:

```
✓ Checking out code
✓ Building backend image annotation-backend:latest
✓ Building backend image annotation-backend:abc1234
✓ Pushing image to Docker Hub
✓ Building frontend image annotation-frontend:latest
✓ Building frontend image annotation-frontend:abc1234
✓ Pushing image to Docker Hub
✓ Starting PostgreSQL service
✓ Running migrations
✓ Running pytest
✓ Tests passed: 15 passed in 2.34s
✓ Configuring kubectl
✓ Running Terraform apply
✓ Deploying with Ansible
✓ Verifying deployment
✓ Sending notification to Slack
✅ Workflow completed successfully
```

---

## Final Status

**Repository:** https://github.com/NeghaNelson/annotation-system  
**Code Status:** ✅ Pushed to main branch  
**Next Action:** Configure GitHub Secrets (Steps 1-3)

