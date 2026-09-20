from rest_framework import permissions, viewsets

from ..models import Owner
from ..serializers import OwnerSerializer


class OwnerViewSet(viewsets.ModelViewSet):
    """CRUD de tutores, isolado por tenant."""

    serializer_class = OwnerSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Owner.objects.filter(tenant=self.request.user.tenant)

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)
