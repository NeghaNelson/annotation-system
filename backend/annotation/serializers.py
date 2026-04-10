from rest_framework import serializers
from django.contrib.auth.models import User
from .models import DatasetImage, Annotation


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')
        read_only_fields = ('id',)


class DatasetImageSerializer(serializers.ModelSerializer):
    uploaded_by = UserSerializer(read_only=True)
    uploaded_by_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = DatasetImage
        fields = ('id', 'image', 'uploaded_by', 'uploaded_by_id', 'uploaded_at')
        read_only_fields = ('id', 'uploaded_at')


class AnnotationSerializer(serializers.ModelSerializer):
    image = DatasetImageSerializer(read_only=True)
    annotated_by = UserSerializer(read_only=True)
    
    class Meta:
        model = Annotation
        fields = ('id', 'image', 'annotated_by', 'label', 'annotated_at')
        read_only_fields = ('id', 'annotated_at')