import pytest

from apps.tenants.models import Tenant

@pytest.mark.django_db
def test_create_tenant():
    tenant = Tenant.objects.create(
        name="Pet Shop Central",
        slug="pet-shop-central",
    )
    
    assert tenant.name == "Pet Shop Central"
    assert tenant.slug == "pet-shop-central"
    assert tenant.is_active is True