from django.contrib import admin
from .models import DatasetImage, Annotation

admin.site.register(DatasetImage)
admin.site.register(Annotation)