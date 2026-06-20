from apps.pets.models import Pet


def create_pet(**data):
    return Pet.objects.create(**data)


def _base_queryset(tenant):
    return Pet.objects.filter(tenant=tenant)


def list_pets(tenant):
    return _base_queryset(tenant).select_related("owner").order_by("name")


def search_pets(tenant, query):
    return (
        _base_queryset(tenant)
        .filter(name__icontains=query)
        .select_related("owner")
        .order_by("name")
    )
