from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from ..serializers import SubscriptionSerializer
from ..services import (
    cancel_subscription,
    get_or_create_subscription,
    start_trial,
    upgrade_plan,
)


class SubscriptionViewSet(viewsets.GenericViewSet):
    """Endpoints de assinatura do tenant atual."""

    serializer_class = SubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def _get_tenant(self, request):
        tenant = getattr(request, "tenant", None) or request.user.tenant
        if not tenant:
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied("Usuário sem tenant associado.")
        return tenant

    @action(detail=False, methods=["get"], url_path="me")
    def me(self, request):
        """Retorna a assinatura atual do tenant."""
        tenant = self._get_tenant(request)
        subscription = get_or_create_subscription(tenant)
        serializer = self.get_serializer(subscription)
        return Response(serializer.data)

    @action(detail=False, methods=["post"], url_path="start-trial")
    def start_trial_action(self, request):
        """Inicia o trial em um plano (ex.: silver, gold)."""
        tenant = self._get_tenant(request)
        plan_slug = request.data.get("plan_slug")
        if not plan_slug:
            return Response(
                {"detail": "plan_slug é obrigatório."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        subscription = start_trial(tenant, plan_slug)
        return Response(self.get_serializer(subscription).data)

    @action(detail=False, methods=["post"], url_path="upgrade")
    def upgrade_action(self, request):
        """Faz upgrade para um plano pago."""
        tenant = self._get_tenant(request)
        plan_slug = request.data.get("plan_slug")
        if not plan_slug:
            return Response(
                {"detail": "plan_slug é obrigatório."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        subscription = upgrade_plan(tenant, plan_slug)
        return Response(self.get_serializer(subscription).data)

    @action(detail=False, methods=["post"], url_path="cancel")
    def cancel_action(self, request):
        """Cancela a assinatura e volta ao Free."""
        tenant = self._get_tenant(request)
        subscription = cancel_subscription(tenant)
        return Response(self.get_serializer(subscription).data)
