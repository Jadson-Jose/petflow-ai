from django.apps import AppConfig

class OwnerConfig(AppConfig):
    dafault_auto_field = "django.db.BigAutoField"
    name = "apps.owners"
    label = "owners"
    