from django.contrib import admin

from .models import Appointment, Service


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ("name", "duration_minutes", "price", "tenant", "is_active")
    list_filter = ("is_active", "tenant")
    search_fields = ("name",)


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ("pet", "service", "owner", "start_time", "status", "tenant")
    list_filter = ("status", "tenant")
    search_fields = ("pet__name", "owner__full_name", "service__name")
    autocomplete_fields = ("pet", "owner", "service")
    readonly_fields = ("created_at", "updated_at")
