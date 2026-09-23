"""Regras de negócio de assinaturas."""
from datetime import timedelta

from django.utils import timezone
from rest_framework.exceptions import ValidationError

from apps.plans.models import Plan

from .models import Subscription


def get_or_create_subscription(tenant):
    """Garante que o tenant tenha uma assinatura (padrão: Free)."""
    try:
        return tenant.subscription
    except Subscription.DoesNotExist:
        free_plan = Plan.objects.filter(plan_type="FREE", is_active=True).first()
        if not free_plan:
            raise ValidationError("Nenhum plano Free configurado no sistema.")
        return Subscription.objects.create(
            tenant=tenant,
            plan=free_plan,
            status="ACTIVE",
        )


def start_trial(tenant, plan_slug):
    """
    Inicia um trial no plano escolhido.
    Regras: só pode iniciar trial uma vez por tenant.
    """
    plan = Plan.objects.filter(slug=plan_slug, is_active=True).first()
    if not plan:
        raise ValidationError("Plano não encontrado.")

    if plan.is_free:
        raise ValidationError("Não é possível iniciar trial no plano Free.")

    subscription = get_or_create_subscription(tenant)

    # Só permite trial se nunca teve antes
    if subscription.trial_start is not None:
        raise ValidationError("Você já utilizou seu período de trial.")

    if subscription.status == "ACTIVE" and not subscription.plan.is_free:
        raise ValidationError("Você já possui um plano ativo.")

    now = timezone.now()
    subscription.plan = plan
    subscription.status = "TRIAL"
    subscription.trial_start = now
    subscription.trial_end = now + timedelta(days=plan.trial_days)
    subscription.current_period_start = now
    subscription.current_period_end = subscription.trial_end
    subscription.save()

    return subscription


def upgrade_plan(tenant, plan_slug):
    """Troca o plano da assinatura (sem gateway de pagamento por enquanto)."""
    plan = Plan.objects.filter(slug=plan_slug, is_active=True).first()
    if not plan:
        raise ValidationError("Plano não encontrado.")

    subscription = get_or_create_subscription(tenant)
    now = timezone.now()

    subscription.plan = plan
    subscription.status = "ACTIVE"
    subscription.current_period_start = now
    subscription.current_period_end = now + timedelta(days=30)
    subscription.save()

    return subscription


def cancel_subscription(tenant):
    """Cancela a assinatura e rebaixa para Free."""
    subscription = get_or_create_subscription(tenant)
    free_plan = Plan.objects.filter(plan_type="FREE", is_active=True).first()
    if not free_plan:
        raise ValidationError("Nenhum plano Free configurado.")

    subscription.plan = free_plan
    subscription.status = "ACTIVE"  # volta ao Free, permanece ativa
    subscription.canceled_at = timezone.now()
    subscription.save()

    return subscription
