"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Search, PawPrint } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";

import { Modal } from "@/components/modal";
import { useOwners } from "@/hooks/use-owners";
import { useCreatePet, useDeletePet, usePets, useUpdatePet, type PetInput } from "@/hooks/use-pets";
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

const speciesLabels: Record<string, string> = { DOG: "Cão", CAT: "Gato", BIRD: "Ave", OTHER: "Outro" };

export default function PetsPage() {
  const [search, setSearch] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Pet | null>(null);

  const { data, isLoading } = usePets();
  const { data: ownersData } = useOwners();
  const createMutation = useCreatePet();
  const updateMutation = useUpdatePet();
  const deleteMutation = useDeletePet();

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<PetForm>({
    resolver: zodResolver(petSchema),
    defaultValues: { species: "DOG", gender: "MALE", is_active: true },
  });

  const openCreate = () => {
    setEditing(null);
    reset({ name: "", species: "DOG", gender: "MALE", owner: "", breed: "", birth_date: "", weight: "", color: "", microchip: "", notes: "", is_active: true });
    setModalOpen(true);
  };

  const openEdit = (pet: Pet) => {
    setEditing(pet);
    reset({ name: pet.name, species: pet.species, gender: pet.gender, owner: pet.owner, breed: pet.breed, birth_date: pet.birth_date ?? "", weight: pet.weight ?? "", color: pet.color, microchip: pet.microchip, notes: pet.notes, is_active: pet.is_active });
    setModalOpen(true);
  };

  const onSubmit = (values: PetForm) => {
    const payload: PetInput = { ...values, birth_date: values.birth_date || null, weight: values.weight || null };
    if (editing) updateMutation.mutate({ ...payload, id: editing.id }, { onSuccess: () => setModalOpen(false) });
    else createMutation.mutate(payload, { onSuccess: () => setModalOpen(false) });
  };

  const filtered = (data?.results ?? []).filter((p) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return p.name.toLowerCase().includes(term) || p.owner_name.toLowerCase().includes(term) || p.breed.toLowerCase().includes(term);
  });

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pets</h1>
          <p className="text-sm text-slate-500 mt-1">{data?.count ?? 0} pet(s) cadastrado(s)</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={openCreate} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/30 transition-all">
          <Plus className="w-4 h-4" /> Novo Pet
        </motion.button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome, tutor ou raça..." className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500">Nenhum pet encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Nome</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Espécie</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Raça</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Tutor</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((pet) => (
                  <tr key={pet.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center"><PawPrint className="w-4 h-4 text-emerald-600" /></div>
                        {pet.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{speciesLabels[pet.species] ?? pet.species}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{pet.breed || "—"}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{pet.owner_name}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => openEdit(pet)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => { if (confirm(`Remover o pet "${pet.name}"?`)) deleteMutation.mutate(pet.id); }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={isModalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar Pet" : "Novo Pet"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nome do pet *</label>
            <input type="text" {...register("name")} className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Tutor *</label>
            <Controller name="owner" control={control} render={({ field }) => (
              <select {...field} className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                <option value="">Selecione um tutor...</option>
                {(ownersData?.results ?? []).map((o) => <option key={o.id} value={o.id}>{o.full_name}</option>)}
              </select>
            )} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Espécie *</label>
              <select {...register("species")} className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                <option value="DOG">Cão</option><option value="CAT">Gato</option><option value="BIRD">Ave</option><option value="OTHER">Outro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Sexo *</label>
              <select {...register("gender")} className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                <option value="MALE">Macho</option><option value="FEMALE">Fêmea</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl">Cancelar</button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="px-5 py-2.5 text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-md">Salvar</motion.button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}