from .models import Todo , Diary 
from rest_framework import serializers



class TodoSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Todo
        fields = ["id", "title", "description", "start_time", "end_time", "status", "status_display"]


class DiarySerializer(serializers.ModelSerializer):
    todos = TodoSerializer(many=True, read_only=True)

    class Meta:
        model = Diary
        fields = ["id", "pub_date", "text", "todos"]
