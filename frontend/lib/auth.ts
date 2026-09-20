import api from "@/lib/api";
import { useAuthStore } from "@/stores/auth";

export async function login(email: string, password: string, tenantSlug: string) {
  const { data } = await api.post("/token/", { email, password });

  const { setTokens, setTenantSlug } = useAuthStore.getState();
  setTokens(data.access, data.refresh);
  setTenantSlug(tenantSlug);

  // Busca dados do usuário autenticado
  const meResponse = await api.get("/auth/me/");
  useAuthStore.getState().setUser(meResponse.data);

  return meResponse.data;
}

export function logout() {
  useAuthStore.getState().logout();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}
