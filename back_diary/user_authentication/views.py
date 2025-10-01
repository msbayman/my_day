from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from .models import User
from .serializer import UserSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.decorators import authentication_classes

@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def verify_token(request):
    return Response({"valid": True})

@api_view(["POST"])
@permission_classes([AllowAny])
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
@authentication_classes([JWTAuthentication])  # ✅ Add JWT authentication
@permission_classes([IsAuthenticated])  # ✅ Require authentication
def All_Users(request):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)


@api_view(["POST"])
@authentication_classes([JWTAuthentication])  
@permission_classes([IsAuthenticated])
def settings(request):
    if not request.data:
        return Response(
            {"error": "No data provided."},
            status=status.HTTP_400_BAD_REQUEST
        )
    elif not all(key in request.data for key in ("current_password",)):
        return Response(
            {"error": "Current password is required."}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    

    user = request.user
    
    username = request.data.get("username")
    new_password = request.data.get("new_password")
    two_fa = request.data.get("two_fa")
    current_password = request.data.get("current_password")
    

    if not user.check_password(current_password):
        return Response(
            {"error": "Current password is incorrect."},
            status=status.HTTP_401_UNAUTHORIZED
        )
    

    if username:
        if User.objects.filter(username=username).exclude(id=user.id).exists(): 
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


@api_view(["POST"])
@permission_classes([AllowAny])
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
            refresh = RefreshToken.for_user(user)
            return Response({
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                    }, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)