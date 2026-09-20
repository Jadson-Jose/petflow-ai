"""Tasks assíncronas de notificação (executadas pelo Celery)."""
from datetime import timedelta

from celery import shared_task
from django.template.loader import render_to_string
from django.utils import timezone

from .models import Notification
from .services import send_email_notification


@shared_task
def send_notification_task(notification_id):
    """Envia uma notificação por e-mail de forma assíncrona."""
    send_email_notification(notification_id)


@shared_task
def send_appointment_reminder(appointment_id):
    """Cria e envia um lembrete para um agendamento específico."""
    from apps.appointments.models import Appointment

    try:
        appointment = Appointment.objects.select_related("pet", "owner", "service", "tenant").get(
            id=appointment_id
        )
    except Appointment.DoesNotExist:
        return "Agendamento não encontrado."

    owner = appointment.owner
    recipient = None
    recipient_email = owner.email

    subject = f"Lembrete: {appointment.service.name} para {appointment.pet.name}"
    body = (
        f"Olá {owner.full_name},\n\n"
        f"Seu pet {appointment.pet.name} tem {appointment.service.name} agendado para "
        f"{appointment.start_time.strftime('%d/%m/%Y às %H:%M')}.\n\n"
        "Até logo!"
    )
    html_body = render_to_string(
        "notifications/emails/appointment_reminder.html",
        {
            "owner_name": owner.full_name,
            "pet_name": appointment.pet.name,
            "service_name": appointment.service.name,
            "start_time": appointment.start_time.strftime("%d/%m/%Y às %H:%M"),
        },
    )

    notification = Notification.objects.create(
        tenant=appointment.tenant,
        recipient=recipient,
        recipient_email=recipient_email,
        channel="EMAIL",
        subject=subject,
        body=body,
        html_body=html_body,
    )

    send_notification_task.delay(str(notification.id))
    return f"Notificação criada: {notification.id}"


@shared_task
def send_appointment_reminders():
    """Busca agendamentos que ocorrerão em até 24h e dispara lembretes."""
    from apps.appointments.models import Appointment

    now = timezone.now()
    in_24h = now + timedelta(hours=24)

    appointments = Appointment.objects.filter(
        start_time__gte=now,
        start_time__lte=in_24h,
        status="AGENDADO",
    ).select_related("pet", "owner", "service", "tenant")

    for appointment in appointments:
        send_appointment_reminder.delay(str(appointment.id))

    return f"{appointments.count()} lembretes enfileirados."
