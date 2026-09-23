from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("admin/", admin.site.urls),

    # Autenticação JWT
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # API
    path("api/auth/", include("apps.accounts.api.urls")),
    path("api/", include("apps.owners.api.urls")),
    path("api/", include("apps.pets.api.urls")),
    path("api/inventory/", include("apps.inventory.api.urls")),
    path("api/", include("apps.appointments.api.urls")),
    path("api/", include("apps.notifications.api.urls")),
    path("api/ai/", include("apps.ai.api.urls")),
    path("api/", include("apps.plans.api.urls")),
    path("api/", include("apps.subscriptions.api.urls")),

    # Documentação
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
]