from rest_framework import serializers

from apps.accounts.models import User


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "username",
            "role",
        ]

    def get_tenant(self, obj):
        if not obj.tenant:
            return None
        return {
            "id": str(obj.tanant.id),
            "name": str(obj.tanant.name),
            "slug": str(obj.tanant.slug),
        }


class MeSerializer(serializers.ModelSerializer):
    tenant = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "username",
            "role",
            "tenant",
        ]

    def get_tenant(self, obj):
        if obj.tenant is None:
            return None

        return {
            "id": str(obj.tenant.id),
            "name": obj.tenant.name,
            "slug": obj.tenant.slug,
        }
