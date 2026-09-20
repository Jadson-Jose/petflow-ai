"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  PawPrint,
  CalendarDays,
  Package,
  Bell,
  Brain,
} from "lucide-react";

import { cn } from "@/lib/utils";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/owners", label: "Tutores", icon: Users },
  { href: "/pets", label: "Pets", icon: PawPrint },
  { href: "/appointments", label: "Agendamentos", icon: CalendarDays },
  { href: "/inventory", label: "Estoque", icon: Package },
  { href: "/notifications", label: "Notificações", icon: Bell },
  { href: "/ai", label: "IA", icon: Brain },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-green-500 flex items-center justify-center">
            <PawPrint className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-lg leading-tight">PetFlow AI</p>
            <p className="text-xs text-gray-400">Marketplace pet</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition",
                isActive
                  ? "bg-green-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800 text-xs text-gray-500">
        v0.1.0 — PetFlow AI
      </div>
    </aside>
  );
}
