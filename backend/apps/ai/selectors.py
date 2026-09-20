"""Extrai features dos tutores para uso em modelos de ML."""
from django.utils import timezone


def get_tutor_features(tenant_id, owner_id=None):
    """
    Retorna features para churn prediction.
    Se owner_id for None, retorna para todos os tutores do tenant.
    """
    from apps.appointments.models import Appointment
    from apps.owners.models import Owner

    queryset = Owner.objects.filter(tenant_id=tenant_id)
    if owner_id:
        queryset = queryset.filter(id=owner_id)

    features_list = []
    for owner in queryset:
        appointments = Appointment.objects.filter(tenant_id=tenant_id, owner=owner)
        total = appointments.count()

        if total == 0:
            recency = 999
            frequency = 0
            cancel_rate = 0.0
            avg_interval = 0.0
        else:
            last = appointments.order_by("-start_time").first()
            recency = (timezone.now() - last.start_time).days
            frequency = total
            canceled = appointments.filter(status="CANCELADO").count()
            cancel_rate = canceled / total

            dates = list(
                appointments.order_by("start_time").values_list("start_time", flat=True)
            )
            intervals = []
            prev = None
            for d in dates:
                if prev:
                    intervals.append((d - prev).days)
                prev = d
            avg_interval = sum(intervals) / len(intervals) if intervals else 0.0

        features = {
            "owner_id": str(owner.id),
            "owner_name": owner.full_name,
            "recency": recency,
            "frequency": frequency,
            "cancel_rate": round(cancel_rate, 4),
            "avg_interval": round(avg_interval, 4),
        }
        features_list.append(features)

    return features_list
