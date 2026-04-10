from django.db import models
from django.contrib.auth.models import User

class DatasetImage(models.Model):
    image = models.ImageField(upload_to='dataset_images/')
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.image.name

class Annotation(models.Model):
    LABEL_CHOICES = [
        ('Cat', 'Cat'),
        ('Dog', 'Dog'),
        ('Car', 'Car'),
        ('Person', 'Person'),
    ]

    image = models.ForeignKey(DatasetImage, on_delete=models.CASCADE)
    annotated_by = models.ForeignKey(User, on_delete=models.CASCADE)
    label = models.CharField(max_length=50, choices=LABEL_CHOICES)
    annotated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.image.id} - {self.label}"