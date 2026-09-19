from rest_framework import permissions, viewsets
from rest_framework.response import Response

from ..serializers import UserSerializer


class MeViewSet(viewsets.GenericViewSet):
    """Retorna os dados do usuário autenticado."""

    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
