from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.subscriptions.decorators import requires_feature

from ..models import ChurnPrediction, MLModel
from ..serializers import ChurnPredictionSerializer, MLModelSerializer
from ..tasks import predict_churn_task


class MLModelViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = MLModelSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return MLModel.objects.filter(tenant=self.request.user.tenant)


class ChurnPredictionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ChurnPredictionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ChurnPrediction.objects.filter(
            tenant=self.request.user.tenant
        ).select_related("owner", "model")

    @action(
        detail=False,
        methods=["post"],
        url_path="predict",
        url_name="predict",
    )
    def predict(self, request):
        """Dispara uma predição de churn (requer plano Silver+)."""
        # Enforcement manual (mais simples que decorator em ViewSet)
        plan = getattr(request, "plan", None)
        if plan is None or not plan.has_ai_churn:
            plan_name = plan.name if plan else "desconhecido"
            return Response(
                {
                    "detail": (
                        f"A funcionalidade de IA não está disponível "
                        f"no plano {plan_name}."
                    ),
                    "code": "feature_not_available",
                    "feature": "has_ai_churn",
                    "upgrade_url": "/plans",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        owner_id = request.data.get("owner_id")
        if not owner_id:
            return Response(
                {"error": "owner_id é obrigatório."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        task = predict_churn_task.delay(
            str(request.user.tenant.id), str(owner_id)
        )
        return Response(
            {"task_id": task.id, "status": "Predição iniciada."},
            status=status.HTTP_202_ACCEPTED,
        )
