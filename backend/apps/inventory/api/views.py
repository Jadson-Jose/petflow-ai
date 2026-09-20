from rest_framework import permissions, viewsets

from ..models import Brand, Category, InventoryMovement, Product
from ..serializers import (
    BrandSerializer,
    CategorySerializer,
    InventoryMovementSerializer,
    ProductSerializer,
)


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(tenant=self.request.user.tenant)

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)


class BrandViewSet(viewsets.ModelViewSet):
    serializer_class = BrandSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Brand.objects.filter(tenant=self.request.user.tenant)

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Product.objects.filter(
            tenant=self.request.user.tenant
        ).select_related("category", "brand")

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)


class InventoryMovementViewSet(viewsets.ModelViewSet):
    serializer_class = InventoryMovementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return InventoryMovement.objects.filter(
            tenant=self.request.user.tenant
        ).select_related("product", "created_by")

    def perform_create(self, serializer):
        serializer.save(
            tenant=self.request.user.tenant,
            created_by=self.request.user,
        )
