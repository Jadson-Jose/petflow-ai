"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Modal } from "@/components/modal";
import {
  useCreateOwner,
  useDeleteOwner,
  useOwners,
  useUpdateOwner,
  type OwnerInput,
} from "@/hooks/use-owners";
import type { Owner } from "@/types/api";

const ownerSchema = z.object({
  full_name: z.string().min(2, "Nome muito curto"),
  email: z.string().email("E-mail inválido").or(z.literal("")),
  phone: z.string().optional().default(""),
  cpf: z.string().optional().default(""),
  status: z.enum(["active", "inactive", "blocked"]).default("active"),
  address: z.string().optional().default(""),
  city: z.string().optional().default(""),
  notes: z.string().optional().default(""),
});

type OwnerForm = z.infer<typeof ownerSchema>;

export default function OwnersPage() {
  const [search, setSearch] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Owner | null>(null);

  const { data, isLoading } = useOwners();
  const createMutation = useCreateOwner();
  const updateMutation = useUpdateOwner();
  const deleteMutation = useDeleteOwner();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OwnerForm>({
    resolver: zodResolver(ownerSchema),
    defaultValues: { status: "active" },
  });

  const openCreate = () => {
    setEditing(null);
    reset({ status: "active", email: "", full_name: "" });
    setModalOpen(true);
  };

  const openEdit = (owner: Owner) => {
    setEditing(owner);
    reset({
      full_name: owner.full_name,
      email: owner.email,
      phone: owner.phone,
      cpf: owner.cpf,
      status: owner.status,
      address: owner.address,
      city: owner.city,
      notes: owner.notes,
    });
    setModalOpen(true);
  };

  const onSubmit = (values: OwnerForm) => {
    const payload: OwnerInput = { ...values };
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

  const filtered = (data?.results ?? []).filter((owner) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      owner.full_name.toLowerCase().includes(term) ||
      owner.email.toLowerCase().includes(term) ||
      owner.phone.includes(term)
    );
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tutores</h1>
          <p className="text-sm text-gray-500">
            {data?.count ?? 0} tutor(es) cadastrado(s)
          </p>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          Novo Tutor
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, e-mail ou telefone..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {data?.results?.length === 0
              ? "Nenhum tutor cadastrado ainda."
              : "Nenhum resultado para esta busca."}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-600 uppercase px-5 py-3">
                  Nome
                </th>
                <th className="text-left text-xs font-semibold text-gray-600 uppercase px-5 py-3">
                  E-mail
                </th>
                <th className="text-left text-xs font-semibold text-gray-600 uppercase px-5 py-3">
                  Telefone
                </th>
                <th className="text-left text-xs font-semibold text-gray-600 uppercase px-5 py-3">
                  Status
                </th>
                <th className="text-right text-xs font-semibold text-gray-600 uppercase px-5 py-3">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((owner) => (
                <tr
                  key={owner.id}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition"
                >
                  <td className="px-5 py-3 text-sm font-medium text-gray-900">
                    {owner.full_name}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">
                    {owner.email || "—"}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">
                    {owner.phone || "—"}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        owner.status === "active"
                          ? "bg-green-100 text-green-700"
                          : owner.status === "inactive"
                            ? "bg-gray-100 text-gray-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {owner.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right space-x-1">
                    <button
                      onClick={() => openEdit(owner)}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (
                          confirm(`Remover o tutor "${owner.full_name}"?`)
                        ) {
                          deleteMutation.mutate(owner.id);
                        }
                      }}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Remover"
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
        title={editing ? "Editar Tutor" : "Novo Tutor"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome completo *
            </label>
            <input
              type="text"
              {...register("full_name")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
            {errors.full_name && (
              <p className="text-xs text-red-500 mt-1">
                {errors.full_name.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-mail
              </label>
              <input
                type="email"
                {...register("email")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone
              </label>
              <input
                type="text"
                {...register("phone")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CPF
              </label>
              <input
                type="text"
                {...register("cpf")}
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
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
                <option value="blocked">Bloqueado</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Endereço
              </label>
              <input
                type="text"
                {...register("address")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cidade
              </label>
              <input
                type="text"
                {...register("city")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
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
