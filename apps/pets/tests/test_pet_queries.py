import pytest

from apps.pets.models import (
    GenderChoices,
    Owner,
    Pet,
    SpeciesChoices,
)
from apps.pets.services import list_pets
from apps.tenants.models import Tenant


@pytest.mark.django_db
def test_list_pets_by_tenant():
    tenant = Tenant.objects.create(
        name="Pet Shop Alpha",
        slug="pet-shop-alpha",
    )
    owner = Owner.objects.create(
        tenant=tenant,
        full_name="Jadson",
        phone="11999999999",
    )
    Pet.objects.create(
        tenant=tenant,
        owner=owner,
        name="Amora",
        species=SpeciesChoices.DOG,
        gender=GenderChoices.FEMALE,
    )
    Pet.objects.create(
        tenant=tenant,
        owner=owner,
        name="Paçoca",
        species=SpeciesChoices.DOG,
        gender=GenderChoices.MALE,
    )
    pets = list_pets(tenant)

    assert len(pets) == 2
