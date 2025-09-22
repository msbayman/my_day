from django.urls import path
from . import views 

urlpatterns = [
    path("create_diary/<int:user_id>/", views.create_diary, name="create_diary"),
    path("user_diaries/<int:user_id>/", views.user_diaries, name="user_diaries"),
   path("add_todo/<int:diary_id>/", views.add_todo, name="add_todo"),
   path("diary_todos/<int:diary_id>/", views.diary_todos, name="diary_todos"),
   path("day/<int:user_id>/", views.get_today, name="get_today"),
]  