from rest_framework import serializers

from .models import Pet


class PetSerializer(serializers.ModelSerializer):
    owner_name = serializers.ReadOnlyField(source="owner.full_name")

    class Meta:
        model = Pet
        fields = (
            "id",
            "name",
            "species",
            "breed",
            "gender",
            "birth_date",
            "weight",
            "color",
            "microchip",
            "neutered",
            "notes",
            "is_active",
            "owner",
            "owner_name",
            "tenant",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "tenant", "owner_name", "created_at", "updated_at")
