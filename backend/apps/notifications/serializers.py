from rest_framework import serializers

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = (
            "id",
            "recipient",
            "recipient_email",
            "channel",
            "subject",
            "body",
            "html_body",
            "status",
            "error_message",
            "tenant",
            "created_at",
            "sent_at",
        )
        read_only_fields = (
            "id",
            "tenant",
            "status",
            "error_message",
            "created_at",
            "sent_at",
        )
