"""Modelos de agendamento: Serviço e Agendamento."""
import uuid
from datetime import timedelta

from django.conf import settings
from django.db import models

from apps.core.managers import TenantManager
from apps.core.models import BaseModel


class Service(BaseModel):
    """Tipo de serviço oferecido pelo tenant (ex.: Banho, Tosa, Consulta)."""

    tenant = models.ForeignKey(
        "tenants.Tenant",
        on_delete=models.CASCADE,
        related_name="services",
    )
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    duration_minutes = models.PositiveIntegerField(default=30)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)

    objects = TenantManager()

    class Meta:
        db_table = "appointments_services"
        ordering = ["name"]
        unique_together = [("tenant", "name")]

    def __str__(self):
        return f"{self.name} ({self.duration_minutes}min)"


class Appointment(BaseModel):
    """Agendamento de um serviço para um pet de um tutor."""

    STATUS_CHOICES = [
        ("AGENDADO", "Agendado"),
        ("EM_ANDAMENTO", "Em andamento"),
        ("CONCLUIDO", "Concluído"),
        ("CANCELADO", "Cancelado"),
    ]

    tenant = models.ForeignKey(
        "tenants.Tenant",
        on_delete=models.CASCADE,
        related_name="appointments",
    )
    pet = models.ForeignKey(
        "pets.Pet",
        on_delete=models.CASCADE,
        related_name="appointments",
    )
    owner = models.ForeignKey(
        "owners.Owner",
        on_delete=models.CASCADE,
        related_name="appointments",
    )
    service = models.ForeignKey(
        Service,
        on_delete=models.CASCADE,
        related_name="appointments",
    )
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(
        max_length=15,
        choices=STATUS_CHOICES,
        default="AGENDADO",
    )
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="appointments_created",
    )

    objects = TenantManager()

    class Meta:
        db_table = "appointments"
        ordering = ["-start_time"]
        indexes = [
            models.Index(fields=["tenant", "start_time"]),
            models.Index(fields=["tenant", "status"]),
            models.Index(fields=["tenant", "pet"]),
            models.Index(fields=["tenant", "owner"]),
        ]

    def save(self, *args, **kwargs):
        if not self.end_time and self.service:
            self.end_time = self.start_time + timedelta(minutes=self.service.duration_minutes)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.pet.name} - {self.service.name} em {self.start_time}"
