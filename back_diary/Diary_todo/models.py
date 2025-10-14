from user_authentication.models import User
from django.db import models


class Diary(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="diaries")
    pub_date = models.DateField()  
    text = models.TextField()  

    class Meta:
        unique_together = ("user", "pub_date")

    def __str__(self):
        return f"{self.user.email} - {self.pub_date.strftime('%Y-%m-%d')}"


class Todo(models.Model):
    STATUS_CHOICES = [
        ("not_started", "Not Started"),
        ("completed", "Completed"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="todos")
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    status = models.CharField(choices=STATUS_CHOICES, default="not_started"
    )

    def __str__(self):
        return f"{self.title} [{self.get_status_display()}]"
