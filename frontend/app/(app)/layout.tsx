"use client";

import { useEffect, useState } from "react";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, hasHydrated } = useAuthGuard();

  useEffect(() => { setMounted(true); }, []);

  if (!mounted || !hasHydrated) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><p className="text-slate-500">Carregando...</p></div>;
  }

  if (!isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><p className="text-slate-500">Redirecionando...</p></div>;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        {/* O max-w-7xl centraliza o conteúdo em telas muito grandes */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}