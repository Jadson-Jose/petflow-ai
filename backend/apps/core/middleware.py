"""Middleware que identifica o tenant da requisição via header X-Tenant."""
from django.http import JsonResponse

from .context import clear_current_tenant, set_current_tenant


class TenantMiddleware:
    """
    Resolve o tenant da requisição a partir do header 'X-Tenant'.
    Rotas administrativas e de autenticação são isentas.
    """

    EXEMPT_PATHS = (
        "/admin/",
        "/static/",
        "/media/",
        "/api/token/",
        "/api/schema/",
        "/api/docs/",
        "/api/plans/",
    )

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path.startswith(self.EXEMPT_PATHS):
            return self.get_response(request)

        tenant_slug = request.headers.get("X-Tenant")
        if not tenant_slug:
            clear_current_tenant()
            return JsonResponse(
                {"detail": "Header X-Tenant é obrigatório."},
                status=400,
            )

        from apps.tenants.models import Tenant

        try:
            tenant = Tenant.objects.get(slug=tenant_slug, is_active=True)
        except Tenant.DoesNotExist:
            clear_current_tenant()
            return JsonResponse({"detail": "Tenant inválido."}, status=400)

        request.tenant = tenant
        set_current_tenant(tenant)

        try:
            response = self.get_response(request)
        finally:
            clear_current_tenant()

        return response
