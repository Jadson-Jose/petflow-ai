"""Decorators para bloquear acesso por plano."""
from functools import wraps

from django.http import JsonResponse


def _plan_error(message, code, feature=None):
    return JsonResponse(
        {
            "detail": message,
            "code": code,
            "feature": feature,
            "upgrade_url": "/plans",
        },
        status=403,
    )


def requires_feature(feature_name):
    """
    Bloqueia endpoints que exigem uma feature booleana do plano.
    Ex.: @requires_feature("has_ai_churn")
    """

    def decorator(view_func):
        @wraps(view_func)
        def _wrapped(request, *args, **kwargs):
            plan = getattr(request, "plan", None)
            if plan is None:
                return _plan_error(
                    "Plano não identificado.",
                    "no_plan",
                    feature=feature_name,
                )

            if not getattr(plan, feature_name, False):
                return _plan_error(
                    f"Esta funcionalidade não está disponível no seu plano ({plan.name}).",
                    "feature_not_available",
                    feature=feature_name,
                )

            return view_func(request, *args, **kwargs)

        return _wrapped

    return decorator


def check_limit(limit_field, current_count_callable):
    """
    Bloqueia criação quando um limite numérico é atingido.
    Ex.: @check_limit("max_pets", lambda r: Pet.objects.filter(tenant=r.tenant).count())

    - limit_field: nome do campo no Plan (ex.: "max_pets")
    - current_count_callable: função que retorna o número atual
    """

    def decorator(view_func):
        @wraps(view_func)
        def _wrapped(request, *args, **kwargs):
            plan = getattr(request, "plan", None)
            if plan is None:
                return _plan_error("Plano não identificado.", "no_plan")

            limit = getattr(plan, limit_field, 0)

            # 0 = ilimitado
            if limit == 0:
                return view_func(request, *args, **kwargs)

            current = current_count_callable(request)

            if current >= limit:
                return JsonResponse(
                    {
                        "detail": (
                            f"Você atingiu o limite de {limit} "
                            f"({limit_field.replace('max_', '')}) do plano {plan.name}."
                        ),
                        "code": "limit_reached",
                        "limit_field": limit_field,
                        "current": current,
                        "limit": limit,
                        "upgrade_url": "/plans",
                    },
                    status=403,
                )

            return view_func(request, *args, **kwargs)

        return _wrapped

    return decorator
