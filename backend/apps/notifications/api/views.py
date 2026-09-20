from rest_framework import permissions, viewsets

from ..models import Notification
from ..serializers import NotificationSerializer


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """Lista as notificações do tenant do usuário autenticado."""

    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(tenant=self.request.user.tenant)
