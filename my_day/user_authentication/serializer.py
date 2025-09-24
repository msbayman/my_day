from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "username", "password"]
        extra_kwargs = {
            "username": {"required": True, "min_length": 3},
            "password": {"write_only": True, "min_length": 8}  
        }

    def create(self, validated_data):
        user = User(
            email=validated_data["email"],
            username=validated_data.get("username", "")
        )
        user.set_password(validated_data["password"])
        user.save()
        return user
