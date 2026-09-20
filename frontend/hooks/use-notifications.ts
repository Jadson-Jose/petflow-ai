"use client";

import { useQuery } from "@tanstack/react-query";

import api from "@/lib/api";
import type { Notification, Paginated } from "@/types/api";

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data } = await api.get<Paginated<Notification>>(
        "/notifications/"
      );
      return data;
    },
  });
}
