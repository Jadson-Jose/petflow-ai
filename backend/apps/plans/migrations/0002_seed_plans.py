from django.db import migrations


PLANS = [
    {
        "slug": "free",
        "name": "Free",
        "plan_type": "FREE",
        "description": "Comece de graça. Ideal para testar o PetFlow AI.",
        "price_monthly": 0,
        "price_yearly": 0,
        "max_users": 1,
        "max_pets": 10,
        "max_appointments_month": 20,
        "max_products": 20,
        "max_ai_predictions_month": 0,
        "has_ai_churn": False,
        "has_ai_forecast": False,
        "has_reports": False,
        "has_api_access": False,
        "has_whatsapp": False,
        "has_custom_domain": False,
        "trial_days": 0,
        "order": 1,
    },
    {
        "slug": "bronze",
        "name": "Bronze",
        "plan_type": "BRONZE",
        "description": "Para pet shops começando a se digitalizar.",
        "price_monthly": 49,
        "price_yearly": 490,
        "max_users": 3,
        "max_pets": 100,
        "max_appointments_month": 200,
        "max_products": 100,
        "max_ai_predictions_month": 0,
        "has_ai_churn": False,
        "has_ai_forecast": False,
        "has_reports": False,
        "has_api_access": False,
        "has_whatsapp": False,
        "has_custom_domain": False,
        "trial_days": 14,
        "order": 2,
    },
    {
        "slug": "silver",
        "name": "Silver",
        "plan_type": "SILVER",
        "description": "Para negócios em crescimento, com IA para retenção.",
        "price_monthly": 129,
        "price_yearly": 1290,
        "max_users": 10,
        "max_pets": 0,
        "max_appointments_month": 0,
        "max_products": 0,
        "max_ai_predictions_month": 500,
        "has_ai_churn": True,
        "has_ai_forecast": False,
        "has_reports": True,
        "has_api_access": False,
        "has_whatsapp": False,
        "has_custom_domain": False,
        "trial_days": 14,
        "order": 3,
    },
    {
        "slug": "gold",
        "name": "Gold",
        "plan_type": "GOLD",
        "description": "Solução completa para clínicas e redes pet.",
        "price_monthly": 299,
        "price_yearly": 2990,
        "max_users": 0,
        "max_pets": 0,
        "max_appointments_month": 0,
        "max_products": 0,
        "max_ai_predictions_month": 0,
        "has_ai_churn": True,
        "has_ai_forecast": True,
        "has_reports": True,
        "has_api_access": True,
        "has_whatsapp": True,
        "has_custom_domain": True,
        "trial_days": 14,
        "order": 4,
    },
]


def create_plans(apps, schema_editor):
    Plan = apps.get_model("plans", "Plan")
    for data in PLANS:
        Plan.objects.update_or_create(slug=data["slug"], defaults=data)


def delete_plans(apps, schema_editor):
    Plan = apps.get_model("plans", "Plan")
    Plan.objects.filter(slug__in=[p["slug"] for p in PLANS]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("plans", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(create_plans, delete_plans),
    ]
