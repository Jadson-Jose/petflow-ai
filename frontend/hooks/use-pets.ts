"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import api from "@/lib/api";
import type { Paginated, Pet } from "@/types/api";

const KEY = ["pets"];

export function usePets() {
  return useQuery({
    queryKey: KEY,
    queryFn: async () => {
      const { data } = await api.get<Paginated<Pet>>("/pets/");
      return data;
    },
  });
}

export interface PetInput {
  name: string;
  species: "DOG" | "CAT" | "BIRD" | "OTHER";
  gender: "MALE" | "FEMALE";
  owner: string;
  breed?: string;
  birth_date?: string | null;
  weight?: string | null;
  color?: string;
  microchip?: string;
  neutered?: boolean | null;
  notes?: string;
  is_active?: boolean;
}

export function useCreatePet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: PetInput) => {
      const { data } = await api.post<Pet>("/pets/", payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Pet cadastrado!");
      qc.invalidateQueries({ queryKey: KEY });
    },
    onError: () => toast.error("Erro ao cadastrar pet"),
  });
}

export function useUpdatePet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: PetInput & { id: string }) => {
      const { data } = await api.patch<Pet>(`/pets/${id}/`, payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Pet atualizado!");
      qc.invalidateQueries({ queryKey: KEY });
    },
    onError: () => toast.error("Erro ao atualizar pet"),
  });
}

export function useDeletePet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/pets/${id}/`);
    },
    onSuccess: () => {
      toast.success("Pet removido!");
      qc.invalidateQueries({ queryKey: KEY });
    },
    onError: () => toast.error("Erro ao remover pet"),
  });
}
