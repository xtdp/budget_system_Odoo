from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin (Business Owner)'),
        ('portal', 'Portal User (Contact/Customer)'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='portal')
    phone = models.CharField(max_length=15, blank=True, null=True)