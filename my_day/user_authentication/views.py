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
def settings(request):
    if not request.data:
        return Response(
            {"error": "No data provided."},
            status=status.HTTP_400_BAD_REQUEST
        )
    elif not all(key in request.data for key in ("email", "current_password")):
        return Response(
            {"error": "Email and current_password are required."},
            status=status.HTTP_400_BAD_REQUEST
        )
    email = request.data.get("email")
    username = request.data.get("username")
    new_password = request.data.get("new_password")
    two_fa = request.data.get("two_fa")
    current_password = request.data.get("current_password")
    try:
        user = User.objects.get(email=email)
        if not user.check_password(current_password):
            return Response(
                {"error": "Current password is incorrect."},
                status=status.HTTP_401_UNAUTHORIZED
            )
        if username:
            if User.objects.filter(username=username).exclude(email=email).exists():
                return Response(
                    {"error": "Username is already in use."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user.username = username
        if new_password:
            user.set_password(new_password)
        if two_fa is not None: 
            user.two_fa = two_fa
        user.save()
        return Response({"message": "Settings updated successfully."})
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)    




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