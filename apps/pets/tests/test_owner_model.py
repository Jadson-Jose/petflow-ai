import pytest
from apps.pets.models import Owner
from apps.tenants.models import Tenant

@pytest.mark.django_db
def test_create_owner():
    tenant = Tenant.objects.create(
        name="Pet Shop Alpha",
        slug="pet-shop-alpha"
    )
    
    owner = Owner.objects.create(
        tenant=tenant,
        full_name="Jadson Silva",
        email="jadson@email.com",
        phone="11999999999",
        cpf="12345678900",
    )
    
    assert owner.pk is not None
    assert owner.full_name == "Jadson Silva"
    
@pytest.mark.django_db
def test_owner_str():
    tenant = Tenant.objects.create(
        name="Pet Shop Alpha",
        slug="pet-shop-alpha"
    )
    
    
    owner = Owner.objects.create(
        tenant=tenant,
        full_name="Marcia Nina",
        phone="11999999999"
    )
    
    assert str(owner) == "Marcia Nina"