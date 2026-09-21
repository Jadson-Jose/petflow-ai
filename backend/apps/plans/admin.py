from django.contrib import admin

from .models import Plan


@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "plan_type",
        "price_monthly",
        "price_yearly",
        "max_users",
        "max_pets",
        "has_ai_churn",
        "is_active",
        "order",
    )
    list_filter = ("plan_type", "is_active", "is_public", "has_ai_churn")
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    ordering = ("order", "price_monthly")

    fieldsets = (
        ("Identificação", {"fields": ("slug", "name", "description", "plan_type")}),
        ("Preços", {"fields": ("price_monthly", "price_yearly")}),
        (
            "Limites (0 = ilimitado)",
            {
                "fields": (
                    "max_users",
                    "max_pets",
                    "max_appointments_month",
                    "max_products",
                    "max_ai_predictions_month",
                )
            },
        ),
        (
            "Funcionalidades",
            {
                "fields": (
                    "has_ai_churn",
                    "has_ai_forecast",
                    "has_reports",
                    "has_api_access",
                    "has_whatsapp",
                    "has_custom_domain",
                )
            },
        ),
        ("Trial e exibição", {"fields": ("trial_days", "order", "is_active", "is_public")}),
    )
