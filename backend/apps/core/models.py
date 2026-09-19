"""Modelo base abstrato para todas as entidades do sistema."""
import uuid

from django.db import models


class BaseModel(models.Model):
    """Base com id UUID e timestamps, reutilizada por todos os modelos."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = ["-created_at"]
