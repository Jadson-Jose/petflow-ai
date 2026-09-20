"""Modelo de Pet — animal de estimação vinculado a um tutor."""
from django.db import models

from apps.core.managers import TenantManager
from apps.core.models import BaseModel


class SpeciesChoices(models.TextChoices):
    DOG = "DOG", "Cão"
    CAT = "CAT", "Gato"
    BIRD = "BIRD", "Ave"
    OTHER = "OTHER", "Outro"


class GenderChoices(models.TextChoices):
    MALE = "MALE", "Macho"
    FEMALE = "FEMALE", "Fêmea"


class Pet(BaseModel):
    """Representa um pet (cão, gato, etc.) de um tutor."""

    tenant = models.ForeignKey(
        "tenants.Tenant",
        on_delete=models.CASCADE,
        related_name="pets",
    )
    owner = models.ForeignKey(
        "owners.Owner",
        on_delete=models.PROTECT,
        related_name="pets",
    )
    name = models.CharField(max_length=255)
    species = models.CharField(
        max_length=20,
        choices=SpeciesChoices.choices,
    )
    breed = models.CharField(max_length=255, blank=True)
    gender = models.CharField(
        max_length=20,
        choices=GenderChoices.choices,
    )
    birth_date = models.DateField(null=True, blank=True)
    weight = models.DecimalField(
        max_digits=6,
        decimal_places=3,
        null=True,
        blank=True,
    )
    color = models.CharField(max_length=100, blank=True)
    microchip = models.CharField(max_length=100, blank=True, default="")
    neutered = models.BooleanField(null=True, blank=True)
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    objects = TenantManager()

    class Meta:
        db_table = "pets"
        ordering = ["name"]
        indexes = [
            models.Index(fields=["tenant", "name"]),
            models.Index(fields=["tenant", "species"]),
            models.Index(fields=["tenant", "owner"]),
            models.Index(fields=["tenant", "is_active"]),
        ]

    def __str__(self):
        return f"{self.name} ({self.get_species_display()})"
