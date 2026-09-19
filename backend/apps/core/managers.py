"""Managers customizados para isolamento multi-tenant."""
from django.db import models

from .context import get_current_tenant


class TenantManager(models.Manager):
    """Filtra automaticamente pelo tenant atual, quando houver."""

    def get_queryset(self):
        queryset = super().get_queryset()
        tenant = get_current_tenant()
        if tenant is not None:
            queryset = queryset.filter(tenant=tenant)
        return queryset
