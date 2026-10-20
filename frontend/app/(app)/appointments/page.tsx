"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Search, CalendarDays, Settings } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAppointments, useDeleteAppointment } from "@/hooks/use-appointments";

const statusLabels: Record<string, string> = { AGENDADO: "Agendado", EM_ANDAMENTO: "Em andamento", CONCLUIDO: "Concluído", CANCELADO: "Cancelado" };
const statusColors: Record<string, string> = {
  AGENDADO: "bg-blue-100 text-blue-700 ring-1 ring-blue-200",
  EM_ANDAMENTO: "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
  CONCLUIDO: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
  CANCELADO: "bg-red-100 text-red-700 ring-1 ring-red-200",
};

export default function AppointmentsPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useAppointments();
  const deleteMutation = useDeleteAppointment();

  const filtered = (data?.results ?? []).filter((a) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return a.pet_name.toLowerCase().includes(term) || a.owner_name.toLowerCase().includes(term) || a.service_name.toLowerCase().includes(term);
  });

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Agendamentos</h1>
          <p className="text-sm text-slate-500 mt-1">{data?.count ?? 0} agendamento(s)</p>
        </div>
        <div className="flex gap-3">
          <Link href="/appointments/services" className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium px-5 py-2.5 rounded-xl shadow-sm transition-all">
            <Settings className="w-4 h-4" /> Serviços
          </Link>
          <Link href="/appointments/new" className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/30 transition-all">
            <Plus className="w-4 h-4" /> Novo Agendamento
          </Link>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por pet, tutor ou serviço..." className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500">Nenhum agendamento encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Pet</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Serviço</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Data/Hora</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Status</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><CalendarDays className="w-4 h-4 text-blue-600" /></div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{appt.pet_name}</p>
                          <p className="text-xs text-slate-500">{appt.owner_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{appt.service_name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{new Date(appt.start_time).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${statusColors[appt.status]}`}>{statusLabels[appt.status]}</span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link href={`/appointments/${appt.id}/edit`} className="inline-block p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Pencil className="w-4 h-4" /></Link>
                      <button onClick={() => { if (confirm(`Remover o agendamento de "${appt.pet_name}"?`)) deleteMutation.mutate(appt.id); }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}