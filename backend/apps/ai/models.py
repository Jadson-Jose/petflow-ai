"""Modelos de Machine Learning: metadados e predições."""
import uuid

from django.db import models


class MLModel(models.Model):
    """Registro de um modelo de ML treinado (ou mockado)."""

    STATUS_CHOICES = [
        ("active", "Ativo"),
        ("archived", "Arquivado"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(
        "tenants.Tenant",
        on_delete=models.CASCADE,
        related_name="ml_models",
    )
    name = models.CharField(max_length=100)
    model_type = models.CharField(max_length=50)
    file_path = models.CharField(max_length=255, blank=True)
    accuracy = models.FloatField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "ai_ml_models"
        ordering = ["-created_at"]
        unique_together = [("tenant", "name")]

    def __str__(self):
        return f"{self.name} ({self.model_type})"


class ChurnPrediction(models.Model):
    """Probabilidade de churn (abandono) de um tutor."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(
        "tenants.Tenant",
        on_delete=models.CASCADE,
        related_name="churn_predictions",
    )
    owner = models.ForeignKey(
        "owners.Owner",
        on_delete=models.CASCADE,
        related_name="churn_predictions",
    )
    model = models.ForeignKey(
        MLModel,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="predictions",
    )
    probability = models.FloatField()
    features_used = models.JSONField(default=dict, blank=True)
    predicted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "ai_churn_predictions"
        ordering = ["-predicted_at"]
        indexes = [
            models.Index(fields=["tenant", "probability"]),
            models.Index(fields=["tenant", "predicted_at"]),
        ]

    def __str__(self):
        return f"{self.owner.full_name}: {self.probability:.2%}"
