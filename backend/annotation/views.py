from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from django.contrib.auth.models import User
from django.db.models import Count, Q
from rest_framework.pagination import PageNumberPagination
from .models import DatasetImage, Annotation
from .serializers import DatasetImageSerializer, AnnotationSerializer, UserSerializer


class StandardPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Health check endpoint for monitoring"""
    return Response({
        "status": "ok",
        "message": "Annotation system is running"
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """Register a new user"""
    try:
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email', '')

        if not username or not password:
            return Response({
                "error": "username and password are required"
            }, status=status.HTTP_400_BAD_REQUEST)

        if len(password) < 6:
            return Response({
                "error": "Password must be at least 6 characters"
            }, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({
                "error": "Username already exists"
            }, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(
            username=username,
            password=password,
            email=email
        )

        serializer = UserSerializer(user)
        return Response({
            "message": "User registered successfully",
            "user": serializer.data
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_image(request):
    """Upload an image for annotation"""
    try:
        image = request.FILES.get('image')

        if not image:
            return Response({
                "error": "image file is required"
            }, status=status.HTTP_400_BAD_REQUEST)

        # Validate image file type
        allowed_extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']
        file_ext = image.name.split('.')[-1].lower()
        
        if file_ext not in allowed_extensions:
            return Response({
                "error": f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
            }, status=status.HTTP_400_BAD_REQUEST)

        # Validate file size (max 10MB)
        if image.size > 10 * 1024 * 1024:
            return Response({
                "error": "File size must be less than 10MB"
            }, status=status.HTTP_400_BAD_REQUEST)

        dataset_image = DatasetImage.objects.create(
            image=image,
            uploaded_by=request.user
        )

        serializer = DatasetImageSerializer(dataset_image)
        return Response({
            "message": "Image uploaded successfully",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_images(request):
    """Get unannotated images with pagination"""
    try:
        # Get images that don't have annotations yet
        annotated_image_ids = Annotation.objects.values_list('image_id', flat=True)
        images = DatasetImage.objects.exclude(
            id__in=annotated_image_ids
        ).order_by('-uploaded_at').select_related('uploaded_by')

        # Apply pagination
        paginator = StandardPagination()
        paginated_images = paginator.paginate_queryset(images, request)

        serializer = DatasetImageSerializer(paginated_images, many=True)
        return paginator.get_paginated_response(serializer.data)

    except Exception as e:
        return Response({
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_annotation(request):
    """Save an annotation for an image"""
    try:
        image_id = request.data.get('image_id')
        label = request.data.get('label')

        if not image_id or not label:
            return Response({
                "error": "image_id and label are required"
            }, status=status.HTTP_400_BAD_REQUEST)

        # Validate label choice
        valid_labels = dict(Annotation.LABEL_CHOICES)
        if label not in valid_labels:
            return Response({
                "error": f"Invalid label. Valid options: {', '.join(valid_labels.keys())}"
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            image = DatasetImage.objects.get(id=image_id)
        except DatasetImage.DoesNotExist:
            return Response({
                "error": "Image not found"
            }, status=status.HTTP_404_NOT_FOUND)

        # Check if already annotated
        if Annotation.objects.filter(image=image).exists():
            return Response({
                "error": "This image has already been annotated"
            }, status=status.HTTP_400_BAD_REQUEST)

        # Check if user already annotated this image
        if Annotation.objects.filter(image=image, annotated_by=request.user).exists():
            return Response({
                "error": "You have already annotated this image"
            }, status=status.HTTP_400_BAD_REQUEST)

        annotation = Annotation.objects.create(
            image=image,
            annotated_by=request.user,
            label=label
        )

        serializer = AnnotationSerializer(annotation)
        return Response({
            "message": "Annotation saved successfully",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """Get annotation statistics"""
    try:
        total_images = DatasetImage.objects.count()
        total_annotations = Annotation.objects.count()
        pending_images = total_images - Annotation.objects.values('image_id').distinct().count()
        
        # Additional stats
        current_user_annotations = Annotation.objects.filter(
            annotated_by=request.user
        ).count()
        
        label_distribution = Annotation.objects.values('label').annotate(
            count=Count('id')
        ).order_by('-count')

        return Response({
            "message": "Dashboard stats retrieved successfully",
            "data": {
                "total_images": total_images,
                "total_annotations": total_annotations,
                "pending_images": pending_images,
                "current_user_annotations": current_user_annotations,
                "label_distribution": list(label_distribution)
            }
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)