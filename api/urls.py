from django.urls import path
from . import views

urlpatterns = [
    path('', views.api, name="api"),
    path('log', views.log, name="log"),
    path('email/', views.emails),
    path('history/', views.history),
    path('users/', views.users),
]