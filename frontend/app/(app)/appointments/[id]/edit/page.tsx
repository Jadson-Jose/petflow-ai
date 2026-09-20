"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import api from "@/lib/api";
import {
  useUpdateAppointment,
} from "@/hooks/use-appointments";
import { usePets } from "@/hooks/use-pets";
import { useServices } from "@/hooks/use-services";
import type { Appointment } from "@/types/api";

const schema = z.object({
  owner: z.string().uuid("Selecione um tutor"),
  pet: z.string().uuid("Selecione um pet"),
  service: z.string().uuid("Selecione um serviço"),
  start_time: z.string().min(1, "Informe a data e hora"),
  status: z.enum(["AGENDADO", "EM_ANDAMENTO", "CONCLUIDO", "CANCELADO"]),
  notes: z.string().optional().default(""),
});

type FormData = z.infer<typeof schema>;

export default function EditAppointmentPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: petsData } = usePets();
  const { data: servicesData } = useServices();
  const updateMutation = useUpdateAppointment();

  const { data: appointment, isLoading } = useQuery({
    queryKey: ["appointment", id],
    queryFn: async () => {
      const { data } = await api.get<Appointment>(`/appointments/${id}/`);
      return data;
    },
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (appointment) {
      reset({
        owner: appointment.owner,
        pet: appointment.pet,
        service: appointment.service,
        start_time: appointment.start_time.slice(0, 16),
        status: appointment.status,
        notes: appointment.notes,
      });
    }
  }, [appointment, reset]);

  const onSubmit = (values: FormData) => {
    updateMutation.mutate(
      { ...values, id },
      { onSuccess: () => router.push("/appointments") }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <Link
        href="/appointments"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Editar Agendamento
        </h1>
        <p className="text-sm text-gray-500">
          Atualize os dados do agendamento
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pet *
          </label>
          <Controller
            name="pet"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
              >
                <option value="">Selecione um pet...</option>
                {(petsData?.results ?? []).map((pet) => (
                  <option key={pet.id} value={pet.id}>
                    {pet.name} — {pet.owner_name}
                  </option>
                ))}
              </select>
            )}
          />
        </div>

        <input type="hidden" {...register("owner")} />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Serviço *
          </label>
          <Controller
            name="service"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
              >
                <option value="">Selecione um serviço...</option>
                {(servicesData?.results ?? []).map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} — {service.duration_minutes}min
                  </option>
                ))}
              </select>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data e hora *
            </label>
            <input
              type="datetime-local"
              {...register("start_time")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              {...register("status")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
            >
              <option value="AGENDADO">Agendado</option>
              <option value="EM_ANDAMENTO">Em andamento</option>
              <option value="CONCLUIDO">Concluído</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Observações
          </label>
          <textarea
            rows={3}
            {...register("notes")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link
            href="/appointments"
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition"
          >
            {updateMutation.isPending ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}
