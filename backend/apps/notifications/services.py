"""Serviços de envio de notificações."""
import logging

from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone

from .models import Notification

logger = logging.getLogger(__name__)


def send_email_notification(notification_id):
    """Envia uma notificação por e-mail, atualizando seu status."""
    try:
        notification = Notification.objects.get(id=notification_id)
    except Notification.DoesNotExist:
        logger.error("Notificação %s não encontrada.", notification_id)
        return

    try:
        recipient_email = (
            notification.recipient.email
            if notification.recipient
            else notification.recipient_email
        )
        if not recipient_email:
            raise ValueError("Destinatário não definido.")

        if settings.EMAIL_HOST_USER:
            send_mail(
                subject=notification.subject,
                message=notification.body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient_email],
                html_message=notification.html_body or None,
                fail_silently=False,
            )
            logger.info("E-mail enviado para %s", recipient_email)
        else:
            logger.info(
                "[EMAIL MOCK] Para: %s\nAssunto: %s\nCorpo: %s",
                recipient_email,
                notification.subject,
                notification.body,
            )

        notification.status = "SENT"
        notification.sent_at = timezone.now()
        notification.save()

    except Exception as exc:
        notification.status = "FAILED"
        notification.error_message = str(exc)
        notification.save()
        logger.exception("Erro ao enviar notificação")
        raise
