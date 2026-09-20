from django.contrib import admin

from .models import Brand, Category, InventoryMovement, Product


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "tenant")
    search_fields = ("name",)


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ("name", "website", "tenant")
    search_fields = ("name",)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "sku", "quantity", "minimum_stock", "sale_price", "tenant", "is_active")
    list_filter = ("is_active", "category", "brand", "tenant")
    search_fields = ("name", "sku")
    autocomplete_fields = ("category", "brand")


@admin.register(InventoryMovement)
class InventoryMovementAdmin(admin.ModelAdmin):
    list_display = ("product", "movement_type", "quantity", "tenant", "created_by", "created_at")
    list_filter = ("movement_type", "tenant")
    search_fields = ("product__name",)
    autocomplete_fields = ("product",)
    readonly_fields = ("created_at", "updated_at")
