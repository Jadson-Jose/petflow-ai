from django.contrib.auth import authenticate, login
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.api.serializers import (
    LoginSerializer,
    MeSerializer,
    UserSerializer,
)


class LoginAPIView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = authenticate(
            email=serializer.validated_data["email"],  # type: ignore
            password=serializer.validated_data["password"],  # type: ignore
        )

        if not user:
            return Response(
                {"detail": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        login(request, user)

        return Response(UserSerializer(user).data)


class MeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = MeSerializer(request.user)

        return Response(serializer.data)
