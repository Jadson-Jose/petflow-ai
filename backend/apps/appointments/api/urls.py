from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import AppointmentViewSet, ServiceViewSet

router = DefaultRouter()
router.register(r"services", ServiceViewSet, basename="service")
router.register(r"appointments", AppointmentViewSet, basename="appointment")

urlpatterns = [
    path("", include(router.urls)),
]
