from apps.pets.models import Owner


def create_owner(**data):
    return Owner.objects.create(**data)
