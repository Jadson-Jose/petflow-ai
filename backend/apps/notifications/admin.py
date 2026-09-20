from django.contrib import admin

from .models import Notification, NotificationTemplate


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("subject", "recipient", "recipient_email", "channel", "status", "tenant", "created_at")
    list_filter = ("channel", "status", "tenant")
    search_fields = ("subject", "recipient__email", "recipient_email")
    readonly_fields = ("id", "created_at", "sent_at", "error_message")


@admin.register(NotificationTemplate)
class NotificationTemplateAdmin(admin.ModelAdmin):
    list_display = ("name", "channel", "tenant", "is_active")
    list_filter = ("channel", "is_active", "tenant")
    search_fields = ("name",)
