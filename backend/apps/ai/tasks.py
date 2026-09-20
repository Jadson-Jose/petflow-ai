"""Tasks Celery de IA."""
from celery import shared_task

from .selectors import get_tutor_features
from .services import predict_churn, train_churn_model


@shared_task
def train_churn_model_task(tenant_id):
    """Treina o modelo de churn (mock)."""
    model = train_churn_model(tenant_id)
    if model:
        return f"Modelo {model.name} treinado com acurácia {model.accuracy}"
    return "Não foi possível treinar o modelo."


@shared_task
def predict_churn_task(tenant_id, owner_id):
    """Gera predição de churn para um tutor específico."""
    prediction = predict_churn(tenant_id, owner_id)
    if prediction:
        return f"Probabilidade de churn: {prediction.probability:.2%}"
    return "Predição falhou."


@shared_task
def check_churn_risk():
    """
    Verifica tutores com alto risco de churn em todos os tenants ativos.
    Cria notificações para os donos do tenant.
    """
    from apps.notifications.models import Notification
    from apps.tenants.models import Tenant

    alerts_created = 0
    for tenant in Tenant.objects.filter(is_active=True):
        features = get_tutor_features(tenant.id)
        high_risk = [f for f in features if f["recency"] > 60 or f["frequency"] == 0]

        if not high_risk:
            continue

        recipient = tenant.users.filter(is_staff=True).first()
        if not recipient:
            continue

        Notification.objects.create(
            tenant=tenant,
            recipient=recipient,
            channel="EMAIL",
            subject=f"⚠️ {len(high_risk)} clientes em risco de churn",
            body=(
                f"Identificamos {len(high_risk)} tutores com sinais de abandono.\n"
                "Considere ações de retenção (descontos, lembretes, campanhas)."
            ),
        )
        alerts_created += 1

    return f"{alerts_created} alertas de churn criados."
