"use client";

import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { useCreateAppointment } from "@/hooks/use-appointments";
import { usePets } from "@/hooks/use-pets";
import { useServices } from "@/hooks/use-services";

const schema = z.object({
  owner: z.string().uuid("Selecione um tutor"),
  pet: z.string().uuid("Selecione um pet"),
  service: z.string().uuid("Selecione um serviço"),
  start_time: z.string().min(1, "Informe a data e hora"),
  status: z.enum(["AGENDADO", "EM_ANDAMENTO", "CONCLUIDO", "CANCELADO"]),
  notes: z.string().optional().default(""),
});

type FormData = z.infer<typeof schema>;

export default function NewAppointmentPage() {
  const router = useRouter();
  const { data: petsData } = usePets();
  const { data: servicesData } = useServices();
  const createMutation = useCreateAppointment();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: "AGENDADO", notes: "" },
  });

  const selectedPetId = watch("pet");
  const pets = petsData?.results ?? [];

  // Quando o usuário escolhe um pet, preenche o tutor automaticamente
  const handlePetChange = (petId: string) => {
    setValue("pet", petId);
    const pet = pets.find((p) => p.id === petId);
    if (pet) setValue("owner", pet.owner);
  };

  const onSubmit = (values: FormData) => {
    createMutation.mutate(values, {
      onSuccess: () => router.push("/appointments"),
    });
  };

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
        <h1 className="text-2xl font-bold text-gray-900">Novo Agendamento</h1>
        <p className="text-sm text-gray-500">
          Agende um serviço para um pet
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
                onChange={(e) => handlePetChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
              >
                <option value="">Selecione um pet...</option>
                {pets.map((pet) => (
                  <option key={pet.id} value={pet.id}>
                    {pet.name} — {pet.owner_name}
                  </option>
                ))}
              </select>
            )}
          />
          {errors.pet && (
            <p className="text-xs text-red-500 mt-1">{errors.pet.message}</p>
          )}
        </div>

        {/* Campo oculto para o owner (preenchido automaticamente) */}
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
                    {service.name} — {service.duration_minutes}min — R${" "}
                    {service.price}
                  </option>
                ))}
              </select>
            )}
          />
          {errors.service && (
            <p className="text-xs text-red-500 mt-1">
              {errors.service.message}
            </p>
          )}
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
            {errors.start_time && (
              <p className="text-xs text-red-500 mt-1">
                {errors.start_time.message}
              </p>
            )}
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
            disabled={createMutation.isPending}
            className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition"
          >
            {createMutation.isPending ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}
