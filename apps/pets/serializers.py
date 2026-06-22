from rest_framework import serializers

from apps.pets.models import Pet


class PetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pet
        fields = [
            "id",
            "name",
            "species",
            "gender",
            "owner",
        ]
