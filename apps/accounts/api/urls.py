from django.urls import path

from .views import (
    LoginAPIView,
    MeAPIView,
)

urlpatterns = [
    path("login/", LoginAPIView.as_view()),
    path("me/", MeAPIView.as_view()),
]
