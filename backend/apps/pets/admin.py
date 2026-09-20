from django.contrib import admin

from .models import Pet


@admin.register(Pet)
class PetAdmin(admin.ModelAdmin):
    list_display = ("name", "species", "breed", "owner", "tenant", "is_active")
    list_filter = ("species", "gender", "is_active", "tenant")
    search_fields = ("name", "breed", "microchip", "owner__full_name")
    ordering = ("name",)
    autocomplete_fields = ("owner",)
