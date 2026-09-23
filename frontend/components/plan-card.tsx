"use client";

import { Check, X, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Plan } from "@/types/api";

interface PlanCardProps {
  plan: Plan;
  isCurrent: boolean;
  isPopular?: boolean;
  onSelect?: (planSlug: string) => void;
  selectLabel?: string;
  disabled?: boolean;
}

function formatLimit(value: number, suffix = "") {
  if (value === 0) return "Ilimitado";
  return `${value}${suffix}`;
}

const colorByPlan: Record<string, { bg: string; text: string; ring: string }> = {
  FREE: { bg: "bg-gray-100", text: "text-gray-700", ring: "ring-gray-200" },
  BRONZE: { bg: "bg-orange-100", text: "text-orange-700", ring: "ring-orange-200" },
  SILVER: { bg: "bg-slate-100", text: "text-slate-700", ring: "ring-slate-300" },
  GOLD: { bg: "bg-yellow-100", text: "text-yellow-700", ring: "ring-yellow-300" },
};

export function PlanCard({
  plan,
  isCurrent,
  isPopular,
  onSelect,
  selectLabel,
  disabled,
}: PlanCardProps) {
  const colors = colorByPlan[plan.plan_type] ?? colorByPlan.FREE;

  const features: { label: string; enabled: boolean }[] = [
    { label: "IA de Churn", enabled: plan.has_ai_churn },
    { label: "Previsão de Estoque (IA)", enabled: plan.has_ai_forecast },
    { label: "Relatórios avançados", enabled: plan.has_reports },
    { label: "Acesso à API", enabled: plan.has_api_access },
    { label: "Notificações WhatsApp", enabled: plan.has_whatsapp },
    { label: "Domínio personalizado", enabled: plan.has_custom_domain },
  ];

  return (
    <div
      className={cn(
        "relative bg-white rounded-2xl border-2 p-6 flex flex-col transition hover:shadow-lg",
        isCurrent
          ? "border-green-500 shadow-md"
          : isPopular
            ? "border-green-500 shadow-md"
            : "border-gray-200"
      )}
    >
      {isPopular && !isCurrent && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Mais popular
        </div>
      )}

      {isCurrent && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
          Seu plano atual
        </div>
      )}

      <div className="mb-4">
        <div
          className={cn(
            "inline-block px-3 py-1 rounded-lg text-xs font-semibold mb-3",
            colors.bg,
            colors.text
          )}
        >
          {plan.name}
        </div>
        <p className="text-sm text-gray-500 min-h-[40px]">{plan.description}</p>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-gray-900">
            {plan.is_free ? "Grátis" : `R$ ${Number(plan.price_monthly).toFixed(0)}`}
          </span>
          {!plan.is_free && (
            <span className="text-sm text-gray-500">/mês</span>
          )}
        </div>
        {!plan.is_free && plan.price_yearly && (
          <p className="text-xs text-gray-500 mt-1">
            ou R$ {Number(plan.price_yearly).toFixed(0)}/ano (2 meses grátis)
          </p>
        )}
      </div>

      <div className="space-y-2 mb-6 border-t pt-4 border-gray-100">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
          <span>{formatLimit(plan.max_users)} usuários</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
          <span>{formatLimit(plan.max_pets)} pets</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
          <span>{formatLimit(plan.max_appointments_month)} agendamentos/mês</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
          <span>{formatLimit(plan.max_products)} produtos</span>
        </div>
      </div>

      <div className="space-y-2 mb-6 border-t pt-4 border-gray-100">
        {features.map((feature) => (
          <div
            key={feature.label}
            className={cn(
              "flex items-center gap-2 text-sm",
              feature.enabled ? "text-gray-700" : "text-gray-300"
            )}
          >
            {feature.enabled ? (
              <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
            ) : (
              <X className="w-4 h-4 text-gray-300 flex-shrink-0" />
            )}
            <span>{feature.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-auto">
        {isCurrent ? (
          <button
            disabled
            className="w-full py-2.5 rounded-lg bg-gray-100 text-gray-500 font-medium text-sm cursor-not-allowed"
          >
            Plano atual
          </button>
        ) : (
          <button
            onClick={() => onSelect?.(plan.slug)}
            disabled={disabled}
            className={cn(
              "w-full py-2.5 rounded-lg font-medium text-sm transition",
              isPopular
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-gray-900 hover:bg-gray-800 text-white",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {selectLabel ?? "Escolher plano"}
          </button>
        )}
      </div>
    </div>
  );
}
