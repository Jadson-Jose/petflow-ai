from django.contrib import admin

from .models import Subscription


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = (
        "tenant",
        "plan",
        "status",
        "current_period_start",
        "current_period_end",
        "created_at",
    )
    list_filter = ("status", "plan")
    search_fields = ("tenant__name", "tenant__slug")
    readonly_fields = ("created_at", "updated_at")
    autocomplete_fields = ("tenant",)
