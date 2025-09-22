from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    """
    Custom user model for authentication.
    Uses email as the main identifier.
    """
    email = models.EmailField(unique=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.email


# class Diary(models.Model):
#     user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="diaries")
#     pub_date = models.DateField(auto_now_add=True)  # one diary per day
#     text = models.TextField()  # diary entry

#     class Meta:
#         unique_together = ("user", "pub_date")

#     def __str__(self):
#         return f"{self.user.email} - {self.pub_date.strftime('%Y-%m-%d')}"


# class Todo(models.Model):
#     STATUS_CHOICES = [
#         ("not_started", "Not Started"),
#         ("in_progress", "In Progress"),
#         ("completed", "Completed"),
#     ]

#     diary = models.ForeignKey(Diary, on_delete=models.CASCADE, related_name="todos")
#     title = models.CharField(max_length=200)
#     description = models.TextField(blank=True)
#     start_time = models.TimeField()
#     end_time = models.TimeField()
#     status = models.CharField(
#         max_length=20, choices=STATUS_CHOICES, default="not_started"
#     )

#     def __str__(self):
#         return f"{self.title} [{self.get_status_display()}]"
