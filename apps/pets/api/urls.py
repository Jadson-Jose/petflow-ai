from django.urls import path

from .views import PetListAPIView

urlpatterns = [
    path(
        "pets/",
        PetListAPIView.as_view(),
        name="pet-list",
    )
]
