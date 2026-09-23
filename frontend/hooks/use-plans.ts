"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import api from "@/lib/api";
import type { Paginated, Plan, Subscription } from "@/types/api";

const PLANS_KEY = ["plans"];
const SUB_KEY = ["subscription", "me"];

export function usePlans() {
  return useQuery({
    queryKey: PLANS_KEY,
    queryFn: async () => {
      const { data } = await api.get<Paginated<Plan>>("/plans/");
      return data;
    },
  });
}

export function useMySubscription() {
  return useQuery({
    queryKey: SUB_KEY,
    queryFn: async () => {
      const { data } = await api.get<Subscription>("/subscriptions/me/");
      return data;
    },
  });
}

export function useStartTrial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (planSlug: string) => {
      const { data } = await api.post<Subscription>(
        "/subscriptions/start-trial/",
        { plan_slug: planSlug }
      );
      return data;
    },
    onSuccess: () => {
      toast.success("Trial iniciado!", {
        description: "Aproveite todos os recursos do plano.",
      });
      qc.invalidateQueries({ queryKey: SUB_KEY });
    },
    onError: (error: any) => {
      const detail =
        error?.response?.data?.detail ?? "Erro ao iniciar trial.";
      toast.error(detail);
    },
  });
}

export function useUpgradePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (planSlug: string) => {
      const { data } = await api.post<Subscription>(
        "/subscriptions/upgrade/",
        { plan_slug: planSlug }
      );
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Plano atualizado para ${data.plan.name}!`);
      qc.invalidateQueries({ queryKey: SUB_KEY });
    },
    onError: () => toast.error("Erro ao trocar de plano"),
  });
}

export function useCancelSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<Subscription>(
        "/subscriptions/cancel/"
      );
      return data;
    },
    onSuccess: () => {
      toast.success("Assinatura cancelada. Voltou ao plano Free.");
      qc.invalidateQueries({ queryKey: SUB_KEY });
    },
    onError: () => toast.error("Erro ao cancelar assinatura"),
  });
}
