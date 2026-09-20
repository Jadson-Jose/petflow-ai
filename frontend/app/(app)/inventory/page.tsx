"use client";

import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Package,
  AlertTriangle,
  Tags,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Modal } from "@/components/modal";
import {
  useBrands,
  useCategories,
  useCreateBrand,
  useCreateCategory,
  useCreateProduct,
  useDeleteProduct,
  useProducts,
  useUpdateProduct,
  type ProductInput,
} from "@/hooks/use-inventory";
import type { Product } from "@/types/api";

const schema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  sku: z.string().optional().default(""),
  category: z.string().optional().nullable().default(""),
  brand: z.string().optional().nullable().default(""),
  quantity: z.coerce.number().int().min(0).default(0),
  minimum_stock: z.coerce.number().int().min(0).default(0),
  cost_price: z.string().default("0.00"),
  sale_price: z.string().default("0.00"),
  expiration_date: z.string().optional().nullable().default(""),
  description: z.string().optional().default(""),
  is_active: z.boolean().optional().default(true),
});

type FormData = z.infer<typeof schema>;

export default function InventoryPage() {
  const [search, setSearch] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
  const [isBrandModalOpen, setBrandModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const { data, isLoading } = useProducts();
  const { data: categoriesData } = useCategories();
  const { data: brandsData } = useBrands();

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();
  const createCategoryMutation = useCreateCategory();
  const createBrandMutation = useCreateBrand();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      quantity: 0,
      minimum_stock: 0,
      cost_price: "0.00",
      sale_price: "0.00",
      is_active: true,
    },
  });

  const categoryForm = useForm<{ name: string; description: string }>({
    defaultValues: { name: "", description: "" },
  });

  const brandForm = useForm<{ name: string; website: string }>({
    defaultValues: { name: "", website: "" },
  });

  const openCreate = () => {
    setEditing(null);
    reset({
      name: "",
      sku: "",
      category: "",
      brand: "",
      quantity: 0,
      minimum_stock: 0,
      cost_price: "0.00",
      sale_price: "0.00",
      expiration_date: "",
      description: "",
      is_active: true,
    });
    setModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    reset({
      name: product.name,
      sku: product.sku,
      category: product.category ?? "",
      brand: product.brand ?? "",
      quantity: product.quantity,
      minimum_stock: product.minimum_stock,
      cost_price: product.cost_price,
      sale_price: product.sale_price,
      expiration_date: product.expiration_date ?? "",
      description: product.description,
      is_active: product.is_active,
    });
    setModalOpen(true);
  };

  const onSubmit = (values: FormData) => {
    const payload: ProductInput = {
      ...values,
      category: values.category || null,
      brand: values.brand || null,
      expiration_date: values.expiration_date || null,
    };

    if (editing) {
      updateMutation.mutate(
        { ...payload, id: editing.id },
        { onSuccess: () => setModalOpen(false) }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => setModalOpen(false),
      });
    }
  };

  const filtered = (data?.results ?? []).filter((product) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      product.name.toLowerCase().includes(term) ||
      product.sku.toLowerCase().includes(term) ||
      product.category_name.toLowerCase().includes(term) ||
      product.brand_name.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Estoque</h1>
          <p className="text-sm text-gray-500">
            {data?.count ?? 0} produto(s) cadastrado(s)
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setCategoryModalOpen(true)}
            className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-medium px-3 py-2 rounded-lg transition text-sm"
          >
            <Tags className="w-4 h-4" />
            Categoria
          </button>
          <button
            onClick={() => setBrandModalOpen(true)}
            className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-medium px-3 py-2 rounded-lg transition text-sm"
          >
            <Building2 className="w-4 h-4" />
            Marca
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition"
          >
            <Plus className="w-4 h-4" />
            Novo Produto
          </button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, SKU, categoria ou marca..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {data?.results?.length === 0
              ? "Nenhum produto cadastrado ainda."
              : "Nenhum resultado para esta busca."}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-600 uppercase px-5 py-3">
                  Produto
                </th>
                <th className="text-left text-xs font-semibold text-gray-600 uppercase px-5 py-3">
                  SKU
                </th>
                <th className="text-left text-xs font-semibold text-gray-600 uppercase px-5 py-3">
                  Categoria
                </th>
                <th className="text-left text-xs font-semibold text-gray-600 uppercase px-5 py-3">
                  Qtd
                </th>
                <th className="text-left text-xs font-semibold text-gray-600 uppercase px-5 py-3">
                  Preço
                </th>
                <th className="text-right text-xs font-semibold text-gray-600 uppercase px-5 py-3">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => {
                const lowStock = product.quantity < product.minimum_stock;
                return (
                  <tr
                    key={product.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center">
                          <Package className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {product.name}
                          </p>
                          {product.brand_name && (
                            <p className="text-xs text-gray-500">
                              {product.brand_name}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600">
                      {product.sku || "—"}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600">
                      {product.category_name || "—"}
                    </td>
                    <td className="px-5 py-3 text-sm">
                      <span
                        className={
                          lowStock
                            ? "text-red-600 font-medium"
                            : "text-gray-900"
                        }
                      >
                        {product.quantity}
                      </span>
                      {lowStock && (
                        <span className="ml-2 inline-flex items-center gap-1 text-xs text-red-600">
                          <AlertTriangle className="w-3 h-3" />
                          Baixo
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600">
                      R$ {product.sale_price}
                    </td>
                    <td className="px-5 py-3 text-right space-x-1">
                      <button
                        onClick={() => openEdit(product)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (
                            confirm(`Remover o produto "${product.name}"?`)
                          ) {
                            deleteMutation.mutate(product.id);
                          }
                        }}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Produto */}
      <Modal
        open={isModalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Editar Produto" : "Novo Produto"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome *
            </label>
            <input
              type="text"
              {...register("name")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SKU
            </label>
            <input
              type="text"
              {...register("sku")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    value={field.value ?? ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
                  >
                    <option value="">Sem categoria</option>
                    {(categoriesData?.results ?? []).map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                )}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marca
              </label>
              <Controller
                name="brand"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    value={field.value ?? ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
                  >
                    <option value="">Sem marca</option>
                    {(brandsData?.results ?? []).map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantidade
              </label>
              <input
                type="number"
                {...register("quantity")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estoque mínimo
              </label>
              <input
                type="number"
                {...register("minimum_stock")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preço de custo
              </label>
              <input
                type="text"
                {...register("cost_price")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preço de venda
              </label>
              <input
                type="text"
                {...register("sale_price")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de validade
            </label>
            <input
              type="date"
              {...register("expiration_date")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              rows={3}
              {...register("description")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition"
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Salvando..."
                : "Salvar"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Categoria */}
      <Modal
        open={isCategoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        title="Nova Categoria"
      >
        <form
          onSubmit={categoryForm.handleSubmit((values) => {
            createCategoryMutation.mutate(values, {
              onSuccess: () => {
                setCategoryModalOpen(false);
                categoryForm.reset();
              },
            });
          })}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome *
            </label>
            <input
              type="text"
              {...categoryForm.register("name", { required: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              rows={3}
              {...categoryForm.register("description")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setCategoryModalOpen(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createCategoryMutation.isPending}
              className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition"
            >
              {createCategoryMutation.isPending ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Marca */}
      <Modal
        open={isBrandModalOpen}
        onClose={() => setBrandModalOpen(false)}
        title="Nova Marca"
      >
        <form
          onSubmit={brandForm.handleSubmit((values) => {
            createBrandMutation.mutate(values, {
              onSuccess: () => {
                setBrandModalOpen(false);
                brandForm.reset();
              },
            });
          })}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome *
            </label>
            <input
              type="text"
              {...brandForm.register("name", { required: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <input
              type="url"
              {...brandForm.register("website")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              placeholder="https://..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setBrandModalOpen(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createBrandMutation.isPending}
              className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition"
            >
              {createBrandMutation.isPending ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
