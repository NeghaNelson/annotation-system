# Human-in-the-Loop Annotation System

A production-ready web application for crowdsourced image annotation and labeling using Django REST Framework and React.

## Features

✅ **User Authentication** - Secure JWT-based authentication with registration and login
✅ **Image Upload** - Upload images with validation (type, size, format)
✅ **Collaborative Annotation** - Browse and label images with predefined categories
✅ **Real-time Statistics** - Dashboard with annotation progress and label distribution
✅ **Protected Routes** - Secure frontend navigation with token-based auth
✅ **Error Handling** - Comprehensive error handling and user feedback
✅ **Pagination** - Handle large datasets with paginated image listings
✅ **JWT Token Management** - Automatic token refresh and expiration handling
✅ **Production Ready** - Gunicorn server, environment-based configuration, health checks

## Tech Stack

**Backend:**
- Django 5.2.3
- Django REST Framework 3.17.1
- Django REST Framework SimpleJWT 5.3.2
- PostgreSQL 15
- Gunicorn 22.0.0

**Frontend:**
- React 19.2.4
- React Router 7.13.2
- Axios 1.14.0
- Vite 8.0.1

**Infrastructure:**
- Docker & Docker Compose
- PostgreSQL Database
- Alpine Linux for minimal image sizes

## Project Structure

```
annotation-system/
├── backend/
│   ├── config/              # Django settings & URL configuration
│   ├── annotation/          # Main app (models, serializers, views)
│   ├── media/              # Upload directory for images
│   ├── requirements.txt     # Python dependencies
│   ├── manage.py           # Django management
│   ├── Dockerfile          # Backend Docker configuration
│   └── .env               # Environment variables (local)
├── frontend/
│   ├── src/
│   │   ├── pages/          # Page components (Login, Upload, Annotate, Dashboard)
│   │   ├── services/       # API client configuration
│   │   ├── App.jsx        # Main React component
│   │   └── main.jsx       # Entry point
│   ├── package.json        # Node dependencies
│   ├── vite.config.js     # Vite configuration
│   ├── Dockerfile          # Frontend Docker configuration
│   └── .env               # Environment variables (local)
├── docker-compose.yml      # Docker Compose orchestration
├── .env.example           # Example environment file
└── README.md              # This file
```

## Quick Start

### Using Docker (Recommended)

1. **Clone and setup:**
```bash
cd annotation-system
cp .env.example .env
```

2. **Update .env with your configuration:**
```bash
# Edit .env file
DEBUG=False
SECRET_KEY=your-secure-random-key-here
ALLOWED_HOSTS=localhost,127.0.0.1
```

3. **Start the application:**
```bash
docker-compose up -d
```

4. **Initialize the database:**
```bash
docker-compose exec backend python manage.py migrate
```

5. **Access the application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api
- API Documentation: http://localhost:8000/api/health

### Manual Setup (Development)

**Backend Setup:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

**Frontend Setup:**
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/token/` - Login and get JWT tokens
- `POST /api/auth/token/refresh/` - Refresh access token

### Images
- `GET /api/images/` - List unannotated images (paginated)
- `POST /api/upload/` - Upload new image

### Annotations
- `POST /api/annotate/` - Save annotation for image

### Statistics
- `GET /api/dashboard/` - Get annotation statistics

### Health
- `GET /api/health/` - Health check endpoint

## Authentication Flow

1. **Register**: User creates account with username/password
2. **Login**: User submits credentials → receives access + refresh tokens
3. **API Requests**: Frontend includes `Authorization: Bearer {access_token}` header
4. **Token Refresh**: When access token expires, frontend uses refresh token to get new one
5. **Auto-logout**: If refresh fails, user is redirected to login page

## User Workflow

1. **Login/Register** → Enter credentials
2. **Upload Images** → Select and upload images for annotation
3. **Annotate** → Browse images and assign labels (Cat, Dog, Car, Person)
4. **Dashboard** → View progress and statistics
5. **Logout** → Secure session termination

## Data Models

### DatasetImage
- `id` - Primary key
- `image` - Image file (ImageField)
- `uploaded_by` - Foreign Key to User
- `uploaded_at` - Timestamp

### Annotation
- `id` - Primary key
- `image` - Foreign Key to DatasetImage
- `annotated_by` - Foreign Key to User
- `label` - Choice field (Cat, Dog, Car, Person)
- `annotated_at` - Timestamp

## Configuration

### Environment Variables

**Backend (.env):**
```
DEBUG=False                          # Django debug mode
SECRET_KEY=your-secret-key          # Django secret key
ALLOWED_HOSTS=localhost,127.0.0.1   # Allowed hostnames
DB_NAME=annotation_db               # Database name
DB_USER=admin                       # Database user
DB_PASSWORD=admin                   # Database password
DB_HOST=db                          # Database host
CORS_ALLOWED_ORIGINS=...            # CORS allowed origins
```

**Frontend (.env):**
```
VITE_API_BASE_URL=http://localhost:8000/api  # Backend API URL
```

## Security Features

✅ JWT-based authentication with automatic token refresh
✅ CORS configuration to prevent unauthorized cross-origin requests
✅ Environment-based configuration (no hardcoded secrets)
✅ Input validation on file uploads (type, size)
✅ SQL injection prevention via ORM
✅ Protected routes on frontend
✅ CSRF protection (Django middleware)
✅ Secure password hashing with Django's auth system

## Performance Optimizations

✅ Pagination of image listings (20 per page)
✅ Database query optimization with select_related
✅ Gunicorn with 4 workers for production
✅ Alpine Linux for minimal image size
✅ Static file collection and caching
✅ Health checks for container orchestration

## Production Deployment

### Important Checklist

- [ ] Generate secure SECRET_KEY
- [ ] Set DEBUG=False
- [ ] Configure proper ALLOWED_HOSTS
- [ ] Update CORS_ALLOWED_ORIGINS
- [ ] Use strong database password
- [ ] Enable HTTPS/SSL
- [ ] Set up proper logging
- [ ] Configure backup strategy
- [ ] Use production database (not SQLite)
- [ ] Set up monitoring and alerts

### Deployment with Docker Compose

1. Update .env with production values
2. Use environment-specific docker-compose files
3. Configure reverse proxy (Nginx) for SSL
4. Set up database backups
5. Monitor container health

## Testing

```bash
# Backend tests
docker-compose exec backend python manage.py test

# Frontend tests
docker-compose exec frontend npm run test
```

## Troubleshooting

### Images not displaying
- Check `VITE_API_BASE_URL` environment variable
- Verify backend media files are accessible
- Check CORS configuration

### Login issues
- Verify database is migrated
- Check SECRET_KEY configuration
- Monitor backend logs: `docker-compose logs backend`

### Frontend can't connect to backend
- Check backend health: `curl http://localhost:8000/api/health/`
- Verify CORS_ALLOWED_ORIGINS
- Check network connectivity

## API Response Format

### Success Response
```json
{
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "error": "Error message describing what went wrong"
}
```

## License

Internal Use Only - All Rights Reserved

## Support

For issues or feature requests, contact the development team.

---

**Version:** 1.0.0  
**Last Updated:** April 2026  
**Status:** Production Ready ✅
