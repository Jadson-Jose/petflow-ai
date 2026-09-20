from django.contrib import admin

from .models import ChurnPrediction, MLModel


@admin.register(MLModel)
class MLModelAdmin(admin.ModelAdmin):
    list_display = ("name", "model_type", "accuracy", "status", "tenant", "created_at")
    list_filter = ("status", "model_type", "tenant")
    search_fields = ("name",)


@admin.register(ChurnPrediction)
class ChurnPredictionAdmin(admin.ModelAdmin):
    list_display = ("owner", "probability", "model", "tenant", "predicted_at")
    list_filter = ("tenant", "model")
    search_fields = ("owner__full_name",)
    readonly_fields = ("predicted_at",)
