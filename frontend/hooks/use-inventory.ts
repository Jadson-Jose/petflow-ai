"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import api from "@/lib/api";
import type { Brand, Category, Paginated, Product } from "@/types/api";

// ===== Categorias =====
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await api.get<Paginated<Category>>(
        "/inventory/categories/"
      );
      return data;
    },
  });
}

export interface CategoryInput {
  name: string;
  description?: string;
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CategoryInput) => {
      const { data } = await api.post<Category>(
        "/inventory/categories/",
        payload
      );
      return data;
    },
    onSuccess: () => {
      toast.success("Categoria criada!");
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: () => toast.error("Erro ao criar categoria"),
  });
}

// ===== Marcas =====
export function useBrands() {
  return useQuery({
    queryKey: ["brands"],
    queryFn: async () => {
      const { data } = await api.get<Paginated<Brand>>("/inventory/brands/");
      return data;
    },
  });
}

export interface BrandInput {
  name: string;
  website?: string;
}

export function useCreateBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: BrandInput) => {
      const { data } = await api.post<Brand>("/inventory/brands/", payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Marca criada!");
      qc.invalidateQueries({ queryKey: ["brands"] });
    },
    onError: () => toast.error("Erro ao criar marca"),
  });
}

// ===== Produtos =====
export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await api.get<Paginated<Product>>(
        "/inventory/products/"
      );
      return data;
    },
  });
}

export interface ProductInput {
  name: string;
  sku?: string;
  category?: string | null;
  brand?: string | null;
  quantity: number;
  minimum_stock: number;
  cost_price: string;
  sale_price: string;
  expiration_date?: string | null;
  description?: string;
  is_active?: boolean;
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ProductInput) => {
      const { data } = await api.post<Product>(
        "/inventory/products/",
        payload
      );
      return data;
    },
    onSuccess: () => {
      toast.success("Produto criado!");
      qc.invalidateQueries({ queryKey: ["products"] });
    },
    onError: () => toast.error("Erro ao criar produto"),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: ProductInput & { id: string }) => {
      const { data } = await api.patch<Product>(
        `/inventory/products/${id}/`,
        payload
      );
      return data;
    },
    onSuccess: () => {
      toast.success("Produto atualizado!");
      qc.invalidateQueries({ queryKey: ["products"] });
    },
    onError: () => toast.error("Erro ao atualizar produto"),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/inventory/products/${id}/`);
    },
    onSuccess: () => {
      toast.success("Produto removido!");
      qc.invalidateQueries({ queryKey: ["products"] });
    },
    onError: () => toast.error("Erro ao remover produto"),
  });
}
