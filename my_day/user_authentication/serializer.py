from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "username", "password"]
        extra_kwargs = {
            "password": {"write_only": True, "min_length": 8}  # don’t leak password
        }

    def create(self, validated_data):
        user = User(
            email=validated_data["email"],
            username=validated_data.get("username", "")
        )
        user.set_password(validated_data["password"])
        user.save()
        return user


# class TodoSerializer(serializers.ModelSerializer):
#     status_display = serializers.CharField(source="get_status_display", read_only=True)

#     class Meta:
#         model = Todo
#         fields = ["id", "title", "description", "start_time", "end_time", "status", "status_display"]


# class DiarySerializer(serializers.ModelSerializer):
#     todos = TodoSerializer(many=True, read_only=True)

#     class Meta:
#         model = Diary
#         fields = ["id", "pub_date", "text", "todos"]
