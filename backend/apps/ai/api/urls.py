from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ChurnPredictionViewSet, MLModelViewSet

router = DefaultRouter()
router.register(r"models", MLModelViewSet, basename="ml-model")
router.register(r"predictions", ChurnPredictionViewSet, basename="churn-prediction")

urlpatterns = [
    path("", include(router.urls)),
]
