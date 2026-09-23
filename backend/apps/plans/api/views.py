from rest_framework import permissions, viewsets

from ..models import Plan
from ..serializers import PlanSerializer


class PlanViewSet(viewsets.ReadOnlyModelViewSet):
    """Listagem de planos disponíveis (público)."""

    serializer_class = PlanSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "slug"

    def get_queryset(self):
        return Plan.objects.filter(is_active=True, is_public=True)
