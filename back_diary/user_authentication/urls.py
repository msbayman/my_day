from django.urls import path
from . import views 

urlpatterns = [
    path('register/', views.register, name='register'),
    path('all_users/', views.All_Users, name='all_users'),
    path('login/', views.login, name='login'),
    path('settings/', views.settings, name='settings'),
    path('verify_token/', views.verify_token, name='verify_token'),
]