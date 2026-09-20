"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { PawPrint, Loader2 } from "lucide-react";

import { login } from "@/lib/auth";

const loginSchema = z.object({
  tenantSlug: z.string().min(1, "Informe o slug da empresa"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Informe a senha"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      tenantSlug: "alpha",
      email: "admin@petflow.local",
      password: "admin123",
    },
  });

  const onSubmit = async (values: LoginForm) => {
    setLoading(true);
    try {
      await login(values.email, values.password, values.tenantSlug);
      toast.success("Bem-vindo ao PetFlow AI!");
      router.push("/dashboard");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Falha ao fazer login";
      toast.error("Credenciais inválidas", { description: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-green-500 flex items-center justify-center mb-4">
            <PawPrint className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">PetFlow AI</h1>
          <p className="text-sm text-gray-500 mt-1">
            Inteligência para o seu negócio pet
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Empresa (slug)
            </label>
            <input
              type="text"
              {...register("tenantSlug")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              placeholder="alpha"
            />
            {errors.tenantSlug && (
              <p className="text-xs text-red-500 mt-1">
                {errors.tenantSlug.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-mail
            </label>
            <input
              type="email"
              {...register("email")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              placeholder="seu@email.com"
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input
              type="password"
              {...register("password")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              placeholder="••••••"
            />
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2.5 rounded-lg transition"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </button>
        </form>

        <p className="text-xs text-center text-gray-400 mt-6">
          Demonstração: alpha / admin@petflow.local / admin123
        </p>
      </div>
    </div>
  );
}
