from django.db import models

from apps.core.managers import TenantManager
from apps.core.models import BaseModel


def pet_photo_path(instance, filename):
    return f"tenants/{instance.tenant_id}/pets/{instance.id}/{filename}"


class SpeciesChoices(models.TextChoices):
    DOG = "DOG", "Dog"
    CAT = "CAT", "Cat"
    BIRD = "BIRD", "Bird"
    OTHER = "OTHER", "Other"


class GenderChoices(models.TextChoices):
    MALE = "MALE", "Male"
    FEMALE = "FEMALE", "Female"


class Owner(BaseModel):
    full_name = models.CharField(max_length=255)

    email = models.EmailField(
        blank=True,
        default="",
    )

    phone = models.CharField(
        max_length=20,
    )

    cpf = models.CharField(
        max_length=14,
        blank=True,
        default="",
    )

    objects = TenantManager()

    class Meta:
        db_table = "owners"
        ordering = ["full_name"]

        indexes = [
            models.Index(fields=["tenant"]),
            models.Index(fields=["tenant", "full_name"]),
            models.Index(fields=["tenant", "email"]),
            models.Index(fields=["tenant", "cpf"]),
            models.Index(fields=["tenant", "phone"]),
        ]

        constraints = [
            models.UniqueConstraint(
                fields=["tenant", "cpf"],
                condition=~models.Q(cpf=""),
                name="unique_owner_cpf_tenant",
            ),
            models.UniqueConstraint(
                fields=["tenant", "email"],
                condition=~models.Q(email=""),
                name="unique_owner_email_tenant",
            ),
        ]

    def __str__(self):
        return self.full_name


class Pet(BaseModel):
    name = models.CharField(max_length=255)

    species = models.CharField(
        max_length=20,
        choices=SpeciesChoices.choices,
    )

    breed = models.CharField(
        max_length=255,
        blank=True,
    )

    gender = models.CharField(
        max_length=20,
        choices=GenderChoices.choices,
    )

    birth_date = models.DateField(
        null=True,
        blank=True,
    )

    weight = models.DecimalField(
        max_digits=6,
        decimal_places=3,
        null=True,
        blank=True,
    )

    color = models.CharField(
        max_length=100,
        blank=True,
    )

    photo = models.ImageField(
        upload_to=pet_photo_path,
        null=True,
        blank=True,
    )

    is_active = models.BooleanField(
        default=True,
    )

    microchip = models.CharField(
        max_length=100,
        blank=True,
        default="",
    )

    neutered = models.BooleanField(
        null=True,
        blank=True,
    )

    notes = models.TextField(
        blank=True,
    )

    owner = models.ForeignKey(
        "pets.Owner",
        on_delete=models.PROTECT,
        related_name="pets",
    )

    objects = TenantManager()

    class Meta:
        db_table = "pets"
        ordering = ["name"]

        indexes = [
            models.Index(fields=["owner"]),
            models.Index(fields=["tenant", "name"]),
            models.Index(fields=["tenant", "species"]),
            models.Index(fields=["is_active"]),
            models.Index(fields=["tenant", "owner"]),
            models.Index(fields=["tenant", "microchip"]),
        ]

        constraints = [
            models.UniqueConstraint(
                fields=["tenant", "microchip"],
                condition=~models.Q(microchip=""),
                name="unique_pet_microchip_tenant",
            )
        ]

    def __str__(self):
        return self.name
