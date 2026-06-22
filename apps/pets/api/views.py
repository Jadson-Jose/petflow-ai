from rest_framework.views import APIView, Response

from apps.pets.models import Pet
from apps.pets.serializers import PetSerializer


class PetListAPIView(APIView):
    """Lista o tenant atual."""

    def get(self, request):
        queryset = (
            Pet.objects.filter(tenant=request.tenant)
            .select_related("owner")
            .order_by("name")
        )

        serializer = PetSerializer(queryset, many=True)
        return Response(serializer.data)
