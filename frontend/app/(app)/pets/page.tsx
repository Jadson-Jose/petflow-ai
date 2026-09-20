"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Search, PawPrint } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Modal } from "@/components/modal";
import { useOwners } from "@/hooks/use-owners";
import {
  useCreatePet,
  useDeletePet,
  usePets,
  useUpdatePet,
  type PetInput,
} from "@/hooks/use-pets";
import type { Pet } from "@/types/api";

const petSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  species: z.enum(["DOG", "CAT", "BIRD", "OTHER"]),
  gender: z.enum(["MALE", "FEMALE"]),
  owner: z.string().uuid("Selecione um tutor"),
  breed: z.string().optional().default(""),
  birth_date: z.string().optional().nullable().default(""),
  weight: z.string().optional().nullable().default(""),
  color: z.string().optional().default(""),
  microchip: z.string().optional().default(""),
  notes: z.string().optional().default(""),
  is_active: z.boolean().optional().default(true),
});

type PetForm = z.infer<typeof petSchema>;

const speciesLabels: Record<string, string> = {
  DOG: "Cão",
  CAT: "Gato",
  BIRD: "Ave",
  OTHER: "Outro",
};

const genderLabels: Record<string, string> = {
  MALE: "Macho",
  FEMALE: "Fêmea",
};

export default function PetsPage() {
  const [search, setSearch] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Pet | null>(null);

  const { data, isLoading } = usePets();
  const { data: ownersData } = useOwners();
  const createMutation = useCreatePet();
  const updateMutation = useUpdatePet();
  const deleteMutation = useDeletePet();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<PetForm>({
    resolver: zodResolver(petSchema),
    defaultValues: {
      species: "DOG",
      gender: "MALE",
      is_active: true,
    },
  });

  const openCreate = () => {
    setEditing(null);
    reset({
      name: "",
      species: "DOG",
      gender: "MALE",
      owner: "",
      breed: "",
      birth_date: "",
      weight: "",
      color: "",
      microchip: "",
      notes: "",
      is_active: true,
    });
    setModalOpen(true);
  };

  const openEdit = (pet: Pet) => {
    setEditing(pet);
    reset({
      name: pet.name,
      species: pet.species,
      gender: pet.gender,
      owner: pet.owner,
      breed: pet.breed,
      birth_date: pet.birth_date ?? "",
      weight: pet.weight ?? "",
      color: pet.color,
      microchip: pet.microchip,
      notes: pet.notes,
      is_active: pet.is_active,
    });
    setModalOpen(true);
  };

  const onSubmit = (values: PetForm) => {
    const payload: PetInput = {
      ...values,
      birth_date: values.birth_date || null,
      weight: values.weight || null,
    };

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

  const filtered = (data?.results ?? []).filter((pet) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      pet.name.toLowerCase().includes(term) ||
      pet.owner_name.toLowerCase().includes(term) ||
      pet.breed.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pets</h1>
          <p className="text-sm text-gray-500">
            {data?.count ?? 0} pet(s) cadastrado(s)
          </p>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          Novo Pet
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, tutor ou raça..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {data?.results?.length === 0
              ? "Nenhum pet cadastrado ainda."
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
                  Espécie
                </th>
                <th className="text-left text-xs font-semibold text-gray-600 uppercase px-5 py-3">
                  Raça
                </th>
                <th className="text-left text-xs font-semibold text-gray-600 uppercase px-5 py-3">
                  Tutor
                </th>
                <th className="text-right text-xs font-semibold text-gray-600 uppercase px-5 py-3">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((pet) => (
                <tr
                  key={pet.id}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition"
                >
                  <td className="px-5 py-3 text-sm font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                        <PawPrint className="w-4 h-4 text-green-600" />
                      </div>
                      {pet.name}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">
                    {speciesLabels[pet.species] ?? pet.species}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">
                    {pet.breed || "—"}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">
                    {pet.owner_name}
                  </td>
                  <td className="px-5 py-3 text-right space-x-1">
                    <button
                      onClick={() => openEdit(pet)}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remover o pet "${pet.name}"?`)) {
                          deleteMutation.mutate(pet.id);
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
        title={editing ? "Editar Pet" : "Novo Pet"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do pet *
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tutor *
            </label>
            <Controller
              name="owner"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
                >
                  <option value="">Selecione um tutor...</option>
                  {(ownersData?.results ?? []).map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.full_name}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.owner && (
              <p className="text-xs text-red-500 mt-1">{errors.owner.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Espécie *
              </label>
              <select
                {...register("species")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
              >
                <option value="DOG">Cão</option>
                <option value="CAT">Gato</option>
                <option value="BIRD">Ave</option>
                <option value="OTHER">Outro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sexo *
              </label>
              <select
                {...register("gender")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
              >
                <option value="MALE">Macho</option>
                <option value="FEMALE">Fêmea</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Raça
              </label>
              <input
                type="text"
                {...register("breed")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cor
              </label>
              <input
                type="text"
                {...register("color")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de nascimento
              </label>
              <input
                type="date"
                {...register("birth_date")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Peso (kg)
              </label>
              <input
                type="number"
                step="0.001"
                {...register("weight")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Microchip
            </label>
            <input
              type="text"
              {...register("microchip")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
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
