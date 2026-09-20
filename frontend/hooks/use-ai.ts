"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import api from "@/lib/api";
import type { Paginated } from "@/types/api";

export interface ChurnPrediction {
  id: string;
  owner: string;
  owner_name: string;
  model: string | null;
  model_name: string;
  probability: number;
  features_used: Record<string, unknown>;
  tenant: string;
  predicted_at: string;
}

export interface MLModel {
  id: string;
  name: string;
  model_type: string;
  file_path: string;
  accuracy: number | null;
  status: "active" | "archived";
  tenant: string;
  created_at: string;
}

export function usePredictions() {
  return useQuery({
    queryKey: ["predictions"],
    queryFn: async () => {
      const { data } = await api.get<Paginated<ChurnPrediction>>(
        "/ai/predictions/"
      );
      return data;
    },
  });
}

export function useMLModels() {
  return useQuery({
    queryKey: ["ml-models"],
    queryFn: async () => {
      const { data } = await api.get<Paginated<MLModel>>("/ai/models/");
      return data;
    },
  });
}

export function usePredictChurn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ownerId: string) => {
      const { data } = await api.post("/ai/predictions/predict/", {
        owner_id: ownerId,
      });
      return data;
    },
    onSuccess: () => {
      toast.success("Predição iniciada!", {
        description: "Os resultados aparecerão em alguns segundos.",
      });
      // Recarrega as predições após 3 segundos (tempo para o Celery processar)
      setTimeout(() => {
        qc.invalidateQueries({ queryKey: ["predictions"] });
      }, 3000);
    },
    onError: () => toast.error("Erro ao iniciar predição"),
  });
}
