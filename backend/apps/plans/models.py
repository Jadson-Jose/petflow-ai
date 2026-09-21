"""Catálogo de planos do SaaS."""
import uuid

from django.db import models


class Plan(models.Model):
    """Plano comercial (Free, Bronze, Silver, Gold)."""

    PLAN_TYPES = [
        ("FREE", "Free"),
        ("BRONZE", "Bronze"),
        ("SILVER", "Silver"),
        ("GOLD", "Gold"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    slug = models.SlugField(max_length=50, unique=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    plan_type = models.CharField(max_length=20, choices=PLAN_TYPES)

    # Preços
    price_monthly = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    price_yearly = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    # ===== Limites =====
    # 0 = ilimitado (para limites numéricos)
    max_users = models.PositiveIntegerField(default=1)
    max_pets = models.PositiveIntegerField(default=10)
    max_appointments_month = models.PositiveIntegerField(default=20)
    max_products = models.PositiveIntegerField(default=20)
    max_ai_predictions_month = models.PositiveIntegerField(default=0)

    # ===== Features booleanas =====
    has_ai_churn = models.BooleanField(default=False)
    has_ai_forecast = models.BooleanField(default=False)
    has_reports = models.BooleanField(default=False)
    has_api_access = models.BooleanField(default=False)
    has_whatsapp = models.BooleanField(default=False)
    has_custom_domain = models.BooleanField(default=False)

    # ===== Trial =====
    trial_days = models.PositiveIntegerField(default=14)

    # ===== Metadata =====
    order = models.PositiveIntegerField(default=0, help_text="Ordem de exibição")
    is_active = models.BooleanField(default=True)
    is_public = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "plans"
        ordering = ["order", "price_monthly"]

    def __str__(self):
        return f"{self.name} (R$ {self.price_monthly}/mês)"

    @property
    def is_free(self):
        return self.price_monthly == 0

    def has_unlimited(self, field_name: str) -> bool:
        """Verifica se um limite é ilimitado (valor 0)."""
        value = getattr(self, field_name, None)
        return value == 0
