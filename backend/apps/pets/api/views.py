from rest_framework import permissions, status, viewsets
from rest_framework.response import Response

from ..models import Pet
from ..serializers import PetSerializer


class PetViewSet(viewsets.ModelViewSet):
    """CRUD de pets, isolado por tenant. Respeita limite do plano."""

    serializer_class = PetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Pet.objects.filter(
            tenant=self.request.user.tenant
        ).select_related("owner")

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)

    def create(self, request, *args, **kwargs):
        """Verifica limite do plano antes de criar."""
        plan = getattr(request, "plan", None)
        if plan and plan.max_pets > 0:
            current = Pet.objects.filter(tenant=request.user.tenant).count()
            if current >= plan.max_pets:
                return Response(
                    {
                        "detail": (
                            f"Você atingiu o limite de {plan.max_pets} pets "
                            f"do plano {plan.name}."
                        ),
                        "code": "limit_reached",
                        "limit_field": "max_pets",
                        "current": current,
                        "limit": plan.max_pets,
                        "upgrade_url": "/plans",
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )
        return super().create(request, *args, **kwargs)
