"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import api from "@/lib/api";
import type { Appointment, Paginated } from "@/types/api";

const KEY = ["appointments"];

export function useAppointments() {
  return useQuery({
    queryKey: KEY,
    queryFn: async () => {
      const { data } = await api.get<Paginated<Appointment>>("/appointments/");
      return data;
    },
  });
}

export interface AppointmentInput {
  pet: string;
  owner: string;
  service: string;
  start_time: string;
  status: "AGENDADO" | "EM_ANDAMENTO" | "CONCLUIDO" | "CANCELADO";
  notes?: string;
}

export function useCreateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: AppointmentInput) => {
      const { data } = await api.post<Appointment>("/appointments/", payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Agendamento criado!");
      qc.invalidateQueries({ queryKey: KEY });
    },
    onError: (error: any) => {
      const detail =
        error?.response?.data?.non_field_errors?.[0] ??
        error?.response?.data?.detail ??
        "Erro ao criar agendamento";
      toast.error(detail);
    },
  });
}

export function useUpdateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: AppointmentInput & { id: string }) => {
      const { data } = await api.patch<Appointment>(
        `/appointments/${id}/`,
        payload
      );
      return data;
    },
    onSuccess: () => {
      toast.success("Agendamento atualizado!");
      qc.invalidateQueries({ queryKey: KEY });
    },
    onError: (error: any) => {
      const detail =
        error?.response?.data?.non_field_errors?.[0] ??
        error?.response?.data?.detail ??
        "Erro ao atualizar agendamento";
      toast.error(detail);
    },
  });
}

export function useDeleteAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/appointments/${id}/`);
    },
    onSuccess: () => {
      toast.success("Agendamento removido!");
      qc.invalidateQueries({ queryKey: KEY });
    },
    onError: () => toast.error("Erro ao remover agendamento"),
  });
}
