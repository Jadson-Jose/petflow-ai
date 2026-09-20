"""Modelo de Tutor (Owner) — cliente do pet shop."""
from django.db import models

from apps.core.managers import TenantManager
from apps.core.models import BaseModel


class Owner(BaseModel):
    """Representa o tutor de um ou mais pets."""

    STATUS_CHOICES = [
        ("active", "Ativo"),
        ("inactive", "Inativo"),
        ("blocked", "Bloqueado"),
    ]

    tenant = models.ForeignKey(
        "tenants.Tenant",
        on_delete=models.CASCADE,
        related_name="owners",
    )
    full_name = models.CharField(max_length=255)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    cpf = models.CharField(max_length=14, blank=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="active",
    )
    address = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)

    objects = TenantManager()

    class Meta:
        db_table = "owners"
        ordering = ["full_name"]
        indexes = [
            models.Index(fields=["tenant", "full_name"]),
            models.Index(fields=["tenant", "email"]),
            models.Index(fields=["tenant", "status"]),
        ]

    def __str__(self):
        return self.full_name
