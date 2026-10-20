"use client";

import { useQuery } from "@tanstack/react-query";
import { Users, PawPrint, CalendarDays, Package } from "lucide-react";
import { motion, Variants } from "framer-motion"; // <-- Importamos Variants aqui
import api from "@/lib/api";

// <-- Adicionamos a tipagem : Variants aqui
const container: Variants = { 
  hidden: { opacity: 0 }, 
  show: { opacity: 1, transition: { staggerChildren: 0.1 } } 
};

const item: Variants = { 
  hidden: { opacity: 0, y: 20 }, 
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } 
};

async function fetchCount(url: string): Promise<number> {
  const { data } = await api.get(url);
  return data.count ?? (Array.isArray(data) ? data.length : 0);
}

function StatCard({ title, value, icon: Icon, color, bg }: any) {
  return (
    <motion.div variants={item} whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 transition-all flex items-center gap-5">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${bg}`}>
        <Icon className={`w-7 h-7 ${color}`} />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-3xl font-bold text-slate-900">{value}</p>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const owners = useQuery({ queryKey: ["owners-count"], queryFn: () => fetchCount("/owners/") });
  const pets = useQuery({ queryKey: ["pets-count"], queryFn: () => fetchCount("/pets/") });
  const appointments = useQuery({ queryKey: ["appointments-count"], queryFn: () => fetchCount("/appointments/") });
  const products = useQuery({ queryKey: ["products-count"], queryFn: () => fetchCount("/inventory/products/") });

  const loading = owners.isLoading || pets.isLoading || appointments.isLoading || products.isLoading;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Visão geral do seu negócio pet</p>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Tutores" value={loading ? "..." : owners.data ?? 0} icon={Users} color="text-blue-600" bg="bg-blue-50" />
        <StatCard title="Pets" value={loading ? "..." : pets.data ?? 0} icon={PawPrint} color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard title="Agendamentos" value={loading ? "..." : appointments.data ?? 0} icon={CalendarDays} color="text-amber-600" bg="bg-amber-50" />
        <StatCard title="Produtos" value={loading ? "..." : products.data ?? 0} icon={Package} color="text-purple-600" bg="bg-purple-50" />
      </motion.div>

      <motion.div variants={item} className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200/60">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Bem-vindo ao PetFlow AI</h2>
        <p className="text-slate-600 leading-relaxed">
          Use o menu lateral para gerenciar tutores, pets, agendamentos e estoque. Em breve você verá também insights de IA sobre clientes em risco de abandono.
        </p>
      </motion.div>
    </motion.div>
  );
}