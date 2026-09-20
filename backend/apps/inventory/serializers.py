from rest_framework import serializers

from .models import Brand, Category, InventoryMovement, Product


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "name", "description", "tenant", "created_at", "updated_at")
        read_only_fields = ("id", "tenant", "created_at", "updated_at")


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ("id", "name", "website", "tenant", "created_at", "updated_at")
        read_only_fields = ("id", "tenant", "created_at", "updated_at")


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source="category.name")
    brand_name = serializers.ReadOnlyField(source="brand.name")

    class Meta:
        model = Product
        fields = (
            "id",
            "name",
            "sku",
            "category",
            "category_name",
            "brand",
            "brand_name",
            "quantity",
            "minimum_stock",
            "cost_price",
            "sale_price",
            "expiration_date",
            "description",
            "is_active",
            "tenant",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "tenant", "category_name", "brand_name", "created_at", "updated_at")


class InventoryMovementSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source="product.name")

    class Meta:
        model = InventoryMovement
        fields = (
            "id",
            "product",
            "product_name",
            "movement_type",
            "quantity",
            "note",
            "created_by",
            "tenant",
            "created_at",
        )
        read_only_fields = ("id", "tenant", "created_by", "product_name", "created_at")
