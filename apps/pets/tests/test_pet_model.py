import pytest
from django.db import IntegrityError

from apps.pets.models import (
    GenderChoices,
    Owner,
    Pet,
    SpeciesChoices,
)
from apps.tenants.models import Tenant


def create_owner():
    tenant = Tenant.objects.create(
        name="Pet Shop Alpha",
        slug="pet-shop-alpha",
    )
    owner = Owner.objects.create(
        tenant=tenant,
        full_name="Jadson Silva",
        phone="11999999999",
    )
    return tenant, owner


@pytest.mark.django_db
def test_create_pet():

    tenant, owner = create_owner()

    pet = Pet.objects.create(
        tenant=tenant,
        owner=owner,
        name="Amora",
        species=SpeciesChoices.DOG,
        gender=GenderChoices.FEMALE,
    )

    assert pet.pk is not None
    assert pet.name == "Amora"


@pytest.mark.django_db
def test_duplicate_microchip_not_allowed_in_same_tenant():

    tenant, owner = create_owner()

    Pet.objects.create(
        tenant=tenant,
        owner=owner,
        name="Thor",
        species=SpeciesChoices.DOG,
        gender=GenderChoices.FEMALE,
        microchip="123456",
    )

    with pytest.raises(IntegrityError):
        Pet.objects.create(
            tenant=tenant,
            owner=owner,
            name="Rex",
            species=SpeciesChoices.DOG,
            gender=GenderChoices.MALE,
            microchip="123456",
        )


@pytest.mark.django_db
def test_pet_str():

    tenant, owner = create_owner()

    pet = Pet.objects.create(
        tenant=tenant,
        owner=owner,
        name="Amora",
        species=SpeciesChoices.DOG,
        gender=GenderChoices.FEMALE,
    )

    assert str(pet) == "Amora"


@pytest.mark.django_db
def test_same_microchip_allowed_in_different_tenants():
    tenant1 = Tenant.objects.create(
        name="Pet Shop Alpha",
        slug="alpha",
    )

    tenant2 = Tenant.objects.create(
        name="Pet Shop Beta",
        slug="beta",
    )

    owner1 = Owner.objects.create(
        tenant=tenant1,
        full_name="Jadson",
        phone="111111111",
    )

    owner2 = Owner.objects.create(
        tenant=tenant2,
        full_name="Maria",
        phone="222222222",
    )

    Pet.objects.create(
        tenant=tenant1,
        owner=owner1,
        name="Amora",
        species=SpeciesChoices.DOG,
        gender=GenderChoices.FEMALE,
        microchip="ABC123",
    )

    pet = Pet.objects.create(
        tenant=tenant2,
        owner=owner2,
        name="Thor",
        species=SpeciesChoices.DOG,
        gender=GenderChoices.MALE,
        microchip="ABC123",
    )

    assert pet.pk is not None
