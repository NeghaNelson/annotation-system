# Deployment Guide - Annotation System

This guide covers deploying the Annotation System to production environments.

## Pre-Deployment Checklist

### Security
- [ ] Generate a secure SECRET_KEY (at least 50 random characters)
- [ ] Set DEBUG=False in production
- [ ] Configure ALLOWED_HOSTS for your domain(s)
- [ ] Set secure CORS_ALLOWED_ORIGINS
- [ ] Use strong, unique database passwords
- [ ] Configure HTTPS/SSL certificate
- [ ] Enable security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- [ ] Set up rate limiting
- [ ] Configure firewall rules

### Infrastructure
- [ ] Provision production server (AWS, Azure, DigitalOcean, etc.)
- [ ] Set up PostgreSQL database (managed service recommended)
- [ ] Configure static file storage (S3 or similar)
- [ ] Set up media file storage (S3 or similar)
- [ ] Configure backup strategy
- [ ] Set up monitoring and logging
- [ ] Configure CDN for static files

### Application
- [ ] Run all tests locally
- [ ] Update dependencies to latest stable versions
- [ ] Configure production logging
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Create database backups
- [ ] Set up automated backups

## Deployment Methods

### Method 1: Docker Compose on VPS

1. **SSH into your server:**
```bash
ssh user@your-server.com
```

2. **Install Docker:**
```bash
curl -sSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

3. **Clone repository:**
```bash
git clone <your-repo-url> annotation-system
cd annotation-system
```

4. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with production values
nano .env
```

5. **Generate SECRET_KEY:**
```bash
python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

6. **Start services:**
```bash
docker-compose up -d
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
```

7. **Configure Nginx reverse proxy:**
```nginx
upstream annotation_backend {
    server localhost:8000;
}

upstream annotation_frontend {
    server localhost:5173;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend
    location / {
        proxy_pass http://annotation_frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://annotation_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files
    location /staticfiles/ {
        alias /path/to/annotation-system/backend/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Media files
    location /media/ {
        alias /path/to/annotation-system/backend/media/;
        expires 7d;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### Method 2: Kubernetes Deployment

```yaml
# backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: annotation-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: annotation-backend
  template:
    metadata:
      labels:
        app: annotation-backend
    spec:
      containers:
      - name: backend
        image: annotation-backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: DEBUG
          value: "False"
        - name: SECRET_KEY
          valueFrom:
            secretKeyRef:
              name: annotation-secrets
              key: secret-key
        - name: DB_HOST
          value: postgres-service
        - name: DB_NAME
          valueFrom:
            secretKeyRef:
              name: annotation-secrets
              key: db-name
        - name: DB_USER
          valueFrom:
            secretKeyRef:
              name: annotation-secrets
              key: db-user
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: annotation-secrets
              key: db-password
        livenessProbe:
          httpGet:
            path: /api/health/
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health/
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: annotation-backend-service
spec:
  selector:
    app: annotation-backend
  ports:
  - protocol: TCP
    port: 8000
    targetPort: 8000
  type: ClusterIP
```

### Method 3: AWS Elastic Beanstalk

1. **Install EB CLI:**
```bash
pip install awsebcli
```

2. **Initialize:**
```bash
eb init -p docker annotation-system
```

3. **Create environment:**
```bash
eb create production -t "Classic load balancer"
```

4. **Configure environment variables:**
```bash
eb setenv DEBUG=False SECRET_KEY=your-secret-key ...
```

5. **Deploy:**
```bash
eb deploy
```

## Post-Deployment

### Database Migrations
```bash
docker-compose exec backend python manage.py migrate
```

### Create Superuser
```bash
docker-compose exec backend python manage.py createsuperuser
```

### Collect Static Files
```bash
docker-compose exec backend python manage.py collectstatic --noinput
```

### Monitor Services
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

## Scaling Considerations

### Horizontal Scaling
- Use load balancer (Nginx, HAProxy)
- Scale backend workers (adjust gunicorn workers)
- Use connection pooling for database
- Cache frequently accessed data

### Vertical Scaling
- Increase server resources as needed
- Monitor CPU and memory usage
- Optimize database queries
- Configure CDN for static files

## Backup and Recovery

### Database Backup
```bash
# Manual backup
docker-compose exec db pg_dump -U admin annotation_db > backup.sql

# Restore
docker-compose exec -T db psql -U admin annotation_db < backup.sql
```

### Automated Backups
```bash
# Add to crontab
0 2 * * * cd /path/to/annotation-system && \
  docker-compose exec -T db pg_dump -U admin annotation_db | \
  gzip > /backups/annotation_db_$(date +\%Y\%m\%d_\%H\%M\%S).sql.gz
```

## Monitoring

### Health Checks
```bash
# Check backend health
curl https://yourdomain.com/api/health/

# Check database connection
docker-compose exec backend python manage.py dbshell
```

### Logs
```bash
# View services logs
docker-compose logs -f

# Archive logs
docker-compose logs --no-log-prefix backend > logs.txt
```

### Performance Monitoring
- Monitor response times
- Track error rates
- Monitor database query performance
- Track concurrent users

## Security Hardening

### Additional Steps
1. **Rate Limiting:**
```python
# In settings.py
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour'
    }
}
```

2. **WAF Configuration:**
   - Enable ModSecurity
   - Configure DDoS protection
   - Set up IP whitelisting if needed

3. **API Keys:**
   - Implement API key authentication for programmatic access
   - Rotate keys regularly

## Updating

### Update Process
1. Pull latest changes
2. Run database migrations
3. Collect static files
4. Test in staging
5. Deploy to production
6. Monitor for errors

```bash
git pull origin main
docker-compose build
docker-compose up -d
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py collectstatic --noinput
```

## Troubleshooting

### Services won't start
- Check logs: `docker-compose logs`
- Verify configuration: Check .env file
- Check port availability: Already in use?

### Database connection issues
- Verify DATABASE_URL
- Check database credentials
- Verify network connectivity

### Frontend not loading
- Check VITE_API_BASE_URL
- Verify CORS configuration
- Check browser console for errors

### Performance issues
- Monitor resource usage
- Optimize database queries
- Enable caching
- Scale horizontally

## Rollback Procedure

If deployment fails:
```bash
# Revert to previous version
git checkout <previous-commit>
docker-compose down
docker-compose build
docker-compose up -d
docker-compose exec backend python manage.py migrate 0001
```

---

For production support, refer to official documentation or contact the development team.
