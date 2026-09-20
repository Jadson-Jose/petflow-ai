from rest_framework import serializers

from .models import ChurnPrediction, MLModel


class MLModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = MLModel
        fields = (
            "id",
            "name",
            "model_type",
            "file_path",
            "accuracy",
            "status",
            "tenant",
            "created_at",
        )
        read_only_fields = ("id", "tenant", "created_at")


class ChurnPredictionSerializer(serializers.ModelSerializer):
    owner_name = serializers.ReadOnlyField(source="owner.full_name")
    model_name = serializers.ReadOnlyField(source="model.name")

    class Meta:
        model = ChurnPrediction
        fields = (
            "id",
            "owner",
            "owner_name",
            "model",
            "model_name",
            "probability",
            "features_used",
            "tenant",
            "predicted_at",
        )
        read_only_fields = (
            "id",
            "tenant",
            "model",
            "probability",
            "features_used",
            "owner_name",
            "model_name",
            "predicted_at",
        )
