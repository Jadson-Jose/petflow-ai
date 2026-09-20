"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/stores/auth";

export default function Home() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    router.replace(accessToken ? "/dashboard" : "/login");
  }, [accessToken, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Carregando...</p>
    </div>
  );
}
