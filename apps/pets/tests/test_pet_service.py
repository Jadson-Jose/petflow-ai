import pytest

from apps.pets.models import (
    GenderChoices,
    Owner,
    Pet,
    SpeciesChoices,
)
from apps.pets.services import create_pet, list_pets, search_pets
from apps.tenants.models import Tenant


@pytest.mark.django_db
def test_create_pet_service():
    tenant = Tenant.objects.create(
        name="Pet Shop Alpha",
        slug="alpha",
    )

    owner = Owner.objects.create(
        tenant=tenant,
        full_name="Jadson Silva",
        phone="11999999999",
    )

    pet = create_pet(
        tenant=tenant,
        owner=owner,
        name="Amora",
        species=SpeciesChoices.DOG,
        gender=GenderChoices.FEMALE,
    )

    assert isinstance(pet, Pet)
    assert pet.name == "Amora"
    assert pet.owner == owner
    assert pet.tenant == tenant


@pytest.mark.django_db
def test_create_pet_with_duplicate_microchip():
    tenant = Tenant.objects.create(
        name="Pet Shop Alpha",
        slug="alpha",
    )

    owner = Owner.objects.create(
        tenant=tenant,
        full_name="Jadson Silva",
        phone="11999999999",
    )

    create_pet(
        tenant=tenant,
        owner=owner,
        name="Amora",
        species=SpeciesChoices.DOG,
        gender=GenderChoices.FEMALE,
        microchip="123456",
    )

    with pytest.raises(Exception):
        create_pet(
            tenant=tenant,
            owner=owner,
            name="Thor",
            species=SpeciesChoices.DOG,
            gender=GenderChoices.MALE,
            microchip="123456",
        )


@pytest.mark.django_db
def test_create_pet_returns_pet_instance():
    tenant = Tenant.objects.create(
        name="Pet Shop",
        slug="pet-shop",
    )

    owner = Owner.objects.create(
        tenant=tenant,
        full_name="Jadson",
        phone="11999999999",
    )

    pet = create_pet(
        tenant=tenant,
        owner=owner,
        name="Amora",
        species=SpeciesChoices.DOG,
        gender=GenderChoices.FEMALE,
    )

    assert isinstance(pet, Pet)


@pytest.mark.django_db
def test_list_pets_by_tenant():
    tenant = Tenant.objects.create(
        name="Pet Shop Alpha",
        slug="alpha",
    )

    owner = Owner.objects.create(
        tenant=tenant,
        full_name="Jadson",
        phone="111111111",
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
        name="Thor",
        species=SpeciesChoices.DOG,
        gender=GenderChoices.MALE,
    )

    pets = list_pets(tenant)

    assert len(pets) == 2


@pytest.mark.django_db
def test_list_pets_returns_only_current_tenant():
    tenant1 = Tenant.objects.create(
        name="Alpha",
        slug="alpha",
    )

    tenant2 = Tenant.objects.create(
        name="Beta",
        slug="beta",
    )

    owner1 = Owner.objects.create(
        tenant=tenant1,
        full_name="Jadson",
        phone="111",
    )

    owner2 = Owner.objects.create(
        tenant=tenant2,
        full_name="Maria",
        phone="222",
    )

    Pet.objects.create(
        tenant=tenant1,
        owner=owner1,
        name="Amora",
        species=SpeciesChoices.DOG,
        gender=GenderChoices.FEMALE,
    )

    Pet.objects.create(
        tenant=tenant2,
        owner=owner2,
        name="Thor",
        species=SpeciesChoices.DOG,
        gender=GenderChoices.MALE,
    )

    pets = list_pets(tenant1)

    assert len(pets) == 1
    assert pets.first().name == "Amora"  # type: ignore

    def test_list_pets_is_ordered_by_name():
        tenant = Tenant.objects.create(
            name="Alpha",
            slug="alpha",
        )
        owner = Owner.objects.create(
            tenant=tenant,
            full_name="Jadson",
            phone="111",
        )
        Pet.objects.create(
            tenant=tenant,
            owner=owner,
            name="Paçoca",
            species=SpeciesChoices.DOG,
            gender=GenderChoices.MALE,
        )
        Pet.objects.create(
            tenant=tenant,
            owner=owner,
            name="Amora",
            species=SpeciesChoices.DOG,
            gender=GenderChoices.FEMALE,
        )
        pets = list_pets(tenant)

        assert pets[0].name == "Amora"
        assert pets[1].name == "Paçoca"


@pytest.mark.django_db
def test_search_pets_by_name():
    tenant = Tenant.objects.create(
        name="Alpha",
        slug="alpha",
    )
    owner = Owner.objects.create(
        tenant=tenant,
        full_name="Jadson",
        phone="111",
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
    pets = search_pets(tenant, "amo")

    assert len(pets) == 1
    assert pets[0].name == "Amora"
