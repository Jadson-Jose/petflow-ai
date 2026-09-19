import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.local")

app = Celery("petflow")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f"Request: {self.request!r}")


app.conf.beat_schedule = {
    "enviar-lembretes-agendamento": {
        "task": "apps.notifications.tasks.send_appointment_reminders",
        "schedule": crontab(minute=0),
    },
    "verificar-estoque-baixo": {
        "task": "apps.inventory.tasks.check_low_stock",
        "schedule": crontab(hour=7, minute=0),
    },
    "verificar-churn": {
        "task": "apps.ai.tasks.check_churn_risk",
        "schedule": crontab(hour=8, minute=0),
    },
}
