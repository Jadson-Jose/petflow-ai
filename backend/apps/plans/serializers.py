from rest_framework import serializers

from .models import Plan


class PlanSerializer(serializers.ModelSerializer):
    is_free = serializers.BooleanField(read_only=True)

    class Meta:
        model = Plan
        fields = (
            "id",
            "slug",
            "name",
            "description",
            "plan_type",
            "price_monthly",
            "price_yearly",
            "max_users",
            "max_pets",
            "max_appointments_month",
            "max_products",
            "max_ai_predictions_month",
            "has_ai_churn",
            "has_ai_forecast",
            "has_reports",
            "has_api_access",
            "has_whatsapp",
            "has_custom_domain",
            "trial_days",
            "order",
            "is_active",
            "is_public",
            "is_free",
        )
        read_only_fields = fields
