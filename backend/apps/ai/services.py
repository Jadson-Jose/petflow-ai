"""Serviços de IA (mock — prontos para plugar modelo real no futuro)."""
import logging

from .models import ChurnPrediction, MLModel
from .selectors import get_tutor_features

logger = logging.getLogger(__name__)


def train_churn_model(tenant_id):
    """
    Treina um modelo de churn (mock).
    No futuro, plugar scikit-learn aqui.
    """
    features = get_tutor_features(tenant_id)
    if not features:
        logger.warning("Sem dados para treinar modelo de churn.")
        return None

    version = f"churn_v{MLModel.objects.filter(tenant_id=tenant_id, model_type='logistic_regression').count() + 1}"

    ml_model, _ = MLModel.objects.update_or_create(
        tenant_id=tenant_id,
        name=version,
        defaults={
            "model_type": "logistic_regression",
            "file_path": f"mock://{tenant_id}/{version}",
            "accuracy": 0.85,
            "status": "active",
        },
    )
    logger.info("Modelo mock %s criado para tenant %s", version, tenant_id)
    return ml_model


def predict_churn(tenant_id, owner_id):
    """
    Gera uma predição de churn (mock).
    Retorna um objeto ChurnPrediction com probabilidade fixa.
    """
    features = get_tutor_features(tenant_id, owner_id=owner_id)
    if not features:
        logger.warning("Tutor não encontrado ou sem features.")
        return None

    feature = features[0]

    # Mock: heurística simples
    probability = 0.1  # base
    if feature["recency"] > 60:
        probability += 0.4
    if feature["cancel_rate"] > 0.3:
        probability += 0.3
    if feature["frequency"] == 0:
        probability = 0.9
    probability = min(probability, 1.0)

    model = MLModel.objects.filter(tenant_id=tenant_id, status="active").first()
    if not model:
        model = train_churn_model(tenant_id)

    prediction = ChurnPrediction.objects.create(
        tenant_id=tenant_id,
        owner_id=owner_id,
        model=model,
        probability=round(probability, 4),
        features_used=feature,
    )
    logger.info("Predição de churn para %s: %.2f%%", feature["owner_name"], probability * 100)
    return prediction
