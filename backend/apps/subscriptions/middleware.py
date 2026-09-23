"""Middleware que injeta o plano e a assinatura do tenant na requisição."""
import logging

from django.http import JsonResponse

logger = logging.getLogger(__name__)


class SubscriptionMiddleware:
    """
    Após o TenantMiddleware resolver o tenant, este middleware injeta:
    - request.subscription
    - request.plan

    Se não houver assinatura, o tenant é bloqueado (exceto rotas isentas).
    """

    EXEMPT_PATHS = (
        "/admin/",
        "/static/",
        "/media/",
        "/api/token/",
        "/api/schema/",
        "/api/docs/",
        "/api/auth/",       # permite ver o próprio usuário
        "/api/plans/",      # permite listar planos
        "/api/subscriptions/me/",  # permite ver a própria assinatura
        "/api/subscriptions/plans/",  # permite listar planos
    )

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Ignora rotas isentas
        if request.path.startswith(self.EXEMPT_PATHS):
            return self.get_response(request)

        # Só age se o TenantMiddleware já resolveu o tenant
        tenant = getattr(request, "tenant", None)
        if tenant is None:
            return self.get_response(request)

        from .models import Subscription

        try:
            subscription = Subscription.objects.select_related("plan").get(
                tenant=tenant
            )
        except Subscription.DoesNotExist:
            return JsonResponse(
                {
                    "detail": "Nenhuma assinatura ativa encontrada para este tenant.",
                    "code": "no_subscription",
                    "upgrade_url": "/plans",
                },
                status=402,
            )

        # Verifica se está expirada
        if subscription.status == "TRIAL" and subscription.is_trial_expired:
            return JsonResponse(
                {
                    "detail": "Seu período de trial expirou. Faça upgrade para continuar.",
                    "code": "trial_expired",
                    "upgrade_url": "/plans",
                },
                status=402,
            )

        if subscription.status not in ("TRIAL", "ACTIVE"):
            return JsonResponse(
                {
                    "detail": "Sua assinatura não está ativa.",
                    "code": "subscription_inactive",
                    "upgrade_url": "/plans",
                },
                status=402,
            )

        request.subscription = subscription
        request.plan = subscription.plan

        return self.get_response(request)
