from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from .models import User
from .serializer import UserSerializer

# Create your views here.
@api_view(["POST"])
def register(request):
    if not request.data:
        return Response(
            {"error": "No data provided."},
            status=status.HTTP_400_BAD_REQUEST
        )
    elif not all(key in request.data for key in ("email", "username", "password")):
        return Response(
            {"error": "Email, username, and password are required."},
            status=status.HTTP_400_BAD_REQUEST
        )
    email = request.data.get("email")
    if User.objects.filter(email=email).exists():
       return Response(
           {"error": "Email is already in use."},
           status=status.HTTP_400_BAD_REQUEST
       )
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET"])
def All_Users(request):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)