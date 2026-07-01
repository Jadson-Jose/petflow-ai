from apps.pets.models import Pet


def create_pet(**data):
    return Pet.objects.create(**data)


def list_pets(tenant):
    return Pet.objects.filter(tenant=tenant).select_related("owner").order_by("name")


def search_pets(tenant, query):
    return (
        Pet.objects.filter(
            tenant=tenant,
            name__icontains=query,
        )
        .select_related("owner")
        .order_by("name")
    )
