from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    health_check, 
    upload_image, 
    list_images, 
    save_annotation, 
    dashboard_stats,
    register_user
)

urlpatterns = [
    # Auth endpoints
    path('auth/register/', register_user, name='register'),
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Health check
    path('health/', health_check),
    
    # Image endpoints
    path('upload/', upload_image),
    path('images/', list_images),
    path('annotate/', save_annotation),
    
    # Stats endpoint
    path('dashboard/', dashboard_stats),
]