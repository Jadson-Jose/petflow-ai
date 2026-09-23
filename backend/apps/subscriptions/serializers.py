from rest_framework import serializers

from apps.plans.serializers import PlanSerializer

from .models import Subscription


class SubscriptionSerializer(serializers.ModelSerializer):
    plan = PlanSerializer(read_only=True)
    plan_slug = serializers.CharField(source="plan.slug", read_only=True)
    trial_days_remaining = serializers.IntegerField(read_only=True)

    class Meta:
        model = Subscription
        fields = (
            "id",
            "plan",
            "plan_slug",
            "status",
            "trial_start",
            "trial_end",
            "trial_days_remaining",
            "current_period_start",
            "current_period_end",
            "canceled_at",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields
