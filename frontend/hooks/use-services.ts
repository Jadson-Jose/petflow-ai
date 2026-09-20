"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import api from "@/lib/api";
import type { Paginated, Service } from "@/types/api";

const KEY = ["services"];

export function useServices() {
  return useQuery({
    queryKey: KEY,
    queryFn: async () => {
      const { data } = await api.get<Paginated<Service>>("/services/");
      return data;
    },
  });
}

export interface ServiceInput {
  name: string;
  description?: string;
  duration_minutes: number;
  price: string;
  is_active?: boolean;
}

export function useCreateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ServiceInput) => {
      const { data } = await api.post<Service>("/services/", payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Serviço criado!");
      qc.invalidateQueries({ queryKey: KEY });
    },
    onError: () => toast.error("Erro ao criar serviço"),
  });
}

export function useUpdateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: ServiceInput & { id: string }) => {
      const { data } = await api.patch<Service>(`/services/${id}/`, payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Serviço atualizado!");
      qc.invalidateQueries({ queryKey: KEY });
    },
    onError: () => toast.error("Erro ao atualizar serviço"),
  });
}

export function useDeleteService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/services/${id}/`);
    },
    onSuccess: () => {
      toast.success("Serviço removido!");
      qc.invalidateQueries({ queryKey: KEY });
    },
    onError: () => toast.error("Erro ao remover serviço"),
  });
}
