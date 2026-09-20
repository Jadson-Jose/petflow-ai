"use client";

import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  CalendarDays,
  Settings,
} from "lucide-react";
import Link from "next/link";

import {
  useAppointments,
  useDeleteAppointment,
} from "@/hooks/use-appointments";

const statusLabels: Record<string, string> = {
  AGENDADO: "Agendado",
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
};

const statusColors: Record<string, string> = {
  AGENDADO: "bg-blue-100 text-blue-700",
  EM_ANDAMENTO: "bg-yellow-100 text-yellow-700",
  CONCLUIDO: "bg-green-100 text-green-700",
  CANCELADO: "bg-red-100 text-red-700",
};

export default function AppointmentsPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useAppointments();
  const deleteMutation = useDeleteAppointment();

  const filtered = (data?.results ?? []).filter((appt) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      appt.pet_name.toLowerCase().includes(term) ||
      appt.owner_name.toLowerCase().includes(term) ||
      appt.service_name.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agendamentos</h1>
          <p className="text-sm text-gray-500">
            {data?.count ?? 0} agendamento(s)
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/appointments/services"
            className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-medium px-4 py-2 rounded-lg transition"
          >
            <Settings className="w-4 h-4" />
            Serviços
          </Link>
          <Link
            href="/appointments/new"
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition"
          >
            <Plus className="w-4 h-4" />
            Novo Agendamento
          </Link>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por pet, tutor ou serviço..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {data?.results?.length === 0
              ? "Nenhum agendamento ainda."
              : "Nenhum resultado para esta busca."}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-600 uppercase px-5 py-3">
                  Pet
                </th>
                <th className="text-left text-xs font-semibold text-gray-600 uppercase px-5 py-3">
                  Serviço
                </th>
                <th className="text-left text-xs font-semibold text-gray-600 uppercase px-5 py-3">
                  Data/Hora
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
              {filtered.map((appt) => (
                <tr
                  key={appt.id}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                        <CalendarDays className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {appt.pet_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {appt.owner_name}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">
                    {appt.service_name}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">
                    {new Date(appt.start_time).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        statusColors[appt.status]
                      }`}
                    >
                      {statusLabels[appt.status]}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right space-x-1">
                    <Link
                      href={`/appointments/${appt.id}/edit`}
                      className="inline-block p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            `Remover o agendamento de "${appt.pet_name}"?`
                          )
                        ) {
                          deleteMutation.mutate(appt.id);
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
    </div>
  );
}
