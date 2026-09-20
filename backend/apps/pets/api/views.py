from rest_framework import permissions, viewsets

from ..models import Pet
from ..serializers import PetSerializer


class PetViewSet(viewsets.ModelViewSet):
    """CRUD de pets, isolado por tenant."""

    serializer_class = PetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Pet.objects.filter(tenant=self.request.user.tenant).select_related("owner")

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)
