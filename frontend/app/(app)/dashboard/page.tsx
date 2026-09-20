"use client";

import { useQuery } from "@tanstack/react-query";
import { Users, PawPrint, CalendarDays, Package } from "lucide-react";

import api from "@/lib/api";

interface Paginated<T> {
  count: number;
  results: T[];
}

async function fetchCount(url: string): Promise<number> {
  const { data } = await api.get<Paginated<unknown>>(url);
  return data.count ?? (Array.isArray(data) ? data.length : 0);
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
      <div
        className="w-12 h-12 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const owners = useQuery({
    queryKey: ["owners-count"],
    queryFn: () => fetchCount("/owners/"),
  });

  const pets = useQuery({
    queryKey: ["pets-count"],
    queryFn: () => fetchCount("/pets/"),
  });

  const appointments = useQuery({
    queryKey: ["appointments-count"],
    queryFn: () => fetchCount("/appointments/"),
  });

  const products = useQuery({
    queryKey: ["products-count"],
    queryFn: () => fetchCount("/inventory/products/"),
  });

  const loading =
    owners.isLoading ||
    pets.isLoading ||
    appointments.isLoading ||
    products.isLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Visão geral do seu negócio pet
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tutores"
          value={loading ? "..." : owners.data ?? 0}
          icon={Users}
          color="#3b82f6"
        />
        <StatCard
          title="Pets"
          value={loading ? "..." : pets.data ?? 0}
          icon={PawPrint}
          color="#10b981"
        />
        <StatCard
          title="Agendamentos"
          value={loading ? "..." : appointments.data ?? 0}
          icon={CalendarDays}
          color="#f59e0b"
        />
        <StatCard
          title="Produtos"
          value={loading ? "..." : products.data ?? 0}
          icon={Package}
          color="#8b5cf6"
        />
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Bem-vindo ao PetFlow AI
        </h2>
        <p className="text-sm text-gray-600">
          Use o menu lateral para gerenciar tutores, pets, agendamentos e
          estoque. Em breve você verá também insights de IA sobre clientes em
          risco de abandono.
        </p>
      </div>
    </div>
  );
}
