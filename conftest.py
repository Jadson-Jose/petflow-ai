import pytest

from apps.accounts.models import User
from apps.tenants.models import Tenant


@pytest.fixture
def tenant():
    return Tenant.objects.create(
        name="Alpha",
        slug="alpha",
    )


@pytest.fixture
def user(tenant):
    return User.objects.create_user(
        username="jadson",
        email="jadson@email.com",
        password="123456",
        tenant=tenant,
    )
