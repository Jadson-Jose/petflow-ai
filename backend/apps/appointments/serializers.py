from datetime import timedelta

from rest_framework import serializers

from .models import Appointment, Service


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = (
            "id",
            "name",
            "description",
            "duration_minutes",
            "price",
            "is_active",
            "tenant",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "tenant", "created_at", "updated_at")


class AppointmentSerializer(serializers.ModelSerializer):
    pet_name = serializers.ReadOnlyField(source="pet.name")
    owner_name = serializers.ReadOnlyField(source="owner.full_name")
    service_name = serializers.ReadOnlyField(source="service.name")

    class Meta:
        model = Appointment
        fields = (
            "id",
            "pet",
            "pet_name",
            "owner",
            "owner_name",
            "service",
            "service_name",
            "start_time",
            "end_time",
            "status",
            "notes",
            "created_by",
            "tenant",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "tenant",
            "end_time",
            "created_by",
            "pet_name",
            "owner_name",
            "service_name",
            "created_at",
            "updated_at",
        )

    def _duration(self, data):
        """Retorna a duração do serviço como timedelta."""
        if "service" in data:
            service = data["service"]
            return timedelta(minutes=service.duration_minutes)
        service = self.instance.service if self.instance else None
        if service:
            return timedelta(minutes=service.duration_minutes)
        return timedelta(minutes=60)

    def validate(self, data):
        """Valida se há conflito de horário para o mesmo pet."""
        request = self.context.get("request")
        tenant = request.user.tenant if request else None
        pet = data.get("pet")
        start = data.get("start_time")

        if pet and start and tenant:
            duration = self._duration(data)
            conflicting = Appointment.objects.filter(
                tenant=tenant,
                pet=pet,
                start_time__lt=start + duration,
                end_time__gt=start,
            ).exclude(status="CANCELADO")

            if self.instance:
                conflicting = conflicting.exclude(pk=self.instance.pk)

            if conflicting.exists():
                raise serializers.ValidationError(
                    "Já existe um agendamento para este pet nesse horário."
                )

        return data
