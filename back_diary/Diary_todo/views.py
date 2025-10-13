from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from rest_framework.permissions import AllowAny
from user_authentication.models import User 
from .models import Diary, Todo     
from .serializer import  DiarySerializer, TodoSerializer
from datetime import date
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.decorators import authentication_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from datetime import datetime




from rest_framework import status as http_status











@api_view(["POST"])
def create_diary(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    text = request.data.get("text", "").strip()
    if not text:
        return Response({"error": "Diary text is required"}, status=status.HTTP_400_BAD_REQUEST)

    diary = Diary.objects.create(user=user, text=text)
    serializer = DiarySerializer(diary)
    return Response(serializer.data, status=status.HTTP_201_CREATED)



@api_view(["GET"])
def user_diaries(request, user_id):
    diaries = Diary.objects.filter(user_id=user_id)
    serializer = DiarySerializer(diaries, many=True)
    return Response(serializer.data)


# # Add a todo to a diary
# @api_view(["POST"])
# def add_todo(request, diary_id):
#     try:
#         diary = Diary.objects.get(id=diary_id)
#     except Diary.DoesNotExist:
#         return Response({"error": "Diary not found"}, status=status.HTTP_404_NOT_FOUND)

#     serializer = TodoSerializer(data=request.data)
#     if serializer.is_valid():
#         serializer.save(diary=diary)
#         return Response(serializer.data, status=status.HTTP_201_CREATED)

#     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# List all todos of a diary
@api_view(["GET"])
def diary_todos(request, diary_id):
    todos = Todo.objects.filter(diary_id=diary_id)
    serializer = TodoSerializer(todos, many=True)
    return Response(serializer.data)



@api_view(["GET"])
def get_today(request, user_id):
    today = date.today()
    try:
        diary = Diary.objects.get(user_id=user_id, pub_date=today)
    except Diary.DoesNotExist:

        return Response({"error": "No diary for today"}, status=status.HTTP_404_NOT_FOUND)

    diary_data = DiarySerializer(diary).data
    todos = Todo.objects.filter(diary=diary)
    todos_data = TodoSerializer(todos, many=True).data

    return Response({
        "diary": diary_data,
        "todos": todos_data
    }, status=status.HTTP_200_OK)



@api_view(["GET"])
@permission_classes([AllowAny])
def get_all_diaries(request , username):
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    diaries = Diary.objects.filter(user=user)
    serializer = DiarySerializer(diaries, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)



@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_all_todos(request):
    user = request.user
    date_str = request.query_params.get("date", None)

    todos = Todo.objects.filter(user=user)

    if date_str:
        try:
            selected_date = datetime.strptime(date_str, "%Y-%m-%d").date()
            print( selected_date)
            todos = todos.filter(start_time__date=selected_date)
        except ValueError:
            return Response(
                {"error": "Invalid date format. Use YYYY-MM-DD."},
                status=status.HTTP_400_BAD_REQUEST,
            )

    todos = todos.order_by("-start_time")
    serializer = TodoSerializer(todos, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)



@api_view(["DELETE"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def delete_todo(request, pk):
    try:
        todo = Todo.objects.get(id=pk, user=request.user)
        todo.delete()
        return Response({"message": "Todo deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
    except Todo.DoesNotExist:
        return Response({"error": "Todo not found."}, status=status.HTTP_404_NOT_FOUND)
    
@api_view(["PATCH"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def check_todo(request, pk, completed):
    try:
        todo = Todo.objects.get(id=pk, user=request.user)
    except Todo.DoesNotExist:
        return Response({"error": "Todo not found"}, status=http_status.HTTP_404_NOT_FOUND)
    

    is_completed = completed.lower() == 'true'
    status_value = 'completed' if is_completed else 'not_started'
    
    todo.status = status_value
    todo.save()
    
    return Response({
        "message": "Todo status updated", 
        "status": todo.status
    }, status=http_status.HTTP_200_OK)

@api_view(["POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def add_todo(request):
    start_time = request.data.get('start_time')
    end_time = request.data.get('end_time')
    
    if start_time and end_time:
        try:
            start_dt = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
            end_dt = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
            
            if start_dt >= end_dt:
                return Response(
                    {"error": "Start time must be before end time"}, 
                    status=http_status.HTTP_400_BAD_REQUEST
                )
        except ValueError:
            return Response(
                {"error": "Invalid datetime format"}, 
                status=http_status.HTTP_400_BAD_REQUEST
            )
    
    serializer = TodoSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=http_status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=http_status.HTTP_400_BAD_REQUEST)