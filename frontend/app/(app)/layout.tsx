"use client";

import { useEffect, useState } from "react";

import { useAuthGuard } from "@/hooks/use-auth-guard";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, hasHydrated } = useAuthGuard();

  useEffect(() => {
    setMounted(true);
  }, []);

  // No servidor E na primeira renderização do cliente, mostra o MESMO loading.
  // Só depois que o cliente montou, o conteúdo real é renderizado.
  if (!mounted || !hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Redirecionando...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
