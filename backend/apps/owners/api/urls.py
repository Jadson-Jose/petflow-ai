from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import OwnerViewSet

router = DefaultRouter()
router.register(r"owners", OwnerViewSet, basename="owner")

urlpatterns = [
    path("", include(router.urls)),
]
