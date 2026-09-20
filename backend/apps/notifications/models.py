"""Modelos de notificação: registro e templates."""
import uuid

from django.conf import settings
from django.db import models


class Notification(models.Model):
    """Registro de uma notificação enviada (ou em fila)."""

    CHANNEL_CHOICES = [
        ("EMAIL", "E-mail"),
        ("WHATSAPP", "WhatsApp"),
        ("SYSTEM", "Sistema"),
    ]
    STATUS_CHOICES = [
        ("PENDING", "Pendente"),
        ("SENT", "Enviado"),
        ("FAILED", "Falhou"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(
        "tenants.Tenant",
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="notifications",
    )
    recipient_email = models.EmailField(null=True, blank=True)
    channel = models.CharField(max_length=10, choices=CHANNEL_CHOICES, default="EMAIL")
    subject = models.CharField(max_length=255)
    body = models.TextField()
    html_body = models.TextField(blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="PENDING")
    error_message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    sent_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "notifications"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["tenant", "status"]),
            models.Index(fields=["tenant", "created_at"]),
        ]

    def __str__(self):
        target = self.recipient.email if self.recipient else self.recipient_email
        return f"{target} - {self.subject}"


class NotificationTemplate(models.Model):
    """Template reutilizável de notificação."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(
        "tenants.Tenant",
        on_delete=models.CASCADE,
        related_name="notification_templates",
    )
    name = models.CharField(max_length=100)
    channel = models.CharField(max_length=10, choices=Notification.CHANNEL_CHOICES)
    subject_template = models.CharField(max_length=255)
    body_template = models.TextField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "notification_templates"
        ordering = ["name"]
        unique_together = [("tenant", "name")]

    def render(self, context):
        """Renderiza o template com variáveis de contexto."""
        from django.template import Context, Template

        subject = Template(self.subject_template).render(Context(context))
        body = Template(self.body_template).render(Context(context))
        return subject, body

    def __str__(self):
        return f"{self.name} ({self.tenant.slug})"
