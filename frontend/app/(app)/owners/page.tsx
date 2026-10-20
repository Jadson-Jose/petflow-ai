"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";

import { Modal } from "@/components/modal";
import { useCreateOwner, useDeleteOwner, useOwners, useUpdateOwner, type OwnerInput } from "@/hooks/use-owners";
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

  const { register, handleSubmit, reset, formState: { errors } } = useForm<OwnerForm>({
    resolver: zodResolver(ownerSchema),
    defaultValues: { status: "active" },
  });

  const openCreate = () => { setEditing(null); reset({ status: "active", email: "", full_name: "" }); setModalOpen(true); };
  const openEdit = (owner: Owner) => {
    setEditing(owner);
    reset({ full_name: owner.full_name, email: owner.email, phone: owner.phone, cpf: owner.cpf, status: owner.status, address: owner.address, city: owner.city, notes: owner.notes });
    setModalOpen(true);
  };

  const onSubmit = (values: OwnerForm) => {
    const payload: OwnerInput = { ...values };
    if (editing) {
      updateMutation.mutate({ ...payload, id: editing.id }, { onSuccess: () => setModalOpen(false) });
    } else {
      createMutation.mutate(payload, { onSuccess: () => setModalOpen(false) });
    }
  };

  const filtered = (data?.results ?? []).filter((o) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return o.full_name.toLowerCase().includes(term) || o.email.toLowerCase().includes(term) || o.phone.includes(term);
  });

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tutores</h1>
          <p className="text-sm text-slate-500 mt-1">{data?.count ?? 0} tutor(es) cadastrado(s)</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={openCreate} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/30 transition-all">
          <Plus className="w-4 h-4" /> Novo Tutor
        </motion.button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome, e-mail ou telefone..." className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all shadow-sm" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500">Nenhum tutor encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Nome</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">E-mail</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Telefone</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Status</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((owner) => (
                  <tr key={owner.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{owner.full_name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{owner.email || "—"}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{owner.phone || "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${owner.status === "active" ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200" : owner.status === "inactive" ? "bg-slate-100 text-slate-700 ring-1 ring-slate-200" : "bg-red-100 text-red-700 ring-1 ring-red-200"}`}>
                        {owner.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => openEdit(owner)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => { if (confirm(`Remover o tutor "${owner.full_name}"?`)) deleteMutation.mutate(owner.id); }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={isModalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar Tutor" : "Novo Tutor"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nome completo *</label>
            <input type="text" {...register("full_name")} className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
            {errors.full_name && <p className="text-xs text-red-500 mt-1">{errors.full_name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">E-mail</label>
              <input type="email" {...register("email")} className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Telefone</label>
              <input type="text" {...register("phone")} className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancelar</button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="px-5 py-2.5 text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-md shadow-emerald-500/20 transition-all">
              {createMutation.isPending || updateMutation.isPending ? "Salvando..." : "Salvar"}
            </motion.button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}