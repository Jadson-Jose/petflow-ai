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
  _hasHydrated: boolean;
  setTokens: (access: string, refresh: string) => void;
  setTenantSlug: (slug: string) => void;
  setUser: (user: AuthUser | null) => void;
  setHasHydrated: (value: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      tenantSlug: null,
      user: null,
      _hasHydrated: false,
      setTokens: (access, refresh) =>
        set({ accessToken: access, refreshToken: refresh }),
      setTenantSlug: (slug) => set({ tenantSlug: slug }),
      setUser: (user) => set({ user }),
      setHasHydrated: (value) => set({ _hasHydrated: value }),
      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
        }),
    }),
    {
      name: "petflow-auth",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
