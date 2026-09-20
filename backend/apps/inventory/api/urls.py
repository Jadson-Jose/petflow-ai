from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    BrandViewSet,
    CategoryViewSet,
    InventoryMovementViewSet,
    ProductViewSet,
)

router = DefaultRouter()
router.register(r"categories", CategoryViewSet, basename="category")
router.register(r"brands", BrandViewSet, basename="brand")
router.register(r"products", ProductViewSet, basename="product")
router.register(r"movements", InventoryMovementViewSet, basename="movement")

urlpatterns = [
    path("", include(router.urls)),
]
