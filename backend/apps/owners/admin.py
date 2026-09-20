from django.contrib import admin

from .models import Owner


@admin.register(Owner)
class OwnerAdmin(admin.ModelAdmin):
    list_display = ("full_name", "email", "phone", "tenant", "status")
    list_filter = ("status", "tenant")
    search_fields = ("full_name", "email", "phone", "cpf")
    ordering = ("full_name",)
