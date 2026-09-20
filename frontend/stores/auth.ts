import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  id: string;
  email: string;
  tenant: string;
  role: string;
  status: string;
  is_active: boolean;
  created_at: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  tenantSlug: string | null;
  user: AuthUser | null;
  setTokens: (access: string, refresh: string) => void;
  setTenantSlug: (slug: string) => void;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      tenantSlug: null,
      user: null,
      setTokens: (access, refresh) =>
        set({ accessToken: access, refreshToken: refresh }),
      setTenantSlug: (slug) => set({ tenantSlug: slug }),
      setUser: (user) => set({ user }),
      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
        }),
    }),
    {
      name: "petflow-auth",
    }
  )
);
