import factory

from apps.pets.models import Owner, Pet
from apps.tenants.models import Tenant


class TenantFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Tenant

    name = factory.Sequence(lambda n: f"Tenant {n}")  # type: ignore
    slug = factory.Sequence(lambda n: f"Tenant {n}")  # type: ignore


class OwnerFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Owner

    tenant = factory.SubFactory(TenantFactory)  # type: ignore
    full_name = factory.Sequence(  # type: ignore
        lambda n: f"Owner {n}"
    )
    email = factory.Sequence(  # type: ignore
        lambda n: f"owner{n}@email.com"
    )
    phone = factory.Sequence(  # type: ignore
        lambda n: f"11999999999{n:03d}"
    )


class PetFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Pet

    tenant = factory.SubFactory(TenantFactory)  # type: ignore
    owner = factory.SubFactory(  # type: ignore
        OwnerFactory,
        tenant=factory.SelfAttribute("..tenant"),  # type: ignore
    )
    name = factory.Sequence(  # type: ignore
        lambda n: f"Pet {n}"
    )
    species = "DOG"
    gender = "MALE"
