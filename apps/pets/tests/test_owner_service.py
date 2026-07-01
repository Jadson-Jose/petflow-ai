import pytest

from apps.pets.models import Owner
from apps.pets.services import create_owner
from apps.tenants.models import Tenant


@pytest.mark.django_db
def test_create_owner():
    tenant = Tenant.objects.create(
        name="PetShop Alpha",
        slug="alpha",
    )

    owner = create_owner(
        tenant=tenant,
        full_name="Jadson Silva",
        email="jadson@email.com",
        phone="11999999999",
        cpf="12345678900",
    )

    assert isinstance(owner, Owner)
    assert owner.full_name == "Jadson Silva"
    assert owner.tenant == tenant
