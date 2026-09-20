"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import api from "@/lib/api";
import type { Owner, Paginated } from "@/types/api";

const KEY = ["owners"];

export function useOwners() {
  return useQuery({
    queryKey: KEY,
    queryFn: async () => {
      const { data } = await api.get<Paginated<Owner>>("/owners/");
      return data;
    },
  });
}

export interface OwnerInput {
  full_name: string;
  email: string;
  phone?: string;
  cpf?: string;
  status?: "active" | "inactive" | "blocked";
  address?: string;
  city?: string;
  notes?: string;
}

export function useCreateOwner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: OwnerInput) => {
      const { data } = await api.post<Owner>("/owners/", payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Tutor cadastrado!");
      qc.invalidateQueries({ queryKey: KEY });
    },
    onError: () => toast.error("Erro ao cadastrar tutor"),
  });
}

export function useUpdateOwner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: OwnerInput & { id: string }) => {
      const { data } = await api.patch<Owner>(`/owners/${id}/`, payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Tutor atualizado!");
      qc.invalidateQueries({ queryKey: KEY });
    },
    onError: () => toast.error("Erro ao atualizar tutor"),
  });
}

export function useDeleteOwner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/owners/${id}/`);
    },
    onSuccess: () => {
      toast.success("Tutor removido!");
      qc.invalidateQueries({ queryKey: KEY });
    },
    onError: () => toast.error("Erro ao remover tutor"),
  });
}
