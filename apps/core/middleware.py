from threading import local


_thread_locals = local()


def get_current_tenant():
    return getattr(_thread_locals, "tenant", None)

class TenantMiddleware:
    def __init__(self, get_response) -> None:
        self.get_response = get_response
    
    def __call__(self, request):
        # EXEMPLO simples depois melhora com JWT
        tenant_id = request.headers.get("X-Tenant-ID")
        
        _thread_locals.tenant = tenant_id
        
        response = self.get_response(request)
        return response
    