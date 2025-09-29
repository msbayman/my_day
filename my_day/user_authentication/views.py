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
    username = request.data.get("username")
    if User.objects.filter(email=email).exists():
       return Response(
           {"error": "Email is already in use."},
           status=status.HTTP_400_BAD_REQUEST
       )
    elif User.objects.filter(username=username).exists():
       return Response(
           {"error": "Username is already in use."},
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

@api_view(["POST"])
def login(request):
    if not request.data:
        return Response(
            {"error": "No data provided."},
            status=status.HTTP_400_BAD_REQUEST
        )
    email = request.data.get("email")
    password = request.data.get("password")
    if not email or not password:
        return Response(
            {"error": "Email and password are required."},
            status=status.HTTP_400_BAD_REQUEST
        )
    try:
        user = User.objects.get(email=email)
        if user.check_password(password):
            return Response({"message": "Login successful."})
        else:
            return Response({"error": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)