"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuthStore } from "@/stores/auth";

export function useAuthGuard() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  useEffect(() => {
    // Só redireciona depois que o Zustand terminou de hidratar
    if (hasHydrated && !accessToken) {
      router.replace("/login");
    }
  }, [accessToken, hasHydrated, router]);

  return {
    isAuthenticated: !!accessToken,
    hasHydrated,
  };
}
