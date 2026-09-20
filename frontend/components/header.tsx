"use client";

import { LogOut, User } from "lucide-react";

import { logout } from "@/lib/auth";
import { useAuthStore } from "@/stores/auth";

export function Header() {
  const user = useAuthStore((s) => s.user);
  const tenantSlug = useAuthStore((s) => s.tenantSlug);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex flex-col">
        <p className="text-sm text-gray-500">Empresa</p>
        <p className="font-semibold text-gray-900">{tenantSlug ?? "—"}</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-right">
          <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
            <User className="w-4 h-4 text-green-600" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900">
              {user?.email ?? "—"}
            </p>
            <p className="text-xs text-gray-500 uppercase">{user?.role ?? "—"}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition"
          title="Sair"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>
    </header>
  );
}
