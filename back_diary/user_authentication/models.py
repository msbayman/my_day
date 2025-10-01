from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    """
    Custom user model for authentication.
    Uses email as the main identifier.
    """
    email = models.EmailField(unique=True)
    username = models.CharField(unique=True)
    two_fa = models.BooleanField(default=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.email
