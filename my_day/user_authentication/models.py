from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    """
    Custom user model for authentication.
    Uses email as the main identifier.
    """
    email = models.EmailField(unique=True)

    USERNAME_FIELD = "email"        # login with email
    REQUIRED_FIELDS = ["username"]  # still ask for username in createsuperuser

    def __str__(self):
        return self.email
