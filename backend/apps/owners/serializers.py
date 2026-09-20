from rest_framework import serializers

from .models import Owner


class OwnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Owner
        fields = (
            "id",
            "full_name",
            "email",
            "phone",
            "cpf",
            "status",
            "address",
            "city",
            "notes",
            "tenant",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "tenant", "created_at", "updated_at")
