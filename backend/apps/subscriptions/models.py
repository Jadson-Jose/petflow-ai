"""Assinatura de cada tenant a um plano."""
import uuid

from django.db import models
from django.utils import timezone


class Subscription(models.Model):
    """Assinatura do tenant. Cada tenant tem uma assinatura ativa."""

    STATUS_CHOICES = [
        ("TRIAL", "Trial"),
        ("ACTIVE", "Ativa"),
        ("PAST_DUE", "Pagamento atrasado"),
        ("CANCELED", "Cancelada"),
        ("EXPIRED", "Expirada"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.OneToOneField(
        "tenants.Tenant",
        on_delete=models.CASCADE,
        related_name="subscription",
    )
    plan = models.ForeignKey(
        "plans.Plan",
        on_delete=models.PROTECT,
        related_name="subscriptions",
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="ACTIVE")

    # Período de trial
    trial_start = models.DateTimeField(null=True, blank=True)
    trial_end = models.DateTimeField(null=True, blank=True)

    # Período pago (mensal/anual)
    current_period_start = models.DateTimeField(default=timezone.now)
    current_period_end = models.DateTimeField(null=True, blank=True)

    canceled_at = models.DateTimeField(null=True, blank=True)

    # Billing (futuro: Stripe, Pagar.me)
    external_customer_id = models.CharField(max_length=100, blank=True)
    external_subscription_id = models.CharField(max_length=100, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "subscriptions"

    def __str__(self):
        return f"{self.tenant.name} — {self.plan.name} ({self.status})"

    @property
    def is_trial(self):
        return self.status == "TRIAL"

    @property
    def is_active_or_trial(self):
        return self.status in ("TRIAL", "ACTIVE")

    @property
    def trial_days_remaining(self):
        if self.status != "TRIAL" or not self.trial_end:
            return 0
        delta = self.trial_end - timezone.now()
        return max(delta.days, 0)

    @property
    def is_trial_expired(self):
        if self.status != "TRIAL" or not self.trial_end:
            return False
        return timezone.now() > self.trial_end
