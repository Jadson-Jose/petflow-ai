import pytest

from django.test import RequestFactory
from apps.tenants.middleware import TenantMiddleware


@pytest.mark.django_db
def test_tenant_is_added_to_request(user):
    request = RequestFactory().get("/")
    request.user = user
    middleware = TenantMiddleware(lambda req: req)
    response = middleware(request)

    assert response.tenant == user.tenant  # type: ignore
