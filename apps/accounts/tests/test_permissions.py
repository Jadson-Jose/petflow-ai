import pytest
from rest_framework.test import APIRequestFactory

from apps.accounts.models import User
from apps.accounts.permissions import IsOwner
from apps.tenants.models import Tenant


@pytest.mark.django_db
def test_owner_has_permission():
    tenant = Tenant.objects.create(
        name="PetShop Alpha",
        slug="alpha",
    )

    user = User.objects.create_user(
        email="owner@alpha.com",
        username="owner",
        password="123456",
        tenant=tenant,
        role="owner",
    )

    factory = APIRequestFactory()
    request = factory.get("/")
    request.user = user

    permission = IsOwner()

    assert permission.has_permission(request, None)


@pytest.mark.django_db
def test_staff_has_permission():
    tenant = Tenant.objects.create(
        name="PetShop Alpha",
        slug="alpha",
    )

    user = User.objects.create_user(
        email="staff@alpha.com",
        username="staff",
        password="123456",
        tenant=tenant,
        role="staff",
    )

    factory = APIRequestFactory()
    request = factory.get("/")
    request.user = user

    from apps.accounts.permissions import IsStaff

    permission = IsStaff()

    assert permission.has_permission(request, None)
