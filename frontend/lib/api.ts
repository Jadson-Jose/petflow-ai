import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

import { useAuthStore } from "@/stores/auth";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

// ----- Request: injeta JWT + X-Tenant -----
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const { accessToken, tenantSlug } = useAuthStore.getState();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  // Não envia X-Tenant nas rotas de token
  if (tenantSlug && !config.url?.includes("/token")) {
    config.headers["X-Tenant"] = tenantSlug;
  }

  return config;
});

// ----- Response: renova token automaticamente -----
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (!original) return Promise.reject(error);

    const status = error.response?.status;
    const shouldRetry =
      (status === 401 || status === 403) && !original._retry;

    if (shouldRetry) {
      original._retry = true;
      const { refreshToken, setTokens, logout } = useAuthStore.getState();

      if (refreshToken) {
        try {
          const { data } = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/token/refresh/`,
            { refresh: refreshToken }
          );
          setTokens(data.access, data.refresh ?? refreshToken);
          original.headers.Authorization = `Bearer ${data.access}`;
          return api(original);
        } catch {
          logout();
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        }
      } else {
        logout();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
