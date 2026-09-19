from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import MeViewSet

router = DefaultRouter()
router.register(r"me", MeViewSet, basename="me")

urlpatterns = [
    path("", include(router.urls)),
]
