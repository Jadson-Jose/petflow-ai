"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Modal } from "@/components/modal";
import {
  useServices,
  useCreateService,
  useUpdateService,
  useDeleteService,
  type ServiceInput,
} from "@/hooks/use-services";
import type { Service } from "@/types/api";

const schema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional().default(""),
  duration_minutes: z.coerce.number().int().min(5, "Mínimo 5 minutos"),
  price: z.string().min(1, "Preço é obrigatório"),
  is_active: z.boolean().optional().default(true),
});

type FormData = z.infer<typeof schema>;

export default function ServicesPage() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);

  const { data, isLoading } = useServices();
  const createMutation = useCreateService();
  const updateMutation = useUpdateService();
  const deleteMutation = useDeleteService();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { duration_minutes: 30, is_active: true },
  });

  const openCreate = () => {
    setEditing(null);
    reset({
      name: "",
      description: "",
      duration_minutes: 30,
      price: "0.00",
      is_active: true,
    });
    setModalOpen(true);
  };

  const openEdit = (service: Service) => {
    setEditing(service);
    reset({
      name: service.name,
      description: service.description,
      duration_minutes: service.duration_minutes,
      price: service.price,
      is_active: service.is_active,
    });
    setModalOpen(true);
  };

  const onSubmit = (values: FormData) => {
    const payload: ServiceInput = values;
    if (editing) {
      updateMutation.mutate(
        { ...payload, id: editing.id },
        { onSuccess: () => setModalOpen(false) }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => setModalOpen(false),
      });
    }
  };

  return (
    <div className="space-y-5">
      <Link
        href="/appointments"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para Agendamentos
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Serviços</h1>
          <p className="text-sm text-gray-500">
            {data?.count ?? 0} serviço(s) cadastrado(s)
          </p>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          Novo Serviço
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Carregando...</div>
        ) : (data?.results ?? []).length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Nenhum serviço cadastrado ainda.
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-600 uppercase px-5 py-3">
                  Nome
                </th>
                <th className="text-left text-xs font-semibold text-gray-600 uppercase px-5 py-3">
                  Duração
                </th>
                <th className="text-left text-xs font-semibold text-gray-600 uppercase px-5 py-3">
                  Preço
                </th>
                <th className="text-right text-xs font-semibold text-gray-600 uppercase px-5 py-3">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {(data?.results ?? []).map((service) => (
                <tr
                  key={service.id}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition"
                >
                  <td className="px-5 py-3 text-sm font-medium text-gray-900">
                    {service.name}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">
                    {service.duration_minutes} min
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">
                    R$ {service.price}
                  </td>
                  <td className="px-5 py-3 text-right space-x-1">
                    <button
                      onClick={() => openEdit(service)}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remover o serviço "${service.name}"?`)) {
                          deleteMutation.mutate(service.id);
                        }
                      }}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        open={isModalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Editar Serviço" : "Novo Serviço"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome *
            </label>
            <input
              type="text"
              {...register("name")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duração (min) *
              </label>
              <input
                type="number"
                {...register("duration_minutes")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
              {errors.duration_minutes && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.duration_minutes.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preço (R$) *
              </label>
              <input
                type="text"
                {...register("price")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
              {errors.price && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.price.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              rows={3}
              {...register("description")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition"
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Salvando..."
                : "Salvar"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
