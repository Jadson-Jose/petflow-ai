class TenantMiddleware:
    def __init__(self, get_response) -> None:
        self.get_response = get_response

    def __call__(self, request):
        request.tenant = None
        if request.user.is_authenticated:
            request.tenant = request.user.tenant
        response = self.get_response(request)

        return response
